import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export type PlanTier = "free" | "pro" | "premium";

export function usePremium() {
  const [tier, setTier] = useState<PlanTier>("free");
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setLoading(false); return; }
      const { data: m } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1).maybeSingle();
      if (!m) { if (!cancelled) setLoading(false); return; }
      if (!cancelled) setOrgId(m.organization_id);
      const env = getStripeEnvironment();
      const { data: s } = await supabase
        .from("subscriptions")
        .select("plan_tier,status,current_period_end")
        .eq("organization_id", m.organization_id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1).maybeSingle();
      let t: PlanTier = "free";
      if (s) {
        const active = s.status === "active" || s.status === "trialing" ||
          ((s.status === "canceled" || s.status === "past_due") && s.current_period_end && new Date(s.current_period_end) > new Date());
        if (active) t = (s.plan_tier as PlanTier) ?? "free";
      }
      if (!cancelled) { setTier(t); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  return { tier, orgId, loading, isPremium: tier === "premium", isPro: tier === "pro" };
}
