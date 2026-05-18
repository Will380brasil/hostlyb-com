import { Link } from "@tanstack/react-router";
import { Crown } from "lucide-react";
import { useT } from "@/lib/i18n";
import { usePremium } from "@/hooks/usePremium";
import type { ReactNode } from "react";

export function PremiumGate({ children }: { children: ReactNode }) {
  const { isPremium, loading } = usePremium();
  const t = useT();
  if (loading) return <div className="text-sm text-muted-foreground p-6">…</div>;
  if (isPremium) return <>{children}</>;
  return (
    <div className="hostly-card text-center py-10 px-6 max-w-md mx-auto my-6">
      <Crown className="mx-auto mb-3" size={36} style={{ color: "var(--color-warning)" }} />
      <h3 className="text-lg font-bold mb-2">{t("premium.gate.title")}</h3>
      <p className="text-sm text-muted-foreground mb-5">{t("premium.gate.body")}</p>
      <Link to="/assinar" className="btn-primary inline-flex justify-center">
        {t("premium.gate.cta")}
      </Link>
    </div>
  );
}

export function PremiumBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded"
      style={{ background: "color-mix(in oklch, var(--color-warning) 18%, transparent)", color: "var(--color-warning)" }}>
      <Crown size={10} /> Premium
    </span>
  );
}
