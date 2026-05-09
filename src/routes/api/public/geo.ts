import { createFileRoute } from "@tanstack/react-router";

// Map country code → currency
const EUR_COUNTRIES = new Set([
  "AT","BE","CY","DE","EE","ES","FI","FR","GR","HR","IE","IT","LT","LU","LV",
  "MT","NL","PT","SI","SK","AD","MC","SM","VA","XK","ME","BA","RS","AL","MK",
  "BG","CZ","DK","HU","PL","RO","SE","NO","CH","IS","LI","UK","GB",
]);

function currencyForCountry(country: string): "BRL" | "USD" | "EUR" {
  const c = (country || "").toUpperCase();
  if (c === "BR") return "BRL";
  if (EUR_COUNTRIES.has(c)) return "EUR";
  return "USD";
}

function languageForCountry(country: string): string {
  const c = (country || "").toUpperCase();
  if (c === "BR" || c === "PT") return "pt";
  if (c === "ES" || c === "MX" || c === "AR" || c === "CL" || c === "CO" || c === "PE" || c === "UY") return "es";
  if (c === "FR" || c === "BE" || c === "MC" || c === "LU") return "fr";
  if (c === "IT" || c === "SM" || c === "VA") return "it";
  if (c === "DE" || c === "AT" || c === "CH" || c === "LI") return "de";
  return "en";
}

export const Route = createFileRoute("/api/public/geo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const country =
          request.headers.get("cf-ipcountry") ||
          request.headers.get("x-vercel-ip-country") ||
          request.headers.get("x-country") ||
          "US";
        const currency = currencyForCountry(country);
        const language = languageForCountry(country);
        return Response.json(
          { country: country.toUpperCase(), currency, language },
          { headers: { "cache-control": "public, max-age=300" } }
        );
      },
    },
  },
});
