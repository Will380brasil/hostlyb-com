import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { getAdminMetrics, updateUserAdmin } from "@/lib/admin.functions";
import { Ban, RotateCcw, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users · Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: UsersPage,
});

function UsersPage() {
  const fetchMetrics = useServerFn(getAdminMetrics);
  const updateUser = useServerFn(updateUserAdmin);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-metrics"], queryFn: () => fetchMetrics(), refetchInterval: 30_000 });
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<string>("all");

  const filtered = useMemo(() => {
    const users = data?.users ?? [];
    const t = q.trim().toLowerCase();
    return users.filter((u: any) => {
      if (tier !== "all" && u.plan_tier !== tier) return false;
      if (!t) return true;
      return [u.email, u.phone, u.name].some((v) => String(v ?? "").toLowerCase().includes(t));
    });
  }, [data, q, tier]);

  const act = async (user_id: string, action: "suspend" | "unsuspend" | "delete", email: string) => {
    if (action === "delete" && !confirm(`Delete user ${email}? This is permanent.`)) return;
    try {
      await updateUser({ data: { user_id, action } });
      toast.success("Done");
      qc.invalidateQueries({ queryKey: ["admin-metrics"] });
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Users ({filtered.length})</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search email, name, phone…"
          style={{ flex: "1 1 240px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "#fff" }} />
        <select value={tier} onChange={(e) => setTier(e.target.value)}
          style={{ padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "#fff" }}>
          <option value="all">All plans</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="premium">Premium</option>
        </select>
      </div>
      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead style={{ background: "#f8fafc", textAlign: "left" }}>
              <tr>
                {["Email", "Name", "Plan", "Lang", "Last login", "Joined", "Status", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 200).map((u: any) => (
                <tr key={u.id} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={cellStyle}>{u.email}</td>
                  <td style={cellStyle}>{u.name}</td>
                  <td style={cellStyle}><TierBadge t={u.plan_tier} /></td>
                  <td style={cellStyle}>{u.locale?.toUpperCase()}</td>
                  <td style={{ ...cellStyle, color: "#64748b" }}>{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString("pt-BR") : "—"}</td>
                  <td style={{ ...cellStyle, color: "#64748b" }}>{u.created_at ? new Date(u.created_at).toLocaleDateString("pt-BR") : "—"}</td>
                  <td style={cellStyle}>{u.suspended_at ? <span style={{ color: "#f87171", fontWeight: 600 }}>Suspended</span> : <span style={{ color: "#4ade80" }}>●</span>}</td>
                  <td style={{ ...cellStyle, textAlign: "right", whiteSpace: "nowrap" }}>
                    {u.suspended_at
                      ? <IconBtn onClick={() => act(u.id, "unsuspend", u.email)} title="Unsuspend"><RotateCcw size={14} /></IconBtn>
                      : <IconBtn onClick={() => act(u.id, "suspend", u.email)} title="Suspend"><Ban size={14} /></IconBtn>}
                    <IconBtn onClick={() => act(u.id, "delete", u.email)} title="Delete" danger><Trash2 size={14} /></IconBtn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {filtered.length > 200 && <p style={{ color: "#64748b", fontSize: 12, marginTop: 10 }}>Showing first 200 of {filtered.length}. Refine search.</p>}
    </div>
  );
}

const cellStyle: React.CSSProperties = { padding: "10px 12px", color: "#0f172a" };

function TierBadge({ t }: { t: string }) {
  const map: Record<string, { bg: string; fg: string }> = {
    free: { bg: "#f1f5f9", fg: "#475569" },
    pro: { bg: "#dbeafe", fg: "#1e40af" },
    premium: { bg: "#f3e8ff", fg: "#7e22ce" },
  };
  const c = map[t] || map.free;
  return <span style={{ background: c.bg, color: c.fg, fontWeight: 700, padding: "2px 8px", borderRadius: 999, fontSize: 11 }}>{t}</span>;
}
function IconBtn({ children, onClick, title, danger }: any) {
  return (
    <button onClick={onClick} title={title}
      style={{ background: "transparent", border: "none", padding: 6, marginLeft: 4, cursor: "pointer", color: danger ? "#f87171" : "#64748b" }}>
      {children}
    </button>
  );
}
