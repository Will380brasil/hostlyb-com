import { MapPin, Navigation, Apple } from "lucide-react";

export function AddressActions({ address }: { address: string | null | undefined }) {
  const safe = (address ?? "").trim();
  if (!safe) {
    return <p className="text-xs text-muted-foreground">Endereço não informado.</p>;
  }
  const enc = encodeURIComponent(safe);
  const open = (url: string) => {
    try {
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (!win) window.location.href = url;
    } catch {
      window.location.href = url;
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 text-sm text-foreground">
        <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
        <span className="leading-snug">{safe}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-secondary" onClick={() => open(`https://www.google.com/maps/search/?api=1&query=${enc}`)}>
          <MapPin size={14} /> Google Maps
        </button>
        <button type="button" className="btn-secondary" onClick={() => open(`https://www.waze.com/ul?q=${enc}&navigate=yes`)}>
          <Navigation size={14} /> Waze
        </button>
        <button type="button" className="btn-secondary" onClick={() => open(`https://maps.apple.com/?q=${enc}`)}>
          <Apple size={14} /> Apple Maps
        </button>
      </div>
    </div>
  );
}
