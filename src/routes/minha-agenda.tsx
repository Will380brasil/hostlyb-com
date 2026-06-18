import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, MapPin, LogOut, Sparkles } from "lucide-react";

export const Route = createFileRoute("/minha-agenda")({
  head: () => ({ meta: [{ title: "Minha Agenda — Hostlyb" }, { name: "robots", content: "noindex" }] }),
  component: MinhaAgenda,
});

const STATUS_LABEL: Record<string, string> = {
  agendado: "Agendado", em_andamento: "Em curso", concluido: "Concluído", problema: "Problema", cancelado: "Cancelado",
};

function MinhaAgenda() {
  const { session, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login", search: { redirect: "/minha-agenda" }, replace: true });
  }, [session, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["my-profile", session?.user.id],
    enabled: !!session?.user.id,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role, cleaner_id, display_name, email")
        .eq("id", session!.user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["cleaner-agenda", (profile as any)?.cleaner_id],
    enabled: !!(profile as any)?.cleaner_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cleaning_jobs")
        .select("id, status, scheduled_date, scheduled_time, access_token, properties(name, address, city)")
        .eq("cleaner_id", (profile as any).cleaner_id)
        .gte("scheduled_date", new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading || !session) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">A carregar…</div>;
  }

  // Authenticated but not a cleaner → send to app
  if (profile && (profile as any).role !== "cleaner") {
    navigate({ to: "/app" as any, replace: true });
    return null;
  }

  return (
    <div className="min-h-screen mx-auto w-full max-w-[480px] bg-background pb-10">
      <header className="sticky top-0 z-10 px-5 py-4 bg-background/95 backdrop-blur border-b border-card-border flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black">Host<span style={{ color: "var(--color-accent)" }}>lyb</span></h1>
          <p className="text-xs text-muted-foreground">Olá, {(profile as any)?.display_name ?? (profile as any)?.email}</p>
        </div>
        <button onClick={signOut} className="text-xs flex items-center gap-1 text-muted-foreground">
          <LogOut size={14} /> Sair
        </button>
      </header>

      <main className="px-4 pt-4 space-y-3">
        <h2 className="font-bold flex items-center gap-2"><Calendar size={16}/> Minhas limpezas</h2>

        {!(profile as any)?.cleaner_id && (
          <div className="rounded-xl bg-card border border-card-border p-4 text-sm">
            <p className="font-semibold mb-1">Ainda sem limpezas atribuídas</p>
            <p className="text-xs text-muted-foreground">
              Quando o anfitrião lhe enviar um link de limpeza, ele aparecerá aqui automaticamente.
            </p>
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">A carregar…</p>
        ) : jobs.length === 0 && (profile as any)?.cleaner_id ? (
          <p className="text-sm text-muted-foreground">Nenhuma limpeza agendada.</p>
        ) : (
          <ul className="space-y-2">
            {jobs.map((j: any) => (
              <li key={j.id}>
                <Link to="/faxineira/$token" params={{ token: j.access_token }}
                  className="block rounded-2xl bg-card border border-card-border p-4 hover:shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 font-bold">
                      <Sparkles size={14} style={{ color: "var(--color-accent)" }} />
                      {j.properties?.name}
                    </div>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-muted font-semibold">
                      {STATUS_LABEL[j.status] ?? j.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-1">
                    <MapPin size={12} className="mt-0.5 shrink-0" />
                    <span>{j.properties?.address}{j.properties?.city ? `, ${j.properties.city}` : ""}</span>
                  </p>
                  <p className="text-xs mt-2 text-muted-foreground">
                    📅 {new Date(j.scheduled_date + "T" + j.scheduled_time).toLocaleString("pt-PT", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
