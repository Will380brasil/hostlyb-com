import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { cleaningJobs, cleaners, getProperty, getCleaner, formatBRL } from "@/lib/mock-data";
import { Plus, Phone, MessageCircle, Star, Clock } from "lucide-react";

export const Route = createFileRoute("/limpezas")({
  head: () => ({ meta: [{ title: "Limpezas — Hostly" }, { name: "description", content: "Agenda de limpezas e profissionais." }] }),
  component: CleaningsPage,
});

function CleaningsPage() {
  const [tab, setTab] = useState<"agenda" | "profissionais">("agenda");

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Limpezas</h2>
        <button className="btn-primary !py-2 !px-3"><Plus size={16} /> Agendar</button>
      </header>

      <div className="flex p-1 rounded-xl bg-card border border-card-border mb-4">
        {(["agenda", "profissionais"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition"
            style={{
              background: tab === t ? "var(--color-accent)" : "transparent",
              color: tab === t ? "var(--color-accent-foreground)" : "var(--color-muted-foreground)",
            }}
          >
            {t === "agenda" ? "Agenda" : "Profissionais"}
          </button>
        ))}
      </div>

      {tab === "agenda" ? <AgendaList /> : <ProfissionaisList />}
    </AppShell>
  );
}

function AgendaList() {
  return (
    <ul className="flex flex-col gap-3">
      {cleaningJobs.map((j) => {
        const prop = getProperty(j.property_id);
        const cleaner = getCleaner(j.cleaner_id);
        const done = j.checklist.filter((c) => c.done).length;
        const pct = Math.round((done / j.checklist.length) * 100);
        return (
          <li key={j.id} className="hostly-card !p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold truncate">{prop?.name}</p>
                <p className="text-xs text-muted-foreground">{cleaner?.name}</p>
              </div>
              <StatusBadge status={j.status} />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Clock size={12} /> {j.scheduled_date} · {j.scheduled_time}</span>
              <span className="font-mono">{formatBRL(j.payment_amount)}</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                <span>Checklist</span><span>{done}/{j.checklist.length}</span>
              </div>
              <div className="w-full h-1.5 rounded-full" style={{ background: "var(--color-card-border)" }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--color-success)" }} />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ProfissionaisList() {
  return (
    <ul className="flex flex-col gap-3">
      {cleaners.map((c) => (
        <li key={c.id} className="hostly-card !p-4 flex items-center gap-3">
          <div className="grid place-items-center w-12 h-12 rounded-full font-bold"
               style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
            {c.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{c.name}</p>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-2">
              <Star size={12} style={{ color: "var(--color-warning)" }} /> {c.rating} · {c.total_cleanings} limpezas
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href={`tel:+${c.phone}`} className="grid place-items-center w-9 h-9 rounded-full bg-secondary">
              <Phone size={15} />
            </a>
            <a href={`https://wa.me/${c.phone}`} target="_blank" rel="noreferrer"
               className="grid place-items-center w-9 h-9 rounded-full"
               style={{ background: "var(--color-success-soft)", color: "var(--color-success)" }}>
              <MessageCircle size={15} />
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
