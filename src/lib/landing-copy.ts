import type { Lang } from "@/lib/i18n";

export interface LandingCopy {
  loginBtn: string;
  ctaPrimary: string;

  hero: {
    headline: string;
    subheadline: string;
    cta: string;
    bullets: [string, string, string];
    social: string;
    phoneDashboard: string;
    phoneCleanings: string;
    phoneCalendar: string;
  };

  problem: {
    title: string;
    rows: { bad: string; good: string }[];
  };

  how: {
    title: string;
    steps: { number: string; title: string; desc: string }[];
  };

  features: {
    title: string;
    cards: { icon: string; title: string; desc: string }[];
  };

  social: {
    title: string;
    testimonials: { quote: string; name: string; props: string; flag: string }[];
  };

  pricing: {
    title: string;
    subtitle: string;
    micro: string;
    perMo: string;
    popular: string;
    free: { name: string; tag: string; price: string; features: string[]; cta: string };
    pro: { name: string; tag: string; features: string[]; cta: string };
    premium: { name: string; tag: string; features: string[]; cta: string };
  };

  faq: {
    title: string;
    items: { q: string; a: string }[];
  };

  progress: {
    title: string;
    items: string[];
    copy: string;
  };

  finalCta: {
    title: string;
    subtitle: string;
    cta: string;
    micro: string;
  };
}

/* ============ PT ============ */
const pt: LandingCopy = {
  loginBtn: "Entrar",
  ctaPrimary: "Começar grátis — sem cartão",
  hero: {
    headline: "Pare de gerir o seu Airbnb pelo WhatsApp.",
    subheadline: "Checkout amanhã. Limpeza agendada. Você dormiu. Enquanto está no café, o Hostlyb cuida do resto — fotos da faxineira no e-mail, alertas antes de cada checkout, calendários sincronizados sozinhos.",
    cta: "Quero testar 14 dias grátis",
    bullets: ["✓ Sem cartão", "✓ Cancele a qualquer momento", "✓ Pronto em 5 minutos"],
    social: "★★★★★ 2.400+ anfitriões em Portugal, Brasil e Europa",
    phoneDashboard: "Painel",
    phoneCleanings: "Limpezas",
    phoneCalendar: "Calendário",
  },
  problem: {
    title: "Soa familiar?",
    rows: [
      { bad: "Manda WhatsApp à faxineira e fica sem saber se foi feito.", good: "A faxineira recebe o checklist no telemóvel — fotos chegam ao seu e-mail automaticamente." },
      { bad: "Descobre objetos esquecidos semanas depois.", good: "Foto e alerta no momento exato em que é encontrado." },
      { bad: "O próximo hóspede chega e o imóvel ainda está por limpar.", good: "Alerta automático antes de cada checkout." },
      { bad: "Não sabe o que se passa sem ligar a alguém.", good: "Painel em tempo real de todos os imóveis num ecrã." },
      { bad: "Gere tudo entre WhatsApp, Excel e um caderno.", good: "Tudo num só lugar. 2 minutos por dia." },
    ],
  },
  how: {
    title: "Pronto em 3 passos. Sem formação. Sem complicação.",
    steps: [
      { number: "1", title: "Adicione o seu imóvel", desc: "2 minutos. Ou importe de uma folha de cálculo." },
      { number: "2", title: "Convide a sua faxineira", desc: "Ela recebe um link. Sem app. Sem conta. Só clica." },
      { number: "3", title: "Gere tudo pelo telemóvel", desc: "Estado em tempo real, alertas automáticos, pronto." },
    ],
  },
  features: {
    title: "Tudo o que precisa. Nada do que não precisa.",
    cards: [
      { icon: "🧹", title: "Fotos direto no seu e-mail", desc: "Sem limite de armazenamento. Qualidade total. O seu inbox passa a ser o arquivo." },
      { icon: "⏱️", title: "Quanto tempo demora cada limpeza", desc: "Cobre a taxa de limpeza com justiça. Dados reais da equipa." },
      { icon: "📦", title: "Objetos esquecidos com foto instantânea", desc: "Nunca mais perde nada. A foto chega no momento em que é encontrado." },
      { icon: "🔴", title: "Avarias reportadas pela faxineira", desc: "Foto e descrição direto para o seu e-mail." },
      { icon: "📅", title: "Calendário com reservas, limpezas e checkouts", desc: "Um ecrã. Tudo num só sítio." },
      { icon: "💰", title: "Financeiro simples — receita, despesa, lucro por imóvel", desc: "Automático. Sem folhas de cálculo." },
      { icon: "👥", title: "Perfis de hóspedes com etiquetas", desc: "VIP, recorrente, atenção — num piscar de olhos." },
      { icon: "🏆", title: "Score de organização da operação", desc: "Veja o quão organizado está e o que pode melhorar." },
      { icon: "🔗", title: "Sincroniza com Airbnb e Booking.com", desc: "Cole um link iCal — os calendários ficam alinhados sozinhos." },
    ],
  },
  social: {
    title: "Mais de 2.400 anfitriões já largaram o WhatsApp.",
    testimonials: [
      { quote: "Em 5 minutos sei o estado de todos os meus imóveis. Antes era WhatsApp e Excel.", name: "Mariana S.", props: "4 imóveis · Lisboa", flag: "🇵🇹" },
      { quote: "As fotos da limpeza no e-mail mudaram tudo. Vejo cada divisão.", name: "James T.", props: "2 properties · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 propriétés · Paris", flag: "🇫🇷" },
      { quote: "Als Vermieter mit 6 Wohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 properties · Berlin", flag: "🇩🇪" },
    ],
  },
  pricing: {
    title: "Comece grátis. Cresça quando estiver pronto.",
    subtitle: "Menos que a taxa de uma diária. Sem contrato. Cancele quando quiser.",
    micro: "✓ Sem contrato   ✓ Cancele a qualquer momento   ✓ Troque de plano quando quiser",
    perMo: "/mês",
    popular: "★ MAIS POPULAR",
    free: { name: "Gratuito", tag: "Para começar", price: "Grátis", features: ["1 imóvel", "1 utilizador", "Checklist de limpeza com fotos", "Hóspedes, calendário e objetos esquecidos", "Marca \"Powered by Hostlyb\" no link"], cta: "Começar grátis — sem cartão" },
    pro: { name: "Pro", tag: "Profissional", features: ["Até 5 imóveis, 3 utilizadores", "Tudo do Gratuito, sem marca no link", "Alertas automáticos + financeiro completo", "Importação por folha de cálculo + dashboard avançado", "Score de limpeza, timer, etiquetas + botão WhatsApp"], cta: "Subscrever Pro" },
    premium: { name: "Premium", tag: "Tudo incluído", features: ["Tudo do Pro + utilizadores ilimitados", "Guia digital do imóvel (link público)", "Check-in digital / ficha de hóspede", "Manutenção + relatório PDF por imóvel", "Suporte prioritário em 24h"], cta: "Subscrever Premium" },
  },
  faq: {
    title: "Já pensou nisto. Aqui está o que o travou.",
    items: [
      { q: "Não tenho tempo para aprender outra app.", a: "Configura em 5 minutos. A faxineira nem precisa de conta — clica num link." },
      { q: "A minha faxineira não se dá bem com tecnologia.", a: "Recebe um link. Abre o navegador. Tira fotos. Pronto. Sem app. Sem palavra-passe." },
      { q: "E as fotos? Onde ficam?", a: "Vão direto para o seu e-mail em qualidade total. O inbox passa a ser o arquivo — ilimitado, pesquisável, sempre disponível." },
      { q: "Já tenho um Excel que funciona.", a: "O Excel não o avisa de checkouts. Não envia fotos. Não o notifica de avarias." },
      { q: "É caro?", a: "O plano grátis é permanente — não é teste. O Pro custa menos que uma diária. Cancela com 1 clique se não gostar." },
      { q: "E se tiver imóveis em países diferentes?", a: "Funciona em qualquer país, 6 idiomas, moeda local." },
      { q: "Funciona com Airbnb e Booking.com?", a: "Sim. Cola o link iCal de qualquer plataforma — os calendários ficam sincronizados sozinhos." },
    ],
  },
  progress: {
    title: "A sua operação pode estar assim.",
    items: ["Imóveis adicionados", "Faxineira convidada", "Checklists configurados", "Hóspedes importados", "Financeiro ativo", "Guia digital criado (Premium)"],
    copy: "A maioria dos anfitriões passa de 0% a 80%+ em menos de 15 minutos.",
  },
  finalCta: {
    title: "3 imóveis. 1 telemóvel. 0 stress.",
    subtitle: "Grátis para sempre até 1 imóvel. Sem cartão. Sem contrato.",
    cta: "Começar grátis — sem cartão →",
    micro: "✓ Pronto em 5 minutos   ✓ Cancele quando quiser   ✓ Usado em 3 continentes",
  },
};

