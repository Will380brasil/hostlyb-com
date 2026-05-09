import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Check, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/alertas")({ component: AlertsPage });

type Alert = {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  is_read: boolean;
  is_dismissed: boolean;
  action_url: string | null;
  action_label: string | null;
  created_at: string;
};

const priorityColor: Record<string, string> = {
  low: "var(--color-muted-foreground)",
  medium: "var(--color-info, #3b82f6)",
  high: "var(--color-accent)",
  critical: "var(--color-destructive, #ef4444)",
};

function AlertsPage() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "unread">("unread");

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", session?.user.id, filter],
    enabled: !!session?.user.id,
    queryFn: async () => {
      let q = supabase.from("alerts").select("*").eq("is_dismissed", false).order("created_at", { ascending: false }).limit(100);
      if (filter === "unread") q = q.eq("is_read", false);
      const { data, error } = await q;
      if (error) throw error;
      return data as Alert[];
    },
  });

  useEffect(() => {
    if (!session?.user.id) return;
    const ch = supabase
      .channel("alerts-page")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts", filter: `user_id=eq.${session.user.id}` }, () => {
        qc.invalidateQueries({ queryKey: ["alerts"] });
        qc.invalidateQueries({ queryKey: ["alerts-unread"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [session?.user.id, qc]);

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); qc.invalidateQueries({ queryKey: ["alerts-unread"] }); },
  });

  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ is_dismissed: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); qc.invalidateQueries({ queryKey: ["alerts-unread"] }); },
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("alerts").update({ is_read: true, read_at: new Date().toISOString() }).eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["alerts"] }); qc.invalidateQueries({ queryKey: ["alerts-unread"] }); },
  });

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/app" className="grid place-items-center w-9 h-9 rounded-full bg-card border border-card-border"><ArrowLeft size={16} /></Link>
        <h2 className="text-xl font-bold flex items-center gap-2"><Bell size={18} /> Alertas</h2>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1 p-1 rounded-full bg-card border border-card-border text-xs">
          {(["unread", "all"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full font-medium"
              style={{ background: filter === f ? "var(--color-accent)" : "transparent", color: filter === f ? "white" : "var(--color-muted-foreground)" }}>
              {f === "unread" ? "Não lidos" : "Todos"}
            </button>
          ))}
        </div>
        {alerts.some((a) => !a.is_read) && (
          <button onClick={() => markAllRead.mutate()} className="text-xs font-medium text-muted-foreground underline">Marcar todos como lidos</button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">Nenhum alerta {filter === "unread" ? "não lido" : ""}.</div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id} className="rounded-2xl bg-card border border-card-border p-3" style={{ opacity: a.is_read ? 0.7 : 1 }}>
              <div className="flex items-start gap-2">
                <div className="w-1.5 self-stretch rounded-full" style={{ background: priorityColor[a.priority] }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{a.title}</h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {a.action_url && (
                      <Link to={a.action_url as any} onClick={() => markRead.mutate(a.id)} className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "var(--color-accent)", color: "white" }}>
                        {a.action_label || "Ver"}
                      </Link>
                    )}
                    {!a.is_read && (
                      <button onClick={() => markRead.mutate(a.id)} className="text-xs flex items-center gap-1 text-muted-foreground"><Check size={12} /> Lido</button>
                    )}
                    <button onClick={() => dismiss.mutate(a.id)} className="text-xs flex items-center gap-1 text-muted-foreground ml-auto"><X size={12} /> Dispensar</button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
