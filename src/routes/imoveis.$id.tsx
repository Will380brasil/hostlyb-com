import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { AddressActions } from "@/components/AddressActions";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { fullAddress, formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowLeft, BedDouble, Bath, Users, Wifi, Sparkles, Archive, Calendar, RefreshCw, Trash2, Plus } from "lucide-react";

export const Route = createFileRoute("/imoveis/$id")({
  head: () => ({ meta: [{ title: "Imóvel — Hostly" }, { name: "description", content: "Detalhes do imóvel." }] }),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { currency, lang } = useLocale();
  const { id } = Route.useParams();
  const navigate = useNavigate();

  const archive = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("properties").update({ archived: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Imóvel arquivado"); navigate({ to: "/imoveis" }); },
    onError: (e: any) => toast.error(e.message),
  });

  const { data: p, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ["property-jobs", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("cleaning_jobs")
        .select("*, cleaners(name)").eq("property_id", id).order("scheduled_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: guests = [] } = useQuery({
    queryKey: ["property-guests", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("*").eq("property_id", id).order("checkin_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return <AppShell><p className="text-muted-foreground">Carregando…</p></AppShell>;
  if (!p) return <AppShell><p className="text-muted-foreground">Imóvel não encontrado.</p></AppShell>;

  return (
    <AppShell>
      <Link to="/imoveis" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold leading-tight">{p.name}</h2>
          <p className="text-sm text-muted-foreground">{p.city ?? "—"} · {p.state ?? ""}</p>
        </div>
        <StatusBadge status={p.status as any} />
      </header>

      <section className="hostly-card mb-4">
        <AddressActions address={fullAddress(p)} />
      </section>

      <section className="hostly-card mb-4">
        <h3 className="font-bold mb-3">Detalhes</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary">
            <BedDouble size={18} /><span className="font-semibold">{p.bedrooms ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">Quartos</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary">
            <Bath size={18} /><span className="font-semibold">{p.bathrooms ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">Banheiros</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary">
            <Users size={18} /><span className="font-semibold">{p.max_guests ?? 0}</span>
            <span className="text-[10px] text-muted-foreground">Hóspedes</span>
          </div>
        </div>
        {p.wifi_password && (
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Wifi size={16} style={{ color: "var(--color-info)" }} />
            <span className="text-muted-foreground">Wi-Fi:</span>
            <code className="font-mono">{p.wifi_password}</code>
          </div>
        )}
      </section>

      <section className="hostly-card mb-4">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Sparkles size={16} /> Histórico de limpezas</h3>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma limpeza registrada.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {jobs.map((j: any) => (
              <li key={j.id} className="flex items-center justify-between text-sm">
                <span>{j.scheduled_date} · {j.cleaners?.name ?? "—"}</span>
                <StatusBadge status={j.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="hostly-card mb-4">
        <h3 className="font-bold mb-3">Histórico de hóspedes</h3>
        {guests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem hóspedes ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {guests.map((g: any) => (
              <li key={g.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold flex items-center gap-2">
                    {g.name}
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{g.platform}</span>
                    {g.source === "ical" && <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--color-info)", color: "white" }}>iCal</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{g.checkin_date} → {g.checkout_date}</p>
                </div>
                <span className="font-mono text-xs">{formatMoney(Number(g.total_value ?? 0), currency, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <IcalSection propertyId={id} />

      <button onClick={() => { if (confirm("Arquivar este imóvel?")) archive.mutate(); }}
        className="btn-secondary justify-center w-full mb-6" style={{ color: "var(--color-warning)" }}>
        <Archive size={14} /> Arquivar imóvel
      </button>
    </AppShell>
  );
}

function IcalSection({ propertyId }: { propertyId: string }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [platform, setPlatform] = useState("airbnb");
  const [url, setUrl] = useState("");

  const { data: feeds = [] } = useQuery({
    queryKey: ["ical-feeds", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("ical_feeds").select("*").eq("property_id", propertyId).order("created_at");
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Não autenticado");
      const { error } = await supabase.from("ical_feeds").insert({ user_id: user.id, property_id: propertyId, platform, url });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Feed adicionado"); setUrl(""); setAdding(false); qc.invalidateQueries({ queryKey: ["ical-feeds", propertyId] }); },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("ical_feeds").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ical-feeds", propertyId] }),
  });

  const sync = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.functions.invoke("sync-ical", { body: { feed_id: id } });
      if (error) throw error;
      return data;
    },
    onSuccess: (d: any) => {
      toast.success(`Sincronizado: ${d?.imported ?? 0} importados, ${d?.skipped ?? 0} ignorados`);
      qc.invalidateQueries({ queryKey: ["ical-feeds", propertyId] });
      qc.invalidateQueries({ queryKey: ["property-guests", propertyId] });
      qc.invalidateQueries({ queryKey: ["guests-cal"] });
      qc.invalidateQueries({ queryKey: ["jobs-cal"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <section className="hostly-card mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold flex items-center gap-2"><Calendar size={16} /> Sincronização iCal</h3>
        {!adding && (
          <button onClick={() => setAdding(true)} className="text-xs inline-flex items-center gap-1 text-muted-foreground"><Plus size={13} /> Adicionar</button>
        )}
      </div>

      {adding && (
        <form onSubmit={(e) => { e.preventDefault(); add.mutate(); }} className="flex flex-col gap-2 mb-3">
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm">
            <option value="airbnb">Airbnb</option>
            <option value="booking">Booking</option>
            <option value="vrbo">Vrbo</option>
            <option value="outro">Outro</option>
          </select>
          <input value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://...ics"
            className="px-3 py-2 rounded-lg bg-background border border-card-border text-sm" />
          <div className="flex gap-2">
            <button type="submit" disabled={add.isPending} className="btn-primary flex-1 justify-center">{add.isPending ? "..." : "Salvar"}</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary">Cancelar</button>
          </div>
        </form>
      )}

      {feeds.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum calendário externo conectado.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {feeds.map((f: any) => (
            <li key={f.id} className="flex items-center justify-between gap-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold capitalize">{f.platform}</p>
                <p className="text-xs text-muted-foreground truncate">{f.url}</p>
                {f.last_synced_at && <p className="text-[10px] text-muted-foreground">Sincronizado: {new Date(f.last_synced_at).toLocaleString("pt-BR")}</p>}
                {f.last_error && <p className="text-[10px]" style={{ color: "var(--color-danger)" }}>{f.last_error}</p>}
              </div>
              <button onClick={() => sync.mutate(f.id)} disabled={sync.isPending} className="p-2 rounded-lg bg-secondary"><RefreshCw size={14} /></button>
              <button onClick={() => { if (confirm("Remover feed?")) del.mutate(f.id); }} className="p-2 rounded-lg bg-secondary"><Trash2 size={14} /></button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
