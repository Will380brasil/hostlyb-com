import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Home as HomeIcon, ArrowRight, Camera, Bell, CheckCircle2, AlertTriangle, Star } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { initAnalytics, initScrollDepth, trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { buildLandingHead } from "@/lib/landing-head";

const FAQ_ITEMS_SEO = [
  { q: "Preciso de cartão de crédito para começar?", a: "Não. O plano grátis é permanente e não exige cartão." },
  { q: "Posso importar as minhas reservas existentes?", a: "Sim. Importa uma folha de cálculo (Excel ou CSV) em segundos." },
  { q: "A faxineira precisa de instalar alguma app?", a: "Não. Recebe um link único e acede direto pelo navegador." },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem contrato e sem multa." },
];

const BASE_URL = "https://www.hostlyb.com";
const OG_IMAGE = `${BASE_URL}/og-cover.jpg`;

const META_BY_LANG: Record<string, { title: string; description: string; keywords: string }> = {
  pt: {
    title: "Hostlyb | O seu Airbnb, finalmente organizado.",
    description: "Pare de gerir o seu Airbnb pelo WhatsApp. Fotos de limpeza, alertas e calendário num só sítio. Grátis até 1 imóvel.",
    keywords: "gestão alojamento local, app anfitrião, sincronização airbnb booking, checklist limpeza fotos",
  },
  en: {
    title: "Hostlyb | Your Airbnb, finally organized.",
    description: "Stop running your Airbnb on WhatsApp. Cleaning photos, alerts, and calendar in one place. Free up to 1 property.",
    keywords: "short term rental management, vacation rental software, airbnb calendar sync, cleaning checklist",
  },
  fr: { title: "Hostlyb | Votre Airbnb, enfin organisé.", description: "Arrêtez de gérer votre Airbnb sur WhatsApp.", keywords: "gestion location courte durée" },
  de: { title: "Hostlyb | Ihr Airbnb, endlich organisiert.", description: "Hören Sie auf, Ihr Airbnb über WhatsApp zu verwalten.", keywords: "ferienwohnung verwaltung" },
  it: { title: "Hostlyb | Il tuo Airbnb, finalmente organizzato.", description: "Smetti di gestire il tuo Airbnb su WhatsApp.", keywords: "gestione affitti brevi" },
  es: { title: "Hostlyb | Tu Airbnb, por fin organizado.", description: "Deja de gestionar tu Airbnb por WhatsApp.", keywords: "gestión alquiler vacacional" },
};

const LANGS = ["pt", "en", "es", "fr", "it", "de"] as const;

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "name": "Hostlyb",
      "description": "Short-term rental management: cleaning photos by email, automatic alerts, iCal sync with Airbnb and Booking.com.",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web, iOS, Android",
      "url": BASE_URL,
      "image": OG_IMAGE,
      "offers": [
        { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "EUR", "url": `${BASE_URL}/signup` },
        { "@type": "Offer", "name": "Pro", "price": "14", "priceCurrency": "EUR", "url": `${BASE_URL}/signup` },
      ],
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "2400", "bestRating": "5", "worstRating": "1" },
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
  head: () => buildLandingHead("pt"),
  component: LandingPage,
});

/* ============================================================
   Design tokens
   ============================================================ */
const C = {
  coral: "#FF6B6B",
  coralDark: "#E85555",
  coralSoft: "#FFE8E8",
  coralGlow: "rgba(255,107,107,0.28)",
  black: "#111111",
  ink: "#1A1A1A",
  muted: "#9E9E9E",
  sub: "#616161",
  line: "#EFEFEF",
  white: "#FFFFFF",
  off: "#FAFAFA",
};

const display = `'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif`;
const body = `'Plus Jakarta Sans', system-ui, -apple-system, sans-serif`;

/* ============================================================
   Hooks
   ============================================================ */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useAnalytics() {
  useEffect(() => {
    initAnalytics();
    initScrollDepth();
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>('a[href="/signup"], a[href^="/signup"]');
      if (a) trackEvent("cta_click", { location: a.dataset.ctaLocation || "unknown" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

function useCountUp(end: number, durationMs = 1400) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    let started = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(end * eased));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      });
    }, { threshold: 0.4 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [end, durationMs]);
  return { ref, val };
}

