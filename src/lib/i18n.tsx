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

type Dict = Record<string, string>;

const pt: Dict = {
  "nav.features": "Funcionalidades",
  "nav.howItWorks": "Como funciona",
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
  "hero.imageAlt": "Anfitriã usando o Hostly no celular",

  "social.proof": "Confiado por +2.400 anfitriões no Brasil, EUA e Europa",

  "obj.eyebrow": "Quebrando as objeções",
  "obj.title": "Você já pensou em usar — e travou aqui.",
  "obj.q1": "“Não tenho tempo de aprender outro app.”",
  "obj.a1": "Setup em 5 minutos. Se você usa WhatsApp, sabe usar o Hostly.",
  "obj.q2": "“Minha faxineira não é boa com tecnologia.”",
  "obj.a2": "Ela só clica num link. Sem instalar app, sem criar conta, sem senha.",
  "obj.q3": "“Já tenho planilha funcionando.”",
  "obj.a3": "Planilha não te avisa de checkout. Não tira foto. Não fala com a faxineira.",
  "obj.q4": "“É caro?”",
  "obj.a4": "Menos que uma diária. Cancela em 1 clique se não gostar.",

  "ps.title": "Antes vs. depois do Hostly",
  "ps.without": "Sem o Hostly",
  "ps.with": "Com o Hostly",
  "ps.w1": "Avisa a faxineira pelo WhatsApp e não sabe se foi feita",
  "ps.w2": "Controla hóspedes em planilha do Excel",
  "ps.w3": "Esquece o checkout e o próximo hóspede chega num imóvel sujo",
  "ps.w4": "Não sabe se ficou objeto esquecido",
  "ps.w5": "Perde horas gerenciando cada imóvel separado",
  "ps.h1": "Faxineira recebe checklist no celular e manda fotos de cada cômodo",
  "ps.h2": "Dashboard com status de todos os imóveis em tempo real",
  "ps.h3": "Alerta automático antes de cada checkout",
  "ps.h4": "Foto e alerta imediato de todo objeto esquecido encontrado",
  "ps.h5": "Tudo num só app, em 2 minutos por dia",

  "feat.title": "Tudo que você precisa.",
  "feat.cleanings": "Limpezas",
  "feat.cleanings.d": "Checklist e fotos.",
  "feat.properties": "Imóveis",
  "feat.properties.d": "Endereço, mapas, wifi.",
  "feat.team": "Equipe",
  "feat.team.d": "Convide até 4 funcionários.",
  "feat.calendar": "Calendário",
  "feat.calendar.d": "iCal Airbnb/Booking.",
  "feat.guests": "Hóspedes",
  "feat.guests.d": "Histórico e avaliações.",
  "feat.dashboard": "Dashboard",
  "feat.dashboard.d": "KPIs em tempo real.",

  "hiw.title": "Pronto em 3 passos",
  "hiw.s1.t": "Cadastre seus imóveis",
  "hiw.s1.d": "Adicione endereço, fotos e o link iCal do seu Airbnb ou Booking.",
  "hiw.s2.t": "Conecte sua equipe",
  "hiw.s2.d": "Cadastre as faxineiras, vincule a cada imóvel e envie o link de acesso.",
  "hiw.s3.t": "Gerencie pelo celular",
  "hiw.s3.d": "Veja o status de tudo em tempo real e receba alertas automáticos.",

  "pricing.title.a": "Caro?",
  "pricing.title.b": "Menos que uma diária.",
  "pricing.subtitle": "Um plano. Tudo incluso. Para sempre. Sem upsell, sem letra miúda.",
  "pricing.plan.name": "Hostly Pro",
  "pricing.plan.tag": "Tudo incluso",
  "pricing.plan.users": "Até 5 usuários (você + 4 funcionários)",
  "pricing.plan.f1": "Imóveis ilimitados",
  "pricing.plan.f2": "Até 5 usuários por convite",
  "pricing.plan.f3": "Checklist de limpeza com fotos",
  "pricing.plan.f4": "Calendário e iCal (Airbnb/Booking)",
  "pricing.plan.f5": "Alertas automáticos de checkout",
  "pricing.plan.f6": "App da faxineira por link (sem instalar)",
  "pricing.plan.f7": "Suporte humano por e-mail",
  "pricing.cta": "Testar 7 dias grátis",
  "pricing.note": "✓ 7 dias grátis  ✓ Sem cartão  ✓ Cancele quando quiser",
  "pricing.suffix": "/mês",

  "faq.title": "Perguntas frequentes",
  "faq.q1": "Preciso de cartão de crédito para testar o Hostly?",
  "faq.a1": "Não. Os 7 dias de teste são totalmente gratuitos e não exigem cadastro de cartão. Você só paga se decidir continuar após o trial.",
  "faq.q2": "O Hostly funciona para Booking.com e VRBO também?",
  "faq.a2": "Sim. O Hostly importa reservas do Airbnb, Booking.com e VRBO via sincronização de calendário iCal.",
  "faq.q3": "A faxineira precisa baixar algum aplicativo?",
  "faq.a3": "Não. Ela recebe um link único e acessa o checklist diretamente pelo navegador, sem criar conta nem instalar nada.",
  "faq.q4": "Como funciona o controle de objetos esquecidos?",
  "faq.a4": "A faxineira fotografa e registra o objeto. Você recebe alerta imediato com foto e descrição.",
  "faq.q5": "Posso cancelar quando quiser?",
  "faq.a5": "Sim. Sem contrato, sem multa. Cancele com 1 clique. O acesso continua até o fim do período pago.",
  "faq.q6": "Quantos usuários e imóveis posso ter?",
  "faq.a6": "Você + até 4 funcionários (5 no total) e imóveis ilimitados — tudo no plano Pro.",
  "faq.q7": "Como o Hostly se integra com o Google Calendar?",
  "faq.a7": "Exporte checkins, checkouts e limpezas em formato .ics e importe em qualquer agenda.",
  "faq.q8": "Meus dados e fotos estão seguros?",
  "faq.a8": "Sim. Tudo criptografado em repouso e em trânsito. Fotos em armazenamento privado — só você acessa.",

  "cta.title": "Pare de apagar incêndio. Comece a gerenciar.",
  "cta.subtitle": "7 dias grátis. Sem cartão. Sem complicação. Em 5 minutos você está rodando.",
  "cta.btn": "Quero meus 7 dias grátis →",

  "footer.rights": "© 2026 Hostly. Todos os direitos reservados.",

  "signup.title": "Crie sua conta grátis",
  "signup.name": "Seu nome",
  "signup.email": "E-mail",
  "signup.password": "Senha (mín. 6 caracteres)",
  "signup.phone": "Número de telefone",
  "signup.show": "Mostrar",
  "signup.hide": "Ocultar",
  "signup.submit": "Criar conta",
  "signup.submitting": "Criando...",
  "signup.google": "Continuar com Google",
  "signup.have": "Já tem conta?",
  "signup.signin": "Entrar",
  "signup.success": "Conta criada!",
  "signup.googleFail": "Falha no login com Google",
  "signup.or": "ou",
};

