import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { sanitize } from "@/lib/sanitize";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Download, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n";

export const Route = createFileRoute("/financeiro")({
  component: () => (
    <AppShell>
      <FinanceiroPage />
    </AppShell>
  ),
});

const CATEGORIES = {
  entrada: ["Receita plataforma", "Receita Booking", "Receita aluguel direto", "Receita VRBO", "Taxa de limpeza cobrada", "Depósito caução", "Outros recebimentos"],
  saida: ["Limpeza / faxina", "Manutenção", "Reparo emergencial", "Amenities / consumíveis", "Energia", "Água / gás", "Internet", "Condomínio", "IPTU", "Seguro", "Taxa plataforma", "Taxa Booking", "Mobiliário", "Marketing", "Outros gastos"],
};

const txSchema = z.object({
  type: z.enum(["entrada", "saida"], { required_error: "Tipo é obrigatório" }),
  amount: z.number({ invalid_type_error: "Valor inválido" }).positive("Valor deve ser maior que zero").max(9999999, "Valor muito alto"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  category: z.string().min(1, "Selecione uma categoria"),
  status: z.enum(["pago", "pendente", "cancelado"]),
  description: z.string().max(500, "Máximo 500 caracteres").optional(),
  payment_method: z.string().nullable().optional(),
  property_id: z.string().uuid().nullable().optional(),
  guest_id: z.string().uuid().nullable().optional(),
  cleaning_job_id: z.string().uuid().nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});

type Tx = z.infer<typeof txSchema> & { id: string; user_id: string; origin?: string | null; guest_id?: string | null; cleaning_job_id?: string | null };

const empty: Partial<Tx> = {
  type: "entrada", category: "", description: "", amount: 0,
  date: new Date().toISOString().slice(0, 10), status: "pago", payment_method: "pix", notes: "",
  property_id: null, guest_id: null, cleaning_job_id: null,
};

function FinanceiroPage() {
  const { session } = useAuth();
  const { currency, lang } = useLocale();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Tx | null>(null);
  const [form, setForm] = useState<Partial<Tx>>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filterType, setFilterType] = useState<"all" | "entrada" | "saida">("all");
  const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const { data: txs = [], isLoading } = useQuery({
    queryKey: ["transactions", session?.user.id, filterMonth],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const start = filterMonth + "-01";
      const [y, m] = filterMonth.split("-").map(Number);
      const endDate = new Date(y, m, 0).toISOString().slice(0, 10);
      const { data, error } = await supabase.from("transactions").select("*").gte("date", start).lte("date", endDate).order("date", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Tx[];
    },
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["fin-properties", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => (await supabase.from("properties").select("id, name").eq("archived", false).order("name")).data ?? [],
  });

  const { data: guests = [] } = useQuery({
    queryKey: ["fin-guests", form.property_id],
    enabled: !!form.property_id,
    queryFn: async () => (await supabase.from("guests").select("id, name, checkin_date, checkout_date").eq("property_id", form.property_id!).order("checkin_date", { ascending: false }).limit(20)).data ?? [],
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ["fin-jobs", form.property_id],
    enabled: !!form.property_id,
    queryFn: async () => (await supabase.from("cleaning_jobs").select("id, scheduled_date, cleaners(name)").eq("property_id", form.property_id!).order("scheduled_date", { ascending: false }).limit(20)).data ?? [],
  });

  const filtered = useMemo(() => (filterType === "all" ? txs : txs.filter((t) => t.type === filterType)), [txs, filterType]);

  const totals = useMemo(() => {
    const ent = txs.filter((t) => t.type === "entrada" && t.status === "pago").reduce((a, b) => a + Number(b.amount), 0);
    const sai = txs.filter((t) => t.type === "saida" && t.status === "pago").reduce((a, b) => a + Number(b.amount), 0);
    return { entradas: ent, saidas: sai, saldo: ent - sai };
  }, [txs]);

  const save = useMutation({
    mutationFn: async () => {
      if (!session?.user.id) throw new Error("Não autenticado");
      const sanitized = {
        ...form,
        amount: Number(form.amount || 0),
        description: sanitize.text(form.description, 500),
        notes: sanitize.text(form.notes ?? "", 1000) || null,
        property_id: form.property_id || null,
        guest_id: form.guest_id || null,
        cleaning_job_id: form.cleaning_job_id || null,
      };
      const parsed = txSchema.safeParse(sanitized);
      if (!parsed.success) {
        const errs: Record<string, string> = {};
        parsed.error.errors.forEach((e) => { errs[e.path[0] as string] = e.message; });
        setErrors(errs);
        throw new Error("validation");
      }
      setErrors({});
      const payload = { ...parsed.data, user_id: session.user.id };
      if (editing) {
        const { error } = await supabase.from("transactions").update(payload as any).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("transactions").insert(payload as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["transactions"] });
      setOpen(false); setEditing(null); setForm(empty); setErrors({});
      toast.success("Transação salva");
    },
    onError: (e: any) => { if (e.message !== "validation") toast.error(e.message ?? "Erro ao salvar"); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["transactions"] }); toast.success("Removida"); },
  });

  const exportCSV = () => {
    const header = ["Data", "Tipo", "Categoria", "Descrição", "Valor", "Status", "Pagamento"];
    const rows = filtered.map((t) => [t.date, t.type, t.category, `"${(t.description || "").replace(/"/g, '""')}"`, Number(t.amount).toFixed(2).replace(".", ","), t.status, t.payment_method || ""]);
    const csv = "\uFEFF" + [header.join(";"), ...rows.map((r) => r.join(";"))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `financeiro-${filterMonth}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const fmt = (n: number) => formatMoney(n, currency, lang);
  const categories = (form.type === "saida" ? CATEGORIES.saida : CATEGORIES.entrada);

  const originLabel = (o?: string | null) => {
    if (o === "auto:guest") return { text: "Reserva", bg: "#dbeafe", fg: "#1e40af" };
    if (o === "auto:cleaning") return { text: "Limpeza", bg: "#fef3c7", fg: "#92400e" };
    return { text: "Manual", bg: "#f3f4f6", fg: "#374151" };
  };

  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Financeiro</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={exportCSV} style={btnGhost}><Download size={16} /> Exportar CSV</button>
          <button onClick={() => { setEditing(null); setForm(empty); setErrors({}); setOpen(true); }} style={btnPrimary}>
            <Plus size={16} /> Nova transação
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 16 }}>
        <Card title="Entradas" value={fmt(totals.entradas)} icon={<TrendingUp color="#15803d" />} color="#15803d" />
        <Card title="Saídas" value={fmt(totals.saidas)} icon={<TrendingDown color="#991b1b" />} color="#991b1b" />
        <Card title="Saldo" value={fmt(totals.saldo)} icon={<Wallet color="#0f0f0f" />} color={totals.saldo >= 0 ? "#15803d" : "#991b1b"} />
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
            <tr><th style={th}>Data</th><th style={th}>Tipo</th><th style={th}>Categoria</th><th style={th}>Origem</th><th style={th}>Descrição</th><th style={th}>Valor</th><th style={th}>Status</th><th style={th}></th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={8} style={{ padding: 24, textAlign: "center" }}>Carregando…</td></tr>}
            {!isLoading && filtered.length === 0 && (<tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>Nenhuma transação no período.</td></tr>)}
            {filtered.map((t) => {
              const orig = originLabel(t.origin);
              const valueColor = t.type === "entrada" ? "#15803d" : "#991b1b";
              const refId = (t.guest_id || t.cleaning_job_id || "").slice(0, 6);
              return (
              <tr key={t.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ ...td, color: "#0f0f0f" }}>{t.date.split("-").reverse().join("/")}</td>
                <td style={td}><span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 12, background: t.type === "entrada" ? "#dcfce7" : "#fee2e2", color: t.type === "entrada" ? "#15803d" : "#991b1b" }}>{t.type === "entrada" ? "Entrada" : "Saída"}</span></td>
                <td style={{ ...td, color: "#0f0f0f" }}>{t.category}</td>
                <td style={td}>
                  <span title={refId ? `#${refId}` : undefined} style={{ padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: orig.bg, color: orig.fg }}>
                    {orig.text}{refId ? ` #${refId}` : ""}
                  </span>
                </td>
                <td style={{ ...td, color: "#0f0f0f" }}>{t.description}</td>
                <td style={{ ...td, fontWeight: 700, color: valueColor }}>{t.type === "saida" ? "-" : ""}{fmt(Number(t.amount))}</td>
                <td style={{ ...td, color: "#0f0f0f" }}>{t.status}</td>
                <td style={td}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => { setEditing(t); setForm(t); setErrors({}); setOpen(true); }} style={iconBtn}><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm("Excluir transação?")) del.mutate(t.id); }} style={{ ...iconBtn, color: "#991b1b" }}><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} style={modalBg}>
          <div onClick={(e) => e.stopPropagation()} style={modal}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginTop: 0 }}>{editing ? "Editar" : "Nova"} transação</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <Field label="Tipo *" error={errors.type}>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["entrada", "saida"] as const).map((tp) => {
                    const sel = form.type === tp;
                    const c = tp === "entrada" ? "#16a34a" : "#dc2626";
                    return (
                      <button key={tp} type="button"
                        onClick={() => setForm({ ...form, type: tp, category: "", guest_id: null, cleaning_job_id: null })}
                        style={{ flex: 1, padding: 10, background: sel ? c + "18" : "#f7f7f7", border: `2px solid ${sel ? c : "transparent"}`, borderRadius: 8, fontWeight: 700, color: sel ? c : "#616161", cursor: "pointer" }}>
                        {tp === "entrada" ? "↑ Entrada" : "↓ Saída"}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Categoria *" error={errors.category}>
                <select value={form.category || ""} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inpErr(!!errors.category)}>
                  <option value="">Selecione…</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>

              <Field label="Descrição" error={errors.description}>
                <input value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={500} style={inpErr(!!errors.description)} />
              </Field>

              <Field label="Valor (R$) *" error={errors.amount}>
                <input type="number" step="0.01" min={0} value={form.amount ?? 0} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} style={inpErr(!!errors.amount)} />
              </Field>

              <Field label="Data *" error={errors.date}>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={inpErr(!!errors.date)} />
              </Field>

              <Field label="Status *" error={errors.status}>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} style={inpErr(!!errors.status)}>
                  <option value="pago">Pago</option><option value="pendente">Pendente</option><option value="cancelado">Cancelado</option>
                </select>
              </Field>

              <Field label="Método de pagamento">
                <select value={form.payment_method || ""} onChange={(e) => setForm({ ...form, payment_method: e.target.value })} style={inp}>
                  <option value="pix">PIX</option><option value="cartao">Cartão</option><option value="dinheiro">Dinheiro</option><option value="transferencia">Transferência</option><option value="outro">Outro</option>
                </select>
              </Field>

              <div style={{ borderTop: "1px solid #e5e7eb", margin: "8px 0 4px", paddingTop: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", margin: 0, textTransform: "uppercase" }}>Vincular (opcional)</p>
              </div>

              <Field label="Imóvel">
                <select value={form.property_id || ""} onChange={(e) => setForm({ ...form, property_id: e.target.value || null, guest_id: null, cleaning_job_id: null })} style={inp}>
                  <option value="">Nenhum</option>
                  {(properties as any[]).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </Field>

              {form.property_id && guests.length > 0 && (
                <Field label="Hóspede">
                  <select value={form.guest_id || ""} onChange={(e) => setForm({ ...form, guest_id: e.target.value || null })} style={inp}>
                    <option value="">Nenhum</option>
                    {(guests as any[]).map((g) => <option key={g.id} value={g.id}>{g.name} ({g.checkin_date} → {g.checkout_date})</option>)}
                  </select>
                </Field>
              )}

              {form.property_id && form.type === "saida" && jobs.length > 0 && (
                <Field label="Limpeza">
                  <select value={form.cleaning_job_id || ""} onChange={(e) => setForm({ ...form, cleaning_job_id: e.target.value || null })} style={inp}>
                    <option value="">Nenhuma</option>
                    {(jobs as any[]).map((j) => <option key={j.id} value={j.id}>{j.scheduled_date} — {j.cleaners?.name ?? "Faxineira"}</option>)}
                  </select>
                </Field>
              )}

              <Field label="Observações">
                <textarea value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} maxLength={1000} style={inp} />
              </Field>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => setOpen(false)} style={btnGhost}>Cancelar</button>
              <button onClick={() => save.mutate()} disabled={save.isPending} style={btnPrimary}>
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", fontSize: 13 }}>
      <div style={{ marginBottom: 4, color: "#374151", fontWeight: 500 }}>{label}</div>
      {children}
      {error && <div style={{ marginTop: 4, color: "#dc2626", fontSize: 12, fontWeight: 500 }}>⚠ {error}</div>}
    </label>
  );
}

const inp: React.CSSProperties = { width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: 8, fontSize: 14, background: "#fff" };
const inpErr = (err: boolean): React.CSSProperties => ({ ...inp, borderColor: err ? "#dc2626" : "#d1d5db", background: err ? "#fef2f2" : "#fff" });
const th: React.CSSProperties = { padding: "10px 12px", fontWeight: 600, fontSize: 12, color: "#6b7280", textTransform: "uppercase" };
const td: React.CSSProperties = { padding: "10px 12px" };
const btnPrimary: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#0a0a0a", color: "#fff", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600 };
const btnGhost: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", color: "#0a0a0a", borderRadius: 8, border: "1px solid #d1d5db", cursor: "pointer", fontSize: 14 };
const iconBtn: React.CSSProperties = { padding: 6, background: "transparent", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer" };
const modalBg: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16 };
const modal: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 20, width: "100%", maxWidth: 480, maxHeight: "90vh", overflow: "auto" };
