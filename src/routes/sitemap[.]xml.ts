import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE = "https://www.hostlyb.com";
const LANGS = ["pt", "en", "es", "fr", "it", "de"] as const;
const LOCALE_PATH: Record<(typeof LANGS)[number], string> = {
  pt: "/", en: "/en", es: "/es", fr: "/fr", it: "/it", de: "/de",
};

// Public, indexable routes. Internal/auth/admin routes intentionally excluded.
const STATIC_PATHS: { path: string; changefreq: string; priority: string }[] = [
  { path: "/login", changefreq: "monthly", priority: "0.4" },
  { path: "/signup", changefreq: "monthly", priority: "0.7" },
  { path: "/demo", changefreq: "monthly", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);

        // Per-locale landing URLs with hreflang alternates pointing to each
        // dedicated path (/, /en, /fr, /es, /it, /de).
        const alternates = LANGS.map(
          (l) =>
            `      <xhtml:link rel="alternate" hreflang="${
              l === "pt" ? "pt-PT" : l
            }" href="${BASE}${LOCALE_PATH[l]}" />`,
        ).join("\n");
        const xdefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}/" />`;
        const ptBr = `      <xhtml:link rel="alternate" hreflang="pt-BR" href="${BASE}/" />`;

        const landingUrls = LANGS.map((l) =>
          [
            `  <url>`,
            `    <loc>${BASE}${LOCALE_PATH[l]}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            `    <changefreq>weekly</changefreq>`,
            `    <priority>${l === "pt" ? "1.0" : "0.9"}</priority>`,
            alternates,
            ptBr,
            xdefault,
            `  </url>`,
          ].join("\n"),
        );

        const staticUrls = STATIC_PATHS.map((p) =>
          [
            `  <url>`,
            `    <loc>${BASE}${p.path}</loc>`,
            `    <lastmod>${today}</lastmod>`,
            `    <changefreq>${p.changefreq}</changefreq>`,
            `    <priority>${p.priority}</priority>`,
            `  </url>`,
          ].join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...landingUrls,
          ...staticUrls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
