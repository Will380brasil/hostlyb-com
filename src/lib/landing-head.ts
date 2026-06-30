const BASE_URL = "https://www.hostlyb.com";
const OG_IMAGE = `${BASE_URL}/og-cover.jpg`;

const META_BY_LANG: Record<string, { title: string; description: string; keywords: string }> = {
  pt: {
    title: "Hostlyb | O seu Airbnb, finalmente organizado.",
    description: "Pare de gerir o seu Airbnb pelo WhatsApp. Fotos de limpeza, alertas e calendário num só sítio. 14 dias grátis.",
    keywords: "gestão alojamento local, app anfitrião, sincronização airbnb booking, checklist limpeza fotos",
  },
  en: {
    title: "Hostlyb | Your Airbnb, finally organized.",
    description: "Stop running your Airbnb on WhatsApp. Cleaning photos, alerts, and calendar in one place. 14-day free trial.",
    keywords: "short term rental management, vacation rental software, airbnb calendar sync, cleaning checklist",
  },
  fr: { title: "Hostlyb | Votre Airbnb, enfin organisé.", description: "Arrêtez de gérer votre Airbnb sur WhatsApp.", keywords: "gestion location courte durée" },
  de: { title: "Hostlyb | Ihr Airbnb, endlich organisiert.", description: "Hören Sie auf, Ihr Airbnb über WhatsApp zu verwalten.", keywords: "ferienwohnung verwaltung" },
  it: { title: "Hostlyb | Il tuo Airbnb, finalmente organizzato.", description: "Smetti di gestire il tuo Airbnb su WhatsApp.", keywords: "gestione affitti brevi" },
  es: { title: "Hostlyb | Tu Airbnb, por fin organizado.", description: "Deja de gestionar tu Airbnb por WhatsApp.", keywords: "gestión alquiler vacacional" },
};

const LANGS = ["pt", "en", "es", "fr", "it", "de"] as const;
type Lang = (typeof LANGS)[number];

const OG_LOCALE: Record<string, string> = {
  pt: "pt_PT", en: "en_US", fr: "fr_FR", de: "de_DE", it: "it_IT", es: "es_ES",
};

const PATH_BY_LANG: Record<Lang, string> = {
  pt: "/", en: "/en", fr: "/fr", de: "/de", it: "/it", es: "/es",
};

export function buildLandingHead(lang: Lang) {
  const m = META_BY_LANG[lang];
  const canonical = BASE_URL + PATH_BY_LANG[lang];
  const altLinks = LANGS.map((l) => ({
    rel: "alternate",
    hreflang: l === "pt" ? "pt-PT" : l,
    href: BASE_URL + PATH_BY_LANG[l],
  }));
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { name: "keywords", content: m.keywords },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { name: "theme-color", content: "#0A0A0A" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.description },
      { property: "og:url", content: canonical },
      { property: "og:site_name", content: "Hostlyb" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: OG_LOCALE[lang] || "en_US" },
      ...LANGS.filter((l) => l !== lang).map((l) => ({
        property: "og:locale:alternate",
        content: OG_LOCALE[l],
      })),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: m.title },
      { name: "twitter:description", content: m.description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: canonical },
      ...altLinks,
      { rel: "alternate", hreflang: "pt-BR", href: BASE_URL + "/" },
      { rel: "alternate", hreflang: "x-default", href: BASE_URL + "/" },
    ],
    scripts: [],
  };
}

function detectLang(): string {
  if (typeof navigator === "undefined") return "pt";
  return (navigator.language || "pt").slice(0, 2).toLowerCase();
}

const LOGIN_META: Record<string, { title: string; description: string }> = {
  pt: { title: "Entrar — Hostlyb", description: "Aceda à sua conta Hostlyb." },
  en: { title: "Sign in — Hostlyb", description: "Access your Hostlyb account." },
  es: { title: "Iniciar sesión — Hostlyb", description: "Accede a tu cuenta Hostlyb." },
  fr: { title: "Se connecter — Hostlyb", description: "Accédez à votre compte Hostlyb." },
  de: { title: "Anmelden — Hostlyb", description: "Greifen Sie auf Ihr Hostlyb-Konto zu." },
  it: { title: "Accedi — Hostlyb", description: "Accedi al tuo account Hostlyb." },
};

export function buildLoginHead() {
  const lang = detectLang();
  const m = LOGIN_META[lang] ?? LOGIN_META.pt;
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { name: "robots", content: "noindex" },
    ],
  };
}

const SIGNUP_META: Record<string, { title: string; description: string }> = {
  pt: { title: "Inscrever-se — Planos Hostlyb", description: "Escolha o plano ideal para sua operação. 14 dias grátis, sem cartão de crédito." },
  en: { title: "Sign up — Hostlyb Plans", description: "Pick the plan that fits your operation. 14 days free, no credit card." },
  es: { title: "Inscribirse — Planes Hostlyb", description: "Elige el plan ideal para tu operación. 14 días gratis, sin tarjeta de crédito." },
  fr: { title: "S'inscrire — Plans Hostlyb", description: "Choisissez le plan idéal pour votre opération. 14 jours gratuits, sans carte." },
  de: { title: "Registrieren — Hostlyb-Pläne", description: "Wählen Sie den richtigen Plan. 14 Tage kostenlos, keine Kreditkarte." },
  it: { title: "Iscriviti — Piani Hostlyb", description: "Scegli il piano ideale. 14 giorni gratis, senza carta di credito." },
};

export function buildSignupHead() {
  const lang = detectLang();
  const m = SIGNUP_META[lang] ?? SIGNUP_META.pt;
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { name: "robots", content: "noindex" },
    ],
  };
}
