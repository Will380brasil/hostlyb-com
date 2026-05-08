import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Bell, LayoutDashboard, Home, Sparkles, Users, Calendar } from "lucide-react";
import type { ReactNode } from "react";

const tabs = [
  { to: "/app",       label: "Dashboard", icon: LayoutDashboard },
  { to: "/imoveis",   label: "Imóveis",   icon: Home },
  { to: "/limpezas",  label: "Limpezas",  icon: Sparkles },
  { to: "/hospedes",  label: "Hóspedes",  icon: Users },
  { to: "/calendario", label: "Calendário", icon: Calendar },
] as const;

export function AppShell({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col mx-auto w-full max-w-[480px] bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between px-5 h-14 bg-background/90 backdrop-blur border-b border-card-border">
        <h1 className="text-2xl font-black tracking-tight">
          Host<span style={{ color: "var(--color-accent)" }}>ly</span>
        </h1>
        <button
          aria-label="Notificações"
          className="relative grid place-items-center w-10 h-10 rounded-full bg-card border border-card-border"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "var(--color-accent)" }} />
        </button>
      </header>

      <main className="flex-1 px-4 pt-4 pb-28">
        {children ?? <Outlet />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 mx-auto max-w-[480px] border-t border-card-border bg-card/95 backdrop-blur">
        <ul className="grid grid-cols-5">
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
