import * as React from "react";
import { Heading, Text } from "@react-email/components";
import { CTA, HostlyShell, pickLang, type Lang } from "./_shared";
import type { TemplateEntry } from "./registry";

const COPY: Record<Lang, { sub: string; hi: string; intro: string; steps: string[]; cta: string }> = {
  pt: {
    sub: "Bem-vindo ao Hostlyb — o seu alojamento começa a organizar-se agora 🏠",
    hi: "Olá",
    intro: "Já tem a Hostlyb à mão. Em 5 minutos pode deixar a sua operação no piloto automático.",
    steps: ["Adicione o seu primeiro imóvel", "Convide a sua faxineira", "Importe ou registe um hóspede"],
    cta: "Entrar no Hostlyb →",
  },
  en: {
    sub: "Welcome to Hostlyb — your property operation starts now 🏠",
    hi: "Hi",
    intro: "Hostlyb is ready. In 5 minutes you can put your operation on autopilot.",
    steps: ["Add your first property", "Invite your cleaner", "Import or add a guest"],
    cta: "Enter Hostlyb →",
  },
  fr: {
    sub: "Bienvenue sur Hostlyb — votre logement s'organise dès maintenant 🏠",
    hi: "Bonjour",
    intro: "Hostlyb est prêt. En 5 minutes vous pouvez automatiser votre activité.",
    steps: ["Ajoutez votre premier logement", "Invitez votre agent d'entretien", "Importez ou ajoutez un voyageur"],
    cta: "Accéder à Hostlyb →",
  },
  de: {
    sub: "Willkommen bei Hostlyb — Ihr Objekt organisiert sich jetzt 🏠",
    hi: "Hallo",
    intro: "Hostlyb ist bereit. In 5 Minuten läuft Ihre Vermietung automatisch.",
    steps: ["Erste Ferienwohnung anlegen", "Reinigungskraft einladen", "Gast importieren oder anlegen"],
    cta: "Zu Hostlyb →",
  },
  it: {
    sub: "Benvenuto su Hostlyb — la tua struttura si organizza adesso 🏠",
    hi: "Ciao",
    intro: "Hostlyb è pronto. In 5 minuti puoi mettere la tua attività in automatico.",
    steps: ["Aggiungi il tuo primo immobile", "Invita la tua addetta alle pulizie", "Importa o aggiungi un ospite"],
    cta: "Entra in Hostlyb →",
  },
  es: {
    sub: "Bienvenido a Hostlyb — tu alojamiento empieza a organizarse ahora 🏠",
    hi: "Hola",
    intro: "Hostlyb ya está listo. En 5 minutos pones tu operación en piloto automático.",
    steps: ["Añade tu primer alojamiento", "Invita a tu limpiadora", "Importa o añade un huésped"],
    cta: "Entrar en Hostlyb →",
  },
};

interface Props { name?: string; lang?: string; recipientEmail?: string }

function Welcome({ name, lang, recipientEmail }: Props) {
  const L = pickLang(lang);
  const c = COPY[L];
  return (
    <HostlyShell preheader={c.intro} recipientEmail={recipientEmail} lang={L}>
      <Heading style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px" }}>
        {c.hi}{name ? `, ${name}` : ""} 👋
      </Heading>
      <Text style={{ fontSize: 15, color: "#475569", lineHeight: 1.55, margin: "0 0 18px" }}>{c.intro}</Text>
      <ol style={{ color: "#0f172a", fontSize: 15, lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
        {c.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <CTA href="https://hostlyb.com/app" label={c.cta} />
    </HostlyShell>
  );
}

export const template = {
  component: Welcome,
  displayName: "Welcome",
  subject: (d: Record<string, any>) => COPY[pickLang(d.lang)].sub,
  previewData: { name: "Maria", lang: "pt", recipientEmail: "maria@example.com" },
} satisfies TemplateEntry;
