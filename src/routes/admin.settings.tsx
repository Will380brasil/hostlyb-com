import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { listAdminUsers, addAdminUser, removeAdminUser } from "@/lib/admin.functions";
import { Shield, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings · Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const fetchAdmins = useServerFn(listAdminUsers);
  const addAdmin = useServerFn(addAdminUser);
  const removeAdmin = useServerFn(removeAdminUser);
  const qc = useQueryClient();
  const { data: admins = [] } = useQuery({ queryKey: ["admin-list"], queryFn: () => fetchAdmins() });
  const [email, setEmail] = useState("");

  const onAdd = async () => {
    if (!email) return;
    try {
      await addAdmin({ data: { email } });
      toast.success("Admin added");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin-list"] });
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };
  const onRemove = async (user_id: string, em: string) => {
    if (!confirm(`Remove admin access from ${em}?`)) return;
    try {
      await removeAdmin({ data: { user_id } });
      toast.success("Removed");
      qc.invalidateQueries({ queryKey: ["admin-list"] });
    } catch (e: any) { toast.error(e.message || "Failed"); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Settings</h1>
      <section style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Administrators ({(admins as any[]).length})</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="email@domain.com"
            style={{ flex: "1 1 240px", padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14 }} />
          <button onClick={onAdd}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FF6B6B", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>
            <Plus size={14} /> Add admin
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>{["Email", "Added", ""].map(h => <th key={h} style={{ padding: "10px 12px", fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {(admins as any[]).map(a => (
              <tr key={a.user_id} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px" }}><Shield size={12} style={{ display: "inline", marginRight: 6, color: "#FF6B6B" }} />{a.email}</td>
                <td style={{ padding: "10px 12px", color: "#64748b" }}>{new Date(a.created_at).toLocaleDateString("pt-BR")}</td>
                <td style={{ padding: "10px 12px", textAlign: "right" }}>
                  <button onClick={() => onRemove(a.user_id, a.email)} style={{ background: "transparent", border: "none", color: "#94a3b8", cursor: "pointer" }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 10 }}>User must already have a Hostlyb account before being added as admin.</p>
      </section>
    </div>
  );
}
