export const formatBRL = (v: number) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const fullAddress = (p: { address: string; city?: string | null; state?: string | null; zip_code?: string | null }) =>
  [p.address, [p.city, p.state].filter(Boolean).join(" - "), p.zip_code].filter(Boolean).join(", ");
