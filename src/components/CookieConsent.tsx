import { useEffect, useState } from "react";
import { setConsent, getStoredConsent, type ConsentChoice } from "@/lib/analytics";

const COLORS = {
  bg: "#111111",
  text: "#FAFAFA",
  muted: "#9E9E9E",
  coral: "#FF6B6B",
  coralDark: "#E85555",
  border: "rgba(255,255,255,0.12)",
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStoredConsent() === null) {
      // Slight delay so it doesn't flash before the page paints
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  if (!visible) return null;

  const decide = (choice: ConsentChoice) => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Aviso de cookies"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 88,
        zIndex: 1000,
        maxWidth: 720,
        margin: "0 auto",
        background: COLORS.bg,
        color: COLORS.text,
        borderRadius: 16,
        border: `1px solid ${COLORS.border}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
        padding: "18px 20px",
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        fontSize: 14,
        lineHeight: 1.55,
        display: "flex",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 280px", minWidth: 240 }}>
        <strong style={{ display: "block", marginBottom: 4, color: "#fff", fontSize: 15 }}>
          🍪 Sua privacidade
        </strong>
        <span style={{ color: COLORS.muted }}>
          Usamos cookies para entender como você usa o Hostly e melhorar sua experiência.
          Você pode aceitar ou recusar. {""}
          <a
            href="/privacidade"
            style={{ color: COLORS.text, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            Saber mais
          </a>
          .
        </span>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => decide("denied")}
          style={{
            background: "transparent",
            color: COLORS.text,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 999,
            padding: "10px 18px",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Recusar
        </button>
        <button
          onClick={() => decide("granted")}
          style={{
            background: COLORS.coral,
            color: "#fff",
            border: 0,
            borderRadius: 999,
            padding: "10px 20px",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(255,107,107,0.4)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = COLORS.coralDark)}
          onMouseLeave={(e) => (e.currentTarget.style.background = COLORS.coral)}
        >
          Aceitar
        </button>
      </div>
    </div>
  );
}
