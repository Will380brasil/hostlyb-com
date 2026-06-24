import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Home as HomeIcon, Check, X, ArrowRight, Plus, Minus, Star } from "lucide-react";
import { useLocale, PLAN_PRICE, type Currency } from "@/lib/i18n";
import { LANDING_COPY } from "@/lib/landing-copy";
import { LanguageSelector } from "@/components/LanguageSelector";
import { initAnalytics, initScrollDepth, trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";

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
    title: "Hostlyb | Gestão de Alojamento Local — Simples e Rápido",
    description: "Gira o seu alojamento local em 2 minutos por dia. Fotos de limpeza enviadas por email, alertas automáticos, sincronização com Airbnb e Booking.com. Grátis até 1 imóvel.",
    keywords: "gestão alojamento local, app anfitrião, sincronização airbnb booking, checklist limpeza fotos, gestão hóspedes, software alojamento",
  },
  en: {
    title: "Hostlyb | Short-Term Rental Management — Simple & Fast",
    description: "Manage your short-term rental in 2 minutes a day. Cleaning photos sent to your email, automatic alerts, iCal sync with Airbnb and Booking.com. Free up to 1 property.",
    keywords: "short term rental management, vacation rental software, airbnb calendar sync, cleaning checklist app, host management software, rental property manager",
  },
  fr: {
    title: "Hostlyb | Gestion Location Courte Durée — Simple et Rapide",
    description: "Gérez votre location courte durée en 2 minutes. Photos de ménage envoyées par email, alertes automatiques, sync Airbnb et Booking.com. Gratuit jusqu'à 1 logement.",
    keywords: "gestion location courte durée, logiciel location vacances, sync calendrier airbnb, checklist ménage, gestion hôtes, conciergerie airbnb",
  },
  de: {
    title: "Hostlyb | Ferienwohnung Verwaltung — Einfach & Schnell",
    description: "Verwalten Sie Ihre Ferienwohnung in 2 Minuten. Reinigungsfotos per Email, automatische Benachrichtigungen, iCal-Sync mit Airbnb und Booking.com. Kostenlos bis 1 Objekt.",
    keywords: "ferienwohnung verwaltung, vermietung software, airbnb kalender sync, reinigungs checkliste, gastgeber app, kurzzeitvermietung",
  },
  it: {
    title: "Hostlyb | Gestione Affitti Brevi — Semplice e Veloce",
    description: "Gestisci i tuoi affitti brevi in 2 minuti al giorno. Foto delle pulizie via email, avvisi automatici, sincronizzazione iCal con Airbnb e Booking.com. Gratis fino a 1 immobile.",
    keywords: "gestione affitti brevi, software locazioni turistiche, sync calendario airbnb, checklist pulizie, gestione ospiti, app host airbnb",
  },
  es: {
    title: "Hostlyb | Gestión Alojamiento Local — Simple y Rápido",
    description: "Gestiona tu alquiler vacacional en 2 minutos al día. Fotos de limpieza por email, alertas automáticas, sincronización iCal con Airbnb y Booking.com. Gratis hasta 1 propiedad.",
    keywords: "gestión alquiler vacacional, software alojamiento, sync calendario airbnb, checklist limpieza, gestión huéspedes, app anfitrión",
  },
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
        { "@type": "Offer", "name": "Premium", "price": "29", "priceCurrency": "EUR", "url": `${BASE_URL}/signup` },
      ],
      "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "2400", "bestRating": "5", "worstRating": "1" },
    },
    {
      "@type": "Organization",
      "name": "Hostlyb",
      "url": BASE_URL,
      "logo": `${BASE_URL}/icon-512.png`,
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "support@hostlyb.com",
        "contactType": "customer support",
      },
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

import { buildLandingHead } from "@/lib/landing-head";

export const Route = createFileRoute("/")({
  head: () => buildLandingHead("pt"),
  component: LandingPage,
});