/* ============ EN ============ */
const en: LandingCopy = {
  loginBtn: "Login",
  ctaPrimary: "Start free",
  hero: {
    headline: "Your short-term rental, organized in 2 minutes a day.",
    subheadline: "Stop managing cleanings over WhatsApp, losing track of forgotten items, and not knowing what's happening in your property. Hostlyb gives you full control — without the complexity.",
    cta: "Start free — no card needed",
    bullets: ["✓ Free plan forever", "✓ Cancel anytime", "✓ Setup in 5 minutes"],
    social: "★★★★★ Trusted by 2,400+ hosts in Brazil, USA and Europe",
    phoneDashboard: "Dashboard",
    phoneCleanings: "Cleanings",
    phoneCalendar: "Calendar",
  },
  problem: {
    title: "Does this sound familiar?",
    rows: [
      { bad: "Sends WhatsApp to cleaner and never knows if it was done", good: "Cleaner gets checklist on phone — photos sent to your email automatically" },
      { bad: "Finds out about forgotten items weeks later", good: "Instant photo alert the moment it is found" },
      { bad: "Next guest arrives and property is still dirty", good: "Automatic alert before every checkout" },
      { bad: "Has no idea what is happening without calling someone", good: "Real-time dashboard for all properties in one screen" },
      { bad: "Manages everything via WhatsApp, Excel and notebooks", good: "Everything in one place, 2 minutes a day" },
    ],
  },
  how: {
    title: "Ready in 3 steps. No training. No complexity.",
    steps: [
      { number: "1", title: "Register your property", desc: "2 minutes. Or import a spreadsheet." },
      { number: "2", title: "Invite your cleaner", desc: "She gets a link. No app. No account. Just clicks." },
      { number: "3", title: "Manage from your phone", desc: "Real-time status, automatic alerts, done." },
    ],
  },
  features: {
    title: "Everything you need. Nothing you don't.",
    cards: [
      { icon: "🧹", title: "Photos sent directly to your email", desc: "No storage limits. Full quality. Your inbox becomes the archive." },
      { icon: "⏱️", title: "Know exactly how long each cleaning takes", desc: "Price your fee fairly. Real data from your team." },
      { icon: "📦", title: "Forgotten items with instant photo alert", desc: "Never lose anything again. Photo arrives the moment it's found." },
      { icon: "🔴", title: "Maintenance issues reported from cleaner", desc: "Photo + description to your inbox." },
      { icon: "📅", title: "Calendar with bookings, cleanings, checkouts", desc: "One screen, everything." },
      { icon: "💰", title: "Simple financials — revenue, expenses, profit per property", desc: "Automatic. No spreadsheets." },
      { icon: "👥", title: "Guest profiles with tags", desc: "VIP, returning, attention — visible at a glance." },
      { icon: "🏆", title: "Operation score", desc: "See how organized you are and what to improve." },
      { icon: "🔗", title: "Sync with Airbnb and Booking.com", desc: "Paste one iCal link — calendars stay aligned." },
    ],
  },
  social: {
    title: "Over 2,400 hosts have already stopped managing via WhatsApp.",
    testimonials: [
      { quote: "In 5 minutes I know the status of all my properties. Before it was WhatsApp and Excel.", name: "Mariana S.", props: "4 properties · São Paulo", flag: "🇧🇷" },
      { quote: "The cleaning photos sent directly to my email changed everything. I see every room.", name: "James T.", props: "2 properties · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 properties · Paris", flag: "🇫🇷" },
      { quote: "Als Vermieter mit 6 Wohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 properties · Berlin", flag: "🇩🇪" },
    ],
  },
  pricing: {
    title: "Start free. Grow when you are ready.",
    subtitle: "Less than one night's booking fee. No contracts. Cancel anytime.",
    micro: "✓ No contract   ✓ Cancel anytime   ✓ Change plan at any time",
    perMo: "/mo",
    popular: "★ MOST POPULAR",
    free: { name: "Free", tag: "Get started", price: "Free", features: ["1 property", "1 user", "Cleaning checklist with photos", "Guests, calendar and forgotten items", "\"Powered by Hostlyb\" tag on link"], cta: "Start free" },
    pro: { name: "Pro", tag: "Professional", features: ["Up to 5 properties, 3 users", "Everything in Free, no branding on link", "Automatic alerts + full financial module", "Spreadsheet import + advanced dashboard", "Cleaning score, timer, tags + WhatsApp button"], cta: "Subscribe to Pro" },
    premium: { name: "Premium", tag: "All-inclusive", features: ["Everything in Pro + unlimited users", "Digital property guidebook (public link)", "Digital check-in / guest registration", "Maintenance log + per-property PDF report", "Priority support within 24h"], cta: "Subscribe to Premium" },
  },
  faq: {
    title: "You have thought about it. Here is what stopped you.",
    items: [
      { q: "I don't have time to learn another app.", a: "Setup in 5 minutes. The cleaner needs no account — just clicks a link." },
      { q: "My cleaner is not good with technology.", a: "She gets a link. Opens browser. Takes photos. Done. No app. No password." },
      { q: "What about the photos? Where do they go?", a: "Photos are sent directly to your email in full quality. Your inbox becomes your cleaning archive — unlimited, searchable, always available." },
      { q: "I already have a spreadsheet that works.", a: "A spreadsheet does not alert you about checkouts. Does not send photos. Does not notify you about maintenance issues." },
      { q: "Is it expensive?", a: "Free plan is permanent — not a trial. Pro costs less than one night's booking. Cancel in 1 click if you do not like it." },
      { q: "What if I have properties in different countries?", a: "Works in any country, 6 languages, local currency." },
      { q: "Does it work with Airbnb and Booking.com?", a: "Yes. Paste your iCal link from any platform — calendars stay in sync automatically." },
    ],
  },
  progress: {
    title: "Your operation can look like this.",
    items: ["Properties registered", "Cleaner invited", "Checklists set up", "Guests imported", "Financials active", "Guidebook created (Premium)"],
    copy: "Most hosts go from 0% to 80%+ in under 15 minutes.",
  },
  finalCta: {
    title: "Stop putting out fires. Start managing.",
    subtitle: "Free forever up to 1 property. No card. No contract.",
    cta: "Start free now →",
    micro: "✓ Setup in 5 minutes   ✓ Cancel anytime   ✓ Used across 3 continents",
  },
};

