import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { internalSendEmail } from "@/lib/email/internal-send.server";

const PLAN_BRL = 59.90;
const HARDCODED_ADMINS = ["brasgold1@gmail.com"];

async function assertAdmin(context: any) {
  const userEmail = ((context.claims as any)?.email as string | undefined)?.toLowerCase();
  const userId = (context.claims as any)?.sub as string | undefined;
  if (userEmail && HARDCODED_ADMINS.includes(userEmail)) return;
  if (userId) {
    const { data } = await supabaseAdmin.from("admin_users").select("user_id").eq("user_id", userId).maybeSingle();
    if (data) return;
  }
  throw new Response("Forbidden", { status: 403 });
}

async function listAllUsers() {
  const all: any[] = [];
  let page = 1;
  const perPage = 1000;
  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(error.message);
    all.push(...data.users);
    if (data.users.length < perPage) break;
    page++;
    if (page > 20) break;
  }
  return all;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

export const getAdminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const allUsers = await listAllUsers();

    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("status, environment, current_period_end, user_id, plan_tier");
    const liveSubs = (subs ?? []).filter((s: any) => s.environment === "live");
    const tierByUser = new Map<string, string>();
    for (const s of liveSubs) {
      if (s.status === "active" || s.status === "trialing") tierByUser.set(s.user_id, s.plan_tier || "pro");
    }
    const payingUserIds = new Set(tierByUser.keys());

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, locale, suspended_at, created_at");
    const profileMap = new Map<string, any>((profiles ?? []).map((p: any) => [p.id, p]));

    const now = Date.now();
    const D3 = now - 3 * 86400_000;
    const D7 = now - 7 * 86400_000;
    const D30 = now - 30 * 86400_000;

    let active7 = 0, inactive3 = 0, inactive7 = 0, churnRisk = 0;
    let free = 0, pro = 0, premium = 0;
    const newPerDay: Record<string, number> = {};

    const users = allUsers.map((u) => {
      const p = profileMap.get(u.id);
      const tier = tierByUser.get(u.id) || "free";
      if (tier === "free") free++;
      else if (tier === "premium") premium++;
      else pro++;

      const last = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
      if (last >= D7) active7++;
      else if (last >= D3) inactive3++;
      else inactive7++;
      if (payingUserIds.has(u.id) && last && last < D30) churnRisk++;

      if (u.created_at) {
        const day = u.created_at.slice(0, 10);
        newPerDay[day] = (newPerDay[day] || 0) + 1;
      }
      return {
        id: u.id,
        email: u.email ?? "—",
        phone: u.phone ?? "—",
        name: p?.display_name ?? (u.user_metadata as any)?.full_name ?? "—",
        locale: p?.locale ?? "pt",
        suspended_at: p?.suspended_at ?? null,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        is_paying: payingUserIds.has(u.id),
        plan_tier: tier,
      };
    });

    // last 30 days series
    const series: { date: string; signups: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400_000).toISOString().slice(0, 10);
      series.push({ date: d, signups: newPerDay[d] || 0 });
    }

    return {
      totalUsers: allUsers.length,
      payingUsers: payingUserIds.size,
      freeUsers: free,
      proUsers: pro,
      premiumUsers: premium,
      active7,
      inactive3,
      inactive7,
      churnRisk,
      estimatedMrrBrl: payingUserIds.size * PLAN_BRL,
      signupSeries: series,
      users,
      generatedAt: new Date().toISOString(),
    };
  });

export const listAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data } = await supabaseAdmin.from("admin_users").select("user_id, email, created_at").order("created_at", { ascending: true });
    return data ?? [];
  });

export const addAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string }) => {
    const email = d.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Email inválido");
    return { email };
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const allUsers = await listAllUsers();
    const target = allUsers.find((u) => (u.email ?? "").toLowerCase() === data.email);
    if (!target) throw new Error("Usuário não encontrado. Ele precisa criar conta antes.");
    const { error } = await supabaseAdmin.from("admin_users").upsert(
      { user_id: target.id, email: data.email },
      { onConflict: "user_id" }
    );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeAdminUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string }) => d)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const { error } = await supabaseAdmin.from("admin_users").delete().eq("user_id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const updateUserAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string; action: "suspend" | "unsuspend" | "delete" }) => d)
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    if (data.action === "delete") {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }
    const suspended_at = data.action === "suspend" ? new Date().toISOString() : null;
    const { error } = await supabaseAdmin.from("profiles").update({ suspended_at }).eq("id", data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const getRevenueMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, plan_tier, status, environment, current_period_start, created_at");
    const live = (subs ?? []).filter((s: any) => s.environment === "live" && (s.status === "active" || s.status === "trialing"));

    // MRR by month last 12 months
    const months: { month: string; mrr: number }[] = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
      const count = live.filter((s: any) => new Date(s.created_at) < monthEnd).length;
      months.push({ month: key, mrr: count * PLAN_BRL });
    }

    return {
      mrrBrl: live.length * PLAN_BRL,
      payingCount: live.length,
      series: months,
    };
  });

