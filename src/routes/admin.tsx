import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAdminMetrics, listAdminUsers, addAdminUser, removeAdminUser } from "@/lib/admin.functions";
import { Download, Plus, Trash2, Shield } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Hostlyb" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" as any });
    const { data: row } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (!row) throw redirect({ to: "/app" as any });
  },
  component: AdminPage,
});

function AdminPage() {
  const fetchMetrics = useServerFn(getAdminMetrics);
  const fetchAdmins = useServerFn(listAdminUsers);
  const addAdmin = useServerFn(addAdminUser);
  const removeAdmin = useServerFn(removeAdminUser);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-metrics"],
    queryFn: () => fetchMetrics(),
    refetchInterval: 30_000,
  });
  const { data: admins = [] } = useQuery({
    queryKey: ["admin-list"],
    queryFn: () => fetchAdmins(),
  });
  const { data: leads = [] } = useQuery({
    queryKey: ["demo-leads"],
    queryFn: async () => {
      const { data } = await supabase.from("demo_leads").select("*").order("created_at", { ascending: false }).limit(500);
      return data ?? [];
    },
    refetchInterval: 60_000,
  });

  const [q, setQ] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");

  const filtered = useMemo(() => {
    if (!data?.users) return [];
    const t = q.trim().toLowerCase();
    if (!t) return data.users;
    return data.users.filter((u: any) =>
      [u.email, u.phone, u.name].some((v) => String(v ?? "").toLowerCase().includes(t))
    );
  }, [data, q]);

  const exportLeadsCsv = () => {
    if (!leads.length) return toast.info("Nenhum lead para exportar.");
    const header = ["email", "phone", "source", "user_agent", "access_count", "created_at", "last_access_at"];
    const rows = leads.map((l: any) => header.map((k) => csvCell(l[k])).join(","));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hostlyb-demo-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onAddAdmin = async () => {
    if (!newAdminEmail) return;
    try {
      await addAdmin({ data: { email: newAdminEmail } });
      toast.success("Admin adicionado!");
      setNewAdminEmail("");
      qc.invalidateQueries({ queryKey: ["admin-list"] });
    } catch (e: any) { toast.error(e.message || "Falha ao adicionar"); }
  };
  const onRemoveAdmin = async (user_id: string, email: string) => {
    if (!confirm(`Remover acesso admin de ${email}?`)) return;
    try {
      await removeAdmin({ data: { user_id } });
      toast.success("Removido");
      qc.invalidateQueries({ queryKey: ["admin-list"] });
    } catch (e: any) { toast.error(e.message || "Falha"); }
  };

  if (isLoading) return <Centered>Carregando…</Centered>;
  if (error) return <Centered>Acesso negado: {(error as Error).message}</Centered>;
  if (!data) return <Centered>Sem dados</Centered>;

  const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", padding: "32px 24px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111" }}>Admin · Hostlyb</h1>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to={"/app" as any} style={{ color: "#616161", fontSize: 13, alignSelf: "center" }}>← App</Link>
            <Link to="/" style={{ color: "#FF6B6B", fontWeight: 600 }}>← Home</Link>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 24 }}>
          <Card label="Usuários cadastrados" value={data.totalUsers} />
          <Card label="Pagantes ativos" value={data.payingUsers} accent="#00C896" />
          <Card label="MRR estimado" value={fmtBRL(data.estimatedMrrBrl)} accent="#FF6B6B" />
          <Card label="Leads da Demo" value={leads.length} accent="#FFB347" />
        </div>

        <Section title={`Contas (${filtered.length})`}>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar email, telefone ou nome…"
            style={{ padding: "8px 12px", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14, minWidth: 240, marginBottom: 12 }} />
          <Table headers={["Email", "Telefone", "Nome", "Cadastro", "Pagante"]}>
            {filtered.map((u: any) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.phone}</td>
                <td style={td}>{u.name}</td>
                <td style={{ ...td, color: "#616161" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                <td style={td}>{u.is_paying
                  ? <span style={{ background: "#E6F9F2", color: "#00875A", padding: "2px 8px", borderRadius: 999, fontWeight: 600 }}>Sim</span>
                  : <span style={{ color: "#9E9E9E" }}>—</span>}</td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section title={`Leads da Demo (${leads.length})`} action={
          <button onClick={exportLeadsCsv}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#111", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Download size={14} /> Exportar CSV
          </button>
        }>
          <Table headers={["Email", "Telefone", "Acessos", "Origem", "Data"]}>
            {leads.map((l: any) => (
              <tr key={l.id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                <td style={td}>{l.email}</td>
                <td style={td}>{l.phone}</td>
                <td style={td}>{l.access_count ?? 1}</td>
                <td style={{ ...td, color: "#616161" }}>{l.source}</td>
                <td style={{ ...td, color: "#616161" }}>{new Date(l.created_at).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </Table>
        </Section>

        <Section title={`Administradores (${admins.length})`}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            <input type="email" placeholder="email@dominio.com" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)}
              style={{ flex: "1 1 240px", padding: "8px 12px", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 14 }} />
            <button onClick={onAddAdmin}
              style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FF6B6B", color: "#fff", border: "none", padding: "8px 14px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
              <Plus size={14} /> Adicionar admin
            </button>
          </div>
          <Table headers={["Email", "Adicionado em", ""]}>
            {admins.map((a: any) => (
              <tr key={a.user_id} style={{ borderBottom: "1px solid #EFEFEF" }}>
                <td style={td}><Shield size={12} style={{ display: "inline", marginRight: 6, color: "#FF6B6B" }} />{a.email}</td>
                <td style={{ ...td, color: "#616161" }}>{new Date(a.created_at).toLocaleDateString("pt-BR")}</td>
                <td style={{ ...td, textAlign: "right" }}>
                  <button onClick={() => onRemoveAdmin(a.user_id, a.email)}
                    style={{ background: "transparent", border: "none", color: "#9E9E9E", cursor: "pointer" }} title="Remover admin">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>
          <p style={{ fontSize: 11, color: "#9E9E9E", marginTop: 10 }}>
            O usuário precisa já ter conta cadastrada antes de virar admin.
          </p>
        </Section>
      </div>
    </div>
  );
}

function csvCell(v: any): string {
  if (v == null) return "";
  const s = String(v).replace(/"/g, '""');
  return /[",\n]/.test(s) ? `"${s}"` : s;
}

function Card({ label, value, accent = "#111" }: { label: string; value: string | number; accent?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #EFEFEF" }}>
      <p style={{ color: "#9E9E9E", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 800, color: accent, lineHeight: 1.1 }}>{value}</p>
    </div>
  );
}
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1px solid #EFEFEF", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111" }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F7F7F7", textAlign: "left" }}>
            {headers.map((h) => <th key={h} style={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
const th: React.CSSProperties = { padding: "10px 12px", fontWeight: 700, color: "#616161", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: "10px 12px", color: "#212121" };
function Centered({ children }: { children: React.ReactNode }) {
  return <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", color: "#616161" }}>{children}</div>;
}
