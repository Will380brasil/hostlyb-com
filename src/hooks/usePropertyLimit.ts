import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import type { Tier } from "@/lib/pricing";

const NEXT: Record<number, Tier> = { 5: 10, 10: 20, 20: 50, 50: 999 };

export function usePropertyLimit() {
  const trial = useTrialStatus();
  const [tier, setTier] = useState<Tier>(5);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (!cancelled) setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("property_tier, current_property_count")
        .eq("id", user.id)
        .maybeSingle();
      if (!cancelled) {
        setTier(((data as any)?.property_tier ?? 5) as Tier);
        setCount((data as any)?.current_property_count ?? 0);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [trial.hasActiveSubscription]);

  // During trial: unlimited; with active sub: respect tier
  const inTrial = !trial.isTrialEnded && !trial.hasActiveSubscription;
  const canAdd = inTrial || count < tier;
  const isAtLimit = !inTrial && count >= tier;
  const nextTier = NEXT[tier] ?? null;

  return { tier, count, canAdd, isAtLimit, nextTier, loading, inTrial };
}