/* ============================================================
   Navbar
   ============================================================ */
function Navbar() {
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navigate = useNavigate();
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        height: 72,
        background: scrolled ? "rgba(255,255,255,0.78)" : "transparent",
        backdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
        WebkitBackdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
        borderBottom: scrolled ? `1px solid ${C.line}` : "1px solid transparent",
        transition: "all .25s ease",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a
          href="/"
          onClick={(e) => { e.preventDefault(); if (session) navigate({ to: "/app" as any }); else window.scrollTo({ top: 0, behavior: "smooth" }); }}
          style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: display, fontSize: 22, fontWeight: 800, color: C.black, textDecoration: "none", letterSpacing: "-0.02em" }}
        >
          <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8, background: C.coral }}>
            <HomeIcon size={16} color="#fff" />
          </span>
          Hostlyb
        </a>
        <nav className="nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <a href="#features" style={navLink}>Funcionalidades</a>
          <a href="#testimonials" style={navLink}>Anfitriões</a>
          <a href="#pricing" style={navLink}>Preços</a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LanguageSelector compact />
          <Link
            to={session ? ("/app" as any) : ("/login" as any)}
            style={{ color: C.black, fontSize: 14, fontWeight: 600, padding: "9px 18px", textDecoration: "none" }}
          >
            Entrar
          </Link>
          <Link
            to={"/signup" as any}
            data-cta-location="nav"
            style={{ background: C.black, color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 18px", borderRadius: 8, textDecoration: "none", transition: "all .15s ease" }}
            className="nav-cta"
          >
            Começar grátis
          </Link>
        </div>
      </div>
      <style>{`
        .nav-cta:hover { background: ${C.coral}; }
        @media (max-width: 880px) { .nav-links { display: none !important; } }
      `}</style>
    </header>
  );
}
const navLink: React.CSSProperties = { color: C.sub, fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color .15s" };

/* ============================================================
   HERO
   ============================================================ */
function Hero() {
  return (
    <section style={{ position: "relative", padding: "80px 24px 120px", overflow: "hidden" }}>
      {/* subtle background gradient */}
      <div
        aria-hidden
        style={{
          position: "absolute", top: -200, right: -200, width: 700, height: 700,
          background: `radial-gradient(closest-side, ${C.coralGlow}, transparent 70%)`,
          filter: "blur(60px)", zIndex: 0, pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1240, margin: "0 auto", display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 64, alignItems: "center" }} className="hero-grid">
        <div>
          <div className="hero-step" style={{ "--d": "0ms" } as any}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px",
              borderRadius: 999, background: C.coralSoft, color: C.coral, fontSize: 13, fontWeight: 600,
              marginBottom: 28,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: C.coral }} />
              Novo · Versão 2.0 disponível
            </span>
          </div>

          <h1
            className="hero-step hero-h1"
            style={{
              "--d": "100ms",
              fontFamily: display, fontWeight: 900, color: C.black,
              fontSize: "clamp(42px, 6.5vw, 72px)", lineHeight: 1.02,
              letterSpacing: "-0.035em", margin: "0 0 28px",
            } as any}
          >
            O seu Airbnb,<br />finalmente<br /><span style={{ color: C.coral }}>organizado.</span>
          </h1>

          <p
            className="hero-step"
            style={{
              "--d": "200ms",
              fontSize: 18, color: C.sub, maxWidth: 480, margin: "0 0 36px", lineHeight: 1.6,
            } as any}
          >
            Chega de WhatsApp às 23h. Chega de Excel.<br />Chega de surpresas.
          </p>

          <div className="hero-step" style={{ "--d": "300ms", display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 } as any}>
            <Link
              to={"/signup" as any}
              data-cta-location="hero-primary"
              style={{
                background: C.coral, color: "#fff",
                padding: "16px 28px", borderRadius: 12, fontSize: 15, fontWeight: 700,
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10,
                boxShadow: `0 10px 30px ${C.coralGlow}`, transition: "all .2s ease",
              }}
              className="cta-primary"
            >
              Começar grátis — sem cartão <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              style={{
                background: "transparent", color: C.black,
                padding: "16px 24px", borderRadius: 12, fontSize: 15, fontWeight: 600,
                textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8,
                border: `1px solid ${C.line}`, transition: "all .15s ease",
              }}
              className="cta-ghost"
            >
              Ver como funciona
            </a>
          </div>

          <div className="hero-step" style={{ "--d": "400ms", display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.sub, fontWeight: 500 } as any}>
            <span style={{ color: C.coral, letterSpacing: 1 }}>★★★★★</span>
            <span><strong style={{ color: C.black }}>4.9</strong> · 2.400 anfitriões em 12 países</span>
          </div>
        </div>

        <div style={{ position: "relative", minHeight: 480 }}>
          <NotificationStack />
        </div>
      </div>

      <style>{`
        .hero-step { opacity: 0; transform: translateY(20px); animation: heroIn .8s cubic-bezier(0.16,1,0.3,1) forwards; animation-delay: var(--d, 0ms); }
        @keyframes heroIn { to { opacity: 1; transform: translateY(0); } }
        .cta-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px ${C.coralGlow}; }
        .cta-ghost:hover { border-color: ${C.black}; }
        @media (max-width: 960px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      `}</style>
    </section>
  );
}

