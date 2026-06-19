import * as React from "react";
import { Html, Head, Body, Container, Section, Heading, Text, Button, Hr, Link } from "@react-email/components";

export const ADMIN_EMAIL = "support@hostlyb.com";
export const SITE = "https://hostlyb.com";

export type Lang = "pt" | "en" | "fr" | "de" | "it" | "es";

export function HostlyShell({
  preheader,
  children,
  recipientEmail,
  lang = "pt",
}: {
  preheader?: string;
  children: React.ReactNode;
  recipientEmail?: string;
  lang?: Lang;
}) {
  const tr = TR[lang] || TR.pt;
  const supportHref = `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent(`Hostlyb Support — ${recipientEmail ?? ""}`)}`;
  return (
    <Html lang={lang} dir="ltr">
      <Head />
      <Body style={{ backgroundColor: "#ffffff", margin: 0, fontFamily: "Inter, Arial, sans-serif", color: "#0f172a" }}>
        {preheader ? <span style={{ display: "none", opacity: 0, color: "transparent" }}>{preheader}</span> : null}
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "0 20px" }}>
          <Section style={{ padding: "28px 0 18px", textAlign: "center" as const }}>
            <span style={{ display: "inline-block", background: "#FF6B6B", color: "#fff", padding: "6px 14px", borderRadius: 999, fontWeight: 700, fontSize: 14, letterSpacing: 0.3 }}>
              Hostlyb
            </span>
          </Section>
          <Section style={{ background: "#fff", borderRadius: 14, padding: 28, border: "1px solid #f1f5f9" }}>
            {children}
            <Hr style={{ borderColor: "#f1f5f9", margin: "26px 0 18px" }} />
            <Section style={{ textAlign: "center" as const }}>
              <Button href={supportHref} style={{ background: "#0F172A", color: "#fff", padding: "12px 22px", borderRadius: 10, fontWeight: 600, textDecoration: "none", fontSize: 14 }}>
                💬 {tr.support} — {ADMIN_EMAIL}
              </Button>
            </Section>
          </Section>
          <Section style={{ textAlign: "center" as const, padding: "20px 0 32px" }}>
            <Text style={{ color: "#94a3b8", fontSize: 12, margin: 0 }}>
              Hostlyb · <Link href={SITE} style={{ color: "#94a3b8" }}>hostlyb.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function CTA({ href, label }: { href: string; label: string }) {
  return (
    <Section style={{ textAlign: "center" as const, margin: "22px 0 4px" }}>
      <Button href={href} style={{ background: "#FF6B6B", color: "#fff", padding: "14px 28px", borderRadius: 10, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
        {label}
      </Button>
    </Section>
  );
}

const TR: Record<Lang, { support: string }> = {
  pt: { support: "Suporte" },
  en: { support: "Support" },
  fr: { support: "Support" },
  de: { support: "Support" },
  it: { support: "Supporto" },
  es: { support: "Soporte" },
};

export function pickLang(v?: string | null): Lang {
  const x = (v || "pt").toLowerCase().slice(0, 2);
  return (["pt", "en", "fr", "de", "it", "es"] as const).includes(x as Lang) ? (x as Lang) : "pt";
}
