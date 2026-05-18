import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { AddressActions } from "@/components/AddressActions";
import { supabase } from "@/integrations/supabase/client";
import { fullAddress, formatMoney } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowLeft, BedDouble, Bath, Users, Wifi, Sparkles, Archive, BookOpen, Wrench, BarChart3, Link2 } from "lucide-react";
import { PropertyScoreBadge } from "@/components/dashboard/PropertyScoreBadge";
import { PremiumGate, PremiumBadge } from "@/components/PremiumGate";
import { MaintenanceTab } from "@/components/property/MaintenanceTab";
import { PerformanceTab } from "@/components/property/PerformanceTab";
import { IcalFeedsTab } from "@/components/property/IcalFeedsTab";

export const Route = createFileRoute("/imoveis/$id")({
  head: () => ({ meta: [{ title: "Imóvel — Hostlyb" }, { name: "description", content: "Detalhes do imóvel." }] }),
  component: PropertyDetail,
});

function PropertyDetail() {
  const { currency, lang } = useLocale();
  const t = useT();
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"overview" | "guidebook" | "maintenance" | "performance">("overview");

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

      <nav className="flex gap-1 mb-4 border-b overflow-x-auto">
        {([
          ["overview", "Geral", null],
          ["guidebook", t("guidebook.title"), BookOpen],
          ["maintenance", t("maint.tab"), Wrench],
          ["performance", t("perf.tab"), BarChart3],
        ] as const).map(([k, l, Icon]) => (
          <button key={k} onClick={() => setTab(k as any)}
            className={`px-3 py-2 text-sm whitespace-nowrap border-b-2 -mb-px flex items-center gap-1 ${tab === k ? "border-primary font-semibold" : "border-transparent text-muted-foreground"}`}>
            {Icon && <Icon size={14} />} {l}
            {(k === "guidebook" || k === "maintenance" || k === "performance") && <PremiumBadge />}
          </button>
        ))}
      </nav>

      {tab === "guidebook" && (
        <PremiumGate>
          <div className="text-center py-6">
            <Link to="/imoveis/$id/guia" params={{ id }} className="btn-primary inline-flex justify-center">
              <BookOpen size={14} /> {t("guidebook.title")}
            </Link>
          </div>
        </PremiumGate>
      )}

      {tab === "maintenance" && <PremiumGate><MaintenanceTab propertyId={id} /></PremiumGate>}
      {tab === "performance" && <PremiumGate><PerformanceTab propertyId={id} propertyName={p.name} /></PremiumGate>}

      {tab === "overview" && <>
      <section className="hostly-card mb-4">
        <AddressActions address={fullAddress(p)} />
      </section>

      <section className="mb-4">
        <PropertyScoreBadge propertyId={id} />
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
                  </p>
                  <p className="text-xs text-muted-foreground">{g.checkin_date} → {g.checkout_date}</p>
                </div>
                <span className="font-mono text-xs">{formatMoney(Number(g.total_value ?? 0), currency, lang)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button onClick={() => { if (confirm("Arquivar este imóvel?")) archive.mutate(); }}
        className="btn-secondary justify-center w-full mb-6" style={{ color: "var(--color-warning)" }}>
        <Archive size={14} /> Arquivar imóvel
      </button>
      </>}
    </AppShell>
  );
}

