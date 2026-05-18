import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { sendTransactionalEmail } from "@/lib/email/send";

export const Route = createFileRoute("/convite/$token")({
  head: () => ({ meta: [{ title: "Convite — Hostlyb" }] }),
  component: ConvitePage,
});

function ConvitePage() {
  const { token } = Route.useParams();
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [invite, setInvite] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_invite_by_token", { p_token: token });
      if (error) { setError(error.message); return; }
      if (!data) { setError("Convite inválido."); return; }
      setInvite(data);
    })();
  }, [token]);

  const accept = async () => {
    setError(null);
    setAccepting(true);
    const { error } = await supabase.rpc("accept_invite", { p_token: token });
    setAccepting(false);
    if (error) {
      const map: Record<string, string> = {
        expired: "Este convite expirou.",
        already_accepted: "Convite já foi aceito.",
        org_full: "A equipe está cheia (5 usuários).",
        invalid_token: "Convite inválido.",
        auth_required: "Você precisa estar logado.",
      };
      setError(map[error.message] ?? error.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate({ to: "/app" as any }), 1200);
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-sm">Carregando…</div>;

  return (
    <div className="min-h-screen grid place-items-center bg-background px-5">
      <div className="hostly-card !p-6 max-w-sm w-full text-center">
        <h1 className="text-2xl font-black tracking-tight mb-1">Host<span style={{ color: "var(--color-accent)" }}>lyb</span></h1>
        <p className="text-sm text-muted-foreground mb-5">Convite para equipe</p>

        {!invite && !error && <p className="text-sm">Carregando convite…</p>}

        {invite && (
          <>
            <p className="text-sm">Você foi convidado para entrar em</p>
            <p className="text-lg font-bold mb-1">{invite.organization_name}</p>
            <p className="text-xs text-muted-foreground mb-5">como <strong>{invite.role}</strong> · {invite.email}</p>

            {invite.accepted_at ? (
              <p className="text-sm text-success">Convite já aceito.</p>
            ) : done ? (
              <p className="text-sm" style={{ color: "var(--color-success)" }}>✓ Bem-vindo! Redirecionando…</p>
            ) : !session ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground mb-2">Faça login ou crie sua conta com o e-mail <strong>{invite.email}</strong> para aceitar.</p>
                <Link to={"/signup" as any} search={{ email: invite.email, redirect: `/convite/${token}` } as any}
                  className="px-4 py-2.5 rounded-lg font-semibold text-sm text-white"
                  style={{ background: "var(--color-accent)" }}>
                  Criar conta
                </Link>
                <Link to={"/login" as any} search={{ redirect: `/convite/${token}` } as any}
                  className="px-4 py-2.5 rounded-lg font-semibold text-sm bg-muted">
                  Já tenho conta
                </Link>
              </div>
            ) : (
              <button onClick={accept} disabled={accepting}
                className="w-full px-4 py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-50"
                style={{ background: "var(--color-accent)" }}>
                {accepting ? "Aceitando…" : "Aceitar convite"}
              </button>
            )}
          </>
        )}

        {error && <p className="text-sm text-destructive mt-3">{error}</p>}
      </div>
    </div>
  );
}
