import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAdminMetrics } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Hostlyb" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" as any });
  },
  component: AdminPage,
});
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" as any });
  },
  component: AdminPage,
});

function AdminPage() {
  const fetchMetrics = useServerFn(getAdminMetrics);
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => fetchMetrics(),
    refetchInterval: 30_000,
  });
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!data?.users) return [];
    const t = q.trim().toLowerCase();
    if (!t) return data.users;
    return data.users.filter((u: any) =>
      [u.email, u.phone, u.name].some((v) => String(v ?? "").toLowerCase().includes(t))
    );
  }, [data, q]);

  if (isLoading) return <Centered>Carregando…</Centered>;
  if (error) return <Centered>Acesso negado: {(error as Error).message}</Centered>;
  if (!data) return <Centered>Sem dados</Centered>;

  const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", padding: "32px 24px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>Admin · Hostlyb</h1>
          <Link to="/" style={{ color: "#FF6B6B", fontWeight: 600 }}>← Home</Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 24 }}>
          <Card label="Usuários cadastrados" value={data.totalUsers} />
          <Card label="Pagantes ativos" value={data.payingUsers} accent="#00C896" />
          <Card label="MRR estimado" value={fmtBRL(data.estimatedMrrBrl)} accent="#FF6B6B" />
        </div>

        <section style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #EFEFEF" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>Contas ({filtered.length})</h2>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar email, telefone ou nome…"
              style={{ padding: "8px 12px", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14, minWidth: 240 }}
            />
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F7F7F7", textAlign: "left" }}>
                  <th style={th}>Email</th>
                  <th style={th}>Telefone</th>
                  <th style={th}>Nome</th>
                  <th style={th}>Cadastro</th>
                  <th style={th}>Pagante</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                    <td style={td}>{u.email}</td>
                    <td style={td}>{u.phone}</td>
                    <td style={td}>{u.name}</td>
                    <td style={{ ...td, color: "#616161" }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td style={td}>
                      {u.is_paying ? (
                        <span style={{ background: "#E6F9F2", color: "#00875A", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>Sim</span>
                      ) : (
                        <span style={{ color: "#9E9E9E" }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!filtered.length && (
                  <tr><td colSpan={5} style={{ ...td, textAlign: "center", color: "#9E9E9E" }}>Sem resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ label, value, accent = "#111" }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #EFEFEF" }}>
      <p style={{ color: "#9E9E9E", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 12px", fontWeight: 700, color: "#616161", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: "10px 12px", color: "#212121" };

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#616161" }}>{children}</div>;
}
