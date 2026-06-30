import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLocale, useT } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Download, FileText, Calendar } from "lucide-react";
import jsPDF from "jspdf";

export const Route = createFileRoute("/relatorios")({
  head: () => ({ meta: [{ title: "Relatórios — Hostlyb" }, { name: "description", content: "Relatórios consolidados." }] }),
  component: () => (
    <AppShell>
      <ReportsPage />
    </AppShell>
  ),
});

type Range = "7d" | "30d" | "month" | "year" | "custom";

function rangeDates(r: Range, customFrom: string, customTo: string) {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  if (r === "7d") {
    const f = new Date(today); f.setDate(f.getDate() - 6);
    return { from: iso(f), to: iso(today) };
  }
  if (r === "30d") {
    const f = new Date(today); f.setDate(f.getDate() - 29);
    return { from: iso(f), to: iso(today) };
  }
  if (r === "month") {
    const f = new Date(today.getFullYear(), today.getMonth(), 1);
    const t = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { from: iso(f), to: iso(t) };
  }
  if (r === "year") {
    const f = new Date(today.getFullYear(), 0, 1);
    const t = new Date(today.getFullYear(), 11, 31);
    return { from: iso(f), to: iso(t) };
  }
  return { from: customFrom || iso(today), to: customTo || iso(today) };
}

