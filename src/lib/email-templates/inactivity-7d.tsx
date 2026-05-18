import * as React from "react";
import { Heading, Text, Link } from "@react-email/components";
import { ADMIN_EMAIL, CTA, HostlyShell, pickLang, type Lang } from "./_shared";
import type { TemplateEntry } from "./registry";

const COPY: Record<Lang, { sub: (n?: string) => string; intro: string; bullets: string[]; cta: string; feedback: string }> = {
  pt: { sub: (n) => `${n ?? "Olá"}, o seu alojamento sente a sua falta 🏠`, intro: "Há 7 dias sem entrar. Eis o que está a perder:", bullets: ["Check-in digital sem fricção", "Limpezas com fotos automáticas", "Resumo financeiro mensal pronto"], cta: "Voltar ao Hostlyb →", feedback: "Diga-nos o que podemos melhorar" },
  en: { sub: (n) => `${n ?? "Hi"}, your property misses you 🏠`, intro: "It's been 7 days. Here's what you're missing:", bullets: ["Frictionless digital check-in", "Cleanings with automatic photos", "Monthly financial summary ready"], cta: "Return to Hostlyb →", feedback: "Tell us what we can improve" },
  fr: { sub: (n) => `${n ?? "Bonjour"}, votre logement vous attend 🏠`, intro: "Cela fait 7 jours. Voici ce qui vous manque :", bullets: ["Enregistrement numérique sans friction", "Ménages avec photos automatiques", "Bilan financier mensuel prêt"], cta: "Revenir sur Hostlyb →", feedback: "Dites-nous ce que nous pouvons améliorer" },
  de: { sub: (n) => `${n ?? "Hallo"}, Ihr Objekt vermisst Sie 🏠`, intro: "Sieben Tage sind vergangen. Das verpassen Sie:", bullets: ["Digitaler Check-in ohne Reibung", "Reinigungen mit automatischen Fotos", "Monatliche Finanzübersicht bereit"], cta: "Zurück zu Hostlyb →", feedback: "Sagen Sie uns, was wir verbessern können" },
  it: { sub: (n) => `${n ?? "Ciao"}, la tua struttura ti aspetta 🏠`, intro: "Sono passati 7 giorni. Ecco cosa ti stai perdendo:", bullets: ["Check-in digitale senza attriti", "Pulizie con foto automatiche", "Riepilogo finanziario mensile pronto"], cta: "Torna su Hostlyb →", feedback: "Diccelo cosa possiamo migliorare" },
  es: { sub: (n) => `${n ?? "Hola"}, tu alojamiento te echa de menos 🏠`, intro: "Han pasado 7 días. Esto te estás perdiendo:", bullets: ["Check-in digital sin fricciones", "Limpiezas con fotos automáticas", "Resumen financiero mensual listo"], cta: "Volver a Hostlyb →", feedback: "Dinos qué podemos mejorar" },
};

interface Props { name?: string; lang?: string; recipientEmail?: string }

function Inactivity7d({ name, lang, recipientEmail }: Props) {
  const L = pickLang(lang);
  const c = COPY[L];
  return (
    <HostlyShell preheader={c.intro} recipientEmail={recipientEmail} lang={L}>
      <Heading style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{c.intro}</Heading>
      <ul style={{ color: "#0f172a", fontSize: 15, lineHeight: 1.7, paddingLeft: 20, margin: "8px 0 18px" }}>
        {c.bullets.map((b, i) => <li key={i}>{b}</li>)}
      </ul>
      <CTA href="https://hostlyb.com/app" label={c.cta} />
      <Text style={{ textAlign: "center" as const, fontSize: 13, color: "#64748b", margin: "16px 0 0" }}>
        <Link href={`mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent("Hostlyb — feedback")}`} style={{ color: "#FF6B6B", fontWeight: 600 }}>
          {c.feedback} →
        </Link>
      </Text>
    </HostlyShell>
  );
}

export const template = {
  component: Inactivity7d,
  displayName: "Inactivity — 7 days",
  subject: (d: Record<string, any>) => COPY[pickLang(d.lang)].sub(d.name),
  previewData: { name: "Maria", lang: "pt", recipientEmail: "maria@example.com" },
} satisfies TemplateEntry;
