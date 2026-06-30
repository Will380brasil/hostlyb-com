import { Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, Home, Sparkles, Users, Calendar, Bell, UsersRound, Shield, DollarSign, BarChart3 } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TrialBanner, TrialGate } from "@/components/TrialGate";
import { InstallButton } from "@/components/InstallButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useT } from "@/lib/i18n";


export function AppShell({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { session, loading, signOut } = useAuth();
  const qc = useQueryClient();
  const t = useT();

  const tabs = [
    { to: "/app",        label: t("app.tab.dashboard"),  icon: LayoutDashboard },
    { to: "/imoveis",    label: t("app.tab.properties"), icon: Home },
    { to: "/limpezas",   label: t("app.tab.cleanings"),  icon: Sparkles },
    { to: "/hospedes",   label: t("app.tab.guests"),     icon: Users },
    { to: "/calendario", label: t("app.tab.calendar"),   icon: Calendar },
    { to: "/financeiro", label: t("app.tab.finance"),    icon: DollarSign },
    { to: "/relatorios", label: t("shell.reports"),      icon: BarChart3 },
  ] as const;


  const { data: unread = 0 } = useQuery({
    queryKey: ["alerts-unread", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { count } = await supabase.from("alerts").select("id", { count: "exact", head: true }).eq("is_read", false).eq("is_dismissed", false);
      return count ?? 0;
    },
  });

  const { data: isAdmin = false } = useQuery({
    queryKey: ["is-admin", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase.from("admin_users").select("user_id").eq("user_id", session!.user.id).maybeSingle();
      return !!data;
    },
  });

  useEffect(() => {
    if (!session?.user.id) return;
    const ch = supabase
      .channel("alerts-shell")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts", filter: `user_id=eq.${session.user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["alerts-unread"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session?.user.id, qc]);

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" as any });
  }, [session, loading, navigate]);

  if (loading || !session) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">{t("app.loading")}</div>;
  }


  return (
    <div className="min-h-screen flex flex-col mx-auto w-full max-w-[480px] md:max-w-6xl bg-background">
      <TrialBanner />
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 h-14 bg-background/90 backdrop-blur border-b border-card-border">
        <Link to={(session ? "/app" : "/") as any} className="text-2xl font-black tracking-tight">
          Host<span style={{ color: "var(--color-accent)" }}>lyb</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === "/app" ? pathname === "/app" : pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium"
                style={{
                  color: active ? "var(--color-accent)" : "var(--color-muted-foreground)",
                  background: active ? "var(--color-card)" : "transparent",
                }}
              >
                <Icon size={16} strokeWidth={active ? 2.4 : 1.8} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSelector compact />
          <InstallButton compact />

          {isAdmin && (
            <Link
              to={"/admin" as any}
              aria-label={t("app.admin")}
              title={t("app.admin")}
              className="grid place-items-center w-10 h-10 rounded-full border"
              style={{ background: "#FFF1F1", borderColor: "#FFCCCC", color: "#FF6B6B" }}
            >
              <Shield size={16} />
            </Link>
          )}
          <Link
            to={"/equipe" as any}
            aria-label={t("app.team")}
            className="grid place-items-center w-10 h-10 rounded-full bg-card border border-card-border"
          >
            <UsersRound size={16} />
          </Link>
          <Link
            to={"/alertas" as any}
            aria-label={t("app.alerts")}
            className="relative grid place-items-center w-10 h-10 rounded-full bg-card border border-card-border"
          >
            <Bell size={16} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold text-white grid place-items-center"
                style={{ background: "var(--color-destructive, #ef4444)" }}>
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Link>
          <button
            aria-label={t("app.logout")}
            onClick={() => { signOut(); navigate({ to: "/login" as any }); }}
            className="grid place-items-center w-10 h-10 rounded-full bg-card border border-card-border"
          >
            <LogOut size={16} />
          </button>
        </div>

      </header>

      <main className="flex-1 px-4 md:px-8 pt-4 pb-28 md:pb-12">
        <TrialGate>{children ?? <Outlet />}</TrialGate>
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 mx-auto max-w-[480px] border-t border-card-border bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-7">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === "/app" ? pathname === "/app" : pathname.startsWith(to);
            return (
              <li key={to}>
                <Link
                  to={to}
                  className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium"
                  style={{ color: active ? "var(--color-accent)" : "var(--color-muted-foreground)" }}
                >
                  <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </nav>
    </div>
  );
}
