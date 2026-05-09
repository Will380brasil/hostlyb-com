import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/pwa-check")({
  head: () => ({ meta: [{ title: "Diagnóstico PWA — Hostlyb" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: PwaCheckPage,
});

type Status = "ok" | "warn" | "fail" | "pending";
type Check = { id: string; label: string; status: Status; detail?: string; fix?: string };

function PwaCheckPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [installable, setInstallable] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      const results: Check[] = [];

      // 1. Secure context
      results.push({
        id: "https",
        label: "Servido por HTTPS (ou localhost)",
        status: window.isSecureContext ? "ok" : "fail",
        detail: window.isSecureContext ? location.origin : "PWA exige HTTPS",
        fix: "Publique o app em https://hostlyb.com — preview em iframe não conta como contexto seguro.",
      });

      // 2. Manifest link tag
      const manifestLink = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
      results.push({
        id: "manifest-link",
        label: '<link rel="manifest"> no <head>',
        status: manifestLink ? "ok" : "fail",
        detail: manifestLink?.href ?? "Tag ausente",
        fix: 'Adicione <link rel="manifest" href="/site.webmanifest"> em src/routes/__root.tsx no head.',
      });

      // 3. Manifest fetch + validate
      let manifest: any = null;
      if (manifestLink?.href) {
        try {
          const r = await fetch(manifestLink.href);
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          manifest = await r.json();
          results.push({ id: "manifest-fetch", label: "Manifest carrega e é JSON válido", status: "ok", detail: manifestLink.href });
        } catch (e: any) {
          results.push({
            id: "manifest-fetch", label: "Manifest carrega e é JSON válido",
            status: "fail", detail: e.message,
            fix: "Verifique se public/site.webmanifest existe e contém JSON válido. Teste em: " + manifestLink.href,
          });
        }
      }

      const required = ["name", "short_name", "start_url", "display", "icons"];
      if (manifest) {
        const missing = required.filter((k) => !manifest[k]);
        results.push({
          id: "manifest-fields",
          label: `Campos obrigatórios: ${required.join(", ")}`,
          status: missing.length ? "fail" : "ok",
          detail: missing.length ? `Faltando: ${missing.join(", ")}` : "Todos presentes",
          fix: missing.length ? `Adicione os campos ausentes em public/site.webmanifest: ${missing.join(", ")}.` : undefined,
        });

        const okDisplay = ["standalone", "fullscreen", "minimal-ui"].includes(manifest.display);
        results.push({
          id: "manifest-display",
          label: 'display: "standalone" / "fullscreen" / "minimal-ui"',
          status: okDisplay ? "ok" : "fail",
          detail: `display = "${manifest.display ?? "(ausente)"}"`,
          fix: okDisplay ? undefined : 'Defina "display": "standalone" em public/site.webmanifest.',
        });

        const icons: any[] = manifest.icons ?? [];
        const has192 = icons.some((i) => /(^|\s)192x192(\s|$)/.test(i.sizes ?? ""));
        const has512 = icons.some((i) => /(^|\s)512x512(\s|$)/.test(i.sizes ?? ""));
        results.push({
          id: "icons-required",
          label: "Ícones 192×192 e 512×512 declarados",
          status: has192 && has512 ? "ok" : "fail",
          detail: `192=${has192 ? "ok" : "✗"} · 512=${has512 ? "ok" : "✗"}`,
          fix: has192 && has512 ? undefined : "Inclua ícones PNG 192×192 e 512×512 em public/ e referencie-os em site.webmanifest.",
        });

        const hasMaskable = icons.some((i) => (i.purpose ?? "").includes("maskable"));
        results.push({
          id: "icons-maskable",
          label: 'Ícone com purpose="maskable" (Android)',
          status: hasMaskable ? "ok" : "warn",
          detail: hasMaskable ? "ok" : "Recomendado",
          fix: hasMaskable ? undefined : 'Adicione "purpose": "any maskable" ao ícone 512×512 do manifest.',
        });

        const iconResults = await Promise.all(
          icons.map(async (i) => {
            try {
              const u = new URL(i.src, manifestLink!.href).href;
              const r = await fetch(u, { method: "GET" });
              return { src: u, ok: r.ok, status: r.status };
            } catch { return { src: i.src, ok: false, status: 0 }; }
          })
        );
        const broken = iconResults.filter((r) => !r.ok);
        results.push({
          id: "icons-fetch",
          label: `Todos os ícones do manifest retornam 200 (${iconResults.length})`,
          status: iconResults.length === 0 ? "fail" : broken.length ? "fail" : "ok",
          detail: broken.length ? broken.map((b) => `${b.src} → ${b.status}`).join(" · ") : "todos ok",
          fix: broken.length ? "Confirme que os arquivos existem em public/ e que o caminho no manifest é absoluto (começa com /)." : undefined,
        });
      }

      // 4. Service Worker
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        results.push({
          id: "sw",
          label: "Service Worker registrado",
          status: regs.length ? "ok" : "warn",
          detail: regs.length ? regs.map((r) => r.active?.scriptURL ?? r.scope).join(", ") : "Sem SW",
          fix: regs.length ? undefined : "Para PWA 'apenas instalável' (configuração atual) o SW é opcional. Chrome/Android pode não exibir o prompt automático sem SW — use 'Adicionar à tela inicial' no menu.",
        });
      } else {
        results.push({ id: "sw", label: "Service Worker disponível no navegador", status: "fail", detail: "API ausente",
          fix: "Use um navegador moderno (Chrome, Edge, Safari, Firefox)." });
      }

      // 5. Apple meta tags (iOS)
      const appleCapable = !!document.querySelector('meta[name="apple-mobile-web-app-capable"]');
      const appleIcon = !!document.querySelector('link[rel="apple-touch-icon"]');
      results.push({
        id: "apple",
        label: "Tags Apple (iOS)",
        status: appleCapable && appleIcon ? "ok" : "warn",
        detail: `capable=${appleCapable ? "ok" : "✗"} · touch-icon=${appleIcon ? "ok" : "✗"}`,
        fix: appleCapable && appleIcon ? undefined : 'Adicione no head: <meta name="apple-mobile-web-app-capable" content="yes"> e <link rel="apple-touch-icon" href="/apple-touch-icon.png">.',
      });

      // 6. theme-color
      const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
      results.push({
        id: "theme",
        label: 'meta name="theme-color"',
        status: themeColor ? "ok" : "warn",
        detail: themeColor?.content ?? "ausente",
        fix: themeColor ? undefined : 'Adicione <meta name="theme-color" content="#FF6B6B"> no head.',
      });

      // 7. Already installed?
      const standalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      results.push({
        id: "installed",
        label: "App rodando em modo standalone",
        status: standalone ? "ok" : "warn",
        detail: standalone ? "Sim" : "Não",
        fix: standalone ? undefined : "Após instalar, reabra pelo ícone do app na tela inicial para ver standalone=true.",
      });

      setChecks(results);
    })();

    // beforeinstallprompt — só dispara quando todos os critérios estão ok (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const t = setTimeout(() => setInstallable((v) => (v === null ? false : v)), 4000);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(t);
    };
  }, []);

  const score = {
    ok: checks.filter((c) => c.status === "ok").length,
    warn: checks.filter((c) => c.status === "warn").length,
    fail: checks.filter((c) => c.status === "fail").length,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", padding: "32px 24px", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111", marginBottom: 4 }}>Diagnóstico PWA</h1>
        <p style={{ color: "#9E9E9E", fontSize: 14, marginBottom: 24 }}>
          Verifica manifest, ícones, service worker e tags Apple — abra esta página no celular para confirmar instalabilidade.
        </p>

        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          <Pill color="#00C896" label={`${score.ok} ok`} />
          <Pill color="#FFB347" label={`${score.warn} avisos`} />
          <Pill color="#FF6B6B" label={`${score.fail} falhas`} />
          <Pill
            color={installable ? "#00C896" : "#9E9E9E"}
            label={installable === null ? "verificando instalabilidade…" : installable ? "Chrome aceita instalar (beforeinstallprompt disparou)" : "beforeinstallprompt não disparou"}
          />
        </div>

        <ul style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {checks.map((c) => (
            <li
              key={c.id}
              style={{
                background: "#fff",
                border: "1px solid #EFEFEF",
                borderLeft: `4px solid ${color(c.status)}`,
                borderRadius: 12,
                padding: "12px 16px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <span style={{ fontWeight: 600, color: "#212121" }}>
                  {icon(c.status)} {c.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: color(c.status), textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {c.status}
                </span>
              </div>
              {c.detail && (
                <p style={{ marginTop: 6, color: "#616161", fontSize: 12, fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }}>
                  {c.detail}
                </p>
              )}
              {c.fix && c.status !== "ok" && (
                <p style={{ marginTop: 8, padding: "8px 10px", background: "#FFF8E1", border: "1px dashed #FFD580", borderRadius: 8, color: "#7a4a00", fontSize: 12 }}>
                  <strong>Como corrigir:</strong> {c.fix}
                </p>
              )}
            </li>
          ))}
        </ul>

        <section style={{ marginTop: 28, background: "#fff", border: "1px solid #EFEFEF", borderRadius: 16, padding: 20 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, marginBottom: 12, color: "#111" }}>Como testar instalação no Android</h2>
          <ol style={{ color: "#424242", fontSize: 14, lineHeight: 1.7, paddingLeft: 18 }}>
            <li>Publique o app (PWA não funciona no preview iframe).</li>
            <li>Abra a URL pública no <strong>Chrome do Android</strong>.</li>
            <li>Visite esta página <code>/pwa-check</code> e confirme que <strong>todos os itens estão verdes</strong>.</li>
            <li>Toque no menu (⋮) → <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
            <li>Se o item "Instalar" não aparecer, o item vermelho desta página explica o motivo.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

const color = (s: Status) => (s === "ok" ? "#00C896" : s === "warn" ? "#FFB347" : s === "fail" ? "#FF6B6B" : "#9E9E9E");
const icon = (s: Status) => (s === "ok" ? "✅" : s === "warn" ? "⚠️" : s === "fail" ? "❌" : "⏳");

function Pill({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 999, background: color + "1A", color, fontSize: 12, fontWeight: 700 }}>
      {label}
    </span>
  );
}
