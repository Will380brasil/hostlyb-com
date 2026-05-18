import { META_BY_LANG, LANGS, BASE_URL, OG_IMAGE, JSON_LD } from "@/routes/index";

const OG_LOCALE: Record<string, string> = {
  pt: "pt_PT", en: "en_US", fr: "fr_FR", de: "de_DE", it: "it_IT", es: "es_ES",
};

// Map lang -> URL path. Portuguese uses "/" as default.
const PATH_BY_LANG: Record<string, string> = {
  pt: "/", en: "/en", fr: "/fr", de: "/de", it: "/it", es: "/es",
};

export function buildLandingHead(lang: keyof typeof META_BY_LANG) {
  const m = META_BY_LANG[lang];
  const canonical = BASE_URL + PATH_BY_LANG[lang];
  const altLinks = LANGS.map((l) => ({
    rel: "alternate",
    hreflang: l === "pt" ? "pt-PT" : l,
    href: BASE_URL + PATH_BY_LANG[l],
  }));
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { name: "keywords", content: m.keywords },
      { name: "robots", content: "index, follow, max-snippet:-1, max-image-preview:large" },
      { name: "theme-color", content: "#FF6B6B" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.description },
      { property: "og:url", content: canonical },
      { property: "og:site_name", content: "Hostlyb" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: OG_LOCALE[lang] || "en_US" },
      ...LANGS.filter((l) => l !== lang).map((l) => ({
        property: "og:locale:alternate",
        content: OG_LOCALE[l],
      })),
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: m.title },
      { name: "twitter:description", content: m.description },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "canonical", href: canonical },
      ...altLinks,
      { rel: "alternate", hreflang: "pt-BR", href: BASE_URL + "/" },
      { rel: "alternate", hreflang: "x-default", href: BASE_URL + "/" },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(JSON_LD) }],
  };
}
