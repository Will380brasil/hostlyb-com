import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney, currencySymbol } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { toast } from "sonner";
import { Plus, Phone, MessageCircle, Search, X, Calendar, History, FileSpreadsheet, Star, AlertTriangle } from "lucide-react";
import { SpreadsheetImport } from "@/components/SpreadsheetImport";

export const Route = createFileRoute("/hospedes")({
  head: () => ({ meta: [{ title: "Hóspedes — Hostlyb" }, { name: "description", content: "Gerencie seus hóspedes." }] }),
  component: GuestsPage,
});

const PLATFORMS = [
  { v: "booking", l: "Booking.com" },
  { v: "vrbo", l: "Vrbo" },
  { v: "expedia", l: "Expedia" },
  { v: "agoda", l: "Agoda" },
  { v: "hotels", l: "Hotels.com" },
  { v: "tripadvisor", l: "TripAdvisor" },
  { v: "trivago", l: "Trivago" },
  { v: "homeaway", l: "HomeAway" },
  { v: "airbnb", l: "Airbnb" }, // kept for legacy records; new entries shouldn't use it
  { v: "direto", l: "Direto / Direct" },
  { v: "outro", l: "Outro / Other" },
];
const platformLabel: Record<string, string> = Object.fromEntries(PLATFORMS.map(p => [p.v, p.l]));

function GuestTags({ guest, returning }: { guest: any; returning?: boolean }) {
  const tags: { l: string; bg: string; c: string }[] = [];
  if (guest.is_vip) tags.push({ l: "⭐ VIP", bg: "var(--color-warning-soft)", c: "var(--color-warning)" });
  if (returning) tags.push({ l: "🔁 Retornando", bg: "var(--color-info-soft)", c: "var(--color-info)" });
  if (guest.had_issue) tags.push({ l: "⚠️ Atenção", bg: "rgba(239,68,68,0.12)", c: "var(--color-destructive, #ef4444)" });
  const today = new Date().toISOString().slice(0, 10);
  if (guest.checkin_date === today) tags.push({ l: "🛬 Check-in hoje", bg: "var(--color-accent-soft)", c: "var(--color-accent)" });
  if (Number(guest.total_value ?? 0) <= 0) tags.push({ l: "💳 Pagamento pendente", bg: "var(--color-warning-soft)", c: "var(--color-warning)" });
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {tags.map((t, i) => (
        <span key={i} className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ background: t.bg, color: t.c }}>{t.l}</span>
      ))}
    </div>
  );
}