const C = {
  coral: "#FF6B6B", coralDark: "#E85555", coralLight: "#FFE8E8", coralGlow: "rgba(255,107,107,0.28)",
  white: "#FFFFFF", offWhite: "#FAFAFA",
  g50: "#F7F7F7", g100: "#EFEFEF", g200: "#E0E0E0", g300: "#CFCFCF",
  g400: "#9E9E9E", g600: "#616161", g800: "#212121", black: "#111111",
  emerald: "#00C896", emeraldLight: "#E6FAF4",
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
      const a = (e.target as HTMLElement)?.closest?.<HTMLAnchorElement>('a[href="/signup"], a[href^="/signup"]');
      if (a) trackEvent("cta_click", { location: a.dataset.ctaLocation || "unknown" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

function StartFreeButton({ big, location }: { big?: boolean; location: string }) {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  return (
    <Link
      to={"/signup" as any}
      data-cta-location={location}
      className="btn-coral"
      style={{
        background: C.coral, color: "#fff", borderRadius: 999,
        padding: big ? "18px 36px" : "12px 24px",
        fontWeight: 800, fontSize: big ? 17 : 14,
        boxShadow: big ? `0 14px 40px ${C.coralGlow}` : `0 6px 22px ${C.coralGlow}`,
        display: "inline-flex", alignItems: "center", gap: 10,
        textDecoration: "none", border: 0, transition: "all .2s ease",
      }}
    >
      {big ? copy.hero.cta : copy.ctaPrimary} <ArrowRight size={big ? 20 : 16} />
    </Link>
  );
}

function Navbar() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  const { session } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const navigate = useNavigate();
  const onLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (session) { navigate({ to: "/app" as any }); return; }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50, height: 68,
      background: scrolled ? "rgba(255,255,255,0.92)" : "#fff",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(14px)" : "none",
      boxShadow: scrolled ? `0 1px 0 ${C.g100}` : "none",
      transition: "all .2s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="#" onClick={onLogoClick} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontSize: 24, fontWeight: 800, color: C.black, textDecoration: "none", cursor: "pointer" }}>
          <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: C.coralLight }}>
            <HomeIcon size={18} color={C.coral} />
          </span>
          Host<span style={{ color: C.coral }}>lyb</span>
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LanguageSelector compact />
          <Link
            to={session ? ("/app" as any) : ("/login" as any)}
            style={{
              color: C.g800, fontSize: 14, fontWeight: 700,
              padding: "10px 20px", borderRadius: 999, border: `1.5px solid ${C.g200}`,
              textDecoration: "none", transition: "all .15s ease",
            }}
            className="login-link"
          >
            {copy.loginBtn}
          </Link>
        </div>
      </div>
      <style>{`.login-link:hover { border-color: ${C.coral}; color: ${C.coral}; }`}</style>
    </header>
  );
}

