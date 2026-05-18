import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { X, Camera, AlertTriangle, Loader2 } from "lucide-react";

export function ReportProblemSheet({ token, onClose, onReported }: { token: string; onClose: () => void; onReported?: () => void }) {
  const [description, setDescription] = useState("");
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function pickFile(f: File | null) {
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  const submit = useMutation({
    mutationFn: async () => {
      if (!description.trim()) throw new Error("Descreva o problema");
      setUploading(true);
      let path: string | null = null;
      if (file) {
        const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
        path = `${token}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("forgotten-items").upload(path, file, {
          upsert: false, contentType: file.type || "image/jpeg",
        });
        if (upErr) throw upErr;
      }
      // 1) Record issue + notify host via server route (also creates alert + pending transaction via trigger)
      const res = await fetch("/api/public/cleaner/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          type: "problem",
          description: description.trim(),
          urgency: urgency === "urgent" ? "high" : "medium",
          recordIssue: true,
          ...(path ? { bucket: "forgotten-items", path } : {}),
        }),
      });
      if (!res.ok) throw new Error(await res.text());
    },
    onSuccess: () => {
      toast.success("Problema reportado ao anfitrião");
      onReported?.();
      onClose();
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao reportar"),
    onSettled: () => setUploading(false),
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: "var(--color-destructive, #ef4444)" }}>
            <AlertTriangle size={18} /> Reportar problema
          </h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">O que aconteceu?</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
              placeholder="Ex.: Vazamento no banheiro principal, manchas no sofá…"
              className="w-full mt-1 px-3 py-2 rounded-lg border border-card-border bg-background text-sm" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Urgência</label>
            <div className="grid grid-cols-2 gap-2">
              {(["normal", "urgent"] as const).map(u => (
                <button key={u} onClick={() => setUrgency(u)}
                  className="py-2 rounded-lg text-sm font-semibold border"
                  style={{
                    borderColor: urgency === u ? (u === "urgent" ? "var(--color-destructive, #ef4444)" : "var(--color-accent)") : "var(--color-card-border)",
                    background: urgency === u ? (u === "urgent" ? "rgba(239,68,68,0.12)" : "var(--color-accent-soft)") : "transparent",
                    color: urgency === u ? (u === "urgent" ? "var(--color-destructive, #ef4444)" : "var(--color-accent)") : "var(--color-foreground)",
                  }}>
                  {u === "urgent" ? "🚨 Urgente" : "Normal"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground block mb-1">Foto (opcional)</label>
            {preview ? (
              <div className="relative">
                <img src={preview} alt="" className="w-full max-h-56 object-cover rounded-lg" />
                <button onClick={() => pickFile(null)} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-card-border text-sm cursor-pointer">
                <Camera size={15} /> Anexar foto
                <input type="file" accept="image/*" capture="environment" className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />
              </label>
            )}
          </div>

          <button disabled={uploading || submit.isPending || !description.trim()}
            onClick={() => submit.mutate()}
            className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-50 inline-flex items-center justify-center gap-2"
            style={{ background: urgency === "urgent" ? "var(--color-destructive, #ef4444)" : "var(--color-accent)" }}>
            {(uploading || submit.isPending) && <Loader2 size={14} className="animate-spin" />}
            Enviar relato ao anfitrião
          </button>
        </div>
      </div>
    </div>
  );
}
