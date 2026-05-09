import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PLAN_BRL = 59.90;

export const getAdminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const adminEmail = process.env.HOSTLY_ADMIN_EMAIL;
    const userEmail = (context.claims as any)?.email as string | undefined;
    if (!adminEmail || !userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      throw new Response("Forbidden", { status: 403 });
    }

    // List all users (paginated)
    const allUsers: any[] = [];
    let page = 1;
    const perPage = 1000;
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw new Error(error.message);
      allUsers.push(...data.users);
      if (data.users.length < perPage) break;
      page++;
      if (page > 20) break;
    }

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;

    let activeByLogin = 0;
    let inactiveByLogin = 0;
    const dormant: { id: string; email: string | undefined; last_sign_in_at: string | null }[] = [];
    for (const u of allUsers) {
      const last = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
      if (last >= sevenDaysAgo) activeByLogin++;
      else inactiveByLogin++;
      if (last && last < twoDaysAgo) {
        dormant.push({ id: u.id, email: u.email, last_sign_in_at: u.last_sign_in_at });
      }
    }

    // Subscriptions
    const { data: subs, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .select("status, environment, current_period_end, user_id");
    if (subErr) throw new Error(subErr.message);

    const liveSubs = (subs ?? []).filter((s: any) => s.environment === "live");
    const activeSubs = liveSubs.filter((s: any) =>
      s.status === "active" || s.status === "trialing" ||
      (s.status === "canceled" && s.current_period_end && new Date(s.current_period_end).getTime() > now)
    );
    const trialingSubs = liveSubs.filter((s: any) => s.status === "trialing");
    const paidSubs = liveSubs.filter((s: any) => s.status === "active");

    return {
      totalUsers: allUsers.length,
      activeByLogin,
      inactiveByLogin,
      activeSubsCount: activeSubs.length,
      trialingCount: trialingSubs.length,
      paidCount: paidSubs.length,
      estimatedMrrBrl: paidSubs.length * PLAN_BRL,
      dormantUsers: dormant.slice(0, 50),
    };
  });
