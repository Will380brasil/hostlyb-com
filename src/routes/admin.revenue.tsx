import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getRevenueMetrics, getAdminMetrics } from "@/lib/admin.functions";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Trophy } from "lucide-react";

export const Route = createFileRoute("/admin/revenue")({
  head: () => ({ meta: [{ title: "Revenue · Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: RevenuePage,
});

function RevenuePage() {
  const fetchRev = useServerFn(getRevenueMetrics);
  const fetchMetrics = useServerFn(getAdminMetrics);
  const { data: rev } = useQuery({ queryKey: ["admin-revenue"], queryFn: () => fetchRev(), refetchInterval: 60_000 });
  const { data: m } = useQuery({ queryKey: ["admin-metrics"], queryFn: () => fetchMetrics() });
  if (!rev || !m) return <p style={{ color: "#64748b" }}>Loading…</p>;

  const fmt = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const conv = m.totalUsers ? Math.round((m.payingUsers / m.totalUsers) * 1000) / 10 : 0;
  const top = (m.users as any[]).filter(u => u.is_paying).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")).slice(0, 20);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Plans &amp; Revenue</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 16 }}>
        <Stat label="MRR" value={fmt(rev.mrrBrl)} accent="#FF6B6B" />
        <Stat label="Paying users" value={rev.payingCount} accent="#00C896" />
        <Stat label="Conversion" value={`${conv}%`} accent="#3b82f6" />
        <Stat label="Premium" value={m.premiumUsers} accent="#a855f7" />
      </div>
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb", marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>MRR · last 12 months</h2>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={rev.series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: any) => fmt(Number(v))} />
              <Bar dataKey="mrr" fill="#FF6B6B" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <Trophy size={16} color="#facc15" /> Paying customers
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>{["Email", "Plan", "Since"].map(h => <th key={h} style={{ padding: "10px 12px", fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {top.map((u: any) => (
              <tr key={u.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px" }}>{u.email}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.plan_tier}</td>
                <td style={{ padding: "10px 12px", color: "#64748b" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: any; accent: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
      <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: accent }}>{value}</p>
    </div>
  );
}
