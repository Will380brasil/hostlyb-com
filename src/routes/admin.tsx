import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAdminMetrics } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Hostly" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" as any });
  },
  component: AdminPage,
});

function AdminPage() {
  const fetchMetrics = useServerFn(getAdminMetrics);
  const { data, isLoading, error, dataUpdatedAt } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => fetchMetrics(),
    refetchInterval: 15_000, // live: refresh every 15s
  });

  if (isLoading) return <Centered>Carregando…</Centered>;
  if (error) return <Centered>Acesso negado ou erro: {(error as Error).message}</Centered>;
  if (!data) return <Centered>Sem dados</Centered>;

  const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const updated = new Date(dataUpdatedAt).toLocaleTimeString("pt-BR");
  const usagePct = data.totalUsers ? Math.round((data.last7d / data.totalUsers) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", padding: "32px 24px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>Admin · Painel ao vivo</h1>
          <Link to="/" style={{ color: "#FF6B6B", fontWeight: 600 }}>← Home</Link>
        </div>
        <p style={{ color: "#9E9E9E", fontSize: 12, marginBottom: 24 }}>
          Atualizado às {updated} · auto-refresh a cada 15s
        </p>

        <Section title="Atividade ao vivo">
          <Grid>
            <Card label="🟢 Online agora (≤5 min)" value={data.online} accent="#00C896" big />
            <Card label="Sessão ativa (≤15 min)" value={data.activeSession} accent="#00C896" />
            <Card label="Ativos hoje (24h)" value={data.last24h} accent="#4A9EFF" />
            <Card label="Ativos 7 dias" value={data.last7d} accent="#4A9EFF" />
          </Grid>
        </Section>

        <Section title="Base de usuários">
          <Grid>
            <Card label="Usuários totais" value={data.totalUsers} />
            <Card label="Ativos 30 dias" value={data.last30d} accent="#4A9EFF" />
            <Card label="Inativos +2 dias" value={data.dormant} accent="#FFB347" />
            <Card label="Nunca logaram" value={data.neverLoggedIn} accent="#9E9E9E" />
            <Card label={`Engajamento 7d`} value={`${usagePct}%`} accent="#00C896" />
            <Card label="Organizações" value={data.organizationsCount} />
          </Grid>
        </Section>

        <Section title="Cadastros">
          <Grid>
            <Card label="Novos hoje" value={data.signupsLast24h} accent="#00C896" />
            <Card label="Novos em 7 dias" value={data.signupsLast7d} accent="#4A9EFF" />
            <Card label="Novos em 30 dias" value={data.signupsLast30d} />
          </Grid>
        </Section>

        <Section title="Receita & assinaturas (live)">
          <Grid>
            <Card label="Assinaturas pagas" value={data.paidCount} accent="#FF6B6B" />
            <Card label="Em trial" value={data.trialingCount} accent="#4A9EFF" />
            <Card label="Total ativas" value={data.activeSubsCount} accent="#00C896" />
            <Card label="Cancelaram (30d)" value={data.churnedLast30d} accent="#FFB347" />
            <Card label="MRR estimado" value={fmtBRL(data.estimatedMrrBrl)} accent="#FF6B6B" big />
            <Card label="ARR estimado" value={fmtBRL(data.estimatedMrrBrl * 12)} accent="#FF6B6B" />
          </Grid>
        </Section>

        <Section title="Uso da plataforma">
          <Grid>
            <Card label="Imóveis cadastrados" value={data.propertiesCount} />
            <Card label="Limpezas registradas" value={data.cleaningJobsCount} />
            <Card label="Hóspedes cadastrados" value={data.guestsCount} />
            <Card label="GMV total (hóspedes)" value={fmtBRL(data.guestRevenueAll)} accent="#00C896" />
            <Card label="GMV últimos 30d" value={fmtBRL(data.guestRevenue30d)} accent="#00C896" />
          </Grid>
        </Section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
          <Panel title={`🟢 Online agora (${data.onlineUsers.length})`}>
            <UserTable rows={data.onlineUsers} dateLabel="Visto há" highlightOnline />
          </Panel>
          <Panel title={`Cadastros recentes (${data.recentSignups.length})`}>
            <UserTable rows={data.recentSignups.map((u) => ({ ...u, last_sign_in_at: u.created_at }))} dateLabel="Cadastrado" />
          </Panel>
        </div>

        <Panel title={`Inativos há +2 dias (${data.dormantUsers.length})`}>
          <p style={{ color: "#9E9E9E", fontSize: 12, marginBottom: 12 }}>
            E-mails de reativação não estão configurados ainda — esta lista é apenas informativa.
          </p>
          <UserTable rows={data.dormantUsers} dateLabel="Último login" />
        </Panel>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 13, fontWeight: 700, color: "#616161", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>{title}</h2>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>{children}</div>;
}

function Card({ label, value, accent = "#111", big = false }: { label: string; value: string | number; accent?: string; big?: boolean }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #EFEFEF" }}>
      <p style={{ color: "#9E9E9E", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: big ? 30 : 22, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #EFEFEF", marginTop: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 12 }}>{title}</h2>
      {children}
    </section>
  );
}

function UserTable({ rows, dateLabel, highlightOnline = false }: { rows: any[]; dateLabel: string; highlightOnline?: boolean }) {
  if (!rows.length) return <p style={{ color: "#9E9E9E", fontSize: 13 }}>Vazio.</p>;
  const now = Date.now();
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F7F7F7", textAlign: "left" }}>
            <th style={th}>E-mail</th>
            <th style={th}>{dateLabel}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((u) => {
            const ts = u.last_sign_in_at ? new Date(u.last_sign_in_at).getTime() : 0;
            const ago = ts ? humanAgo(now - ts) : "Nunca";
            return (
              <tr key={u.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                <td style={td}>
                  {highlightOnline && <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 999, background: "#00C896", marginRight: 8 }} />}
                  {u.email ?? "—"}
                </td>
                <td style={{ ...td, color: "#616161" }}>{ago}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function humanAgo(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 60) return `${s}s atrás`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  const d = Math.floor(h / 24);
  return `${d}d atrás`;
}

const th: React.CSSProperties = { padding: "10px 12px", fontWeight: 700, color: "#616161", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: "10px 12px", color: "#212121" };

function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#616161" }}>{children}</div>;
}
