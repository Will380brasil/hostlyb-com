import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { FileDown } from "lucide-react";
import { generatePerformancePdf } from "@/lib/performance-pdf";

type Period = "month" | "3m" | "6m" | "ytd";

function rangeFor(p: Period): { start: Date; end: Date; prevStart: Date; prevEnd: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  let start: Date;
  if (p === "month") start = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (p === "3m") start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  else if (p === "6m") start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  else start = new Date(now.getFullYear(), 0, 1);
  const span = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - span);
  return { start, end, prevStart, prevEnd };
}

function daysBetween(a: Date, b: Date) {
  return Math.max(1, Math.ceil((b.getTime() - a.getTime()) / 86400000));
}

export function PerformanceTab({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const t = useT();
  const { currency, lang } = useLocale();
  const [period, setPeriod] = useState<Period>("month");
  const r = rangeFor(period);

  const { data } = useQuery({
    queryKey: ["perf", propertyId, period],
    queryFn: async () => {
      const isoStart = r.start.toISOString().slice(0, 10);
      const isoEnd = r.end.toISOString().slice(0, 10);
      const prevStart = r.prevStart.toISOString().slice(0, 10);
      const prevEnd = r.prevEnd.toISOString().slice(0, 10);

      const [{ data: guests }, { data: tx }, { data: prevTx }, { data: prevGuests }] = await Promise.all([
        supabase.from("guests").select("checkin_date,checkout_date,total_value,nights")
          .eq("property_id", propertyId).gte("checkin_date", isoStart).lte("checkin_date", isoEnd),
        supabase.from("transactions").select("type,category,amount,date")
          .eq("property_id", propertyId).gte("date", isoStart).lte("date", isoEnd),
        supabase.from("transactions").select("type,amount,date")
          .eq("property_id", propertyId).gte("date", prevStart).lte("date", prevEnd),
        supabase.from("guests").select("checkin_date,checkout_date,total_value")
          .eq("property_id", propertyId).gte("checkin_date", prevStart).lte("checkin_date", prevEnd),
      ]);

      const totalDays = daysBetween(r.start, r.end);
      const bookedNights = (guests ?? []).reduce((s: number, g: any) => s + (g.nights ?? daysBetween(new Date(g.checkin_date), new Date(g.checkout_date))), 0);
      const occupancy = Math.min(1, bookedNights / totalDays);
      const revenue = (tx ?? []).filter((x: any) => x.type === "entrada").reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
      const cleaningCost = (tx ?? []).filter((x: any) => x.category === "Limpeza / faxina").reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
      const maintCost = (tx ?? []).filter((x: any) => x.category === "Manutenção").reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
      const netProfit = revenue - cleaningCost - maintCost;
      const adr = bookedNights > 0 ? revenue / bookedNights : 0;
      const prevRevenue = (prevTx ?? []).filter((x: any) => x.type === "entrada").reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
      const vsPrev = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

      // monthly bars for the last 6 months
      const now = new Date();
      const monthly: { label: string; value: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const mStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const mEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const a = mStart.toISOString().slice(0, 10), b = mEnd.toISOString().slice(0, 10);
        const { data: mtx } = await supabase.from("transactions").select("amount,type,date")
          .eq("property_id", propertyId).eq("type", "entrada").gte("date", a).lte("date", b);
        const v = (mtx ?? []).reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
        monthly.push({ label: mStart.toLocaleDateString(lang, { month: "short" }), value: v });
      }

      return { occupancy, revenue, cleaningCost, maintCost, netProfit, adr, guests: guests?.length ?? 0, vsPrev, monthly };
    },
  });

  const periodLabel = useMemo(() => `${r.start.toLocaleDateString(lang)} → ${r.end.toLocaleDateString(lang)}`, [r, lang]);

  if (!data) return <p className="text-sm text-muted-foreground">…</p>;

  const cards: [string, string][] = [
    [t("perf.occupancy"), `${(data.occupancy * 100).toFixed(1)}%`],
    [t("perf.revenue"), formatMoney(data.revenue, currency, lang)],
    [t("perf.adr"), formatMoney(data.adr, currency, lang)],
    [t("perf.guests"), String(data.guests)],
    [t("perf.cleaningCost"), formatMoney(data.cleaningCost, currency, lang)],
    [t("perf.maintCost"), formatMoney(data.maintCost, currency, lang)],
    [t("perf.netProfit"), formatMoney(data.netProfit, currency, lang)],
    [t("perf.vsPrev"), `${data.vsPrev >= 0 ? "+" : ""}${data.vsPrev.toFixed(1)}%`],
  ];

  const onPdf = () => generatePerformancePdf({
    propertyName, period: periodLabel,
    occupancy: data.occupancy, revenue: data.revenue, adr: data.adr, guests: data.guests,
    cleaningCost: data.cleaningCost, maintCost: data.maintCost, netProfit: data.netProfit, vsPrev: data.vsPrev,
    monthly: data.monthly, currency,
    labels: {
      occupancy: t("perf.occupancy"), revenue: t("perf.revenue"), adr: t("perf.adr"), guests: t("perf.guests"),
      cleaningCost: t("perf.cleaningCost"), maintCost: t("perf.maintCost"), netProfit: t("perf.netProfit"), vsPrev: t("perf.vsPrev"),
    },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select value={period} onChange={(e) => setPeriod(e.target.value as Period)} className="rounded-lg border text-sm py-1.5 px-2">
          <option value="month">{t("perf.period.month")}</option>
          <option value="3m">{t("perf.period.3m")}</option>
          <option value="6m">{t("perf.period.6m")}</option>
          <option value="ytd">{t("perf.period.ytd")}</option>
        </select>
        <button className="btn-primary ml-auto" onClick={onPdf}><FileDown size={14} /> {t("perf.exportPdf")}</button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {cards.map(([l, v]) => (
          <div key={l} className="hostly-card !p-3">
            <p className="text-[11px] text-muted-foreground">{l}</p>
            <p className="text-lg font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="hostly-card">
        <p className="text-xs text-muted-foreground mb-2">Monthly revenue</p>
        <div className="flex items-end gap-2 h-32">
          {data.monthly.map((m, i) => {
            const max = Math.max(1, ...data.monthly.map((x) => x.value));
            const h = (m.value / max) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t" style={{ height: `${h}%`, background: "var(--color-primary)" }} />
                <span className="text-[10px] text-muted-foreground">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