const en: Dict = {
  "nav.features": "Features",
  "nav.howItWorks": "How it works",
  "nav.pricing": "Pricing",
  "nav.faq": "FAQ",
  "nav.signin": "Sign in",
  "nav.cta": "Start free",

  "hero.badge": "✦ 2,400+ hosts stopped managing by WhatsApp",
  "hero.title.a": "Your Airbnb",
  "hero.title.b": "on autopilot",
  "hero.title.c": "— in 2 minutes a day.",
  "hero.subtitle": "Cleaner who doesn't reply. Guest arriving at a dirty place. Forgotten items you find weeks later. Hostly fixes all of that — straight from your phone.",
  "hero.cta": "Stop the chaos →",
  "hero.demo": "Or explore the demo →",
  "hero.bullet1": "✓ 7 days free",
  "hero.bullet2": "✓ No credit card",
  "hero.bullet3": "✓ Cancel in 1 click",
  "hero.imageAlt": "Host using Hostly on phone",

  "social.proof": "Trusted by 2,400+ hosts in Brazil, the US and Europe",

  "obj.eyebrow": "Breaking objections",
  "obj.title": "You thought about it — and got stuck here.",
  "obj.q1": "“I don't have time to learn another app.”",
  "obj.a1": "Setup in 5 minutes. If you use WhatsApp, you can use Hostly.",
  "obj.q2": "“My cleaner isn't great with tech.”",
  "obj.a2": "She just clicks a link. No app, no account, no password.",
  "obj.q3": "“My spreadsheet works fine.”",
  "obj.a3": "A spreadsheet doesn't warn you about checkout. Or take photos. Or talk to your cleaner.",
  "obj.q4": "“Is it expensive?”",
  "obj.a4": "Less than one night. Cancel in 1 click if you don't love it.",

  "ps.title": "Before vs. after Hostly",
  "ps.without": "Without Hostly",
  "ps.with": "With Hostly",
  "ps.w1": "You ping the cleaner on WhatsApp and never know if it got done",
  "ps.w2": "You track guests in an Excel sheet",
  "ps.w3": "You forget the checkout and the next guest arrives to a dirty place",
  "ps.w4": "You don't know if anything was left behind",
  "ps.w5": "You waste hours managing each property separately",
  "ps.h1": "Cleaner gets a checklist on her phone and sends photos of every room",
  "ps.h2": "Real-time dashboard with the status of every property",
  "ps.h3": "Automatic alert before every checkout",
  "ps.h4": "Photo and instant alert for every forgotten item found",
  "ps.h5": "All in one app, 2 minutes a day",

  "feat.title": "Everything you need.",
  "feat.cleanings": "Cleanings",
  "feat.cleanings.d": "Checklist and photos.",
  "feat.properties": "Properties",
  "feat.properties.d": "Address, maps, wifi.",
  "feat.team": "Team",
  "feat.team.d": "Invite up to 4 staff.",
  "feat.calendar": "Calendar",
  "feat.calendar.d": "iCal Airbnb/Booking.",
  "feat.guests": "Guests",
  "feat.guests.d": "History and reviews.",
  "feat.dashboard": "Dashboard",
  "feat.dashboard.d": "Real-time KPIs.",

  "hiw.title": "Ready in 3 steps",
  "hiw.s1.t": "Add your properties",
  "hiw.s1.d": "Add address, photos and the iCal link from Airbnb or Booking.",
  "hiw.s2.t": "Connect your team",
  "hiw.s2.d": "Add cleaners, link them to each property and share the access link.",
  "hiw.s3.t": "Manage from your phone",
  "hiw.s3.d": "See real-time status and get automatic alerts.",

  "pricing.title.a": "Expensive?",
  "pricing.title.b": "Less than one night.",
  "pricing.subtitle": "One plan. Everything included. Forever. No upsells, no fine print.",
  "pricing.plan.name": "Hostly Pro",
  "pricing.plan.tag": "Everything included",
  "pricing.plan.users": "Up to 5 users (you + 4 staff)",
  "pricing.plan.f1": "Unlimited properties",
  "pricing.plan.f2": "Up to 5 users via invite link",
  "pricing.plan.f3": "Photo cleaning checklist",
  "pricing.plan.f4": "Calendar & iCal (Airbnb/Booking)",
  "pricing.plan.f5": "Automatic checkout alerts",
  "pricing.plan.f6": "Cleaner web app via link (no install)",
  "pricing.plan.f7": "Human email support",
  "pricing.cta": "Try 7 days free",
  "pricing.note": "✓ 7 days free  ✓ No card  ✓ Cancel anytime",
  "pricing.suffix": "/mo",

  "faq.title": "Frequently asked questions",
  "faq.q1": "Do I need a credit card to try Hostly?",
  "faq.a1": "No. The 7-day trial is free and requires no card. You only pay if you decide to continue.",
  "faq.q2": "Does Hostly work for Booking.com and VRBO too?",
  "faq.a2": "Yes. Hostly imports reservations from Airbnb, Booking.com and VRBO via iCal.",
  "faq.q3": "Does the cleaner need to download an app?",
  "faq.a3": "No. She gets a unique link and opens the checklist in her browser — no account, no install.",
  "faq.q4": "How does forgotten-items tracking work?",
  "faq.a4": "The cleaner photographs and logs the item. You get an instant alert with photo and description.",
  "faq.q5": "Can I cancel anytime?",
  "faq.a5": "Yes. No contract, no fee. Cancel in 1 click. Access stays until the end of the paid period.",
  "faq.q6": "How many users and properties can I have?",
  "faq.a6": "You + up to 4 staff (5 total) and unlimited properties — all in the Pro plan.",
  "faq.q7": "How does Hostly integrate with Google Calendar?",
  "faq.a7": "Export check-ins, check-outs and cleanings as .ics and import to any calendar.",
  "faq.q8": "Are my data and photos safe?",
  "faq.a8": "Yes. Encrypted at rest and in transit. Photos live in private storage — only you can access.",

  "cta.title": "Stop firefighting. Start managing.",
  "cta.subtitle": "7 days free. No card. No fuss. Up and running in 5 minutes.",
  "cta.btn": "Get my 7 free days →",

  "footer.rights": "© 2026 Hostly. All rights reserved.",

  "signup.title": "Create your free account",
  "signup.name": "Your name",
  "signup.email": "Email",
  "signup.password": "Password (min. 6 characters)",
  "signup.phone": "Phone number",
  "signup.show": "Show",
  "signup.hide": "Hide",
  "signup.submit": "Create account",
  "signup.submitting": "Creating...",
  "signup.google": "Continue with Google",
  "signup.have": "Have an account?",
  "signup.signin": "Sign in",
  "signup.success": "Account created!",
  "signup.googleFail": "Google sign-in failed",
  "signup.or": "or",
};

