import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { useInstall } from "@/contexts/InstallContext";

const KEY = "hostlyb_install_banner_dismissed_v1";

export function InstallBanner() {
  const { isInstalled, setShowModal } = useInstall();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInstalled) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY)) return;
    const t = setTimeout(() => setShow(true), 30_000);
    return () => clearTimeout(t);
  }, [isInstalled]);

  if (!show || isInstalled) return null;

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setShow(false);
  };

  return (
    <div className="hostly-card !p-3 mb-4 flex items-center gap-3" style={{ background: "var(--color-accent-soft, rgba(255,107,107,0.08))" }}>
      <div className="grid place-items-center w-10 h-10 rounded-xl shrink-0" style={{ background: "var(--color-accent)", color: "white" }}>
        <Download size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">Instale o Hostlyb no seu telemóvel</p>
        <p className="text-xs text-muted-foreground">Acesso mais rápido + notificações automáticas.</p>
      </div>
      <button
        onClick={() => { setShowModal(true); dismiss(); }}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white shrink-0"
        style={{ background: "var(--color-accent)" }}
      >
        Instalar
      </button>
      <button onClick={dismiss} aria-label="Dispensar" className="p-1 text-muted-foreground hover:text-foreground">
        <X size={16} />
      </button>
    </div>
  );
}
