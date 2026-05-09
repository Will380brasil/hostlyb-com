import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PUBLIC_BASE_URL } from "@/lib/public-url";

export const Route = createFileRoute("/diagnostico")({
  head: () => ({ meta: [{ title: "Diagnóstico — Hostlyb" }, { name: "robots", content: "noindex" }] }),
  component: Diagnostico,
});

type Check = { label: string; ok: boolean; value: string; hint?: string };

function Row({ c }: { c: Check }) {
  return (
    <li className="flex items-start gap-3 py-2 border-b border-card-border last:border-0">
      {c.ok ? <CheckCircle2 size={18} style={{ color: "var(--color-success)" }} className="shrink-0 mt-0.5" />
            : <XCircle size={18} className="text-destructive shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{c.label}</p>
        <code className="text-[11px] break-all text-muted-foreground">{c.value}</code>
        {c.hint && <p className="text-[11px] mt-1" style={{ color: "#b45309" }}>⚠ {c.hint}</p>}
      </div>
    </li>
  );
}

function Diagnostico() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const out: Check[] = [];
      const log: string[] = [];
      const t0 = Date.now();
      const push = (m: string) => { console.log("[diag]", m); log.push(`${new Date().toISOString()} ${m}`); };

      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const hostOk = origin === PUBLIC_BASE_URL || origin === "https://www.hostlyb.com";
      out.push({
        label: "Origem do navegador",
        ok: hostOk,
        value: origin,
        hint: hostOk ? undefined : `Esperado: ${PUBLIC_BASE_URL}. Use sempre hostlyb.com em produção.`,
      });
      push(`origin=${origin}`);

      const url = import.meta.env.VITE_SUPABASE_URL;
      out.push({ label: "VITE_SUPABASE_URL", ok: !!url, value: String(url ?? "ausente") });
      const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      out.push({ label: "Chave pública (VITE_SUPABASE_PUBLISHABLE_KEY)", ok: !!key, value: key ? `${String(key).slice(0, 12)}…` : "ausente" });

      try {
        const { data, error } = await supabase.auth.getSession();
        push(`getSession ok=${!!data.session} err=${error?.message ?? "none"} (${Date.now()-t0}ms)`);
        out.push({
          label: "Sessão Supabase",
          ok: !!data.session,
          value: data.session ? `Logado como ${data.session.user.email}` : "Sem sessão ativa",
          hint: error?.message,
        });
      } catch (e: any) {
        push(`getSession threw ${e?.message}`);
        out.push({ label: "Sessão Supabase", ok: false, value: e?.message ?? "erro" });
      }

      try {
        const r = await fetch(`${url}/auth/v1/health`, { headers: { apikey: String(key ?? "") } });
        push(`auth/health -> ${r.status}`);
        out.push({ label: "Auth API health", ok: r.ok, value: `HTTP ${r.status}` });
      } catch (e: any) {
        push(`auth/health failed ${e?.message}`);
        out.push({ label: "Auth API health", ok: false, value: e?.message ?? "falha de rede", hint: "Possível bloqueio de CORS ou rede." });
      }

      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash.includes("error")) {
        out.push({ label: "Erro vindo do link", ok: false, value: decodeURIComponent(hash) });
      }

      setChecks(out);
      setLogs(log);
    })();
  }, []);

  const copyLogs = () => {
    navigator.clipboard.writeText(logs.join("\n") + "\n\n" + checks.map(c => `${c.ok ? "✓" : "✗"} ${c.label}: ${c.value}`).join("\n"));
    toast.success("Diagnóstico copiado");
  };

  return (
    <div className="min-h-screen bg-background px-5 py-8">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-black tracking-tight mb-1">Diagnóstico</h1>
        <p className="text-sm text-muted-foreground mb-5">
          Use esta página para investigar falhas de login ou de confirmação por e-mail.
        </p>

        <div className="hostly-card !p-4 mb-4">
          <h2 className="font-bold text-sm mb-2 flex items-center gap-2">
            <AlertTriangle size={14} /> Verificações
          </h2>
          <ul>{checks.map((c, i) => <Row key={i} c={c} />)}</ul>
        </div>

        <div className="hostly-card !p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-bold text-sm">Logs</h2>
            <button onClick={copyLogs} className="btn-secondary text-xs"><Copy size={12} /> Copiar tudo</button>
          </div>
          <pre className="text-[11px] whitespace-pre-wrap break-all bg-background rounded p-2 max-h-64 overflow-auto">
{logs.join("\n") || "Coletando…"}
          </pre>
        </div>

        <p className="text-xs text-muted-foreground">
          Se algo aparecer com ✗, copie o diagnóstico e nos envie. Os links oficiais devem sempre apontar para{" "}
          <code>{PUBLIC_BASE_URL}</code>.
        </p>
      </div>
    </div>
  );
}