/* ============ ES ============ */
const es: LandingCopy = {
  loginBtn: "Entrar",
  ctaPrimary: "Empezar gratis",
  hero: {
    headline: "Tu alojamiento local, organizado en 2 minutos al día.",
    subheadline: "Deja de gestionar limpiezas por WhatsApp, perder objetos olvidados y no saber qué pasa en tu propiedad. Hostlyb te da control total — sin complejidad.",
    cta: "Empezar gratis — sin tarjeta",
    bullets: ["✓ Plan gratis para siempre", "✓ Cancela cuando quieras", "✓ Listo en 5 minutos"],
    social: "★★★★★ Usado por +2.400 anfitriones en Brasil, EE.UU. y Europa",
    phoneDashboard: "Panel",
    phoneCleanings: "Limpiezas",
    phoneCalendar: "Calendario",
  },
  problem: {
    title: "¿Te suena familiar?",
    rows: [
      { bad: "Avisa a la limpiadora por WhatsApp y nunca sabe si se hizo", good: "La limpiadora recibe el checklist en el móvil — fotos enviadas a tu correo automáticamente" },
      { bad: "Descubre objetos olvidados semanas después", good: "Alerta instantánea con foto en el momento que se encuentra" },
      { bad: "Llega el próximo huésped y la propiedad sigue sucia", good: "Alerta automática antes de cada checkout" },
      { bad: "No tiene idea de qué pasa sin llamar a alguien", good: "Panel en tiempo real de todas las propiedades en una pantalla" },
      { bad: "Gestiona todo por WhatsApp, Excel y libretas", good: "Todo en un solo lugar, 2 minutos al día" },
    ],
  },
  how: {
    title: "Listo en 3 pasos. Sin formación. Sin complejidad.",
    steps: [
      { number: "1", title: "Registra tu propiedad", desc: "2 minutos. O importa una hoja de cálculo." },
      { number: "2", title: "Invita a tu limpiadora", desc: "Recibe un enlace. Sin app. Sin cuenta. Solo clic." },
      { number: "3", title: "Gestiona desde el móvil", desc: "Estado en tiempo real, avisos automáticos, listo." },
    ],
  },
  features: {
    title: "Todo lo que necesitas. Nada que no.",
    cards: [
      { icon: "🧹", title: "Fotos enviadas directamente a tu correo", desc: "Sin límite de almacenamiento. Calidad total. Tu bandeja es el archivo." },
      { icon: "⏱️", title: "Sabe exactamente cuánto dura cada limpieza", desc: "Cobra la tarifa con justicia. Datos reales del equipo." },
      { icon: "📦", title: "Objetos olvidados con alerta foto instantánea", desc: "Nunca más pierdas nada. La foto llega al momento." },
      { icon: "🔴", title: "Problemas de mantenimiento reportados por la limpiadora", desc: "Foto + descripción directo a tu correo." },
      { icon: "📅", title: "Calendario con reservas, limpiezas y checkouts", desc: "Una pantalla, todo." },
      { icon: "💰", title: "Finanzas simples — ingresos, gastos, beneficio por propiedad", desc: "Automático. Sin hojas." },
      { icon: "👥", title: "Perfiles de huéspedes con etiquetas", desc: "VIP, recurrente, atención — de un vistazo." },
      { icon: "🏆", title: "Score de organización", desc: "Ve qué tan organizada está tu operación y qué mejorar." },
      { icon: "🔗", title: "Sincroniza con Airbnb y Booking.com", desc: "Pega un enlace iCal — calendarios alineados automáticamente." },
    ],
  },
  social: {
    title: "Más de 2.400 anfitriones ya dejaron de gestionar por WhatsApp.",
    testimonials: [
      { quote: "En 5 minutos sé el estado de todas mis propiedades. Antes era WhatsApp y Excel.", name: "Mariana S.", props: "4 propiedades · São Paulo", flag: "🇧🇷" },
      { quote: "Las fotos de limpieza enviadas a mi correo lo cambiaron todo. Veo cada habitación.", name: "James T.", props: "2 propiedades · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 propiedades · París", flag: "🇫🇷" },
      { quote: "Als Vermieter mit 6 Wohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 propiedades · Berlín", flag: "🇩🇪" },
    ],
  },
  pricing: {
    title: "Empieza gratis. Crece cuando estés listo.",
    subtitle: "Menos que la tarifa de una noche. Sin contratos. Cancela cuando quieras.",
    micro: "✓ Sin contrato   ✓ Cancela cuando quieras   ✓ Cambia de plan en cualquier momento",
    perMo: "/mes",
    popular: "★ MÁS POPULAR",
    free: { name: "Gratis", tag: "Para empezar", price: "Gratis", features: ["1 propiedad", "1 usuario", "Checklist de limpieza con fotos", "Huéspedes, calendario y objetos olvidados", "Marca \"Powered by Hostlyb\" en el enlace"], cta: "Empezar gratis" },
    pro: { name: "Pro", tag: "Profesional", features: ["Hasta 5 propiedades, 3 usuarios", "Todo del Gratis, sin marca en el enlace", "Avisos automáticos + módulo financiero completo", "Importación por hoja + dashboard avanzado", "Score de limpieza, timer, tags + botón WhatsApp"], cta: "Suscribirse a Pro" },
    premium: { name: "Premium", tag: "Todo incluido", features: ["Todo del Pro + usuarios ilimitados", "Guía digital de la propiedad (enlace público)", "Check-in digital / ficha de huésped", "Mantenimiento + informe PDF por propiedad", "Soporte prioritario en 24h"], cta: "Suscribirse a Premium" },
  },
  faq: {
    title: "Lo has pensado. Aquí está lo que te detuvo.",
    items: [
      { q: "No tengo tiempo de aprender otra app.", a: "Listo en 5 minutos. La limpiadora ni necesita cuenta — solo hace clic en un enlace." },
      { q: "Mi limpiadora no es buena con la tecnología.", a: "Recibe un enlace. Abre el navegador. Saca fotos. Listo. Sin app. Sin contraseña." },
      { q: "¿Y las fotos? ¿Dónde van?", a: "Las fotos se envían directamente a tu correo en calidad total. Tu bandeja se convierte en tu archivo de limpiezas — ilimitado, buscable, siempre disponible." },
      { q: "Ya tengo una hoja de cálculo que funciona.", a: "Una hoja no te avisa de checkouts. No envía fotos. No te notifica de problemas de mantenimiento." },
      { q: "¿Es caro?", a: "El plan gratis es permanente — no es prueba. Pro cuesta menos que una noche. Cancelas en 1 clic si no te gusta." },
      { q: "¿Y si tengo propiedades en países diferentes?", a: "Funciona en cualquier país, 6 idiomas, moneda local." },
      { q: "¿Funciona con Airbnb y Booking.com?", a: "Sí. Pega tu enlace iCal de cualquier plataforma — los calendarios se sincronizan automáticamente." },
    ],
  },
  progress: {
    title: "Tu operación puede verse así.",
    items: ["Propiedades registradas", "Limpiadora invitada", "Checklists configurados", "Huéspedes importados", "Finanzas activas", "Guía digital creada (Premium)"],
    copy: "La mayoría de anfitriones pasa de 0% a 80%+ en menos de 15 minutos.",
  },
  finalCta: {
    title: "Deja de apagar fuegos. Empieza a gestionar.",
    subtitle: "Gratis para siempre hasta 1 propiedad. Sin tarjeta. Sin contrato.",
    cta: "Empezar gratis ahora →",
    micro: "✓ Listo en 5 minutos   ✓ Cancela cuando quieras   ✓ Usado en 3 continentes",
  },
};

