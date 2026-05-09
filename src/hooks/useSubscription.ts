import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export interface SubscriptionRow {
  id: string;
  status: string;
  price_id: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  trial_end: string | null;
  stripe_customer_id: string | null;
}

export function useSubscription(organizationId: string | null | undefined) {
  const [data, setData] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) { setData(null); setLoading(false); return; }
    let cancelled = false;
    const env = getStripeEnvironment();

    const load = async () => {
      const { data: row } = await supabase
        .from("subscriptions")
        .select("id,status,price_id,current_period_end,cancel_at_period_end,trial_end,stripe_customer_id")
        .eq("organization_id", organizationId)
        .eq("environment", env)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!cancelled) { setData(row as any); setLoading(false); }
    };
    load();

    const channel = supabase
      .channel(`subs:${organizationId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `organization_id=eq.${organizationId}` },
        () => load())
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [organizationId]);

  const isActive = !!data && (
    data.status === "active" || data.status === "trialing" ||
    ((data.status === "canceled" || data.status === "past_due") &&
      !!data.current_period_end && new Date(data.current_period_end) > new Date())
  );

  return { subscription: data, isActive, loading };
}
