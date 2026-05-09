import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";
import { Plus, ChevronRight, BedDouble, Bath, Users, X } from "lucide-react";

export const Route = createFileRoute("/imoveis/")({
  head: () => ({ meta: [{ title: "Imóveis — Hostly" }, { name: "description", content: "Gerencie seus imóveis." }] }),
  component: PropertiesPage,
});

function PropertiesPage() {
  const { currency, lang } = useLocale();
  const [open, setOpen] = useState(false);
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("archived", false).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Imóveis</h2>
          <p className="text-sm text-muted-foreground">{properties.length} cadastrados</p>
        </div>
        <button className="btn-primary !py-2 !px-3" onClick={() => setOpen(true)}><Plus size={16} /> Novo</button>
      </header>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Carregando…</p>
      ) : properties.length === 0 ? (
        <div className="hostly-card text-center text-sm text-muted-foreground">
          <p className="mb-2">Você ainda não cadastrou imóveis.</p>
          <button className="btn-primary mx-auto" onClick={() => setOpen(true)}><Plus size={14} /> Cadastrar imóvel</button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {properties.map((p: any) => (
            <li key={p.id}>
              <Link to="/imoveis/$id" params={{ id: p.id }} className="hostly-card !p-4 flex flex-col gap-3 active:scale-[0.99] transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{p.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{p.address}{p.city ? `, ${p.city}` : ""}{p.state ? ` - ${p.state}` : ""}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><BedDouble size={13} />{p.bedrooms ?? 0}</span>
                    <span className="inline-flex items-center gap-1"><Bath size={13} />{p.bathrooms ?? 0}</span>
                    <span className="inline-flex items-center gap-1"><Users size={13} />{p.max_guests ?? 0}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-mono" style={{ color: "var(--color-success)" }}>
                    {formatMoney(Number(p.income_monthly ?? 0), currency, lang)} <ChevronRight size={14} className="text-muted-foreground" />
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {open && <NewPropertySheet onClose={() => setOpen(false)} />}
    </AppShell>
  );
}

function NewPropertySheet({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "", address: "", city: "", state: "", zip_code: "",
    bedrooms: 1, bathrooms: 1, max_guests: 2, wifi_password: "", notes: "",
  });

  const m = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      let latitude: number | null = null;
      let longitude: number | null = null;
      try {
        const q = encodeURIComponent([form.address, form.city, form.state, form.zip_code, "Brasil"].filter(Boolean).join(", "));
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${q}`);
        const arr = await res.json();
        if (arr?.[0]) { latitude = Number(arr[0].lat); longitude = Number(arr[0].lon); }
      } catch { /* ignore geocoding failure */ }
      const { error } = await supabase.from("properties").insert({ ...form, user_id: user.id, latitude, longitude });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Imóvel criado");
      qc.invalidateQueries({ queryKey: ["properties"] });
      onClose();
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Novo imóvel</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); m.mutate(); }} className="flex flex-col gap-3">
          <Input label="Nome" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Input label="Endereço completo" value={form.address} onChange={(v) => setForm({ ...form, address: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Cidade" value={form.city} onChange={(v) => setForm({ ...form, city: v })} />
            <Input label="Estado" value={form.state} onChange={(v) => setForm({ ...form, state: v })} />
          </div>
          <Input label="CEP" value={form.zip_code} onChange={(v) => setForm({ ...form, zip_code: v })} />
          <div className="grid grid-cols-3 gap-3">
            <NumInput label="Quartos" value={form.bedrooms} onChange={(v) => setForm({ ...form, bedrooms: v })} />
            <NumInput label="Banheiros" value={form.bathrooms} onChange={(v) => setForm({ ...form, bathrooms: v })} />
            <NumInput label="Hóspedes" value={form.max_guests} onChange={(v) => setForm({ ...form, max_guests: v })} />
          </div>
          <Input label="Senha Wi-Fi" value={form.wifi_password} onChange={(v) => setForm({ ...form, wifi_password: v })} />
          <Input label="Notas" value={form.notes} onChange={(v) => setForm({ ...form, notes: v })} />
          <button disabled={m.isPending} className="btn-primary justify-center mt-2">
            {m.isPending ? "Salvando..." : "Salvar imóvel"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="px-3 py-2.5 rounded-lg bg-background border border-card-border" />
    </label>
  );
}
function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted-foreground text-xs">{label}</span>
      <input type="number" inputMode="decimal" min={0} placeholder="0"
        value={value === 0 ? "" : value}
        onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        className="px-3 py-2.5 rounded-lg bg-background border border-card-border" />
    </label>
  );
}