/* ============================================================
   Notification cards (right side of hero)
   ============================================================ */
function NotificationStack() {
  const cards = [
    {
      icon: <CheckCircle2 size={20} color="#fff" />, iconBg: "#00C896",
      title: "Limpeza concluída", meta: "Studio Paris · agora",
      delay: "600ms", top: 20, left: 0, rotate: -3,
    },
    {
      icon: <AlertTriangle size={20} color="#fff" />, iconBg: "#FF9F1C",
      title: "Checkout amanhã", meta: "Apt Marais 3B · 11:00",
      delay: "900ms", top: 160, left: 80, rotate: 2,
    },
    {
      icon: <Camera size={20} color="#fff" />, iconBg: C.coral,
      title: "6 fotos enviadas", meta: "Ana Costa · há 2 min",
      delay: "1200ms", top: 320, left: 20, rotate: -1,
    },
  ];
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 460, margin: "0 auto", height: 480 }}>
      {cards.map((c, i) => (
        <div
          key={i}
          className="notif-card"
          style={{
            position: "absolute", top: c.top, left: c.left, right: 0,
            background: "#fff", borderRadius: 16, padding: 18,
            boxShadow: "0 20px 50px rgba(17,17,17,0.12), 0 0 0 1px rgba(17,17,17,0.04)",
            display: "flex", alignItems: "center", gap: 14,
            opacity: 0,
            animation: `notifIn .7s cubic-bezier(0.16,1,0.3,1) forwards, notifFloat 5s ease-in-out infinite ${1500 + i * 500}ms`,
            animationDelay: `${c.delay}, ${1500 + i * 500}ms`,
            transform: `rotate(${c.rotate}deg)`,
            transformOrigin: "center",
          } as any}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: c.iconBg, display: "grid", placeItems: "center", flexShrink: 0 }}>
            {c.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.black }}>{c.title}</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: C.muted }}>{c.meta}</p>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes notifIn {
          from { opacity: 0; transform: translateY(20px) rotate(0deg); }
          to { opacity: 1; }
        }
        @keyframes notifFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .notif-card { will-change: transform; }
      `}</style>
    </div>
  );
}

/* ============================================================
   Social proof bar
   ============================================================ */
function SocialProofBar() {
  const flags = ["🇵🇹", "🇫🇷", "🇩🇪", "🇪🇸", "🇮🇹", "🇬🇧", "🇧🇷", "🇺🇸", "🇳🇱", "🇧🇪", "🇦🇹", "🇨🇭"];
  return (
    <section style={{ background: C.off, padding: "48px 24px", borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }} data-reveal>
      <div style={{ maxWidth: 1100, margin: "0 auto", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Confiado por anfitriões em 12 países
        </p>
        <div style={{ marginTop: 20, display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap", fontSize: 28 }}>
          {flags.map((f) => <span key={f}>{f}</span>)}
        </div>
        <div style={{ marginTop: 24, display: "inline-flex", alignItems: "center", gap: 10, color: C.sub, fontSize: 14, fontWeight: 500 }}>
          <span style={{ color: C.coral, letterSpacing: 1.5 }}>★★★★★</span>
          <span><strong style={{ color: C.black }}>4.9</strong> · 847 avaliações verificadas</span>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Problem / Pain
   ============================================================ */
function Problem() {
  const pains = [
    { emoji: "😰", text: "Não sabe se a limpeza foi feita" },
    { emoji: "📋", text: "Controla tudo em Excel" },
    { emoji: "😱", text: "Descobre os problemas quando o hóspede reclama" },
  ];
  return (
    <section style={{ padding: "120px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal style={{
          fontFamily: display, fontWeight: 800, color: C.black,
          fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.025em",
          textAlign: "center", maxWidth: 800, margin: "0 auto 64px",
        }}>
          Ainda a gerir o seu Airbnb<br /><span style={{ color: C.coral }}>pelo WhatsApp?</span>
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }} className="pain-grid">
          {pains.map((p, i) => (
            <div
              key={i}
              data-reveal
              style={{
                background: C.off, borderRadius: 20, padding: 36,
                textAlign: "center", border: `1px solid ${C.line}`,
                transitionDelay: `${i * 100}ms`,
              }}
            >
              <div style={{ fontSize: 56, marginBottom: 20, lineHeight: 1 }}>{p.emoji}</div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: C.black, lineHeight: 1.4 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:780px){.pain-grid{grid-template-columns:1fr !important}}`}</style>
    </section>
  );
}

