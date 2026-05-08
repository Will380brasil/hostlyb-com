import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import {
  properties, cleaningJobs, guests, cleaners,
  formatBRL, getProperty, getCleaner,
} from "@/lib/mock-data";
import { Wallet, Home, Star, Users as UsersIcon, AlertTriangle, ChevronRight, Clock } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Hostly" },
      { name: "description", content: "Visão geral dos seus imóveis, receitas e operações." },
    ],
  }),
  component: Dashboard,
});

function KpiCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className="hostly-card !p-4 flex flex-col gap-2">
      <div className="grid place-items-center w-9 h-9 rounded-xl" style={{ background: color + "22", color }}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-xl font-bold leading-tight">{value}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
      </div>
    </div>
  );
}

function Dashboard() {
  const monthlyRevenue = properties.reduce((s, p) => s + p.income_monthly, 0);
  const avgRating = (properties.reduce((s, p) => s + p.rating, 0) / properties.length).toFixed(1);

  return (
    <AppShell>
      <section className="mb-2">
        <p className="text-sm text-muted-foreground">Bem-vindo de volta 👋</p>
        <h2 className="text-2xl font-bold">Sua operação hoje</h2>
      </section>

      <section className="grid grid-cols-2 gap-3 mt-4">
        <KpiCard icon={Wallet} label="Receita do mês" value={formatBRL(monthlyRevenue)} color="#FF5A5F" />
        <KpiCard icon={Home} label="Imóveis ativos" value={String(properties.length)} color="#4A9EFF" />
        <KpiCard icon={Star} label="Avaliação média" value={`${avgRating} ★`} color="#FFB347" />
        <KpiCard icon={UsersIcon} label="Hóspedes no mês" value={String(guests.length)} color="#00C896" />
      </section>

      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Seus imóveis</h3>
          <Link to="/imoveis" className="text-xs text-muted-foreground flex items-center">Ver todos <ChevronRight size={14} /></Link>
        </div>
        <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2">
          {properties.map((p) => (
            <Link
              key={p.id}
              to="/imoveis/$id"
              params={{ id: p.id }}
              className="hostly-card min-w-[220px] !p-4 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{p.name}</span>
                <StatusBadge status={p.status} />
              </div>
              <p className="text-xs text-muted-foreground">{p.city} · {p.state}</p>
              <p className="text-sm font-mono mt-2" style={{ color: "var(--color-success)" }}>
                {formatBRL(p.income_monthly)}<span className="text-xs text-muted-foreground"> /mês</span>
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Próximas limpezas</h3>
          <Link to="/limpezas" className="text-xs text-muted-foreground flex items-center">Ver agenda <ChevronRight size={14} /></Link>
        </div>
        <ul className="flex flex-col gap-3">
          {cleaningJobs.slice(0, 3).map((j) => {
            const prop = getProperty(j.property_id);
            const cleaner = getCleaner(j.cleaner_id);
            return (
              <li key={j.id} className="hostly-card !p-4 flex items-center gap-3">
                <div className="grid place-items-center w-10 h-10 rounded-full font-bold text-sm"
                     style={{ background: "var(--color-warning-soft)", color: "var(--color-warning)" }}>
                  {cleaner?.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{prop?.name}</p>
                  <p className="text-xs text-muted-foreground">{cleaner?.name}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                    <Clock size={12} /> {j.scheduled_time}
                  </div>
                  <StatusBadge status={j.status} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-7 mb-2">
        <h3 className="font-bold mb-3">Alertas</h3>
        <div className="hostly-card !p-4 flex items-start gap-3"
             style={{ background: "var(--color-warning-soft)", borderColor: "transparent" }}>
          <AlertTriangle size={18} style={{ color: "var(--color-warning)" }} className="mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">Checkout amanhã: Apt Jardins 201</p>
            <p className="text-muted-foreground text-xs mt-0.5">Sugerimos agendar uma limpeza para o dia seguinte.</p>
          </div>
        </div>
      </section>

      <p className="text-center text-[11px] text-muted-foreground mt-8">
        {cleaners.length} profissionais ativos
      </p>
    </AppShell>
  );
}
