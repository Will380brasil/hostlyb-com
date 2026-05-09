import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PLAN_BRL = 59.90;

function assertAdmin(context: any) {
  const adminEmail = process.env.HOSTLY_ADMIN_EMAIL;
  const userEmail = (context.claims as any)?.email as string | undefined;
  if (!adminEmail || !userEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
    throw new Response("Forbidden", { status: 403 });
  }
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
    assertAdmin(context);

    const allUsers = await listAllUsers();
    const now = Date.now();
    const FIVE_MIN = 5 * 60 * 1000;
    const FIFTEEN_MIN = 15 * 60 * 1000;
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const SEVEN_DAYS = 7 * ONE_DAY;
    const THIRTY_DAYS = 30 * ONE_DAY;

    let online = 0, activeSession = 0, last24h = 0, last7d = 0, last30d = 0, dormant = 0, neverLoggedIn = 0;
    let signupsLast24h = 0, signupsLast7d = 0, signupsLast30d = 0;
    const onlineUsers: any[] = [];
    const dormantUsers: any[] = [];
    const recentSignups: any[] = [];

    for (const u of allUsers) {
      const last = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
      const created = u.created_at ? new Date(u.created_at).getTime() : 0;
      const sinceLast = now - last;
      if (!last) neverLoggedIn++;
      else {
        if (sinceLast <= FIVE_MIN) { online++; onlineUsers.push({ id: u.id, email: u.email, last_sign_in_at: u.last_sign_in_at }); }
        if (sinceLast <= FIFTEEN_MIN) activeSession++;
        if (sinceLast <= ONE_DAY) last24h++;
        if (sinceLast <= SEVEN_DAYS) last7d++;
        if (sinceLast <= THIRTY_DAYS) last30d++;
        if (sinceLast > 2 * ONE_DAY) {
          dormant++;
          if (dormantUsers.length < 100) dormantUsers.push({ id: u.id, email: u.email, last_sign_in_at: u.last_sign_in_at, created_at: u.created_at });
        }
      }
      if (created && now - created <= ONE_DAY) { signupsLast24h++; if (recentSignups.length < 20) recentSignups.push({ id: u.id, email: u.email, created_at: u.created_at }); }
      if (created && now - created <= SEVEN_DAYS) signupsLast7d++;
      if (created && now - created <= THIRTY_DAYS) signupsLast30d++;
    }

    // Subscriptions
    const { data: subs, error: subErr } = await supabaseAdmin
      .from("subscriptions")
      .select("status, environment, current_period_end, current_period_start, user_id, trial_end, cancel_at_period_end");
    if (subErr) throw new Error(subErr.message);

    const liveSubs = (subs ?? []).filter((s: any) => s.environment === "live");
    const activeSubs = liveSubs.filter((s: any) =>
      s.status === "active" || s.status === "trialing" ||
      (s.status === "canceled" && s.current_period_end && new Date(s.current_period_end).getTime() > now)
    );
    const trialingSubs = liveSubs.filter((s: any) => s.status === "trialing");
    const paidSubs = liveSubs.filter((s: any) => s.status === "active");
    const churnedLast30d = liveSubs.filter((s: any) =>
      s.status === "canceled" && s.current_period_end && now - new Date(s.current_period_end).getTime() <= THIRTY_DAYS
    ).length;

    // Platform usage counts
    const [propRes, jobsRes, guestsRes, orgsRes] = await Promise.all([
      supabaseAdmin.from("properties").select("id", { count: "exact", head: true }).eq("archived", false),
      supabaseAdmin.from("cleaning_jobs").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("guests").select("id, total_value, created_at"),
      supabaseAdmin.from("organizations").select("id", { count: "exact", head: true }),
    ]);

    const guests = guestsRes.data ?? [];
    const guestRevenueAll = guests.reduce((s, g: any) => s + Number(g.total_value ?? 0), 0);
    const guestRevenue30d = guests
      .filter((g: any) => g.created_at && now - new Date(g.created_at).getTime() <= THIRTY_DAYS)
      .reduce((s, g: any) => s + Number(g.total_value ?? 0), 0);

    return {
      // Users
      totalUsers: allUsers.length,
      online,
      activeSession,
      last24h,
      last7d,
      last30d,
      dormant,
      neverLoggedIn,
      signupsLast24h,
      signupsLast7d,
      signupsLast30d,
      // Subs
      activeSubsCount: activeSubs.length,
      trialingCount: trialingSubs.length,
      paidCount: paidSubs.length,
      churnedLast30d,
      estimatedMrrBrl: paidSubs.length * PLAN_BRL,
      planPriceBrl: PLAN_BRL,
      // Platform usage
      propertiesCount: propRes.count ?? 0,
      cleaningJobsCount: jobsRes.count ?? 0,
      guestsCount: guests.length,
      organizationsCount: orgsRes.count ?? 0,
      guestRevenueAll,
      guestRevenue30d,
      // Lists
      onlineUsers: onlineUsers.slice(0, 50),
      dormantUsers,
      recentSignups,
      generatedAt: new Date().toISOString(),
    };
  });
