import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { createPortalSession } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { PRICING, pricingT, formatTierPrice, pricePerDay, getStripePriceId, type Tier, type BillingInterval } from "@/lib/pricing";

export const Route = createFileRoute("/assinar")({ component: SubscribePage });

function SubscribePage() {
  const navigate = useNavigate();
  const { currency, lang } = useLocale();
  const t = pricingT(lang);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier>(5);
  const [billing, setBilling] = useState<BillingInterval>("monthly");
  const [showCheckout, setShowCheckout] = useState(false);
  const { subscription, isActive, loading } = useSubscription(orgId);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate({ to: "/login" }); return; }
      const { data: m } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (m) { setOrgId(m.organization_id); setRole(m.role); }
      const { data: p } = await supabase
        .from("profiles").select("property_tier, current_property_count").eq("id", user.id).maybeSingle();
      if (p?.property_tier) {
        // Suggest the smallest tier that fits current count
        const cnt = (p as any).current_property_count ?? 0;
        const sug: Tier = cnt > 50 ? 999 : cnt > 20 ? 50 : cnt > 10 ? 20 : cnt > 5 ? 10 : 5;
        setTier(sug);
      }
    })();
  }, [navigate]);

  const tiers = PRICING[currency];
  const selected = tiers.find((x) => x.tier === tier);
  const priceId = selected && !selected.custom ? getStripePriceId(currency, tier, billing) : null;

  const openPortal = async () => {
    if (!orgId) return;
    const url = await createPortalSession({
      data: { organizationId: orgId, environment: getStripeEnvironment(), returnUrl: window.location.href },
    });
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t.headline}</h1>
          <Link to="/app" className="text-sm text-muted-foreground hover:underline">Voltar</Link>
        </div>

        {loading || !orgId ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : isActive ? (
          <div className="rounded-lg border p-6 space-y-3">
            <div className="text-sm uppercase tracking-wide text-muted-foreground">Plano atual</div>
            <div className="text-xl font-semibold">Hostlyb Pro</div>
            <div className="text-sm">
              Status: <span className="font-medium">{subscription?.status}</span>
              {subscription?.current_period_end && (
                <> · Próxima cobrança: {new Date(subscription.current_period_end).toLocaleDateString()}</>
              )}
            </div>
            {role === "owner" && <Button onClick={openPortal}>Gerenciar assinatura</Button>}
          </div>
        ) : role !== "owner" ? (
          <div className="rounded-lg border p-6"><p>Apenas o proprietário pode gerenciar a assinatura.</p></div>
        ) : showCheckout && priceId ? (
          <div className="space-y-3">
            <button className="text-sm text-muted-foreground hover:underline" onClick={() => setShowCheckout(false)}>← Mudar plano</button>
            <StripeEmbeddedCheckout priceId={priceId} organizationId={orgId} />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Billing toggle */}
            <div className="inline-flex bg-muted rounded-full p-1">
              <button onClick={() => setBilling("monthly")} className={`px-4 py-2 rounded-full text-sm font-semibold ${billing === "monthly" ? "bg-background shadow" : ""}`}>{t.monthly}</button>
              <button onClick={() => setBilling("yearly")} className={`px-4 py-2 rounded-full text-sm font-semibold ${billing === "yearly" ? "bg-background shadow" : ""}`}>{t.yearly} · {t.saveBadge}</button>
            </div>

            {/* Tier grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((x) => {
                const isSel = x.tier === tier;
                const cents = billing === "yearly" ? x.yearlyMonthlyCents : x.monthlyCents;
                return (
                  <button
                    key={x.tier}
                    onClick={() => !x.custom && setTier(x.tier)}
                    className={`text-left rounded-xl p-4 border-2 transition ${isSel ? "border-primary bg-primary/5" : "border-card-border bg-card hover:border-primary/40"}`}
                  >
                    <div className="text-xs font-bold text-muted-foreground mb-2">
                      {x.custom ? t.customLabel : `${t.upTo} ${x.tier} ${t.properties}`}
                    </div>
                    {x.custom ? (
                      <div className="text-lg font-bold">{t.customPrice}</div>
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{formatTierPrice(cents, currency, lang)}<span className="text-xs text-muted-foreground">{t.perMonth}</span></div>
                        <div className="text-xs text-muted-foreground">≈ {pricePerDay(cents, currency, lang)}{t.perDay}</div>
                      </>
                    )}
                    {x.popular && <div className="mt-2 inline-block text-[10px] font-bold text-primary">★ POPULAR</div>}
                  </button>
                );
              })}
            </div>

            {selected?.custom ? (
              <a href="mailto:hello@hostlyb.app" className="btn-primary w-full justify-center">{t.contactUs}</a>
            ) : (
              <Button size="lg" className="w-full" disabled={!priceId} onClick={() => setShowCheckout(true)}>
                {t.startFree}
              </Button>
            )}
            <p className="text-xs text-center text-muted-foreground">🎁 {t.trial} · {t.noCard} · {t.cancel}</p>
          </div>
        )}
      </div>
    </div>
  );
}
