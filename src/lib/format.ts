export const formatBRL = (v: number) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const localeMap: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES" };

export const formatMoney = (
  v: number,
  currency: "BRL" | "USD" | "EUR" = "BRL",
  lang: "pt" | "en" | "es" = "pt",
) =>
  (v ?? 0).toLocaleString(localeMap[lang] ?? "pt-BR", {
    style: "currency",
    currency,
  });

export const currencySymbol = (c: "BRL" | "USD" | "EUR") =>
  c === "BRL" ? "R$" : c === "USD" ? "US$" : "€";

export const fullAddress = (p: { address: string; city?: string | null; state?: string | null; zip_code?: string | null }) =>
  [p.address, [p.city, p.state].filter(Boolean).join(" - "), p.zip_code].filter(Boolean).join(", ");
