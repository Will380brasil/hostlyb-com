import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Check, X, Archive, ArchiveRestore } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/alertas")({ component: AlertsPage });

type Alert = {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: "low" | "medium" | "high" | "critical";
  is_read: boolean;
  is_dismissed: boolean;
  archived_at: string | null;
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

type Filter = "unread" | "all" | "archived";

function AlertsPage() {
  const { session } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<Filter>("unread");
  const [open, setOpen] = useState<Alert | null>(null);

  const { data: alerts = [] } = useQuery({
    queryKey: ["alerts", session?.user.id, filter],
    enabled: !!session?.user.id,
    queryFn: async () => {
      let q = supabase.from("alerts").select("*").eq("is_dismissed", false).order("created_at", { ascending: false }).limit(100);
      if (filter === "unread") q = q.eq("is_read", false).is("archived_at", null);
      else if (filter === "all") q = q.is("archived_at", null);
      else q = q.not("archived_at", "is", null);
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

  const inv = () => { qc.invalidateQueries({ queryKey: ["alerts"] }); qc.invalidateQueries({ queryKey: ["alerts-unread"] }); };

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ is_read: true, read_at: new Date().toISOString() }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: inv,
  });
  const archive = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ archived_at: new Date().toISOString(), is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { inv(); toast.success("Alerta arquivado"); setOpen(null); },
  });
  const unarchive = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ archived_at: null }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { inv(); toast.success("Alerta restaurado"); setOpen(null); },
  });
  const dismiss = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("alerts").update({ is_dismissed: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { inv(); setOpen(null); },
  });
  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("alerts").update({ is_read: true, read_at: new Date().toISOString() }).eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: inv,
  });

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-4">
        <Link to="/app" className="grid place-items-center w-9 h-9 rounded-full bg-card border border-card-border"><ArrowLeft size={16} /></Link>
        <h2 className="text-xl font-bold flex items-center gap-2"><Bell size={18} /> Alertas</h2>
      </div>

      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex gap-1 p-1 rounded-full bg-card border border-card-border text-xs">
          {(["unread", "all", "archived"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-full font-medium"
              style={{ background: filter === f ? "var(--color-accent)" : "transparent", color: filter === f ? "white" : "var(--color-muted-foreground)" }}>
              {f === "unread" ? "Não lidos" : f === "all" ? "Todos" : "Arquivados"}
            </button>
          ))}
        </div>
        {filter !== "archived" && alerts.some((a) => !a.is_read) && (
          <button onClick={() => markAllRead.mutate()} className="text-xs font-medium text-muted-foreground underline">Marcar todos como lidos</button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground py-12">Nenhum alerta {filter === "unread" ? "não lido" : filter === "archived" ? "arquivado" : ""}.</div>
      ) : (
        <ul className="space-y-2">
          {alerts.map((a) => (
            <li key={a.id}>
              <button onClick={() => { setOpen(a); if (!a.is_read) markRead.mutate(a.id); }}
                className="w-full text-left rounded-2xl bg-card border border-card-border p-3" style={{ opacity: a.is_read ? 0.7 : 1 }}>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 self-stretch rounded-full" style={{ background: priorityColor[a.priority] }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-sm leading-tight">{a.title}</h3>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {new Date(a.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.message}</p>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {open && (
        <AlertDetail
          a={open}
          onClose={() => setOpen(null)}
          onMarkRead={() => markRead.mutate(open.id)}
          onArchive={() => archive.mutate(open.id)}
          onUnarchive={() => unarchive.mutate(open.id)}
          onDismiss={() => dismiss.mutate(open.id)}
        />
      )}
    </AppShell>
  );
}

function AlertDetail({ a, onClose, onMarkRead, onArchive, onUnarchive, onDismiss }: {
  a: Alert; onClose: () => void; onMarkRead: () => void; onArchive: () => void; onUnarchive: () => void; onDismiss: () => void;
}) {
  const navigate = useNavigate();
  const isArchived = !!a.archived_at;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <div className="w-1.5 self-stretch rounded-full mt-1" style={{ background: priorityColor[a.priority], minHeight: 32 }} />
            <div className="flex-1 min-w-0">
              <h3 className="font-bold leading-tight">{a.title}</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {new Date(a.created_at).toLocaleString("pt-BR")} · {a.priority.toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-4">{a.message}</p>

        <div className="flex flex-col gap-2">
          {a.action_url && (
            <button
              onClick={() => { onMarkRead(); navigate({ to: a.action_url as any }); onClose(); }}
              className="btn-primary justify-center">
              {a.action_label || "Ver detalhes"}
            </button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {!a.is_read && !isArchived && (
              <button onClick={onMarkRead} className="btn-secondary justify-center"><Check size={14} /> Marcar lido</button>
            )}
            {!isArchived ? (
              <button onClick={onArchive} className="btn-secondary justify-center"><Archive size={14} /> Arquivar</button>
            ) : (
              <button onClick={onUnarchive} className="btn-secondary justify-center"><ArchiveRestore size={14} /> Restaurar</button>
            )}
            <button onClick={onDismiss} className="btn-secondary justify-center col-span-2" style={{ color: "var(--color-destructive)" }}>
              <X size={14} /> Dispensar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
