import type { Currency, Lang } from "@/lib/i18n";

export type Tier = 5 | 10 | 20 | 50 | 999;
export type BillingInterval = "monthly" | "yearly";

export interface PricingTier {
  tier: Tier;
  monthlyCents: number;     // displayed monthly price in monthly billing
  yearlyMonthlyCents: number; // displayed monthly price when billed yearly (~-20%)
  popular?: boolean;
  custom?: boolean;
}

// Aligned with Stripe price IDs created via batch_create_product
// id pattern: hostly_tier_{tier}_{currency}_{interval}
export const PRICING: Record<Currency, PricingTier[]> = {
  EUR: [
    { tier: 5,   monthlyCents: 1999,  yearlyMonthlyCents: 1599, popular: true },
    { tier: 10,  monthlyCents: 3499,  yearlyMonthlyCents: 2799 },
    { tier: 20,  monthlyCents: 5999,  yearlyMonthlyCents: 4799 },
    { tier: 50,  monthlyCents: 9999,  yearlyMonthlyCents: 7999 },
    { tier: 999, monthlyCents: 0,     yearlyMonthlyCents: 0, custom: true },
  ],
  BRL: [
    { tier: 5,   monthlyCents: 4990,  yearlyMonthlyCents: 3990, popular: true },
    { tier: 10,  monthlyCents: 8990,  yearlyMonthlyCents: 7190 },
    { tier: 20,  monthlyCents: 14990, yearlyMonthlyCents: 11990 },
    { tier: 50,  monthlyCents: 24990, yearlyMonthlyCents: 19990 },
    { tier: 999, monthlyCents: 0,     yearlyMonthlyCents: 0, custom: true },
  ],
  USD: [
    { tier: 5,   monthlyCents: 1499,  yearlyMonthlyCents: 1199, popular: true },
    { tier: 10,  monthlyCents: 2499,  yearlyMonthlyCents: 1999 },
    { tier: 20,  monthlyCents: 4499,  yearlyMonthlyCents: 3599 },
    { tier: 50,  monthlyCents: 7499,  yearlyMonthlyCents: 5999 },
    { tier: 999, monthlyCents: 0,     yearlyMonthlyCents: 0, custom: true },
  ],
  GBP: [
    { tier: 5,   monthlyCents: 1499,  yearlyMonthlyCents: 1199, popular: true },
    { tier: 10,  monthlyCents: 2499,  yearlyMonthlyCents: 1999 },
    { tier: 20,  monthlyCents: 4499,  yearlyMonthlyCents: 3599 },
    { tier: 50,  monthlyCents: 7499,  yearlyMonthlyCents: 5999 },
    { tier: 999, monthlyCents: 0,     yearlyMonthlyCents: 0, custom: true },
  ],
};

export function getStripePriceId(currency: Currency, tier: Tier, interval: BillingInterval): string | null {
  if (tier === 999) return null;
  return `hostly_tier_${tier}_${currency.toLowerCase()}_${interval}`;
}

export function formatTierPrice(cents: number, currency: Currency, lang: Lang): string {
  const localeMap: Record<Lang, string> = {
    pt: "pt-BR", en: currency === "EUR" ? "en-GB" : "en-US", es: "es-ES",
    fr: "fr-FR", it: "it-IT", de: "de-DE",
  };
  return new Intl.NumberFormat(localeMap[lang] ?? "en-GB", {
    style: "currency", currency, minimumFractionDigits: 2,
  }).format(cents / 100);
}

export function pricePerDay(cents: number, currency: Currency, lang: Lang): string {
  return formatTierPrice(Math.round(cents / 30), currency, lang);
}

// Lightweight inline translations specific to the new pricing model.
type PricingDict = {
  headline: string; subtitle: string;
  monthly: string; yearly: string; saveBadge: string;
  allInclude: string; featuresList: string;
  upTo: string; properties: string; customLabel: string;
  perMonth: string; perDay: string;
  startFree: string; contactUs: string; customPrice: string;
  trial: string; noCard: string; cancel: string;
  insightTitle: string; insightBody: string;
  upgradeTitle: string; upgradeBody: (cur: number, next: number) => string;
  upgradeNow: string; later: string;
  current: string; suggested: string;
};

