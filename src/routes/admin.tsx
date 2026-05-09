import { createFileRoute, redirect, Link } from "@tanstack/react-router";

import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAdminMetrics } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Hostly" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/login" as any });
    }
  },
  component: AdminPage,
});

function AdminPage() {
  const fetchMetrics = useServerFn(getAdminMetrics);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => fetchMetrics(),
    refetchInterval: 60_000,
  });

  if (isLoading) return <Centered>Carregando…</Centered>;
  if (error) return <Centered>Acesso negado ou erro: {(error as Error).message}</Centered>;
  if (!data) return <Centered>Sem dados</Centered>;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", padding: "32px 24px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>Admin</h1>
          <Link to="/" style={{ color: "#FF6B6B", fontWeight: 600 }}>← Home</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
          <Card label="Usuários totais" value={data.totalUsers} />
          <Card label="Ativos (login últimos 7d)" value={data.activeByLogin} accent="#00C896" />
          <Card label="Inativos" value={data.inactiveByLogin} accent="#9E9E9E" />
          <Card label="Assinaturas pagas" value={data.paidCount} accent="#FF6B6B" />
          <Card label="Em trial" value={data.trialingCount} accent="#4A9EFF" />
          <Card label="MRR estimado (BRL)" value={`R$ ${data.estimatedMrrBrl.toFixed(2)}`} accent="#FF6B6B" />
        </div>

        <section style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #EFEFEF" }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#111", marginBottom: 12 }}>
            Usuários sem usar há +2 dias ({data.dormantUsers.length})
          </h2>
          <p style={{ color: "#9E9E9E", fontSize: 13, marginBottom: 16 }}>
            E-mails de reativação não estão configurados ainda — esta lista é apenas informativa.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F7F7F7", textAlign: "left" }}>
                  <th style={th}>E-mail</th>
                  <th style={th}>Último login</th>
                </tr>
              </thead>
              <tbody>
                {data.dormantUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                    <td style={td}>{u.email ?? "—"}</td>
                    <td style={td}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString("pt-BR") : "Nunca"}</td>
                  </tr>
                ))}
                {data.dormantUsers.length === 0 && (
                  <tr><td style={{ ...td, color: "#9E9E9E" }} colSpan={2}>Ninguém na lista 🎉</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 12px", fontWeight: 700, color: "#616161", fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: "12px", color: "#212121" };

function Card({ label, value, accent = "#111" }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #EFEFEF" }}>
      <p style={{ color: "#9E9E9E", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: accent }}>{value}</p>
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#616161" }}>{children}</div>;
}
