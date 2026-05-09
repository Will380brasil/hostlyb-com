import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney, currencySymbol } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";
import { Plus, Phone, MessageCircle, Star, Clock, Check, X, ArrowLeft, Mail, AlertTriangle, Link2, Copy } from "lucide-react";

export const Route = createFileRoute("/limpezas")({
  head: () => ({ meta: [{ title: "Limpezas — Hostly" }, { name: "description", content: "Agenda de limpezas." }] }),
  component: CleaningsPage,
});

const defaultChecklist = [
  "Sala de estar / Living room",
  "Cozinha completa / Kitchen",
  "Banheiros / Bathrooms",
  "Quartos / Bedrooms",
  "Troca de roupas de cama / Bed linen change",
  "Troca de toalhas / Towel change",
  "Reposição de amenities / Restock amenities",
  "Aspiração / Vacuum",
  "Lixo retirado / Trash out",
  "Janelas e espelhos / Windows & mirrors",
  "Verificar objetos esquecidos / Check forgotten items",
];

const PAYMENT_METHODS = [
  { v: "pix", l: "PIX (Brasil)" },
  { v: "iban", l: "IBAN / SEPA (Europa)" },
  { v: "mbway", l: "MB WAY (Portugal)" },
  { v: "zelle", l: "Zelle (USA)" },
  { v: "venmo", l: "Venmo (USA)" },
  { v: "cashapp", l: "Cash App (USA)" },
  { v: "paypal", l: "PayPal" },
  { v: "wise", l: "Wise" },
  { v: "revolut", l: "Revolut" },
  { v: "bank", l: "Transferência bancária / Bank transfer" },
  { v: "cash", l: "Dinheiro / Cash" },
  { v: "other", l: "Outro / Other" },
];

function paymentPlaceholder(m: string) {
  switch (m) {
    case "pix": return "Chave PIX (CPF, e-mail, telefone ou aleatória)";
    case "iban": return "PT50 0000 0000 0000 0000 0000 0";
    case "mbway": return "+351 9XX XXX XXX";
    case "zelle": return "E-mail ou telefone Zelle";
    case "venmo": return "@usuario";
    case "cashapp": return "$cashtag";
    case "paypal": return "E-mail PayPal";
    case "wise": return "E-mail / @tag Wise";
    case "revolut": return "@revtag ou telefone";
    case "bank": return "Banco, agência, conta";
    case "cash": return "Pagamento em dinheiro";
    default: return "Detalhes do pagamento";
  }
}

function CleaningsPage() {
  const [tab, setTab] = useState<"agenda" | "profissionais">("agenda");
  const [openJob, setOpenJob] = useState<string | null>(null);
  const [openNew, setOpenNew] = useState(false);
  const [openCleaner, setOpenCleaner] = useState(false);

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Limpezas</h2>
        <button className="btn-primary !py-2 !px-3"
          onClick={() => tab === "agenda" ? setOpenNew(true) : setOpenCleaner(true)}>
          <Plus size={16} /> {tab === "agenda" ? "Agendar" : "Profissional"}
        </button>
      </header>

      <div className="flex p-1 rounded-xl bg-card border border-card-border mb-4">
        {(["agenda", "profissionais"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition"
            style={{
              background: tab === t ? "var(--color-accent)" : "transparent",
              color: tab === t ? "var(--color-accent-foreground)" : "var(--color-muted-foreground)",
            }}>
            {t === "agenda" ? "Agenda" : "Profissionais"}
          </button>
        ))}
      </div>

      {tab === "agenda" ? <AgendaList onOpen={setOpenJob} /> : <ProfissionaisList />}

      {openJob && <JobDetailSheet jobId={openJob} onClose={() => setOpenJob(null)} />}
      {openNew && <NewJobSheet onClose={() => setOpenNew(false)} />}
      {openCleaner && <NewCleanerSheet onClose={() => setOpenCleaner(false)} />}
    </AppShell>
  );
}