const en: PricingDict = {
  headline: "Simple, honest pricing.",
  subtitle: "One plan. All features. Pay only for what you use.",
  monthly: "Monthly", yearly: "Yearly", saveBadge: "Save 20%",
  allInclude: "ALL PLANS INCLUDE EVERYTHING",
  featuresList: "Unlimited cleanings · Unlimited team · Photo checklists · Forgotten item alerts · Calendar sync · Guest management · Real-time dashboard",
  upTo: "Up to", properties: "properties", customLabel: "50+ properties",
  perMonth: "/mo", perDay: "/day",
  startFree: "Start 7 days free", contactUs: "Contact us", customPrice: "Let’s talk",
  trial: "7 days free trial", noCard: "No credit card", cancel: "Cancel anytime",
  insightTitle: "Pays for itself.",
  insightBody: "A short-term rental earns ~€1,500/mo per property. Our Starter plan costs €24.99 — 1.7% of your revenue.",
  upgradeTitle: "You’ve reached your property limit",
  upgradeBody: (cur, next) => `Upgrade from ${cur} to ${next} properties to add more.`,
  upgradeNow: "Upgrade now", later: "Maybe later",
  current: "Current", suggested: "Suggested",
};
const pt: PricingDict = {
  headline: "Preço simples e justo.",
  subtitle: "Um plano só. Todos os recursos. Pague pelo que usar.",
  monthly: "Mensal", yearly: "Anual", saveBadge: "Economize 20%",
  allInclude: "TODOS OS PLANOS INCLUEM TUDO",
  featuresList: "Limpezas ilimitadas · Equipe ilimitada · Checklist com fotos · Alerta de objetos esquecidos · Sync de calendário · Gestão de hóspedes · Dashboard em tempo real",
  upTo: "Até", properties: "imóveis", customLabel: "+50 imóveis",
  perMonth: "/mês", perDay: "/dia",
  startFree: "Começar grátis 7 dias", contactUs: "Fale conosco", customPrice: "Personalizado",
  trial: "7 dias grátis", noCard: "Sem cartão de crédito", cancel: "Cancele quando quiser",
  insightTitle: "Se paga sozinho.",
  insightBody: "Um imóvel de aluguel por temporada rende ~R$ 2.000/mês por imóvel. O plano Starter custa R$ 139,90 — 7% da sua receita.",
  upgradeTitle: "Você atingiu o limite de imóveis",
  upgradeBody: (cur, next) => `Faça upgrade de ${cur} para ${next} imóveis para cadastrar mais.`,
  upgradeNow: "Fazer upgrade", later: "Mais tarde",
  current: "Atual", suggested: "Sugerido",
};
const es: PricingDict = {
  headline: "Precios simples y honestos.",
  subtitle: "Un solo plan. Todas las funciones. Paga por lo que uses.",
  monthly: "Mensual", yearly: "Anual", saveBadge: "Ahorra 20%",
  allInclude: "TODOS LOS PLANES INCLUYEN TODO",
  featuresList: "Limpiezas ilimitadas · Equipo ilimitado · Checklist con fotos · Alerta de objetos olvidados · Sync de calendario · Gestión de huéspedes · Dashboard en tiempo real",
  upTo: "Hasta", properties: "propiedades", customLabel: "+50 propiedades",
  perMonth: "/mes", perDay: "/día",
  startFree: "Comenzar gratis 7 días", contactUs: "Contactar", customPrice: "A medida",
  trial: "7 días gratis", noCard: "Sin tarjeta", cancel: "Cancela cuando quieras",
  insightTitle: "Se paga solo.",
  insightBody: "Un alojamiento local genera ~€1.500/mes por propiedad. El plan Starter cuesta €24,99 — 1,7% de tus ingresos.",
  upgradeTitle: "Has alcanzado tu límite de propiedades",
  upgradeBody: (cur, next) => `Sube de ${cur} a ${next} propiedades para añadir más.`,
  upgradeNow: "Mejorar ahora", later: "Más tarde",
  current: "Actual", suggested: "Sugerido",
};
const fr: PricingDict = {
  headline: "Un tarif simple et transparent.",
  subtitle: "Un seul plan. Toutes les fonctionnalités. Payez selon votre usage.",
  monthly: "Mensuel", yearly: "Annuel", saveBadge: "Économisez 20%",
  allInclude: "TOUS LES PLANS INCLUENT TOUT",
  featuresList: "Ménages illimités · Équipe illimitée · Checklists photo · Alertes objets oubliés · Sync calendrier · Gestion des hôtes · Tableau de bord en temps réel",
  upTo: "Jusqu’à", properties: "biens", customLabel: "50+ biens",
  perMonth: "/mois", perDay: "/jour",
  startFree: "Essai gratuit 7 jours", contactUs: "Nous contacter", customPrice: "Sur devis",
  trial: "7 jours d’essai gratuit", noCard: "Sans carte bancaire", cancel: "Résiliez à tout moment",
  insightTitle: "Vite rentabilisé.",
  insightBody: "Une location courte durée génère ~1 500 €/mois par bien. Le plan 5 biens coûte 24,99 € — 1,3% de vos revenus.",
  upgradeTitle: "Vous avez atteint votre limite de biens",
  upgradeBody: (cur, next) => `Passez de ${cur} à ${next} biens pour en ajouter plus.`,
  upgradeNow: "Mettre à niveau", later: "Plus tard",
  current: "Actuel", suggested: "Suggéré",
};
const it: PricingDict = {
  headline: "Prezzi semplici e onesti.",
  subtitle: "Un solo piano. Tutte le funzionalità. Paga in base all’uso.",
  monthly: "Mensile", yearly: "Annuale", saveBadge: "Risparmia 20%",
  allInclude: "TUTTI I PIANI INCLUDONO TUTTO",
  featuresList: "Pulizie illimitate · Team illimitato · Checklist con foto · Avvisi oggetti dimenticati · Sync calendario · Gestione ospiti · Dashboard in tempo reale",
  upTo: "Fino a", properties: "immobili", customLabel: "50+ immobili",
  perMonth: "/mese", perDay: "/giorno",
  startFree: "Prova gratis 7 giorni", contactUs: "Contattaci", customPrice: "Su misura",
  trial: "7 giorni di prova gratuita", noCard: "Senza carta", cancel: "Disdici quando vuoi",
  insightTitle: "Si ripaga da solo.",
  insightBody: "Un affitto breve genera ~1.500 €/mese per immobile. Il piano 5 immobili costa 24,99 € — 1,3% del tuo fatturato.",
  upgradeTitle: "Hai raggiunto il limite di immobili",
  upgradeBody: (cur, next) => `Passa da ${cur} a ${next} immobili per aggiungerne altri.`,
  upgradeNow: "Aggiorna ora", later: "Più tardi",
  current: "Attuale", suggested: "Suggerito",
};
const de: PricingDict = {
  headline: "Einfache, ehrliche Preise.",
  subtitle: "Ein Plan. Alle Funktionen. Zahlen Sie nur für das, was Sie nutzen.",
  monthly: "Monatlich", yearly: "Jährlich", saveBadge: "20% sparen",
  allInclude: "ALLE PLÄNE BEINHALTEN ALLES",
  featuresList: "Unbegrenzte Reinigungen · Unbegrenztes Team · Foto-Checklisten · Hinweise zu vergessenen Gegenständen · Kalender-Sync · Gästeverwaltung · Echtzeit-Dashboard",
  upTo: "Bis zu", properties: "Immobilien", customLabel: "50+ Immobilien",
  perMonth: "/Mon.", perDay: "/Tag",
  startFree: "7 Tage kostenlos starten", contactUs: "Kontakt", customPrice: "Auf Anfrage",
  trial: "7 Tage kostenlose Testphase", noCard: "Keine Kreditkarte", cancel: "Jederzeit kündigen",
  insightTitle: "Rechnet sich sofort.",
  insightBody: "Eine Ferienwohnung erzielt ~1.500 €/Mon. pro Immobilie. Der 5-Immobilien-Plan kostet 24,99 € — 1,3% des Umsatzes.",
  upgradeTitle: "Sie haben Ihr Immobilien-Limit erreicht",
  upgradeBody: (cur, next) => `Wechseln Sie von ${cur} auf ${next} Immobilien, um mehr hinzuzufügen.`,
  upgradeNow: "Jetzt upgraden", later: "Später",
  current: "Aktuell", suggested: "Empfohlen",
};

const dicts: Record<Lang, PricingDict> = { pt, en, es, fr, it, de };
export function pricingT(lang: Lang): PricingDict { return dicts[lang] ?? en; }