/* ============ FR ============ */
const fr: LandingCopy = {
  loginBtn: "Connexion",
  ctaPrimary: "Commencer gratuitement",
  hero: {
    headline: "Votre location courte durée, organisée en 2 minutes par jour.",
    subheadline: "Arrêtez de gérer les ménages par WhatsApp, de perdre les objets oubliés et de ne pas savoir ce qui se passe dans votre logement. Hostlyb vous donne le contrôle total — sans complexité.",
    cta: "Commencer gratuitement — sans carte",
    bullets: ["✓ Plan gratuit à vie", "✓ Annulez à tout moment", "✓ Prêt en 5 minutes"],
    social: "★★★★★ Utilisé par +2 400 hôtes au Brésil, aux USA et en Europe",
    phoneDashboard: "Tableau",
    phoneCleanings: "Ménages",
    phoneCalendar: "Agenda",
  },
  problem: {
    title: "Ça vous parle ?",
    rows: [
      { bad: "Vous envoyez un WhatsApp à la femme de ménage sans jamais savoir si c'est fait", good: "La femme de ménage reçoit la checklist sur son téléphone — photos envoyées à votre e-mail automatiquement" },
      { bad: "Vous découvrez les objets oubliés des semaines plus tard", good: "Alerte photo instantanée dès qu'il est trouvé" },
      { bad: "Le prochain voyageur arrive et le logement est encore sale", good: "Alerte automatique avant chaque check-out" },
      { bad: "Vous n'avez aucune idée de ce qui se passe sans appeler quelqu'un", good: "Tableau de bord en temps réel pour tous les logements sur un seul écran" },
      { bad: "Vous gérez tout via WhatsApp, Excel et carnets", good: "Tout au même endroit, 2 minutes par jour" },
    ],
  },
  how: {
    title: "Prêt en 3 étapes. Sans formation. Sans complexité.",
    steps: [
      { number: "1", title: "Enregistrez votre logement", desc: "2 minutes. Ou importez un tableur." },
      { number: "2", title: "Invitez votre femme de ménage", desc: "Elle reçoit un lien. Pas d'app. Pas de compte. Elle clique." },
      { number: "3", title: "Gérez depuis votre téléphone", desc: "Statut en temps réel, alertes automatiques, fait." },
    ],
  },
  features: {
    title: "Tout ce dont vous avez besoin. Rien de superflu.",
    cards: [
      { icon: "🧹", title: "Photos envoyées directement à votre e-mail", desc: "Pas de limite de stockage. Qualité totale. Votre boîte devient l'archive." },
      { icon: "⏱️", title: "Sachez exactement combien dure chaque ménage", desc: "Facturez au juste prix. Données réelles de l'équipe." },
      { icon: "📦", title: "Objets oubliés avec alerte photo instantanée", desc: "Plus jamais d'oubli. La photo arrive au moment du constat." },
      { icon: "🔴", title: "Problèmes de maintenance signalés par la femme de ménage", desc: "Photo + description directement dans votre boîte." },
      { icon: "📅", title: "Agenda avec réservations, ménages et check-outs", desc: "Un seul écran, tout." },
      { icon: "💰", title: "Finances simples — revenus, dépenses, bénéfice par logement", desc: "Automatique. Sans tableur." },
      { icon: "👥", title: "Profils voyageurs avec étiquettes", desc: "VIP, récurrent, attention — visible d'un coup d'œil." },
      { icon: "🏆", title: "Score d'organisation", desc: "Voyez à quel point votre opération est organisée et ce qu'il faut améliorer." },
      { icon: "🔗", title: "Synchronisé avec Airbnb et Booking.com", desc: "Collez un lien iCal — agendas alignés automatiquement." },
    ],
  },
  social: {
    title: "Plus de 2 400 hôtes ont déjà arrêté de gérer par WhatsApp.",
    testimonials: [
      { quote: "En 5 minutes je connais le statut de tous mes logements. Avant c'était WhatsApp et Excel.", name: "Mariana S.", props: "4 logements · São Paulo", flag: "🇧🇷" },
      { quote: "Les photos de ménage envoyées à mon e-mail ont tout changé. Je vois chaque pièce.", name: "James T.", props: "2 logements · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 propriétés · Paris", flag: "🇫🇷" },
      { quote: "Als Vermieter mit 6 Wohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 logements · Berlin", flag: "🇩🇪" },
    ],
  },
  pricing: {
    title: "Commencez gratuitement. Évoluez quand vous êtes prêt.",
    subtitle: "Moins que la commission d'une nuit. Sans engagement. Annulez à tout moment.",
    micro: "✓ Sans engagement   ✓ Annulez quand vous voulez   ✓ Changez de plan à tout moment",
    perMo: "/mois",
    popular: "★ LE PLUS POPULAIRE",
    free: { name: "Gratuit", tag: "Pour démarrer", price: "Gratuit", features: ["1 logement", "1 utilisateur", "Checklist de ménage avec photos", "Voyageurs, agenda et objets oubliés", "Marque \"Powered by Hostlyb\" sur le lien"], cta: "Commencer gratuitement" },
    pro: { name: "Pro", tag: "Professionnel", features: ["Jusqu'à 5 logements, 3 utilisateurs", "Tout du Gratuit, sans marque sur le lien", "Alertes automatiques + module financier complet", "Import par tableur + tableau de bord avancé", "Score de ménage, timer, tags + bouton WhatsApp"], cta: "S'abonner à Pro" },
    premium: { name: "Premium", tag: "Tout inclus", features: ["Tout du Pro + utilisateurs illimités", "Guide numérique du logement (lien public)", "Check-in numérique / fiche voyageur", "Maintenance + rapport PDF par logement", "Support prioritaire sous 24h"], cta: "S'abonner à Premium" },
  },
  faq: {
    title: "Vous y avez pensé. Voici ce qui vous a arrêté.",
    items: [
      { q: "Je n'ai pas le temps d'apprendre une app de plus.", a: "Prêt en 5 minutes. La femme de ménage n'a même pas besoin de compte — elle clique sur un lien." },
      { q: "Ma femme de ménage n'est pas à l'aise avec la tech.", a: "Elle reçoit un lien. Ouvre le navigateur. Prend des photos. Fait. Pas d'app. Pas de mot de passe." },
      { q: "Et les photos ? Où vont-elles ?", a: "Les photos sont envoyées directement à votre e-mail en qualité totale. Votre boîte devient votre archive de ménages — illimité, cherchable, toujours disponible." },
      { q: "J'ai déjà un tableur qui marche.", a: "Un tableur ne vous alerte pas des check-outs. N'envoie pas de photos. Ne signale pas les soucis de maintenance." },
      { q: "C'est cher ?", a: "Le plan gratuit est permanent — pas un essai. Pro coûte moins qu'une nuit. Annulez en 1 clic si ça ne vous plaît pas." },
      { q: "Et si j'ai des logements dans plusieurs pays ?", a: "Fonctionne dans tous les pays, 6 langues, devise locale." },
      { q: "Ça marche avec Airbnb et Booking.com ?", a: "Oui. Collez votre lien iCal de n'importe quelle plateforme — les agendas restent synchronisés automatiquement." },
    ],
  },
  progress: {
    title: "Votre opération peut ressembler à ça.",
    items: ["Logements enregistrés", "Femme de ménage invitée", "Checklists configurées", "Voyageurs importés", "Finances actives", "Guide numérique créé (Premium)"],
    copy: "La plupart des hôtes passent de 0 % à 80 %+ en moins de 15 minutes.",
  },
  finalCta: {
    title: "Arrêtez d'éteindre des incendies. Commencez à gérer.",
    subtitle: "Gratuit à vie jusqu'à 1 logement. Sans carte. Sans engagement.",
    cta: "Commencer gratuitement maintenant →",
    micro: "✓ Prêt en 5 minutes   ✓ Annulez quand vous voulez   ✓ Utilisé sur 3 continents",
  },
};

