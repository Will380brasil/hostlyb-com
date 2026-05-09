import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "pt" | "en" | "es" | "fr" | "it" | "de";
export type Currency = "BRL" | "USD" | "EUR";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English",   flag: "🇺🇸" },
  { code: "es", label: "Español",   flag: "🇪🇸" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
  { code: "it", label: "Italiano",  flag: "🇮🇹" },
  { code: "de", label: "Deutsch",   flag: "🇩🇪" },
];

// Plan price by currency
export const PLAN_PRICE: Record<Currency, { amount: number; symbol: string; suffix: string }> = {
  BRL: { amount: 59.90, symbol: "R$",  suffix: "/mês" },
  EUR: { amount: 19.90, symbol: "€",   suffix: "/mês" },
  USD: { amount: 39.00, symbol: "US$", suffix: "/mo"  },
};

export function formatPrice(currency: Currency, lang: Lang): string {
  const p = PLAN_PRICE[currency];
  const localeMap: Record<Lang, string> = {
    pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE",
  };
  try {
    return new Intl.NumberFormat(localeMap[lang], { style: "currency", currency }).format(p.amount);
  } catch {
    return `${p.symbol} ${p.amount.toFixed(2)}`;
  }
}

// Translation dictionary
type Dict = Record<string, string>;
const DICTS: Record<Lang, Dict> = {
  pt: {
    "nav.features": "Funcionalidades",
    "nav.pricing": "Preços",
    "nav.faq": "FAQ",
    "nav.signin": "Entrar",
    "nav.cta": "Começar grátis",
    "hero.badge": "✦ +2.400 anfitriões pararam de gerenciar pelo WhatsApp",
    "hero.title.a": "Seu Airbnb",
    "hero.title.b": "no piloto automático",
    "hero.title.c": "— em 2 minutos por dia.",
    "hero.subtitle": "Faxineira que não responde. Hóspede chegando num imóvel sujo. Objeto esquecido que você só descobre semanas depois. O Hostly resolve tudo isso — direto do seu celular.",
    "hero.cta": "Quero parar com o caos →",
    "hero.demo": "Ou explore a demo →",
    "hero.bullet1": "✓ 7 dias grátis",
    "hero.bullet2": "✓ Sem cartão de crédito",
    "hero.bullet3": "✓ Cancele em 1 clique",
    "social.proof": "Confiado por +2.400 anfitriões no Brasil, EUA e Europa",
    "pricing.title.a": "Caro?",
    "pricing.title.b": "Menos que uma diária.",
    "pricing.subtitle": "Um plano. Tudo incluso. Para sempre. Sem upsell, sem letra miúda.",
    "pricing.plan.name": "Hostly Pro",
    "pricing.plan.tag": "Tudo incluso",
    "pricing.plan.users": "Até 5 usuários (você + 4 funcionários)",
    "pricing.plan.properties": "Imóveis ilimitados",
    "pricing.plan.f1": "Imóveis ilimitados",
    "pricing.plan.f2": "Até 5 usuários por convite",
    "pricing.plan.f3": "Checklist de limpeza com fotos",
    "pricing.plan.f4": "Calendário e iCal (Airbnb/Booking)",
    "pricing.plan.f5": "Alertas automáticos de checkout",
    "pricing.plan.f6": "App da faxineira por link (sem instalar)",
    "pricing.plan.f7": "Suporte humano por e-mail",
    "pricing.cta": "Testar 7 dias grátis",
    "pricing.note": "✓ 7 dias grátis  ✓ Sem cartão  ✓ Cancele quando quiser",
    "cta.title": "Pare de apagar incêndio. Comece a gerenciar.",
    "cta.subtitle": "7 dias grátis. Sem cartão. Sem complicação. Em 5 minutos você está rodando.",
    "cta.btn": "Quero meus 7 dias grátis →",
    "footer.rights": "© 2026 Hostly. Todos os direitos reservados.",
  },
  en: {
    "nav.features": "Features",
    "nav.pricing": "Pricing",
    "nav.faq": "FAQ",
    "nav.signin": "Sign in",
    "nav.cta": "Start free",
    "hero.badge": "✦ Simplified Airbnb management",
    "hero.title.a": "End the",
    "hero.title.b": "chaos",
    "hero.title.c": "in your Airbnb operations.",
    "hero.subtitle": "Control cleanings, guests and your team in one place. 7 days free, no card required.",
    "hero.cta": "Start 7-day free trial",
    "hero.demo": "Or explore the demo →",
    "hero.bullet1": "✓ No credit card",
    "hero.bullet2": "✓ Cancel anytime",
    "hero.bullet3": "✓ Setup in 5 minutes",
    "social.proof": "Trusted by 2,400+ hosts in Brazil, the US and Europe",
    "pricing.title.a": "Honest pricing.",
    "pricing.title.b": "No surprises.",
    "pricing.subtitle": "One simple plan with everything you need.",
    "pricing.plan.name": "Hostly Pro",
    "pricing.plan.tag": "Everything included",
    "pricing.plan.users": "Up to 5 users (you + 4 staff)",
    "pricing.plan.properties": "Unlimited properties",
    "pricing.plan.f1": "Unlimited properties",
    "pricing.plan.f2": "Up to 5 users via invite link",
    "pricing.plan.f3": "Photo cleaning checklist",
    "pricing.plan.f4": "Calendar & iCal (Airbnb/Booking)",
    "pricing.plan.f5": "Automatic alerts",
    "pricing.plan.f6": "Cleaner web app via link",
    "pricing.plan.f7": "Email support",
    "pricing.cta": "Start 7-day free trial",
    "pricing.note": "✓ 7 days free  ✓ No card  ✓ Cancel anytime",
    "cta.title": "Start managing like a pro.",
    "cta.subtitle": "7 days free. No card. No fuss.",
    "cta.btn": "Create my free account",
    "footer.rights": "© 2026 Hostly. All rights reserved.",
  },
  es: {
    "nav.features": "Funciones",
    "nav.pricing": "Precios",
    "nav.faq": "FAQ",
    "nav.signin": "Entrar",
    "nav.cta": "Empezar gratis",
    "hero.badge": "✦ Gestión simplificada de Airbnb",
    "hero.title.a": "Adiós al",
    "hero.title.b": "caos",
    "hero.title.c": "en la gestión de tu Airbnb.",
    "hero.subtitle": "Controla limpiezas, huéspedes y equipo en un solo lugar. 7 días gratis sin tarjeta.",
    "hero.cta": "Empezar prueba de 7 días",
    "hero.demo": "O explora la demo →",
    "hero.bullet1": "✓ Sin tarjeta",
    "hero.bullet2": "✓ Cancela cuando quieras",
    "hero.bullet3": "✓ Listo en 5 minutos",
    "social.proof": "Usado por +2.400 anfitriones en Brasil, EE.UU. y Europa",
    "pricing.title.a": "Precio honesto.",
    "pricing.title.b": "Sin sorpresas.",
    "pricing.subtitle": "Un plan simple, con todo lo que necesitas.",
    "pricing.plan.name": "Hostly Pro",
    "pricing.plan.tag": "Todo incluido",
    "pricing.plan.users": "Hasta 5 usuarios (tú + 4 empleados)",
    "pricing.plan.properties": "Propiedades ilimitadas",
    "pricing.plan.f1": "Propiedades ilimitadas",
    "pricing.plan.f2": "Hasta 5 usuarios por invitación",
    "pricing.plan.f3": "Checklist de limpieza con fotos",
    "pricing.plan.f4": "Calendario e iCal (Airbnb/Booking)",
    "pricing.plan.f5": "Alertas automáticas",
    "pricing.plan.f6": "App de limpieza por enlace",
    "pricing.plan.f7": "Soporte por email",
    "pricing.cta": "Empezar prueba de 7 días",
    "pricing.note": "✓ 7 días gratis  ✓ Sin tarjeta  ✓ Cancela cuando quieras",
    "cta.title": "Gestiona como un profesional.",
    "cta.subtitle": "7 días gratis. Sin tarjeta. Sin complicaciones.",
    "cta.btn": "Crear mi cuenta gratis",
    "footer.rights": "© 2026 Hostly. Todos los derechos reservados.",
  },
  fr: {
    "nav.features": "Fonctionnalités",
    "nav.pricing": "Tarifs",
    "nav.faq": "FAQ",
    "nav.signin": "Se connecter",
    "nav.cta": "Commencer",
    "hero.badge": "✦ Gestion Airbnb simplifiée",
    "hero.title.a": "Fini le",
    "hero.title.b": "chaos",
    "hero.title.c": "dans la gestion de votre Airbnb.",
    "hero.subtitle": "Pilotez ménages, voyageurs et équipe au même endroit. 7 jours gratuits, sans carte.",
    "hero.cta": "Essai gratuit de 7 jours",
    "hero.demo": "Ou voir la démo →",
    "hero.bullet1": "✓ Sans carte",
    "hero.bullet2": "✓ Sans engagement",
    "hero.bullet3": "✓ Prêt en 5 minutes",
    "social.proof": "Utilisé par +2 400 hôtes au Brésil, aux USA et en Europe",
    "pricing.title.a": "Tarif honnête.",
    "pricing.title.b": "Sans surprise.",
    "pricing.subtitle": "Un plan simple, tout ce qu'il vous faut.",
    "pricing.plan.name": "Hostly Pro",
    "pricing.plan.tag": "Tout inclus",
    "pricing.plan.users": "Jusqu'à 5 utilisateurs (vous + 4 employés)",
    "pricing.plan.properties": "Logements illimités",
    "pricing.plan.f1": "Logements illimités",
    "pricing.plan.f2": "5 utilisateurs par invitation",
    "pricing.plan.f3": "Checklist ménage avec photos",
    "pricing.plan.f4": "Calendrier et iCal (Airbnb/Booking)",
    "pricing.plan.f5": "Alertes automatiques",
    "pricing.plan.f6": "App du ménage par lien",
    "pricing.plan.f7": "Support par e-mail",
    "pricing.cta": "Essai gratuit de 7 jours",
    "pricing.note": "✓ 7 jours gratuits  ✓ Sans carte  ✓ Sans engagement",
    "cta.title": "Gérez comme un pro.",
    "cta.subtitle": "7 jours gratuits. Sans carte. Sans tracas.",
    "cta.btn": "Créer mon compte gratuit",
    "footer.rights": "© 2026 Hostly. Tous droits réservés.",
  },
  it: {
    "nav.features": "Funzionalità",
    "nav.pricing": "Prezzi",
    "nav.faq": "FAQ",
    "nav.signin": "Accedi",
    "nav.cta": "Inizia gratis",
    "hero.badge": "✦ Gestione Airbnb semplificata",
    "hero.title.a": "Basta",
    "hero.title.b": "caos",
    "hero.title.c": "nella gestione del tuo Airbnb.",
    "hero.subtitle": "Pulizie, ospiti e team in un unico posto. 7 giorni gratis, senza carta.",
    "hero.cta": "Prova gratuita di 7 giorni",
    "hero.demo": "Oppure prova la demo →",
    "hero.bullet1": "✓ Senza carta",
    "hero.bullet2": "✓ Disdici quando vuoi",
    "hero.bullet3": "✓ Pronto in 5 minuti",
    "social.proof": "Usato da +2.400 host in Brasile, USA ed Europa",
    "pricing.title.a": "Prezzo onesto.",
    "pricing.title.b": "Nessuna sorpresa.",
    "pricing.subtitle": "Un piano semplice, con tutto ciò che ti serve.",
    "pricing.plan.name": "Hostly Pro",
    "pricing.plan.tag": "Tutto incluso",
    "pricing.plan.users": "Fino a 5 utenti (tu + 4 dipendenti)",
    "pricing.plan.properties": "Immobili illimitati",
    "pricing.plan.f1": "Immobili illimitati",
    "pricing.plan.f2": "Fino a 5 utenti per invito",
    "pricing.plan.f3": "Checklist pulizia con foto",
    "pricing.plan.f4": "Calendario e iCal (Airbnb/Booking)",
    "pricing.plan.f5": "Avvisi automatici",
    "pricing.plan.f6": "App pulizie via link",
    "pricing.plan.f7": "Supporto via email",
    "pricing.cta": "Prova gratuita di 7 giorni",
    "pricing.note": "✓ 7 giorni gratis  ✓ Senza carta  ✓ Disdici quando vuoi",
    "cta.title": "Gestisci come un professionista.",
    "cta.subtitle": "7 giorni gratis. Senza carta. Senza problemi.",
    "cta.btn": "Crea il mio account gratuito",
    "footer.rights": "© 2026 Hostly. Tutti i diritti riservati.",
  },
  de: {
    "nav.features": "Funktionen",
    "nav.pricing": "Preise",
    "nav.faq": "FAQ",
    "nav.signin": "Anmelden",
    "nav.cta": "Kostenlos starten",
    "hero.badge": "✦ Vereinfachte Airbnb-Verwaltung",
    "hero.title.a": "Schluss mit dem",
    "hero.title.b": "Chaos",
    "hero.title.c": "in deiner Airbnb-Verwaltung.",
    "hero.subtitle": "Reinigungen, Gäste und Team an einem Ort. 7 Tage gratis, ohne Karte.",
    "hero.cta": "7 Tage kostenlos testen",
    "hero.demo": "Oder Demo ansehen →",
    "hero.bullet1": "✓ Keine Karte",
    "hero.bullet2": "✓ Jederzeit kündbar",
    "hero.bullet3": "✓ In 5 Minuten startklar",
    "social.proof": "Vertraut von +2.400 Gastgebern in Brasilien, USA und Europa",
    "pricing.title.a": "Ehrlicher Preis.",
    "pricing.title.b": "Keine Überraschungen.",
    "pricing.subtitle": "Ein einfacher Plan mit allem, was du brauchst.",
    "pricing.plan.name": "Hostly Pro",
    "pricing.plan.tag": "Alles inklusive",
    "pricing.plan.users": "Bis zu 5 Nutzer (du + 4 Mitarbeiter)",
    "pricing.plan.properties": "Unbegrenzte Objekte",
    "pricing.plan.f1": "Unbegrenzte Objekte",
    "pricing.plan.f2": "Bis zu 5 Nutzer per Einladung",
    "pricing.plan.f3": "Reinigungs-Checkliste mit Fotos",
    "pricing.plan.f4": "Kalender & iCal (Airbnb/Booking)",
    "pricing.plan.f5": "Automatische Benachrichtigungen",
    "pricing.plan.f6": "Reinigungs-App per Link",
    "pricing.plan.f7": "E-Mail-Support",
    "pricing.cta": "7 Tage kostenlos testen",
    "pricing.note": "✓ 7 Tage gratis  ✓ Keine Karte  ✓ Jederzeit kündbar",
    "cta.title": "Verwalte wie ein Profi.",
    "cta.subtitle": "7 Tage gratis. Keine Karte. Kein Stress.",
    "cta.btn": "Kostenloses Konto erstellen",
    "footer.rights": "© 2026 Hostly. Alle Rechte vorbehalten.",
  },
};

