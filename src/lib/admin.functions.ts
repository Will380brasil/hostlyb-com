import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

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

export const getAdminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);

    const allUsers = await listAllUsers();

    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("status, environment, current_period_end, user_id");
    const liveSubs = (subs ?? []).filter((s: any) => s.environment === "live");
    const payingUserIds = new Set(
      liveSubs.filter((s: any) => s.status === "active" || s.status === "trialing").map((s: any) => s.user_id)
    );

    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name");
    const profileMap = new Map<string, any>((profiles ?? []).map((p: any) => [p.id, p]));

    const users = allUsers.map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "—",
        phone: u.phone ?? "—",
        name: p?.display_name ?? (u.user_metadata as any)?.full_name ?? "—",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at,
        is_paying: payingUserIds.has(u.id),
      };
    });

    return {
      totalUsers: allUsers.length,
      payingUsers: payingUserIds.size,
      estimatedMrrBrl: payingUserIds.size * PLAN_BRL,
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
