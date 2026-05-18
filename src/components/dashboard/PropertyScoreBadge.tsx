import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CleaningStats = {
  property_id: string;
  last_cleaning_at: string | null;
  cleanings_this_month: number;
  open_issues: number;
  avg_duration_minutes: number | null;
};

export function useCleaningStats(propertyId?: string) {
  return useQuery({
    queryKey: ["cleaning-stats", propertyId ?? "all"],
    queryFn: async () => {
      const q = supabase.from("property_cleaning_stats" as any).select("*");
      const { data, error } = propertyId ? await q.eq("property_id", propertyId) : await q;
      if (error) throw error;
      return (data ?? []) as unknown as CleaningStats[];
    },
  });
}

export function scoreFor(s: CleaningStats | undefined): { tone: "green" | "yellow" | "red"; emoji: string; label: string } {
  if (!s) return { tone: "yellow", emoji: "🟡", label: "Atenção" };
  if (s.open_issues > 0) return { tone: "red", emoji: "🔴", label: "Problema" };
  if (!s.last_cleaning_at) return { tone: "red", emoji: "🔴", label: "Sem limpeza" };
  const days = Math.floor((Date.now() - new Date(s.last_cleaning_at).getTime()) / 86400000);
  if (days <= 14) return { tone: "green", emoji: "🟢", label: "Excelente" };
  if (days <= 45) return { tone: "yellow", emoji: "🟡", label: "Atenção" };
  return { tone: "red", emoji: "🔴", label: "Atrasada" };
}

export function PropertyScoreBadge({ propertyId, compact = false }: { propertyId: string; compact?: boolean }) {
  const { data = [] } = useCleaningStats(propertyId);
  const s = data[0];
  const score = scoreFor(s);
  const last = s?.last_cleaning_at ? new Date(s.last_cleaning_at).toLocaleDateString("pt-BR") : "—";
  const color =
    score.tone === "green" ? "var(--color-success)" :
    score.tone === "yellow" ? "var(--color-warning)" : "var(--color-destructive, #ef4444)";
  const bg =
    score.tone === "green" ? "var(--color-success-soft)" :
    score.tone === "yellow" ? "var(--color-warning-soft)" : "rgba(239,68,68,0.12)";

  if (compact) {
    return (
      <span title={`${score.label} · última: ${last} · ${s?.cleanings_this_month ?? 0} no mês · ${s?.open_issues ?? 0} problema(s)`}
        className="text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
        style={{ background: bg, color }}>
        {score.emoji} {score.label}
      </span>
    );
  }

  return (
    <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: bg }}>
      <span className="text-2xl">{score.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm" style={{ color }}>{score.label}</p>
        <p className="text-[11px] text-muted-foreground">
          Última: {last} · {s?.cleanings_this_month ?? 0} no mês · {s?.open_issues ?? 0} problema(s)
        </p>
      </div>
    </div>
  );
}
