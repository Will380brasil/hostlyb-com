import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Home as HomeIcon, Check, X, Play, ArrowRight, Star, Menu, Plus, Minus,
  Building2, Sparkles, Users, CalendarDays, Smartphone, Download, Share2,
} from "lucide-react";
import { useT, useLocale, formatPrice } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import heroWoman from "@/assets/hero-woman-phone.jpg";
import { initAnalytics, initScrollDepth, trackEvent } from "@/lib/analytics";
import { DemoLeadModal } from "@/components/DemoLeadModal";

const FAQ_KEYS = [
  ["faq.q1", "faq.a1"],
  ["faq.q2", "faq.a2"],
  ["faq.q3", "faq.a3"],
  ["faq.q4", "faq.a4"],
  ["faq.q5", "faq.a5"],
  ["faq.q6", "faq.a6"],
  ["faq.q7", "faq.a7"],
  ["faq.q8", "faq.a8"],
] as const;
// Static FAQ items for JSON-LD (SEO crawler reads PT)
const FAQ_ITEMS_SEO = [
  { q: "Preciso de cartão de crédito para testar o Hostlyb?", a: "Não. Os 7 dias de teste são totalmente gratuitos e não exigem cadastro de cartão." },
  { q: "O Hostlyb funciona para Booking.com e VRBO também?", a: "Sim, via sincronização iCal." },
  { q: "A faxineira precisa baixar algum aplicativo?", a: "Não. Recebe um link único e acessa direto pelo navegador." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem contrato e sem multa." },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Hostlyb",
      "description": "App de gestão para donos de Airbnb. Controle limpezas com checklist e fotos, gerencie hóspedes, profissionais e calendário.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": { "@type": "Offer", "price": "59.90", "priceCurrency": "BRL" },
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "847", "bestRating": "5", "worstRating": "1" },
      "featureList": [
        "Checklist de limpeza com fotos por cômodo",
        "Controle de hóspedes com histórico",
        "Cadastro de profissionais de limpeza",
        "Registro de objetos esquecidos com fotos",
        "Calendário integrado com Google Calendar",
        "Sincronização via iCal com Airbnb e Booking",
        "Portal para faxineira sem necessidade de login",
        "Dashboard em tempo real",
      ],
    },
    {
      "@type": "Organization",
      "name": "Hostlyb",
      "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "availableLanguage": ["Portuguese", "English", "Spanish", "French", "Italian", "German"] },
    },
    {
      "@type": "FAQPage",
      "mainEntity": FAQ_ITEMS_SEO.map((it) => ({
        "@type": "Question",
        "name": it.q,
        "acceptedAnswer": { "@type": "Answer", "text": it.a },
      })),
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hostlyb — Gestão de Airbnb Simplificada | Controle Limpezas e Hóspedes" },
      { name: "description", content: "Hostlyb é o app de gestão para donos de Airbnb. Controle limpezas com checklist e fotos, gerencie hóspedes, profissionais e calendário. 7 dias grátis. R$ 59,90/mês." },
      { name: "keywords", content: "gestão airbnb, app anfitrião, controle limpeza airbnb, software airbnb brasil, gerenciar aluguel por temporada, checklist limpeza airbnb, gestão hóspedes" },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { name: "theme-color", content: "#FF6B6B" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Hostlyb — Gestão de Airbnb Simplificada" },
      { property: "og:description", content: "Pare de gerenciar seu Airbnb pelo WhatsApp. Controle limpezas com checklist e fotos, hóspedes e profissionais. 7 dias grátis, sem cartão." },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:site_name", content: "Hostlyb" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hostlyb — Gestão de Airbnb Simplificada" },
      { name: "twitter:description", content: "Controle limpezas com checklist, gerencie hóspedes e profissionais. 7 dias grátis." },
    ],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(JSON_LD) },
    ],
  }),
  component: LandingPage,
});

const C = {
  coral: "#FF6B6B", coralDark: "#E85555", coralLight: "#FF6B6B18", coralGlow: "#FF6B6B40",
  white: "#FFFFFF", offWhite: "#FAFAFA",
  g50: "#F7F7F7", g100: "#EFEFEF", g200: "#E0E0E0", g300: "#CFCFCF",
  g400: "#9E9E9E", g600: "#616161", g800: "#212121", black: "#111111",
  emerald: "#00C896",
};

