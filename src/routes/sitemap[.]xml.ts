import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE = "https://www.hostlyb.com";
const LANGS = ["pt", "en", "es", "fr", "it", "de"] as const;

// Public, indexable routes. Internal/auth/admin routes intentionally excluded.
const PATHS: { path: string; changefreq: string; priority: string }[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/login", changefreq: "monthly", priority: "0.4" },
  { path: "/signup", changefreq: "monthly", priority: "0.7" },
  { path: "/demo", changefreq: "monthly", priority: "0.5" },
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const today = new Date().toISOString().slice(0, 10);

        const urls = PATHS.flatMap((p) => {
          // base entry (default / x-default = PT)
          const baseUrl = `${BASE}${p.path}`;
          const alternates = LANGS.map(
            (l) =>
              `      <xhtml:link rel="alternate" hreflang="${
                l === "pt" ? "pt-PT" : l
              }" href="${baseUrl}?lang=${l}" />`,
          ).join("\n");
          const xdefault = `      <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}" />`;
          return [
            [
              `  <url>`,
              `    <loc>${baseUrl}</loc>`,
              `    <lastmod>${today}</lastmod>`,
              `    <changefreq>${p.changefreq}</changefreq>`,
              `    <priority>${p.priority}</priority>`,
              alternates,
              xdefault,
              `  </url>`,
            ].join("\n"),
          ];
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
          ...urls,
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
