import { Link } from "@tanstack/react-router";
import { X, ArrowRight, Lock } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { pricingT, PRICING, formatTierPrice, type Tier } from "@/lib/pricing";

interface Props {
  open: boolean;
  onClose: () => void;
  currentTier: Tier;
  nextTier: Tier | null;
}

export function UpgradeModal({ open, onClose, currentTier, nextTier }: Props) {
  const { lang, currency } = useLocale();
  const t = pricingT(lang);
  if (!open) return null;

  const tiers = PRICING[currency];
  const cur = tiers.find((x) => x.tier === currentTier);
  const nxt = nextTier ? tiers.find((x) => x.tier === nextTier) : null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/55 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-[440px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary grid place-items-center">
            <Lock size={20} />
          </div>
          <button onClick={onClose} aria-label="Close"><X size={20} /></button>
        </div>
        <h3 className="text-xl font-bold mb-1">{t.upgradeTitle}</h3>
        <p className="text-sm text-muted-foreground mb-5">
          {nxt ? t.upgradeBody(currentTier, nxt.tier === 999 ? 50 : nxt.tier) : t.upgradeBody(currentTier, currentTier)}
        </p>

        <div className="space-y-2 mb-5">
          {cur && (
            <Row
              label={`${t.current}: ${t.upTo} ${currentTier} ${t.properties}`}
              price={`${formatTierPrice(cur.monthlyCents, currency, lang)}${t.perMonth}`}
              dim
            />
          )}
          {nxt && !nxt.custom && (
            <Row
              label={`${t.suggested}: ${t.upTo} ${nxt.tier} ${t.properties}`}
              price={`${formatTierPrice(nxt.monthlyCents, currency, lang)}${t.perMonth}`}
            />
          )}
          {nxt?.custom && (
            <Row label={`${t.suggested}: ${t.customLabel}`} price={t.customPrice} />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <Link
            to={"/assinar" as any}
            onClick={onClose}
            className="btn-primary justify-center"
          >
            {t.upgradeNow} <ArrowRight size={16} />
          </Link>
          <button onClick={onClose} className="text-sm text-muted-foreground hover:underline py-2">
            {t.later}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, price, dim }: { label: string; price: string; dim?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border border-card-border ${dim ? "opacity-60" : "bg-primary/5 border-primary/30"}`}>
      <span className="text-sm">{label}</span>
      <span className="font-semibold text-sm">{price}</span>
    </div>
  );
}
