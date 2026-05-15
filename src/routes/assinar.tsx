import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale, useT } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { createPortalSession } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/assinar")({ component: SubscribePage });

// Map display currency → Stripe price ID. SAR users are billed in EUR (Stripe price).
function priceIdFor(currency: "BRL" | "EUR" | "USD"): string {
  if (currency === "BRL") return "premium_monthly_brl";
  if (currency === "USD") return "premium_monthly_usd";
  return "premium_monthly_eur";
}

function SubscribePage() {
  const navigate = useNavigate();
  const { currency, lang, country } = useLocale();
  const t = useT();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
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
    })();
  }, [navigate]);

  // Display currency: SA → SAR display; charged in EUR via Stripe.
  const isSA = (country || "").toUpperCase() === "SA";
  const displayCurrency: "BRL" | "EUR" | "USD" | "SAR" = isSA ? "SAR" : currency;
  const billedCurrency: "BRL" | "EUR" | "USD" = isSA ? "EUR" : currency;
  const priceId = priceIdFor(billedCurrency);

  const premiumAmount = displayCurrency === "SAR" ? 79.9 : 19.9;
  const localeMap: Record<string, string> = {
    pt: "pt-BR", en: displayCurrency === "EUR" ? "en-GB" : "en-US",
    es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE",
  };
  const formattedPrice = (() => {
    try {
      return new Intl.NumberFormat(localeMap[lang] ?? "en-US", {
        style: "currency", currency: displayCurrency, minimumFractionDigits: 2,
      }).format(premiumAmount);
    } catch {
      const sym = displayCurrency === "BRL" ? "R$" : displayCurrency === "EUR" ? "€"
        : displayCurrency === "SAR" ? "ر.س" : "$";
      return `${sym} ${premiumAmount.toFixed(2)}`;
    }
  })();

  const openPortal = async () => {
    if (!orgId) return;
    const url = await createPortalSession({
      data: { organizationId: orgId, environment: getStripeEnvironment(), returnUrl: window.location.href },
    });
    window.open(url, "_blank");
  };

  const freeFeatures = [
    t("pricing.free.f1"), t("pricing.free.f2"), t("pricing.free.f3"),
    t("pricing.free.f4"), t("pricing.free.f5"),
  ];
  const premiumFeatures = [
    t("pricing.premium.f1"), t("pricing.premium.f2"), t("pricing.premium.f3"),
    t("pricing.premium.f4"), t("pricing.premium.f5"),
  ];

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("pricing.title.a")} {t("pricing.title.b")}</h1>
          <Link to="/app" className="text-sm text-muted-foreground hover:underline">Voltar</Link>
        </div>

        {loading || !orgId ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : isActive ? (
          <div className="rounded-lg border p-6 space-y-3">
            <div className="text-sm uppercase tracking-wide text-muted-foreground">Plano atual</div>
            <div className="text-xl font-semibold">Hostlyb Premium</div>
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
        ) : showCheckout ? (
          <div className="space-y-3">
            <button className="text-sm text-muted-foreground hover:underline" onClick={() => setShowCheckout(false)}>← Voltar aos planos</button>
            <StripeEmbeddedCheckout priceId={priceId} organizationId={orgId} />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {/* FREE */}
            <div className="rounded-2xl border bg-card p-6 flex flex-col">
              <div className="text-xs font-bold text-muted-foreground tracking-wide mb-2">{t("pricing.free.tag").toUpperCase()}</div>
              <div className="text-xl font-bold mb-3">{t("pricing.free.name")}</div>
              <div className="text-4xl font-extrabold mb-5">{t("pricing.free.price")}</div>
              <ul className="space-y-2 mb-6 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="text-xs text-muted-foreground text-center">Plano atual</div>
            </div>

            {/* PREMIUM */}
            <div className="rounded-2xl border-2 border-primary bg-card p-6 flex flex-col relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold tracking-wide px-3 py-1 rounded-full">
                {t("pricing.popular")}
              </div>
              <div className="text-xs font-bold text-primary tracking-wide mb-2">{t("pricing.premium.tag").toUpperCase()}</div>
              <div className="text-xl font-bold mb-3">{t("pricing.premium.name")}</div>
              <div className="flex items-baseline gap-1 mb-5">
                <span className="text-4xl font-extrabold">{formattedPrice}</span>
                <span className="text-sm text-muted-foreground">{t("pricing.suffix")}</span>
              </div>
              <ul className="space-y-2 mb-6 flex-1">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="w-full" onClick={() => setShowCheckout(true)}>
                🎁 {t("pricing.cta")}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-3">{t("pricing.note")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
