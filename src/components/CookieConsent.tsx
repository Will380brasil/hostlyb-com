import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { setConsent, getStoredConsent, type ConsentChoice } from "@/lib/analytics";
import { useT } from "@/lib/i18n";

const COLORS = {
  bg: "#111111",
  text: "#FAFAFA",
  muted: "#9E9E9E",
  coral: "#FF6B6B",
  coralDark: "#E85555",
  border: "rgba(255,255,255,0.12)",
};

export function CookieConsent() {
  const t = useT();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (getStoredConsent() === null) {
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    }
  }, []);

  // Show only on the public landing page so it never covers signup/login CTAs.
  if (location.pathname !== "/") return null;
  if (!visible) return null;

  const decide = (choice: ConsentChoice) => {
    setConsent(choice);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("cookies.title")}
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: 16,
        zIndex: 60,
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
          {t("cookies.title")}
        </strong>
        <span style={{ color: COLORS.muted }}>
          {t("cookies.body")}{" "}
          <a
            href="/privacidade"
            style={{ color: COLORS.text, textDecoration: "underline", textUnderlineOffset: 3 }}
          >
            {t("cookies.more")}
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
          {t("cookies.deny")}
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
          {t("cookies.accept")}
        </button>
      </div>
    </div>
  );
}
