import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/format";
import { useLocale } from "@/lib/i18n";
import { LogIn, LogOut, Sparkles, Users, Wrench, Wallet } from "lucide-react";
import { useState } from "react";

function todayStr() { return new Date().toISOString().slice(0, 10); }

function Card({ to, icon: Icon, label, value, color, onClick }: any) {
  const inner = (
    <div className="hostly-card !p-3 flex flex-col gap-1 h-full active:scale-[0.98] transition cursor-pointer">
      <div className="flex items-center justify-between">
        <div className="grid place-items-center w-8 h-8 rounded-lg" style={{ background: color + "22", color }}>
          <Icon size={15} />
        </div>
        <span className="text-2xl font-bold leading-none">{value}</span>
      </div>
      <p className="text-[11px] text-muted-foreground leading-tight">{label}</p>
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  return <button onClick={onClick} className="text-left">{inner}</button>;
}

export function OperationCenter() {
  const { currency, lang } = useLocale();
  const today = todayStr();
  const [listOpen, setListOpen] = useState<null | "checkin" | "checkout" | "staying">(null);

  const { data: guests = [] } = useQuery({
    queryKey: ["ops-guests-today", today],
    queryFn: async () => {
      const { data } = await supabase
        .from("guests")
        .select("id, name, checkin_date, checkout_date, total_value, properties(name)")
        .or(`checkin_date.eq.${today},checkout_date.eq.${today},and(checkin_date.lte.${today},checkout_date.gt.${today})`);
      return data ?? [];
    },
  });

  const { data: pendingCleanings = 0 } = useQuery({
    queryKey: ["ops-pending-cleanings"],
    queryFn: async () => {
      const { count } = await supabase.from("cleaning_jobs").select("id", { count: "exact", head: true })
        .in("status", ["agendado", "em_andamento", "problema"]);
      return count ?? 0;
    },
  });

  const { data: openIssues = 0 } = useQuery({
    queryKey: ["ops-open-issues"],
    queryFn: async () => {
      const { count } = await supabase.from("maintenance_issues" as any).select("id", { count: "exact", head: true }).eq("status", "open");
      return count ?? 0;
    },
  });

  const checkins = guests.filter((g: any) => g.checkin_date === today);
  const checkouts = guests.filter((g: any) => g.checkout_date === today);
  const staying = guests.filter((g: any) => g.checkin_date <= today && g.checkout_date > today);
  const revenue = checkins.reduce((s: number, g: any) => s + Number(g.total_value ?? 0), 0);

  return (
    <section className="mt-4">
      <h3 className="font-bold mb-3">Hoje na sua operação</h3>
      <div className="grid grid-cols-3 gap-2">
        <Card icon={LogIn} label="Check-ins hoje" value={checkins.length} color="#00C896" onClick={() => setListOpen("checkin")} />
        <Card icon={LogOut} label="Check-outs hoje" value={checkouts.length} color="#FFB347" onClick={() => setListOpen("checkout")} />
        <Card to="/limpezas" icon={Sparkles} label="Limpezas pendentes" value={pendingCleanings} color="#4A9EFF" />
        <Card icon={Users} label="Hospedados agora" value={staying.length} color="#9B72CF" onClick={() => setListOpen("staying")} />
        {openIssues > 0 && (
          <Card to="/alertas" icon={Wrench} label="Problemas reportados" value={openIssues} color="#EF4444" />
        )}
        <Card to="/financeiro" icon={Wallet} label="Receita hoje" value={formatMoney(revenue, currency, lang)} color="#FF5A5F" />
      </div>

      {listOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={() => setListOpen(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto">
            <h3 className="font-bold mb-3">
              {listOpen === "checkin" ? "Check-ins hoje" : listOpen === "checkout" ? "Check-outs hoje" : "Hospedados agora"}
            </h3>
            {(listOpen === "checkin" ? checkins : listOpen === "checkout" ? checkouts : staying).length === 0 ? (
              <p className="text-sm text-muted-foreground">Nada por aqui.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {(listOpen === "checkin" ? checkins : listOpen === "checkout" ? checkouts : staying).map((g: any) => (
                  <li key={g.id}>
                    <Link to="/hospedes" onClick={() => setListOpen(null)} className="hostly-card !p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{g.name}</p>
                        <p className="text-xs text-muted-foreground">{g.properties?.name ?? "—"} · {g.checkin_date} → {g.checkout_date}</p>
                      </div>
                      <span className="font-mono text-xs" style={{ color: "var(--color-success)" }}>
                        {formatMoney(Number(g.total_value ?? 0), currency, lang)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
