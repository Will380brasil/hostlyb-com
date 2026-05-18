import { createFileRoute, redirect, Link, Outlet, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, Users, TrendingUp, Activity, Mail, Settings } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin · Hostlyb" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/login" as any });
    const email = data.user.email?.toLowerCase();
    if (email === "brasgold1@gmail.com") return;
    const { data: row } = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (!row) throw redirect({ to: "/app" as any });
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/revenue", label: "Plans & Revenue", icon: TrendingUp },
  { to: "/admin/activity", label: "Activity", icon: Activity },
  { to: "/admin/emails", label: "Emails", icon: Mail },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

function AdminLayout() {
  const loc = useLocation();
  return (
    <div style={{ minHeight: "100vh", background: "#F7F7F8", display: "grid", gridTemplateColumns: "240px 1fr", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <aside style={{ background: "#0F172A", color: "#fff", padding: "24px 16px", position: "sticky", top: 0, height: "100vh" }}>
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 28, padding: "0 8px" }}>
          Hostlyb <span style={{ color: "#FF6B6B" }}>Admin</span>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV.map((n) => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            const Icon = n.icon;
            return (
              <Link key={n.to} to={n.to as any}
                style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 8,
                  fontSize: 14, fontWeight: 600, color: active ? "#fff" : "#94a3b8",
                  background: active ? "#1e293b" : "transparent", textDecoration: "none",
                }}>
                <Icon size={16} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
          <Link to="/app" style={{ color: "#64748b", fontSize: 12, textDecoration: "none" }}>← Back to app</Link>
        </div>
      </aside>
      <main style={{ padding: "28px 32px", overflow: "auto" }}>
        <Outlet />
      </main>
    </div>
  );
}
