import * as React from "react";
import { Heading, Text, Section } from "@react-email/components";
import { CTA, HostlyShell, pickLang, type Lang } from "./_shared";
import type { TemplateEntry } from "./registry";

const COPY: Record<Lang, { sub: (n?: string) => string; intro: string; summary: string; cta: string; props: string; checkouts: string; cleanings: string }> = {
  pt: { sub: (n) => `Está tudo bem com o seu alojamento, ${n ?? ""}? 🏠`, intro: "Já não o vemos há 3 dias. Eis um resumo rápido da sua operação:", summary: "Resumo da sua operação", cta: "Ver dashboard →", props: "Imóveis", checkouts: "Próximos checkouts", cleanings: "Limpezas pendentes" },
  en: { sub: (n) => `Everything ok with your property, ${n ?? ""}? 🏠`, intro: "It's been 3 days. Here's a quick summary of your operation:", summary: "Your operation summary", cta: "View dashboard →", props: "Properties", checkouts: "Upcoming checkouts", cleanings: "Pending cleanings" },
  fr: { sub: (n) => `Tout va bien avec votre logement, ${n ?? ""} ? 🏠`, intro: "Cela fait 3 jours. Voici un résumé rapide de votre activité :", summary: "Résumé de votre activité", cta: "Voir le tableau de bord →", props: "Logements", checkouts: "Prochains départs", cleanings: "Ménages en attente" },
  de: { sub: (n) => `Alles in Ordnung mit Ihrer Vermietung, ${n ?? ""}? 🏠`, intro: "Es sind 3 Tage vergangen. Hier ist eine kurze Übersicht:", summary: "Übersicht Ihrer Vermietung", cta: "Zum Dashboard →", props: "Objekte", checkouts: "Nächste Abreisen", cleanings: "Offene Reinigungen" },
  it: { sub: (n) => `Tutto bene con la tua struttura, ${n ?? ""}? 🏠`, intro: "Sono passati 3 giorni. Ecco un riepilogo della tua attività:", summary: "Riepilogo della tua attività", cta: "Vai alla dashboard →", props: "Immobili", checkouts: "Prossimi check-out", cleanings: "Pulizie in sospeso" },
  es: { sub: (n) => `¿Todo bien con tu alojamiento, ${n ?? ""}? 🏠`, intro: "Han pasado 3 días. Aquí un resumen rápido:", summary: "Resumen de tu operación", cta: "Ver el panel →", props: "Alojamientos", checkouts: "Próximos checkouts", cleanings: "Limpiezas pendientes" },
};

interface Props { name?: string; lang?: string; recipientEmail?: string; properties?: number; upcomingCheckouts?: number; pendingCleanings?: number }

function Inactivity3d({ name, lang, recipientEmail, properties = 0, upcomingCheckouts = 0, pendingCleanings = 0 }: Props) {
  const L = pickLang(lang);
  const c = COPY[L];
  return (
    <HostlyShell preheader={c.intro} recipientEmail={recipientEmail} lang={L}>
      <Heading style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>{c.sub(name).replace(/[?🏠]/g, "").trim()}?</Heading>
      <Text style={{ fontSize: 15, color: "#475569", lineHeight: 1.55, margin: "0 0 18px" }}>{c.intro}</Text>
      <Section style={{ background: "#f8fafc", borderRadius: 10, padding: 18, margin: "8px 0" }}>
        <Text style={{ margin: 0, color: "#0f172a", fontWeight: 700, fontSize: 14 }}>{c.summary}</Text>
        <Text style={{ margin: "10px 0 0", color: "#475569", fontSize: 14 }}>• {c.props}: <strong>{properties}</strong></Text>
        <Text style={{ margin: 0, color: "#475569", fontSize: 14 }}>• {c.checkouts}: <strong>{upcomingCheckouts}</strong></Text>
        <Text style={{ margin: 0, color: "#475569", fontSize: 14 }}>• {c.cleanings}: <strong>{pendingCleanings}</strong></Text>
      </Section>
      <CTA href="https://hostlyb.com/app" label={c.cta} />
    </HostlyShell>
  );
}

export const template = {
  component: Inactivity3d,
  displayName: "Inactivity — 3 days",
  subject: (d: Record<string, any>) => COPY[pickLang(d.lang)].sub(d.name),
  previewData: { name: "Maria", lang: "pt", properties: 2, upcomingCheckouts: 1, pendingCleanings: 1, recipientEmail: "maria@example.com" },
} satisfies TemplateEntry;
