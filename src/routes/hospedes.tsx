import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { guests, getProperty, formatBRL } from "@/lib/mock-data";
import { Plus, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/hospedes")({
  head: () => ({ meta: [{ title: "Hóspedes — Hostly" }, { name: "description", content: "Gerencie seus hóspedes." }] }),
  component: GuestsPage,
});

const platformLabel = { airbnb: "Airbnb", booking: "Booking", direto: "Direto" } as const;

function GuestsPage() {
  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Hóspedes</h2>
        <button className="btn-primary !py-2 !px-3"><Plus size={16} /> Novo</button>
      </header>

      <ul className="flex flex-col gap-3">
        {guests.map((g) => {
          const prop = getProperty(g.property_id);
          return (
            <li key={g.id} className="hostly-card !p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{g.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{prop?.name}</p>
                </div>
                <StatusBadge status={g.status} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{g.checkin_date} → {g.checkout_date}</span>
                <span>{g.nights} noites</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="hostly-pill" style={{ background: "var(--color-info-soft)", color: "var(--color-info)" }}>
                  {platformLabel[g.platform]}
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm" style={{ color: "var(--color-success)" }}>
                    {formatBRL(g.total_value)}
                  </span>
                  {g.phone && (
                    <>
                      <a href={`tel:+${g.phone}`} className="grid place-items-center w-8 h-8 rounded-full bg-secondary">
                        <Phone size={13} />
                      </a>
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
          );
        })}
      </ul>
    </AppShell>
  );
}
