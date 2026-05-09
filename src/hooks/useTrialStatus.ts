import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export interface TrialStatus {
  loading: boolean;
  hasOrg: boolean;
  organizationId: string | null;
  isOwner: boolean;
  hasActiveSubscription: boolean;
  trialEnd: Date | null;
  daysRemaining: number | null;
  isTrialEnded: boolean; // trial expired AND no active subscription
  showTrialWarning: boolean; // <= 3 days left
}

const TRIAL_DAYS = 7;

export function useTrialStatus(): TrialStatus {
  const [s, setS] = useState<TrialStatus>({
    loading: true, hasOrg: false, organizationId: null, isOwner: false,
    hasActiveSubscription: false, trialEnd: null, daysRemaining: null,
    isTrialEnded: false, showTrialWarning: false,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setS((p) => ({ ...p, loading: false })); return; }

      const { data: m } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (!m) { if (!cancelled) setS((p) => ({ ...p, loading: false })); return; }

      const env = getStripeEnvironment();
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status,current_period_end,trial_end")
        .eq("organization_id", m.organization_id)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const now = new Date();
      const isActiveSub = !!sub && (
        sub.status === "active" || sub.status === "trialing" ||
        ((sub.status === "canceled" || sub.status === "past_due") &&
          !!sub.current_period_end && new Date(sub.current_period_end) > now)
      );

      // Determine trial end: prefer subscription.trial_end; fallback to user creation + 7 days
      let trialEnd: Date | null = null;
      if (sub?.trial_end) trialEnd = new Date(sub.trial_end);
      else if (user.created_at) {
        const created = new Date(user.created_at);
        trialEnd = new Date(created.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
      }

      const daysRemaining = trialEnd
        ? Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : null;

      const trialExpired = !!trialEnd && trialEnd.getTime() <= now.getTime();
      const isTrialEnded = trialExpired && !isActiveSub;
      const showTrialWarning = !isActiveSub && daysRemaining !== null && daysRemaining > 0 && daysRemaining <= 3;

      if (!cancelled) {
        setS({
          loading: false, hasOrg: true, organizationId: m.organization_id,
          isOwner: m.role === "owner",
          hasActiveSubscription: isActiveSub, trialEnd, daysRemaining,
          isTrialEnded, showTrialWarning,
        });
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return s;
}
