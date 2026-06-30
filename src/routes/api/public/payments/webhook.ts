import { createFileRoute } from "@tanstack/react-router";
import { createStripeClient, type StripeEnv } from "@/lib/stripe.server";
import { createClient } from "@supabase/supabase-js";
import type Stripe from "stripe";

function admin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}

async function upsertSubscription(env: StripeEnv, sub: Stripe.Subscription) {
  const meta = (sub.metadata || {}) as Record<string, string>;
  const userId = meta.userId || null;
  const organizationId = meta.organizationId || null;
  const item = sub.items.data[0];
  const priceId = (item?.price as any)?.lookup_key || item?.price?.id || null;
  const productId = typeof item?.price?.product === "string" ? item.price.product : (item?.price?.product as any)?.id || null;
  const periodStart = (item as any)?.current_period_start ?? (sub as any).current_period_start;
  const periodEnd = (item as any)?.current_period_end ?? (sub as any).current_period_end;

  // Derive plan_tier from the (stable) lookup_key-based priceId
  const planTier: "free" | "starter" | "pro" | "premium" =
    priceId?.startsWith("premium_v3_monthly") ? "premium"
    : priceId?.startsWith("pro_v3_monthly") ? "pro"
    : priceId?.startsWith("starter_v3_monthly") ? "starter"
    : priceId?.startsWith("premium_monthly") ? "premium"
    : priceId?.startsWith("pro_monthly") ? "pro"
    : priceId?.startsWith("hostly_pro") ? "premium" // legacy
    : "free";

  const row = {
    user_id: userId,
    organization_id: organizationId,
    environment: env,
    stripe_customer_id: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    stripe_subscription_id: sub.id,
    status: sub.status,
    price_id: priceId,
    product_id: productId,
    plan_tier: planTier,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end ?? false,
    trial_end: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
  };

  const sb = admin();
  await sb.from("subscriptions").upsert(row, { onConflict: "stripe_subscription_id" });

  // Sync property_tier / billing_currency / billing_interval onto profile
  // Pattern: hostly_tier_{tier}_{currency}_{interval}
  if (userId && priceId) {
    const m = /^hostly_tier_(\d+)_(eur|brl|usd)_(monthly|yearly)$/i.exec(priceId);
    if (m) {
      const isActive = ["active", "trialing", "past_due"].includes(sub.status);
      const tier = isActive ? parseInt(m[1], 10) : 5;
      await sb.from("profiles").update({
        property_tier: tier,
        billing_currency: m[2].toUpperCase(),
        billing_interval: m[3].toLowerCase(),
        updated_at: new Date().toISOString(),
      }).eq("id", userId);
    }
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get("env") === "live" ? "live" : "sandbox") as StripeEnv;
        const secret = env === "live"
          ? process.env.PAYMENTS_LIVE_WEBHOOK_SECRET
          : process.env.PAYMENTS_SANDBOX_WEBHOOK_SECRET;
        if (!secret) return new Response("missing webhook secret", { status: 500 });

        const sig = request.headers.get("stripe-signature");
        if (!sig) return new Response("missing signature", { status: 400 });

        const body = await request.text();
        const stripe = createStripeClient(env);
        let event: Stripe.Event;
        try {
          event = await stripe.webhooks.constructEventAsync(body, sig, secret);
        } catch (err) {
          console.error("[webhook] signature error", err);
          return new Response("invalid signature", { status: 400 });
        }

        try {
          switch (event.type) {
            case "checkout.session.completed": {
              const session = event.data.object as Stripe.Checkout.Session;
              if (session.subscription) {
                const subId = typeof session.subscription === "string" ? session.subscription : session.subscription.id;
                const sub = await stripe.subscriptions.retrieve(subId);
                // ensure metadata propagates from session
                if (!sub.metadata?.organizationId && session.metadata?.organizationId) {
                  await stripe.subscriptions.update(subId, {
                    metadata: { ...sub.metadata, ...session.metadata },
                  });
                  sub.metadata = { ...sub.metadata, ...session.metadata } as any;
                }
                await upsertSubscription(env, sub);
              }
              break;
            }
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
              await upsertSubscription(env, event.data.object as Stripe.Subscription);
              break;
            }
          }
        } catch (err) {
          console.error("[webhook] handler error", err);
          return new Response("error", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
