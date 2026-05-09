import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home as HomeIcon, Check, X, Play, ArrowRight, Star, Menu, Plus, Minus,
} from "lucide-react";
import { useT, useLocale, formatPrice } from "@/lib/i18n";
import { LanguageSelector } from "@/components/LanguageSelector";
import heroWoman from "@/assets/hero-woman-phone.jpg";
import { initAnalytics, initScrollDepth, trackEvent } from "@/lib/analytics";

const FAQ_ITEMS = [
  { q: "Preciso de cartão de crédito para testar o Hostly?", a: "Não. Os 7 dias de teste são totalmente gratuitos e não exigem cadastro de cartão. Você só paga se decidir continuar após o trial." },
  { q: "O Hostly funciona para Booking.com e VRBO também?", a: "Sim. O Hostly importa reservas do Airbnb, Booking.com e VRBO via sincronização de calendário iCal. Cole o link iCal nas configurações do imóvel e as reservas aparecem automaticamente." },
  { q: "A faxineira precisa baixar algum aplicativo?", a: "Não. A profissional recebe um link único por WhatsApp e acessa o checklist diretamente pelo navegador do celular, sem criar conta nem instalar nada." },
  { q: "Como funciona o controle de objetos esquecidos?", a: "A faxineira fotografa e registra o objeto pelo portal dela. Você recebe alerta imediato com foto e descrição. O registro fica salvo no histórico permanente até ser resolvido." },
  { q: "Posso cancelar quando quiser?", a: "Sim. Sem contrato, sem multa, sem fidelidade. Cancele com 1 clique nas configurações da conta. O acesso continua até o fim do período pago." },
  { q: "Quantos usuários e imóveis posso ter?", a: "Você + até 4 funcionários (5 no total) através de link de convite, e imóveis ilimitados — tudo no plano Pro." },
  { q: "Como o Hostly se integra com o Google Calendar?", a: "Exporte checkins, checkouts e limpezas em formato .ics e importe no Google Calendar, Apple Calendar ou qualquer app de agenda." },
  { q: "Meus dados e fotos estão seguros?", a: "Sim. Todos os dados são criptografados em repouso e em trânsito (HTTPS). Fotos ficam em armazenamento privado — só você tem acesso." },
];

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Hostly",
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
      "name": "Hostly",
      "contactPoint": { "@type": "ContactPoint", "contactType": "customer support", "availableLanguage": ["Portuguese", "English", "Spanish", "French", "Italian", "German"] },
    },
    {
      "@type": "FAQPage",
      "mainEntity": FAQ_ITEMS.map((it) => ({
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
      { title: "Hostly — Gestão de Airbnb Simplificada | Controle Limpezas e Hóspedes" },
      { name: "description", content: "Hostly é o app de gestão para donos de Airbnb. Controle limpezas com checklist e fotos, gerencie hóspedes, profissionais e calendário. 7 dias grátis. R$ 59,90/mês." },
      { name: "keywords", content: "gestão airbnb, app anfitrião, controle limpeza airbnb, software airbnb brasil, gerenciar aluguel por temporada, checklist limpeza airbnb, gestão hóspedes" },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { name: "theme-color", content: "#FF6B6B" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Hostly — Gestão de Airbnb Simplificada" },
      { property: "og:description", content: "Pare de gerenciar seu Airbnb pelo WhatsApp. Controle limpezas com checklist e fotos, hóspedes e profissionais. 7 dias grátis, sem cartão." },
      { property: "og:locale", content: "pt_BR" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:site_name", content: "Hostly" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Hostly — Gestão de Airbnb Simplificada" },
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
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontSize: 24, fontWeight: 700, color: C.black }}>
          <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: C.coralLight }}>
            <HomeIcon size={18} color={C.coral} />
          </span>
          Host<span style={{ color: C.coral }}>ly</span>
        </a>

        <nav className="nav-desktop" style={{ display: "flex", gap: 32 }}>
          <a href="#features" className="nav-link" style={{ color: C.g600, fontSize: 14, fontWeight: 500 }}>{t("nav.features")}</a>
          <a href="#como-funciona" className="nav-link" style={{ color: C.g600, fontSize: 14, fontWeight: 500 }}>Como funciona</a>
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
  return (
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

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <CoralButton big href="/signup">{t("hero.cta")} <ArrowRight size={18} /></CoralButton>
            <a href="#features" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 24px", color: C.g800, fontWeight: 600, fontSize: 16 }}>
              <Play size={18} /> {t("nav.features")}
            </a>
          </div>

          <div style={{ marginTop: 14 }}>
            <Link to={"/app" as any} style={{ color: C.g600, fontSize: 14, fontWeight: 500, borderBottom: `1px dashed ${C.g300}`, paddingBottom: 2 }}>
              {t("hero.demo")}
            </Link>
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
            alt="Anfitriã usando o Hostly no celular"
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
  );
}

