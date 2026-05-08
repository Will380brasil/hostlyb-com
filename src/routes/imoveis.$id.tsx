import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { AddressActions } from "@/components/AddressActions";
import {
  getProperty, fullAddress, cleaningJobs, guests, cleaners, getCleaner, formatBRL,
} from "@/lib/mock-data";
import { ArrowLeft, BedDouble, Bath, Users, Wifi, Pencil, Sparkles } from "lucide-react";

export const Route = createFileRoute("/imoveis/$id")({
  head: ({ params }) => ({
    meta: [{ title: `Imóvel — Hostly` }, { name: "description", content: `Detalhes do imóvel ${params.id}` }],
  }),
  component: PropertyDetail,
  notFoundComponent: () => (
    <AppShell><p className="text-muted-foreground">Imóvel não encontrado.</p></AppShell>
  ),
});

function PropertyDetail() {
  const { id } = Route.useParams();
  const p = getProperty(id);
  if (!p) throw notFound();

  const propJobs = cleaningJobs.filter((j) => j.property_id === id);
  const propGuests = guests.filter((g) => g.property_id === id);
  const linkedCleaners = cleaners.slice(0, 2);

  return (
    <AppShell>
      <Link to="/imoveis" className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <ArrowLeft size={16} /> Voltar
      </Link>

      <header className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-bold leading-tight">{p.name}</h2>
          <p className="text-sm text-muted-foreground">{p.city} · {p.state}</p>
        </div>
        <StatusBadge status={p.status} />
      </header>

      <section className="hostly-card mb-4">
        <AddressActions address={fullAddress(p)} />
      </section>

      <section className="hostly-card mb-4">
        <h3 className="font-bold mb-3">Detalhes</h3>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary">
            <BedDouble size={18} /><span className="font-semibold">{p.bedrooms}</span>
            <span className="text-[10px] text-muted-foreground">Quartos</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary">
            <Bath size={18} /><span className="font-semibold">{p.bathrooms}</span>
            <span className="text-[10px] text-muted-foreground">Banheiros</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-secondary">
            <Users size={18} /><span className="font-semibold">{p.max_guests}</span>
            <span className="text-[10px] text-muted-foreground">Hóspedes</span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-sm">
          <Wifi size={16} style={{ color: "var(--color-info)" }} />
          <span className="text-muted-foreground">Wi-Fi:</span>
          <code className="font-mono text-foreground">{p.wifi_password}</code>
        </div>
      </section>

      <section className="hostly-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Profissionais vinculados</h3>
          <button className="text-xs" style={{ color: "var(--color-accent)" }}>+ Vincular</button>
        </div>
        <ul className="flex flex-col gap-2">
          {linkedCleaners.map((c) => (
            <li key={c.id} className="flex items-center gap-3">
              <div className="grid place-items-center w-9 h-9 rounded-full font-bold text-sm"
                   style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
                {c.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{c.name}</p>
                <p className="text-xs text-muted-foreground">★ {c.rating} · {c.total_cleanings} limpezas</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="hostly-card mb-4">
        <h3 className="font-bold mb-3 flex items-center gap-2"><Sparkles size={16} /> Histórico de limpezas</h3>
        {propJobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma limpeza registrada.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {propJobs.map((j) => (
              <li key={j.id} className="flex items-center justify-between text-sm">
                <span>{j.scheduled_date} · {getCleaner(j.cleaner_id)?.name}</span>
                <StatusBadge status={j.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="hostly-card mb-4">
        <h3 className="font-bold mb-3">Histórico de hóspedes</h3>
        {propGuests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem hóspedes ainda.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {propGuests.map((g) => (
              <li key={g.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold">{g.name}</p>
                  <p className="text-xs text-muted-foreground">{g.checkin_date} → {g.checkout_date}</p>
                </div>
                <span className="font-mono text-xs">{formatBRL(g.total_value)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button className="btn-secondary w-full"><Pencil size={14} /> Editar imóvel</button>
    </AppShell>
  );
}