/* ============ HERO with animated phone mockup ============ */
function PhoneMockup({ labels }: { labels: { d: string; c: string; cal: string } }) {
  const [screen, setScreen] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScreen((s) => (s + 1) % 3), 2800);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{
      position: "relative", width: "min(280px, 80vw)", height: 560,
      borderRadius: 44, background: "#1a1a1a", padding: 12,
      boxShadow: `0 40px 80px rgba(0,0,0,0.25), 0 0 0 8px rgba(255,255,255,0.04)`,
      margin: "0 auto",
    }}>
      {/* notch */}
      <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 100, height: 22, background: "#000", borderRadius: 12, zIndex: 3 }} />
      <div style={{
        position: "relative", width: "100%", height: "100%",
        borderRadius: 34, overflow: "hidden", background: "#fff",
      }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            position: "absolute", inset: 0, opacity: screen === i ? 1 : 0,
            transition: "opacity .6s ease",
          }}>
            {i === 0 && <ScreenDashboard label={labels.d} />}
            {i === 1 && <ScreenCleanings label={labels.c} />}
            {i === 2 && <ScreenCalendar label={labels.cal} />}
          </div>
        ))}
      </div>
      {/* tab dots */}
      <div style={{ position: "absolute", bottom: -28, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{
            width: screen === i ? 20 : 6, height: 6, borderRadius: 999,
            background: screen === i ? C.coral : C.g200, transition: "all .3s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

function ScreenHeader({ label }: { label: string }) {
  return (
    <div style={{ padding: "40px 18px 12px", borderBottom: `1px solid ${C.g100}` }}>
      <p style={{ fontSize: 11, color: C.g400, margin: 0, fontWeight: 600 }}>Hostlyb</p>
      <h4 style={{ fontFamily: displayFont, fontSize: 19, fontWeight: 800, color: C.black, margin: "2px 0 0" }}>{label}</h4>
    </div>
  );
}

function ScreenDashboard({ label }: { label: string }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.offWhite }}>
      <ScreenHeader label={label} />
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        {[
          { name: "Lisbon Loft", status: "✓ Limpo", color: C.emerald },
          { name: "Beach Villa", status: "🧹 Limpando", color: C.coral },
          { name: "Downtown #2", status: "✓ Limpo", color: C.emerald },
        ].map((p) => (
          <div key={p.name} style={{ background: "#fff", borderRadius: 12, padding: 12, border: `1px solid ${C.g100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.g800 }}>{p.name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: p.color }}>{p.status}</span>
          </div>
        ))}
        <div style={{ background: "linear-gradient(135deg,#FF6B6B,#FF8E53)", borderRadius: 14, padding: 14, color: "#fff", marginTop: 6 }}>
          <p style={{ margin: 0, fontSize: 11, opacity: 0.9 }}>Receita do mês</p>
          <p style={{ margin: "2px 0 0", fontFamily: displayFont, fontSize: 22, fontWeight: 800 }}>R$ 8.420</p>
        </div>
      </div>
    </div>
  );
}

function ScreenCleanings({ label }: { label: string }) {
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.offWhite }}>
      <ScreenHeader label={label} />
      <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 12, border: `1px solid ${C.g100}` }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: C.g800, margin: 0 }}>Beach Villa · Quarto</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
            {[1, 2].map((i) => (
              <div key={i} style={{ aspectRatio: "1", borderRadius: 8, background: `linear-gradient(135deg, #FFD9D9, #FF9999)`, display: "grid", placeItems: "center", color: "#fff", fontSize: 18 }}>📷</div>
            ))}
          </div>
        </div>
        {["Quarto principal", "Cozinha", "Banheiro"].map((r) => (
          <div key={r} style={{ background: "#fff", borderRadius: 10, padding: "10px 12px", border: `1px solid ${C.g100}`, display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 18, height: 18, borderRadius: 6, background: C.emerald, display: "grid", placeItems: "center" }}>
              <Check size={12} color="#fff" />
            </div>
            <span style={{ fontSize: 12, color: C.g800, fontWeight: 600 }}>{r}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScreenCalendar({ label }: { label: string }) {
  const days = Array.from({ length: 28 }, (_, i) => i + 1);
  const booked = new Set([3, 4, 5, 11, 12, 17, 18, 19, 25, 26]);
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: C.offWhite }}>
      <ScreenHeader label={label} />
      <div style={{ padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} style={{ fontSize: 9, color: C.g400, textAlign: "center", fontWeight: 700 }}>{d}</div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
          {days.map((d) => (
            <div key={d} style={{
              aspectRatio: "1", borderRadius: 6,
              background: booked.has(d) ? C.coral : "#fff",
              color: booked.has(d) ? "#fff" : C.g600,
              border: booked.has(d) ? "none" : `1px solid ${C.g100}`,
              fontSize: 10, fontWeight: 700, display: "grid", placeItems: "center",
            }}>{d}</div>
          ))}
        </div>
        <div style={{ background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 10, padding: 10, marginTop: 10 }}>
          <p style={{ margin: 0, fontSize: 10, color: C.g400, fontWeight: 700 }}>Próximo check-out</p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: C.g800, fontWeight: 700 }}>Beach Villa · Hoje 11:00</p>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  return (
    <section style={{ padding: "56px 20px 72px", background: "#fff", position: "relative", overflow: "hidden" }}>
      <div className="hero-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 40, alignItems: "center" }}>
        <div data-reveal className="reveal">
          <h1 style={{
            fontFamily: displayFont, fontWeight: 800, color: C.black,
            lineHeight: 1.04, margin: "0 0 22px", letterSpacing: "-0.025em",
            fontSize: "clamp(36px, 5.4vw, 60px)",
          }}>
            {copy.hero.headline}
          </h1>
          <p style={{ fontSize: 18, color: C.g600, maxWidth: 560, margin: "0 0 32px", lineHeight: 1.6 }}>
            {copy.hero.subheadline}
          </p>
          <StartFreeButton big location="hero" />
          <p style={{ marginTop: 18, color: C.g600, fontSize: 13, display: "flex", gap: 20, flexWrap: "wrap", fontWeight: 600 }}>
            {copy.hero.bullets.map((b) => <span key={b}>{b}</span>)}
          </p>
        </div>
        <div data-reveal className="reveal" style={{ position: "relative", display: "grid", placeItems: "center" }}>
          <div style={{
            position: "absolute", inset: -40, borderRadius: 36,
            background: `radial-gradient(60% 60% at 60% 40%, ${C.coralGlow}, transparent 70%)`,
            filter: "blur(30px)", zIndex: 0,
          }} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <PhoneMockup labels={{ d: copy.hero.phoneDashboard, c: copy.hero.phoneCleanings, cal: copy.hero.phoneCalendar }} />
          </div>
        </div>
      </div>

      {/* Social proof bar */}
      <div style={{ maxWidth: 1100, margin: "56px auto 0", textAlign: "center" }}>
        <p style={{ color: C.g600, fontSize: 14, fontWeight: 600, margin: 0 }}>{copy.hero.social}</p>
      </div>

      <style>{`
        .hero-grid { grid-template-columns: 1.1fr 1fr; }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-grid > div:last-child { order: -1; }
        }
      `}</style>
    </section>
  );
}

/* ============ PROBLEM (Before vs After) ============ */
function Problem() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  return (
    <section style={{ padding: "88px 20px", background: C.g50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 48, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {copy.problem.title}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 980, margin: "0 auto" }}>
          {copy.problem.rows.map((row, i) => (
            <div key={i} data-reveal className="reveal problem-row" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14,
            }}>
              <div className="bad-card" style={{
                background: "#fff", border: `1px solid ${C.g100}`, borderRadius: 16,
                padding: "18px 20px", display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: "#FFE8E8", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <X size={16} color={C.coral} />
                </div>
                <p style={{ margin: 0, color: C.g600, fontSize: 15, lineHeight: 1.5 }}>{row.bad}</p>
              </div>
              <div className="good-card" style={{
                background: "#fff", border: `1.5px solid ${C.emerald}55`, borderRadius: 16,
                padding: "18px 20px", display: "flex", gap: 12, alignItems: "flex-start",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 999, background: C.emeraldLight, display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Check size={16} color={C.emerald} />
                </div>
                <p style={{ margin: 0, color: C.g800, fontSize: 15, lineHeight: 1.5, fontWeight: 600 }}>{row.good}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .problem-row .bad-card { opacity: 0; transform: translateX(-20px); transition: all .5s ease; }
        .problem-row .good-card { opacity: 0; transform: translateX(20px); transition: all .5s ease .15s; }
        .problem-row.is-visible .bad-card,
        .problem-row.is-visible .good-card { opacity: 1; transform: translateX(0); }
        @media (max-width: 720px) { .problem-row { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

/* ============ HOW IT WORKS ============ */
function HowItWorks() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  return (
    <section style={{ padding: "96px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 56, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)", maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
          {copy.how.title}
        </h2>
        <div className="hiw-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {copy.how.steps.map((s) => (
            <div key={s.number} data-reveal className="reveal" style={{
              padding: 28, borderRadius: 22, background: C.g50, border: `1px solid ${C.g100}`,
              transition: "all .3s ease",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 18, background: C.coral, color: "#fff",
                fontFamily: displayFont, fontWeight: 800, fontSize: 24,
                display: "grid", placeItems: "center", marginBottom: 18,
                boxShadow: `0 10px 24px ${C.coralGlow}`,
              }}>{s.number}</div>
              <h3 style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 20, color: C.black, marginBottom: 10 }}>{s.title}</h3>
              <p style={{ color: C.g600, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 48 }}>
          <StartFreeButton big location="how_it_works" />
        </div>
      </div>
      <style>{`@media (max-width: 820px) { .hiw-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ============ FEATURES (Bento) ============ */
function Features() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  return (
    <section style={{ padding: "96px 20px", background: C.g50 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 data-reveal className="reveal" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 56, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {copy.features.title}
        </h2>
        <div className="bento-grid" style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16,
        }}>
          {copy.features.cards.map((f, i) => (
            <div key={i} data-reveal className="reveal feature-card" style={{
              background: "#fff", borderRadius: 20, padding: 24,
              border: `1px solid ${C.g100}`, transition: "all .25s ease",
              gridColumn: i === 0 ? "span 2" : "span 1",
            }}>
              <div style={{ fontSize: 30, marginBottom: 12 }}>{f.icon}</div>
              <h3 style={{ fontFamily: displayFont, fontWeight: 800, fontSize: 17, color: C.black, marginBottom: 6, lineHeight: 1.25 }}>{f.title}</h3>
              <p style={{ color: C.g600, fontSize: 14, lineHeight: 1.55, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        .feature-card:hover { transform: translateY(-3px); box-shadow: 0 16px 36px rgba(0,0,0,0.06); border-color: ${C.coralLight}; }
        @media (max-width: 980px) { .bento-grid { grid-template-columns: repeat(2, 1fr) !important; } .bento-grid > div { grid-column: span 1 !important; } }
        @media (max-width: 560px) { .bento-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

/* ============ SOCIAL PROOF (testimonials) ============ */
function SocialProof() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  return (
    <section style={{ padding: "96px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <h2 data-reveal className="reveal" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 56, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)", maxWidth: 820, marginLeft: "auto", marginRight: "auto" }}>
          {copy.social.title}
        </h2>
        <div className="testimonial-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {copy.social.testimonials.map((t, i) => (
            <div key={i} data-reveal className="reveal" style={{
              background: C.g50, borderRadius: 20, padding: 22,
              border: `1px solid ${C.g100}`, display: "flex", flexDirection: "column", gap: 14,
            }}>
              <div style={{ display: "flex", gap: 2 }}>
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} size={14} fill="#FFB347" stroke="none" />
                ))}
              </div>
              <p style={{ margin: 0, color: C.g800, fontSize: 14, lineHeight: 1.55, flex: 1, fontStyle: "italic" }}>
                "{t.quote}"
              </p>
              <div>
                <p style={{ margin: 0, fontSize: 13, color: C.black, fontWeight: 700 }}>{t.name} {t.flag}</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: C.g600 }}>{t.props}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @media (max-width: 980px) { .testimonial-grid { grid-template-columns: repeat(2, 1fr) !important; } }
        @media (max-width: 560px) { .testimonial-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}

/* ============ PRICING ============ */
function fmt(currency: Currency, lang: string, amount: number) {
  const localeMap: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE" };
  try {
    return new Intl.NumberFormat(localeMap[lang] ?? "en-US", { style: "currency", currency, minimumFractionDigits: currency === "BRL" ? 2 : 0 }).format(amount);
  } catch {
    const sym = currency === "BRL" ? "R$" : currency === "EUR" ? "€" : currency === "GBP" ? "£" : "$";
    return `${sym} ${amount.toFixed(2)}`;
  }
}

function Pricing() {
  const { lang, currency } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  const proPrice = fmt(currency, lang, PLAN_PRICE.pro[currency]);
  const premiumPrice = fmt(currency, lang, PLAN_PRICE.premium[currency]);

  const plans = [
    { ...copy.pricing.free, price: copy.pricing.free.price, bg: "#fff", border: C.g200, accent: false, ctaBg: C.g100, ctaColor: C.black, signupTo: "/signup" },
    { ...copy.pricing.pro, price: proPrice, bg: "#fff", border: C.coral, accent: true, ctaBg: C.coral, ctaColor: "#fff", signupTo: "/signup?plan=pro" },
    { ...copy.pricing.premium, price: premiumPrice, bg: "#fff", border: C.g200, accent: false, ctaBg: "#111", ctaColor: "#fff", signupTo: "/signup?plan=premium" },
  ];

  return (
    <section style={{ padding: "96px 20px", background: C.g50 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 12, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {copy.pricing.title}
        </h2>
        <p data-reveal className="reveal" style={{ textAlign: "center", color: C.g600, fontSize: 17, marginBottom: 48, maxWidth: 620, marginLeft: "auto", marginRight: "auto" }}>
          {copy.pricing.subtitle}
        </p>
        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, alignItems: "stretch" }}>
          {plans.map((p, i) => (
            <div key={i} data-reveal className="reveal" style={{
              position: "relative", background: p.bg,
              border: p.accent ? `2.5px solid ${C.coral}` : `1.5px solid ${p.border}`,
              borderRadius: 24, padding: "32px 26px",
              transform: p.accent ? "translateY(-8px)" : "none",
              boxShadow: p.accent ? `0 24px 60px ${C.coralGlow}` : `0 4px 16px rgba(0,0,0,0.04)`,
              display: "flex", flexDirection: "column",
            }}>
              {p.accent && (
                <div style={{
                  position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                  background: C.coral, color: "#fff", padding: "6px 14px", borderRadius: 999,
                  fontSize: 11, fontWeight: 800, letterSpacing: 0.5, whiteSpace: "nowrap",
                  boxShadow: `0 8px 20px ${C.coralGlow}`,
                }}>{copy.pricing.popular}</div>
              )}
              <p style={{ fontSize: 11, fontWeight: 800, color: p.accent ? C.coral : C.g600, letterSpacing: 1.2, marginBottom: 8, textTransform: "uppercase", margin: 0 }}>{p.tag}</p>
              <h3 style={{ fontFamily: displayFont, fontSize: 24, fontWeight: 800, color: C.black, margin: "6px 0 14px" }}>{p.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 22 }}>
                <span style={{ fontFamily: displayFont, fontSize: 38, fontWeight: 800, color: C.black, lineHeight: 1 }}>{p.price}</span>
                {p.price !== copy.pricing.free.price && (
                  <span style={{ color: C.g400, fontSize: 14, fontWeight: 600 }}>{copy.pricing.perMo}</span>
                )}
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
                {p.features.map((f) => (
                  <li key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: C.g800, fontSize: 14, lineHeight: 1.45 }}>
                    <Check size={16} color={C.emerald} style={{ marginTop: 3, flexShrink: 0 }} /><span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to={p.signupTo as any}
                data-cta-location={`pricing_${p.name}`}
                onClick={() => trackEvent("pricing_cta", { plan: p.name })}
                style={{
                  display: "block", textAlign: "center", padding: "13px 16px", borderRadius: 999,
                  background: p.ctaBg, color: p.ctaColor, textDecoration: "none",
                  fontWeight: 800, fontSize: 14,
                  boxShadow: p.accent ? `0 10px 24px ${C.coralGlow}` : "none",
                }}
              >{p.cta}</Link>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", marginTop: 32, color: C.g600, fontSize: 13, fontWeight: 600 }}>
          {copy.pricing.micro}
        </p>
      </div>
      <style>{`@media (max-width: 900px) { .pricing-grid { grid-template-columns: 1fr !important; } .pricing-grid > div { transform: none !important; } }`}</style>
    </section>
  );
}

/* ============ FAQ ============ */
function FAQItem({ q, a, open, onClick }: { q: string; a: string; open: boolean; onClick: () => void }) {
  return (
    <div style={{ borderBottom: `1px solid ${C.g100}` }}>
      <button onClick={onClick} style={{
        width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "22px 4px", background: "transparent", border: 0, cursor: "pointer", textAlign: "left", gap: 16,
      }}>
        <span style={{ fontWeight: 700, color: C.g800, fontSize: 16 }}>{q}</span>
        {open ? <Minus size={20} color={C.coral} /> : <Plus size={20} color={C.g600} />}
      </button>
      <div style={{
        maxHeight: open ? 260 : 0, overflow: "hidden",
        transition: "max-height .35s ease, padding .35s ease",
        paddingBottom: open ? 20 : 0,
      }}>
        <p style={{ color: C.g600, fontSize: 15, lineHeight: 1.65, margin: 0 }}>{a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section style={{ padding: "96px 20px", background: "#fff" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 data-reveal className="reveal" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 40, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {copy.faq.title}
        </h2>
        <div data-reveal className="reveal" style={{ background: "#fff", borderRadius: 22, padding: "8px 28px", border: `1px solid ${C.g100}`, boxShadow: "0 4px 16px rgba(0,0,0,0.03)" }}>
          {copy.faq.items.map((it, i) => (
            <FAQItem key={i} q={it.q} a={it.a} open={openIdx === i} onClick={() => setOpenIdx(openIdx === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============ PROGRESS BAR ============ */
function ProgressBar() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  const sectionRef = useRef<HTMLElement>(null);
  const [pct, setPct] = useState(0);
  const [active, setActive] = useState<number>(-1);

  useEffect(() => {
    if (!sectionRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && pct === 0) {
          // animate to 94%
          let i = 0;
          const total = copy.progress.items.length;
          const interval = setInterval(() => {
            i += 1;
            setActive(i - 1);
            setPct(Math.min(94, Math.round((i / total) * 94)));
            if (i >= total) {
              clearInterval(interval);
              setPct(94);
            }
          }, 420);
          io.disconnect();
        }
      });
    }, { threshold: 0.35 });
    io.observe(sectionRef.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section ref={sectionRef} style={{ padding: "96px 20px", background: C.g50 }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h2 data-reveal className="reveal" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 36, letterSpacing: "-0.02em", fontSize: "clamp(28px, 4vw, 44px)" }}>
          {copy.progress.title}
        </h2>

        <div style={{ background: "#fff", borderRadius: 24, padding: "32px 28px", border: `1px solid ${C.g100}`, boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: C.g600, fontWeight: 700 }}>Hostlyb Score</span>
            <span style={{ fontFamily: displayFont, fontSize: 40, fontWeight: 800, color: C.coral, lineHeight: 1 }}>{pct}%</span>
          </div>
          <div style={{ width: "100%", height: 14, borderRadius: 999, background: C.g100, overflow: "hidden" }}>
            <div style={{
              width: `${pct}%`, height: "100%",
              background: `linear-gradient(90deg, ${C.coral}, #FF8E53)`,
              borderRadius: 999, transition: "width .5s ease",
            }} />
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "26px 0 0", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }} className="progress-items">
            {copy.progress.items.map((it, i) => {
              const done = i <= active;
              return (
                <li key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  color: done ? C.g800 : C.g400,
                  fontSize: 14, fontWeight: done ? 700 : 500,
                  transition: "all .3s ease",
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 999,
                    background: done ? C.emerald : C.g200,
                    display: "grid", placeItems: "center", flexShrink: 0,
                    transition: "all .3s ease",
                  }}>
                    {done && <Check size={14} color="#fff" />}
                  </div>
                  <span>{it}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p style={{ textAlign: "center", marginTop: 24, color: C.g600, fontSize: 15, fontStyle: "italic" }}>{copy.progress.copy}</p>
      </div>
      <style>{`@media (max-width: 600px) { .progress-items { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ============ FINAL CTA ============ */
function FinalCTA() {
  const { lang } = useLocale();
  const copy = LANDING_COPY[lang] ?? LANDING_COPY.en;
  return (
    <section style={{ padding: "32px 20px 64px" }}>
      <div data-reveal className="reveal" style={{
        position: "relative", overflow: "hidden",
        maxWidth: 1100, margin: "0 auto", borderRadius: 36,
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
        padding: "80px 32px", textAlign: "center", color: "#fff",
      }}>
        <h2 style={{ fontFamily: displayFont, fontWeight: 800, color: "#fff", margin: "0 0 14px", letterSpacing: "-0.02em", lineHeight: 1.1, fontSize: "clamp(30px, 4.4vw, 48px)" }}>
          {copy.finalCta.title}
        </h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.92)", margin: "0 auto 32px", maxWidth: 560 }}>{copy.finalCta.subtitle}</p>
        <Link
          to={"/signup" as any}
          data-cta-location="final"
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            background: "#fff", color: C.coral, padding: "18px 36px",
            borderRadius: 999, fontWeight: 800, fontSize: 17,
            boxShadow: "0 16px 40px rgba(0,0,0,0.22)",
            textDecoration: "none",
          }}
        >
          {copy.finalCta.cta}
        </Link>
        <p style={{ marginTop: 24, color: "rgba(255,255,255,0.85)", fontSize: 13, display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", fontWeight: 600 }}>
          {copy.finalCta.micro}
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ background: C.black, color: C.g300, padding: "48px 20px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20, alignItems: "center", textAlign: "center" }}>
        <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontSize: 22, fontWeight: 800, color: "#fff", textDecoration: "none" }}>
          <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: C.coralLight }}>
            <HomeIcon size={18} color={C.coral} />
          </span>
          Host<span style={{ color: C.coral }}>lyb</span>
        </Link>
        <LanguageSelector />
        <p style={{ fontSize: 13, color: C.g400, margin: 0 }}>© 2026 Hostlyb. All rights reserved.</p>
      </div>
    </footer>
  );
}

export { META_BY_LANG, LANGS, BASE_URL, OG_IMAGE, JSON_LD, FAQ_ITEMS_SEO };
export function LandingPage() {
  useReveal();
  useAnalytics();
  return (
    <div style={{ background: "#fff", color: C.g800, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(12px); transition: opacity .6s ease, transform .6s ease; }
        [data-reveal].is-visible { opacity: 1; transform: translateY(0); }
        .btn-coral:hover { transform: translateY(-2px); filter: brightness(1.04); }
        html { scroll-behavior: smooth; }
      `}</style>
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Features />
      <SocialProof />
      <Pricing />
      <FAQ />
      <ProgressBar />
      <FinalCTA />
      <Footer />
    </div>
  );
}
