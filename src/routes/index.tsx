import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Home as HomeIcon, Sparkles, Users, Calendar, BarChart3, MapPin,
  Check, X, Play, ArrowRight, Star, Menu, Plus, Minus,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hostly — Gestão de Airbnb Simplificada" },
      { name: "description", content: "Controle limpezas, hóspedes e profissionais dos seus imóveis no Airbnb. Checklist digital, calendário integrado e muito mais. A partir de R$ 29/mês." },
      { name: "theme-color", content: "#FF6B6B" },
      { property: "og:title", content: "Hostly — Gestão de Airbnb Simplificada" },
      { property: "og:description", content: "Pare de gerenciar pelo WhatsApp. O Hostly centraliza tudo: limpezas, hóspedes, equipe e calendário. 14 dias grátis." },
    ],
  }),
  component: LandingPage,
});

/* ---------- Color tokens ---------- */
const C = {
  coral: "#FF6B6B",
  coralDark: "#E85555",
  coralLight: "#FF6B6B18",
  coralGlow: "#FF6B6B40",
  white: "#FFFFFF",
  offWhite: "#FAFAFA",
  g50: "#F7F7F7",
  g100: "#EFEFEF",
  g200: "#E0E0E0",
  g300: "#CFCFCF",
  g400: "#9E9E9E",
  g600: "#616161",
  g800: "#212121",
  black: "#111111",
  emerald: "#00C896",
};

const sansFont = `'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif`;
const displayFont = `'Bricolage Grotesque', 'Plus Jakarta Sans', sans-serif`;

/* ---------- Reveal hook ---------- */
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
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useScrolled(threshold = 80) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/* ---------- Reusable bits ---------- */
function CoralButton({
  children, href, big, asLink, onClick,
}: { children: React.ReactNode; href?: string; big?: boolean; asLink?: boolean; onClick?: () => void }) {
  const style: React.CSSProperties = {
    background: C.coral,
    color: "#fff",
    borderRadius: 999,
    padding: big ? "16px 36px" : "10px 24px",
    fontWeight: 700,
    fontSize: big ? 16 : 14,
    boxShadow: big ? `0 8px 32px ${C.coralGlow}` : `0 4px 20px ${C.coralGlow}`,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    transition: "all .2s ease",
    cursor: "pointer",
    border: 0,
  };
  const cls = "btn-coral";
  if (asLink && href) {
    return <Link to={href as any} className={cls} style={style}>{children}</Link>;
  }
  if (href) {
    return <a href={href} className={cls} style={style}>{children}</a>;
  }
  return <button onClick={onClick} className={cls} style={style}>{children}</button>;
}

/* ---------- Sections ---------- */

function Navbar() {
  const scrolled = useScrolled(40);
  const [open, setOpen] = useState(false);
  return (
    <header
      style={{
        position: "sticky", top: 0, zIndex: 50, height: 72,
        background: scrolled ? "rgba(255,255,255,0.85)" : "#fff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? `0 1px 0 ${C.g100}` : "none",
        transition: "all .2s ease",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="#top" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontSize: 24, fontWeight: 700, color: C.black }}>
          <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: C.coralLight }}>
            <HomeIcon size={18} color={C.coral} />
          </span>
          Host<span style={{ color: C.coral }}>ly</span>
        </a>

        <nav className="nav-desktop" style={{ display: "flex", gap: 32 }}>
          {[["Funcionalidades", "#features"], ["Preços", "#precos"], ["FAQ", "#faq"]].map(([label, href]) => (
            <a key={href} href={href} className="nav-link" style={{ color: C.g600, fontSize: 14, fontWeight: 500 }}>
              {label}
            </a>
          ))}
        </nav>

        <div className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to={"/app" as any} style={{ color: C.g800, fontSize: 14, fontWeight: 600, padding: "10px 18px", borderRadius: 999, border: `1px solid ${C.g200}` }}>
            Entrar
          </Link>
          <CoralButton href="/signup">Começar grátis <ArrowRight size={16} /></CoralButton>
        </div>

        <button
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
          className="nav-mobile-btn"
          style={{ display: "none", background: "transparent", border: 0, color: C.g800 }}
        >
          <Menu size={24} />
        </button>
      </div>

      {open && (
        <div className="nav-mobile-drawer" style={{ borderTop: `1px solid ${C.g100}`, background: "#fff", padding: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[["Funcionalidades", "#features"], ["Preços", "#precos"], ["FAQ", "#faq"]].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setOpen(false)} style={{ color: C.g800, padding: "12px 8px", fontWeight: 600 }}>
                {label}
              </a>
            ))}
            <Link to={"/app" as any} onClick={() => setOpen(false)} style={{ color: C.g800, padding: "12px 8px", fontWeight: 600 }}>
              Entrar
            </Link>
            <CoralButton href="/signup">Começar grátis <ArrowRight size={16} /></CoralButton>
          </div>
        </div>
      )}
    </header>
  );
}