interface LocaleCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  country: string;
  t: (key: string) => string;
  loading: boolean;
}

const Ctx = createContext<LocaleCtx>({
  lang: "pt", setLang: () => {}, currency: "BRL", setCurrency: () => {},
  country: "BR", t: (k) => k, loading: true,
});

const STORAGE_LANG = "hostly_lang";
const STORAGE_CURRENCY = "hostly_currency";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("pt");
  const [currency, setCurrencyState] = useState<Currency>("BRL");
  const [country, setCountry] = useState<string>("BR");
  const [loading, setLoading] = useState(true);

  // On mount: prefer stored choice; else fetch geo
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLang = (localStorage.getItem(STORAGE_LANG) as Lang | null);
    const storedCurr = (localStorage.getItem(STORAGE_CURRENCY) as Currency | null);

    fetch("/api/public/geo")
      .then((r) => r.json())
      .then((d: { country: string; currency: Currency; language: Lang }) => {
        setCountry(d.country || "BR");
        setLangState(storedLang || (d.language as Lang) || "pt");
        setCurrencyState(storedCurr || d.currency || "BRL");
      })
      .catch(() => {
        // Fallback to browser language
        const nav = (navigator.language || "pt").slice(0, 2).toLowerCase() as Lang;
        const isLang = (["pt","en","es","fr","it","de"] as Lang[]).includes(nav);
        setLangState(storedLang || (isLang ? nav : "en"));
        setCurrencyState(storedCurr || "USD");
      })
      .finally(() => setLoading(false));
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_LANG, l);
  };
  const setCurrency = (c: Currency) => {
    setCurrencyState(c);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_CURRENCY, c);
  };

  const t = useMemo(() => {
    const dict = DICTS[lang] || DICTS.pt;
    return (key: string) => dict[key] ?? DICTS.pt[key] ?? key;
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, currency, setCurrency, country, t, loading }}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx);
export const useT = () => useLocale().t;
