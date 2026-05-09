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
import { Plus, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/hospedes")({
  head: () => ({ meta: [{ title: "Hóspedes — Hostly" }, { name: "description", content: "Gerencie seus hóspedes." }] }),
  component: GuestsPage,
});

const platformLabel: Record<string, string> = { airbnb: "Airbnb", booking: "Booking", direto: "Direto" };

function GuestsPage() {
  const { currency, lang } = useLocale();
  const [open, setOpen] = useState(false);
  const { data: guests = [] } = useQuery({
    queryKey: ["guests"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("*, properties(name)").order("checkin_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Hóspedes</h2>
        <button className="btn-primary !py-2 !px-3" onClick={() => setOpen(true)}><Plus size={16} /> Novo</button>
      </header>

      {guests.length === 0 ? (
        <div className="hostly-card text-center text-sm text-muted-foreground">Nenhum hóspede ainda.</div>
      ) : (
        <ul className="flex flex-col gap-3">
          {guests.map((g: any) => (
            <li key={g.id} className="hostly-card !p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{g.properties?.name ?? "—"}</p>
                </div>
                <StatusBadge status={g.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{g.checkin_date} → {g.checkout_date}</span>
                <span>{g.nights ?? "—"} noites</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="hostly-pill" style={{ background: "var(--color-info-soft)", color: "var(--color-info)" }}>
                  {platformLabel[g.platform] ?? g.platform}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm" style={{ color: "var(--color-success)" }}>
                    {formatMoney(Number(g.total_value ?? 0), currency, lang)}
                  </span>
                  {g.phone && (
                    <>
                      <a href={`tel:+${g.phone}`} className="grid place-items-center w-8 h-8 rounded-full bg-secondary"><Phone size={13} /></a>
                      <a href={`https://wa.me/${g.phone}`} target="_blank" rel="noreferrer"
                         className="grid place-items-center w-8 h-8 rounded-full"
                         style={{ background: "var(--color-success-soft)", color: "var(--color-success)" }}>
                        <MessageCircle size={13} />
                      </a>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {open && <NewGuestSheet onClose={() => setOpen(false)} />}
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
            options={[{ v: "airbnb", l: "Airbnb" }, { v: "booking", l: "Booking" }, { v: "direto", l: "Direto" }]} />
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
