import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { properties, formatBRL } from "@/lib/mock-data";
import { Plus, ChevronRight, BedDouble, Bath, Users } from "lucide-react";

export const Route = createFileRoute("/imoveis/")({
  head: () => ({ meta: [{ title: "Imóveis — Hostly" }, { name: "description", content: "Gerencie seus imóveis." }] }),
  component: PropertiesPage,
});

function PropertiesPage() {
  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-2xl font-bold">Imóveis</h2>
          <p className="text-sm text-muted-foreground">{properties.length} cadastrados</p>
        </div>
        <button className="btn-primary !py-2 !px-3"><Plus size={16} /> Novo</button>
      </header>

      <ul className="flex flex-col gap-3">
        {properties.map((p) => (
          <li key={p.id}>
            <Link to="/imoveis/$id" params={{ id: p.id }} className="hostly-card !p-4 flex flex-col gap-3 active:scale-[0.99] transition">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{p.name}</h3>
                  <p className="text-xs text-muted-foreground truncate">{p.address}, {p.city} - {p.state}</p>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><BedDouble size={13} />{p.bedrooms}</span>
                  <span className="inline-flex items-center gap-1"><Bath size={13} />{p.bathrooms}</span>
                  <span className="inline-flex items-center gap-1"><Users size={13} />{p.max_guests}</span>
                </div>
                <div className="flex items-center gap-1 text-sm font-mono" style={{ color: "var(--color-success)" }}>
                  {formatBRL(p.income_monthly)} <ChevronRight size={14} className="text-muted-foreground" />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
