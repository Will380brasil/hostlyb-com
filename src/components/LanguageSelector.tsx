import { useEffect, useRef, useState } from "react";
import { Globe, Check } from "lucide-react";
import { LANGS, useLocale, type Lang } from "@/lib/i18n";

export function LanguageSelector({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: compact ? "8px 10px" : "10px 14px",
          borderRadius: 999, border: "1px solid #E0E0E0",
          background: "#fff", color: "#212121", fontSize: 13, fontWeight: 600,
          cursor: "pointer",
        }}
        aria-label="Language"
      >
        <Globe size={14} />
        <span>{current.flag}</span>
        {!compact && <span>{current.code.toUpperCase()}</span>}
      </button>
      {open && (
        <div
          role="menu"
          style={{
            position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 60,
            minWidth: 180, background: "#fff", border: "1px solid #EFEFEF",
            borderRadius: 14, padding: 6, boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
          }}
        >
          {LANGS.map((l) => {
            const active = l.code === lang;
            return (
              <button
                key={l.code}
                role="menuitem"
                onClick={() => { setLang(l.code as Lang); setOpen(false); }}
                style={{
                  display: "flex", width: "100%", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10, border: 0,
                  background: active ? "#F7F7F7" : "transparent",
                  color: "#212121", cursor: "pointer", fontSize: 14, fontWeight: 500,
                }}
              >
                <span style={{ fontSize: 16 }}>{l.flag}</span>
                <span style={{ flex: 1, textAlign: "left" }}>{l.label}</span>
                {active && <Check size={14} color="#FF6B6B" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
