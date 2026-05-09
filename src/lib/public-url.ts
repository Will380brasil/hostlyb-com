// Canonical public URL for the app. All e-mail links, invite links and
// shareable URLs MUST use this origin so they work even when generated from
// the preview/admin domain.
export const PUBLIC_BASE_URL = "https://hostlyb.com";

/** Build an absolute URL on the canonical hostlyb.com domain. */
export function publicUrl(path: string): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${PUBLIC_BASE_URL}${p}`;
}
