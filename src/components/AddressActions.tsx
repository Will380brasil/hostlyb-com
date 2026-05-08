import { MapPin, Navigation, Apple } from "lucide-react";

export function AddressActions({ address }: { address: string }) {
  const enc = encodeURIComponent(address);
  const open = (url: string) => window.open(url, "_blank", "noopener,noreferrer");
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 text-sm text-foreground">
        <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: "var(--color-accent)" }} />
        <span className="leading-snug">{address}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={() => open(`https://www.google.com/maps/search/?api=1&query=${enc}`)}>
          <MapPin size={14} /> Google Maps
        </button>
        <button className="btn-secondary" onClick={() => open(`https://waze.com/ul?q=${enc}`)}>
          <Navigation size={14} /> Waze
        </button>
        <button className="btn-secondary" onClick={() => open(`https://maps.apple.com/?q=${enc}`)}>
          <Apple size={14} /> Apple Maps
        </button>
      </div>
    </div>
  );
}
