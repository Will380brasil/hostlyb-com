import jsPDF from "jspdf";

export type PerfMetrics = {
  propertyName: string;
  period: string;
  occupancy: number; // 0..1
  revenue: number;
  adr: number;
  guests: number;
  cleaningCost: number;
  maintCost: number;
  netProfit: number;
  vsPrev: number; // percent
  monthly: { label: string; value: number }[];
  currency: string;
  labels: {
    occupancy: string; revenue: string; adr: string; guests: string;
    cleaningCost: string; maintCost: string; netProfit: string; vsPrev: string;
  };
};

function money(v: number, cur: string) {
  try { return new Intl.NumberFormat("en", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(v); }
  catch { return `${cur} ${v.toFixed(0)}`; }
}

export function generatePerformancePdf(m: PerfMetrics) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const MX = 40;

  // Header
  doc.setFillColor(255, 107, 107);
  doc.rect(0, 0, W, 6, "F");
  doc.setFontSize(20); doc.setFont("helvetica", "bold");
  doc.text("Hostlyb", MX, 38);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(100);
  doc.text("Performance report", W - MX, 38, { align: "right" });

  // Title
  doc.setTextColor(15); doc.setFontSize(16); doc.setFont("helvetica", "bold");
  doc.text(m.propertyName, MX, 80);
  doc.setFontSize(10); doc.setFont("helvetica", "normal"); doc.setTextColor(110);
  doc.text(m.period, MX, 96);

  // Metric grid 2x4
  const metrics: [string, string][] = [
    [m.labels.occupancy, `${(m.occupancy * 100).toFixed(1)}%`],
    [m.labels.revenue, money(m.revenue, m.currency)],
    [m.labels.adr, money(m.adr, m.currency)],
    [m.labels.guests, String(m.guests)],
    [m.labels.cleaningCost, money(m.cleaningCost, m.currency)],
    [m.labels.maintCost, money(m.maintCost, m.currency)],
    [m.labels.netProfit, money(m.netProfit, m.currency)],
    [`${m.labels.vsPrev}`, `${m.vsPrev >= 0 ? "+" : ""}${m.vsPrev.toFixed(1)}%`],
  ];
  const cardW = (W - MX * 2 - 20 * 3) / 4;
  const cardH = 70;
  metrics.forEach((mt, i) => {
    const col = i % 4, row = Math.floor(i / 4);
    const x = MX + col * (cardW + 20);
    const y = 120 + row * (cardH + 14);
    doc.setDrawColor(230); doc.setFillColor(250); doc.roundedRect(x, y, cardW, cardH, 6, 6, "FD");
    doc.setTextColor(120); doc.setFontSize(8); doc.text(mt[0], x + 10, y + 18);
    doc.setTextColor(15); doc.setFontSize(13); doc.setFont("helvetica", "bold");
    doc.text(mt[1], x + 10, y + 44);
    doc.setFont("helvetica", "normal");
  });

  // Bar chart
  const chartTop = 290;
  const chartH = 160;
  const chartW = W - MX * 2;
  doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(15);
  doc.text("Monthly revenue", MX, chartTop - 10);
  doc.setDrawColor(220); doc.line(MX, chartTop + chartH, MX + chartW, chartTop + chartH);
  const max = Math.max(1, ...m.monthly.map((d) => d.value));
  const bw = (chartW - 20) / Math.max(1, m.monthly.length);
  m.monthly.forEach((d, i) => {
    const h = (d.value / max) * (chartH - 20);
    const x = MX + 10 + i * bw;
    const y = chartTop + chartH - h;
    doc.setFillColor(255, 107, 107);
    doc.roundedRect(x + 4, y, bw - 12, h, 3, 3, "F");
    doc.setFontSize(8); doc.setTextColor(110); doc.setFont("helvetica", "normal");
    doc.text(d.label, x + bw / 2, chartTop + chartH + 14, { align: "center" });
  });

  // Footer
  doc.setFontSize(8); doc.setTextColor(140);
  doc.text(`Generated ${new Date().toLocaleDateString()}`, MX, doc.internal.pageSize.getHeight() - 24);
  doc.text("hostlyb.com", W - MX, doc.internal.pageSize.getHeight() - 24, { align: "right" });

  doc.save(`hostlyb-performance-${m.propertyName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
