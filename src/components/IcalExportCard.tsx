import { useEffect, useState } from "react";
import { Calendar, Copy, Check, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function IcalExportCard() {
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data } = await supabase
        .from("profiles")
        .select("ical_export_token")
        .eq("id", u.user.id)
        .maybeSingle();
      if (data?.ical_export_token) setToken(data.ical_export_token as string);
    })();
  }, []);

  if (!token) return null;
  const url = `${window.location.origin}/api/public/calendar/${token}.ics`;
  const gcalUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(url)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <section className="mt-6">
      <div className="hostly-card !p-4">
        <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center gap-3 text-left">
          <div className="grid place-items-center w-10 h-10 rounded-xl shrink-0" style={{ background: "rgba(74,158,255,0.12)", color: "#4A9EFF" }}>
            <Calendar size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Exportar para Google Calendar</p>
            <p className="text-xs text-muted-foreground">Sincronize suas reservas com qualquer calendário (.ics).</p>
          </div>
          <span className="text-xs text-muted-foreground">{open ? "Fechar" : "Abrir"}</span>
        </button>

        {open && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-2">
              <input
                readOnly
                value={url}
                className="flex-1 min-w-0 text-xs font-mono px-3 py-2 rounded-lg bg-muted border-none outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button onClick={copy} className="px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5" style={{ background: "var(--color-accent)", color: "white" }}>
                {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
              </button>
            </div>
            <a
              href={gcalUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-semibold bg-muted"
            >
              <ExternalLink size={14} /> Adicionar ao Google Calendar
            </a>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Esta URL é privada — não a partilhe. Atualiza a cada 15 minutos no Google Calendar.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
