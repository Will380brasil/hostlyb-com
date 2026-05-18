import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getActivityFeed } from "@/lib/admin.functions";
import { LogIn, UserPlus } from "lucide-react";

export const Route = createFileRoute("/admin/activity")({
  head: () => ({ meta: [{ title: "Activity · Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: ActivityPage,
});

function ActivityPage() {
  const fetch = useServerFn(getActivityFeed);
  const { data } = useQuery({ queryKey: ["admin-activity"], queryFn: () => fetch(), refetchInterval: 60_000 });
  if (!data) return <p style={{ color: "#64748b" }}>Loading…</p>;
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Activity</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Recent events</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, maxHeight: 600, overflow: "auto" }}>
            {data.recent.map((e: any, i: number) => (
              <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#f8fafc", borderRadius: 8 }}>
                {e.type === "signup" ? <UserPlus size={14} color="#4ade80" /> : <LogIn size={14} color="#3b82f6" />}
                <span style={{ fontSize: 13, fontWeight: 600 }}>{e.email}</span>
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#64748b" }}>{new Date(e.ts).toLocaleString("pt-BR")}</span>
              </li>
            ))}
          </ul>
        </section>
        <section style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb" }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Never logged back</h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8, maxHeight: 600, overflow: "auto" }}>
            {data.neverReturned.map((u: any, i: number) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 10px", background: "#fef2f2", borderRadius: 8 }}>
                <span style={{ fontSize: 13 }}>{u.email}</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
