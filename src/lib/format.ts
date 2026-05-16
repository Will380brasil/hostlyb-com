export const formatBRL = (v: number) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

// Locale-aware money formatting. EUR defaults to en-GB (1.234,56 style avoided for EN-EUR is OK).
// For language `en` with currency `EUR` we use en-GB so commas/dots are read naturally by Europeans.
const localeMap: Record<string, string> = {
  pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", it: "it-IT", de: "de-DE",
};

export const formatMoney = (
  v: number,
  currency: string = "BRL",
  lang: string = "pt",
) => {
  const locale = (lang === "en" && currency === "EUR") ? "en-GB"
    : (lang === "en" && currency === "GBP") ? "en-GB"
    : localeMap[lang] ?? "pt-BR";
  try {
    return (v ?? 0).toLocaleString(locale, { style: "currency", currency });
  } catch {
    return `${currencySymbol(currency)} ${(v ?? 0).toFixed(2)}`;
  }
};

export const currencySymbol = (c: string) =>
  c === "BRL" ? "R$" : c === "USD" ? "$" : c === "EUR" ? "€" : c === "GBP" ? "£" : c;

export const fullAddress = (p: { address: string; city?: string | null; state?: string | null; zip_code?: string | null }) =>
  [p.address, [p.city, p.state].filter(Boolean).join(" - "), p.zip_code].filter(Boolean).join(", ");
