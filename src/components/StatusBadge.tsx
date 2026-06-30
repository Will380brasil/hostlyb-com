import { useT } from "@/lib/i18n";

type Status =
  | "ocupado" | "livre" | "limpeza" | "manutencao"
  | "agendado" | "em_andamento" | "concluido" | "cancelado"
  | "hospedado" | "confirmado" | "checkout"
  | "devolvido" | "descartado";

const style: Record<Status, { color: string; bg: string }> = {
  ocupado:      { color: "var(--color-accent)",            bg: "var(--color-accent-soft)" },
  livre:        { color: "var(--color-success)",           bg: "var(--color-success-soft)" },
  limpeza:      { color: "var(--color-warning)",           bg: "var(--color-warning-soft)" },
  manutencao:   { color: "var(--color-info)",              bg: "var(--color-info-soft)" },
  agendado:     { color: "var(--color-info)",              bg: "var(--color-info-soft)" },
  em_andamento: { color: "var(--color-warning)",           bg: "var(--color-warning-soft)" },
  concluido:    { color: "var(--color-success)",           bg: "var(--color-success-soft)" },
  cancelado:    { color: "var(--color-muted-foreground)",  bg: "rgba(122,125,142,0.15)" },
  hospedado:    { color: "var(--color-accent)",            bg: "var(--color-accent-soft)" },
  confirmado:   { color: "var(--color-success)",           bg: "var(--color-success-soft)" },
  checkout:     { color: "var(--color-muted-foreground)",  bg: "rgba(122,125,142,0.15)" },
  devolvido:    { color: "var(--color-success)",           bg: "var(--color-success-soft)" },
  descartado:   { color: "var(--color-muted-foreground)",  bg: "rgba(122,125,142,0.15)" },
};

const fallbackLabel: Record<string, string> = {
  ocupado: "Ocupado", livre: "Livre", limpeza: "Em limpeza", manutencao: "Manutenção",
  agendado: "Agendado", em_andamento: "Em curso", concluido: "Concluído", cancelado: "Cancelado",
  hospedado: "Hospedado", confirmado: "Confirmado", checkout: "Check-out",
  devolvido: "Devolvido", descartado: "Descartado",
};

export function StatusBadge({ status }: { status: Status }) {
  const t = useT();
  const s = style[status] ?? style.cancelado;
  const key = `status.${status}`;
  const translated = t(key);
  const label = translated === key ? (fallbackLabel[status] ?? status) : translated;
  return (
    <span className="hostly-pill" style={{ color: s.color, background: s.bg }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: s.color }} />
      {label}
    </span>
  );
}
