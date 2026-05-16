import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "pt" | "en" | "es" | "fr" | "it" | "de";
export type Currency = "BRL" | "USD" | "EUR" | "GBP";

export const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English",   flag: "🇺🇸" },
  { code: "es", label: "Español",   flag: "🇪🇸" },
  { code: "fr", label: "Français",  flag: "🇫🇷" },
  { code: "it", label: "Italiano",  flag: "🇮🇹" },
  { code: "de", label: "Deutsch",   flag: "🇩🇪" },
];

// Permanent 3-tier pricing (per month). Currency selected per visitor locale.
export const PLAN_PRICE: Record<"pro" | "premium", Record<Currency, number>> = {
  pro:     { BRL: 27.90, EUR: 9,    USD: 19,    GBP: 9 },
  premium: { BRL: 54.90, EUR: 19,   USD: 39,    GBP: 19 },
};

export function formatPrice(currency: Currency, lang: Lang, plan: "pro" | "premium" = "premium"): string {
  const amount = PLAN_PRICE[plan][currency];
  const locale =
    lang === "en" && (currency === "EUR" || currency === "GBP") ? "en-GB" :
    ({ pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE" } as Record<Lang, string>)[lang];
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency, minimumFractionDigits: currency === "BRL" ? 2 : 0 }).format(amount);
  } catch {
    const sym = currency === "BRL" ? "R$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
    return `${sym} ${amount.toFixed(2)}`;
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
  "hero.subtitle": "Faxineira que não responde. Hóspede chegando num imóvel sujo. Objeto esquecido que você só descobre semanas depois. O Hostlyb resolve tudo isso — direto do seu celular.",
  "hero.cta": "Quero parar com o caos →",
  "hero.demo": "Ou explore a demo →",
  "hero.bullet1": "✓ 7 dias grátis",
  "hero.bullet2": "✓ Sem cartão de crédito",
  "hero.bullet3": "✓ Cancele em 1 clique",
  "hero.imageAlt": "Anfitriã usando o Hostlyb no celular",

  "social.proof": "Confiado por +2.400 anfitriões no Brasil, EUA e Europa",

  "obj.eyebrow": "Quebrando as objeções",
  "obj.title": "Você já pensou em usar — e travou aqui.",
  "obj.q1": "“Não tenho tempo de aprender outro app.”",
  "obj.a1": "Setup em 5 minutos. Se você usa WhatsApp, sabe usar o Hostlyb.",
  "obj.q2": "“Minha faxineira não é boa com tecnologia.”",
  "obj.a2": "Ela só clica num link. Sem instalar app, sem criar conta, sem senha.",
  "obj.q3": "“Já tenho planilha funcionando.”",
  "obj.a3": "Planilha não te avisa de checkout. Não tira foto. Não fala com a faxineira.",
  "obj.q4": "“É caro?”",
  "obj.a4": "Menos que uma diária. Cancela em 1 clique se não gostar.",

  "ps.title": "Antes vs. depois do Hostlyb",
  "ps.without": "Sem o Hostlyb",
  "ps.with": "Com o Hostlyb",
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
  "feat.calendar.d": "Reservas, limpezas e checkouts.",
  "feat.guests": "Hóspedes",
  "feat.guests.d": "Histórico e avaliações.",
  "feat.dashboard": "Dashboard",
  "feat.dashboard.d": "KPIs em tempo real.",

  "hiw.title": "Pronto em 3 passos",
  "hiw.s1.t": "Cadastre seus imóveis",
  "hiw.s1.d": "Adicione endereço, fotos e detalhes — ou importe uma planilha com tudo de uma vez.",
  "hiw.s2.t": "Conecte sua equipe",
  "hiw.s2.d": "Cadastre as faxineiras, vincule a cada imóvel e envie o link de acesso.",
  "hiw.s3.t": "Gerencie pelo celular",
  "hiw.s3.d": "Veja o status de tudo em tempo real e receba alertas automáticos.",

  "pricing.title.a": "Caro?",
  "pricing.title.b": "Menos que uma diária.",
  "pricing.subtitle": "Dois planos. Sem complicação. Comece grátis e migre quando precisar de mais.",
  "pricing.free.name": "Gratuito",
  "pricing.free.tag": "Para começar",
  "pricing.free.f1": "Até 3 imóveis",
  "pricing.free.f2": "1 usuário",
  "pricing.free.f3": "Acesso a todas as funcionalidades",
  "pricing.free.f4": "Checklist de limpeza com fotos",
  "pricing.free.f5": "Importação por planilha",
  "pricing.free.cta": "Começar grátis",
  "pricing.premium.name": "Premium",
  "pricing.premium.tag": "Profissional",
  "pricing.premium.f1": "Imóveis ilimitados",
  "pricing.premium.f2": "Usuários ilimitados",
  "pricing.premium.f3": "Tudo do plano Gratuito",
  "pricing.premium.f4": "Alertas automáticos de checkout",
  "pricing.premium.f5": "Suporte humano por e-mail",
  "pricing.cta": "Testar 7 dias grátis",
  "pricing.note": "✓ 7 dias grátis  ✓ Sem cartão  ✓ Cancele quando quiser",
  "pricing.suffix": "/mês",
  "pricing.free.price": "Grátis",
  "pricing.popular": "★ MAIS POPULAR",

  "faq.title": "Perguntas frequentes",
  "faq.q1": "Preciso de cartão de crédito para testar o Hostlyb?",
  "faq.a1": "Não. Os 7 dias de teste são totalmente gratuitos e não exigem cadastro de cartão. Você só paga se decidir continuar após o trial.",
  "faq.q2": "Posso importar minhas reservas existentes?",
  "faq.a2": "Sim. Importe uma planilha (Excel ou CSV) com hóspedes, imóveis e finanças em segundos.",
  "faq.q3": "A faxineira precisa baixar algum aplicativo?",
  "faq.a3": "Não. Ela recebe um link único e acessa o checklist diretamente pelo navegador, sem criar conta nem instalar nada.",
  "faq.q4": "Como funciona o controle de objetos esquecidos?",
  "faq.a4": "A faxineira fotografa e registra o objeto. Você recebe alerta imediato com foto e descrição.",
  "faq.q5": "Posso cancelar quando quiser?",
  "faq.a5": "Sim. Sem contrato, sem multa. Cancele com 1 clique. O acesso continua até o fim do período pago.",
  "faq.q6": "Quantos usuários e imóveis posso ter?",
  "faq.a6": "Você + até 4 funcionários (5 no total) e imóveis ilimitados — tudo no plano Pro.",
  "faq.q7": "Como o Hostlyb se integra com o Google Calendar?",
  "faq.a7": "Exporte checkins, checkouts e limpezas em formato .ics e importe em qualquer agenda.",
  "faq.q8": "Meus dados e fotos estão seguros?",
  "faq.a8": "Sim. Tudo criptografado em repouso e em trânsito. Fotos em armazenamento privado — só você acessa.",

  "cta.title": "Pare de apagar incêndio. Comece a gerenciar.",
  "cta.subtitle": "7 dias grátis. Sem cartão. Sem complicação. Em 5 minutos você está rodando.",
  "cta.btn": "Quero meus 7 dias grátis →",

  "footer.rights": "© 2026 Hostlyb. Todos os direitos reservados.",

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
  "signup.phoneInvalid": "Telefone inválido. Digite apenas números (8-15 dígitos).",

  "login.title": "Entre na sua conta",
  "login.email": "E-mail",
  "login.password": "Senha",
  "login.submit": "Entrar",
  "login.submitting": "Entrando...",
  "login.google": "Continuar com Google",
  "login.googleFail": "Falha no login com Google",
  "login.noAccount": "Não tem conta?",
  "login.signup": "Criar conta",
  "login.fail": "E-mail ou senha inválidos",

  "cookies.title": "🍪 Sua privacidade",
  "cookies.body": "Usamos cookies para entender como você usa o Hostlyb e melhorar sua experiência.",
  "cookies.more": "Saber mais",
  "cookies.accept": "Aceitar",
  "cookies.deny": "Recusar",
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
  "hero.subtitle": "Cleaner who doesn't reply. Guest arriving at a dirty place. Forgotten items you find weeks later. Hostlyb fixes all of that — straight from your phone.",
  "hero.cta": "Stop the chaos →",
  "hero.demo": "Or explore the demo →",
  "hero.bullet1": "✓ 7 days free",
  "hero.bullet2": "✓ No credit card",
  "hero.bullet3": "✓ Cancel in 1 click",
  "hero.imageAlt": "Host using Hostlyb on phone",

  "social.proof": "Trusted by 2,400+ hosts in Brazil, the US and Europe",

  "obj.eyebrow": "Breaking objections",
  "obj.title": "You thought about it — and got stuck here.",
  "obj.q1": "“I don't have time to learn another app.”",
  "obj.a1": "Setup in 5 minutes. If you use WhatsApp, you can use Hostlyb.",
  "obj.q2": "“My cleaner isn't great with tech.”",
  "obj.a2": "She just clicks a link. No app, no account, no password.",
  "obj.q3": "“My spreadsheet works fine.”",
  "obj.a3": "A spreadsheet doesn't warn you about checkout. Or take photos. Or talk to your cleaner.",
  "obj.q4": "“Is it expensive?”",
  "obj.a4": "Less than one night. Cancel in 1 click if you don't love it.",

  "ps.title": "Before vs. after Hostlyb",
  "ps.without": "Without Hostlyb",
  "ps.with": "With Hostlyb",
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
  "feat.calendar.d": "Reservations, cleanings, checkouts.",
  "feat.guests": "Guests",
  "feat.guests.d": "History and reviews.",
  "feat.dashboard": "Dashboard",
  "feat.dashboard.d": "Real-time KPIs.",

  "hiw.title": "Ready in 3 steps",
  "hiw.s1.t": "Add your properties",
  "hiw.s1.d": "Add address, photos and details — or import a spreadsheet with everything at once.",
  "hiw.s2.t": "Connect your team",
  "hiw.s2.d": "Add cleaners, link them to each property and share the access link.",
  "hiw.s3.t": "Manage from your phone",
  "hiw.s3.d": "See real-time status and get automatic alerts.",

  "pricing.title.a": "Expensive?",
  "pricing.title.b": "Less than one night.",
  "pricing.subtitle": "Two plans. No fuss. Start free and upgrade when you need more.",
  "pricing.free.name": "Free",
  "pricing.free.tag": "To get started",
  "pricing.free.f1": "Up to 3 properties",
  "pricing.free.f2": "1 user",
  "pricing.free.f3": "Access to all features",
  "pricing.free.f4": "Photo cleaning checklist",
  "pricing.free.f5": "Spreadsheet import",
  "pricing.free.cta": "Start free",
  "pricing.premium.name": "Premium",
  "pricing.premium.tag": "Professional",
  "pricing.premium.f1": "Unlimited properties",
  "pricing.premium.f2": "Unlimited users",
  "pricing.premium.f3": "Everything in Free",
  "pricing.premium.f4": "Automatic checkout alerts",
  "pricing.premium.f5": "Human email support",
  "pricing.cta": "Try 7 days free",
  "pricing.note": "✓ 7 days free  ✓ No card  ✓ Cancel anytime",
  "pricing.suffix": "/mo",
  "pricing.free.price": "Free",
  "pricing.popular": "★ MOST POPULAR",

  "faq.title": "Frequently asked questions",
  "faq.q1": "Do I need a credit card to try Hostlyb?",
  "faq.a1": "No. The 7-day trial is free and requires no card. You only pay if you decide to continue.",
  "faq.q2": "Can I import my existing reservations?",
  "faq.a2": "Yes. Import a spreadsheet (Excel or CSV) with guests, properties and finances in seconds.",
  "faq.q3": "Does the cleaner need to download an app?",
  "faq.a3": "No. She gets a unique link and opens the checklist in her browser — no account, no install.",
  "faq.q4": "How does forgotten-items tracking work?",
  "faq.a4": "The cleaner photographs and logs the item. You get an instant alert with photo and description.",
  "faq.q5": "Can I cancel anytime?",
  "faq.a5": "Yes. No contract, no fee. Cancel in 1 click. Access stays until the end of the paid period.",
  "faq.q6": "How many users and properties can I have?",
  "faq.a6": "You + up to 4 staff (5 total) and unlimited properties — all in the Pro plan.",
  "faq.q7": "How does Hostlyb integrate with Google Calendar?",
  "faq.a7": "Export check-ins, check-outs and cleanings as .ics and import to any calendar.",
  "faq.q8": "Are my data and photos safe?",
  "faq.a8": "Yes. Encrypted at rest and in transit. Photos live in private storage — only you can access.",

  "cta.title": "Stop firefighting. Start managing.",
  "cta.subtitle": "7 days free. No card. No fuss. Up and running in 5 minutes.",
  "cta.btn": "Get my 7 free days →",

  "footer.rights": "© 2026 Hostlyb. All rights reserved.",

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
  "signup.phoneInvalid": "Invalid phone. Use digits only (8-15).",

  "login.title": "Sign in to your account",
  "login.email": "Email",
  "login.password": "Password",
  "login.submit": "Sign in",
  "login.submitting": "Signing in...",
  "login.google": "Continue with Google",
  "login.googleFail": "Google sign-in failed",
  "login.noAccount": "No account?",
  "login.signup": "Create account",
  "login.fail": "Invalid email or password",

  "cookies.title": "🍪 Your privacy",
  "cookies.body": "We use cookies to understand how you use Hostlyb and improve your experience.",
  "cookies.more": "Learn more",
  "cookies.accept": "Accept",
  "cookies.deny": "Decline",
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
  "hero.subtitle": "Limpiadora que no responde. Huésped llegando a un piso sucio. Objeto olvidado que descubres semanas después. Hostlyb lo resuelve todo — desde tu móvil.",
  "hero.cta": "Quiero acabar con el caos →",
  "hero.demo": "O prueba la demo →",
  "hero.bullet1": "✓ 7 días gratis",
  "hero.bullet2": "✓ Sin tarjeta",
  "hero.bullet3": "✓ Cancela en 1 clic",
  "hero.imageAlt": "Anfitriona usando Hostlyb en el móvil",

  "social.proof": "Usado por +2.400 anfitriones en Brasil, EE.UU. y Europa",

  "obj.eyebrow": "Rompiendo objeciones",
  "obj.title": "Lo pensaste — y te quedaste atascado aquí.",
  "obj.q1": "“No tengo tiempo de aprender otra app.”",
  "obj.a1": "Listo en 5 minutos. Si usas WhatsApp, sabes usar Hostlyb.",
  "obj.q2": "“Mi limpiadora no es buena con la tecnología.”",
  "obj.a2": "Ella solo hace clic en un enlace. Sin app, sin cuenta, sin contraseña.",
  "obj.q3": "“Ya tengo una hoja de cálculo.”",
  "obj.a3": "Una hoja no avisa del checkout. No saca fotos. No habla con tu limpiadora.",
  "obj.q4": "“¿Es caro?”",
  "obj.a4": "Menos que una noche. Cancela en 1 clic si no te gusta.",

  "ps.title": "Antes vs. después de Hostlyb",
  "ps.without": "Sin Hostlyb",
  "ps.with": "Con Hostlyb",
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
  "feat.calendar.d": "Reservas, limpiezas y checkouts.",
  "feat.guests": "Huéspedes",
  "feat.guests.d": "Historial y reseñas.",
  "feat.dashboard": "Dashboard",
  "feat.dashboard.d": "KPIs en tiempo real.",

  "hiw.title": "Listo en 3 pasos",
  "hiw.s1.t": "Añade tus propiedades",
  "hiw.s1.d": "Añade dirección, fotos y detalles — o importa una hoja de cálculo con todo a la vez.",
  "hiw.s2.t": "Conecta tu equipo",
  "hiw.s2.d": "Añade limpiadoras, vincúlalas a cada propiedad y comparte el enlace.",
  "hiw.s3.t": "Gestiona desde tu móvil",
  "hiw.s3.d": "Ve el estado en tiempo real y recibe avisos automáticos.",

  "pricing.title.a": "¿Caro?",
  "pricing.title.b": "Menos que una noche.",
  "pricing.subtitle": "Dos planes. Sin líos. Empieza gratis y mejora cuando necesites más.",
  "pricing.free.name": "Gratis",
  "pricing.free.tag": "Para empezar",
  "pricing.free.f1": "Hasta 3 propiedades",
  "pricing.free.f2": "1 usuario",
  "pricing.free.f3": "Acceso a todas las funciones",
  "pricing.free.f4": "Checklist de limpieza con fotos",
  "pricing.free.f5": "Importación por hoja de cálculo",
  "pricing.free.cta": "Empezar gratis",
  "pricing.premium.name": "Premium",
  "pricing.premium.tag": "Profesional",
  "pricing.premium.f1": "Propiedades ilimitadas",
  "pricing.premium.f2": "Usuarios ilimitados",
  "pricing.premium.f3": "Todo lo del plan Gratis",
  "pricing.premium.f4": "Avisos automáticos de checkout",
  "pricing.premium.f5": "Soporte humano por email",
  "pricing.cta": "Probar 7 días gratis",
  "pricing.note": "✓ 7 días gratis  ✓ Sin tarjeta  ✓ Cancela cuando quieras",
  "pricing.suffix": "/mes",
  "pricing.free.price": "Gratis",
  "pricing.popular": "★ MÁS POPULAR",

  "faq.title": "Preguntas frecuentes",
  "faq.q1": "¿Necesito tarjeta para probar Hostlyb?",
  "faq.a1": "No. Los 7 días son gratis y no piden tarjeta. Solo pagas si decides continuar.",
  "faq.q2": "¿Puedo importar mis reservas existentes?",
  "faq.a2": "Sí. Importa una hoja de cálculo (Excel o CSV) con huéspedes, propiedades y finanzas en segundos.",
  "faq.q3": "¿La limpiadora necesita descargar alguna app?",
  "faq.a3": "No. Recibe un enlace único y abre el checklist en el navegador — sin cuenta ni instalación.",
  "faq.q4": "¿Cómo funciona el control de objetos olvidados?",
  "faq.a4": "La limpiadora fotografía y registra el objeto. Recibes un aviso inmediato con foto y descripción.",
  "faq.q5": "¿Puedo cancelar cuando quiera?",
  "faq.a5": "Sí. Sin contrato, sin penalización. Cancela en 1 clic. El acceso sigue hasta fin del periodo pagado.",
  "faq.q6": "¿Cuántos usuarios y propiedades puedo tener?",
  "faq.a6": "Tú + hasta 4 empleados (5 en total) y propiedades ilimitadas — todo en el plan Pro.",
  "faq.q7": "¿Cómo se integra Hostlyb con Google Calendar?",
  "faq.a7": "Exporta entradas, salidas y limpiezas en .ics e importa en cualquier calendario.",
  "faq.q8": "¿Mis datos y fotos están seguros?",
  "faq.a8": "Sí. Cifrado en reposo y en tránsito. Fotos en almacenamiento privado — solo tú accedes.",

  "cta.title": "Deja de apagar fuegos. Empieza a gestionar.",
  "cta.subtitle": "7 días gratis. Sin tarjeta. Sin líos. En 5 minutos estás listo.",
  "cta.btn": "Quiero mis 7 días gratis →",

  "footer.rights": "© 2026 Hostlyb. Todos los derechos reservados.",

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
  "signup.phoneInvalid": "Teléfono inválido. Solo dígitos (8-15).",

  "login.title": "Entra en tu cuenta",
  "login.email": "Email",
  "login.password": "Contraseña",
  "login.submit": "Entrar",
  "login.submitting": "Entrando...",
  "login.google": "Continuar con Google",
  "login.googleFail": "Error al iniciar sesión con Google",
  "login.noAccount": "¿No tienes cuenta?",
  "login.signup": "Crear cuenta",
  "login.fail": "Email o contraseña inválidos",

  "cookies.title": "🍪 Tu privacidad",
  "cookies.body": "Usamos cookies para entender cómo usas Hostlyb y mejorar tu experiencia.",
  "cookies.more": "Saber más",
  "cookies.accept": "Aceptar",
  "cookies.deny": "Rechazar",
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
        if (!storedLang) {
          const l = (d.language as Lang) || "pt";
          setLangState(l);
          // Persist so subsequent pages don't flip language while user navigates.
          try { localStorage.setItem(STORAGE_LANG, l); } catch {}
        }
        if (!storedCurr) {
          const c = d.currency || "BRL";
          setCurrencyState(c);
          try { localStorage.setItem(STORAGE_CURRENCY, c); } catch {}
        }
      })
      .catch(() => {
        const nav = (navigator.language || "pt").slice(0, 2).toLowerCase() as Lang;
        const isLang = (["pt","en","es","fr","it","de"] as Lang[]).includes(nav);
        if (!storedLang) {
          const l = isLang ? nav : "en";
          setLangState(l);
          try { localStorage.setItem(STORAGE_LANG, l); } catch {}
        }
        if (!storedCurr) {
          setCurrencyState("USD");
          try { localStorage.setItem(STORAGE_CURRENCY, "USD"); } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_LANG, l);
    // Lang drives currency unless geo overrides (BR→BRL, SA→SAR display).
    const co = (country || "").toUpperCase();
    if (co !== "BR" && co !== "SA") {
      const next: Currency = l === "pt" ? "BRL" : l === "en" ? "USD" : "EUR";
      setCurrencyState(next);
      if (typeof window !== "undefined") localStorage.setItem(STORAGE_CURRENCY, next);
    }
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
