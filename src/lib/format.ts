export const formatBRL = (v: number) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const localeMap: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE" };

export const formatMoney = (
  v: number,
  currency: string = "BRL",
  lang: string = "pt",
) =>
  (v ?? 0).toLocaleString(localeMap[lang] ?? "pt-BR", {
    style: "currency",
    currency,
  });

export const currencySymbol = (c: string) =>
  c === "BRL" ? "R$" : c === "USD" ? "US$" : c === "EUR" ? "€" : c;

export const fullAddress = (p: { address: string; city?: string | null; state?: string | null; zip_code?: string | null }) =>
  [p.address, [p.city, p.state].filter(Boolean).join(" - "), p.zip_code].filter(Boolean).join(", ");
