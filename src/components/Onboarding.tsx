import { useEffect, useState } from "react";
import { Home, Sparkles, Users, Calendar, ChevronRight, X, HelpCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

const KEY = "hostlyb_onboarding_v1";

const STEPS = [
  {
    icon: Home,
    title: "Cadastre seus imóveis",
    desc: "Adicione cada propriedade com endereço, fotos e regras de check-in.",
    cta: { to: "/imoveis", label: "Ir para Imóveis" },
  },
  {
    icon: Sparkles,
    title: "Agende a primeira limpeza",
    desc: "Crie uma limpeza com checklist e gere um link único para a faxineira — sem login.",
    cta: { to: "/limpezas", label: "Ir para Limpezas" },
  },
  {
    icon: Users,
    title: "Registre hóspedes",
    desc: "Acompanhe quem está chegando, valor da reserva e objetos esquecidos.",
    cta: { to: "/hospedes", label: "Ir para Hóspedes" },
  },
  {
    icon: Calendar,
    title: "Sincronize seu calendário",
    desc: "Veja reservas, limpezas e checkouts num só lugar.",
    cta: { to: "/calendario", label: "Ir para Calendário" },
  },
];

export function Onboarding({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  if (!open) return null;
  const S = STEPS[step];
  const Icon = S.icon;
  const last = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-card-border rounded-2xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} aria-label="Fechar" className="absolute top-3 right-3 text-muted-foreground">
          <X size={18} />
        </button>

        <div className="grid place-items-center w-14 h-14 rounded-2xl mb-4" style={{ background: "var(--color-accent-soft, #ffe4e0)", color: "var(--color-accent)" }}>
          <Icon size={26} />
        </div>

        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
          Passo {step + 1} de {STEPS.length}
        </p>
        <h2 className="text-xl font-bold mb-2">{S.title}</h2>
        <p className="text-sm text-muted-foreground mb-5">{S.desc}</p>

        <div className="flex gap-1.5 mb-5">
          {STEPS.map((_, i) => (
            <span key={i} className="flex-1 h-1.5 rounded-full" style={{ background: i <= step ? "var(--color-accent)" : "var(--color-card-border, #e5e5e5)" }} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => (last ? onClose() : setStep((s) => s + 1))}
            className="btn-primary justify-center flex-1"
          >
            {last ? "Concluir" : "Próximo"} <ChevronRight size={16} />
          </button>
          <Link
            to={S.cta.to as any}
            onClick={onClose}
            className="btn-secondary"
          >
            {S.cta.label}
          </Link>
        </div>

        {step === 0 && (
          <button onClick={onClose} className="block mx-auto mt-4 text-xs text-muted-foreground">
            Pular tour
          </button>
        )}
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem(KEY)) {
      setOpen(true);
      localStorage.setItem(KEY, new Date().toISOString());
    }
  }, []);

  return {
    open,
    show: () => setOpen(true),
    close: () => setOpen(false),
  };
}

export function OnboardingHelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{ background: "var(--color-accent-soft, #ffe4e0)", color: "var(--color-accent)" }}
    >
      <HelpCircle size={13} /> Ver onboarding
    </button>
  );
}
