import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { type StripeEnv, createStripeClient } from "@/lib/stripe.server";

const ALLOWED_PRICES = new Set([
  // Pro v3 (current)
  "pro_v3_monthly_brl", "pro_v3_monthly_eur", "pro_v3_monthly_usd", "pro_v3_monthly_gbp",
  // Premium v3 (current)
  "premium_v3_monthly_brl", "premium_v3_monthly_eur",
  "premium_v3_monthly_usd", "premium_v3_monthly_gbp",
  // Grandfathered legacy prices (existing subscribers only)
  "pro_monthly_brl", "pro_monthly_eur", "pro_monthly_usd", "pro_monthly_gbp",
  "premium_monthly_brl_v2", "premium_monthly_eur_v2", "premium_monthly_usd_v2", "premium_monthly_gbp_v2",
  "premium_monthly_brl", "premium_monthly_eur", "premium_monthly_usd",
  "hostly_pro_brl", "hostly_pro_eur", "hostly_pro_usd",
]);

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) {
    throw new Error("Invalid userId");
  }
  if (options.userId) {
    const found = await stripe.customers.search({
      query: `metadata['userId']:'${options.userId}'`,
      limit: 1,
    });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, {
          metadata: { ...customer.metadata, userId: options.userId },
        });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({
    ...(options.email && { email: options.email }),
    ...(options.userId && { metadata: { userId: options.userId } }),
  });
  return created.id;
}

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: {
    priceId: string;
    organizationId: string;
    returnUrl: string;
    environment: StripeEnv;
  }) => {
    if (!ALLOWED_PRICES.has(data.priceId)) throw new Error("Invalid priceId");
    if (!/^[0-9a-f-]{36}$/i.test(data.organizationId)) throw new Error("Invalid organizationId");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase, userId, claims } = context;
    const email = (claims as any)?.email as string | undefined;

    // Verify user is owner of org
    const { data: member } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", data.organizationId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!member || member.role !== "owner") throw new Error("Only the organization owner can subscribe");

    const stripe = createStripeClient(data.environment);

    const prices = await stripe.prices.list({ lookup_keys: [data.priceId] });
    if (!prices.data.length) throw new Error("Price not found");
    const stripePrice = prices.data[0];

    const customerId = await resolveOrCreateCustomer(stripe, { email, userId });

    const sessionParams = {
      line_items: [{ price: stripePrice.id, quantity: 1 }],
      mode: "subscription",
      ui_mode: "embedded_page",
      return_url: data.returnUrl,
      customer: customerId,
      managed_payments: { enabled: true },
      metadata: {
        userId,
        organizationId: data.organizationId,
        managed_payments: "true",
      },
      subscription_data: {
        metadata: { userId, organizationId: data.organizationId },
      },
    } as unknown as Parameters<typeof stripe.checkout.sessions.create>[0];

    const session = await stripe.checkout.sessions.create(sessionParams);

    return session.client_secret;
  });

export const createPortalSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { organizationId: string; returnUrl?: string; environment: StripeEnv }) => {
    if (!/^[0-9a-f-]{36}$/i.test(data.organizationId)) throw new Error("Invalid organizationId");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("organization_id", data.organizationId)
      .eq("environment", data.environment)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!sub?.stripe_customer_id) throw new Error("No subscription found");

    const stripe = createStripeClient(data.environment);
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      ...(data.returnUrl && { return_url: data.returnUrl }),
    });
    return portal.url;
  });
