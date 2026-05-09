// Lightweight GA4 wrapper with Google Consent Mode v2.
// No-op when VITE_GA4_ID is not configured.
// Set VITE_GA4_ID in env (e.g. "G-XXXXXXXXXX") to enable.

const GA_ID = (import.meta.env.VITE_GA4_ID as string | undefined) || "";
const CONSENT_KEY = "hostly_cookie_consent"; // "granted" | "denied"

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type ConsentChoice = "granted" | "denied";

function gtagPush(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // gtag relies on `arguments`, so push the raw args array
  window.dataLayer.push(args);
}

export function getStoredConsent(): ConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(CONSENT_KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

let injected = false;

export function initAnalytics() {
  if (injected || !GA_ID || typeof window === "undefined") return;
  injected = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };

  // 1) Set default consent state BEFORE the GA script loads (Consent Mode v2).
  const stored = getStoredConsent();
  const defaultState = stored ?? "denied";
  gtagPush("consent", "default", {
    ad_storage: defaultState,
    ad_user_data: defaultState,
    ad_personalization: defaultState,
    analytics_storage: defaultState,
    wait_for_update: 500,
  });

  // 2) Inject the GA script.
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);

  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
}

export function setConsent(choice: ConsentChoice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* ignore */
  }
  // Always push so any future GA load picks the value up.
  gtagPush("consent", "update", {
    ad_storage: choice,
    ad_user_data: choice,
    ad_personalization: choice,
    analytics_storage: choice,
  });
}

export function trackEvent(action: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", action, params || {});
}

// Fire scroll-depth events (25/50/75/100) once per page load.
export function initScrollDepth() {
  if (typeof window === "undefined") return;
  const fired = new Set<number>();
  const onScroll = () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop + window.innerHeight) / h.scrollHeight;
    [0.25, 0.5, 0.75, 1].forEach((p) => {
      const pct = p * 100;
      if (scrolled >= p && !fired.has(pct)) {
        fired.add(pct);
        trackEvent("scroll_depth", { percent: pct });
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
}
