import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Bell, Camera, Sparkles } from "lucide-react";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useT } from "@/lib/i18n";
import { initAnalytics, initScrollDepth, trackEvent } from "@/lib/analytics";
import { buildLandingHead } from "@/lib/landing-head";
import phoneVideo from "@/assets/phone-relax.mp4.asset.json";
import phoneVideoWebm from "@/assets/phone-relax.webm.asset.json";
import forgottenPhone from "@/assets/forgotten-phone.jpg";
import forgottenKeys from "@/assets/forgotten-keys.jpg";
import forgottenToy from "@/assets/forgotten-toy.jpg";
import forgottenWallet from "@/assets/forgotten-wallet.jpg";
import heroPoster from "@/assets/hero-poster.jpg";

const FORGOTTEN_ITEMS: Array<{ src: string; key: string }> = [
  { src: forgottenPhone, key: "landing.forgotten.phone" },
  { src: forgottenKeys, key: "landing.forgotten.keys" },
  { src: forgottenToy, key: "landing.forgotten.toy" },
  { src: forgottenWallet, key: "landing.forgotten.wallet" },
];

const FAQ_ITEMS_SEO = [
  { q: "Preciso de cartão de crédito para começar?", a: "Não. 14 dias grátis e sem cartão.", qKey: "landing.faq.noCard.q", aKey: "landing.faq.noCard.a" },
  { q: "A faxineira precisa de app?", a: "Não. Recebe um link único e acede pelo navegador.", qKey: "landing.faq.cleanerApp.q", aKey: "landing.faq.cleanerApp.a" },
  { q: "Posso cancelar quando quiser?", a: "Sim, sem contrato e sem multa.", qKey: "landing.faq.cancel.q", aKey: "landing.faq.cancel.a" },
];

const BASE_URL = "https://www.hostlyb.com";
const OG_IMAGE = `${BASE_URL}/og-cover.jpg`;

export const Route = createFileRoute("/")({
  head: () => buildLandingHead("pt"),
  component: LandingPage,
});

/* ============================================================
   Cinematic Landing
   ============================================================ */

const display = `'Bricolage Grotesque', 'Plus Jakarta Sans', system-ui, sans-serif`;

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
      { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCountUp(end: number, duration = 1600) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / duration);
              setVal(Math.round(end * (1 - Math.pow(1 - p, 3))));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
            io.disconnect();
          }
        });
      },
      { threshold: 0.5 }
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [end, duration]);
  return { val, ref };
}

export function LandingPage() {
  useReveal();
  const t = useT();
  useEffect(() => {
    initAnalytics();
    initScrollDepth();
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Hostlyb",
        description: t("hero.subtitle"),
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, iOS, Android",
        url: BASE_URL,
        image: OG_IMAGE,
        offers: [{ "@type": "Offer", price: "24.99", priceCurrency: "EUR", url: `${BASE_URL}/signup` }],
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "2400", bestRating: "5", worstRating: "1" },
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS_SEO.map((it) => ({
          "@type": "Question",
          name: t(it.qKey),
          acceptedAnswer: { "@type": "Answer", text: t(it.aKey) },
        })),
      },
    ],
  };

  return (
    <>
      <style>{cinematicCSS}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Fixed nav */}
      <nav className="cine-nav">
        <Link to="/" className="cine-logo">HOSTLYB</Link>
        <div className="cine-nav-right">
          <LanguageSelector />
          <Link to="/login" className="cine-nav-link">{t("nav.signin")}</Link>
          <Link to="/signup" className="cine-btn-ghost" data-cta-location="nav">{t("nav.cta")}</Link>
        </div>
      </nav>

      <main className="cine-main">
        <HeroSection />
        <ArrivalSection />
        <CheckoutSection />
        <CleaningSection />
        <TranquilitySection />
        <CtaSection />
      </main>
    </>
  );
}

