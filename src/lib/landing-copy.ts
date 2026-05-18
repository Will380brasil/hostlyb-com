import type { Lang } from "@/lib/i18n";

export interface LandingCopy {
  loginBtn: string;
  ctaPrimary: string; // "Start free" everywhere

  hero: {
    headline: string;
    subheadline: string;
    cta: string; // "Start free"
    bullets: [string, string, string];
    social: string; // "★★★★★ Trusted by 2,400+ hosts..."
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

const pt: LandingCopy = {
  loginBtn: "Entrar",
  ctaPrimary: "Começar grátis",
  hero: {
    headline: "Seu aluguel por temporada, organizado em 2 minutos por dia.",
    subheadline: "Pare de gerenciar limpezas pelo WhatsApp, perder o controle de objetos esquecidos e não saber o que acontece no seu imóvel. O Hostlyb te dá controle total — sem complexidade.",
    cta: "Começar grátis",
    bullets: ["✓ Plano grátis para sempre", "✓ Cancele quando quiser", "✓ Configure em 5 minutos"],
    social: "★★★★★ Usado por +2.400 anfitriões no Brasil, EUA e Europa",
    phoneDashboard: "Painel",
    phoneCleanings: "Limpezas",
    phoneCalendar: "Calendário",
  },
  problem: {
    title: "Parece familiar?",
    rows: [
      { bad: "Manda WhatsApp pra faxineira e nunca sabe se foi feito", good: "Faxineira recebe checklist no celular e envia fotos de cada cômodo" },
      { bad: "Descobre objetos esquecidos semanas depois", good: "Alerta instantâneo com foto no momento em que é encontrado" },
      { bad: "Próximo hóspede chega e o imóvel ainda está sujo", good: "Alerta automático antes de cada checkout" },
      { bad: "Não faz ideia do que está acontecendo sem ligar pra alguém", good: "Painel em tempo real de todos os imóveis" },
      { bad: "Gerencia tudo por WhatsApp, Excel e caderno", good: "Tudo num só lugar, 2 minutos por dia" },
    ],
  },
  how: {
    title: "Pronto em 3 passos. Sem treinamento. Sem complexidade.",
    steps: [
      { number: "1", title: "Cadastre seu imóvel", desc: "Adicione endereço, fotos e detalhes. Pronto em 2 minutos. Ou importe uma planilha." },
      { number: "2", title: "Convide sua equipe", desc: "A faxineira recebe um link único. Sem app pra instalar. Sem conta pra criar. Só clica e começa." },
      { number: "3", title: "Gerencie pelo celular", desc: "Veja o status de todos os imóveis em tempo real. Receba alertas automáticos. Saiba o que está acontecendo — sem perguntar pra ninguém." },
    ],
  },
  features: {
    title: "Tudo que você precisa. Nada que você não precisa.",
    cards: [
      { icon: "🧹", title: "Limpeza com prova fotográfica", desc: "A faxineira fotografa cada cômodo. Você vê tudo sem sair do sofá." },
      { icon: "⏱️", title: "Saiba exatamente quanto demora cada limpeza", desc: "Gerencie sua equipe com dados reais. Cobre a taxa de limpeza com justiça." },
      { icon: "📦", title: "Objetos esquecidos com foto", desc: "A faxineira fotografa e você recebe alerta instantâneo. Nunca mais perca nada." },
      { icon: "🔴", title: "Problemas de manutenção reportados na hora", desc: "Achou um problema durante a limpeza? Faxineira reporta com foto. Você é notificado imediatamente." },
      { icon: "📅", title: "Calendário com tudo num só lugar", desc: "Reservas, limpezas e checkouts. Nunca mais esqueça nada." },
      { icon: "💰", title: "Financeiro simples e claro", desc: "Receita, despesa e lucro por imóvel. Sem planilha." },
      { icon: "👥", title: "Hóspedes organizados", desc: "Histórico completo. Saiba quem é recorrente, quem é VIP, quem já teve algum problema." },
      { icon: "🏆", title: "Score de organização da operação", desc: "Veja o quão organizada está sua operação e o que melhorar." },
    ],
  },
  social: {
    title: "Mais de 2.400 anfitriões já pararam de gerenciar pelo WhatsApp.",
    testimonials: [
      { quote: "Em 5 minutos eu sei o status de todos os meus imóveis. Antes era WhatsApp e Excel.", name: "Mariana S.", props: "4 imóveis · São Paulo", flag: "🇧🇷" },
      { quote: "O checklist de limpeza com fotos mudou tudo. Sei exatamente o que aconteceu em cada cômodo.", name: "James T.", props: "2 properties · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 propriétés · Paris", flag: "🇫🇷" },
      { quote: "Als jemand mit 6 Ferienwohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 properties · Berlin", flag: "🇩🇪" },
    ],
  },
  pricing: {
    title: "Comece grátis. Cresça quando estiver pronto.",
    subtitle: "Menos que a taxa de uma diária. Sem contrato. Cancele quando quiser.",
    micro: "✓ Sem contrato   ✓ Cancele quando quiser   ✓ Troque de plano a qualquer momento",
    perMo: "/mês",
    popular: "★ MAIS POPULAR",
    free: { name: "Gratuito", tag: "Para começar", price: "Grátis", features: ["1 imóvel", "1 usuário", "Checklist de limpeza com fotos", "Hóspedes, calendário e objetos esquecidos", "Marca \"Powered by Hostlyb\" no link"], cta: "Começar grátis" },
    pro: { name: "Pro", tag: "Profissional", features: ["Até 5 imóveis, 3 usuários", "Tudo do Gratuito, sem marca no link", "Alertas automáticos + financeiro completo", "Importação por planilha + dashboard avançado", "Score de limpeza, timer, tags + botão WhatsApp"], cta: "Assinar Pro" },
    premium: { name: "Premium", tag: "Tudo incluso", features: ["Tudo do Pro + usuários ilimitados", "Guia digital do imóvel (link público)", "Check-in digital / ficha de hóspede", "Manutenção + relatório PDF por imóvel", "Suporte prioritário em 24h"], cta: "Assinar Premium" },
  },
  faq: {
    title: "Você já pensou nisso. Aqui está o que te travou.",
    items: [
      { q: "Não tenho tempo de aprender outro app.", a: "Configure em 5 minutos. A faxineira nem precisa de conta — é só clicar num link. Se você usa WhatsApp, sabe usar o Hostlyb." },
      { q: "Minha faxineira não é boa com tecnologia.", a: "Ela recebe um link. Abre no navegador. Tira fotos e envia. Sem app pra instalar. Sem senha. Sem frustração." },
      { q: "Já tenho uma planilha que funciona.", a: "Planilha não te alerta sobre checkouts. Não tira fotos. Não te notifica sobre manutenção. E não gerencia sua faxineira por você." },
      { q: "É caro?", a: "O plano grátis é permanente — não é teste. O Pro custa menos que uma diária. E você cancela em 1 clique se não gostar." },
      { q: "E se eu tiver imóveis em países diferentes?", a: "O Hostlyb funciona em qualquer país, em 6 idiomas, com moeda local. Usado no Brasil, EUA, França, Alemanha, Itália e mais." },
      { q: "Meus dados estão seguros?", a: "Tudo criptografado em repouso e em trânsito. Fotos em armazenamento privado — só você tem acesso." },
    ],
  },
  progress: {
    title: "Sua operação pode estar assim.",
    items: ["Imóveis cadastrados", "Faxineira convidada", "Checklists configurados", "Hóspedes importados", "Financeiro ativo", "Guia digital criado (Premium)"],
    copy: "A maioria dos anfitriões vai de 0% a 80%+ em menos de 15 minutos.",
  },
  finalCta: {
    title: "Pare de apagar incêndio. Comece a gerenciar.",
    subtitle: "Grátis para sempre para 1 imóvel. Cancele quando quiser.",
    cta: "Começar grátis agora →",
    micro: "✓ Configure em 5 minutos   ✓ Cancele quando quiser   ✓ Usado em 3 continentes",
  },
};

const en: LandingCopy = {
  loginBtn: "Login",
  ctaPrimary: "Start free",
  hero: {
    headline: "Your rental property, organized in 2 minutes a day.",
    subheadline: "Stop managing cleanings over WhatsApp, losing track of forgotten items, and not knowing what's happening in your property. Hostlyb gives you full control — without the complexity.",
    cta: "Start free",
    bullets: ["✓ Free plan forever", "✓ Cancel anytime", "✓ Setup in 5 minutes"],
    social: "★★★★★ Trusted by 2,400+ hosts in Brazil, USA and Europe",
    phoneDashboard: "Dashboard",
    phoneCleanings: "Cleanings",
    phoneCalendar: "Calendar",
  },
  problem: {
    title: "Does this sound familiar?",
    rows: [
      { bad: "Sends WhatsApp to cleaner and never knows if it was done", good: "Cleaner gets checklist on phone and sends photos of every room" },
      { bad: "Finds out about forgotten items weeks later", good: "Instant photo alert the moment it's found" },
      { bad: "Next guest arrives and property is still dirty", good: "Automatic alert before every checkout" },
      { bad: "Has no idea what's happening without calling someone", good: "Real-time dashboard for all properties" },
      { bad: "Manages everything via WhatsApp, Excel and notebooks", good: "Everything in one place, 2 minutes a day" },
    ],
  },
  how: {
    title: "Ready in 3 steps. No training. No complexity.",
    steps: [
      { number: "1", title: "Register your property", desc: "Add address, photos and details. Done in 2 minutes. Or import a spreadsheet." },
      { number: "2", title: "Invite your team", desc: "Cleaner gets a unique link. No app to install. No account to create. Just clicks and starts." },
      { number: "3", title: "Manage from your phone", desc: "See all property status in real time. Get automatic alerts. Know what's happening — without asking anyone." },
    ],
  },
  features: {
    title: "Everything you need. Nothing you don't.",
    cards: [
      { icon: "🧹", title: "Cleaning with photo proof", desc: "Cleaner photographs every room. You see everything without leaving the sofa." },
      { icon: "⏱️", title: "Know exactly how long each cleaning takes", desc: "Manage your team with real data. Price your cleaning fee fairly." },
      { icon: "📦", title: "Forgotten items with photo", desc: "Cleaner photographs it and you get an instant alert. Never lose anything again." },
      { icon: "🔴", title: "Maintenance issues reported instantly", desc: "Problem found during cleaning? Cleaner reports with photo. You get notified immediately." },
      { icon: "📅", title: "Calendar with everything in one place", desc: "Bookings, cleanings and checkouts. Never forget anything again." },
      { icon: "💰", title: "Simple and clear financials", desc: "Revenue, expenses and profit per property. No spreadsheets." },
      { icon: "👥", title: "Organized guests", desc: "Full history. Know who's a returning guest, who's VIP, who had a previous issue." },
      { icon: "🏆", title: "Operation organized score", desc: "See how organized your operation is and what to improve." },
    ],
  },
  social: {
    title: "Over 2,400 hosts have already stopped managing via WhatsApp.",
    testimonials: [
      { quote: "In 5 minutes I know the status of all my properties. Before it was WhatsApp and Excel.", name: "Mariana S.", props: "4 properties · São Paulo", flag: "🇧🇷" },
      { quote: "The cleaning checklist with photos changed everything. I know exactly what happened in each room.", name: "James T.", props: "2 properties · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 properties · Paris", flag: "🇫🇷" },
      { quote: "Als jemand mit 6 Ferienwohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 properties · Berlin", flag: "🇩🇪" },
    ],
  },
  pricing: {
    title: "Start free. Grow when you're ready.",
    subtitle: "Less than one night's booking fee. No contracts. Cancel anytime.",
    micro: "✓ No contract   ✓ Cancel anytime   ✓ Change plan at any time",
    perMo: "/mo",
    popular: "★ MOST POPULAR",
    free: { name: "Free", tag: "Get started", price: "Free", features: ["1 property", "1 user", "Cleaning checklist with photos", "Guests, calendar and forgotten items", "\"Powered by Hostlyb\" tag on link"], cta: "Start free" },
    pro: { name: "Pro", tag: "Professional", features: ["Up to 5 properties, 3 users", "Everything in Free, no branding on link", "Automatic alerts + full financial module", "Spreadsheet import + advanced dashboard", "Cleaning score, timer, tags + WhatsApp button"], cta: "Subscribe to Pro" },
    premium: { name: "Premium", tag: "All-inclusive", features: ["Everything in Pro + unlimited users", "Digital property guidebook (public link)", "Digital check-in / guest registration", "Maintenance log + per-property PDF report", "Priority support within 24h"], cta: "Subscribe to Premium" },
  },
  faq: {
    title: "You've thought about it. Here's what stopped you.",
    items: [
      { q: "I don't have time to learn another app.", a: "Setup in 5 minutes. The cleaner doesn't even need an account — just clicks a link. If you use WhatsApp, you can use Hostlyb." },
      { q: "My cleaner isn't good with technology.", a: "She gets a link. Opens it in the browser. Takes photos and submits. No app to install. No password. No frustration." },
      { q: "I already have a spreadsheet that works.", a: "A spreadsheet doesn't alert you about checkouts. Doesn't take photos. Doesn't notify you about maintenance issues. And doesn't manage your cleaner for you." },
      { q: "Is it expensive?", a: "The free plan is permanent — not a trial. Pro costs less than one night's booking. And you cancel in 1 click if you don't like it." },
      { q: "What if I have properties in different countries?", a: "Hostlyb works in any country, in 6 languages, with local currency. Used in Brazil, USA, France, Germany, Italy and more." },
      { q: "Is my data secure?", a: "Everything encrypted at rest and in transit. Photos in private storage — only you have access." },
    ],
  },
  progress: {
    title: "Your operation can look like this.",
    items: ["Properties registered", "Cleaner invited", "Checklists set up", "Guests imported", "Financials active", "Guidebook created (Premium)"],
    copy: "Most hosts go from 0% to 80%+ in under 15 minutes.",
  },
  finalCta: {
    title: "Stop putting out fires. Start managing.",
    subtitle: "Free forever for 1 property. Cancel anytime.",
    cta: "Start free now →",
    micro: "✓ Setup in 5 minutes   ✓ Cancel anytime   ✓ Used across 3 continents",
  },
};

const es: LandingCopy = {
  loginBtn: "Entrar",
  ctaPrimary: "Empezar gratis",
  hero: {
    headline: "Tu alquiler vacacional, organizado en 2 minutos al día.",
    subheadline: "Deja de gestionar limpiezas por WhatsApp, perder objetos olvidados y no saber qué pasa en tu propiedad. Hostlyb te da control total — sin complejidad.",
    cta: "Empezar gratis",
    bullets: ["✓ Plan gratis para siempre", "✓ Cancela cuando quieras", "✓ Listo en 5 minutos"],
    social: "★★★★★ Usado por +2.400 anfitriones en Brasil, EE.UU. y Europa",
    phoneDashboard: "Panel",
    phoneCleanings: "Limpiezas",
    phoneCalendar: "Calendario",
  },
  problem: {
    title: "¿Te suena familiar?",
    rows: [
      { bad: "Avisa a la limpiadora por WhatsApp y nunca sabe si se hizo", good: "La limpiadora recibe el checklist en el móvil y envía fotos de cada habitación" },
      { bad: "Descubre objetos olvidados semanas después", good: "Alerta instantánea con foto en el momento que se encuentra" },
      { bad: "Llega el próximo huésped y la propiedad sigue sucia", good: "Alerta automática antes de cada checkout" },
      { bad: "No tiene idea de qué pasa sin llamar a alguien", good: "Panel en tiempo real de todas las propiedades" },
      { bad: "Gestiona todo por WhatsApp, Excel y libretas", good: "Todo en un solo lugar, 2 minutos al día" },
    ],
  },
  how: {
    title: "Listo en 3 pasos. Sin formación. Sin complejidad.",
    steps: [
      { number: "1", title: "Registra tu propiedad", desc: "Añade dirección, fotos y detalles. Listo en 2 minutos. O importa una hoja de cálculo." },
      { number: "2", title: "Invita a tu equipo", desc: "La limpiadora recibe un enlace único. Sin app que instalar. Sin cuenta que crear. Solo hace clic y empieza." },
      { number: "3", title: "Gestiona desde el móvil", desc: "Ve el estado de todas las propiedades en tiempo real. Recibe avisos automáticos. Sabe qué pasa — sin preguntar a nadie." },
    ],
  },
  features: {
    title: "Todo lo que necesitas. Nada que no.",
    cards: [
      { icon: "🧹", title: "Limpieza con prueba fotográfica", desc: "La limpiadora fotografía cada habitación. Lo ves todo sin levantarte del sofá." },
      { icon: "⏱️", title: "Sabe exactamente cuánto tarda cada limpieza", desc: "Gestiona tu equipo con datos reales. Cobra la tarifa de limpieza con justicia." },
      { icon: "📦", title: "Objetos olvidados con foto", desc: "La limpiadora fotografía y recibes alerta instantánea. Nunca más pierdas nada." },
      { icon: "🔴", title: "Problemas de mantenimiento reportados al instante", desc: "¿Problema durante la limpieza? La limpiadora reporta con foto. Te notifican enseguida." },
      { icon: "📅", title: "Calendario con todo en un solo lugar", desc: "Reservas, limpiezas y checkouts. Nunca olvides nada." },
      { icon: "💰", title: "Finanzas simples y claras", desc: "Ingresos, gastos y beneficio por propiedad. Sin hojas de cálculo." },
      { icon: "👥", title: "Huéspedes organizados", desc: "Historial completo. Sabe quién repite, quién es VIP, quién tuvo un problema antes." },
      { icon: "🏆", title: "Score de organización", desc: "Ve qué tan organizada está tu operación y qué mejorar." },
    ],
  },
  social: {
    title: "Más de 2.400 anfitriones ya dejaron de gestionar por WhatsApp.",
    testimonials: [
      { quote: "En 5 minutos sé el estado de todas mis propiedades. Antes era WhatsApp y Excel.", name: "Mariana S.", props: "4 propiedades · São Paulo", flag: "🇧🇷" },
      { quote: "The cleaning checklist with photos changed everything. I know exactly what happened in each room.", name: "James T.", props: "2 propiedades · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 propiedades · París", flag: "🇫🇷" },
      { quote: "Als jemand mit 6 Ferienwohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 propiedades · Berlín", flag: "🇩🇪" },
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
      { q: "No tengo tiempo de aprender otra app.", a: "Listo en 5 minutos. La limpiadora ni necesita cuenta — solo hace clic en un enlace. Si usas WhatsApp, sabes usar Hostlyb." },
      { q: "Mi limpiadora no es buena con la tecnología.", a: "Recibe un enlace. Lo abre en el navegador. Saca fotos y envía. Sin app, sin contraseña, sin frustración." },
      { q: "Ya tengo una hoja de cálculo que funciona.", a: "Una hoja no te avisa de checkouts. No saca fotos. No te notifica de problemas de mantenimiento. Y no gestiona a tu limpiadora por ti." },
      { q: "¿Es caro?", a: "El plan gratis es permanente — no es prueba. Pro cuesta menos que una noche. Y cancelas en 1 clic si no te gusta." },
      { q: "¿Y si tengo propiedades en países diferentes?", a: "Hostlyb funciona en cualquier país, en 6 idiomas, con moneda local. Usado en Brasil, EE.UU., Francia, Alemania, Italia y más." },
      { q: "¿Mis datos están seguros?", a: "Todo cifrado en reposo y en tránsito. Fotos en almacenamiento privado — solo tú tienes acceso." },
    ],
  },
  progress: {
    title: "Tu operación puede verse así.",
    items: ["Propiedades registradas", "Limpiadora invitada", "Checklists configurados", "Huéspedes importados", "Finanzas activas", "Guía digital creada (Premium)"],
    copy: "La mayoría de anfitriones pasa de 0% a 80%+ en menos de 15 minutos.",
  },
  finalCta: {
    title: "Deja de apagar fuegos. Empieza a gestionar.",
    subtitle: "Gratis para siempre para 1 propiedad. Cancela cuando quieras.",
    cta: "Empezar gratis ahora →",
    micro: "✓ Listo en 5 minutos   ✓ Cancela cuando quieras   ✓ Usado en 3 continentes",
  },
};

const fr: LandingCopy = {
  loginBtn: "Connexion",
  ctaPrimary: "Commencer gratuitement",
  hero: {
    headline: "Votre location saisonnière, organisée en 2 minutes par jour.",
    subheadline: "Arrêtez de gérer les ménages par WhatsApp, de perdre les objets oubliés et de ne pas savoir ce qui se passe dans votre logement. Hostlyb vous donne le contrôle total — sans complexité.",
    cta: "Commencer gratuitement",
    bullets: ["✓ Plan gratuit à vie", "✓ Annulez à tout moment", "✓ Prêt en 5 minutes"],
    social: "★★★★★ Utilisé par +2 400 hôtes au Brésil, aux USA et en Europe",
    phoneDashboard: "Tableau",
    phoneCleanings: "Ménages",
    phoneCalendar: "Agenda",
  },
  problem: {
    title: "Ça vous parle ?",
    rows: [
      { bad: "Vous envoyez un WhatsApp à la femme de ménage sans jamais savoir si c'est fait", good: "La femme de ménage reçoit la checklist sur son téléphone et envoie des photos de chaque pièce" },
      { bad: "Vous découvrez les objets oubliés des semaines plus tard", good: "Alerte photo instantanée dès qu'il est trouvé" },
      { bad: "Le prochain voyageur arrive et le logement est encore sale", good: "Alerte automatique avant chaque check-out" },
      { bad: "Vous n'avez aucune idée de ce qui se passe sans appeler quelqu'un", good: "Tableau de bord en temps réel pour tous les logements" },
      { bad: "Vous gérez tout via WhatsApp, Excel et carnets", good: "Tout au même endroit, 2 minutes par jour" },
    ],
  },
  how: {
    title: "Prêt en 3 étapes. Sans formation. Sans complexité.",
    steps: [
      { number: "1", title: "Enregistrez votre logement", desc: "Ajoutez adresse, photos et détails. Fait en 2 minutes. Ou importez un tableur." },
      { number: "2", title: "Invitez votre équipe", desc: "La femme de ménage reçoit un lien unique. Pas d'app à installer. Pas de compte à créer. Elle clique et commence." },
      { number: "3", title: "Gérez depuis votre téléphone", desc: "Voyez le statut de tous vos logements en temps réel. Recevez des alertes automatiques. Sachez ce qui se passe — sans rien demander." },
    ],
  },
  features: {
    title: "Tout ce dont vous avez besoin. Rien de superflu.",
    cards: [
      { icon: "🧹", title: "Ménage avec preuve photo", desc: "La femme de ménage photographie chaque pièce. Vous voyez tout sans quitter votre canapé." },
      { icon: "⏱️", title: "Sachez exactement combien dure chaque ménage", desc: "Gérez votre équipe avec des données réelles. Facturez le ménage au juste prix." },
      { icon: "📦", title: "Objets oubliés avec photo", desc: "La femme de ménage prend la photo et vous recevez une alerte instantanée. Plus jamais d'oubli." },
      { icon: "🔴", title: "Problèmes de maintenance signalés instantanément", desc: "Un souci pendant le ménage ? Signalé avec photo. Vous êtes notifié immédiatement." },
      { icon: "📅", title: "Agenda avec tout au même endroit", desc: "Réservations, ménages et check-outs. Plus rien d'oublié." },
      { icon: "💰", title: "Finances simples et claires", desc: "Revenus, dépenses et bénéfices par logement. Sans tableur." },
      { icon: "👥", title: "Voyageurs organisés", desc: "Historique complet. Sachez qui revient, qui est VIP, qui a eu un souci." },
      { icon: "🏆", title: "Score d'organisation", desc: "Voyez à quel point votre opération est organisée et ce qu'il faut améliorer." },
    ],
  },
  social: {
    title: "Plus de 2 400 hôtes ont déjà arrêté de gérer par WhatsApp.",
    testimonials: [
      { quote: "En 5 minutes je connais le statut de tous mes logements. Avant c'était WhatsApp et Excel.", name: "Mariana S.", props: "4 logements · São Paulo", flag: "🇧🇷" },
      { quote: "The cleaning checklist with photos changed everything. I know exactly what happened in each room.", name: "James T.", props: "2 logements · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 propriétés · Paris", flag: "🇫🇷" },
      { quote: "Als jemand mit 6 Ferienwohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 logements · Berlin", flag: "🇩🇪" },
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
      { q: "Je n'ai pas le temps d'apprendre une app de plus.", a: "Prêt en 5 minutes. La femme de ménage n'a même pas besoin de compte — elle clique sur un lien. Si vous utilisez WhatsApp, vous utiliserez Hostlyb." },
      { q: "Ma femme de ménage n'est pas à l'aise avec la tech.", a: "Elle reçoit un lien. L'ouvre dans le navigateur. Prend des photos et envoie. Sans app, sans mot de passe, sans frustration." },
      { q: "J'ai déjà un tableur qui marche.", a: "Un tableur ne vous alerte pas des check-outs. Ne prend pas de photos. Ne signale pas les soucis de maintenance. Et ne gère pas votre femme de ménage." },
      { q: "C'est cher ?", a: "Le plan gratuit est permanent — pas un essai. Pro coûte moins qu'une nuit. Et vous annulez en 1 clic si ça ne vous plaît pas." },
      { q: "Et si j'ai des logements dans plusieurs pays ?", a: "Hostlyb fonctionne dans tous les pays, en 6 langues, avec la devise locale. Utilisé au Brésil, USA, France, Allemagne, Italie et plus." },
      { q: "Mes données sont-elles sécurisées ?", a: "Tout est chiffré au repos et en transit. Photos en stockage privé — vous seul y avez accès." },
    ],
  },
  progress: {
    title: "Votre opération peut ressembler à ça.",
    items: ["Logements enregistrés", "Femme de ménage invitée", "Checklists configurées", "Voyageurs importés", "Finances actives", "Guide numérique créé (Premium)"],
    copy: "La plupart des hôtes passent de 0 % à 80 %+ en moins de 15 minutes.",
  },
  finalCta: {
    title: "Arrêtez d'éteindre des incendies. Commencez à gérer.",
    subtitle: "Gratuit à vie pour 1 logement. Résiliez à tout moment.",
    cta: "Commencer gratuitement →",
    micro: "✓ Prêt en 5 minutes   ✓ Annulez quand vous voulez   ✓ Utilisé sur 3 continents",
  },
};

const it: LandingCopy = {
  loginBtn: "Accedi",
  ctaPrimary: "Inizia gratis",
  hero: {
    headline: "Il tuo affitto breve, organizzato in 2 minuti al giorno.",
    subheadline: "Smetti di gestire le pulizie via WhatsApp, di perdere gli oggetti dimenticati e di non sapere cosa succede nel tuo appartamento. Hostlyb ti dà controllo totale — senza complessità.",
    cta: "Inizia gratis",
    bullets: ["✓ Piano gratuito per sempre", "✓ Disdici quando vuoi", "✓ Pronto in 5 minuti"],
    social: "★★★★★ Usato da +2.400 host in Brasile, USA ed Europa",
    phoneDashboard: "Dashboard",
    phoneCleanings: "Pulizie",
    phoneCalendar: "Calendario",
  },
  problem: {
    title: "Ti suona familiare?",
    rows: [
      { bad: "Mandi WhatsApp alla pulitrice e non sai mai se è stato fatto", good: "La pulitrice riceve la checklist sul cellulare e invia foto di ogni stanza" },
      { bad: "Scopri gli oggetti dimenticati settimane dopo", good: "Avviso foto istantaneo nel momento in cui viene trovato" },
      { bad: "Il prossimo ospite arriva e l'appartamento è ancora sporco", good: "Avviso automatico prima di ogni check-out" },
      { bad: "Non hai idea di cosa stia succedendo senza chiamare qualcuno", good: "Dashboard in tempo reale per tutti gli appartamenti" },
      { bad: "Gestisci tutto con WhatsApp, Excel e quaderni", good: "Tutto in un unico posto, 2 minuti al giorno" },
    ],
  },
  how: {
    title: "Pronto in 3 passi. Senza formazione. Senza complessità.",
    steps: [
      { number: "1", title: "Registra il tuo appartamento", desc: "Aggiungi indirizzo, foto e dettagli. Fatto in 2 minuti. O importa un foglio di calcolo." },
      { number: "2", title: "Invita il tuo team", desc: "La pulitrice riceve un link unico. Nessuna app da installare. Nessun account da creare. Clicca e parte." },
      { number: "3", title: "Gestisci dal cellulare", desc: "Vedi lo stato di tutti gli appartamenti in tempo reale. Ricevi avvisi automatici. Sai cosa succede — senza chiedere a nessuno." },
    ],
  },
  features: {
    title: "Tutto quello che ti serve. Niente di più.",
    cards: [
      { icon: "🧹", title: "Pulizia con prova fotografica", desc: "La pulitrice fotografa ogni stanza. Vedi tutto senza alzarti dal divano." },
      { icon: "⏱️", title: "Sai esattamente quanto dura ogni pulizia", desc: "Gestisci il tuo team con dati reali. Stabilisci la tariffa pulizie con equità." },
      { icon: "📦", title: "Oggetti dimenticati con foto", desc: "La pulitrice fotografa e ricevi un avviso istantaneo. Mai più persi." },
      { icon: "🔴", title: "Problemi di manutenzione segnalati subito", desc: "Problema durante la pulizia? Segnalato con foto. Vieni notificato all'istante." },
      { icon: "📅", title: "Calendario con tutto in un posto", desc: "Prenotazioni, pulizie e check-out. Mai più dimenticanze." },
      { icon: "💰", title: "Finanze semplici e chiare", desc: "Entrate, uscite e profitto per appartamento. Senza fogli di calcolo." },
      { icon: "👥", title: "Ospiti organizzati", desc: "Storico completo. Sai chi torna, chi è VIP, chi ha avuto problemi prima." },
      { icon: "🏆", title: "Score di organizzazione", desc: "Vedi quanto è organizzata la tua operazione e cosa migliorare." },
    ],
  },
  social: {
    title: "Oltre 2.400 host hanno già smesso di gestire via WhatsApp.",
    testimonials: [
      { quote: "In 5 minuti so lo stato di tutti i miei appartamenti. Prima era WhatsApp ed Excel.", name: "Mariana S.", props: "4 appartamenti · San Paolo", flag: "🇧🇷" },
      { quote: "The cleaning checklist with photos changed everything. I know exactly what happened in each room.", name: "James T.", props: "2 appartamenti · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 appartamenti · Parigi", flag: "🇫🇷" },
      { quote: "Als jemand mit 6 Ferienwohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 appartamenti · Berlino", flag: "🇩🇪" },
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
      { q: "Non ho tempo di imparare un'altra app.", a: "Pronto in 5 minuti. La pulitrice non ha nemmeno bisogno di un account — clicca un link. Se usi WhatsApp, sai usare Hostlyb." },
      { q: "La mia pulitrice non è brava con la tecnologia.", a: "Riceve un link. Lo apre nel browser. Scatta foto e invia. Senza app, senza password, senza frustrazione." },
      { q: "Ho già un foglio di calcolo che funziona.", a: "Un foglio non ti avvisa dei check-out. Non scatta foto. Non ti notifica i problemi di manutenzione. E non gestisce la pulitrice per te." },
      { q: "È caro?", a: "Il piano gratis è permanente — non è una prova. Pro costa meno di una notte. E disdici in 1 clic se non ti piace." },
      { q: "E se ho appartamenti in paesi diversi?", a: "Hostlyb funziona in ogni paese, in 6 lingue, con valuta locale. Usato in Brasile, USA, Francia, Germania, Italia e altri." },
      { q: "I miei dati sono sicuri?", a: "Tutto cifrato a riposo e in transito. Foto in storage privato — solo tu hai accesso." },
    ],
  },
  progress: {
    title: "La tua operazione può essere così.",
    items: ["Appartamenti registrati", "Pulitrice invitata", "Checklist configurate", "Ospiti importati", "Finanze attive", "Guida digitale creata (Premium)"],
    copy: "La maggior parte degli host passa da 0% a 80%+ in meno di 15 minuti.",
  },
  finalCta: {
    title: "Smetti di spegnere incendi. Inizia a gestire.",
    subtitle: "Gratis per sempre per 1 appartamento. Disdici quando vuoi.",
    cta: "Inizia gratis ora →",
    micro: "✓ Pronto in 5 minuti   ✓ Disdici quando vuoi   ✓ Usato in 3 continenti",
  },
};

const de: LandingCopy = {
  loginBtn: "Anmelden",
  ctaPrimary: "Kostenlos starten",
  hero: {
    headline: "Deine Ferienwohnung, organisiert in 2 Minuten am Tag.",
    subheadline: "Schluss damit, Reinigungen über WhatsApp zu koordinieren, vergessene Gegenstände zu verlieren und nicht zu wissen, was in deiner Unterkunft passiert. Hostlyb gibt dir volle Kontrolle — ohne Komplexität.",
    cta: "Kostenlos starten",
    bullets: ["✓ Für immer kostenloser Plan", "✓ Jederzeit kündbar", "✓ In 5 Minuten eingerichtet"],
    social: "★★★★★ Genutzt von über 2.400 Gastgebern in Brasilien, USA und Europa",
    phoneDashboard: "Dashboard",
    phoneCleanings: "Reinigungen",
    phoneCalendar: "Kalender",
  },
  problem: {
    title: "Kommt dir das bekannt vor?",
    rows: [
      { bad: "Du schreibst der Reinigungskraft per WhatsApp und weißt nie, ob es erledigt wurde", good: "Die Reinigungskraft bekommt die Checkliste aufs Handy und schickt Fotos jedes Raums" },
      { bad: "Du erfährst Wochen später von vergessenen Gegenständen", good: "Sofort-Foto-Alarm im Moment des Fundes" },
      { bad: "Der nächste Gast kommt an und die Unterkunft ist noch schmutzig", good: "Automatischer Alarm vor jedem Check-out" },
      { bad: "Du hast keine Ahnung, was passiert, ohne jemanden anzurufen", good: "Echtzeit-Dashboard für alle Unterkünfte" },
      { bad: "Du managst alles per WhatsApp, Excel und Notizbüchern", good: "Alles an einem Ort, 2 Minuten am Tag" },
    ],
  },
  how: {
    title: "Bereit in 3 Schritten. Keine Schulung. Keine Komplexität.",
    steps: [
      { number: "1", title: "Unterkunft anlegen", desc: "Adresse, Fotos und Details hinzufügen. In 2 Minuten fertig. Oder eine Tabelle importieren." },
      { number: "2", title: "Team einladen", desc: "Die Reinigungskraft bekommt einen einzigartigen Link. Keine App installieren. Kein Konto anlegen. Einfach klicken und loslegen." },
      { number: "3", title: "Vom Handy aus managen", desc: "Sieh den Status aller Unterkünfte in Echtzeit. Erhalte automatische Alarme. Wisse, was passiert — ohne jemanden zu fragen." },
    ],
  },
  features: {
    title: "Alles, was du brauchst. Nichts, was du nicht brauchst.",
    cards: [
      { icon: "🧹", title: "Reinigung mit Fotobeweis", desc: "Die Reinigungskraft fotografiert jeden Raum. Du siehst alles, ohne vom Sofa aufzustehen." },
      { icon: "⏱️", title: "Weiß genau, wie lange jede Reinigung dauert", desc: "Manage dein Team mit echten Daten. Setze die Reinigungsgebühr fair an." },
      { icon: "📦", title: "Vergessene Gegenstände mit Foto", desc: "Die Reinigungskraft fotografiert und du bekommst sofort einen Alarm. Nie wieder etwas verlieren." },
      { icon: "🔴", title: "Wartungsprobleme sofort gemeldet", desc: "Problem während der Reinigung? Wird mit Foto gemeldet. Du wirst sofort benachrichtigt." },
      { icon: "📅", title: "Kalender mit allem an einem Ort", desc: "Buchungen, Reinigungen und Check-outs. Nichts mehr vergessen." },
      { icon: "💰", title: "Einfache und klare Finanzen", desc: "Einnahmen, Ausgaben und Gewinn pro Unterkunft. Keine Tabellen." },
      { icon: "👥", title: "Organisierte Gäste", desc: "Vollständige Historie. Wisse, wer Stammgast ist, wer VIP, wer schon mal Probleme hatte." },
      { icon: "🏆", title: "Organisations-Score", desc: "Sieh, wie organisiert dein Betrieb ist und was zu verbessern ist." },
    ],
  },
  social: {
    title: "Über 2.400 Gastgeber haben aufgehört, per WhatsApp zu managen.",
    testimonials: [
      { quote: "In 5 Minuten kenne ich den Status all meiner Unterkünfte. Vorher waren es WhatsApp und Excel.", name: "Mariana S.", props: "4 Unterkünfte · São Paulo", flag: "🇧🇷" },
      { quote: "The cleaning checklist with photos changed everything. I know exactly what happened in each room.", name: "James T.", props: "2 Unterkünfte · Miami", flag: "🇺🇸" },
      { quote: "Hostlyb fait tout ce dont j'ai besoin. Simple, rapide, efficace.", name: "Sophie L.", props: "2 Unterkünfte · Paris", flag: "🇫🇷" },
      { quote: "Als jemand mit 6 Ferienwohnungen war ich überfordert. Hostlyb hat das komplett verändert.", name: "Klaus M.", props: "6 Unterkünfte · Berlin", flag: "🇩🇪" },
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
      { q: "Ich habe keine Zeit, noch eine App zu lernen.", a: "In 5 Minuten eingerichtet. Die Reinigungskraft braucht nicht mal ein Konto — sie klickt einfach einen Link. Wenn du WhatsApp nutzt, kannst du Hostlyb nutzen." },
      { q: "Meine Reinigungskraft ist nicht gut mit Technik.", a: "Sie bekommt einen Link. Öffnet ihn im Browser. Macht Fotos und sendet. Keine App, kein Passwort, keine Frustration." },
      { q: "Ich habe schon eine Tabelle, die funktioniert.", a: "Eine Tabelle warnt dich nicht vor Check-outs. Macht keine Fotos. Meldet keine Wartungsprobleme. Und managt deine Reinigungskraft nicht für dich." },
      { q: "Ist es teuer?", a: "Der Gratis-Plan ist dauerhaft — keine Testphase. Pro kostet weniger als eine Übernachtungsgebühr. Und du kündigst mit 1 Klick, wenn es dir nicht gefällt." },
      { q: "Was, wenn ich Unterkünfte in verschiedenen Ländern habe?", a: "Hostlyb funktioniert in jedem Land, in 6 Sprachen, mit lokaler Währung. Genutzt in Brasilien, USA, Frankreich, Deutschland, Italien und mehr." },
      { q: "Sind meine Daten sicher?", a: "Alles verschlüsselt im Ruhezustand und bei der Übertragung. Fotos in privatem Speicher — nur du hast Zugriff." },
    ],
  },
  progress: {
    title: "So kann dein Betrieb aussehen.",
    items: ["Unterkünfte angelegt", "Reinigungskraft eingeladen", "Checklisten konfiguriert", "Gäste importiert", "Finanzen aktiv", "Handbuch erstellt (Premium)"],
    copy: "Die meisten Gastgeber kommen in unter 15 Minuten von 0 % auf 80 %+.",
  },
  finalCta: {
    title: "Hör auf, Feuer zu löschen. Fang an zu managen.",
    subtitle: "Für immer kostenlos für 1 Unterkunft. Jederzeit kündbar.",
    cta: "Jetzt kostenlos starten →",
    micro: "✓ In 5 Minuten eingerichtet   ✓ Jederzeit kündbar   ✓ Auf 3 Kontinenten genutzt",
  },
};

export const LANDING_COPY: Record<Lang, LandingCopy> = { pt, en, es, fr, it, de };
