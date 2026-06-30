import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale, useT, PLAN_PRICE, type Currency } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/hooks/useAuth";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { createPortalSession } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type AssinarSearch = { onboarding?: "1"; plan?: "free" | "starter" | "pro" | "premium" };

export const Route = createFileRoute("/assinar")({
  validateSearch: (s: Record<string, unknown>): AssinarSearch => ({
    onboarding: s.onboarding === "1" ? "1" : undefined,
    plan: (s.plan === "free" || s.plan === "starter" || s.plan === "pro" || s.plan === "premium") ? s.plan : undefined,
  }),
  component: SubscribePage,
});

type Plan = "starter" | "pro" | "premium";

// Map display currency + plan → Stripe price ID. SA users are billed in EUR.
function priceIdFor(currency: "BRL" | "EUR" | "USD" | "GBP", plan: Plan): string {
  const cur = currency.toLowerCase();
  return `${plan}_v3_monthly_${cur}`;
}

function formatPlan(amount: number, currency: Currency | "SAR", lang: string): string {
  const locale =
    lang === "en" && (currency === "EUR" || currency === "GBP") ? "en-GB" :
    ({ pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE" } as Record<string, string>)[lang] ?? "en-US";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency", currency,
      minimumFractionDigits: currency === "BRL" || currency === "SAR" ? 2 : 0,
    }).format(amount);
  } catch {
    const sym = currency === "BRL" ? "R$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : currency === "SAR" ? "ر.س" : "$";
    return `${sym} ${amount.toFixed(2)}`;
  }
}