/* ---------------- Section 1: HERO with video ---------------- */
function HeroSection() {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    (v as any).playsInline = true;
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");
    let failTimer: number | undefined;
    const tryPlay = () =>
      v.play().then(() => setVideoFailed(false)).catch(() => {
        failTimer = window.setTimeout(() => {
          if (v.paused || v.readyState < 2) setVideoFailed(true);
        }, 1500);
      });
    tryPlay();
    const onErr = () => setVideoFailed(true);
    const onPlaying = () => setVideoFailed(false);
    v.addEventListener("error", onErr);
    v.addEventListener("stalled", onErr);
    v.addEventListener("playing", onPlaying);
    const onVis = () => { if (!document.hidden) tryPlay(); };
    const onTouch = () => { tryPlay(); document.removeEventListener("touchstart", onTouch); document.removeEventListener("click", onTouch); };
    document.addEventListener("visibilitychange", onVis);
    document.addEventListener("touchstart", onTouch, { once: true, passive: true });
    document.addEventListener("click", onTouch, { once: true });
    return () => {
      if (failTimer) clearTimeout(failTimer);
      v.removeEventListener("error", onErr);
      v.removeEventListener("stalled", onErr);
      v.removeEventListener("playing", onPlaying);
      document.removeEventListener("visibilitychange", onVis);
      document.removeEventListener("touchstart", onTouch);
      document.removeEventListener("click", onTouch);
    };
  }, []);
  return (
    <section className="cine-section">
      {/* Poster image — always rendered behind the video so the layout never jumps */}
      <img
        src={heroPoster}
        alt=""
        className="cine-video cine-poster"
        width={1920}
        height={1088}
        aria-hidden="true"
      />
      <video
        ref={videoRef}
        className="cine-video"
        poster={heroPoster}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden="true"
        controls={false}
        disablePictureInPicture
        style={videoFailed ? { display: "none" } : undefined}
      >
        <source src={phoneVideoWebm.url} type="video/webm" />
        <source src={phoneVideo.url} type="video/mp4" />
      </video>
      <div className="cine-overlay cine-overlay-strong" />

      <div className="cine-content cine-content-center">
        <p className="cine-eyebrow" data-reveal>{t("cine.hero.eyebrow")}</p>
        <h1 className="cine-h1" data-reveal style={{ animationDelay: "0.2s" }}>
          {t("cine.hero.t1")}<br />
          <span className="cine-h1-italic">{t("cine.hero.t2")}</span>
        </h1>
        <p className="cine-sub" data-reveal style={{ animationDelay: "0.4s" }}>
          {t("cine.hero.sub")}
        </p>
        <div className="cine-actions" data-reveal style={{ animationDelay: "0.6s" }}>
          <Link
            to="/signup"
            className="cine-btn-primary"
            data-cta-location="hero"
            onClick={() => trackEvent("cta_click", { location: "hero" })}
          >
            {t("cine.hero.cta")} <ArrowRight size={16} />
          </Link>
          <a href="#chegada" className="cine-btn-ghost-lg">{t("cine.hero.cta2")}</a>
        </div>
      </div>

      <a href="#chegada" className="cine-scroll-indicator" aria-label="Continuar">
        <span>{t("cine.scroll")}</span>
        <ChevronDown size={18} />
      </a>
    </section>
  );
}