const displayFont = `'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useAnalytics() {
  useEffect(() => {
    initAnalytics();
    initScrollDepth();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>('a[href="/signup"]');
      if (a) trackEvent("cta_click", { location: a.dataset.ctaLocation || "unknown" });
    };
    const onToggle = (e: Event) => {
      const d = e.target as HTMLDetailsElement;
      if (d.tagName === "DETAILS" && d.open) {
        const q = d.querySelector("summary span")?.textContent || "";
        trackEvent("faq_open", { question: q.slice(0, 80) });
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("toggle", onToggle, true);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("toggle", onToggle, true);
    };
  }, []);
}

function useScrolled(threshold = 80) {
  const [s, setS] = useState(false);
  useEffect(() => {
    const onScroll = () => setS(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return s;
}

function CoralButton({ children, href, big, asLink, onClick }: {
  children: React.ReactNode; href?: string; big?: boolean; asLink?: boolean; onClick?: () => void;
}) {
  const style: React.CSSProperties = {
    background: C.coral, color: "#fff", borderRadius: 999,
    padding: big ? "16px 36px" : "10px 24px",
    fontWeight: 700, fontSize: big ? 16 : 14,
    boxShadow: big ? `0 8px 32px ${C.coralGlow}` : `0 4px 20px ${C.coralGlow}`,
    display: "inline-flex", alignItems: "center", gap: 8,
    transition: "all .2s ease", cursor: "pointer", border: 0,
  };
  if (asLink && href) return <Link to={href as any} className="btn-coral" style={style}>{children}</Link>;
  if (href) return <a href={href} className="btn-coral" style={style}>{children}</a>;
  return <button onClick={onClick} className="btn-coral" style={style}>{children}</button>;
}

function Navbar() {
  const t = useT();
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50, height: 72,
      background: scrolled ? "rgba(255,255,255,0.85)" : "#fff",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
      boxShadow: scrolled ? `0 1px 0 ${C.g100}` : "none",
      transition: "all .2s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontSize: 24, fontWeight: 700, color: C.black }}>
          <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: C.coralLight }}>
            <HomeIcon size={18} color={C.coral} />
          </span>
          Host<span style={{ color: C.coral }}>lyb</span>
        </Link>

        <nav className="nav-desktop" style={{ display: "flex", gap: 32 }}>
          <a href="#features" className="nav-link" style={{ color: C.g600, fontSize: 14, fontWeight: 500 }}>{t("nav.features")}</a>
          <a href="#como-funciona" className="nav-link" style={{ color: C.g600, fontSize: 14, fontWeight: 500 }}>{t("nav.howItWorks")}</a>
          <a href="#precos" className="nav-link" style={{ color: C.g600, fontSize: 14, fontWeight: 500 }}>{t("nav.pricing")}</a>
          <a href="#faq" className="nav-link" style={{ color: C.g600, fontSize: 14, fontWeight: 500 }}>{t("nav.faq")}</a>
        </nav>

        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSelector />
          <Link to={"/login" as any} style={{ color: C.g800, fontSize: 14, fontWeight: 600, padding: "10px 18px", borderRadius: 999, border: `1px solid ${C.g200}` }}>
            {t("nav.signin")}
          </Link>
          <CoralButton href="/signup">{t("nav.cta")} <ArrowRight size={16} /></CoralButton>
        </div>

        <div className="nav-mobile-btn" style={{ display: "none", alignItems: "center", gap: 8 }}>
          <LanguageSelector compact />
          <button aria-label="Menu" onClick={() => setOpen((v) => !v)} style={{ background: "transparent", border: 0, color: C.g800 }}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {open && (
        <div className="nav-mobile-drawer" style={{ borderTop: `1px solid ${C.g100}`, background: "#fff", padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <a href="#features" onClick={() => setOpen(false)} style={{ color: C.g800, padding: "12px 8px", fontWeight: 600 }}>{t("nav.features")}</a>
            <a href="#precos" onClick={() => setOpen(false)} style={{ color: C.g800, padding: "12px 8px", fontWeight: 600 }}>{t("nav.pricing")}</a>
            <a href="#faq" onClick={() => setOpen(false)} style={{ color: C.g800, padding: "12px 8px", fontWeight: 600 }}>{t("nav.faq")}</a>
            <Link to={"/login" as any} onClick={() => setOpen(false)} style={{ color: C.g800, padding: "12px 8px", fontWeight: 600 }}>{t("nav.signin")}</Link>
            <CoralButton href="/signup">{t("nav.cta")} <ArrowRight size={16} /></CoralButton>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  const t = useT();
  const [demoOpen, setDemoOpen] = useState(false);
  return (
    <>
    <DemoLeadModal open={demoOpen} onClose={() => setDemoOpen(false)} />
    <section id="top" style={{ padding: "48px 24px 64px", background: "#fff" }}>
      <div className="hero-grid" style={{
        maxWidth: 1200, margin: "0 auto",
        display: "grid", gap: 40, alignItems: "center",
      }}>
        <div data-reveal className="reveal hero-copy">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: C.coralLight, color: C.coral, fontSize: 13, fontWeight: 600 }}>
            {t("hero.badge")}
          </span>

          <h1 style={{ fontFamily: displayFont, fontWeight: 800, color: C.black, lineHeight: 1.05, margin: "20px 0 18px", letterSpacing: "-0.02em", fontSize: "clamp(38px, 6vw, 64px)" }}>
            {t("hero.title.a")}{" "}
            <span style={{ position: "relative", color: C.coral, whiteSpace: "nowrap" }}>
              {t("hero.title.b")}
              <svg viewBox="0 0 120 12" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: -8, width: "100%", height: 12 }}>
                <path d="M2 8 Q 30 -2, 60 6 T 118 4" fill="none" stroke={C.coral} strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>{" "}
            {t("hero.title.c")}
          </h1>

          <p style={{ fontSize: 18, color: C.g600, maxWidth: 540, margin: "0 0 28px", lineHeight: 1.6 }}>
            {t("hero.subtitle")}
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <CoralButton big href="/signup">{t("hero.cta")} <ArrowRight size={18} /></CoralButton>
            <button
              type="button"
              onClick={() => setDemoOpen(true)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "16px 28px", borderRadius: 999, fontSize: 16, fontWeight: 700,
                background: "#fff", color: C.coral, border: `2px solid ${C.coral}`,
                boxShadow: `0 4px 20px ${C.coralGlow}`, cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <Play size={18} fill={C.coral} /> {t("hero.demo")}
            </button>
          </div>

          <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 14px", borderRadius: 999, background: C.coralLight }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: C.coral, boxShadow: `0 0 0 4px ${C.coralGlow}` }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: C.coral }}>
              Demo ao vivo · sem cadastro · explore o painel completo
            </span>
          </div>

          <p style={{ marginTop: 20, color: C.g400, fontSize: 13, display: "flex", gap: 18, flexWrap: "wrap" }}>
            <span>{t("hero.bullet1")}</span>
            <span>{t("hero.bullet2")}</span>
            <span>{t("hero.bullet3")}</span>
          </p>
        </div>

        <div data-reveal className="reveal hero-image-wrap" style={{ position: "relative" }}>
          <div style={{
            position: "absolute", inset: -20, borderRadius: 36,
            background: `radial-gradient(60% 60% at 70% 40%, ${C.coralGlow}, transparent 70%)`,
            filter: "blur(20px)", zIndex: 0,
          }} />
          <img
            src={heroWoman}
            alt={t("hero.imageAlt")}
            width={1024}
            height={1024}
            style={{
              position: "relative", zIndex: 1,
              width: "100%", height: "auto", display: "block",
              borderRadius: 28, objectFit: "cover", aspectRatio: "1 / 1",
              boxShadow: "0 40px 80px rgba(0,0,0,0.18)",
              border: `1px solid ${C.g100}`,
            }}
          />
        </div>
      </div>

      <style>{`
        .hero-grid { grid-template-columns: 1.05fr 1fr; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-image-wrap { order: -1; max-width: 420px; margin: 0 auto; }
        }
      `}</style>
    </section>
    </>
  );
}

const ROTATING_TESTIMONIALS = [
  { ini: "MS", color: "#FF6B6B", name: "Mariana S.", meta: "4 imóveis · São Paulo", text: "Em 5 minutos sei o status de todos os imóveis. Antes era WhatsApp e planilha." },
  { ini: "JT", color: "#4A9EFF", name: "James T.", meta: "2 properties · Miami", text: "The cleaning checklist with photos is a game changer for me." },
  { ini: "SL", color: "#00C896", name: "Sophie L.", meta: "2 propriétés · Paris", text: "Hostlyb fait tout ce dont j'ai besoin à un prix imbattable." },
  { ini: "RG", color: "#FFB347", name: "Rafael G.", meta: "6 imóveis · Florianópolis", text: "O link da faxineira sem login resolveu meu maior problema operacional." },
  { ini: "AC", color: "#A78BFA", name: "Ana C.", meta: "3 imóveis · Rio de Janeiro", text: "Os alertas de checkout e objetos esquecidos me salvaram várias vezes." },
  { ini: "LP", color: "#06B6D4", name: "Luca P.", meta: "5 appartamenti · Milano", text: "Sincronizzazione iCal con Airbnb e Booking funziona perfettamente." },
  { ini: "EM", color: "#F472B6", name: "Elena M.", meta: "3 propiedades · Madrid", text: "Mis huéspedes y limpiezas en un solo lugar. Por fin." },
  { ini: "DK", color: "#34D399", name: "Daniel K.", meta: "4 properties · Lisbon", text: "I cancelled three other tools after trying Hostlyb for a week." },
  { ini: "PB", color: "#F59E0B", name: "Patrícia B.", meta: "7 imóveis · Salvador", text: "Relatório de receita por imóvel me deu clareza que eu nunca tive." },
  { ini: "OM", color: "#8B5CF6", name: "Olivier M.", meta: "2 logements · Lyon", text: "Mon équipe a adopté l'app sans aucune formation." },
];

function SocialProof() {
  const t = useT();
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % ROTATING_TESTIMONIALS.length), 2000);
    return () => clearInterval(id);
  }, []);
  const visible = [0, 1, 2].map((o) => ROTATING_TESTIMONIALS[(idx + o) % ROTATING_TESTIMONIALS.length]);
  const initials = ROTATING_TESTIMONIALS.slice(0, 5);

  return (
    <section style={{ background: C.g50, padding: "40px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 22 }}>
          <div style={{ display: "flex" }}>
            {initials.map((it, i) => (
              <div key={it.ini} style={{
                width: 36, height: 36, borderRadius: 999, background: it.color,
                color: "#fff", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center",
                marginLeft: i === 0 ? 0 : -10, border: "2px solid #fff",
              }}>{it.ini}</div>
            ))}
          </div>
          <p style={{ color: C.g600, fontSize: 14, fontWeight: 600, margin: 0 }}>★★★★★ 4.9 / 847 · {t("social.proof")}</p>
        </div>

        <div className="proofs-row" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {visible.map((tt, i) => (
            <div
              key={`${idx}-${i}-${tt.ini}`}
              style={{
                background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 14,
                padding: "14px 16px", display: "flex", gap: 12, alignItems: "center",
                animation: "proofIn .5s ease both",
                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: 999, background: tt.color,
                color: "#fff", fontWeight: 700, fontSize: 12, display: "grid", placeItems: "center", flexShrink: 0,
              }}>{tt.ini}</div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, color: C.g800, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                  "{tt.text}"
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: C.g400, fontWeight: 600 }}>{tt.name} · {tt.meta}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes proofIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @media (max-width: 900px) { .proofs-row { grid-template-columns: 1fr !important; } .proofs-row > div:nth-child(n+2) { display: none; } }
      `}</style>
    </section>
  );
}

