import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { syncIcalFeed } from "@/lib/ical.functions";
import { RefreshCw, Trash2, Plus, CheckCircle2, AlertCircle, Link2 } from "lucide-react";
import { toast } from "sonner";

const PLATFORMS = [
  { value: "airbnb", label: "Airbnb" },
  { value: "booking", label: "Booking.com" },
  { value: "vrbo", label: "Vrbo" },
  { value: "custom", label: "Outra plataforma" },
];

function timeAgo(iso: string | null): string {
  if (!iso) return "nunca";
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s atrás`;
  if (s < 3600) return `${Math.floor(s / 60)} min atrás`;
  if (s < 86400) return `${Math.floor(s / 3600)} h atrás`;
  return `${Math.floor(s / 86400)} d atrás`;
}

export function IcalFeedsTab({ propertyId }: { propertyId: string }) {
  const qc = useQueryClient();
  const syncFn = useServerFn(syncIcalFeed);
  const [adding, setAdding] = useState(false);
  const [platform, setPlatform] = useState("airbnb");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const { data: feeds = [] } = useQuery({
    queryKey: ["ical_feeds", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ical_feeds")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const add = async () => {
    if (!url.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("ical_feeds").insert({
      user_id: user.id,
      property_id: propertyId,
      platform,
      label: label.trim() || null,
      url: url.trim(),
    });
    if (error) { toast.error(error.message); return; }
    toast.success("Calendário adicionado");
    setAdding(false); setUrl(""); setLabel(""); setPlatform("airbnb");
    qc.invalidateQueries({ queryKey: ["ical_feeds", propertyId] });
  };

  const sync = async (id: string) => {
    setBusy(id);
    try {
      const r: any = await syncFn({ data: { feedId: id } });
      if (r.status === "healthy") toast.success(`${r.imported} reservas sincronizadas`);
      else toast.error(`Erro: ${r.error}`);
      qc.invalidateQueries({ queryKey: ["ical_feeds", propertyId] });
      qc.invalidateQueries({ queryKey: ["guests"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remover este calendário?")) return;
    await supabase.from("ical_feeds").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["ical_feeds", propertyId] });
  };

  return (
    <div className="space-y-3">
      <div className="hostly-card !p-4">
        <h3 className="font-bold mb-1 flex items-center gap-2"><Link2 size={16} /> Conecte suas plataformas</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Cole o link iCal das suas plataformas para importar reservas automaticamente. Sincronização a cada 60 minutos.
        </p>

        {feeds.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground italic">Nenhum calendário conectado.</p>
        )}

        <ul className="space-y-2">
          {feeds.map((f: any) => (
            <li key={f.id} className="flex items-center gap-2 border rounded-lg p-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm capitalize">{f.platform}</span>
                  {f.label && <span className="text-xs text-muted-foreground">· {f.label}</span>}
                  {f.last_status === "healthy" && <CheckCircle2 size={12} className="text-[color:var(--color-success)]" />}
                  {f.last_status === "error" && <AlertCircle size={12} className="text-[color:var(--color-destructive)]" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  Última sincronização: {timeAgo(f.last_sync_at)} · {f.events_imported ?? 0} importadas
                </p>
                {f.last_status === "error" && f.last_error && (
                  <p className="text-xs text-[color:var(--color-destructive)] truncate">{f.last_error}</p>
                )}
              </div>
              <button onClick={() => sync(f.id)} disabled={busy === f.id} className="btn-ghost !p-2" title="Sincronizar agora">
                <RefreshCw size={14} className={busy === f.id ? "animate-spin" : ""} />
              </button>
              <button onClick={() => remove(f.id)} className="btn-ghost !p-2 text-[color:var(--color-destructive)]">
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>

        {adding ? (
          <div className="mt-3 space-y-2 border-t pt-3">
            <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="input w-full">
              {PLATFORMS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            {platform === "custom" && (
              <input placeholder="Nome da plataforma" value={label} onChange={(e) => setLabel(e.target.value)} className="input w-full" />
            )}
            <input placeholder="https://...ics" value={url} onChange={(e) => setUrl(e.target.value)} className="input w-full" />
            <div className="flex gap-2">
              <button onClick={add} className="btn-primary flex-1 justify-center">Adicionar</button>
              <button onClick={() => setAdding(false)} className="btn-ghost">Cancelar</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} className="btn-ghost mt-3 w-full justify-center">
            <Plus size={14} /> Adicionar calendário
          </button>
        )}

        <p className="text-xs text-muted-foreground mt-3 italic">
          ⚠️ iCal sincroniza a cada 60 min. Para sincronização instantânea, considere um channel manager.
        </p>
      </div>
    </div>
  );
}