function GuestsPage() {
  const { currency, lang } = useLocale();
  const t = useT();
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [q, setQ] = useState("");
  const [detail, setDetail] = useState<any | null>(null);
  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("*, properties(name)").order("checkin_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const term = q.trim().toLowerCase();
  const filtered = term
    ? guests.filter((g: any) => [g.name, g.email, g.phone, g.document, g.properties?.name, g.platform].some((v) => (v ?? "").toString().toLowerCase().includes(term)))
    : guests;

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">{t("hos.title")}</h2>
        <div className="flex gap-2">
          <button className="btn-secondary !py-2 !px-3" onClick={() => setImportOpen(true)} title={t("hos.importSheet")}><FileSpreadsheet size={16} /></button>
          <button className="btn-primary !py-2 !px-3" onClick={() => setOpen(true)}><Plus size={16} /> {t("g.new")}</button>
        </div>
      </header>

      {guests.length > 0 && (
        <div className="relative mb-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("hos.search")}
            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-card border border-card-border text-sm" />
        </div>
      )}

      {guests.length === 0 ? (
        <div className="hostly-card text-center text-sm text-muted-foreground">
          <p className="mb-3">{t("hos.empty")}</p>
          <div className="flex gap-2 justify-center">
            <button className="btn-secondary" onClick={() => setImportOpen(true)}><FileSpreadsheet size={14} /> {t("hos.importSheet")}</button>
            <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={14} /> {t("hos.add")}</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">{t("hos.notFound")}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((g: any) => (
            <li key={g.id}>
              <button onClick={() => setDetail(g)} className="hostly-card !p-4 flex flex-col gap-3 w-full text-left active:scale-[0.99] transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold truncate flex items-center gap-1.5">
                      {g.name}
                      {g.is_vip && <Star size={12} style={{ color: "var(--color-warning)" }} fill="currentColor" />}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{g.properties?.name ?? "—"}</p>
                  </div>
                  <StatusBadge status={g.status} />
                </div>
                <GuestTags guest={g} />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{g.checkin_date} → {g.checkout_date}</span>
                  <span>{g.nights ?? "—"} noites</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="hostly-pill" style={{ background: "var(--color-info-soft)", color: "var(--color-info)" }}>
                    {platformLabel[g.platform] ?? g.platform}
                  </span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <span className="font-mono text-sm" style={{ color: "var(--color-success)" }}>
                      {formatMoney(Number(g.total_value ?? 0), currency, lang)}
                    </span>
                    {g.phone && (
                      <>
                        <a href={`tel:+${g.phone}`} className="grid place-items-center w-8 h-8 rounded-full bg-secondary"><Phone size={13} /></a>
                        <a href={`https://wa.me/${g.phone}?text=${encodeURIComponent(`Olá ${g.name}!`)}`} target="_blank" rel="noreferrer"
                           className="grid place-items-center w-8 h-8 rounded-full"
                           style={{ background: "var(--color-success-soft)", color: "var(--color-success)" }}>
                          <MessageCircle size={13} />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && <NewGuestSheet onClose={() => setOpen(false)} />}
      {importOpen && <SpreadsheetImport onClose={() => setImportOpen(false)} />}
      {detail && <GuestDetailSheet guest={detail} onClose={() => setDetail(null)} />}
    </AppShell>
  );
}

function NewGuestSheet({ onClose }: { onClose: () => void }) {
  const { currency } = useLocale();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: properties = [] } = useQuery({
    queryKey: ["properties-min"],
    queryFn: async () => (await supabase.from("properties").select("id, name").eq("archived", false)).data ?? [],
  });
  const [form, setForm] = useState({
    property_id: "", name: "", email: "", phone: "", document: "",
    checkin_date: "", checkout_date: "", total_value: 0, platform: "airbnb",
  });

  const m = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      if (!form.property_id) throw new Error("Selecione um imóvel");
      const ci = new Date(form.checkin_date), co = new Date(form.checkout_date);
      const nights = Math.max(1, Math.round((+co - +ci) / 86400000));
      const { error } = await supabase.from("guests").insert({
        ...form, user_id: user.id, nights,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Hóspede criado"); qc.invalidateQueries({ queryKey: ["guests"] }); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-4">Novo hóspede</h3>
        <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="flex flex-col gap-3 text-sm">
          <Select label="Imóvel" value={form.property_id} onChange={(v) => setForm({ ...form, property_id: v })}
            options={[{ v: "", l: "Selecione…" }, ...properties.map((p: any) => ({ v: p.id, l: p.name }))]} />
          <Field label="Nome"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefone"><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp} /></Field>
            <Field label="E-mail"><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp} /></Field>
          </div>
          <Field label="Documento"><input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} className={inp} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Check-in"><input type="date" required value={form.checkin_date} onChange={(e) => setForm({ ...form, checkin_date: e.target.value })} className={inp} /></Field>
            <Field label="Check-out"><input type="date" required value={form.checkout_date} onChange={(e) => setForm({ ...form, checkout_date: e.target.value })} className={inp} /></Field>
          </div>
          <Field label={`Valor total (${currencySymbol(currency)})`}><input type="number" inputMode="decimal" min={0} step="0.01" placeholder="0,00" value={form.total_value === 0 ? "" : form.total_value} onChange={(e) => setForm({ ...form, total_value: e.target.value === "" ? 0 : Number(e.target.value) })} className={inp} /></Field>
          <Select label="Plataforma" value={form.platform} onChange={(v) => setForm({ ...form, platform: v })}
            options={PLATFORMS} />
          <button disabled={m.isPending} className="btn-primary justify-center mt-2">{m.isPending ? "Salvando..." : "Salvar"}</button>
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

function GuestDetailSheet({ guest, onClose }: { guest: any; onClose: () => void }) {
  const { currency, lang } = useLocale();
  const qc = useQueryClient();
  // History: all stays from this guest by name+email/phone match
  const { data: history = [] } = useQuery({
    queryKey: ["guest-history", guest.email ?? guest.phone ?? guest.name],
    queryFn: async () => {
      let q = supabase.from("guests").select("id, checkin_date, checkout_date, total_value, properties(name)").neq("id", guest.id).order("checkin_date", { ascending: false }).limit(20);
      if (guest.email) q = q.eq("email", guest.email);
      else if (guest.phone) q = q.eq("phone", guest.phone);
      else q = q.ilike("name", guest.name);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });
  const returning = history.length > 0;
  const toggleVip = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("guests").update({ is_vip: !guest.is_vip }).eq("id", guest.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success(guest.is_vip ? "VIP removido" : "Marcado como VIP"); qc.invalidateQueries({ queryKey: ["guests"] }); onClose(); },
    onError: (e: any) => toast.error(e.message),
  });
  const wppMsg = encodeURIComponent(`Olá ${guest.name}! Aqui é do ${guest.properties?.name ?? "seu anfitrião"}. Tudo bem com sua estadia?`);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2">
            {guest.name}
            {guest.is_vip && <Star size={16} fill="currentColor" style={{ color: "var(--color-warning)" }} />}
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="mb-3"><GuestTags guest={guest} returning={returning} /></div>
        <div className="text-sm space-y-1.5 mb-4">
          <p className="text-muted-foreground">📍 {guest.properties?.name ?? "—"}</p>
          <p className="text-muted-foreground"><Calendar size={12} className="inline mr-1" />{guest.checkin_date} → {guest.checkout_date} · {guest.nights ?? "—"} noites</p>
          <p className="text-muted-foreground">{platformLabel[guest.platform] ?? guest.platform} · <span className="font-mono" style={{ color: "var(--color-success)" }}>{formatMoney(Number(guest.total_value ?? 0), currency, lang)}</span></p>
          {guest.email && <p className="text-muted-foreground">✉️ {guest.email}</p>}
          {guest.phone && <p className="text-muted-foreground">📱 +{guest.phone}</p>}
          {guest.document && <p className="text-muted-foreground">🪪 {guest.document}</p>}
          {guest.notes && <p className="text-muted-foreground">📝 {guest.notes}</p>}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {guest.phone && (
            <>
              <a href={`tel:+${guest.phone}`} className="btn-secondary flex-1 justify-center"><Phone size={13} /> Ligar</a>
              <a href={`https://wa.me/${guest.phone}?text=${wppMsg}`} target="_blank" rel="noreferrer" className="btn-primary flex-1 justify-center"><MessageCircle size={13} /> WhatsApp</a>
            </>
          )}
          <button onClick={() => toggleVip.mutate()} className="btn-secondary justify-center" style={{ color: "var(--color-warning)" }}>
            <Star size={13} fill={guest.is_vip ? "currentColor" : "none"} /> {guest.is_vip ? "Remover VIP" : "Marcar VIP"}
          </button>
          {guest.checkin_token && (
            <a target="_blank" rel="noreferrer"
              href={`https://wa.me/${guest.phone ?? ""}?text=${encodeURIComponent(`${window.location.origin}/checkin/${guest.checkin_token}`)}`}
              onClick={(e) => { if (!guest.phone) { e.preventDefault(); navigator.clipboard.writeText(`${window.location.origin}/checkin/${guest.checkin_token}`); toast.success("Link copiado"); } }}
              className="btn-secondary flex-1 justify-center">
              🛂 Check-in digital
            </a>
          )}
        </div>

        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1.5"><History size={14} /> Outras estadias</h4>
        {history.length === 0 ? (
          <p className="text-xs text-muted-foreground">Primeira estadia deste hóspede.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((h: any) => (
              <li key={h.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-secondary">
                <div className="min-w-0">
                  <p className="font-medium truncate">{h.properties?.name ?? "—"}</p>
                  <p className="text-muted-foreground">{h.checkin_date} → {h.checkout_date}</p>
                </div>
                <span className="font-mono" style={{ color: "var(--color-success)" }}>{formatMoney(Number(h.total_value ?? 0), currency, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