/* ---------------- Section 2: A CHEGADA ---------------- */
function ArrivalSection() {
  const t = useT();
  const checkins = useCountUp(100);
  const calls = useCountUp(0);
  return (
    <section id="chegada" className="cine-section">
      <div className="cine-bg cine-bg-arrival" aria-hidden="true">
        <div className="cine-light-ray" />
        <div className="cine-grain" />
      </div>
      <div className="cine-overlay cine-overlay-soft" />

      <div className="cine-content">
        <p className="cine-time" data-reveal>{t("cine.arrival.time")}</p>
        <h2 className="cine-h2" data-reveal style={{ animationDelay: "0.15s" }}>
          {t("cine.arrival.t1")}<br />
          <span className="cine-h2-thin">{t("cine.arrival.t2")}</span>
        </h2>

        <div className="cine-stats" data-reveal style={{ animationDelay: "0.4s" }}>
          <div className="cine-stat">
            <span className="cine-stat-num" ref={checkins.ref}>{checkins.val}%</span>
            <span className="cine-stat-label">{t("cine.arrival.stat1")}</span>
          </div>
          <div className="cine-stat-divider" />
          <div className="cine-stat">
            <span className="cine-stat-num" ref={calls.ref}>{calls.val}</span>
            <span className="cine-stat-label">{t("cine.arrival.stat2")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Section 3: O CHECKOUT ---------------- */
function CheckoutSection() {
  const t = useT();
  return (
    <section className="cine-section">
      <div className="cine-bg cine-bg-checkout" aria-hidden="true">
        <div className="cine-orb cine-orb-warm" />
        <div className="cine-grain" />
      </div>
      <div className="cine-overlay" />

      <div className="cine-content">
        <p className="cine-time" data-reveal>{t("cine.checkout.time")}</p>
        <h2 className="cine-h2" data-reveal style={{ animationDelay: "0.15s" }}>
          {t("cine.checkout.t1")}<br />
          <span className="cine-h2-thin">{t("cine.checkout.t2")}</span>
        </h2>

        <div className="cine-notification" data-reveal style={{ animationDelay: "0.5s" }}>
          <div className="cine-notif-icon"><Bell size={18} /></div>
          <div className="cine-notif-body">
            <div className="cine-notif-title">{t("cine.checkout.notifTitle")}</div>
            <div className="cine-notif-text">{t("cine.checkout.notifText")}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Section 4: A LIMPEZA ---------------- */
function CleaningSection() {
  const t = useT();
  return (
    <section className="cine-section">
      <div className="cine-bg cine-bg-cleaning" aria-hidden="true">
        <div className="cine-orb cine-orb-cool" />
        <div className="cine-grain" />
      </div>
      <div className="cine-overlay cine-overlay-soft" />

      <div className="cine-content">
        <p className="cine-time" data-reveal>{t("cine.cleaning.time")}</p>
        <h2 className="cine-h2" data-reveal style={{ animationDelay: "0.15s" }}>
          {t("cine.cleaning.t1")}<br />
          <span className="cine-h2-thin">{t("cine.cleaning.t2")}</span>
        </h2>

        <div className="cine-gallery cine-gallery-real" data-reveal style={{ animationDelay: "0.4s" }}>
          {FORGOTTEN_ITEMS.map((item, i) => {
            const label = t(item.key);
            return (
              <figure key={item.key} className="cine-photo cine-photo-real" style={{ animationDelay: `${0.5 + i * 0.14}s` }}>
                <img src={item.src} alt={label} loading="lazy" width={1024} height={1024} />
                <figcaption>
                  <Camera size={12} />
                  <span>{label}</span>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Section 5: TRANQUILIDADE (real video) ---------------- */
function TranquilitySection() {
  const t = useT();
  return (
    <section className="cine-section">
      <div className="cine-bg cine-bg-tranquility" aria-hidden="true">
        <div className="cine-orb cine-orb-warm" />
        <div className="cine-grain" />
      </div>
      <div className="cine-overlay cine-overlay-strong" />

      <div className="cine-content cine-content-center">
        <p className="cine-eyebrow" data-reveal>{t("cine.tranq.eyebrow")}</p>
        <h2 className="cine-h2" data-reveal style={{ animationDelay: "0.15s" }}>
          <span className="cine-h2-thin">{t("cine.tranq.t1")}</span><br />
          <span className="cine-h2-thin">{t("cine.tranq.t2")}</span><br />
          {t("cine.tranq.t3")}
        </h2>
        <p className="cine-sub" data-reveal style={{ animationDelay: "0.4s" }}>
          <Sparkles size={14} style={{ display: "inline", marginRight: 8, verticalAlign: "middle" }} />
          {t("cine.tranq.sub")}
        </p>
      </div>
    </section>
  );
}

/* ---------------- Section 6: CTA ---------------- */
function CtaSection() {
  const t = useT();
  return (
    <section className="cine-section cine-section-dark">
      <div className="cine-bg cine-bg-dark" aria-hidden="true">
        <div className="cine-grain" />
      </div>

      <div className="cine-content cine-content-center">
        <p className="cine-eyebrow" data-reveal>{t("cine.cta.eyebrow")}</p>
        <h2 className="cine-h1" data-reveal style={{ animationDelay: "0.15s" }}>
          {t("cine.cta.t1")}<br />
          <span className="cine-h1-italic">{t("cine.cta.t2")}</span>
        </h2>
        <p className="cine-sub" data-reveal style={{ animationDelay: "0.35s" }}>
          {t("cine.cta.priceFrom")} <strong style={{ color: "#fff", fontWeight: 600 }}>€24,99{t("cine.cta.priceSuffix")}</strong>
        </p>
        <div className="cine-actions" data-reveal style={{ animationDelay: "0.55s" }}>
          <Link to="/signup" className="cine-btn-primary" data-cta-location="cta">
            {t("cine.cta.btn")} <ArrowRight size={16} />
          </Link>
          <Link to="/inscrever-se" className="cine-btn-ghost-lg">{t("cine.cta.btn2")}</Link>
        </div>

        <div className="cine-footer" data-reveal style={{ animationDelay: "0.8s" }}>
          <span>© {new Date().getFullYear()} Hostlyb</span>
          <span>·</span>
          <Link to="/trust">{t("cine.footer.trust")}</Link>
          <span>·</span>
          <a href="mailto:support@hostlyb.com">support@hostlyb.com</a>
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   CSS
   ============================================================ */
const cinematicCSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,500;12..96,700;12..96,800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

html, body { background: #0A0A0A; color: #fff; }
html { scroll-behavior: smooth; scroll-snap-type: y mandatory; }

.cine-main { font-family: ${display}; }

/* Nav */
.cine-nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  padding: 22px 40px;
  background: linear-gradient(180deg, rgba(10,10,10,0.6), rgba(10,10,10,0));
  backdrop-filter: blur(8px);
}
.cine-logo { font-family: ${display}; font-weight: 800; letter-spacing: 0.18em; font-size: 14px; color: #fff; }
.cine-nav-right { display: flex; align-items: center; gap: 16px; }
.cine-nav-link { color: rgba(255,255,255,0.7); font-size: 13px; letter-spacing: 0.05em; text-transform: uppercase; }
.cine-nav-link:hover { color: #fff; }

@media (max-width: 640px) {
  .cine-nav { padding: 14px 18px; }
}

/* Section base */
.cine-section {
  position: relative;
  height: 100vh;
  min-height: 600px;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
.cine-section-dark { background: #0A0A0A; }

/* Backgrounds — animated gradients in lieu of stock video */
.cine-bg { position: absolute; inset: 0; z-index: 0; overflow: hidden; }

.cine-bg-hero { background: radial-gradient(ellipse at 30% 40%, #2a1a14 0%, #0A0A0A 70%); }
.cine-bg-hero-fallback { position: absolute; inset: 0; z-index: 0; overflow: hidden; background: radial-gradient(ellipse at 30% 40%, #2a1a14 0%, #0A0A0A 70%); }
.cine-bg-arrival { background: linear-gradient(135deg, #1a1410 0%, #2d2218 50%, #0A0A0A 100%); }
.cine-bg-checkout { background: radial-gradient(ellipse at 70% 50%, #2a1f1a 0%, #0A0A0A 70%); }
.cine-bg-cleaning { background: linear-gradient(180deg, #0f1419 0%, #1a2028 60%, #0A0A0A 100%); }
.cine-bg-tranquility { background: radial-gradient(ellipse at 50% 60%, #1f1814 0%, #0A0A0A 75%); }
.cine-bg-dark { background: #0A0A0A; }

/* Orbs (parallax soft light) */
.cine-orb {
  position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.5;
  animation: cine-float 18s ease-in-out infinite;
}
.cine-orb-1 { width: 600px; height: 600px; background: #FF6B6B; top: -10%; left: -10%; opacity: 0.18; }
.cine-orb-2 { width: 500px; height: 500px; background: #ffb088; bottom: -20%; right: -10%; opacity: 0.14; animation-delay: -6s; }
.cine-orb-3 { width: 300px; height: 300px; background: #fff; top: 40%; right: 30%; opacity: 0.04; animation-delay: -12s; }
.cine-orb-warm { width: 700px; height: 700px; background: #FF8866; top: 20%; left: 50%; transform: translateX(-50%); opacity: 0.16; }
.cine-orb-cool { width: 700px; height: 700px; background: #6688ff; top: 30%; left: 30%; opacity: 0.10; }

@keyframes cine-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(40px, -40px) scale(1.08); }
}

.cine-light-ray {
  position: absolute; top: -20%; left: 20%; width: 60%; height: 140%;
  background: linear-gradient(120deg, transparent 40%, rgba(255,230,200,0.08) 50%, transparent 60%);
  transform: rotate(15deg);
  animation: cine-ray 8s ease-in-out infinite;
}
@keyframes cine-ray { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }

.cine-grain {
  position: absolute; inset: 0; opacity: 0.08; pointer-events: none;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}

/* Real video */
.cine-video {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;
}
.cine-poster { z-index: 0; }
.cine-video:not(.cine-poster) { z-index: 1; background: #0A0A0A; }

/* Overlays */
.cine-overlay { position: absolute; inset: 0; z-index: 1; background: rgba(0,0,0,0.4); }
.cine-overlay-soft { background: linear-gradient(180deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2), rgba(0,0,0,0.6)); }
.cine-overlay-strong { background: linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.5), rgba(0,0,0,0.85)); }

/* Content */
.cine-content {
  position: relative; z-index: 2;
  max-width: 1100px; padding: 0 40px; width: 100%;
}
.cine-content-center { text-align: center; }
@media (max-width: 640px) {
  .cine-content { padding: 0 22px; }
}

/* Typography */
.cine-eyebrow {
  font-size: 12px; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase;
  color: rgba(255,255,255,0.7); margin-bottom: 32px;
}
.cine-time {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px; font-weight: 600; letter-spacing: 0.32em; text-transform: uppercase;
  color: #FF6B6B; margin-bottom: 28px;
}
.cine-h1 {
  font-family: ${display};
  font-weight: 200;
  font-size: clamp(48px, 9vw, 112px);
  line-height: 0.95;
  letter-spacing: -0.03em;
  color: #fff;
  margin-bottom: 32px;
}
.cine-h1-italic {
  font-style: italic; font-weight: 300; opacity: 0.85;
}
.cine-h2 {
  font-family: ${display};
  font-weight: 300;
  font-size: clamp(36px, 6vw, 72px);
  line-height: 1.05;
  letter-spacing: -0.02em;
  color: #fff;
  margin-bottom: 40px;
}
.cine-h2-thin { font-weight: 200; opacity: 0.7; }

.cine-sub {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: clamp(16px, 1.6vw, 20px);
  font-weight: 300;
  color: rgba(255,255,255,0.78);
  letter-spacing: 0.01em;
  max-width: 560px;
  margin: 0 auto 40px;
}

/* Actions */
.cine-actions { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; }
.cine-btn-primary {
  display: inline-flex; align-items: center; gap: 10px;
  background: #FF6B6B; color: #fff;
  padding: 16px 28px; border-radius: 999px;
  font-size: 14px; font-weight: 600; letter-spacing: 0.04em;
  transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 40px -10px rgba(255,107,107,0.5);
}
.cine-btn-primary:hover { background: #ff5454; transform: translateY(-2px); box-shadow: 0 16px 50px -10px rgba(255,107,107,0.7); }
.cine-btn-ghost {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(255,255,255,0.25);
  color: #fff; padding: 10px 18px; border-radius: 999px;
  font-size: 13px; font-weight: 500; letter-spacing: 0.05em;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.cine-btn-ghost:hover { border-color: #fff; background: rgba(255,255,255,0.05); }
.cine-btn-ghost-lg {
  display: inline-flex; align-items: center; gap: 8px;
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff; padding: 16px 28px; border-radius: 999px;
  font-size: 14px; font-weight: 500; letter-spacing: 0.04em;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.cine-btn-ghost-lg:hover { border-color: #fff; background: rgba(255,255,255,0.06); }

/* Scroll indicator */
.cine-scroll-indicator {
  position: absolute; bottom: 36px; left: 50%; transform: translateX(-50%);
  z-index: 3;
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  color: rgba(255,255,255,0.55); font-size: 10px; letter-spacing: 0.32em;
  animation: cine-pulse 2.4s ease-in-out infinite;
}
@keyframes cine-pulse {
  0%, 100% { transform: translate(-50%, 0); opacity: 0.5; }
  50% { transform: translate(-50%, 10px); opacity: 1; }
}

/* Stats */
.cine-stats {
  display: inline-flex; align-items: center; gap: 48px; padding: 32px 0;
  border-top: 1px solid rgba(255,255,255,0.12);
  border-bottom: 1px solid rgba(255,255,255,0.12);
}
.cine-stat { display: flex; flex-direction: column; align-items: flex-start; gap: 8px; }
.cine-stat-num {
  font-family: ${display}; font-weight: 200;
  font-size: clamp(56px, 8vw, 88px);
  line-height: 1; color: #fff; letter-spacing: -0.04em;
}
.cine-stat-label {
  font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(255,255,255,0.55);
}
.cine-stat-divider { width: 1px; height: 64px; background: rgba(255,255,255,0.12); }
@media (max-width: 640px) {
  .cine-stats { flex-direction: column; gap: 24px; align-items: flex-start; }
  .cine-stat-divider { display: none; }
}

/* Notification card */
.cine-notification {
  display: inline-flex; align-items: flex-start; gap: 14px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  backdrop-filter: blur(20px);
  border-radius: 18px;
  padding: 18px 22px;
  max-width: 440px;
  text-align: left;
  box-shadow: 0 24px 60px -20px rgba(0,0,0,0.6);
}
.cine-notif-icon {
  background: #FF6B6B; color: #fff;
  width: 38px; height: 38px; border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.cine-notif-title { font-size: 11px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.55); margin-bottom: 4px; }
.cine-notif-text { font-size: 14px; color: rgba(255,255,255,0.92); font-weight: 400; line-height: 1.45; }

/* Gallery */
.cine-gallery {
  display: grid; grid-template-columns: repeat(6, 1fr); gap: 12px;
  max-width: 720px;
}
@media (max-width: 720px) {
  .cine-gallery { grid-template-columns: repeat(3, 1fr); }
}
.cine-photo {
  aspect-ratio: 1;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
  color: rgba(255,255,255,0.5); font-size: 10px; letter-spacing: 0.15em;
  opacity: 0; transform: translateY(20px) scale(0.96);
  animation: cine-photo-in 0.8s ease-out forwards;
  backdrop-filter: blur(10px);
}
@keyframes cine-photo-in {
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.cine-gallery-real {
  grid-template-columns: repeat(4, 1fr);
  max-width: 860px;
  gap: 16px;
}
@media (max-width: 720px) {
  .cine-gallery-real { grid-template-columns: repeat(2, 1fr); }
}
.cine-photo-real {
  position: relative; overflow: hidden; padding: 0;
  border: 1px solid rgba(255,255,255,0.14);
  background: #111;
  box-shadow: 0 24px 60px -24px rgba(0,0,0,0.7);
}
.cine-photo-real img {
  width: 100%; height: 100%; object-fit: cover; display: block;
  transition: transform 0.8s ease;
}
.cine-photo-real:hover img { transform: scale(1.05); }
.cine-photo-real figcaption {
  position: absolute; left: 0; right: 0; bottom: 0;
  display: flex; align-items: center; gap: 6px;
  padding: 10px 12px;
  font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase;
  color: #fff;
  background: linear-gradient(180deg, transparent, rgba(0,0,0,0.75));
}

/* Footer in CTA */
.cine-footer {
  margin-top: 60px; display: flex; gap: 14px; justify-content: center; flex-wrap: wrap;
  font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 0.08em;
}
.cine-footer a { color: rgba(255,255,255,0.7); }
.cine-footer a:hover { color: #fff; }

/* Reveal animation */
[data-reveal] {
  opacity: 0;
  transform: translateY(40px);
  filter: blur(10px);
  transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1),
              transform 1.2s cubic-bezier(0.16, 1, 0.3, 1),
              filter 1.2s cubic-bezier(0.16, 1, 0.3, 1);
}
[data-reveal].is-visible {
  opacity: 1; transform: translateY(0); filter: blur(0);
}

/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  html { scroll-snap-type: none; }
  [data-reveal] { transition: none; opacity: 1; transform: none; filter: none; }
  .cine-orb, .cine-light-ray, .cine-scroll-indicator { animation: none; }
}
`;