function SocialProof() {
  const t = useT();
  const initials = ["MS", "JT", "SL", "RG", "AC"];
  const colors = [C.coral, "#4A9EFF", C.emerald, "#FFB347", "#A78BFA"];
  return (
    <section style={{ background: C.g50, padding: "32px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: C.g400, fontSize: 13, marginBottom: 16 }}>{t("social.proof")}</p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ display: "flex" }}>
            {initials.map((ini, i) => (
              <div key={ini} style={{
                width: 36, height: 36, borderRadius: 999, background: colors[i],
                color: "#fff", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center",
                marginLeft: i === 0 ? 0 : -10, border: "2px solid #fff",
              }}>{ini}</div>
            ))}
          </div>
          <p style={{ color: C.g600, fontSize: 14, fontWeight: 600 }}>★★★★★ 4.9 / 847</p>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: "🧹", title: "Limpezas", desc: "Checklist e fotos." },
    { icon: "🏠", title: "Imóveis", desc: "Endereço, mapas, wifi." },
    { icon: "👷", title: "Equipe", desc: "Convide até 4 funcionários." },
    { icon: "📅", title: "Calendário", desc: "iCal Airbnb/Booking." },
    { icon: "👥", title: "Hóspedes", desc: "Histórico e avaliações." },
    { icon: "📊", title: "Dashboard", desc: "KPIs em tempo real." },
  ];
  return (
    <section id="features" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, lineHeight: 1.1, marginBottom: 48, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          Tudo que você precisa.
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
  const t = useT();
  const { lang, currency, loading } = useLocale();
  const priceLabel = loading ? "—" : formatPrice(currency, lang);
  const suffix = currency === "USD" ? "/mo" : "/mês";
  const features = ["pricing.plan.f1","pricing.plan.f2","pricing.plan.f3","pricing.plan.f4","pricing.plan.f5","pricing.plan.f6","pricing.plan.f7"];

  return (
    <section id="precos" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, color: C.black, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {t("pricing.title.a")}<br />{t("pricing.title.b")}
        </h2>
        <p data-reveal className="reveal" style={{ color: C.g600, fontSize: 18, marginBottom: 36 }}>
          {t("pricing.subtitle")}
        </p>

        <div data-reveal className="reveal" style={{
          position: "relative", background: "#fff", borderRadius: 28, padding: 36,
          border: `2px solid ${C.coral}`,
          boxShadow: `0 24px 60px ${C.coralGlow}`, textAlign: "left",
        }}>
          <div style={{
            position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
            background: C.coral, color: "#fff", padding: "4px 14px", borderRadius: 999,
            fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
          }}>
            {t("pricing.plan.tag")}
          </div>
          <p style={{ color: C.g400, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>
            {t("pricing.plan.name")}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 12 }}>
            <span style={{ fontFamily: displayFont, fontSize: 52, fontWeight: 800, color: C.black, lineHeight: 1 }}>
              {priceLabel}
            </span>
            <span style={{ color: C.g400, fontSize: 15 }}>{suffix}</span>
          </div>
          <p style={{ color: C.g600, marginTop: 8, fontWeight: 600 }}>{t("pricing.plan.users")}</p>

          <ul style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 10 }}>
            {features.map((k) => (
              <li key={k} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: C.g800, fontSize: 14 }}>
                <Check size={16} color={C.emerald} style={{ marginTop: 3, flexShrink: 0 }} />
                <span>{t(k)}</span>
              </li>
            ))}
          </ul>

          <div style={{ marginTop: 26 }}>
            <CoralButton big href="/signup">{t("pricing.cta")} <ArrowRight size={18} /></CoralButton>
          </div>

          <p style={{ marginTop: 14, color: C.g400, fontSize: 12 }}>
            {t("pricing.note")}
          </p>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { stars: 5, text: "Antes eu controlava tudo por WhatsApp e planilha. Agora em 5 minutos já sei o status de todos os imóveis.", name: "Mariana S.", meta: "4 imóveis · São Paulo", color: C.coral, ini: "MS" },
    { stars: 5, text: "The cleaning checklist feature is a game changer. My cleaner completes it on her phone and I get the photos instantly.", name: "James T.", meta: "2 properties · Miami", color: "#4A9EFF", ini: "JT" },
    { stars: 5, text: "Hostly fait tout ce dont j'ai besoin à un prix imbattable.", name: "Sophie L.", meta: "2 propriétés · Paris", color: C.emerald, ini: "SL" },
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
  return (
    <section id="faq" style={{ padding: "96px 24px", background: C.g50 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          Perguntas frequentes
        </h2>
        <div data-reveal className="reveal" style={{ background: "#fff", borderRadius: 20, padding: "8px 24px", border: `1px solid ${C.g100}` }}>
          {FAQ_ITEMS.map((it) => (
            <details key={it.q} className="faq-item" style={{ borderBottom: `1px solid ${C.g100}` }}>
              <summary style={{
                listStyle: "none", cursor: "pointer", padding: "20px 0",
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
                fontWeight: 700, color: C.g800, fontSize: 16,
              }}>
                <span>{it.q}</span>
                <Plus size={20} color={C.g600} className="faq-icon-closed" />
                <Minus size={20} color={C.coral} className="faq-icon-open" />
              </summary>
              <p style={{ color: C.g600, fontSize: 15, lineHeight: 1.6, paddingBottom: 20, margin: 0 }}>{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  const without = [
    "Avisa a faxineira pelo WhatsApp e não sabe se foi feita",
    "Controla hóspedes em planilha do Excel",
    "Esquece o checkout e o próximo hóspede chega num imóvel sujo",
    "Não sabe se ficou objeto esquecido",
    "Perde horas gerenciando cada imóvel separado",
  ];
  const withHostly = [
    "Faxineira recebe checklist no celular e manda fotos de cada cômodo",
    "Dashboard com status de todos os imóveis em tempo real",
    "Alerta automático antes de cada checkout",
    "Foto e alerta imediato de todo objeto esquecido encontrado",
    "Tudo num só app, em 2 minutos por dia",
  ];
  return (
    <section id="problema" style={{ padding: "96px 24px", background: C.g50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 48, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          Antes vs. depois do Hostly
        </h2>
        <div className="ps-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div data-reveal className="reveal" style={{ background: "#fff", borderRadius: 20, padding: 28, border: `1px solid ${C.g100}` }}>
            <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 20, color: C.g800, marginBottom: 18 }}>❌ Sem o Hostly</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
              {without.map((t) => (
                <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: C.g600, fontSize: 15 }}>
                  <X size={18} color={C.coral} style={{ marginTop: 2, flexShrink: 0 }} /><span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal className="reveal" style={{ background: "#fff", borderRadius: 20, padding: 28, border: `2px solid ${C.emerald}33` }}>
            <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 20, color: C.g800, marginBottom: 18 }}>✅ Com o Hostly</h3>
            <ul style={{ display: "flex", flexDirection: "column", gap: 12, listStyle: "none", padding: 0, margin: 0 }}>
              {withHostly.map((t) => (
                <li key={t} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: C.g800, fontSize: 15 }}>
                  <Check size={18} color={C.emerald} style={{ marginTop: 2, flexShrink: 0 }} /><span>{t}</span>
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
  const steps = [
    { n: "1", t: "Cadastre seus imóveis", d: "Adicione endereço, fotos e o link iCal do seu Airbnb ou Booking." },
    { n: "2", t: "Conecte sua equipe", d: "Cadastre as faxineiras, vincule a cada imóvel e envie o link de acesso." },
    { n: "3", t: "Gerencie pelo celular", d: "Veja o status de tudo em tempo real e receba alertas automáticos." },
  ];
  return (
    <section id="como-funciona" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 48, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          Pronto em 3 passos
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
        <a href="#top" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontSize: 22, fontWeight: 700, color: "#fff" }}>
          <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: C.coralLight }}>
            <HomeIcon size={18} color={C.coral} />
          </span>
          Host<span style={{ color: C.coral }}>ly</span>
        </a>
        <LanguageSelector />
        <p style={{ fontSize: 13, color: C.g400 }}>{t("footer.rights")}</p>
      </div>
    </footer>
  );
}

function LandingPage() {
  useReveal();
  return (
    <div style={{ background: "#fff", color: C.g800, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(20px); transition: opacity .7s ease, transform .7s ease; }
        [data-reveal].is-visible { opacity: 1; transform: translateY(0); }
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
      <Hero />
      <SocialProof />
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
