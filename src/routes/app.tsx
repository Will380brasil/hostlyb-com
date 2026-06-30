import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { StatusBadge } from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { Wallet, Home, Star, Users as UsersIcon, AlertTriangle, ChevronRight, Clock } from "lucide-react";
import { Onboarding, OnboardingHelpButton, useOnboarding } from "@/components/Onboarding";
import { OperationCenter } from "@/components/dashboard/OperationCenter";
import { FinancialSummary } from "@/components/dashboard/FinancialSummary";
import { GuestChart } from "@/components/dashboard/GuestChart";
import { OperationProgress } from "@/components/dashboard/OperationProgress";
import { InstallBanner } from "@/components/InstallBanner";
import { IcalExportCard } from "@/components/IcalExportCard";

export const Route = createFileRoute("/app")({
  head: () => ({ meta: [{ title: "Dashboard — Hostlyb" }, { name: "description", content: "Visão geral dos seus imóveis." }] }),
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
  const { currency, lang, t } = useLocale();
  const fm = (v: number) => formatMoney(v, currency, lang);
  const navigate = useNavigate();
  const { data: needsOnboarding } = useQuery({
    queryKey: ["needs-onboarding"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", u.user.id)
        .maybeSingle();
      return data ? data.onboarding_completed === false : false;
    },
  });
  useEffect(() => {
    if (needsOnboarding) navigate({ to: "/assinar" as any, search: { onboarding: "1" } as any });
  }, [needsOnboarding, navigate]);
  const { data: properties = [] } = useQuery({
    queryKey: ["properties"],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties").select("*").eq("archived", false).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ["cleaning_jobs", "upcoming"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cleaning_jobs")
        .select("*, properties(name), cleaners(name)")
        .order("scheduled_date").limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: guests = [] } = useQuery({
    queryKey: ["guests", "month"],
    queryFn: async () => {
      const { data, error } = await supabase.from("guests").select("id, total_value, checkin_date");
      if (error) throw error;
      return data ?? [];
    },
  });
  const { data: pendingForgotten = 0 } = useQuery({
    queryKey: ["forgotten_pending"],
    queryFn: async () => {
      const { count } = await supabase.from("forgotten_items").select("id", { count: "exact", head: true })
        .not("status", "in", "(devolvido,descartado)");
      return count ?? 0;
    },
  });

  const monthlyRevenue = properties.reduce((s, p) => s + Number(p.income_monthly ?? 0), 0);
  const avgRating = properties.length
    ? (properties.reduce((s, p) => s + Number(p.rating ?? 0), 0) / properties.length).toFixed(1)
    : "—";

  const onboarding = useOnboarding();

  return (
    <AppShell>
      <Onboarding open={onboarding.open} onClose={onboarding.close} />
      <section className="mb-2 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">{t("app.welcome")}</p>
          <h2 className="text-2xl font-bold">{t("app.todayOp")}</h2>
        </div>
        <OnboardingHelpButton onClick={onboarding.show} />
      </section>

      <InstallBanner />

      {/* New: Today in your operation */}
      <OperationCenter />

      {/* New: Financial summary */}
      <FinancialSummary />

      {/* New: Guest chart */}
      <GuestChart />

      {/* New: Operation progress */}
      <IcalExportCard />

      <OperationProgress />

      <section className="grid grid-cols-2 gap-3 mt-6">
        <KpiCard icon={Wallet} label={t("app.kpi.revenue")} value={fm(monthlyRevenue)} color="#FF5A5F" />
        <KpiCard icon={Home} label={t("app.kpi.properties")} value={String(properties.length)} color="#4A9EFF" />
        <KpiCard icon={Star} label={t("app.kpi.rating")} value={`${avgRating} ★`} color="#FFB347" />
        <KpiCard icon={UsersIcon} label={t("app.kpi.guests")} value={String(guests.length)} color="#00C896" />
      </section>

      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">{t("app.yourProperties")}</h3>
          <Link to="/imoveis" className="text-xs text-muted-foreground flex items-center">{t("app.viewAll")} <ChevronRight size={14} /></Link>
        </div>
        {properties.length === 0 ? (
          <div className="hostly-card text-center text-sm text-muted-foreground">
            <p className="mb-2">{t("app.noProperties")}</p>
            <Link to="/imoveis" style={{ color: "var(--color-accent)" }}>{t("app.addNow")}</Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto -mx-4 px-4 pb-2">
            {properties.map((p: any) => (
              <Link key={p.id} to="/imoveis/$id" params={{ id: p.id }} className="hostly-card min-w-[220px] !p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold truncate">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
                <p className="text-xs text-muted-foreground">{p.city ?? "—"} · {p.state ?? ""}</p>
                <p className="text-sm font-mono mt-2" style={{ color: "var(--color-success)" }}>
                  {fm(Number(p.income_monthly ?? 0))}<span className="text-xs text-muted-foreground">{t("app.perMonth")}</span>
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">{t("app.upcomingCleanings")}</h3>
          <Link to="/limpezas" className="text-xs text-muted-foreground flex items-center">{t("app.viewSchedule")} <ChevronRight size={14} /></Link>
        </div>
        {jobs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("app.noCleanings")}</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {jobs.slice(0, 3).map((j: any) => (
              <li key={j.id} className="hostly-card !p-4 flex items-center gap-3">
                <div className="grid place-items-center w-10 h-10 rounded-full font-bold text-sm"
                  style={{ background: "var(--color-warning-soft)", color: "var(--color-warning)" }}>
                  {j.cleaners?.name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{j.properties?.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{j.cleaners?.name ?? t("app.noStaff")}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground justify-end">
                    <Clock size={12} /> {j.scheduled_time?.slice(0, 5)}
                  </div>
                  <StatusBadge status={j.status} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pendingForgotten > 0 && (
        <section className="mt-7 mb-2">
          <h3 className="font-bold mb-3">{t("app.alertsTitle")}</h3>
          <Link to="/limpezas" className="hostly-card !p-4 flex items-start gap-3"
            style={{ background: "var(--color-warning-soft)", borderColor: "transparent" }}>
            <AlertTriangle size={18} style={{ color: "var(--color-warning)" }} className="mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold">{pendingForgotten} {t("app.forgottenLabel")}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{t("app.forgottenAction")}</p>
            </div>
          </Link>
        </section>
      )}
    </AppShell>
  );
}
