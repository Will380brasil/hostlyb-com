import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getEmailStats, sendManualBlast, sendAuthTestEmail } from "@/lib/admin.functions";
import { Send, Mail } from "lucide-react";

export const Route = createFileRoute("/admin/emails")({
  head: () => ({ meta: [{ title: "Emails · Admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: EmailsPage,
});

function EmailsPage() {
  const fetch = useServerFn(getEmailStats);
  const blast = useServerFn(sendManualBlast);
  const sendAuthTest = useServerFn(sendAuthTestEmail);
  const { data } = useQuery({ queryKey: ["admin-email-stats"], queryFn: () => fetch(), refetchInterval: 60_000 });

  const [audience, setAudience] = useState<"all" | "free" | "pro" | "premium" | "inactive7">("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingType, setTestingType] = useState<string | null>(null);

  const AUTH_TYPES: { key: string; label: string }[] = [
    { key: "signup", label: "Signup (confirmar e-mail)" },
    { key: "magiclink", label: "Magic link" },
    { key: "recovery", label: "Reset de senha" },
    { key: "invite", label: "Convite" },
    { key: "email_change", label: "Mudança de e-mail" },
    { key: "reauthentication", label: "Reautenticação (OTP)" },
  ];

  const sendTest = async (type: string) => {
    setTestingType(type);
    try {
      const r: any = await sendAuthTest({ data: { type, recipientEmail: testEmail || undefined } });
      toast.success(`Enviado para ${r.recipient}`);
    } catch (e: any) {
      toast.error(e.message || "Falhou");
    } finally {
      setTestingType(null);
    }
  };

  const send = async () => {
    if (!subject || !body) return toast.error("Subject and body required");
    if (!confirm(`Send to audience "${audience}"? This cannot be undone.`)) return;
    setSending(true);
    try {
      const r: any = await blast({ data: { audience, subject, body, confirm: true } });
      toast.success(`Queued ${r.queued} of ${r.total}`);
      setSubject(""); setBody("");
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSending(false); }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>Emails</h1>

      <section style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb", marginBottom: 16 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Automated · last 30 days</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>{["Template", "Sent", "Failed", "Total"].map(h => <th key={h} style={{ padding: "10px 12px", fontSize: 11, color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {Object.entries(data?.byTemplate ?? {}).map(([t, s]: any) => (
              <tr key={t} style={{ borderTop: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{t}</td>
                <td style={{ padding: "10px 12px", color: "#16a34a" }}>{s.sent}</td>
                <td style={{ padding: "10px 12px", color: "#dc2626" }}>{s.failed}</td>
                <td style={{ padding: "10px 12px" }}>{s.total}</td>
              </tr>
            ))}
            {!data?.byTemplate || !Object.keys(data.byTemplate).length ? (
              <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: "#64748b" }}>No emails sent in the last 30 days.</td></tr>
            ) : null}
          </tbody>
        </table>
      </section>

      <section style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #e5e7eb" }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Manual blast</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <select value={audience} onChange={(e) => setAudience(e.target.value as any)}
            style={inp}>
            <option value="all">All users</option>
            <option value="free">Free users</option>
            <option value="pro">Pro users</option>
            <option value="premium">Premium users</option>
            <option value="inactive7">Inactive 7d+</option>
          </select>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={inp} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Body (supports line breaks)" rows={8} style={{ ...inp, fontFamily: "inherit", resize: "vertical" }} />
          <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 12, background: "#f8fafc", borderRadius: 8 }}>
            <strong style={{ fontSize: 13 }}>Preview:</strong>
            <span style={{ fontSize: 13 }}>{subject || "(subject)"}</span>
          </div>
          <button onClick={send} disabled={sending}
            style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#FF6B6B", color: "#fff", border: "none", padding: "12px 18px", borderRadius: 8, fontWeight: 700, cursor: "pointer", opacity: sending ? 0.6 : 1 }}>
            <Send size={14} /> {sending ? "Sending…" : "Send blast"}
          </button>
        </div>
      </section>
    </div>
  );
}

const inp: React.CSSProperties = { padding: "10px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, background: "#fff" };