/* ============================================================
   Features (alternating)
   ============================================================ */
function FeatureRow({ kicker, title, body: text, mockup, reverse }: { kicker: string; title: string; body: string; mockup: React.ReactNode; reverse?: boolean }) {
  return (
    <div
      data-reveal
      style={{
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center",
        direction: reverse ? "rtl" : "ltr",
      }}
      className="feature-row"
    >
      <div style={{ direction: "ltr" }}>
        <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.coral, textTransform: "uppercase", letterSpacing: "0.1em" }}>{kicker}</p>
        <h3 style={{
          fontFamily: display, fontWeight: 800, color: C.black,
          fontSize: "clamp(28px, 4vw, 40px)", lineHeight: 1.1, letterSpacing: "-0.025em",
          margin: "0 0 20px",
        }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 17, lineHeight: 1.7, color: C.sub }}>{text}</p>
      </div>
      <div style={{ direction: "ltr", display: "grid", placeItems: "center" }}>{mockup}</div>
    </div>
  );
}

function MockupChecklist() {
  return (
    <div style={{
      width: 280, height: 540, borderRadius: 40, background: "#0F0F0F", padding: 10,
      boxShadow: "0 30px 80px rgba(17,17,17,0.18), 0 0 0 6px rgba(17,17,17,0.03)",
    }}>
      <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 32, overflow: "hidden", padding: "40px 18px 18px" }}>
        <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Limpeza · Studio Paris</p>
        <h4 style={{ fontFamily: display, fontSize: 20, fontWeight: 800, color: C.black, margin: "4px 0 16px" }}>Checklist</h4>
        {[
          { t: "Cozinha", done: true },
          { t: "Casa de banho", done: true },
          { t: "Quarto principal", done: true },
          { t: "Sala", done: false },
        ].map((it, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 14px",
            background: it.done ? "#F0FBF6" : "#FAFAFA", borderRadius: 12, marginBottom: 8,
            border: `1px solid ${it.done ? "#D1F2E2" : C.line}`,
            animation: it.done ? `checkPop .5s ease ${i * 200}ms both` : undefined,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: 7,
              background: it.done ? "#00C896" : "#fff",
              border: it.done ? "none" : `2px solid ${C.line}`,
              display: "grid", placeItems: "center", flexShrink: 0,
            }}>
              {it.done && <span style={{ color: "#fff", fontSize: 13, fontWeight: 900 }}>✓</span>}
            </div>
            <span style={{ fontSize: 14, fontWeight: 600, color: C.black, flex: 1 }}>{it.t}</span>
          </div>
        ))}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 12 }}>
          {[1,2,3].map((i) => (
            <div key={i} style={{ aspectRatio: "1", borderRadius: 8, background: `linear-gradient(135deg, #FFD9D9, #FF9999)`, display: "grid", placeItems: "center", color: "#fff" }}>
              <Camera size={18} />
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes checkPop{0%{transform:scale(.96);opacity:.4}100%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

function MockupForgotten() {
  return (
    <div style={{
      background: "#fff", borderRadius: 20, padding: 28, width: "100%", maxWidth: 380,
      boxShadow: "0 30px 80px rgba(17,17,17,0.12), 0 0 0 1px rgba(17,17,17,0.04)",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", top: -10, right: -10,
        background: C.coral, color: "#fff", fontSize: 12, fontWeight: 800,
        padding: "6px 10px", borderRadius: 999,
        animation: "pulseBadge 1.6s ease-in-out infinite",
        boxShadow: `0 8px 24px ${C.coralGlow}`,
      }}>
        ! Objeto esquecido
      </div>
      <p style={{ margin: "0 0 16px", fontSize: 12, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: 1 }}>Hóspede · Apt Marais</p>
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 14, borderRadius: 12, background: "#FFF7F7", border: `1px solid ${C.coralSoft}` }}>
        <div style={{ width: 56, height: 56, borderRadius: 10, background: `linear-gradient(135deg, #FFD9D9, #FF9999)`, display: "grid", placeItems: "center", color: "#fff", fontSize: 28 }}>📱</div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.black }}>Carregador iPhone</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: C.sub }}>Encontrado na mesa de cabeceira</p>
        </div>
      </div>
      <button style={{
        marginTop: 16, width: "100%", background: C.black, color: "#fff",
        border: 0, padding: "12px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer",
      }}>Avisar hóspede</button>
      <style>{`@keyframes pulseBadge{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}`}</style>
    </div>
  );
}

