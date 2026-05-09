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

    // Subscriptions (live, paying)
    const { data: subs } = await supabaseAdmin
      .from("subscriptions")
      .select("status, environment, current_period_end, user_id");
    const liveSubs = (subs ?? []).filter((s: any) => s.environment === "live");
    const payingUserIds = new Set(
      liveSubs.filter((s: any) => s.status === "active" || s.status === "trialing").map((s: any) => s.user_id)
    );

    // Profiles for phone numbers
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id, phone, full_name");
    const profileMap = new Map<string, any>((profiles ?? []).map((p: any) => [p.user_id, p]));

    const users = allUsers.map((u) => {
      const p = profileMap.get(u.id);
      return {
        id: u.id,
        email: u.email ?? "—",
        phone: p?.phone ?? u.phone ?? "—",
        name: p?.full_name ?? (u.user_metadata as any)?.full_name ?? "—",
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