/* ============ IT ============ */
const it: LandingCopy = {
  loginBtn: "Accedi",
  ctaPrimary: "Inizia gratis",
  hero: {
    headline: "Il tuo affitto breve, organizzato in 2 minuti al giorno.",
    subheadline: "Smetti di gestire le pulizie via WhatsApp, di perdere gli oggetti dimenticati e di non sapere cosa succede nel tuo appartamento. Hostlyb ti dà controllo totale — senza complessità.",
    cta: "Inizia gratis — senza carta",
    bullets: ["✓ Piano gratuito per sempre", "✓ Disdici quando vuoi", "✓ Pronto in 5 minuti"],
    social: "★★★★★ Usato da +2.400 host in Brasile, USA ed Europa",
    phoneDashboard: "Dashboard",
    phoneCleanings: "Pulizie",
    phoneCalendar: "Calendario",
  },
  problem: {
    title: "Ti suona familiare?",
    rows: [
      { bad: "Mandi WhatsApp alla pulitrice e non sai mai se è stato fatto", good: "La pulitrice riceve la checklist sul cellulare — foto inviate alla tua email automaticamente" },
      { bad: "Scopri gli oggetti dimenticati settimane dopo", good: "Avviso foto istantaneo nel momento in cui viene trovato" },
      { bad: "Il prossimo ospite arriva e l'appartamento è ancora sporco", good: "Avviso automatico prima di ogni check-out" },
      { bad: "Non hai idea di cosa stia succedendo senza chiamare qualcuno", good: "Dashboard in tempo reale per tutti gli appartamenti in una schermata" },
      { bad: "Gestisci tutto con WhatsApp, Excel e quaderni", good: "Tutto in un unico posto, 2 minuti al giorno" },
    ],
  },
  how: {
    title: "Pronto in 3 passi. Senza formazione. Senza complessità.",
    steps: [
      { number: "1", title: "Registra il tuo appartamento", desc: "2 minuti. O importa un foglio di calcolo." },
      { number: "2", title: "Invita la tua pulitrice", desc: "Riceve un link. Niente app. Niente account. Solo clic." },
      { number: "3", title: "Gestisci dal cellulare", desc: "Stato in tempo reale, avvisi automatici, fatto." },
    ],
  },
  features: {
    title: "Tutto quello che ti serve. Niente di più.",
    cards: [
      { icon: "🧹", title: "Foto inviate direttamente alla tua email", desc: "Nessun limite di archiviazione. Qualità totale. La tua inbox diventa l'archivio." },
      { icon: "⏱️", title: "Sai esattamente quanto dura ogni pulizia", desc: "Stabilisci la tariffa con equità. Dati reali del team." },
      { icon: "📦", title: "Oggetti dimenticati con avviso foto istantaneo", desc: "Mai più persi. La foto arriva all'istante." },
      { icon: "🔴", title: "Problemi di manutenzione segnalati dalla pulitrice", desc: "Foto + descrizione direttamente nella tua inbox." },
      { icon: "📅", title: "Calendario con prenotazioni, pulizie e check-out", desc: "Una schermata, tutto." },
      { icon: "💰", title: "Finanze semplici — entrate, uscite, profitto per appartamento", desc: "Automatico. Senza fogli." },
      { icon: "👥", title: "Profili ospiti con tag", desc: "VIP, ricorrente, attenzione — visibile a colpo d'occhio." },
      { icon: "🏆", title: "Score di organizzazione", desc: "Vedi quanto è organizzata la tua operazione e cosa migliorare." },
      { icon: "🔗", title: "Sincronizza con Airbnb e Booking.com", desc: "Incolla un link iCal — calendari allineati automaticamente." },
    ],
  },
  social: {
    title: "Oltre 2.400 host hanno già smesso di gestire via WhatsApp.",
    testimonials: [
      { quote: "In 5 minuti so lo stato di tutti i miei appartamenti. Prima era WhatsApp ed Excel.", name: "Mariana S.", props: "4 appartamenti · San Paolo", flag: "🇧🇷" },
      { quote: "Le foto delle pulizie inviate alla mia email hanno cambiato tutto. Vedo ogni stanza.", name: "James T.", props: "2 appartamenti · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 appartamenti · Parigi", flag: "🇫🇷" },
      { quote: "Als Vermieter mit 6 Wohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 appartamenti · Berlino", flag: "🇩🇪" },
    ],
  },
  pricing: {
    title: "Inizia gratis. Cresci quando sei pronto.",
    subtitle: "Meno della commissione di una notte. Senza contratti. Disdici quando vuoi.",
    micro: "✓ Senza contratto   ✓ Disdici quando vuoi   ✓ Cambia piano in qualsiasi momento",
    perMo: "/mese",
    popular: "★ PIÙ POPOLARE",
    free: { name: "Gratis", tag: "Per iniziare", price: "Gratis", features: ["1 appartamento", "1 utente", "Checklist pulizie con foto", "Ospiti, calendario e oggetti dimenticati", "Marca \"Powered by Hostlyb\" sul link"], cta: "Inizia gratis" },
    pro: { name: "Pro", tag: "Professionale", features: ["Fino a 5 appartamenti, 3 utenti", "Tutto del Gratis, senza marca sul link", "Avvisi automatici + modulo finanziario completo", "Import da foglio + dashboard avanzata", "Score pulizie, timer, tag + pulsante WhatsApp"], cta: "Abbonati a Pro" },
    premium: { name: "Premium", tag: "Tutto incluso", features: ["Tutto del Pro + utenti illimitati", "Guida digitale dell'appartamento (link pubblico)", "Check-in digitale / scheda ospite", "Manutenzione + report PDF per appartamento", "Supporto prioritario in 24h"], cta: "Abbonati a Premium" },
  },
  faq: {
    title: "Ci hai pensato. Ecco cosa ti ha fermato.",
    items: [
      { q: "Non ho tempo di imparare un'altra app.", a: "Pronto in 5 minuti. La pulitrice non ha nemmeno bisogno di un account — clicca un link." },
      { q: "La mia pulitrice non è brava con la tecnologia.", a: "Riceve un link. Apre il browser. Scatta foto. Fatto. Niente app. Niente password." },
      { q: "E le foto? Dove vanno?", a: "Le foto vengono inviate direttamente alla tua email in qualità totale. La tua inbox diventa il tuo archivio pulizie — illimitato, ricercabile, sempre disponibile." },
      { q: "Ho già un foglio di calcolo che funziona.", a: "Un foglio non ti avvisa dei check-out. Non invia foto. Non ti notifica i problemi di manutenzione." },
      { q: "È caro?", a: "Il piano gratis è permanente — non è una prova. Pro costa meno di una notte. Disdici in 1 clic se non ti piace." },
      { q: "E se ho appartamenti in paesi diversi?", a: "Funziona in ogni paese, 6 lingue, valuta locale." },
      { q: "Funziona con Airbnb e Booking.com?", a: "Sì. Incolla il tuo link iCal da qualsiasi piattaforma — i calendari restano sincronizzati automaticamente." },
    ],
  },
  progress: {
    title: "La tua operazione può essere così.",
    items: ["Appartamenti registrati", "Pulitrice invitata", "Checklist configurate", "Ospiti importati", "Finanze attive", "Guida digitale creata (Premium)"],
    copy: "La maggior parte degli host passa da 0% a 80%+ in meno di 15 minuti.",
  },
  finalCta: {
    title: "Smetti di spegnere incendi. Inizia a gestire.",
    subtitle: "Gratis per sempre fino a 1 appartamento. Senza carta. Senza contratto.",
    cta: "Inizia gratis ora →",
    micro: "✓ Pronto in 5 minuti   ✓ Disdici quando vuoi   ✓ Usato in 3 continenti",
  },
};

