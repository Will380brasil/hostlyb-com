import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles, MapPin, Wifi, AlertTriangle, Camera, Loader2, BedDouble, Bath } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/SignedImage";
import { toast } from "sonner";

export const Route = createFileRoute("/faxineira/$token")({
  head: () => ({ meta: [{ title: "Limpeza — Hostlyb" }, { name: "robots", content: "noindex" }] }),
  component: CleanerPortal,
});

type ChecklistItem = { label: string; done: boolean };
type ForgottenItem = { id: string; description: string; photo_url: string | null; status: string; notes: string | null };
type Job = {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  checklist: ChecklistItem[] | string[];
  photos: string[];
  notes: string | null;
  has_forgotten_items: boolean;
  property: { id: string; name: string; address: string; city: string | null; wifi_password: string | null; bedrooms: number | null; bathrooms: number | null };
  cleaner: { id: string; name: string; photo_url: string | null } | null;
  forgotten_items: ForgottenItem[];
};

const STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado", em_andamento: "Em andamento", concluido: "Concluído", problema: "Problema", cancelado: "Cancelado",
};

function normalizeChecklist(raw: any): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) => typeof it === "string" ? { label: it, done: false } : { label: String(it.label ?? ""), done: !!it.done });
}

function CleanerPortal() {
  const { token } = Route.useParams();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["cleaner-job", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("cleaner_get_job", { p_token: token });
      if (error) throw error;
      return data as unknown as Job;
    },
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState("");
  const [newItem, setNewItem] = useState({ description: "", notes: "" });
  const [showItemForm, setShowItemForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (data) {
      setChecklist(normalizeChecklist(data.checklist));
      setNotes(data.notes ?? "");
    }
  }, [data?.id]);

  const update = useMutation({
    mutationFn: async (payload: { checklist?: any; notes?: string; status?: string; photos?: any }) => {
      const { error } = await supabase.rpc("cleaner_update_job", {
        p_token: token,
        p_checklist: payload.checklist ?? undefined,
        p_notes: payload.notes ?? undefined,
        p_status: payload.status ?? undefined,
        p_photos: payload.photos ?? undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cleaner-job", token] }),
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
  });

  const addItem = useMutation({
    mutationFn: async (vars: { description: string; notes: string; photo_url: string | null }) => {
      const { error } = await supabase.rpc("cleaner_add_forgotten_item", {
        p_token: token, p_description: vars.description, p_photo_url: vars.photo_url ?? undefined, p_notes: vars.notes || undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaner-job", token] });
      setNewItem({ description: "", notes: "" });
      setShowItemForm(false);
      toast.success("Objeto registrado. Anfitrião notificado.");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  async function uploadPhoto(file: File, bucket: "cleaning-photos" | "forgotten-items") {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${token}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  }

  async function onAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file, "cleaning-photos");
      const photos = [...(data.photos ?? []), url];
      await update.mutateAsync({ photos });
      toast.success("Foto enviada");
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao enviar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onAddForgottenWithPhoto(file: File | null) {
    if (!newItem.description.trim()) { toast.error("Descreva o objeto"); return; }
    setUploading(true);
    try {
      let photo_url: string | null = null;
      if (file) photo_url = await uploadPhoto(file, "forgotten-items");
      await addItem.mutateAsync({ description: newItem.description.trim(), notes: newItem.notes.trim(), photo_url });
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao registrar");
    } finally { setUploading(false); }
  }

  if (isLoading) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Carregando…</div>;
  if (error || !data) return (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <AlertTriangle className="mx-auto mb-3" />
        <h1 className="text-lg font-bold">Link inválido</h1>
        <p className="text-sm text-muted-foreground mt-1">Peça um novo link ao anfitrião.</p>
      </div>
    </div>
  );

  const allDone = checklist.length > 0 && checklist.every((c) => c.done);
  const dirty = JSON.stringify(checklist) !== JSON.stringify(normalizeChecklist(data.checklist)) || (notes ?? "") !== (data.notes ?? "");

  return (
    <div className="min-h-screen mx-auto w-full max-w-[480px] bg-background pb-32">
      <header className="sticky top-0 z-10 px-5 py-4 bg-background/95 backdrop-blur border-b border-card-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">Host<span style={{ color: "var(--color-accent)" }}>lyb</span></h1>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: data.status === "concluido" ? "var(--color-accent)" : "var(--color-card)", color: data.status === "concluido" ? "white" : "var(--color-foreground)", border: "1px solid var(--color-card-border)" }}>
            {STATUS_LABEL[data.status] ?? data.status}
          </span>
        </div>
      </header>

      <main className="px-4 pt-4 space-y-4">
        <section className="rounded-2xl bg-card border border-card-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: "var(--color-accent)" }} />
            <h2 className="font-bold">{data.property.name}</h2>
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-1">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span>{data.property.address}{data.property.city ? `, ${data.property.city}` : ""}</span>
          </p>
          <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
            {data.property.bedrooms != null && <span className="flex items-center gap-1"><BedDouble size={12} /> {data.property.bedrooms}</span>}
            {data.property.bathrooms != null && <span className="flex items-center gap-1"><Bath size={12} /> {data.property.bathrooms}</span>}
            <span>📅 {new Date(data.scheduled_date + "T" + data.scheduled_time).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {data.property.wifi_password && (
            <div className="mt-3 pt-3 border-t border-card-border text-xs flex items-center gap-2">
              <Wifi size={12} /> <span className="font-mono">{data.property.wifi_password}</span>
            </div>
          )}
        </section>

        {data.status !== "em_andamento" && data.status !== "concluido" && (
          <button onClick={() => update.mutate({ status: "em_andamento" })} className="w-full py-3 rounded-2xl font-bold text-white" style={{ background: "var(--color-accent)" }}>
            Iniciar limpeza
          </button>
        )}

        <section className="rounded-2xl bg-card border border-card-border p-4">
          <h3 className="font-bold mb-3">Checklist</h3>
          {checklist.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum item.</p>
          ) : (
            <ul className="space-y-2">
              {checklist.map((it, i) => (
                <li key={i}>
                  <button onClick={() => setChecklist((cs) => cs.map((c, j) => j === i ? { ...c, done: !c.done } : c))}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background text-left">
                    <span className="w-5 h-5 rounded-md grid place-items-center border"
                      style={{ background: it.done ? "var(--color-accent)" : "transparent", borderColor: it.done ? "var(--color-accent)" : "var(--color-card-border)" }}>
                      {it.done && <Check size={14} className="text-white" />}
                    </span>
                    <span className={`text-sm ${it.done ? "line-through text-muted-foreground" : ""}`}>{it.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-card border border-card-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Fotos da limpeza</h3>
            <label className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1" style={{ background: "var(--color-accent)", color: "white" }}>
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} Adicionar
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onAddPhoto} disabled={uploading} />
            </label>
          </div>
          {data.photos?.length ? (
            <div className="grid grid-cols-3 gap-2">
              {data.photos.map((p, i) => <SignedImage key={i} bucket="cleaning-photos" path={p} alt="" className="aspect-square object-cover rounded-lg w-full" />)}
            </div>
          ) : <p className="text-xs text-muted-foreground">Nenhuma foto enviada.</p>}
        </section>

        <section className="rounded-2xl bg-card border border-card-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><AlertTriangle size={14} /> Objetos esquecidos</h3>
            <button onClick={() => setShowItemForm((s) => !s)} className="text-xs font-semibold underline text-muted-foreground">{showItemForm ? "Cancelar" : "Adicionar"}</button>
          </div>

          {showItemForm && (
            <div className="space-y-2 mb-3 p-3 rounded-xl bg-background border border-card-border">
              <input value={newItem.description} onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))} placeholder="Ex.: Carregador de celular" className="w-full px-3 py-2 rounded-lg border border-card-border bg-card text-sm" />
              <input value={newItem.notes} onChange={(e) => setNewItem((n) => ({ ...n, notes: e.target.value }))} placeholder="Onde foi encontrado (opcional)" className="w-full px-3 py-2 rounded-lg border border-card-border bg-card text-sm" />
              <label className="flex items-center justify-center gap-2 py-2 rounded-lg border border-dashed border-card-border text-xs cursor-pointer">
                <Camera size={14} /> Anexar foto e registrar
                <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploading}
                  onChange={(e) => onAddForgottenWithPhoto(e.target.files?.[0] ?? null)} />
              </label>
              <button disabled={uploading} onClick={() => onAddForgottenWithPhoto(null)} className="w-full py-2 rounded-lg text-xs font-semibold text-white" style={{ background: "var(--color-accent)" }}>
                Registrar sem foto
              </button>
            </div>
          )}

          {data.forgotten_items.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nada registrado.</p>
          ) : (
            <ul className="space-y-2">
              {data.forgotten_items.map((it) => (
                <li key={it.id} className="flex gap-2 p-2 rounded-lg bg-background">
                  {it.photo_url && <SignedImage bucket="forgotten-items" path={it.photo_url} alt="" className="w-12 h-12 rounded-md object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.description}</p>
                    {it.notes && <p className="text-xs text-muted-foreground truncate">{it.notes}</p>}
                    <span className="text-[10px] text-muted-foreground">{it.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-card border border-card-border p-4">
          <h3 className="font-bold mb-2">Observações</h3>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Algo importante para o anfitrião…"
            className="w-full px-3 py-2 rounded-lg border border-card-border bg-background text-sm" />
        </section>

        <button onClick={() => update.mutate({ status: "problema", checklist, notes })}
          className="w-full py-2.5 rounded-xl text-sm font-semibold border border-card-border flex items-center justify-center gap-2"
          style={{ color: "var(--color-destructive, #ef4444)" }}>
          <AlertTriangle size={14} /> Reportar problema
        </button>
      </main>

      <footer className="fixed bottom-0 inset-x-0 mx-auto max-w-[480px] p-4 bg-background/95 backdrop-blur border-t border-card-border space-y-2">
        {dirty && (
          <button onClick={() => update.mutate({ checklist, notes })} disabled={update.isPending}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-card-border">
            {update.isPending ? "Salvando…" : "Salvar progresso"}
          </button>
        )}
        <button onClick={() => update.mutate({ status: "concluido", checklist, notes })}
          disabled={!allDone || update.isPending || data.status === "concluido"}
          className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-50"
          style={{ background: "var(--color-accent)" }}>
          {data.status === "concluido" ? "✓ Limpeza concluída" : allDone ? "Concluir limpeza" : `Conclua o checklist (${checklist.filter(c => c.done).length}/${checklist.length})`}
        </button>
        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </footer>
    </div>
  );
}
