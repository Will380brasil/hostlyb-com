import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { TrendingUp, TrendingDown } from "lucide-react";

function monthBounds(offset = 0) {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + offset);
  const start = new Date(d);
  const end = new Date(d);
  end.setMonth(end.getMonth() + 1);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export function FinancialSummary() {
  const { currency, lang } = useLocale();
  const cur = monthBounds(0);
  const prev = monthBounds(-1);

  const { data: txCurrent = [] } = useQuery({
    queryKey: ["fin-summary", cur.start],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("type, amount, property_id, properties(name)")
        .gte("date", cur.start).lt("date", cur.end);
      return data ?? [];
    },
  });
  const { data: txPrev = [] } = useQuery({
    queryKey: ["fin-summary-prev", prev.start],
    queryFn: async () => {
      const { data } = await supabase.from("transactions").select("type, amount")
        .gte("date", prev.start).lt("date", prev.end);
      return data ?? [];
    },
  });

  const sumIn = (arr: any[]) => arr.filter(t => t.type === "entrada").reduce((s, t) => s + Number(t.amount || 0), 0);
  const sumOut = (arr: any[]) => arr.filter(t => t.type === "saida").reduce((s, t) => s + Number(t.amount || 0), 0);
  const revenue = sumIn(txCurrent);
  const expenses = sumOut(txCurrent);
  const profit = revenue - expenses;
  const prevRevenue = sumIn(txPrev);
  const delta = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : null;

  const byProp: Record<string, { name: string; val: number }> = {};
  for (const t of txCurrent as any[]) {
    if (t.type !== "entrada" || !t.property_id) continue;
    const name = t.properties?.name ?? "—";
    byProp[t.property_id] ||= { name, val: 0 };
    byProp[t.property_id].val += Number(t.amount || 0);
  }
  const top = Object.values(byProp).sort((a, b) => b.val - a.val)[0];

  const Big = ({ label, value, emoji, color }: any) => (
    <div className="hostly-card !p-3 flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground">{emoji} {label}</span>
      <span className="text-xl font-bold font-mono leading-tight" style={{ color }}>{value}</span>
    </div>
  );

  return (
    <section className="mt-6">
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="font-bold">Resumo financeiro do mês</h3>
        <Link to="/financeiro" className="text-xs text-muted-foreground">Ver tudo →</Link>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Big label="Receita" value={formatMoney(revenue, currency, lang)} emoji="💰" color="var(--color-success)" />
        <Big label="Despesas" value={formatMoney(expenses, currency, lang)} emoji="💸" color="var(--color-destructive, #ef4444)" />
        <Big label="Lucro estimado" value={formatMoney(profit, currency, lang)} emoji="📈" color={profit >= 0 ? "var(--color-success)" : "var(--color-destructive, #ef4444)"} />
        <Big label="Imóvel top" value={top ? `${top.name}` : "—"} emoji="🏆" color="var(--color-accent)" />
      </div>
      {delta !== null && (
        <p className="text-xs mt-2 inline-flex items-center gap-1"
          style={{ color: delta >= 0 ? "var(--color-success)" : "var(--color-destructive, #ef4444)" }}>
          {delta >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta >= 0
            ? `Você faturou ${delta}% a mais do que no mês anterior`
            : `Você faturou ${Math.abs(delta)}% a menos do que no mês anterior`}
        </p>
      )}
    </section>
  );
}
