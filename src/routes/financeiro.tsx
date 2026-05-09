import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { Plus, Pencil, Trash2, Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";

export const Route = createFileRoute("/financeiro")({
  component: () => (
    <AppShell>
      <FinanceiroPage />
    </AppShell>
  ),
});

type Tx = {
  id: string;
  user_id: string;
  type: "entrada" | "saida";
  category: string;
  description: string;
  amount: number;
  date: string;
  status: "pago" | "pendente" | "cancelado";
  payment_method: string | null;
  property_id: string | null;
  notes: string | null;
};

const empty: Partial<Tx> = {
  type: "entrada",
  category: "hospedagem",
  description: "",
  amount: 0,
  date: new Date().toISOString().slice(0, 10),
  status: "pago",
  payment_method: "pix",
  notes: "",
};

function FinanceiroPage() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tx | null>(null);
  const [form, setForm] = useState<Partial<Tx>>(empty);
  const [filterType, setFilterType] = useState<"all" | "entrada" | "saida">("all");
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["transactions", session?.user.id, filterMonth],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const start = filterMonth + "-01";
      const [y, m] = filterMonth.split("-").map(Number);
      const endDate = new Date(y, m, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .gte("date", start)
        .lte("date", endDate)
        .order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Tx[];
    },
  });

  const filtered = useMemo(
    () => (filterType === "all" ? txs : txs.filter((t) => t.type === filterType)),
    [txs, filterType]
  );

  const totals = useMemo(() => {
    const ent = txs.filter((t) => t.type === "entrada" && t.status === "pago").reduce((a, b) => a + Number(b.amount), 0);
    const sai = txs.filter((t) => t.type === "saida" && t.status === "pago").reduce((a, b) => a + Number(b.amount), 0);
    return { entradas: ent, saidas: sai, saldo: ent - sai };
  }, [txs]);

  const save = useMutation({
    mutationFn: async () => {
      if (!session?.user.id) throw new Error("Não autenticado");
      const payload = { ...form, user_id: session.user.id, amount: Number(form.amount || 0) };
      if (editing) {
        const { error } = await supabase.from("transactions").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transactions").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setOpen(false);
      setEditing(null);
      setForm(empty);
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["transactions"] }),
  });

  const exportCSV = () => {
    const header = ["Data", "Tipo", "Categoria", "Descrição", "Valor", "Status", "Pagamento"];
    const rows = filtered.map((t) => [
      t.date, t.type, t.category, `"${(t.description || "").replace(/"/g, '""')}"`,
      Number(t.amount).toFixed(2).replace(".", ","), t.status, t.payment_method || "",
    ]);
    const csv = "\uFEFF" + [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-${filterMonth}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Financeiro</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={btnGhost}><Download size={16} /> Exportar CSV</button>
          <button onClick={() => { setEditing(null); setForm(empty); setOpen(true); }} style={btnPrimary}>
            <Plus size={16} /> Nova transação
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
        <Card title="Entradas" value={fmt(totals.entradas)} icon={<TrendingUp color="#16a34a" />} color="#16a34a" />
        <Card title="Saídas" value={fmt(totals.saidas)} icon={<TrendingDown color="#dc2626" />} color="#dc2626" />
        <Card title="Saldo" value={fmt(totals.saldo)} icon={<Wallet color="#2563eb" />} color={totals.saldo >= 0 ? "#16a34a" : "#dc2626"} />
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} style={inp} />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} style={inp}>
          <option value="all">Todas</option>
          <option value="entrada">Entradas</option>
          <option value="saida">Saídas</option>
        </select>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
          <thead style={{ background: "#f9fafb", textAlign: "left" }}>
            <tr>
              <th style={th}>Data</th><th style={th}>Tipo</th><th style={th}>Categoria</th>
              <th style={th}>Descrição</th><th style={th}>Valor</th><th style={th}>Status</th><th style={th}></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={7} style={{ padding: 24, textAlign: "center" }}>Carregando…</td></tr>}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>Nenhuma transação no período.</td></tr>
            )}
            {filtered.map((t) => (
              <tr key={t.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={td}>{t.date.split("-").reverse().join("/")}</td>
                <td style={td}>
                  <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 12, background: t.type === "entrada" ? "#dcfce7" : "#fee2e2", color: t.type === "entrada" ? "#166534" : "#991b1b" }}>
                    {t.type === "entrada" ? "Entrada" : "Saída"}
                  </span>
                </td>
                <td style={td}>{t.category}</td>
                <td style={td}>{t.description}</td>
                <td style={{ ...td, fontWeight: 600, color: t.type === "entrada" ? "#16a34a" : "#dc2626" }}>
                  {t.type === "saida" ? "-" : ""}{fmt(Number(t.amount))}
                </td>
                <td style={td}>{t.status}</td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => { setEditing(t); setForm(t); setOpen(true); }} style={iconBtn}><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm("Excluir transação?")) del.mutate(t.id); }} style={{ ...iconBtn, color: "#dc2626" }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} style={modalBg}>
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0 }}>{editing ? "Editar" : "Nova"} transação</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <Field label="Tipo">
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} style={inp}>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                </select>
              </Field>
              <Field label="Categoria">
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inp}>
                  <option value="hospedagem">Hospedagem</option>
                  <option value="limpeza">Limpeza</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="taxas">Taxas/Plataforma</option>
                  <option value="suprimentos">Suprimentos</option>
                  <option value="outros">Outros</option>
                </select>
              </Field>
              <Field label="Descrição">
                <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} style={inp} />
              </Field>
              <Field label="Valor (R$)">
                <input type="number" step="0.01" min={0} value={form.amount ?? 0} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} style={inp} />
              </Field>
              <Field label="Data">
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inp} />
              </Field>
              <Field label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} style={inp}>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </Field>
              <Field label="Método de pagamento">
                <select value={form.payment_method || ""} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} style={inp}>
                  <option value="pix">PIX</option>
                  <option value="cartao">Cartão</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="transferencia">Transferência</option>
                  <option value="outro">Outro</option>
                </select>
              </Field>
              <Field label="Observações">
                <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} style={inp} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setOpen(false)} style={btnGhost}>Cancelar</button>
              <button onClick={() => save.mutate()} disabled={save.isPending || !form.description} style={btnPrimary}>
                {save.isPending ? "Salvando…" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13 }}>{icon}{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 13 }}>
      <div style={{ marginBottom: 4, color: "#374151" }}>{label}</div>
      {children}
    </label>
  );
}

const inp: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, background: "#fff" };
const th: React.CSSProperties = { padding: "10px 12px", fontWeight: 600, fontSize: 12, color: "#6b7280", textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "10px 12px" };
const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#0a0a0a", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 };
const btnGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", color: "#0a0a0a", borderRadius: 8, border: "1px solid #d1d5db", cursor: "pointer", fontSize: 14 };
const iconBtn: React.CSSProperties = { padding: 6, background: "transparent", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" };
const modalBg: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 };
const modal: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto" };