function HeroAppMock() {
  return (
    <div
      style={{
        background: "#fff",
        border: `1px solid ${C.g100}`,
        borderRadius: 24,
        boxShadow: "0 40px 80px rgba(0,0,0,0.12)",
        padding: 24,
        maxWidth: 880,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ color: C.g400, fontSize: 13 }}>Bem-vinda de volta 👋</p>
          <h3 style={{ fontFamily: displayFont, fontSize: 22, fontWeight: 800, color: C.black }}>Dashboard</h3>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[C.coral, C.emerald, "#FFB347"].map((c, i) => <span key={i} style={{ width: 8, height: 8, borderRadius: 999, background: c }} />)}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {[
          { label: "Receita do mês", value: "R$ 20.500", color: C.coral },
          { label: "Imóveis ativos", value: "3", color: "#4A9EFF" },
          { label: "Avaliação média", value: "4.9 ★", color: "#FFB347" },
          { label: "Hóspedes no mês", value: "12", color: C.emerald },
        ].map((k) => (
          <div key={k.label} style={{ border: `1px solid ${C.g100}`, borderRadius: 14, padding: 14 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: k.color + "22", marginBottom: 10 }} />
            <div style={{ fontWeight: 800, fontSize: 18, color: C.black }}>{k.value}</div>
            <div style={{ fontSize: 12, color: C.g400 }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: C.black }}>Próximas limpezas</p>
          <span style={{ fontSize: 12, color: C.g400 }}>Ver todas</span>
        </div>
        {[
          { who: "Ana", what: "Studio Ipanema", when: "Hoje · 11:00", tone: "warning" },
          { who: "Mariana", what: "Apt Jardins 201", when: "Amanhã · 10:00", tone: "info" },
        ].map((row) => (
          <div key={row.what} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, border: `1px solid ${C.g100}`, borderRadius: 12, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 999, background: row.tone === "warning" ? "#FFB34722" : "#4A9EFF22", display: "grid", placeItems: "center", color: row.tone === "warning" ? "#B97A1F" : "#1F66B9", fontWeight: 800, fontSize: 14 }}>
              {row.who[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: C.black }}>{row.what}</div>
              <div style={{ fontSize: 12, color: C.g400 }}>{row.who}</div>
            </div>
            <div style={{ fontSize: 12, color: C.g600, fontWeight: 600 }}>{row.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="top" style={{ padding: "64px 24px 80px", background: "#fff" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", textAlign: "center" }}>
        <span data-reveal className="reveal" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999, background: C.coralLight, color: C.coral, fontSize: 13, fontWeight: 600 }}>
          ✦ Gestão de Airbnb simplificada
        </span>

        <h1
          data-reveal
          className="reveal"
          style={{ fontFamily: displayFont, fontWeight: 800, color: C.black, lineHeight: 1.05, margin: "24px auto 20px", letterSpacing: "-0.02em" }}
        >
          <span className="hero-h1">
            Chega de{" "}
            <span style={{ position: "relative", color: C.coral, whiteSpace: "nowrap" }}>
              caos
              <svg viewBox="0 0 120 12" preserveAspectRatio="none" style={{ position: "absolute", left: 0, right: 0, bottom: -8, width: "100%", height: 12 }}>
                <path d="M2 8 Q 30 -2, 60 6 T 118 4" fill="none" stroke={C.coral} strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>{" "}
            na
            <br />
            gestão do seu Airbnb.
          </span>
        </h1>

        <p data-reveal className="reveal" style={{ fontSize: 20, color: C.g600, maxWidth: 540, margin: "0 auto 32px", lineHeight: 1.6 }}>
          Controle limpezas, hóspedes e profissionais num só lugar.
          De R$ 29/mês — menos que uma diária.
        </p>

        <div data-reveal className="reveal" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <CoralButton big href="/signup">Começar 14 dias grátis <ArrowRight size={18} /></CoralButton>
          <a href="#features" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "16px 24px", color: C.g800, fontWeight: 600, fontSize: 16 }}>
            <Play size={18} /> Ver como funciona
          </a>
        </div>

        <p data-reveal className="reveal" style={{ marginTop: 20, color: C.g400, fontSize: 13, display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          <span>✓ Sem cartão de crédito</span>
          <span>✓ Cancele quando quiser</span>
          <span>✓ Setup em 5 minutos</span>
        </p>

        <div data-reveal className="reveal hero-mock" style={{ marginTop: 64 }}>
          <HeroAppMock />
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  const initials = ["MS", "JT", "SL", "RG", "AC"];
  const colors = [C.coral, "#4A9EFF", C.emerald, "#FFB347", "#A78BFA"];
  return (
    <section style={{ background: C.g50, padding: "32px 24px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
        <p style={{ color: C.g400, fontSize: 13, marginBottom: 16 }}>
          Usado por mais de 2.400 anfitriões no Brasil, EUA e Europa
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex" }}>
            {initials.map((ini, i) => (
              <div key={ini} style={{
                width: 36, height: 36, borderRadius: 999, background: colors[i],
                color: "#fff", fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center",
                marginLeft: i === 0 ? 0 : -10, border: "2px solid #fff",
              }}>{ini}</div>
            ))}
          </div>
          <p style={{ color: C.g600, fontSize: 14, fontWeight: 600 }}>★★★★★ 4.9 de 847 avaliações</p>
        </div>
      </div>
    </section>
  );
}

function ProblemSolution() {
  const before = [
    "WhatsApp para avisar a faxineira",
    "Planilha de Excel para controlar hóspedes",
    "Esquece check-out e perde avaliação",
    "Não sabe se a limpeza foi feita",
    "Perde tempo com cada imóvel",
  ];
  const after = [
    "Faxineira recebe checklist automático",
    "Dashboard de todos os imóveis em tempo real",
    "Alertas de checkout com 24h de antecedência",
    "Fotos de comprovação da limpeza",
    "Tudo no celular, em 2 minutos por dia",
  ];
  return (
    <section style={{ background: "#fff", padding: "96px 24px" }}>
      <div className="ps-grid" style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gap: 24, gridTemplateColumns: "1fr 1fr" }}>
        <div data-reveal className="reveal" style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 24, padding: 32 }}>
          <p style={{ color: C.g400, fontWeight: 700, marginBottom: 18 }}>😓 Antes</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {before.map((b) => (
              <li key={b} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: C.g600 }}>
                <X size={18} color="#D14545" style={{ marginTop: 2, flexShrink: 0 }} /> <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="reveal" style={{ background: "#fff", border: `2px solid ${C.coral}`, borderRadius: 24, padding: 32, boxShadow: `0 20px 60px ${C.coralGlow}` }}>
          <p style={{ color: C.coral, fontWeight: 700, marginBottom: 18 }}>✨ Com Hostly</p>
          <ul style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {after.map((a) => (
              <li key={a} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: C.g800 }}>
                <Check size={18} color={C.emerald} style={{ marginTop: 2, flexShrink: 0 }} /> <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    { icon: "🧹", title: "Gestão de Limpezas", desc: "Agende, acompanhe e valide cada limpeza com checklist por cômodo e foto de comprovação." },
    { icon: "🏠", title: "Cadastro de Imóveis", desc: "Endereço com link direto para Waze, Google Maps e Apple Maps. Um toque para navegar." },
    { icon: "👷", title: "Profissionais Vinculados", desc: "Cadastre sua equipe de limpeza, histórico de serviços e pagamentos. Tudo organizado." },
    { icon: "📅", title: "Calendário Integrado", desc: "Sincronize com Google Calendar. Visualize check-ins, checkouts e limpezas num só lugar." },
    { icon: "👥", title: "Controle de Hóspedes", desc: "Histórico completo, avaliações e alertas. Saiba tudo sobre quem está no seu imóvel." },
    { icon: "📊", title: "Dashboard Inteligente", desc: "KPIs em tempo real: receita, ocupação, avaliação média e alertas prioritários." },
  ];
  return (
    <section id="features" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, lineHeight: 1.1, marginBottom: 56, letterSpacing: "-0.02em" }}>
          Tudo que você precisa,<br />nada que você não precisa.
        </h2>
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
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

function HowItWorks() {
  const steps = [
    { n: "①", title: "Cadastre seus imóveis", sub: "e adicione endereço", desc: "Adicione fotos, detalhes e links de navegação." },
    { n: "②", title: "Conecte sua equipe", sub: "de limpeza", desc: "Cadastre as faxineiras e vincule a cada propriedade." },
    { n: "③", title: "Gerencie tudo", sub: "pelo celular", desc: "Dashboard com status em tempo real de todos os seus imóveis." },
  ];
  return (
    <section style={{ background: C.offWhite, padding: "96px 24px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 64, letterSpacing: "-0.02em" }}>
          Em 3 passos simples.
        </h2>
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 32, position: "relative" }}>
          {steps.map((s) => (
            <div key={s.n} data-reveal className="reveal" style={{ textAlign: "center" }}>
              <div style={{ fontFamily: displayFont, fontSize: 56, color: C.coral, fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>{s.n}</div>
              <h3 style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 22, color: C.black }}>{s.title}</h3>
              <p style={{ color: C.g600, fontSize: 16, marginTop: 4 }}>{s.sub}</p>
              <p style={{ color: C.g400, fontSize: 14, marginTop: 12, maxWidth: 260, margin: "12px auto 0", lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
type Country = "BR" | "US" | "EU";
type Period = "monthly" | "yearly";

const pricingData: Record<Country, {
  flag: string; label: string; currency: string; suffix: string;
  popularLabel: string; ctaLabel: string;
  plans: { name: string; price: number; yearlyPrice: number; properties: string; popular?: boolean; features: { ok: boolean; label: string }[] }[];
}> = {
  BR: {
    flag: "🇧🇷", label: "Brasil", currency: "R$", suffix: "/mês",
    popularLabel: "Mais Popular", ctaLabel: "Começar grátis",
    plans: [
      { name: "Starter", price: 29, yearlyPrice: 23, properties: "1 imóvel", features: [
        { ok: true, label: "Checklist limpeza" }, { ok: true, label: "1 profissional" },
        { ok: true, label: "Calendário básico" }, { ok: true, label: "App mobile" },
        { ok: false, label: "Fotos comprovação" }, { ok: false, label: "Alertas automáticos" },
      ]},
      { name: "Essencial", price: 59, yearlyPrice: 47, properties: "até 3 imóveis", popular: true, features: [
        { ok: true, label: "Tudo do Starter" }, { ok: true, label: "3 profissionais" },
        { ok: true, label: "Google Calendar" }, { ok: true, label: "App mobile" },
        { ok: true, label: "Fotos comprovação" }, { ok: true, label: "Alertas automáticos" },
      ]},
      { name: "Pro", price: 99, yearlyPrice: 79, properties: "até 8 imóveis", features: [
        { ok: true, label: "Tudo do Essencial" }, { ok: true, label: "Profissionais ilimitados" },
        { ok: true, label: "Relatórios avançados" }, { ok: true, label: "Exportação PDF" },
        { ok: true, label: "Suporte prioritário" }, { ok: true, label: "App mobile" },
      ]},
    ],
  },
  US: {
    flag: "🇺🇸", label: "Estados Unidos", currency: "$", suffix: "/mo",
    popularLabel: "Most Popular", ctaLabel: "Start free",
    plans: [
      { name: "Starter", price: 7.99, yearlyPrice: 6.39, properties: "1 property", features: [
        { ok: true, label: "Cleaning checklist" }, { ok: true, label: "1 cleaner" },
        { ok: true, label: "Basic calendar" }, { ok: true, label: "Mobile app" },
        { ok: false, label: "Confirmation photos" }, { ok: false, label: "Auto alerts" },
      ]},
      { name: "Essential", price: 14.99, yearlyPrice: 11.99, properties: "up to 3 properties", popular: true, features: [
        { ok: true, label: "Everything in Starter" }, { ok: true, label: "3 cleaners" },
        { ok: true, label: "Google Calendar" }, { ok: true, label: "Mobile app" },
        { ok: true, label: "Confirmation photos" }, { ok: true, label: "Auto alerts" },
      ]},
      { name: "Pro", price: 24.99, yearlyPrice: 19.99, properties: "up to 8 properties", features: [
        { ok: true, label: "Everything in Essential" }, { ok: true, label: "Unlimited cleaners" },
        { ok: true, label: "Advanced reports" }, { ok: true, label: "PDF export" },
        { ok: true, label: "Priority support" }, { ok: true, label: "Mobile app" },
      ]},
    ],
  },
  EU: {
    flag: "🇪🇺", label: "Europa", currency: "€", suffix: "/mo",
    popularLabel: "Most Popular", ctaLabel: "Start free",
    plans: [
      { name: "Starter", price: 6.99, yearlyPrice: 5.59, properties: "1 property", features: [
        { ok: true, label: "Cleaning checklist" }, { ok: true, label: "1 cleaner" },
        { ok: true, label: "Basic calendar" }, { ok: true, label: "Mobile app" },
        { ok: false, label: "Confirmation photos" }, { ok: false, label: "Auto alerts" },
      ]},
      { name: "Essential", price: 12.99, yearlyPrice: 10.39, properties: "up to 3 properties", popular: true, features: [
        { ok: true, label: "Everything in Starter" }, { ok: true, label: "3 cleaners" },
        { ok: true, label: "Google Calendar" }, { ok: true, label: "Mobile app" },
        { ok: true, label: "Confirmation photos" }, { ok: true, label: "Auto alerts" },
      ]},
      { name: "Pro", price: 21.99, yearlyPrice: 17.59, properties: "up to 8 properties", features: [
        { ok: true, label: "Everything in Essential" }, { ok: true, label: "Unlimited cleaners" },
        { ok: true, label: "Advanced reports" }, { ok: true, label: "PDF export" },
        { ok: true, label: "Priority support" }, { ok: true, label: "Mobile app" },
      ]},
    ],
  },
};

function fmtPrice(currency: string, n: number) {
  if (currency === "R$") return `R$ ${n}`;
  if (currency === "$") return `$${n.toFixed(2)}`;
  return `€${n.toFixed(2)}`;
}

function Pricing() {
  const [country, setCountry] = useState<Country>("BR");
  const [period, setPeriod] = useState<Period>("monthly");
  const data = pricingData[country];

  return (
    <section id="precos" style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 16, letterSpacing: "-0.02em" }}>
          Preço honesto.<br />Sem surpresas.
        </h2>
        <p data-reveal className="reveal" style={{ textAlign: "center", color: C.g600, fontSize: 18, marginBottom: 40 }}>
          Escolha o seu país e veja quanto custa menos que uma diária.
        </p>

        {/* Country tabs */}
        <div data-reveal className="reveal" style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
          {(Object.keys(pricingData) as Country[]).map((c) => {
            const active = country === c;
            return (
              <button key={c} onClick={() => setCountry(c)} style={{
                padding: "10px 18px", borderRadius: 999, border: 0, cursor: "pointer",
                background: active ? C.coral : C.g100,
                color: active ? "#fff" : C.g600,
                fontWeight: 600, fontSize: 14, transition: "all .2s ease",
              }}>
                {pricingData[c].flag} {pricingData[c].label}
              </button>
            );
          })}
        </div>

        {/* Period toggle */}
        <div data-reveal className="reveal" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <button onClick={() => setPeriod("monthly")} style={{
            padding: "8px 18px", borderRadius: 999, border: `1px solid ${C.g200}`, cursor: "pointer",
            background: period === "monthly" ? C.black : "#fff", color: period === "monthly" ? "#fff" : C.g600, fontWeight: 600, fontSize: 13,
          }}>Mensal</button>
          <button onClick={() => setPeriod("yearly")} style={{
            padding: "8px 18px", borderRadius: 999, border: `1px solid ${C.g200}`, cursor: "pointer",
            background: period === "yearly" ? C.black : "#fff", color: period === "yearly" ? "#fff" : C.g600, fontWeight: 600, fontSize: 13,
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            Anual
            <span style={{ background: C.emerald + "22", color: C.emerald, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>20% off</span>
          </button>
        </div>

        {/* Plans */}
        <div className="pricing-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, alignItems: "stretch" }}>
          {data.plans.map((p) => {
            const price = period === "monthly" ? p.price : p.yearlyPrice;
            return (
              <div key={p.name} data-reveal className="reveal" style={{
                position: "relative", background: "#fff", borderRadius: 24, padding: 32,
                border: p.popular ? `2px solid ${C.coral}` : `1px solid ${C.g200}`,
                boxShadow: p.popular ? `0 20px 60px ${C.coralGlow}` : "none",
                transform: p.popular ? "scale(1.04)" : "none",
                display: "flex", flexDirection: "column",
              }}>
                {p.popular && (
                  <div style={{
                    position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                    background: C.coral, color: "#fff", padding: "4px 14px", borderRadius: 999,
                    fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
                  }}>
                    {data.popularLabel}
                  </div>
                )}
                <p style={{ color: C.g400, fontWeight: 700, fontSize: 12, letterSpacing: 1, textTransform: "uppercase" }}>{p.name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginTop: 14 }}>
                  <span style={{ fontFamily: displayFont, fontSize: 44, fontWeight: 800, color: C.black }}>
                    {fmtPrice(data.currency, price)}
                  </span>
                  <span style={{ color: C.g400, fontSize: 14 }}>{data.suffix}</span>
                </div>
                {period === "yearly" && (
                  <p style={{ color: C.emerald, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                    Economize 20% no anual
                  </p>
                )}
                <p style={{ color: C.g600, marginTop: 8, fontWeight: 600 }}>{p.properties}</p>

                <ul style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {p.features.map((f) => (
                    <li key={f.label} style={{ display: "flex", gap: 10, alignItems: "flex-start", color: f.ok ? C.g800 : C.g300, fontSize: 14 }}>
                      {f.ok
                        ? <Check size={16} color={C.emerald} style={{ marginTop: 3, flexShrink: 0 }} />
                        : <X size={16} color={C.g300} style={{ marginTop: 3, flexShrink: 0 }} />}
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: 24 }}>
                  <CoralButton href="/signup">{data.ctaLabel}</CoralButton>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ textAlign: "center", color: C.g400, fontSize: 13, marginTop: 32, display: "flex", gap: 18, justifyContent: "center", flexWrap: "wrap" }}>
          <span>✓ 14 dias grátis</span>
          <span>✓ Sem cartão de crédito</span>
          <span>✓ Cancele quando quiser</span>
        </p>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { stars: 5, text: "Antes eu controlava tudo por WhatsApp e planilha. Agora em 5 minutos já sei o status de todos os imóveis. Não consigo mais imaginar sem o Hostly.", name: "Mariana S.", meta: "4 imóveis · São Paulo", color: C.coral, ini: "MS" },
    { stars: 5, text: "The cleaning checklist feature is a game changer. My cleaner completes it on her phone and I get the confirmation photos instantly. Worth every penny.", name: "James T.", meta: "2 properties · Miami, FL", color: "#4A9EFF", ini: "JT" },
    { stars: 5, text: "J'ai essayé Guesty et Hostfully mais c'était trop cher pour 2 appartements. Hostly fait tout ce dont j'ai besoin à un prix imbattable.", name: "Sophie L.", meta: "2 propriétés · Paris", color: C.emerald, ini: "SL" },
  ];
  return (
    <section style={{ padding: "96px 24px", background: "#fff" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 56, letterSpacing: "-0.02em" }}>
          O que os anfitriões dizem.
        </h2>
        <div className="testi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {items.map((t) => (
            <div key={t.name} data-reveal className="reveal" style={{
              border: `1px solid ${C.g100}`, borderRadius: 20, padding: 28, background: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}>
              <div style={{ display: "flex", gap: 2, color: "#FFB347", marginBottom: 14 }}>
                {Array.from({ length: t.stars }).map((_, i) => <Star key={i} size={16} fill="#FFB347" stroke="none" />)}
              </div>
              <p style={{ color: C.g800, fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 999, background: t.color, color: "#fff", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14 }}>{t.ini}</div>
                <div>
                  <p style={{ fontWeight: 700, color: C.g800, fontSize: 14 }}>{t.name}</p>
                  <p style={{ color: C.g400, fontSize: 12 }}>{t.meta}</p>
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
      <div style={{
        maxHeight: open ? 240 : 0, overflow: "hidden",
        transition: "max-height .3s ease, padding .3s ease",
        paddingBottom: open ? 20 : 0,
      }}>
        <p style={{ color: C.g600, fontSize: 15, lineHeight: 1.6 }}>{a}</p>
      </div>
    </div>
  );
}

function FAQ() {
  const items = [
    { q: "Preciso de cartão de crédito para testar?", a: "Não. Os 14 dias são completamente gratuitos, sem precisar inserir dados de pagamento." },
    { q: "Funciona para Booking.com também?", a: "O Hostly gerencia a operação do seu imóvel (limpeza, hóspedes, equipe). A integração com Airbnb e Booking para reservas está no roadmap." },
    { q: "Posso cancelar quando quiser?", a: "Sim. Sem contrato, sem fidelidade. Cancele com 1 clique nas configurações." },
    { q: "Tem aplicativo para a faxineira também?", a: "Sim. A profissional recebe um link de acesso com o checklist do dia, sem precisar baixar nada." },
    { q: "E se eu tiver mais de 8 imóveis?", a: "Entre em contato conosco para um plano personalizado." },
  ];
  return (
    <section id="faq" style={{ padding: "96px 24px", background: C.g50 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <h2 data-reveal className="reveal section-title" style={{ fontFamily: displayFont, textAlign: "center", color: C.black, fontWeight: 800, marginBottom: 40, letterSpacing: "-0.02em" }}>
          Perguntas frequentes.
        </h2>
        <div data-reveal className="reveal" style={{ background: "#fff", borderRadius: 20, padding: "8px 24px", border: `1px solid ${C.g100}` }}>
          {items.map((it) => <FAQItem key={it.q} {...it} />)}
        </div>
      </div>
    </section>
  );
}

function CTABanner() {
  return (
    <section style={{ padding: "32px 24px" }}>
      <div data-reveal className="reveal" style={{
        position: "relative", overflow: "hidden",
        maxWidth: 1100, margin: "0 auto", borderRadius: 32,
        background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
        padding: "80px 32px", textAlign: "center", color: "#fff",
      }}>
        <span style={{ position: "absolute", top: -60, left: -60, width: 220, height: 220, borderRadius: 999, background: "rgba(255,255,255,0.1)" }} />
        <span style={{ position: "absolute", bottom: -80, right: -40, width: 280, height: 280, borderRadius: 999, background: "rgba(255,255,255,0.08)" }} />
        <h2 className="section-title" style={{ fontFamily: displayFont, fontWeight: 800, color: "#fff", marginBottom: 14, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          Comece a gerenciar como um profissional.
        </h2>
        <p style={{ fontSize: 20, color: "rgba(255,255,255,0.85)", marginBottom: 32 }}>
          14 dias grátis. Sem cartão. Sem complicação.
        </p>
        <a href="/signup" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#fff", color: C.coral, padding: "16px 32px",
          borderRadius: 999, fontWeight: 800, fontSize: 16,
          boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
        }}>
          Criar minha conta grátis <ArrowRight size={18} />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const cols = [
    { title: "Produto", links: ["Funcionalidades", "Preços", "Changelog", "Roadmap"] },
    { title: "Empresa", links: ["Sobre nós", "Blog", "Contato"] },
    { title: "Legal", links: ["Termos de uso", "Privacidade", "Cookies"] },
  ];
  return (
    <footer style={{ background: C.black, color: C.g400, padding: "64px 24px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>
          <div>
            <a href="#top" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: displayFont, fontSize: 24, fontWeight: 700, color: "#fff" }}>
              <span style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, background: C.coralLight }}>
                <HomeIcon size={18} color={C.coral} />
              </span>
              Host<span style={{ color: C.coral }}>ly</span>
            </a>
            <p style={{ marginTop: 16, maxWidth: 280, fontSize: 14, lineHeight: 1.6 }}>
              Gestão inteligente para anfitriões.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <p style={{ color: "#fff", fontWeight: 700, marginBottom: 14, fontSize: 14 }}>{col.title}</p>
              <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {col.links.map((l) => (
                  <li key={l}><a href="#" style={{ color: C.g400, fontSize: 14 }}>{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48, paddingTop: 24, borderTop: "1px solid #2a2a2a", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13 }}>© 2025 Hostly. Feito para anfitriões de verdade.</p>
          <p style={{ fontSize: 18 }}>🇧🇷 🇺🇸 🇪🇺</p>
        </div>
      </div>
    </footer>
  );
}

/* ---------- Page ---------- */
function LandingPage() {
  useReveal();
  return (
    <div style={{ background: "#fff", color: C.g800, fontFamily: sansFont, scrollBehavior: "smooth" as any, minHeight: "100vh" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        .nav-link { transition: color .15s ease; position: relative; }
        .nav-link:hover { color: ${C.coral}; }
        .nav-link::after { content: ''; position: absolute; left: 0; right: 0; bottom: -6px; height: 2px; background: ${C.coral}; transform: scaleX(0); transform-origin: left; transition: transform .2s ease; }
        .nav-link:hover::after { transform: scaleX(1); }

        .btn-coral:hover { background: ${C.coralDark} !important; transform: translateY(-2px); box-shadow: 0 10px 36px ${C.coralGlow} !important; }

        .reveal { opacity: 0; transform: translateY(24px); transition: opacity .7s cubic-bezier(0.16, 1, 0.3, 1), transform .7s cubic-bezier(0.16, 1, 0.3, 1); }
        .reveal.is-visible { opacity: 1; transform: translateY(0); }

        .feature-card:hover { transform: translateY(-4px); border-color: ${C.coral} !important; box-shadow: 0 12px 40px ${C.coralGlow}; }

        .hero-h1 { font-size: 76px; }
        .section-title { font-size: 48px; }

        @media (max-width: 900px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: inline-flex !important; }
          .features-grid, .testi-grid, .steps-grid, .pricing-grid, .ps-grid, .footer-grid {
            grid-template-columns: 1fr !important;
          }
          .pricing-grid > * { transform: none !important; }
          .hero-h1 { font-size: 40px !important; }
          .section-title { font-size: 32px !important; }
        }

        @media (min-width: 901px) and (max-width: 1199px) {
          .features-grid, .testi-grid { grid-template-columns: repeat(2, 1fr) !important; }
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
