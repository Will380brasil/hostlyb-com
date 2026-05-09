// Lightweight GA4 wrapper — no-op when VITE_GA4_ID is not configured.
// Set VITE_GA4_ID in env (e.g. "G-XXXXXXXXXX") to enable.

const GA_ID = (import.meta.env.VITE_GA4_ID as string | undefined) || "";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let injected = false;

export function initAnalytics() {
  if (injected || !GA_ID || typeof window === "undefined") return;
  injected = true;
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_ID, { anonymize_ip: true });
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
