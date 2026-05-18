import { Download } from "lucide-react";
import { useInstall } from "@/contexts/InstallContext";

export function InstallButton({ compact = false }: { compact?: boolean }) {
  const { isInstalled, setShowModal } = useInstall();
  if (isInstalled) return null;
  if (compact) {
    return (
      <button
        onClick={() => setShowModal(true)}
        aria-label="Instalar app"
        title="Instalar app"
        className="grid place-items-center w-10 h-10 rounded-full"
        style={{ background: "rgba(255,107,107,0.12)", color: "var(--color-accent)" }}
      >
        <Download size={16} />
      </button>
    );
  }
  return (
    <button
      onClick={() => setShowModal(true)}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold"
      style={{ background: "rgba(255,107,107,0.12)", color: "var(--color-accent)" }}
    >
      <Download size={14} /> Instalar app
    </button>
  );
}