function SubscribePage() {
  const navigate = useNavigate();
  const { currency, lang, country } = useLocale();
  const t = useT();
  const search = useSearch({ from: "/assinar" }) as AssinarSearch;
  const isOnboarding = search.onboarding === "1";
  const { session, loading: authLoading } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(
    search.plan === "starter" || search.plan === "pro" || search.plan === "premium" ? (search.plan as Plan) : null
  );
  const [continuingFree, setContinuingFree] = useState(false);
  const { subscription, isActive, loading } = useSubscription(orgId);

  useEffect(() => {
    if (authLoading) return;
    const user = session?.user;
    if (!user) { navigate({ to: "/login" as any }); return; }
    setUserId(user.id);
    (async () => {
      const { data: m } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (m) { setOrgId(m.organization_id); setRole(m.role); }
    })();
  }, [authLoading, session?.user, navigate]);

  // When user becomes active via Stripe during onboarding, mark complete and go to /app
  useEffect(() => {
    if (!isOnboarding || !isActive || !userId) return;
    (async () => {
      await supabase.from("profiles").update({
        onboarding_completed: true,
        plan_selected_at: new Date().toISOString(),
      }).eq("id", userId);
      try { localStorage.removeItem("selected_plan"); } catch {}
      navigate({ to: "/app" as any });
    })();
  }, [isOnboarding, isActive, userId, navigate]);

  const continueFree = async () => {
    if (!userId) return;
    setContinuingFree(true);
    const { error } = await supabase.from("profiles").update({
      onboarding_completed: true,
      plan_selected_at: new Date().toISOString(),
    }).eq("id", userId);
    setContinuingFree(false);
    if (error) { toast.error(error.message); return; }
    try { localStorage.removeItem("selected_plan"); } catch {}
    navigate({ to: "/app" as any });
  };

  const isSA = (country || "").toUpperCase() === "SA";
  const billedCurrency: "BRL" | "EUR" | "USD" | "GBP" = isSA ? "EUR" : currency;
  const displayCurrency: Currency | "SAR" = isSA ? "SAR" : currency;

  const starterAmount = displayCurrency === "SAR" ? PLAN_PRICE.starter.EUR * 4 : PLAN_PRICE.starter[currency];
  const proAmount = displayCurrency === "SAR" ? PLAN_PRICE.pro.EUR * 4 : PLAN_PRICE.pro[currency];
  const premiumAmount = displayCurrency === "SAR" ? PLAN_PRICE.premium.EUR * 4 : PLAN_PRICE.premium[currency];

  const openPortal = async () => {
    if (!orgId) return;
    const url = await createPortalSession({
      data: { organizationId: orgId, environment: getStripeEnvironment(), returnUrl: window.location.href },
    });
    window.open(url, "_blank");
  };

  const freeFeatures = [t("pricing.free.f1"), t("pricing.free.f2"), t("pricing.free.f3"), t("pricing.free.f4"), t("pricing.free.f5")];
  const starterFeatures = [t("pricing.starter.f1"), t("pricing.starter.f2"), t("pricing.starter.f3"), t("pricing.starter.f4"), t("pricing.starter.f5")];
  const proFeatures = [t("pricing.pro.f1"), t("pricing.pro.f2"), t("pricing.pro.f3"), t("pricing.pro.f4"), t("pricing.pro.f5")];
  const premiumFeatures = [t("pricing.premium.f1"), t("pricing.premium.f2"), t("pricing.premium.f3"), t("pricing.premium.f4"), t("pricing.premium.f5")];

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isOnboarding ? "Escolha seu plano" : `${t("pricing.title.a")} ${t("pricing.title.b")}`}
          </h1>
          {!isOnboarding && (
            <Link to="/app" className="text-sm text-muted-foreground hover:underline">Voltar</Link>
          )}
        </div>
        {isOnboarding && (
          <p className="text-sm text-muted-foreground">
            Você pode trocar a qualquer momento. Se escolher Pro ou Premium, será redirecionado para o pagamento seguro.
          </p>
        )}

        {authLoading || loading || !orgId ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : isActive ? (
          <div className="rounded-lg border p-6 space-y-3">
            <div className="text-sm uppercase tracking-wide text-muted-foreground">Plano atual</div>
            <div className="text-xl font-semibold">{subscription?.price_id?.startsWith("premium") ? "Hostlyb Premium" : "Hostlyb Pro"}</div>
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
        ) : selectedPlan ? (
          <div className="space-y-3">
            <button className="text-sm text-muted-foreground hover:underline" onClick={() => setSelectedPlan(null)}>← Voltar aos planos</button>
            <StripeEmbeddedCheckout priceId={priceIdFor(billedCurrency, selectedPlan)} organizationId={orgId} />
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-4">
            {/* FREE */}
            <div className="rounded-2xl border bg-card p-6 flex flex-col">
              <div className="text-xs font-bold text-muted-foreground tracking-wide mb-2">{t("pricing.free.tag").toUpperCase()}</div>
              <div className="text-xl font-bold mb-3">{t("pricing.free.name")}</div>
              <div className="text-4xl font-extrabold mb-5">{t("pricing.free.price")}</div>
              <ul className="space-y-2 mb-6 flex-1">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              {isOnboarding ? (
                <Button variant="outline" className="w-full" disabled={continuingFree} onClick={continueFree}>
                  {continuingFree ? "Aguarde…" : "Continuar com Grátis"}
                </Button>
              ) : (
                <div className="text-xs text-muted-foreground text-center">Plano atual</div>
              )}
            </div>

            {/* STARTER */}
            <div className="rounded-2xl border bg-card p-6 flex flex-col">
              <div className="text-xs font-bold text-emerald-600 tracking-wide mb-2">{t("pricing.starter.tag").toUpperCase()}</div>
              <div className="text-xl font-bold mb-3">{t("pricing.starter.name")}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold">{formatPlan(starterAmount, displayCurrency, lang)}</span>
                <span className="text-sm text-muted-foreground">{t("pricing.suffix")}</span>
              </div>
              <p className="text-xs font-semibold text-emerald-600 mb-4">✦ 1€ no 1.º mês</p>
              <ul className="space-y-2 mb-6 flex-1">
                {starterFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="outline" className="w-full" onClick={() => setSelectedPlan("starter")}>{t("pricing.starter.cta")}</Button>
              <p className="text-xs text-center text-muted-foreground mt-3">{t("pricing.note")}</p>
            </div>

            {/* PRO */}
            <div className="rounded-2xl border-2 border-primary bg-card p-6 flex flex-col relative shadow-lg">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-bold tracking-wide px-3 py-1 rounded-full">
                {t("pricing.popular")}
              </div>
              <div className="text-xs font-bold text-primary tracking-wide mb-2">{t("pricing.pro.tag").toUpperCase()}</div>
              <div className="text-xl font-bold mb-3">{t("pricing.pro.name")}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold">{formatPlan(proAmount, displayCurrency, lang)}</span>
                <span className="text-sm text-muted-foreground">{t("pricing.suffix")}</span>
              </div>
              <p className="text-xs font-semibold text-emerald-400 mb-4">✦ 1€ no 1.º mês</p>
              <ul className="space-y-2 mb-6 flex-1">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" className="w-full" onClick={() => setSelectedPlan("pro")}>{t("pricing.pro.cta")}</Button>
              <p className="text-xs text-center text-muted-foreground mt-3">{t("pricing.note")}</p>
            </div>

            {/* PREMIUM */}
            <div className="rounded-2xl border bg-card p-6 flex flex-col">
              <div className="text-xs font-bold text-muted-foreground tracking-wide mb-2">{t("pricing.premium.tag").toUpperCase()}</div>
              <div className="text-xl font-bold mb-3">{t("pricing.premium.name")}</div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-extrabold">{formatPlan(premiumAmount, displayCurrency, lang)}</span>
                <span className="text-sm text-muted-foreground">{t("pricing.suffix")}</span>
              </div>
              <p className="text-xs font-semibold text-emerald-600 mb-4">✦ 1€ no 1.º mês</p>
              <ul className="space-y-2 mb-6 flex-1">
                {premiumFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button size="lg" variant="outline" className="w-full" onClick={() => setSelectedPlan("premium")}>{t("pricing.premium.cta")}</Button>
              <p className="text-xs text-center text-muted-foreground mt-3">{t("pricing.note")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
