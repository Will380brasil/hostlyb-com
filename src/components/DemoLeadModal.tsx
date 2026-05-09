import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { X, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

const C = { coral: "#FF6B6B", coralGlow: "rgba(255,107,107,.18)", g600: "#525252", g300: "#D4D4D4" };

export function DemoLeadModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    const phoneOk = phone.replace(/\D/g, "").length >= 8;
    if (!emailOk) return toast.error("Email inválido");
    if (!phoneOk) return toast.error("Telefone inválido");

    setSubmitting(true);
    try {
      await supabase.from("demo_leads").insert({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        source: "landing_demo",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      });
      try { localStorage.setItem("hostlyb_demo_lead", "1"); } catch {}
      navigate({ to: "/app" as any });
    } catch (err: any) {
      toast.error("Erro ao registrar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 100,
        display: "grid", placeItems: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 24, padding: "28px 24px", maxWidth: 420, width: "100%",
          boxShadow: "0 30px 80px rgba(0,0,0,.3)", position: "relative",
        }}
      >
        <button onClick={onClose} aria-label="Fechar"
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: C.g600 }}>
          <X size={20} />
        </button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999, background: C.coralGlow, color: C.coral, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
          <Play size={14} fill={C.coral} /> Acesse a demo
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: "#111" }}>Veja o Hostlyb por dentro</h2>
        <p style={{ fontSize: 14, color: C.g600, marginBottom: 20 }}>
          Preencha email e telefone para liberar o acesso. Sem cadastro, sem cartão.
        </p>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
            required autoComplete="email" inputMode="email"
            style={inp}
          />
          <input
            type="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(e.target.value)}
            required autoComplete="tel" inputMode="tel"
            style={inp}
          />
          <button type="submit" disabled={submitting}
            style={{
              marginTop: 6, padding: "14px 20px", borderRadius: 999, border: "none",
              background: C.coral, color: "#fff", fontWeight: 700, fontSize: 15,
              cursor: submitting ? "wait" : "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 8px 24px ${C.coralGlow}`, opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="#fff" />}
            {submitting ? "Liberando…" : "Acessar demo agora"}
          </button>
        </form>
        <p style={{ marginTop: 14, fontSize: 11, color: "#9E9E9E", textAlign: "center" }}>
          Seus dados ficam salvos com segurança e usados apenas para contato sobre o Hostlyb.
        </p>
      </div>
    </div>
  );
}

const inp: React.CSSProperties = {
  padding: "14px 16px", borderRadius: 12, border: `1px solid ${C.g300}`,
  fontSize: 15, outline: "none", fontFamily: "inherit",
};