function StartInFourSteps() {
  const steps = [
    { n: 1, icon: Building2, title: "Cadastre seu imóvel", desc: "Endereço, fotos, regras de check-in.", to: "/imoveis", cta: "Ir para Imóveis" },
    { n: 2, icon: Sparkles, title: "Agende uma limpeza", desc: "Checklist + link único para a faxineira, sem login.", to: "/limpezas", cta: "Ir para Limpezas" },
    { n: 3, icon: Users, title: "Registre hóspedes", desc: "Quem chega, valor e objetos esquecidos.", to: "/hospedes", cta: "Ir para Hóspedes" },
    { n: 4, icon: CalendarDays, title: "Sincronize calendários", desc: "iCal do Airbnb e Booking em um só lugar.", to: "/calendario", cta: "Ir para Calendário" },
  ];
  return (
    <section id="comece" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p data-reveal className="reveal" style={{ textAlign: "center", color: C.coral, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
          Onboarding em minutos
        </p>
        <h2 data-reveal className="reveal section-title" style={{
          fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800,
          marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.1, fontSize: "clamp(28px, 4vw, 44px)",
        }}>
          Comece em 4 passos
        </h2>
        <p data-reveal className="reveal" style={{ textAlign: "center", color: C.g600, fontSize: 17, marginBottom: 40, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
          Configure sua operação completa em menos de 10 minutos. Sem treinamento, sem complicação.
        </p>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <Link
                key={s.n}
                to={s.to as any}
                data-reveal
                className="reveal step-card"
                style={{
                  display: "flex", flexDirection: "column", gap: 10,
                  padding: 24, borderRadius: 20, background: "#fff",
                  border: `1px solid ${C.g100}`, transition: "all .2s ease",
                  textDecoration: "none", color: C.g800, position: "relative",
                }}
              >
                <span style={{
                  position: "absolute", top: 16, right: 16,
                  width: 28, height: 28, borderRadius: 999, background: C.coralLight,
                  color: C.coral, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13,
                  fontFamily: displayFont,
                }}>{s.n}</span>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: C.coralLight,
                  color: C.coral, display: "grid", placeItems: "center",
                }}>
                  <Icon size={22} />
                </div>
                <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 17, color: C.black, margin: "6px 0 0" }}>{s.title}</h3>
                <p style={{ color: C.g600, fontSize: 13.5, lineHeight: 1.5, margin: 0, flex: 1 }}>{s.desc}</p>
                <span style={{ marginTop: 6, color: C.coral, fontWeight: 700, fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4 }}>
                  {s.cta} <ArrowRight size={14} />
                </span>
              </Link>
            );
          })}
        </div>
        <div style={{ textAlign: "center", marginTop: 32 }}>
          <CoralButton big href="/signup">Começar grátis agora <ArrowRight size={18} /></CoralButton>
        </div>
      </div>
      <style>{`
        .step-card:hover { transform: translateY(-3px); border-color: ${C.coral}; box-shadow: 0 16px 36px ${C.coralGlow}; }
        @media (max-width: 980px) { .steps-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 520px) { .steps-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

function PwaInstallBanner() {
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [showIos, setShowIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("pwa_install_dismissed")) setDismissed(true);
    const standalone = window.matchMedia?.("(display-mode: standalone)").matches || (window.navigator as any).standalone;
    if (standalone) setInstalled(true);
    const onPrompt = (e: any) => { e.preventDefault(); setDeferred(e); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || dismissed) return null;

  const isIos = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const dismiss = () => { localStorage.setItem("pwa_install_dismissed", "1"); setDismissed(true); };
  const install = async () => {
    if (deferred) {
      deferred.prompt();
      const choice = await deferred.userChoice.catch(() => null);
      if (choice?.outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else if (isIos) {
      setShowIos(true);
    } else {
      setShowIos(true);
    }
  };

  return (
    <>
      <section style={{ padding: "16px 24px 0" }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          background: "linear-gradient(135deg, #111 0%, #2a2a2a 100%)",
          color: "#fff", borderRadius: 18, padding: "16px 20px",
          display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap",
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: C.coral,
            display: "grid", placeItems: "center", color: "#fff", flexShrink: 0,
          }}>
            <Smartphone size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15 }}>Instale o Hostlyb na tela inicial</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: "#bbb" }}>
              Acesse mais rápido, funciona offline, ícone próprio. Grátis.
            </p>
          </div>
          <button
            onClick={install}
            style={{
              background: C.coral, color: "#fff", border: 0, borderRadius: 999,
              padding: "10px 18px", fontWeight: 700, fontSize: 14,
              display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer",
            }}
          >
            <Download size={16} /> Instalar app
          </button>
          <button
            onClick={dismiss}
            aria-label="Dispensar"
            style={{ background: "transparent", border: 0, color: "#888", cursor: "pointer" }}
          >
            <X size={18} />
          </button>
        </div>
      </section>

      {showIos && (
        <div onClick={() => setShowIos(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
          display: "grid", placeItems: "center", zIndex: 100, padding: 16,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 18, padding: 24, maxWidth: 380, width: "100%",
          }}>
            <h3 style={{ margin: "0 0 8px", fontFamily: displayFont, fontWeight: 800, color: C.black }}>
              {isIos ? "Instalar no iPhone/iPad" : "Como instalar"}
            </h3>
            <p style={{ color: C.g600, fontSize: 14, lineHeight: 1.6 }}>
              {isIos ? (
                <>1. Toque em <Share2 size={14} style={{ display: "inline", verticalAlign: "middle" }} /> <strong>Compartilhar</strong>.<br />
                2. Escolha <strong>"Adicionar à Tela de Início"</strong>.<br />
                3. Confirme com <strong>Adicionar</strong>.</>
              ) : (
                <>No menu do navegador, escolha <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</>
              )}
            </p>
            <button onClick={() => setShowIos(false)} className="btn-coral" style={{
              background: C.coral, color: "#fff", border: 0, borderRadius: 999,
              padding: "12px 22px", fontWeight: 700, fontSize: 14, cursor: "pointer", marginTop: 8,
            }}>Entendi</button>
          </div>
        </div>
      )}
    </>
  );
}

function ObjectionBreaker() {
  const t = useT();
  const items = [
    { q: t("obj.q1"), a: t("obj.a1") },
    { q: t("obj.q2"), a: t("obj.a2") },
    { q: t("obj.q3"), a: t("obj.a3") },
    { q: t("obj.q4"), a: t("obj.a4") },
  ];
  return (
    <section style={{ padding: "72px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p data-reveal className="reveal" style={{ textAlign: "center", color: C.coral, fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
          {t("obj.eyebrow")}
        </p>
        <h2 data-reveal className="reveal" style={{
          fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800,
          marginBottom: 40, letterSpacing: "-0.02em", lineHeight: 1.1,
          fontSize: "clamp(26px, 3.8vw, 38px)",
        }}>
          {t("obj.title")}
        </h2>
        <div className="obj-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
          {items.map((it) => (
            <div key={it.q} data-reveal className="reveal" style={{
              background: C.g50, borderRadius: 18, padding: "22px 24px",
              border: `1px solid ${C.g100}`,
            }}>
              <p style={{ color: C.g800, fontWeight: 700, fontSize: 16, marginBottom: 8, fontStyle: "italic" }}>{it.q}</p>
              <p style={{ color: C.g600, fontSize: 14, lineHeight: 1.55, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Check size={16} color={C.emerald} style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{it.a}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .obj-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function Features() {
  const t = useT();
  const features = [
    { icon: "🧹", title: t("feat.cleanings"), desc: t("feat.cleanings.d") },
    { icon: "🏠", title: t("feat.properties"), desc: t("feat.properties.d") },
    { icon: "👷", title: t("feat.team"), desc: t("feat.team.d") },
    { icon: "📅", title: t("feat.calendar"), desc: t("feat.calendar.d") },
    { icon: "👥", title: t("feat.guests"), desc: t("feat.guests.d") },
    { icon: "📊", title: t("feat.dashboard"), desc: t("feat.dashboard.d") },
  ];
  return (
    <section id="features" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, lineHeight: 1.1, marginBottom: 48, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {t("feat.title")}
        </h2>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {features.map((f) => (
            <div key={f.title} data-reveal className="reveal feature-card" style={{
              background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 20, padding: 28,
              transition: "all .2s ease",
            }}>
              <div style={{ fontSize: 32, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 18, color: C.black, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: C.g600, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const { lang, currency } = useLocale();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
  const t = pricingT(lang);
  const tiers = PRICING[currency];

  return (
    <section id="precos" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <h2 className="reveal section-title" style={{ fontFamily: displayFont, color: C.black, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {t.headline}
        </h2>
        <p className="reveal" style={{ color: C.g600, fontSize: 18, marginBottom: 28 }}>{t.subtitle}</p>

        {/* Billing toggle */}
        <div style={{ display: "inline-flex", background: "#F4F4F5", padding: 4, borderRadius: 999, marginBottom: 28 }}>
          <button onClick={() => setBilling("monthly")} style={{
            padding: "10px 18px", borderRadius: 999, border: 0, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: billing === "monthly" ? "#fff" : "transparent", color: C.black,
            boxShadow: billing === "monthly" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          }}>{t.monthly}</button>
          <button onClick={() => setBilling("yearly")} style={{
            padding: "10px 18px", borderRadius: 999, border: 0, fontSize: 13, fontWeight: 700, cursor: "pointer",
            background: billing === "yearly" ? "#fff" : "transparent", color: C.black,
            boxShadow: billing === "yearly" ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
          }}>{t.yearly} <span style={{ color: C.coral }}>· {t.saveBadge} 🎁</span></button>
        </div>

        {/* All-inclusive banner */}
        <div className="reveal" style={{
          background: "linear-gradient(135deg, #FFF7F4, #FFF)", border: "1px solid #FFE5DC",
          borderRadius: 18, padding: "16px 20px", marginBottom: 28, textAlign: "left",
        }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.coral, letterSpacing: 1, marginBottom: 6 }}>
            ✦ {t.allInclude}
          </div>
          <div style={{ fontSize: 13, color: C.g600, lineHeight: 1.5 }}>{t.featuresList}</div>
        </div>

        {/* Tier cards */}
        <div style={{
          display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        }}>
          {tiers.map((tier) => {
            const cents = billing === "yearly" ? tier.yearlyMonthlyCents : tier.monthlyCents;
            const isCustom = tier.custom;
            return (
              <div key={tier.tier} style={{
                background: "#fff", border: tier.popular ? `2px solid ${C.coral}` : "1px solid #EFEFEF",
                borderRadius: 18, padding: "22px 18px", position: "relative", textAlign: "left",
                boxShadow: tier.popular ? `0 16px 40px ${C.coralGlow}` : "0 4px 14px rgba(0,0,0,0.04)",
              }}>
                {tier.popular && (
                  <div style={{
                    position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
                    background: C.coral, color: "#fff", padding: "3px 10px", borderRadius: 999,
                    fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
                  }}>★ POPULAR</div>
                )}
                <div style={{ fontSize: 13, fontWeight: 700, color: C.g600, marginBottom: 10 }}>
                  {isCustom ? t.customLabel : `${t.upTo} ${tier.tier} ${t.properties}`}
                </div>
                {isCustom ? (
                  <>
                    <div style={{ fontFamily: displayFont, fontSize: 28, fontWeight: 800, color: C.black, marginBottom: 18 }}>
                      {t.customPrice}
                    </div>
                    <a href="mailto:hello@hostlyb.app" style={{
                      display: "block", textAlign: "center", padding: "10px 14px", borderRadius: 999,
                      background: C.black, color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 13,
                    }}>{t.contactUs}</a>
                  </>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                      <span style={{ fontFamily: displayFont, fontSize: 30, fontWeight: 800, color: C.black, lineHeight: 1 }}>
                        {formatTierPrice(cents, currency, lang)}
                      </span>
                      <span style={{ color: C.g400, fontSize: 12 }}>{t.perMonth}</span>
                    </div>
                    <div style={{ color: C.g400, fontSize: 11, marginBottom: 14 }}>
                      ≈ {pricePerDay(cents, currency, lang)}{t.perDay}
                    </div>
                    <Link to={"/signup" as any} onClick={() => trackEvent("pricing_cta", { tier: tier.tier, currency, billing })} style={{
                      display: "block", textAlign: "center", padding: "10px 14px", borderRadius: 999,
                      background: tier.popular ? C.coral : "#F4F4F5",
                      color: tier.popular ? "#fff" : C.black,
                      textDecoration: "none", fontWeight: 700, fontSize: 13,
                    }}>🎁 {t.startFree}</Link>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 22, color: C.g400, fontSize: 13 }}>
          🎁 {t.trial} · {t.noCard} · {t.cancel}
        </p>
        <div style={{
          marginTop: 24, padding: 16, background: "#FAFAFA", borderRadius: 14,
          maxWidth: 560, margin: "24px auto 0", border: "1px solid #EFEFEF",
        }}>
          <div style={{ fontWeight: 800, color: C.black, fontSize: 14, marginBottom: 4 }}>{t.insightTitle}</div>
          <div style={{ color: C.g600, fontSize: 13 }}>{t.insightBody}</div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { stars: 5, text: "Antes eu controlava tudo por WhatsApp e planilha. Agora em 5 minutos já sei o status de todos os imóveis.", name: "Mariana S.", meta: "4 imóveis · São Paulo", color: C.coral, ini: "MS" },
    { stars: 5, text: "The cleaning checklist feature is a game changer. My cleaner completes it on her phone and I get the photos instantly.", name: "James T.", meta: "2 properties · Miami", color: "#4A9EFF", ini: "JT" },
    { stars: 5, text: "Hostlyb fait tout ce dont j'ai besoin à un prix imbattable.", name: "Sophie L.", meta: "2 propriétés · Paris", color: C.emerald, ini: "SL" },
  ];
  return (
    <section style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 48, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          ★★★★★
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {items.map((tt) => (
            <div key={tt.name} data-reveal className="reveal" style={{
              border: `1px solid ${C.g100}`, borderRadius: 20, padding: 28, background: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", gap: 2, color: "#FFB347", marginBottom: 14 }}>
                {Array.from({ length: tt.stars }).map((_, i) => <Star key={i} size={16} fill="#FFB347" stroke="none" />)}
              </div>
              <p style={{ color: C.g800, fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>"{tt.text}"</p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: tt.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>{tt.ini}</div>
                <div>
                  <p style={{ fontWeight: 700, color: C.g800, fontSize: 14 }}>{tt.name}</p>
                  <p style={{ color: C.g400, fontSize: 12 }}>{tt.meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${C.g100}` }}>
      <button onClick={() => setOpen((v) => !v)} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "20px 0", background: "transparent", border: 0, cursor: "pointer", textAlign: "left",
      }}>
        <span style={{ fontWeight: 700, color: C.g800, fontSize: 16 }}>{q}</span>
        {open ? <Minus size={20} color={C.coral} /> : <Plus size={20} color={C.g600} />}
      </button>
      <div style={{ maxHeight: open ? 240 : 0, overflow: "hidden", transition: "max-height .3s ease, padding .3s ease", paddingBottom: open ? 20 : 0 }}>
        <p style={{ color: C.g600, fontSize: 15, lineHeight: 1.6 }}>{a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const t = useT();
  return (
    <section id="faq" style={{ padding: "96px 24px", background: C.g50 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {t("faq.title")}
        </h2>
        <div data-reveal className="reveal" style={{ background: "#fff", borderRadius: 20, padding: "8px 24px", border: `1px solid ${C.g100}` }}>
          {FAQ_KEYS.map(([qk, ak]) => (
            <details key={qk} className="faq-item" style={{ borderBottom: `1px solid ${C.g100}` }}>
              <summary style={{
                listStyle: "none", cursor: "pointer", padding: "20px 0",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                fontWeight: 700, color: C.g800, fontSize: 16,
              }}>
                <span>{t(qk)}</span>
                <Plus size={20} color={C.g600} className="faq-icon-closed" />
                <Minus size={20} color={C.coral} className="faq-icon-open" />
              </summary>
              <p style={{ color: C.g600, fontSize: 15, lineHeight: 1.6, paddingBottom: 20, margin: 0 }}>{t(ak)}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  const t = useT();
  const without = [t("ps.w1"), t("ps.w2"), t("ps.w3"), t("ps.w4"), t("ps.w5")];
  const withHostlyb = [t("ps.h1"), t("ps.h2"), t("ps.h3"), t("ps.h4"), t("ps.h5")];
  return (
    <section id="problema" style={{ padding: "96px 24px", background: C.g50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 48, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {t("ps.title")}
        </h2>
        <div className="ps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div data-reveal className="reveal" style={{ background: "#fff", borderRadius: 20, padding: 28, border: `1px solid ${C.g100}` }}>
            <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 20, color: C.g800, marginBottom: 18 }}>❌ {t("ps.without")}</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
              {without.map((tx) => (
                <li key={tx} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: C.g600, fontSize: 15 }}>
                  <X size={18} color={C.coral} style={{ marginTop: 2, flexShrink: 0 }} /><span>{tx}</span>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal className="reveal" style={{ background: "#fff", borderRadius: 20, padding: 28, border: `2px solid ${C.emerald}33` }}>
            <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 20, color: C.g800, marginBottom: 18 }}>✅ {t("ps.with")}</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
              {withHostlyb.map((tx) => (
                <li key={tx} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: C.g800, fontSize: 15 }}>
                  <Check size={18} color={C.emerald} style={{ marginTop: 2, flexShrink: 0 }} /><span>{tx}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .ps-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function HowItWorks() {
  const t = useT();
  const steps = [
    { n: "1", t: t("hiw.s1.t"), d: t("hiw.s1.d") },
    { n: "2", t: t("hiw.s2.t"), d: t("hiw.s2.d") },
    { n: "3", t: t("hiw.s3.t"), d: t("hiw.s3.d") },
  ];
  return (
    <section id="como-funciona" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 48, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {t("hiw.title")}
        </h2>
        <div className="hiw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {steps.map((s) => (
            <div key={s.n} data-reveal className="reveal" style={{ textAlign: "center", padding: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: C.coralLight,
                color: C.coral, fontFamily: displayFont, fontWeight: 800, fontSize: 28,
                display: "grid", placeItems: "center", margin: "0 auto 18px",
              }}>{s.n}</div>
              <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 20, color: C.black, marginBottom: 8 }}>{s.t}</h3>
              <p style={{ color: C.g600, fontSize: 15, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>{s.d}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 768px) { .hiw-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function CTABanner() {
  const t = useT();
  return (
    <section style={{ padding: "32px 24px" }}>
      <div data-reveal className="reveal" style={{
        position: "relative", overflow: "hidden",
        maxWidth: 1100, margin: "0 auto", borderRadius: 32,
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
        padding: "72px 32px", textAlign: "center", color: "#fff",
      }}>
        <h2 style={{ fontFamily: displayFont, fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.1, fontSize: "clamp(28px, 4vw, 44px)" }}>
          {t("cta.title")}
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.9)", marginBottom: 28 }}>{t("cta.subtitle")}</p>
        <a href="/signup" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#fff", color: C.coral, padding: "16px 32px",
          borderRadius: 999, fontWeight: 800, fontSize: 16,
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
        }}>
          {t("cta.btn")} <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const t = useT();
  return (
    <footer style={{ background: C.black, color: C.g300, padding: "48px 24px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24, alignItems: "center", textAlign: "center" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontSize: 22, fontWeight: 700, color: "#fff" }}>
          <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: C.coralLight }}>
            <HomeIcon size={18} color={C.coral} />
          </span>
          Host<span style={{ color: C.coral }}>lyb</span>
        </Link>
        <LanguageSelector />
        <p style={{ fontSize: 13, color: C.g400 }}>{t("footer.rights")}</p>
      </div>
    </footer>
  );
}

function LandingPage() {
  useReveal();
  useAnalytics();
  return (
    <div style={{ background: "#fff", color: C.g800, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        /* Always render content visible. Reveal class only adds a tiny lift-in once observed. */
        [data-reveal] { opacity: 1; transform: none; transition: transform .5s ease; }
        [data-reveal].is-visible { transform: translateY(0); }
        .btn-coral:hover { transform: translateY(-1px); filter: brightness(1.04); }
        .nav-link { transition: color .15s ease; } .nav-link:hover { color: ${C.coral}; }
        .feature-card:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(0,0,0,0.06); border-color: ${C.coralLight}; }
        details.faq-item summary::-webkit-details-marker { display: none; }
        details.faq-item .faq-icon-open { display: none; }
        details.faq-item[open] .faq-icon-closed { display: none; }
        details.faq-item[open] .faq-icon-open { display: inline-block; }
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: inline-flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-btn { display: none !important; }
          .nav-mobile-drawer { display: none !important; }
        }
      `}</style>

      <Navbar />
      <PwaInstallBanner />
      <Hero />
      <SocialProof />
      <StartInFourSteps />
      <ObjectionBreaker />
      <ProblemSolution />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <FAQ />
      <CTABanner />
      <Footer />
    </div>
  );
}
