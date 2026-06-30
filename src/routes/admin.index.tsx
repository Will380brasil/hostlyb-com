import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminMetrics } from "@/lib/admin.functions";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview · Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: Overview,
});

function Overview() {
  const fetchMetrics = useServerFn(getAdminMetrics);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-metrics"], queryFn: () => fetchMetrics(), refetchInterval: 30_000,
  });
  if (isLoading || !data) return <p style={{ color: "#64748b" }}>Loading…</p>;
  const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
  const pct = (n: number) => data.totalUsers ? Math.round((n / data.totalUsers) * 100) : 0;

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Overview</h1>
      <Row>
        <Stat label="Total Users" value={data.totalUsers} />
        <Stat label="Paying Users" value={data.payingUsers} accent="#00C896" />
        <Stat label="Free Users" value={data.freeUsers} />
        <Stat label="MRR" value={fmtBRL(data.estimatedMrrBrl)} accent="#FF6B6B" />
      </Row>
      <Row>
        <Stat label="Active 7d" value={data.active7} accent="#4ade80" />
        <Stat label="Inactive 3d+" value={data.inactive3} accent="#facc15" />
        <Stat label="Inactive 7d+" value={data.inactive7} accent="#f87171" />
        <Stat label="Churn risk" value={data.churnRisk} accent="#fb923c" />
      </Row>
      <Row>
        <Stat label={`Free · ${pct(data.freeUsers)}%`} value={data.freeUsers} />
        <Stat label={`Starter · ${pct((data as any).starterUsers ?? 0)}%`} value={(data as any).starterUsers ?? 0} accent="#10b981" />
        <Stat label={`Pro · ${pct(data.proUsers)}%`} value={data.proUsers} accent="#3b82f6" />
        <Stat label={`Premium · ${pct(data.premiumUsers)}%`} value={data.premiumUsers} accent="#a855f7" />
      </Row>
      <Row>
        <Stat label="Updated" value={new Date(data.generatedAt).toLocaleTimeString("pt-BR")} />
      </Row>
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb", marginTop: 8 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 12 }}>New signups · last 30 days</h2>
        <div style={{ width: "100%", height: 240 }}>
          <ResponsiveContainer>
            <LineChart data={data.signupSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="signups" stroke="#FF6B6B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>{children}</div>;
}
function Stat({ label, value, accent = "#0F172A" }: { label: string; value: any; accent?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: "1px solid #e5e7eb" }}>
      <p style={{ color: "#94a3b8", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: accent }}>{value}</p>
    </div>
  );
}