export const getActivityFeed = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const users = await listAllUsers();
    const events: { type: string; email: string; ts: string; meta?: any }[] = [];
    for (const u of users) {
      if (u.created_at) events.push({ type: "signup", email: u.email ?? "—", ts: u.created_at });
      if (u.last_sign_in_at) events.push({ type: "login", email: u.email ?? "—", ts: u.last_sign_in_at });
    }
    events.sort((a, b) => b.ts.localeCompare(a.ts));
    const recent = events.slice(0, 100);

    // never logged back
    const neverReturned = users
      .filter((u: any) => {
        if (!u.created_at || !u.last_sign_in_at) return !!u.created_at;
        return Math.abs(new Date(u.last_sign_in_at).getTime() - new Date(u.created_at).getTime()) < 60_000;
      })
      .map((u: any) => ({ email: u.email, created_at: u.created_at }))
      .slice(0, 50);

    return { recent, neverReturned };
  });

export const getEmailStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const since = daysAgo(30).toISOString();
    const { data } = await supabaseAdmin
      .from("email_send_log")
      .select("template_name, status, created_at, message_id, recipient_email")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(2000);
    // dedup by message_id keep latest (already ordered desc)
    const seen = new Set<string>();
    const dedup: any[] = [];
    for (const r of (data ?? []) as any[]) {
      const k = (r.message_id as string | null) || (r as any).id || `${r.recipient_email}-${r.created_at}`;
      if (seen.has(k)) continue;
      seen.add(k);
      dedup.push(r);
    }
    const byTemplate: Record<string, { sent: number; failed: number; total: number }> = {};
    for (const r of dedup) {
      const t = r.template_name || "unknown";
      byTemplate[t] ??= { sent: 0, failed: 0, total: 0 };
      byTemplate[t].total++;
      if (r.status === "sent") byTemplate[t].sent++;
      else if (r.status === "dlq" || r.status === "failed" || r.status === "bounced") byTemplate[t].failed++;
    }
    return { byTemplate, recent: dedup.slice(0, 50) };
  });

export const sendManualBlast = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { audience: "all" | "free" | "pro" | "premium" | "inactive7"; subject: string; body: string; confirm: boolean }) => {
    if (!d.confirm) throw new Error("Confirmação requerida");
    if (!d.subject || d.subject.length > 200) throw new Error("Assunto inválido");
    if (!d.body || d.body.length > 10_000) throw new Error("Corpo inválido");
    return d;
  })
  .handler(async ({ context, data }) => {
    await assertAdmin(context);
    const users = await listAllUsers();
    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("user_id, plan_tier, status, environment");
    const tierByUser = new Map<string, string>();
    for (const s of subs ?? []) {
      if (s.environment === "live" && (s.status === "active" || s.status === "trialing")) {
        tierByUser.set(s.user_id, s.plan_tier || "pro");
      }
    }
    const now = Date.now();
    const D7 = now - 7 * 86400_000;
    const targets = users.filter((u: any) => {
      if (!u.email) return false;
      const tier = tierByUser.get(u.id) || "free";
      if (data.audience === "all") return true;
      if (data.audience === "inactive7") return !u.last_sign_in_at || new Date(u.last_sign_in_at).getTime() < D7;
      return tier === data.audience;
    });
    const capped = targets.slice(0, 1000);
    let queued = 0;
    for (const u of capped) {
      try {
        await internalSendEmail({
          templateName: "product-update",
          recipientEmail: u.email!,
          templateData: { title: data.subject, bodyHtml: data.body, lang: "pt", recipientEmail: u.email },
          idempotencyKey: `blast-${Date.now()}-${u.id}`,
        });
        queued++;
        if (queued % 50 === 0) await new Promise((r) => setTimeout(r, 1000));
      } catch {}
    }
    return { ok: true, queued, total: targets.length };
  });