function MockupAlerts() {
  return (
    <div style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 12 }}>
      {[
        { icon: <Bell size={16} color="#fff" />, bg: C.coral, t: "Check-in em 1 hora", m: "Lisbon Loft · João S.", d: "0s" },
        { icon: <CheckCircle2 size={16} color="#fff" />, bg: "#00C896", t: "Pagamento recebido", m: "Booking #4821 · €340", d: "0.4s" },
        { icon: <AlertTriangle size={16} color="#fff" />, bg: "#FF9F1C", t: "Limpeza pendente", m: "Marais 3B · checkout 11:00", d: "0.8s" },
      ].map((n, i) => (
        <div key={i} style={{
          background: "#fff", borderRadius: 14, padding: 14,
          boxShadow: "0 12px 30px rgba(17,17,17,0.08), 0 0 0 1px rgba(17,17,17,0.04)",
          display: "flex", alignItems: "center", gap: 12,
          animation: `slideIn .5s ease ${n.d} both`,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: n.bg, display: "grid", placeItems: "center", flexShrink: 0 }}>{n.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.black }}>{n.t}</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: C.muted }}>{n.m}</p>
          </div>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>agora</span>
        </div>
      ))}
      <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}`}</style>
    </div>
  );
}

function Features() {
  return (
    <section id="features" style={{ padding: "120px 24px", background: C.off }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div data-reveal style={{ textAlign: "center", maxWidth: 720, margin: "0 auto 96px" }}>
          <p style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.coral, textTransform: "uppercase", letterSpacing: "0.1em" }}>Funcionalidades</p>
          <h2 style={{ fontFamily: display, fontWeight: 800, color: C.black, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.025em", margin: 0 }}>
            Tudo o que precisa.<br />Nada do que não precisa.
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 120 }}>
          <FeatureRow
            kicker="Checklist com fotos"
            title="Veja a limpeza acontecer em tempo real."
            body="A sua faxineira tira fotos de cada divisão. Você recebe tudo por email assim que termina. Sem perguntas, sem dúvidas, sem chamadas."
            mockup={<MockupChecklist />}
          />
          <FeatureRow
            kicker="Objetos esquecidos"
            title="Recupere o que ficou para trás. Antes do hóspede ligar."
            body="A faxineira regista objetos esquecidos com foto. Você notifica o hóspede com um clique. Problema resolvido em 30 segundos."
            mockup={<MockupForgotten />}
            reverse
          />
          <FeatureRow
            kicker="Alertas automáticos"
            title="O Hostlyb avisa você. Antes de virar problema."
            body="Check-in em 1 hora. Limpeza por agendar. Pagamento recebido. Você recebe tudo no telemóvel — sem refrescar nada."
            mockup={<MockupAlerts />}
          />
        </div>
      </div>
      <style>{`@media(max-width:880px){.feature-row{grid-template-columns:1fr !important;gap:40px !important;direction:ltr !important}}`}</style>
    </section>
  );
}

/* ============================================================
   Editorial testimonials
   ============================================================ */
function Testimonials() {
  const items = [
    { quote: "Antes acordava às 7h a verificar o WhatsApp. Agora o Hostlyb faz isso por mim.", author: "Sofia M.", meta: "4 imóveis · Lisboa", initials: "SM" },
    { quote: "My cleaner photos everything now. I see it in real time from London.", author: "James T.", meta: "3 properties · London", initials: "JT" },
    { quote: "Mes locataires arrivent toujours dans un appartement impeccable.", author: "Claire D.", meta: "2 appartements · Paris", initials: "CD" },
  ];
  return (
    <section id="testimonials" style={{ padding: "120px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p data-reveal style={{ textAlign: "center", margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: C.coral, textTransform: "uppercase", letterSpacing: "0.1em" }}>Anfitriões reais</p>
        <h2 data-reveal style={{
          fontFamily: display, fontWeight: 800, color: C.black,
          fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.025em",
          textAlign: "center", margin: "0 0 80px",
        }}>
          Não acredite em nós.<br />Acredite neles.
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 80 }}>
          {items.map((it, i) => (
            <figure key={i} data-reveal style={{
              margin: 0, display: "grid",
              gridTemplateColumns: "auto 1fr",
              gap: 32, alignItems: "center",
              maxWidth: 880,
              marginLeft: i % 2 === 0 ? 0 : "auto",
              marginRight: i % 2 === 0 ? "auto" : 0,
            }} className="testimonial-row">
              <div style={{
                width: 88, height: 88, borderRadius: 999,
                background: `linear-gradient(135deg, ${C.coral}, #FF8E53)`,
                color: "#fff", display: "grid", placeItems: "center",
                fontFamily: display, fontWeight: 800, fontSize: 28,
                border: `4px solid ${C.coralSoft}`, flexShrink: 0,
              }}>{it.initials}</div>
              <div>
                <blockquote style={{
                  margin: 0, fontFamily: display, fontStyle: "italic", fontWeight: 500,
                  color: C.black, fontSize: "clamp(20px, 2.5vw, 26px)",
                  lineHeight: 1.4, letterSpacing: "-0.015em",
                }}>
                  "{it.quote}"
                </blockquote>
                <figcaption style={{ marginTop: 16, fontSize: 14, color: C.sub, fontWeight: 600 }}>
                  — <span style={{ color: C.black, fontWeight: 700 }}>{it.author}</span>, {it.meta}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:680px){.testimonial-row{grid-template-columns:1fr !important;text-align:center;gap:20px !important}.testimonial-row > div:first-child{margin:0 auto}}`}</style>
    </section>
  );
}

/* ============================================================
   Stats with count-up
   ============================================================ */
function StatBlock({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const { ref, val } = useCountUp(value);
  return (
    <div>
      <p style={{ margin: 0, fontFamily: display, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 900, color: C.black, letterSpacing: "-0.03em" }}>
        <span ref={ref}>{val.toLocaleString("pt-PT")}</span>{suffix}
      </p>
      <p style={{ margin: "8px 0 0", fontSize: 14, fontWeight: 600, color: C.sub }}>{label}</p>
    </div>
  );
}

function Stats() {
  return (
    <section style={{ padding: "80px 24px", background: C.off, borderTop: `1px solid ${C.line}`, borderBottom: `1px solid ${C.line}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 32, textAlign: "center" }} className="stats-grid">
        <StatBlock value={2400} suffix="+" label="Anfitriões ativos" />
        <StatBlock value={12} label="Países" />
        <StatBlock value={48000} suffix="+" label="Limpezas registadas" />
        <StatBlock value={99} suffix="%" label="Uptime" />
      </div>
      <style>{`@media(max-width:780px){.stats-grid{grid-template-columns:repeat(2,1fr) !important}}`}</style>
    </section>
  );
}