const es: Dict = {
  "nav.features": "Funciones",
  "nav.howItWorks": "Cómo funciona",
  "nav.pricing": "Precios",
  "nav.faq": "FAQ",
  "nav.signin": "Entrar",
  "nav.cta": "Empezar gratis",

  "hero.badge": "✦ +2.400 anfitriones dejaron de gestionar por WhatsApp",
  "hero.title.a": "Tu Airbnb",
  "hero.title.b": "en piloto automático",
  "hero.title.c": "— en 2 minutos al día.",
  "hero.subtitle": "Limpiadora que no responde. Huésped llegando a un piso sucio. Objeto olvidado que descubres semanas después. Hostly lo resuelve todo — desde tu móvil.",
  "hero.cta": "Quiero acabar con el caos →",
  "hero.demo": "O prueba la demo →",
  "hero.bullet1": "✓ 7 días gratis",
  "hero.bullet2": "✓ Sin tarjeta",
  "hero.bullet3": "✓ Cancela en 1 clic",
  "hero.imageAlt": "Anfitriona usando Hostly en el móvil",

  "social.proof": "Usado por +2.400 anfitriones en Brasil, EE.UU. y Europa",

  "obj.eyebrow": "Rompiendo objeciones",
  "obj.title": "Lo pensaste — y te quedaste atascado aquí.",
  "obj.q1": "“No tengo tiempo de aprender otra app.”",
  "obj.a1": "Listo en 5 minutos. Si usas WhatsApp, sabes usar Hostly.",
  "obj.q2": "“Mi limpiadora no es buena con la tecnología.”",
  "obj.a2": "Ella solo hace clic en un enlace. Sin app, sin cuenta, sin contraseña.",
  "obj.q3": "“Ya tengo una hoja de cálculo.”",
  "obj.a3": "Una hoja no avisa del checkout. No saca fotos. No habla con tu limpiadora.",
  "obj.q4": "“¿Es caro?”",
  "obj.a4": "Menos que una noche. Cancela en 1 clic si no te gusta.",

  "ps.title": "Antes vs. después de Hostly",
  "ps.without": "Sin Hostly",
  "ps.with": "Con Hostly",
  "ps.w1": "Avisas a la limpiadora por WhatsApp y no sabes si se hizo",
  "ps.w2": "Controlas huéspedes en una hoja de Excel",
  "ps.w3": "Olvidas el checkout y el siguiente huésped llega a un piso sucio",
  "ps.w4": "No sabes si quedó algún objeto olvidado",
  "ps.w5": "Pierdes horas gestionando cada piso por separado",
  "ps.h1": "La limpiadora recibe el checklist en el móvil y envía fotos de cada habitación",
  "ps.h2": "Dashboard con el estado de todos los pisos en tiempo real",
  "ps.h3": "Aviso automático antes de cada checkout",
  "ps.h4": "Foto y alerta inmediata de cada objeto olvidado",
  "ps.h5": "Todo en una app, 2 minutos al día",

  "feat.title": "Todo lo que necesitas.",
  "feat.cleanings": "Limpiezas",
  "feat.cleanings.d": "Checklist y fotos.",
  "feat.properties": "Propiedades",
  "feat.properties.d": "Dirección, mapas, wifi.",
  "feat.team": "Equipo",
  "feat.team.d": "Invita hasta 4 empleados.",
  "feat.calendar": "Calendario",
  "feat.calendar.d": "iCal Airbnb/Booking.",
  "feat.guests": "Huéspedes",
  "feat.guests.d": "Historial y reseñas.",
  "feat.dashboard": "Dashboard",
  "feat.dashboard.d": "KPIs en tiempo real.",

  "hiw.title": "Listo en 3 pasos",
  "hiw.s1.t": "Añade tus propiedades",
  "hiw.s1.d": "Añade dirección, fotos y el enlace iCal de Airbnb o Booking.",
  "hiw.s2.t": "Conecta tu equipo",
  "hiw.s2.d": "Añade limpiadoras, vincúlalas a cada propiedad y comparte el enlace.",
  "hiw.s3.t": "Gestiona desde tu móvil",
  "hiw.s3.d": "Ve el estado en tiempo real y recibe avisos automáticos.",

  "pricing.title.a": "¿Caro?",
  "pricing.title.b": "Menos que una noche.",
  "pricing.subtitle": "Un plan. Todo incluido. Para siempre. Sin upsells, sin letra pequeña.",
  "pricing.plan.name": "Hostly Pro",
  "pricing.plan.tag": "Todo incluido",
  "pricing.plan.users": "Hasta 5 usuarios (tú + 4 empleados)",
  "pricing.plan.f1": "Propiedades ilimitadas",
  "pricing.plan.f2": "Hasta 5 usuarios por invitación",
  "pricing.plan.f3": "Checklist de limpieza con fotos",
  "pricing.plan.f4": "Calendario e iCal (Airbnb/Booking)",
  "pricing.plan.f5": "Avisos automáticos de checkout",
  "pricing.plan.f6": "App de limpieza por enlace (sin instalar)",
  "pricing.plan.f7": "Soporte humano por email",
  "pricing.cta": "Probar 7 días gratis",
  "pricing.note": "✓ 7 días gratis  ✓ Sin tarjeta  ✓ Cancela cuando quieras",
  "pricing.suffix": "/mes",

  "faq.title": "Preguntas frecuentes",
  "faq.q1": "¿Necesito tarjeta para probar Hostly?",
  "faq.a1": "No. Los 7 días son gratis y no piden tarjeta. Solo pagas si decides continuar.",
  "faq.q2": "¿Hostly funciona también con Booking.com y VRBO?",
  "faq.a2": "Sí. Hostly importa reservas de Airbnb, Booking.com y VRBO mediante iCal.",
  "faq.q3": "¿La limpiadora necesita descargar alguna app?",
  "faq.a3": "No. Recibe un enlace único y abre el checklist en el navegador — sin cuenta ni instalación.",
  "faq.q4": "¿Cómo funciona el control de objetos olvidados?",
  "faq.a4": "La limpiadora fotografía y registra el objeto. Recibes un aviso inmediato con foto y descripción.",
  "faq.q5": "¿Puedo cancelar cuando quiera?",
  "faq.a5": "Sí. Sin contrato, sin penalización. Cancela en 1 clic. El acceso sigue hasta fin del periodo pagado.",
  "faq.q6": "¿Cuántos usuarios y propiedades puedo tener?",
  "faq.a6": "Tú + hasta 4 empleados (5 en total) y propiedades ilimitadas — todo en el plan Pro.",
  "faq.q7": "¿Cómo se integra Hostly con Google Calendar?",
  "faq.a7": "Exporta entradas, salidas y limpiezas en .ics e importa en cualquier calendario.",
  "faq.q8": "¿Mis datos y fotos están seguros?",
  "faq.a8": "Sí. Cifrado en reposo y en tránsito. Fotos en almacenamiento privado — solo tú accedes.",

  "cta.title": "Deja de apagar fuegos. Empieza a gestionar.",
  "cta.subtitle": "7 días gratis. Sin tarjeta. Sin líos. En 5 minutos estás listo.",
  "cta.btn": "Quiero mis 7 días gratis →",

  "footer.rights": "© 2026 Hostly. Todos los derechos reservados.",

  "signup.title": "Crea tu cuenta gratis",
  "signup.name": "Tu nombre",
  "signup.email": "Email",
  "signup.password": "Contraseña (mín. 6 caracteres)",
  "signup.phone": "Número de teléfono",
  "signup.show": "Mostrar",
  "signup.hide": "Ocultar",
  "signup.submit": "Crear cuenta",
  "signup.submitting": "Creando...",
  "signup.google": "Continuar con Google",
  "signup.have": "¿Ya tienes cuenta?",
  "signup.signin": "Entrar",
  "signup.success": "¡Cuenta creada!",
  "signup.googleFail": "Error al iniciar sesión con Google",
  "signup.or": "o",
};

