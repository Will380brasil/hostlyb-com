import * as React from "react";
import { Heading, Text } from "@react-email/components";
import { CTA, HostlyShell, pickLang, type Lang } from "./_shared";
import type { TemplateEntry } from "./registry";

const COPY: Record<Lang, { sub: (m: string) => string; cta: string }> = {
  pt: { sub: (m) => `🆕 Novidades no Hostlyb — ${m}`, cta: "Ver as novidades →" },
  en: { sub: (m) => `🆕 What's new in Hostlyb — ${m}`, cta: "See what's new →" },
  fr: { sub: (m) => `🆕 Nouveautés sur Hostlyb — ${m}`, cta: "Voir les nouveautés →" },
  de: { sub: (m) => `🆕 Neuigkeiten bei Hostlyb — ${m}`, cta: "Neuigkeiten ansehen →" },
  it: { sub: (m) => `🆕 Novità su Hostlyb — ${m}`, cta: "Scopri le novità →" },
  es: { sub: (m) => `🆕 Novedades en Hostlyb — ${m}`, cta: "Ver novedades →" },
};

interface Props { title?: string; bodyHtml?: string; lang?: string; recipientEmail?: string; monthYear?: string; ctaUrl?: string }

function ProductUpdate({ title, bodyHtml, lang, recipientEmail, ctaUrl }: Props) {
  const L = pickLang(lang);
  const c = COPY[L];
  return (
    <HostlyShell preheader={title} recipientEmail={recipientEmail} lang={L}>
      <Heading style={{ fontSize: 24, fontWeight: 800, margin: "0 0 14px" }}>{title || "Hostlyb"}</Heading>
      <Text style={{ fontSize: 15, color: "#475569", lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" as const }}>
        {bodyHtml || ""}
      </Text>
      <CTA href={ctaUrl || "https://hostlyb.com/app"} label={c.cta} />
    </HostlyShell>
  );
}

export const template = {
  component: ProductUpdate,
  displayName: "Product update",
  subject: (d: Record<string, any>) => COPY[pickLang(d.lang)].sub(d.monthYear ?? new Date().toLocaleDateString("en", { month: "long", year: "numeric" })),
  previewData: { title: "December updates", bodyHtml: "• Calendar improvements\n• Faster check-in\n• Premium reports", lang: "pt", monthYear: "Dezembro 2026", recipientEmail: "maria@example.com" },
} satisfies TemplateEntry;
