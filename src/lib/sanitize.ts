// Lightweight client-side sanitization helpers.
// Always re-validate server-side via RLS; this is the first line of defense.

export const sanitize = {
  text(v: string | null | undefined, maxLen = 5000): string {
    if (!v) return "";
    return String(v)
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .slice(0, maxLen);
  },
  url(v: string | null | undefined): string {
    if (!v) return "";
    try {
      const u = new URL(v);
      if (!["http:", "https:"].includes(u.protocol)) return "";
      return u.toString();
    } catch {
      return "";
    }
  },
  phone(v: string | null | undefined): string {
    if (!v) return "";
    return v.replace(/[^\d\s+\-()]/g, "").slice(0, 20);
  },
  number(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  },
};