/* ============ DE ============ */
const de: LandingCopy = {
  loginBtn: "Anmelden",
  ctaPrimary: "Kostenlos starten",
  hero: {
    headline: "Deine Ferienwohnung, organisiert in 2 Minuten am Tag.",
    subheadline: "Schluss damit, Reinigungen über WhatsApp zu koordinieren, vergessene Gegenstände zu verlieren und nicht zu wissen, was in deiner Unterkunft passiert. Hostlyb gibt dir volle Kontrolle — ohne Komplexität.",
    cta: "Kostenlos starten — ohne Karte",
    bullets: ["✓ Für immer kostenloser Plan", "✓ Jederzeit kündbar", "✓ In 5 Minuten eingerichtet"],
    social: "★★★★★ Genutzt von über 2.400 Gastgebern in Brasilien, USA und Europa",
    phoneDashboard: "Dashboard",
    phoneCleanings: "Reinigungen",
    phoneCalendar: "Kalender",
  },
  problem: {
    title: "Kommt dir das bekannt vor?",
    rows: [
      { bad: "Du schreibst der Reinigungskraft per WhatsApp und weißt nie, ob es erledigt wurde", good: "Die Reinigungskraft bekommt die Checkliste aufs Handy — Fotos automatisch an deine E-Mail" },
      { bad: "Du erfährst Wochen später von vergessenen Gegenständen", good: "Sofort-Foto-Alarm im Moment des Fundes" },
      { bad: "Der nächste Gast kommt an und die Unterkunft ist noch schmutzig", good: "Automatischer Alarm vor jedem Check-out" },
      { bad: "Du hast keine Ahnung, was passiert, ohne jemanden anzurufen", good: "Echtzeit-Dashboard für alle Unterkünfte auf einem Bildschirm" },
      { bad: "Du managst alles per WhatsApp, Excel und Notizbüchern", good: "Alles an einem Ort, 2 Minuten am Tag" },
    ],
  },
  how: {
    title: "Bereit in 3 Schritten. Keine Schulung. Keine Komplexität.",
    steps: [
      { number: "1", title: "Unterkunft anlegen", desc: "2 Minuten. Oder eine Tabelle importieren." },
      { number: "2", title: "Reinigungskraft einladen", desc: "Sie bekommt einen Link. Keine App. Kein Konto. Nur klicken." },
      { number: "3", title: "Vom Handy managen", desc: "Echtzeit-Status, automatische Alarme, fertig." },
    ],
  },
  features: {
    title: "Alles, was du brauchst. Nichts, was du nicht brauchst.",
    cards: [
      { icon: "🧹", title: "Fotos direkt an deine E-Mail gesendet", desc: "Kein Speicherlimit. Volle Qualität. Dein Posteingang wird zum Archiv." },
      { icon: "⏱️", title: "Weiß genau, wie lange jede Reinigung dauert", desc: "Setze die Gebühr fair an. Echte Team-Daten." },
      { icon: "📦", title: "Vergessene Gegenstände mit Sofort-Foto-Alarm", desc: "Nie wieder etwas verlieren. Foto kommt im Moment des Fundes." },
      { icon: "🔴", title: "Wartungsprobleme von der Reinigungskraft gemeldet", desc: "Foto + Beschreibung direkt in deinen Posteingang." },
      { icon: "📅", title: "Kalender mit Buchungen, Reinigungen, Check-outs", desc: "Ein Bildschirm, alles." },
      { icon: "💰", title: "Einfache Finanzen — Einnahmen, Ausgaben, Gewinn pro Unterkunft", desc: "Automatisch. Keine Tabellen." },
      { icon: "👥", title: "Gast-Profile mit Tags", desc: "VIP, Stammgast, Achtung — auf einen Blick." },
      { icon: "🏆", title: "Organisations-Score", desc: "Sieh, wie organisiert dein Betrieb ist und was zu verbessern ist." },
      { icon: "🔗", title: "Synchron mit Airbnb und Booking.com", desc: "Einen iCal-Link einfügen — Kalender automatisch abgeglichen." },
    ],
  },
  social: {
    title: "Über 2.400 Gastgeber haben aufgehört, per WhatsApp zu managen.",
    testimonials: [
      { quote: "In 5 Minuten kenne ich den Status all meiner Unterkünfte. Vorher waren es WhatsApp und Excel.", name: "Mariana S.", props: "4 Unterkünfte · São Paulo", flag: "🇧🇷" },
      { quote: "Die Reinigungsfotos direkt an meine E-Mail haben alles verändert. Ich sehe jeden Raum.", name: "James T.", props: "2 Unterkünfte · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 Unterkünfte · Paris", flag: "🇫🇷" },
      { quote: "Als Vermieter mit 6 Wohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 Unterkünfte · Berlin", flag: "🇩🇪" },
    ],
  },
  pricing: {
    title: "Kostenlos starten. Wachsen, wenn du bereit bist.",
    subtitle: "Weniger als die Gebühr einer Übernachtung. Keine Verträge. Jederzeit kündbar.",
    micro: "✓ Kein Vertrag   ✓ Jederzeit kündbar   ✓ Plan jederzeit wechseln",
    perMo: "/Monat",
    popular: "★ AM BELIEBTESTEN",
    free: { name: "Gratis", tag: "Zum Starten", price: "Gratis", features: ["1 Unterkunft", "1 Nutzer", "Reinigungs-Checkliste mit Fotos", "Gäste, Kalender und vergessene Gegenstände", "Marke \"Powered by Hostlyb\" am Link"], cta: "Kostenlos starten" },
    pro: { name: "Pro", tag: "Professionell", features: ["Bis zu 5 Unterkünfte, 3 Nutzer", "Alles aus Gratis, ohne Marke am Link", "Automatische Alarme + komplettes Finanzmodul", "Tabellen-Import + erweitertes Dashboard", "Reinigungs-Score, Timer, Tags + WhatsApp-Button"], cta: "Pro abonnieren" },
    premium: { name: "Premium", tag: "Alles inklusive", features: ["Alles aus Pro + unbegrenzte Nutzer", "Digitales Unterkunfts-Handbuch (öffentlicher Link)", "Digitaler Check-in / Gästemeldeschein", "Wartung + PDF-Bericht pro Unterkunft", "Priorisierter Support innerhalb 24h"], cta: "Premium abonnieren" },
  },
  faq: {
    title: "Du hast darüber nachgedacht. Hier ist, was dich aufgehalten hat.",
    items: [
      { q: "Ich habe keine Zeit, noch eine App zu lernen.", a: "In 5 Minuten eingerichtet. Die Reinigungskraft braucht nicht mal ein Konto — sie klickt einfach einen Link." },
      { q: "Meine Reinigungskraft ist nicht gut mit Technik.", a: "Sie bekommt einen Link. Öffnet den Browser. Macht Fotos. Fertig. Keine App. Kein Passwort." },
      { q: "Und die Fotos? Wo gehen die hin?", a: "Fotos werden direkt an deine E-Mail in voller Qualität gesendet. Dein Posteingang wird zum Reinigungs-Archiv — unbegrenzt, durchsuchbar, immer verfügbar." },
      { q: "Ich habe schon eine Tabelle, die funktioniert.", a: "Eine Tabelle warnt dich nicht vor Check-outs. Schickt keine Fotos. Meldet keine Wartungsprobleme." },
      { q: "Ist es teuer?", a: "Der Gratis-Plan ist dauerhaft — keine Testphase. Pro kostet weniger als eine Übernachtungsgebühr. Mit 1 Klick kündbar, wenn es dir nicht gefällt." },
      { q: "Was, wenn ich Unterkünfte in verschiedenen Ländern habe?", a: "Funktioniert in jedem Land, 6 Sprachen, lokale Währung." },
      { q: "Funktioniert es mit Airbnb und Booking.com?", a: "Ja. Füge deinen iCal-Link von jeder Plattform ein — Kalender bleiben automatisch synchronisiert." },
    ],
  },
  progress: {
    title: "So kann dein Betrieb aussehen.",
    items: ["Unterkünfte angelegt", "Reinigungskraft eingeladen", "Checklisten konfiguriert", "Gäste importiert", "Finanzen aktiv", "Handbuch erstellt (Premium)"],
    copy: "Die meisten Gastgeber kommen in unter 15 Minuten von 0 % auf 80 %+.",
  },
  finalCta: {
    title: "Hör auf, Feuer zu löschen. Fang an zu managen.",
    subtitle: "Für immer kostenlos bis zu 1 Unterkunft. Keine Karte. Kein Vertrag.",
    cta: "Jetzt kostenlos starten →",
    micro: "✓ In 5 Minuten eingerichtet   ✓ Jederzeit kündbar   ✓ Auf 3 Kontinenten genutzt",
  },
};

export const LANDING_COPY: Record<Lang, LandingCopy> = { pt, en, es, fr, it, de };
