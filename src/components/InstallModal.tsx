import { useEffect, useState } from "react";
import { X, Share, Plus, Smartphone, Monitor, Apple, Copy, Check, Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useInstall } from "@/contexts/InstallContext";

type Tab = "ios" | "android" | "desktop";

export function InstallModal() {
  const { showModal, setShowModal, isIOS, isAndroid, canInstall, triggerInstall, isInstalled } = useInstall();
  const [tab, setTab] = useState<Tab>("android");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!showModal) return;
    if (isIOS) setTab("ios");
    else if (isAndroid) setTab("android");
    else setTab("desktop");
  }, [showModal, isIOS, isAndroid]);

  if (!showModal || isInstalled) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText("https://hostlyb.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const TabBtn = ({ id, icon: Icon, label }: { id: Tab; icon: any; label: string }) => (
    <button
      onClick={() => setTab(id)}
      className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg text-xs font-semibold transition"
      style={{
        background: tab === id ? "var(--color-accent)" : "transparent",
        color: tab === id ? "white" : "var(--color-muted-foreground)",
      }}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-end md:place-items-center bg-black/60 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-background rounded-t-3xl md:rounded-3xl border border-card-border max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-background/95 backdrop-blur border-b border-card-border">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Smartphone size={18} style={{ color: "var(--color-accent)" }} />
            Instalar Hostlyb
          </h2>
          <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Instale o Hostlyb no seu dispositivo para acesso rápido, em ecrã cheio e sem barra de browser.
          </p>

          <div className="flex gap-1 p-1 rounded-xl bg-muted">
            <TabBtn id="ios" icon={Apple} label="iPhone" />
            <TabBtn id="android" icon={Smartphone} label="Android" />
            <TabBtn id="desktop" icon={Monitor} label="Desktop" />
          </div>

          {tab === "ios" && (
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 text-accent font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>1</span>
                <span>Abra <strong>hostlyb.com</strong> no <strong>Safari</strong> (não funciona no Chrome).</span>
              </li>
              <li className="flex gap-3">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>2</span>
                <span className="flex items-center gap-1 flex-wrap">Toque no botão <Share size={14} className="inline" /> <strong>Partilhar</strong> na barra inferior.</span>
              </li>
              <li className="flex gap-3">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>3</span>
                <span className="flex items-center gap-1 flex-wrap">Role e toque em <Plus size={14} className="inline" /> <strong>Adicionar ao ecrã principal</strong>.</span>
              </li>
              <li className="flex gap-3">
                <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>4</span>
                <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
              </li>
            </ol>
          )}

          {tab === "android" && (
            <div className="space-y-3">
              {canInstall && (
                <button
                  onClick={triggerInstall}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: "var(--color-accent)" }}
                >
                  <Download size={16} /> Instalar agora
                </button>
              )}
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>1</span>
                  <span>Abra <strong>hostlyb.com</strong> no <strong>Chrome</strong> ou <strong>Samsung Internet</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>2</span>
                  <span>Toque no <strong>menu (⋮)</strong> no canto superior direito.</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>3</span>
                  <span>Toque em <strong>Instalar app</strong> ou <strong>Adicionar ao ecrã principal</strong>.</span>
                </li>
              </ol>
            </div>
          )}

          {tab === "desktop" && (
            <div className="space-y-3">
              {canInstall && (
                <button
                  onClick={triggerInstall}
                  className="w-full py-3 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
                  style={{ background: "var(--color-accent)" }}
                >
                  <Download size={16} /> Instalar agora
                </button>
              )}
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>1</span>
                  <span>Abra <strong>hostlyb.com</strong> no <strong>Chrome</strong>, <strong>Edge</strong> ou <strong>Brave</strong>.</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>2</span>
                  <span>Clique no <strong>ícone de instalação</strong> na barra de endereço (canto direito).</span>
                </li>
                <li className="flex gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-full bg-accent/15 font-bold text-xs shrink-0" style={{ color: "var(--color-accent)" }}>3</span>
                  <span>Clique em <strong>Instalar</strong> na janela que aparece.</span>
                </li>
              </ol>
            </div>
          )}

          <div className="border-t border-card-border pt-4 space-y-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">✓ Benefícios</p>
            <p>• Notificações automáticas no telemóvel</p>
            <p>• Abre direto do ecrã principal, sem browser</p>
            <p>• Menos de 1 MB de espaço</p>
          </div>

          <div className="border-t border-card-border pt-4 flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl">
              <QRCodeSVG value="https://hostlyb.com" size={72} bgColor="#ffffff" fgColor="#0f172a" level="M" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-1">Abrir no telemóvel</p>
              <p className="text-xs text-muted-foreground mb-2">Aponte a câmara para o QR.</p>
              <button onClick={copy} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-muted font-medium">
                {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar URL</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