function ReportsPage() {
  const { session } = useAuth();
  const { currency, lang } = useLocale();
  const t = useT();
  const [range, setRange] = useState<Range>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [propId, setPropId] = useState<string>("");

  const { from, to } = useMemo(() => rangeDates(range, customFrom, customTo), [range, customFrom, customTo]);
  const fmt = (n: number) => formatMoney(n, currency, lang);
  const uid = session?.user.id;

  const { data: properties = [] } = useQuery({
    queryKey: ["rel-props", uid],
    enabled: !!uid,
    queryFn: async () => (await supabase.from("properties").select("id, name, max_guests").eq("archived", false).order("name")).data ?? [],
  });

  const { data: txs = [] } = useQuery({
    queryKey: ["rel-tx", uid, from, to, propId],
    enabled: !!uid,
    queryFn: async () => {
      let q = supabase.from("transactions").select("*").gte("date", from).lte("date", to);
      if (propId) q = q.eq("property_id", propId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["rel-guests", uid, from, to, propId],
    enabled: !!uid,
    queryFn: async () => {
      let q = supabase.from("guests").select("id, property_id, checkin_date, checkout_date, total_value").lte("checkin_date", to).gte("checkout_date", from);
      if (propId) q = q.eq("property_id", propId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["rel-jobs", uid, from, to, propId],
    enabled: !!uid,
    queryFn: async () => {
      let q = supabase.from("cleaning_jobs").select("id, property_id, status, duration_minutes, payment_amount, scheduled_date").gte("scheduled_date", from).lte("scheduled_date", to);
      if (propId) q = q.eq("property_id", propId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: forgotten = [] } = useQuery({
    queryKey: ["rel-forg", uid, from, to, propId],
    enabled: !!uid,
    queryFn: async () => {
      let q = supabase.from("forgotten_items").select("id, status, property_id, created_at").gte("created_at", from).lte("created_at", to + "T23:59:59");
      if (propId) q = q.eq("property_id", propId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: maint = [] } = useQuery({
    queryKey: ["rel-maint", uid, from, to, propId],
    enabled: !!uid,
    queryFn: async () => {
      let q = supabase.from("maintenance_issues").select("id, status, cost, property_id, created_at").gte("created_at", from).lte("created_at", to + "T23:59:59");
      if (propId) q = q.eq("property_id", propId);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  // Aggregations
  const revenue = txs.filter((x: any) => x.type === "entrada").reduce((s: number, x: any) => s + Number(x.amount), 0);
  const expenses = txs.filter((x: any) => x.type === "saida").reduce((s: number, x: any) => s + Number(x.amount), 0);
  const net = revenue - expenses;
  const margin = revenue > 0 ? (net / revenue) * 100 : 0;

  // nights in range
  const totalDays = Math.max(1, Math.round((+new Date(to) - +new Date(from)) / 86400000) + 1);
  const occupiedNights = guests.reduce((s: number, g: any) => {
    const ci = new Date(Math.max(+new Date(g.checkin_date), +new Date(from)));
    const co = new Date(Math.min(+new Date(g.checkout_date), +new Date(to) + 86400000));
    const n = Math.max(0, Math.round((+co - +ci) / 86400000));
    return s + n;
  }, 0);
  const propsCount = propId ? 1 : properties.length;
  const availableNights = Math.max(1, propsCount * totalDays);
  const occupancyPct = (occupiedNights / availableNights) * 100;
  const adr = occupiedNights > 0 ? guests.reduce((s: number, g: any) => s + Number(g.total_value ?? 0), 0) / occupiedNights : 0;

  const cleaningsDone = jobs.filter((j: any) => j.status === "concluido");
  const cleaningsAvg = cleaningsDone.filter((j: any) => j.duration_minutes).length
    ? Math.round(cleaningsDone.reduce((s: number, j: any) => s + (j.duration_minutes || 0), 0) / cleaningsDone.filter((j: any) => j.duration_minutes).length)
    : 0;
  const cleaningProblems = jobs.filter((j: any) => j.status === "problema").length;

  const forgottenOpen = forgotten.filter((f: any) => !["devolvido", "descartado"].includes(f.status)).length;
  const forgottenResolved = forgotten.filter((f: any) => ["devolvido", "descartado"].includes(f.status)).length;
  const maintOpen = maint.filter((m: any) => m.status !== "resolved").length;
  const maintCost = maint.reduce((s: number, m: any) => s + Number(m.cost ?? 0), 0);

  // by property
  const byProperty = properties.map((p: any) => {
    const pTx = txs.filter((x: any) => x.property_id === p.id);
    const pRev = pTx.filter((x: any) => x.type === "entrada").reduce((s: number, x: any) => s + Number(x.amount), 0);
    const pExp = pTx.filter((x: any) => x.type === "saida").reduce((s: number, x: any) => s + Number(x.amount), 0);
    const pNights = guests.filter((g: any) => g.property_id === p.id).reduce((s: number, g: any) => {
      const ci = new Date(Math.max(+new Date(g.checkin_date), +new Date(from)));
      const co = new Date(Math.min(+new Date(g.checkout_date), +new Date(to) + 86400000));
      return s + Math.max(0, Math.round((+co - +ci) / 86400000));
    }, 0);
    const pClean = jobs.filter((j: any) => j.property_id === p.id && j.status === "concluido").length;
    const pOcc = (pNights / totalDays) * 100;
    return { id: p.id, name: p.name, revenue: pRev, expenses: pExp, net: pRev - pExp, nights: pNights, occupancy: pOcc, cleanings: pClean };
  }).filter((r: any) => !propId || r.id === propId);

  // chart data
  const chartProps = byProperty.slice(0, 8).map((r: any) => ({ name: r.name.slice(0, 12), receita: r.revenue, despesa: r.expenses }));

  const exportCsv = () => {
    const header = [t("rel.colProperty"), t("rel.colRevenue"), t("rel.colExpenses"), t("rel.colNet"), t("rel.colNights"), t("rel.occupancy") + " %", t("rel.colCleanings")];
    const rows = byProperty.map((r: any) => [r.name, r.revenue.toFixed(2), r.expenses.toFixed(2), r.net.toFixed(2), r.nights, r.occupancy.toFixed(1), r.cleanings]);
    const csv = "\uFEFF" + [header.join(";"), ...rows.map((r: any[]) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `hostlyb-relatorio-${from}_${to}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text(`Hostlyb — ${t("rel.title")}`, 14, 18);
    doc.setFontSize(10); doc.text(`${from} → ${to}`, 14, 26);
    let y = 38;
    doc.setFontSize(12);
    const lines = [
      [t("rel.revenue"), fmt(revenue)],
      [t("rel.expenses"), fmt(expenses)],
      [t("rel.net"), fmt(net)],
      [t("rel.margin"), margin.toFixed(1) + "%"],
      [t("rel.nights"), String(occupiedNights)],
      [t("rel.occupancy"), occupancyPct.toFixed(1) + "%"],
      [t("rel.adr"), fmt(adr)],
      [t("rel.cleaningsDone"), String(cleaningsDone.length)],
      [t("rel.avgDuration"), cleaningsAvg + " " + t("rel.minutes")],
      [t("rel.cleaningProblems"), String(cleaningProblems)],
      [t("rel.forgottenOpen"), String(forgottenOpen)],
      [t("rel.maintenanceOpen"), String(maintOpen)],
      [t("rel.maintenanceCost"), fmt(maintCost)],
    ];
    lines.forEach(([k, v]) => { doc.text(`${k}: ${v}`, 14, y); y += 7; });
    y += 6; doc.setFontSize(13); doc.text(t("rel.byProperty"), 14, y); y += 6; doc.setFontSize(10);
    byProperty.forEach((r: any) => {
      const line = `${r.name}  ·  ${fmt(r.revenue)}  /  ${fmt(r.expenses)}  =  ${fmt(r.net)}  ·  ${r.nights}n  ${r.occupancy.toFixed(0)}%  ·  ${r.cleanings} lim`;
      doc.text(line.slice(0, 110), 14, y); y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save(`hostlyb-relatorio-${from}_${to}.pdf`);
  };

  const hasData = txs.length > 0 || guests.length > 0 || jobs.length > 0;

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-5">
        <h1 className="text-2xl font-bold">{t("rel.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("rel.subtitle")}</p>
      </header>

      <section className="hostly-card !p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">{t("rel.period")}</label>
          <select value={range} onChange={(e) => setRange(e.target.value as Range)}
            className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm">
            <option value="7d">{t("rel.range.7d")}</option>
            <option value="30d">{t("rel.range.30d")}</option>
            <option value="month">{t("rel.range.month")}</option>
            <option value="year">{t("rel.range.year")}</option>
            <option value="custom">{t("rel.range.custom")}</option>
          </select>
        </div>
        {range === "custom" && (
          <>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t("rel.from")}</label>
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">{t("rel.to")}</label>
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm" />
            </div>
          </>
        )}
        <div>
          <label className="text-xs text-muted-foreground block mb-1">{t("imv.title")}</label>
          <select value={propId} onChange={(e) => setPropId(e.target.value)}
            className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm">
            <option value="">{t("rel.allProperties")}</option>
            {properties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={exportCsv} className="btn-secondary"><Download size={14} /> {t("rel.exportCsv")}</button>
          <button onClick={exportPdf} className="btn-primary"><FileText size={14} /> {t("rel.exportPdf")}</button>
        </div>
      </section>

      <section className="grid gap-3 grid-cols-2 md:grid-cols-4 mb-4">
        <Stat label={t("rel.revenue")} value={fmt(revenue)} color="var(--color-success)" />
        <Stat label={t("rel.expenses")} value={fmt(expenses)} color="var(--color-destructive, #ef4444)" />
        <Stat label={t("rel.net")} value={fmt(net)} color={net >= 0 ? "var(--color-success)" : "var(--color-destructive, #ef4444)"} />
        <Stat label={t("rel.margin")} value={margin.toFixed(1) + "%"} />
        <Stat label={t("rel.nights")} value={String(occupiedNights)} />
        <Stat label={t("rel.occupancy")} value={occupancyPct.toFixed(1) + "%"} />
        <Stat label={t("rel.adr")} value={fmt(adr)} />
        <Stat label={t("rel.cleaningsDone")} value={String(cleaningsDone.length)} />
        <Stat label={t("rel.avgDuration")} value={cleaningsAvg + " " + t("rel.minutes")} />
        <Stat label={t("rel.cleaningProblems")} value={String(cleaningProblems)} />
        <Stat label={t("rel.forgottenOpen")} value={`${forgottenOpen} / ${forgottenResolved}`} />
        <Stat label={t("rel.maintenanceOpen")} value={`${maintOpen} · ${fmt(maintCost)}`} />
      </section>

      {!hasData ? (
        <div className="hostly-card text-center text-sm text-muted-foreground py-10">
          <Calendar size={28} className="mx-auto mb-2 opacity-50" />
          {t("rel.empty")}
        </div>
      ) : (
        <>
          {chartProps.length > 0 && (
            <section className="hostly-card !p-4 mb-4">
              <h3 className="font-bold mb-3 text-sm">{t("rel.chartRevenueVsExpenses")}</h3>
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer>
                  <BarChart data={chartProps}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => fmt(v)} />
                    <Legend />
                    <Bar dataKey="receita" name={t("rel.revenue")} fill="#10b981" />
                    <Bar dataKey="despesa" name={t("rel.expenses")} fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          <section className="hostly-card !p-0 overflow-auto">
            <h3 className="font-bold p-4 pb-2 text-sm">{t("rel.byProperty")}</h3>
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 text-xs text-muted-foreground">
                <tr>
                  <th className="text-left p-3">{t("rel.colProperty")}</th>
                  <th className="text-right p-3">{t("rel.colRevenue")}</th>
                  <th className="text-right p-3">{t("rel.colExpenses")}</th>
                  <th className="text-right p-3">{t("rel.colNet")}</th>
                  <th className="text-right p-3">{t("rel.colNights")}</th>
                  <th className="text-right p-3">{t("rel.occupancy")}</th>
                  <th className="text-right p-3">{t("rel.colCleanings")}</th>
                </tr>
              </thead>
              <tbody>
                {byProperty.map((r: any) => (
                  <tr key={r.id} className="border-t border-card-border">
                    <td className="p-3 font-medium">{r.name}</td>
                    <td className="p-3 text-right font-mono" style={{ color: "var(--color-success)" }}>{fmt(r.revenue)}</td>
                    <td className="p-3 text-right font-mono" style={{ color: "var(--color-destructive, #ef4444)" }}>{fmt(r.expenses)}</td>
                    <td className="p-3 text-right font-mono font-semibold">{fmt(r.net)}</td>
                    <td className="p-3 text-right">{r.nights}</td>
                    <td className="p-3 text-right">{r.occupancy.toFixed(0)}%</td>
                    <td className="p-3 text-right">{r.cleanings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="hostly-card !p-3">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
