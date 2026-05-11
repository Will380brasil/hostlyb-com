import { useEffect, useState } from "react";
import { X, MapPin, User, Sparkles, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export interface PropertyDayStatus {
  property: { id: string; name: string; city: string | null };
  status: "livre" | "ocupado" | "limpeza";
  guest?: { name: string; checkout_date: string };
  cleaning?: { cleaner_name: string; scheduled_time: string };
}

interface Props {
  date: string | null; // YYYY-MM-DD
  onClose: () => void;
}

const CFG = {
  livre:   { label: "Livre",      icon: "✅", color: "var(--color-success, #00C896)" },
  ocupado: { label: "Ocupado",    icon: "🔴", color: "var(--color-destructive, #FF6B6B)" },
  limpeza: { label: "Em limpeza", icon: "🧹", color: "var(--color-warning, #FFB347)" },
} as const;

export function DayStatusPanel({ date, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Record<keyof typeof CFG, PropertyDayStatus[]>>({
    livre: [], ocupado: [], limpeza: [],
  });

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: properties } = await supabase
        .from("properties")
        .select("id, name, city")
        .eq("user_id", user.id)
        .eq("archived", false);

      const ids = (properties ?? []).map((p) => p.id);
      if (!ids.length) {
        if (!cancelled) { setGroups({ livre: [], ocupado: [], limpeza: [] }); setLoading(false); }
        return;
      }

      const [{ data: guests }, { data: jobs }] = await Promise.all([
        supabase.from("guests")
          .select("property_id, name, checkout_date")
          .in("property_id", ids)
          .lte("checkin_date", date)
          .gte("checkout_date", date)
          .in("status", ["confirmado", "hospedado"]),
        supabase.from("cleaning_jobs")
          .select("property_id, scheduled_time, cleaners(name)")
          .in("property_id", ids)
          .eq("scheduled_date", date)
          .in("status", ["agendado", "em_andamento"]),
      ]);

      const result: Record<keyof typeof CFG, PropertyDayStatus[]> = { livre: [], ocupado: [], limpeza: [] };
      for (const p of properties ?? []) {
        const g = guests?.find((x: any) => x.property_id === p.id);
        const j = jobs?.find((x: any) => x.property_id === p.id);
        const item: PropertyDayStatus = { property: p as any, status: "livre" };
        if (g) {
          item.status = "ocupado";
          item.guest = { name: g.name, checkout_date: g.checkout_date };
        } else if (j) {
          item.status = "limpeza";
          item.cleaning = {
            cleaner_name: (j.cleaners as any)?.name ?? "Faxineira",
            scheduled_time: (j.scheduled_time as string)?.slice(0, 5) ?? "",
          };
        }
        result[item.status].push(item);
      }
      if (!cancelled) { setGroups(result); setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [date]);

  if (!date) return null;

  const total = groups.livre.length + groups.ocupado.length + groups.limpeza.length;
  const formatted = new Date(date + "T12:00:00").toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long",
  });

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/55" />
      <aside
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-card border-l border-card-border h-full overflow-y-auto flex flex-col animate-in slide-in-from-right"
      >
        <header className="p-5 border-b border-card-border flex items-start justify-between sticky top-0 bg-card z-10">
          <div>
            <h3 className="font-bold text-lg">Status do dia</h3>
            <p className="text-sm text-muted-foreground capitalize">{formatted}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{total} imóvel(is)</p>
          </div>
          <button onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </header>

        <div className="flex-1 p-4 space-y-5">
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-secondary animate-pulse" />)}
            </div>
          ) : total === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-2">🏠</div>
              <p className="text-sm text-muted-foreground">Nenhum imóvel cadastrado</p>
            </div>
          ) : (
            (["ocupado", "limpeza", "livre"] as const).map((key) => {
              const items = groups[key];
              if (!items.length) return null;
              const cfg = CFG[key];
              return (
                <section key={key}>
                  <div className="flex items-center gap-2 mb-2 text-sm font-semibold" style={{ color: cfg.color }}>
                    <span>{cfg.icon}</span>
                    {cfg.label} ({items.length})
                  </div>
                  <div className="space-y-2">
                    {items.map((it) => (
                      <div key={it.property.id} className="p-3 rounded-xl border border-card-border bg-background">
                        <p className="font-medium text-sm">{it.property.name}</p>
                        {it.property.city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin size={11} />{it.property.city}
                          </p>
                        )}
                        {it.guest && (
                          <p className="text-xs mt-2 flex items-center gap-1" style={{ color: CFG.ocupado.color }}>
                            <User size={11} /> {it.guest.name} · saída {it.guest.checkout_date.split("-").reverse().join("/")}
                          </p>
                        )}
                        {it.cleaning && (
                          <p className="text-xs mt-2 flex items-center gap-1" style={{ color: CFG.limpeza.color }}>
                            <Sparkles size={11} /> {it.cleaning.cleaner_name} · {it.cleaning.scheduled_time}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>

        <footer className="p-4 border-t border-card-border sticky bottom-0 bg-card">
          <Link
            to={"/limpezas" as any}
            search={{ date } as any}
            onClick={onClose}
            className="btn-primary w-full justify-center"
          >
            <Plus size={16} /> Agendar limpeza
          </Link>
        </footer>
      </aside>
    </div>
  );
}
