import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "@tanstack/react-router";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { AlertTriangle, Lock, ArrowRight } from "lucide-react";

const ALLOWED_WHEN_BLOCKED = ["/assinar", "/login", "/signup", "/auth/callback", "/diagnostico", "/admin"];

export function TrialBanner() {
  const t = useTrialStatus();
  if (t.loading || t.hasActiveSubscription || !t.showTrialWarning) return null;

  return (
    <div style={{
      background: "linear-gradient(90deg, #FFE9B0, #FFD580)",
      color: "#7a4a00", padding: "10px 16px",
      display: "flex", alignItems: "center", gap: 10, justifyContent: "center",
      fontSize: 13, fontWeight: 600, flexWrap: "wrap",
    }}>
      <AlertTriangle size={16} />
      <span>
        {t.daysRemaining === 1 ? "Último dia do seu período grátis!" : `Faltam ${t.daysRemaining} dias do seu período grátis.`}
      </span>
      <Link to={"/assinar" as any} style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        background: "#7a4a00", color: "#fff", padding: "4px 12px", borderRadius: 999, fontWeight: 700, fontSize: 12,
      }}>
        Assinar agora <ArrowRight size={12} />
      </Link>
    </div>
  );
}

export function TrialGate({ children }: { children: React.ReactNode }) {
  const t = useTrialStatus();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const onAllowed = ALLOWED_WHEN_BLOCKED.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!t.loading && t.isTrialEnded && !onAllowed) {
      navigate({ to: "/assinar" as any });
    }
  }, [t.loading, t.isTrialEnded, onAllowed, navigate]);

  if (!t.loading && t.isTrialEnded && !onAllowed) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: "center", background: "#fff", padding: 32, borderRadius: 20, border: "1px solid #EFEFEF" }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: "#FFE5E5", color: "#FF6B6B", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <Lock size={24} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>Seu período grátis terminou</h2>
          <p style={{ color: "#616161", fontSize: 14, marginBottom: 20 }}>
            Para continuar usando o Hostlyb, ative sua assinatura. Você mantém todos os seus dados.
          </p>
          <Link to={"/assinar" as any} style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "#FF6B6B", color: "#fff", padding: "12px 24px", borderRadius: 999, fontWeight: 700,
          }}>
            Ver planos <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
