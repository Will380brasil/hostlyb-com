import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function getStrength(pw: string): { level: number; label: string; color: string } {
  if (pw.length === 0) return { level: 0, label: "", color: "#EFEFEF" };
  if (pw.length < 6) return { level: 1, label: "Muito fraca", color: "#FF6B6B" };
  if (pw.length < 8) return { level: 2, label: "Fraca", color: "#FFB347" };
  const score =
    Number(/[A-Z]/.test(pw)) + Number(/[0-9]/.test(pw)) + Number(/[^A-Za-z0-9]/.test(pw));
  if (score === 0) return { level: 2, label: "Fraca", color: "#FFB347" };
  if (score === 1) return { level: 3, label: "Média", color: "#4A9EFF" };
  if (score === 2) return { level: 4, label: "Forte", color: "#00C896" };
  return { level: 5, label: "Muito forte", color: "#00C896" };
}

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showStrength?: boolean;
  required?: boolean;
  minLength?: number;
  className?: string;
}

export function PasswordField({
  value, onChange, placeholder = "••••••••",
  showStrength = false, required, minLength = 6, className = "",
}: Props) {
  const [show, setShow] = useState(false);
  const s = showStrength ? getStrength(value) : null;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete="new-password"
          className={`w-full pr-12 ${className || "px-4 py-3 rounded-xl bg-card border border-card-border"}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          tabIndex={-1}
          aria-label={show ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {showStrength && value.length > 0 && s && (
        <div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{ background: i <= s.level ? s.color : "#EFEFEF" }}
              />
            ))}
          </div>
          <p className="text-xs mt-1" style={{ color: s.color }}>{s.label}</p>
        </div>
      )}
    </div>
  );
}