function AgendaList({ onOpen }: { onOpen: (id: string) => void }) {
  const { currency, lang } = useLocale();
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["cleaning_jobs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cleaning_jobs")
        .select("*, properties(name), cleaners(name)").order("scheduled_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;
  if (jobs.length === 0) return <p className="text-sm text-muted-foreground text-center py-10">Nenhuma limpeza ainda. Toque em “Agendar”.</p>;

  return (
    <ul className="flex flex-col gap-3">
      {jobs.map((j: any) => {
        const cl = (j.checklist ?? []) as { item: string; done: boolean }[];
        const done = cl.filter((c) => c.done).length;
        const pct = cl.length ? Math.round((done / cl.length) * 100) : 0;
        return (
          <li key={j.id}>
            <button onClick={() => onOpen(j.id)} className="hostly-card !p-4 w-full text-left flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{j.properties?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{j.cleaners?.name ?? "Sem profissional"}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={j.status} />
                  {j.has_forgotten_items && (
                    <span className="text-[10px] inline-flex items-center gap-1" style={{ color: "var(--color-warning)" }}>
                      <AlertTriangle size={10} /> esquecidos
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock size={12} /> {j.scheduled_date} · {j.scheduled_time?.slice(0,5)}</span>
                <span className="font-mono">{formatMoney(Number(j.payment_amount ?? 0), currency, lang)}</span>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                  <span>Checklist</span><span>{done}/{cl.length}</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: "var(--color-card-border)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--color-success)" }} />
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function ProfissionaisList() {
  const { data: cleaners = [] } = useQuery({
    queryKey: ["cleaners"],
    queryFn: async () => (await supabase.from("cleaners").select("*").order("name")).data ?? [],
  });
  if (cleaners.length === 0) return <p className="text-sm text-muted-foreground text-center py-10">Nenhum profissional cadastrado.</p>;
  return (
    <ul className="flex flex-col gap-3">
      {cleaners.map((c: any) => {
        const avatar = c.photo_url ? supabase.storage.from("cleaner-avatars").getPublicUrl(c.photo_url).data.publicUrl : null;
        return (
        <li key={c.id} className="hostly-card !p-4 flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="grid place-items-center w-12 h-12 rounded-full font-bold"
              style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
              {c.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{c.name}</p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
              <Star size={12} style={{ color: "var(--color-warning)" }} /> {c.rating} · {c.total_cleanings} limpezas
            </p>
          </div>
          <div className="flex items-center gap-2">
            {c.phone && (
              <>
                <a href={`tel:+${c.phone}`} className="grid place-items-center w-9 h-9 rounded-full bg-secondary"><Phone size={15} /></a>
                <a href={`https://wa.me/${c.phone}`} target="_blank" rel="noreferrer"
                  className="grid place-items-center w-9 h-9 rounded-full"
                  style={{ background: "var(--color-success-soft)", color: "var(--color-success)" }}>
                  <MessageCircle size={15} />
                </a>
              </>
            )}
          </div>
        </li>
      );})}
    </ul>
  );
}

function JobDetailSheet({ jobId, onClose }: { jobId: string; onClose: () => void }) {
  const { currency, lang } = useLocale();
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      const { data, error } = await supabase.from("cleaning_jobs")
        .select("*, properties(name, address, city, state), cleaners(name, phone)").eq("id", jobId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: forgotten = [] } = useQuery({
    queryKey: ["forgotten", jobId],
    queryFn: async () => (await supabase.from("forgotten_items").select("*").eq("cleaning_job_id", jobId).order("created_at")).data ?? [],
  });

  const toggleItem = useMutation({
    mutationFn: async (idx: number) => {
      if (!job) return;
      const cl = [...((job.checklist ?? []) as any[])];
      cl[idx] = { ...cl[idx], done: !cl[idx].done };
      const { error } = await supabase.from("cleaning_jobs").update({ checklist: cl }).eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job", jobId] }),
  });

  const complete = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cleaning_jobs").update({
        status: "concluido", completed_at: new Date().toISOString(),
      }).eq("id", jobId);
      if (error) throw error;
      // dispara e-mail se houver objetos esquecidos
      if (job?.has_forgotten_items && !job.admin_email_sent) {
        try {
          await supabase.functions.invoke("send-forgotten-items-email", { body: { cleaning_job_id: jobId } });
        } catch (e) { console.warn("Email function failed", e); }
      }
    },
    onSuccess: () => {
      toast.success("Limpeza concluída");
      qc.invalidateQueries({ queryKey: ["cleaning_jobs"] });
      qc.invalidateQueries({ queryKey: ["job", jobId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const reopen = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cleaning_jobs").update({ status: "em_andamento", completed_at: null }).eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Limpeza reaberta");
      qc.invalidateQueries({ queryKey: ["job", jobId] });
      qc.invalidateQueries({ queryKey: ["cleaning_jobs"] });
    },
  });

  const markPaid = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("cleaning_jobs").update({ payment_status: "pago" }).eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["job", jobId] }),
  });

  const [forgDesc, setForgDesc] = useState("");
  const [forgFile, setForgFile] = useState<File | null>(null);
  const addForgotten = useMutation({
    mutationFn: async () => {
      if (!user || !job) throw new Error("Erro");
      let photo_url: string | null = null;
      if (forgFile) {
        const ext = (forgFile.name.split(".").pop() || "jpg").toLowerCase();
        const path = `${user.id}/${jobId}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("forgotten-items")
          .upload(path, forgFile, { upsert: true, contentType: forgFile.type || "image/jpeg" });
        if (upErr) throw upErr;
        photo_url = supabase.storage.from("forgotten-items").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("forgotten_items").insert({
        user_id: user.id, cleaning_job_id: jobId, property_id: job.property_id,
        description: forgDesc, photo_url,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForgDesc(""); setForgFile(null);
      toast.success("Objeto registrado");
      qc.invalidateQueries({ queryKey: ["forgotten", jobId] });
      qc.invalidateQueries({ queryKey: ["job", jobId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateForgotten = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("forgotten_items").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["forgotten", jobId] });
      qc.invalidateQueries({ queryKey: ["job", jobId] });
    },
  });

  if (!job) return null;
  const cl = (job.checklist ?? []) as { item: string; done: boolean }[];
  const phone = (job as any).cleaners?.phone;

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div className="bg-background w-full max-w-[480px] mx-auto h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-background border-b border-card-border px-4 h-14 flex items-center gap-3">
          <button onClick={onClose}><ArrowLeft size={20} /></button>
          <h3 className="font-bold flex-1 truncate">{(job as any).properties?.name}</h3>
          <StatusBadge status={job.status as any} />
        </div>
        <div className="p-4 flex flex-col gap-4">
          <section className="hostly-card !p-4">
            <p className="text-sm font-semibold mb-1">{(job as any).cleaners?.name ?? "Sem profissional"}</p>
            {phone && (
              <div className="flex gap-2 mt-2">
                <a href={`tel:+${phone}`} className="btn-secondary"><Phone size={14} /> Ligar</a>
                <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" className="btn-secondary"><MessageCircle size={14} /> WhatsApp</a>
              </div>
            )}
          </section>

          {(job as any).access_token && (
            <section className="hostly-card !p-4">
              <h4 className="font-bold text-sm mb-2 inline-flex items-center gap-2"><Link2 size={14} /> Link da faxineira</h4>
              <p className="text-xs text-muted-foreground mb-2">Compartilhe este link para a faxineira preencher o checklist sem login.</p>
              {(() => {
                const url = `${typeof window !== "undefined" ? window.location.origin : ""}/faxineira/${(job as any).access_token}`;
                const wppMsg = encodeURIComponent(`Olá! Aqui está o link da limpeza: ${url}`);
                return (
                  <div className="flex flex-col gap-2">
                    <code className="text-[11px] break-all bg-background border border-card-border rounded px-2 py-1.5">{url}</code>
                    <div className="flex gap-2">
                      <button onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copiado"); }} className="btn-secondary flex-1 justify-center"><Copy size={14} /> Copiar</button>
                      {phone && <a href={`https://wa.me/${phone}?text=${wppMsg}`} target="_blank" rel="noreferrer" className="btn-secondary flex-1 justify-center"><MessageCircle size={14} /> Enviar</a>}
                    </div>
                  </div>
                );
              })()}
            </section>
          )}

          <section className="hostly-card !p-4">
            <h4 className="font-bold text-sm mb-3">Checklist</h4>
            <ul className="flex flex-col gap-2">
              {cl.map((c, i) => (
                <li key={i}>
                  <button onClick={() => toggleItem.mutate(i)}
                    className="flex items-center gap-3 w-full text-left text-sm py-1.5">
                    <span className="grid place-items-center w-5 h-5 rounded-md border"
                      style={{
                        background: c.done ? "var(--color-success)" : "transparent",
                        borderColor: c.done ? "var(--color-success)" : "var(--color-card-border)",
                        color: "white",
                      }}>
                      {c.done && <Check size={14} />}
                    </span>
                    <span style={{ textDecoration: c.done ? "line-through" : "none", color: c.done ? "var(--color-muted-foreground)" : "inherit" }}>{c.item}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="hostly-card !p-4">
            <h4 className="font-bold text-sm mb-3 inline-flex items-center gap-2">
              <AlertTriangle size={14} /> Objetos esquecidos
            </h4>
            {forgotten.length === 0 && <p className="text-xs text-muted-foreground mb-3">Nenhum item registrado.</p>}
            <ul className="flex flex-col gap-2 mb-3">
              {forgotten.map((f: any) => (
                <li key={f.id} className="flex items-center justify-between text-sm border-t border-card-border pt-2">
                  <div>
                    <p className="font-semibold">{f.description}</p>
                    <StatusBadge status={f.status as any} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => updateForgotten.mutate({ id: f.id, status: "devolvido" })} className="text-[11px] px-2 py-1 rounded bg-secondary">Devolvido</button>
                    <button onClick={() => updateForgotten.mutate({ id: f.id, status: "descartado" })} className="text-[11px] px-2 py-1 rounded bg-secondary">Descartado</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-card-border pt-3">
              <input placeholder="Descrição do objeto" value={forgDesc} onChange={(e) => setForgDesc(e.target.value)}
                className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm" />
              <input type="file" accept="image/*" capture="environment" onChange={(e) => setForgFile(e.target.files?.[0] ?? null)}
                className="text-xs text-muted-foreground" />
              <button disabled={!forgDesc || addForgotten.isPending}
                onClick={() => addForgotten.mutate()} className="btn-secondary justify-center">
                <Plus size={14} /> Adicionar objeto
              </button>
            </div>
          </section>

          <section className="hostly-card !p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pagamento</p>
              <p className="font-mono">{formatMoney(Number(job.payment_amount ?? 0), currency, lang)}</p>
            </div>
            {job.payment_status === "pago" ? (
              <span className="hostly-pill" style={{ color: "var(--color-success)", background: "var(--color-success-soft)" }}>Pago</span>
            ) : (
              <button className="btn-secondary" onClick={() => markPaid.mutate()}>Marcar pago</button>
            )}
          </section>

          <div className="flex gap-2">
            {job.status !== "concluido" ? (
              <button className="btn-primary flex-1 justify-center" onClick={() => complete.mutate()} disabled={complete.isPending}>
                <Check size={16} /> {complete.isPending ? "Concluindo..." : "Marcar concluída"}
              </button>
            ) : (
              <button className="btn-secondary flex-1 justify-center" onClick={() => reopen.mutate()}>
                Reabrir limpeza
              </button>
            )}
          </div>
          {job.has_forgotten_items && job.admin_email_sent && (
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Mail size={12} /> E-mail ao admin enviado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function NewJobSheet({ onClose }: { onClose: () => void }) {
  const { currency } = useLocale();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: properties = [] } = useQuery({ queryKey: ["properties-min"], queryFn: async () => (await supabase.from("properties").select("id, name").eq("archived", false)).data ?? [] });
  const { data: cleaners = [] } = useQuery({ queryKey: ["cleaners-min"], queryFn: async () => (await supabase.from("cleaners").select("id, name, price_per_cleaning")).data ?? [] });
  const [form, setForm] = useState({
    property_id: "", cleaner_id: "", scheduled_date: "", scheduled_time: "10:00",
    payment_amount: 0, notes: "",
  });

  const m = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const checklist = defaultChecklist.map((item) => ({ item, done: false }));
      const { error } = await supabase.from("cleaning_jobs").insert({
        ...form, user_id: user.id, checklist,
        cleaner_id: form.cleaner_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Limpeza agendada"); qc.invalidateQueries({ queryKey: ["cleaning_jobs"] }); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Agendar limpeza</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="flex flex-col gap-3 text-sm">
          <Select label="Imóvel" value={form.property_id} onChange={(v) => setForm({ ...form, property_id: v })}
            options={[{ v: "", l: "Selecione…" }, ...properties.map((p: any) => ({ v: p.id, l: p.name }))]} />
          <Select label="Profissional" value={form.cleaner_id} onChange={(v) => {
            const c = cleaners.find((x: any) => x.id === v);
            setForm({ ...form, cleaner_id: v, payment_amount: c ? Number(c.price_per_cleaning ?? 0) : form.payment_amount });
          }} options={[{ v: "", l: "Sem profissional" }, ...cleaners.map((c: any) => ({ v: c.id, l: c.name }))]} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data"><input type="date" required value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className={inp} /></Field>
            <Field label="Horário"><input type="time" required value={form.scheduled_time} onChange={(e) => setForm({ ...form, scheduled_time: e.target.value })} className={inp} /></Field>
          </div>
          <Field label={`Valor (${currencySymbol(currency)})`}><input type="number" inputMode="decimal" step="0.01" min={0} placeholder="0,00" value={form.payment_amount === 0 ? "" : form.payment_amount} onChange={(e) => setForm({ ...form, payment_amount: e.target.value === "" ? 0 : Number(e.target.value) })} className={inp} /></Field>
          <Field label="Notas"><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inp} /></Field>
          <button type="submit" disabled={!form.property_id || m.isPending} className="btn-primary justify-center mt-2">{m.isPending ? "Salvando..." : "Agendar"}</button>
        </form>
      </div>
    </div>
  );
}

function NewCleanerSheet({ onClose }: { onClose: () => void }) {
  const { currency } = useLocale();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", phone: "", email: "", payment_method: "pix", payment_details: "", price_per_cleaning: 0, notes: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const m = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      let photo_url: string | null = null;
      if (photo) {
        const ext = photo.name.split(".").pop();
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("cleaner-avatars").upload(path, photo);
        if (upErr) throw upErr;
        photo_url = path;
      }
      const { error } = await supabase.from("cleaners").insert({ ...form, pix_key: form.payment_details, user_id: user.id, photo_url });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profissional cadastrado"); qc.invalidateQueries({ queryKey: ["cleaners"] }); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Novo profissional</h3>
          <button type="button" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); m.mutate(); }} noValidate className="flex flex-col gap-3 text-sm">
          <Field label="Nome"><input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} /></Field>
          <Field label="Foto (opcional)"><input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="text-xs text-muted-foreground" /></Field>
          <Field label="Telefone (com DDI, ex: 5511...)"><input autoComplete="tel" inputMode="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} /></Field>
          <Field label="E-mail"><input type="email" autoComplete="email" inputMode="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} /></Field>
          <Field label="Chave Pix / IBAN / MBWAY / Outro"><input autoComplete="off" placeholder="Ex: IBAN, MBWAY, PayPal, Zelle..." value={form.pix_key} onChange={(e) => setForm({ ...form, pix_key: e.target.value })} className={inp} /></Field>
          <Field label={`Valor por limpeza (${currencySymbol(currency)})`}><input type="number" inputMode="decimal" min={0} step="0.01" placeholder="0,00" value={form.price_per_cleaning === 0 ? "" : form.price_per_cleaning} onChange={(e) => setForm({ ...form, price_per_cleaning: e.target.value === "" ? 0 : Number(e.target.value) })} className={inp} /></Field>
          <Field label="Notas"><input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inp} /></Field>
          <button type="submit" disabled={m.isPending || !form.name} className="btn-primary justify-center mt-2">{m.isPending ? "Salvando..." : "Salvar"}</button>
        </form>
      </div>
    </div>
  );
}

const inp = "px-3 py-2.5 rounded-lg bg-background border border-card-border w-full";
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex flex-col gap-1"><span className="text-muted-foreground text-xs">{label}</span>{children}</label>;
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <Field label={label}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inp}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </Field>
  );
}
