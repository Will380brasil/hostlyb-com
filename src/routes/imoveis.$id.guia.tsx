import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PremiumGate } from "@/components/PremiumGate";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { ArrowLeft, Copy, QrCode as QrIcon, MessageCircle, Save, Globe } from "lucide-react";
import QRCode from "qrcode";

export const Route = createFileRoute("/imoveis/$id/guia")({
  head: () => ({ meta: [{ title: "Guia — Hostlyb" }, { name: "robots", content: "noindex" }] }),
  component: () => <AppShell><PremiumGate><GuidebookEditor /></PremiumGate></AppShell>,
});

type GBData = {
  checkin?: string; checkout?: string; wifi?: string; rules?: string;
  appliances?: string; tips?: string; host?: string;
};

function slugify() {
  return Math.random().toString(36).slice(2, 10);
}

function GuidebookEditor() {
  const { id } = Route.useParams();
  const t = useT();
  const qc = useQueryClient();
  const [data, setData] = useState<GBData>({});
  const [enabled, setEnabled] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [qr, setQr] = useState<string | null>(null);

  const { data: p } = useQuery({
    queryKey: ["property-gb", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("properties")
        .select("id,name,guidebook_enabled,guidebook_slug,guidebook_data,wifi_password")
        .eq("id", id).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (p) {
      setData((p.guidebook_data as GBData) ?? {});
      setEnabled(!!p.guidebook_enabled);
      setSlug(p.guidebook_slug ?? null);
    }
  }, [p]);

  const publicUrl = slug ? `${window.location.origin}/guia/${slug}` : "";

  useEffect(() => {
    if (publicUrl) QRCode.toDataURL(publicUrl, { width: 256, margin: 1 }).then(setQr).catch(() => setQr(null));
  }, [publicUrl]);

  const save = useMutation({
    mutationFn: async (publish: boolean) => {
      const newSlug = slug ?? slugify();
      const payload: any = {
        guidebook_data: data,
        guidebook_slug: newSlug,
        guidebook_enabled: publish,
      };
      const { error } = await supabase.from("properties").update(payload).eq("id", id);
      if (error) throw error;
      return newSlug;
    },
    onSuccess: (s) => {
      setSlug(s);
      toast.success(t("guidebook.save"));
      qc.invalidateQueries({ queryKey: ["property-gb", id] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const set = (k: keyof GBData, v: string) => setData((d) => ({ ...d, [k]: v }));

  return (
    <>
      <Link to="/imoveis/$id" params={{ id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground mb-3">
        <ArrowLeft size={16} /> {p?.name ?? "—"}
      </Link>
      <h2 className="text-2xl font-bold">{t("guidebook.title")}</h2>
      <p className="text-sm text-muted-foreground mb-4">{t("guidebook.subtitle")}</p>

      {enabled && slug && (
        <section className="hostly-card mb-4">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Globe size={12} /> {t("guidebook.publicLink")}</div>
          <code className="block text-xs break-all bg-secondary p-2 rounded mb-2">{publicUrl}</code>
          <div className="flex flex-wrap gap-2">
            <button className="btn-secondary" onClick={() => { navigator.clipboard.writeText(publicUrl); toast.success(t("guidebook.copyLink")); }}>
              <Copy size={14} /> {t("guidebook.copyLink")}
            </button>
            <a className="btn-secondary" target="_blank" rel="noreferrer"
              href={`https://wa.me/?text=${encodeURIComponent(publicUrl)}`}>
              <MessageCircle size={14} /> {t("guidebook.shareWa")}
            </a>
          </div>
          {qr && (
            <div className="mt-4 flex items-start gap-3">
              <img src={qr} alt="QR" width={128} height={128} className="rounded border" />
              <div className="text-xs text-muted-foreground"><QrIcon size={12} className="inline" /> {t("guidebook.qrcode")}</div>
            </div>
          )}
        </section>
      )}

      <section className="hostly-card mb-4 grid gap-3">
        {([
          ["checkin", "guidebook.field.checkin"],
          ["checkout", "guidebook.field.checkout"],
          ["wifi", "guidebook.field.wifi"],
          ["rules", "guidebook.field.rules"],
          ["appliances", "guidebook.field.appliances"],
          ["tips", "guidebook.field.tips"],
          ["host", "guidebook.field.host"],
        ] as [keyof GBData, string][]).map(([k, label]) => (
          <label key={k} className="text-sm">
            <span className="block font-semibold mb-1">{t(label)}</span>
            <textarea className="w-full rounded-lg border p-2 text-sm min-h-[70px]"
              value={data[k] ?? ""} onChange={(e) => set(k, e.target.value)} />
          </label>
        ))}
      </section>

      <div className="flex gap-2 mb-8">
        <button className="btn-primary flex-1 justify-center" onClick={() => save.mutate(true)} disabled={save.isPending}>
          <Save size={14} /> {enabled ? t("guidebook.save") : t("guidebook.enable")}
        </button>
        {enabled && (
          <button className="btn-secondary" onClick={() => { setEnabled(false); save.mutate(false); }}>
            {t("guidebook.disable")}
          </button>
        )}
      </div>
    </>
  );
}
