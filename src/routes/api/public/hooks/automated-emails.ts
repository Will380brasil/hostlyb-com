/**
 * Cron-triggered hook that fires automated emails:
 *  - welcome: any auth user without a 'welcome' row in email_audience_log
 *  - inactivity-3d: profiles whose last sign-in falls in (now-73h, now-72h]
 *  - inactivity-7d: profiles whose last sign-in falls in (now-169h, now-168h]
 *
 * Auth: requires the project's anon key in the `apikey` header (pg_cron pattern).
 */
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { internalSendEmail } from "@/lib/email/internal-send.server";

function unauthorized() {
  return new Response("Unauthorized", { status: 401 });
}

async function recordSent(template: string, userId: string) {
  await supabaseAdmin.from("email_audience_log").insert({ template_name: template, user_id: userId });
}

async function alreadySent(template: string, userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("email_audience_log")
    .select("id")
    .eq("template_name", template)
    .eq("user_id", userId)
    .maybeSingle();
  return !!data;
}

async function sendWelcomeBatch(limit = 100) {
  let sent = 0;
  let page = 1;
  while (sent < limit) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (!data || data.users.length === 0) break;
    for (const u of data.users) {
      if (!u.email) continue;
      if (await alreadySent("welcome", u.id)) continue;
      const { data: prof } = await supabaseAdmin.from("profiles").select("display_name, locale").eq("id", u.id).maybeSingle();
      const r = await internalSendEmail({
        templateName: "welcome",
        recipientEmail: u.email,
        templateData: { name: prof?.display_name ?? (u.user_metadata as any)?.full_name ?? null, lang: prof?.locale ?? "pt" },
        idempotencyKey: `welcome-${u.id}`,
      });
      if (r.ok || r.reason === "suppressed") await recordSent("welcome", u.id);
      sent++;
      if (sent >= limit) break;
    }
    if (data.users.length < 200) break;
    page++;
    if (page > 10) break;
  }
  return sent;
}

async function buildInactivitySnapshot(userId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const in7d = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);
  const [{ count: properties }, { count: upcomingCheckouts }, { count: pendingCleanings }] = await Promise.all([
    supabaseAdmin.from("properties").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("archived", false),
    supabaseAdmin.from("guests").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("checkout_date", today).lte("checkout_date", in7d),
    supabaseAdmin.from("cleaning_jobs").select("id", { count: "exact", head: true }).eq("user_id", userId).in("status", ["agendado", "em_andamento", "problema"]),
  ]);
  return { properties: properties ?? 0, upcomingCheckouts: upcomingCheckouts ?? 0, pendingCleanings: pendingCleanings ?? 0 };
}

async function sendInactivity(templateName: "inactivity-3d" | "inactivity-7d", hoursAgo: number) {
  const upper = new Date(Date.now() - (hoursAgo - 1) * 3600 * 1000).toISOString();
  const lower = new Date(Date.now() - (hoursAgo + 1) * 3600 * 1000).toISOString();
  let page = 1;
  let count = 0;
  while (true) {
    const { data } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
    if (!data || data.users.length === 0) break;
    for (const u of data.users) {
      if (!u.email || !u.last_sign_in_at) continue;
      const last = new Date(u.last_sign_in_at).toISOString();
      if (last < lower || last > upper) continue;
      if (await alreadySent(templateName, u.id)) continue;
      const { data: prof } = await supabaseAdmin.from("profiles").select("display_name, locale").eq("id", u.id).maybeSingle();
      const snapshot = templateName === "inactivity-3d" ? await buildInactivitySnapshot(u.id) : {};
      const r = await internalSendEmail({
        templateName,
        recipientEmail: u.email,
        templateData: { name: prof?.display_name ?? null, lang: prof?.locale ?? "pt", ...snapshot },
        idempotencyKey: `${templateName}-${u.id}`,
      });
      if (r.ok || r.reason === "suppressed") {
        await recordSent(templateName, u.id);
        count++;
      }
    }
    if (data.users.length < 200) break;
    page++;
    if (page > 10) break;
  }
  return count;
}

export const Route = createFileRoute("/api/public/hooks/automated-emails")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        const auth = request.headers.get("authorization");
        if (!secret || auth !== `Bearer ${secret}`) return unauthorized();

        const [welcome, inact3, inact7] = await Promise.all([
          sendWelcomeBatch(100),
          sendInactivity("inactivity-3d", 72),
          sendInactivity("inactivity-7d", 168),
        ]);
        return Response.json({ ok: true, welcome, inact3, inact7 });
      },
    },
  },
});
