import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocale, formatPrice } from "@/lib/i18n";
import { useSubscription } from "@/hooks/useSubscription";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { createPortalSession } from "@/utils/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/assinar")({ component: SubscribePage });

const PRICE_ID_BY_CURRENCY = {
  BRL: "hostly_pro_brl",
  EUR: "hostly_pro_eur",
  USD: "hostly_pro_usd",
} as const;

function SubscribePage() {
  const navigate = useNavigate();
  const { currency, lang } = useLocale();
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
        .eq("user_id", user.id)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (m) { setOrgId(m.organization_id); setRole(m.role); }
    })();
  }, [navigate]);

  const priceId = PRICE_ID_BY_CURRENCY[currency] ?? PRICE_ID_BY_CURRENCY.BRL;
  const priceLabel = `${formatPrice(currency, lang)}${currency === "USD" ? "/mo" : "/mês"}`;

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
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Assinatura</h1>
          <Link to="/app" className="text-sm text-muted-foreground hover:underline">Voltar</Link>
        </div>

        {loading || !orgId ? (
          <p className="text-muted-foreground">Carregando…</p>
        ) : isActive ? (
          <div className="rounded-lg border p-6 space-y-3">
            <div className="text-sm uppercase tracking-wide text-muted-foreground">Plano atual</div>
            <div className="text-xl font-semibold">Hostly Pro</div>
            <div className="text-sm">
              Status: <span className="font-medium">{subscription?.status}</span>
              {subscription?.current_period_end && (
                <> · Próxima cobrança: {new Date(subscription.current_period_end).toLocaleDateString()}</>
              )}
            </div>
            {role === "owner" && (
              <Button onClick={openPortal}>Gerenciar assinatura</Button>
            )}
          </div>
        ) : role !== "owner" ? (
          <div className="rounded-lg border p-6">
            <p>Apenas o proprietário da conta pode gerenciar a assinatura.</p>
          </div>
        ) : showCheckout ? (
          <StripeEmbeddedCheckout priceId={plan.id} organizationId={orgId} />
        ) : (
          <div className="rounded-lg border p-6 space-y-4">
            <div>
              <div className="text-sm uppercase tracking-wide text-muted-foreground">Plano</div>
              <div className="text-2xl font-bold">Hostly Pro</div>
              <div className="text-3xl font-bold mt-2">{plan.label}</div>
              <div className="text-sm text-muted-foreground mt-1">7 dias grátis · até 5 usuários · apartamentos ilimitados</div>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Imóveis ilimitados</li>
              <li>✓ Até 5 usuários (1 master + 4 funcionários por convite)</li>
              <li>✓ Gestão de hóspedes, limpezas e alertas</li>
              <li>✓ Cancele quando quiser</li>
            </ul>
            <Button size="lg" className="w-full" onClick={() => setShowCheckout(true)}>
              Começar 7 dias grátis
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