/* ============================================================
   Pricing
   ============================================================ */
function Pricing() {
  const [annual, setAnnual] = useState(false);
  const plans = [
    { name: "Free", price: 0, desc: "Para começar com 1 imóvel.", cta: "Começar grátis", featured: false },
    { name: "Pro", priceM: 14, priceA: 11, desc: "Até 5 imóveis com tudo incluído.", cta: "Testar 14 dias grátis", featured: true },
    { name: "Premium", priceM: 29, priceA: 23, desc: "Imóveis ilimitados + equipa.", cta: "Falar connosco", featured: false },
    { name: "Agency", priceM: 79, priceA: 63, desc: "Para gestoras profissionais.", cta: "Pedir demo", featured: false },
  ];
  return (
    <section id="pricing" style={{ padding: "120px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div data-reveal style={{ textAlign: "center", maxWidth: 700, margin: "0 auto 24px" }}>
          <h2 style={{ fontFamily: display, fontWeight: 800, color: C.black, fontSize: "clamp(32px, 5vw, 48px)", lineHeight: 1.1, letterSpacing: "-0.025em", margin: "0 0 16px" }}>
            Simples. Transparente.<br /><span style={{ color: C.coral }}>Sem surpresas.</span>
          </h2>
          <p style={{ margin: 0, fontSize: 17, color: C.sub, lineHeight: 1.6 }}>
            Um plano. Todos os recursos. Paga pelo que usa.
          </p>
        </div>
        <div data-reveal style={{ display: "flex", justifyContent: "center", gap: 12, margin: "32px 0 56px", alignItems: "center" }}>
          <button onClick={() => setAnnual(false)} style={toggleBtn(!annual)}>Mensal</button>
          <button onClick={() => setAnnual(true)} style={toggleBtn(annual)}>
            Anual
            <span style={{ marginLeft: 8, background: C.coral, color: "#fff", padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 800 }}>-20%</span>
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }} className="pricing-grid">
          {plans.map((p, i) => {
            const price = p.price !== undefined ? p.price : annual ? p.priceA! : p.priceM!;
            return (
              <div
                key={p.name}
                data-reveal
                className="price-card"
                style={{
                  background: p.featured ? C.black : "#fff",
                  color: p.featured ? "#fff" : C.black,
                  borderRadius: 20, padding: 32,
                  border: `1px solid ${p.featured ? C.black : C.line}`,
                  position: "relative",
                  transitionDelay: `${i * 80}ms`,
                }}
              >
                {p.featured && (
                  <div style={{
                    position: "absolute", top: -12, left: 24,
                    background: C.coral, color: "#fff", fontSize: 11, fontWeight: 800,
                    padding: "5px 12px", borderRadius: 999, letterSpacing: 0.5,
                  }}>MAIS POPULAR</div>
                )}
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: p.featured ? C.coralSoft : C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{p.name}</p>
                <div style={{ margin: "20px 0 12px", display: "flex", alignItems: "baseline", gap: 6 }}>
                  <span style={{ fontFamily: display, fontSize: 56, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>€{price}</span>
                  <span style={{ fontSize: 14, opacity: 0.6 }}>/mês</span>
                </div>
                <p style={{ margin: "0 0 28px", fontSize: 14, opacity: 0.7, lineHeight: 1.5 }}>{p.desc}</p>
                <Link
                  to={"/signup" as any}
                  data-cta-location={`pricing-${p.name.toLowerCase()}`}
                  style={{
                    display: "block", textAlign: "center", textDecoration: "none",
                    padding: "12px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14,
                    background: p.featured ? C.coral : (p.name === "Free" ? C.black : "#fff"),
                    color: p.featured ? "#fff" : (p.name === "Free" ? "#fff" : C.black),
                    border: p.featured ? "none" : (p.name === "Free" ? "none" : `1px solid ${C.line}`),
                    transition: "all .15s ease",
                  }}
                  className="price-cta"
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        .price-card { transition: all .25s ease; }
        .price-card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(255,107,107,0.18); }
        .price-cta:hover { filter: brightness(0.95); }
        @media(max-width:980px){.pricing-grid{grid-template-columns:repeat(2,1fr) !important}}
        @media(max-width:560px){.pricing-grid{grid-template-columns:1fr !important}}
      `}</style>
    </section>
  );
}
const toggleBtn = (active: boolean): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center",
  padding: "10px 20px", borderRadius: 999, fontSize: 14, fontWeight: 700,
  border: 0, cursor: "pointer", transition: "all .15s",
  background: active ? C.black : "transparent",
  color: active ? "#fff" : C.sub,
});

/* ============================================================
   Final CTA
   ============================================================ */
function FinalCTA() {
  return (
    <section style={{ padding: "120px 24px", background: "#fff" }}>
      <div
        data-reveal
        style={{
          maxWidth: 1100, margin: "0 auto",
          background: `linear-gradient(135deg, ${C.coral} 0%, #FF8E53 100%)`,
          borderRadius: 32, padding: "96px 48px", textAlign: "center",
          position: "relative", overflow: "hidden",
          boxShadow: `0 40px 100px ${C.coralGlow}`,
        }}
      >
        <div aria-hidden style={{ position: "absolute", top: -100, right: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
        <div aria-hidden style={{ position: "absolute", bottom: -150, left: -150, width: 500, height: 500, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
        <div style={{ position: "relative" }}>
          <h2 style={{
            fontFamily: display, fontWeight: 900, color: "#fff",
            fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.05, letterSpacing: "-0.03em",
            margin: "0 0 16px",
          }}>
            Comece hoje.<br />Descanse amanhã.
          </h2>
          <p style={{ margin: "0 0 40px", fontSize: 18, color: "rgba(255,255,255,0.9)", maxWidth: 540, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
            14 dias grátis. Sem cartão. Cancele quando quiser.
          </p>
          <Link
            to={"/signup" as any}
            data-cta-location="final-cta"
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "#fff", color: C.coral,
              padding: "20px 36px", borderRadius: 14, fontSize: 17, fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
              transition: "all .2s ease",
            }}
            className="cta-primary"
          >
            Começar grátis — sem cartão <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   Footer
   ============================================================ */
function Footer() {
  return (
    <footer style={{ background: C.black, color: "#999", padding: "64px 24px 40px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", textDecoration: "none", fontFamily: display, fontSize: 22, fontWeight: 800 }}>
          <span style={{ display: "grid", placeItems: "center", width: 30, height: 30, borderRadius: 8, background: C.coral }}>
            <HomeIcon size={16} color="#fff" />
          </span>
          Hostlyb
        </a>
        <div style={{ display: "flex", gap: 28, fontSize: 14 }}>
          <a href="#features" style={{ color: "#999", textDecoration: "none" }}>Funcionalidades</a>
          <a href="#pricing" style={{ color: "#999", textDecoration: "none" }}>Preços</a>
          <a href="/trust" style={{ color: "#999", textDecoration: "none" }}>Segurança</a>
        </div>
        <LanguageSelector />
      </div>
      <div style={{ maxWidth: 1200, margin: "48px auto 0", paddingTop: 24, borderTop: "1px solid #222", fontSize: 13, color: "#666", textAlign: "center" }}>
        © 2026 Hostlyb. Feito para anfitriões a sério. 🇵🇹
      </div>
    </footer>
  );
}

/* ============================================================
   Page
   ============================================================ */
export { META_BY_LANG, LANGS, BASE_URL, OG_IMAGE, JSON_LD, FAQ_ITEMS_SEO };

export function LandingPage() {
  useReveal();
  useAnalytics();
  return (
    <div style={{ background: "#fff", color: C.ink, fontFamily: body, minHeight: "100vh" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        body { font-family: ${body}; }
        [data-reveal] {
          opacity: 0; transform: translateY(30px);
          transition: opacity .6s cubic-bezier(0.16,1,0.3,1), transform .6s cubic-bezier(0.16,1,0.3,1);
        }
        [data-reveal].is-visible { opacity: 1; transform: translateY(0); }
        ::selection { background: ${C.coral}; color: #fff; }
      `}</style>
      <Navbar />
      <Hero />
      <SocialProofBar />
      <Problem />
      <Features />
      <Testimonials />
      <Stats />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  );
}