const DICTS: Record<Lang, Dict> = {
  pt, en, es,
  fr: en, it: en, de: en,
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLang = (localStorage.getItem(STORAGE_LANG) as Lang | null);
    const storedCurr = (localStorage.getItem(STORAGE_CURRENCY) as Currency | null);

    // Apply stored preferences immediately so UI doesn't flash in another language
    if (storedLang) setLangState(storedLang);
    if (storedCurr) setCurrencyState(storedCurr);

    // Skip geo lookup entirely if user already chose both
    if (storedLang && storedCurr) {
      setLoading(false);
      return;
    }

    fetch("/api/public/geo")
      .then((r) => r.json())
      .then((d: { country: string; currency: Currency; language: Lang }) => {
        setCountry(d.country || "BR");
        if (!storedLang) setLangState((d.language as Lang) || "pt");
        if (!storedCurr) setCurrencyState(d.currency || "BRL");
      })
      .catch(() => {
        const nav = (navigator.language || "pt").slice(0, 2).toLowerCase() as Lang;
        const isLang = (["pt","en","es","fr","it","de"] as Lang[]).includes(nav);
        if (!storedLang) setLangState(isLang ? nav : "en");
        if (!storedCurr) setCurrencyState("USD");
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
    const dict = DICTS[lang] || pt;
    return (key: string) => dict[key] ?? en[key] ?? pt[key] ?? key;
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang, currency, setCurrency, country, t, loading }}>{children}</Ctx.Provider>;
}

export const useLocale = () => useContext(Ctx);
export const useT = () => useLocale().t;
