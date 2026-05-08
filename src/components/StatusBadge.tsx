type Status =
  | "ocupado" | "livre" | "limpeza" | "manutencao"
  | "agendado" | "em_andamento" | "concluido" | "cancelado"
  | "hospedado" | "confirmado" | "checkout";

const map: Record<Status, { label: string; color: string; bg: string }> = {
  ocupado:      { label: "Ocupado",      color: "var(--color-accent)",  bg: "var(--color-accent-soft)" },
  livre:        { label: "Livre",        color: "var(--color-success)", bg: "var(--color-success-soft)" },
  limpeza:      { label: "Em Limpeza",   color: "var(--color-warning)", bg: "var(--color-warning-soft)" },
  manutencao:   { label: "Manutenção",   color: "var(--color-info)",    bg: "var(--color-info-soft)" },
  agendado:     { label: "Agendado",     color: "var(--color-info)",    bg: "var(--color-info-soft)" },
  em_andamento: { label: "Em andamento", color: "var(--color-warning)", bg: "var(--color-warning-soft)" },
  concluido:    { label: "Concluído",    color: "var(--color-success)", bg: "var(--color-success-soft)" },
  cancelado:    { label: "Cancelado",    color: "var(--color-muted-foreground)", bg: "rgba(122,125,142,0.15)" },
  hospedado:    { label: "Hospedado",    color: "var(--color-accent)",  bg: "var(--color-accent-soft)" },
  confirmado:   { label: "Confirmado",   color: "var(--color-success)", bg: "var(--color-success-soft)" },
  checkout:     { label: "Check-out",    color: "var(--color-muted-foreground)", bg: "rgba(122,125,142,0.15)" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = map[status];
  return (
    <span className="hostly-pill" style={{ color: s.color, background: s.bg }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />
      {s.label}
    </span>
  );
}
