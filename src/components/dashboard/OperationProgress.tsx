import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Check, X, Crown } from "lucide-react";

type Criterion = { key: string; label: string; done: boolean; to?: string; premium?: boolean };

export function OperationProgress() {
  const [open, setOpen] = useState(false);

  const { data: stats } = useQuery({
    queryKey: ["ops-progress"],
    queryFn: async () => {
      const [{ data: props }, { data: guests }, { data: jobs }, { count: txCount }, { count: memberCount }] = await Promise.all([
        supabase.from("properties").select("id, notes").eq("archived", false),
        supabase.from("guests").select("id, email, phone").limit(20),
        supabase.from("cleaning_jobs").select("id").limit(1),
        supabase.from("transactions").select("id", { count: "exact", head: true }),
        supabase.from("organization_members").select("id", { count: "exact", head: true }),
      ]);
      const propsWithChecklist = (props ?? []).filter((p: any) => (p.notes ?? "").length > 0).length;
      const guestsComplete = (guests ?? []).filter((g: any) => g.email && g.phone).length;
      return {
        hasProp: (props?.length ?? 0) > 0,
        propsWithChecklist: propsWithChecklist > 0,
        guestsComplete: guestsComplete > 0,
        hasJob: (jobs?.length ?? 0) > 0,
        hasTx: (txCount ?? 0) > 0,
        hasTeam: (memberCount ?? 0) > 1,
      };
    },
  });

  const criteria: Criterion[] = [
    { key: "prop", label: "Imóvel cadastrado", done: !!stats?.hasProp, to: "/imoveis" },
    { key: "checklist", label: "Imóvel com checklist configurado", done: !!stats?.propsWithChecklist, to: "/imoveis" },
    { key: "guests", label: "Hóspede com dados completos", done: !!stats?.guestsComplete, to: "/hospedes" },
    { key: "job", label: "Limpeza registrada", done: !!stats?.hasJob, to: "/limpezas" },
    { key: "fin", label: "Lançamento financeiro", done: !!stats?.hasTx, to: "/financeiro" },
    { key: "team", label: "Funcionário convidado", done: !!stats?.hasTeam, to: "/equipe" },
    { key: "guidebook", label: "Guia digital do imóvel ativo", done: false, premium: true, to: "/assinar" },
  ];

  const total = criteria.length;
  const doneCount = criteria.filter(c => c.done).length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <section className="mt-6">
      <button onClick={() => setOpen(o => !o)} className="w-full hostly-card !p-3 text-left">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-sm font-semibold">Sua operação está {pct}% organizada</p>
          <span className="text-xs text-muted-foreground">{doneCount}/{total}</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--color-card-border)" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: "var(--color-accent)" }} />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1.5">
          {open ? "Toque para esconder" : "Toque para ver o que falta"}
        </p>
      </button>

      {open && (
        <ul className="mt-2 flex flex-col gap-1.5">
          {criteria.map(c => (
            <li key={c.key}>
              <Link to={c.to ?? "/app"} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-card-border text-sm">
                {c.done ? (
                  <span className="w-5 h-5 rounded-full grid place-items-center" style={{ background: "var(--color-success-soft)", color: "var(--color-success)" }}><Check size={12} /></span>
                ) : (
                  <span className="w-5 h-5 rounded-full grid place-items-center border" style={{ borderColor: "var(--color-card-border)", color: "var(--color-muted-foreground)" }}><X size={12} /></span>
                )}
                <span className={c.done ? "text-muted-foreground line-through" : ""}>{c.label}</span>
                {c.premium && <Crown size={12} className="ml-auto" style={{ color: "var(--color-warning)" }} />}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
