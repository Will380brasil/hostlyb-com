import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Status = "checking" | "ok" | "expired" | "error";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({ meta: [{ title: "Confirmação — Hostlyb" }, { name: "robots", content: "noindex" }] }),
  component: AuthCallback,
});

function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [detail, setDetail] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Supabase places errors in the URL hash on failure
        const hash = typeof window !== "undefined" ? window.location.hash.slice(1) : "";
        const params = new URLSearchParams(hash);
        const errCode = params.get("error_code") || params.get("error");
        const errDesc = params.get("error_description");

        if (errCode) {
          if (/expired|otp_expired/i.test(errCode) || /expired/i.test(errDesc ?? "")) {
            setStatus("expired");
          } else {
            setStatus("error");
          }
          setDetail(decodeURIComponent(errDesc ?? errCode));
          console.warn("[auth/callback] error from URL", { errCode, errDesc });
          return;
        }

        // Otherwise check if a session was established
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (data.session?.user) {
          setEmail(data.session.user.email ?? "");
          setStatus("ok");
          setTimeout(() => navigate({ to: "/app" as any }), 1800);
        } else {
          // No session and no explicit error — likely link already used or invalid
          setStatus("error");
          setDetail("Não conseguimos validar este link. Ele pode ter sido usado ou estar incompleto.");
        }
      } catch (e: any) {
        console.error("[auth/callback] unexpected", e);
        setStatus("error");
        setDetail(e?.message ?? "Erro desconhecido.");
      }
    })();
  }, [navigate]);

  const resend = async () => {
    if (!email) {
      toast.error("Informe seu e-mail para reenviar.");
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: "https://hostlyb.com/auth/callback" },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("Novo e-mail enviado. Confira sua caixa de entrada.");
  };

  return (
    <div className="min-h-screen grid place-items-center bg-background px-5">
      <div className="hostly-card !p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-black tracking-tight mb-1">
          Host<span style={{ color: "var(--color-accent)" }}>lyb</span>
        </h1>

        {status === "checking" && (
          <>
            <Loader2 className="mx-auto my-6 animate-spin text-muted-foreground" size={40} />
            <p className="text-sm text-muted-foreground">Validando seu link…</p>
          </>
        )}

        {status === "ok" && (
          <>
            <CheckCircle2 className="mx-auto my-6 text-success" size={56} style={{ color: "var(--color-success)" }} />
            <h2 className="text-lg font-bold mb-1">E-mail verificado!</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tudo certo{email ? `, ${email}` : ""}. Estamos te levando ao painel…
            </p>
            <Link to={"/app" as any} className="btn-primary justify-center w-full">Ir para o painel</Link>
          </>
        )}

        {status === "expired" && (
          <>
            <XCircle className="mx-auto my-6" size={56} style={{ color: "#f59e0b" }} />
            <h2 className="text-lg font-bold mb-1">Link expirado</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Este link de confirmação expirou. Informe seu e-mail abaixo para receber um novo.
            </p>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border mb-3"
            />
            <button onClick={resend} disabled={resending} className="btn-primary justify-center w-full">
              <RefreshCw size={16} className={resending ? "animate-spin" : ""} />
              {resending ? "Reenviando…" : "Reenviar e-mail"}
            </button>
            <Link to={"/login" as any} className="block text-xs text-muted-foreground mt-4">Voltar ao login</Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="mx-auto my-6 text-destructive" size={56} />
            <h2 className="text-lg font-bold mb-1">Não foi possível verificar</h2>
            <p className="text-sm text-muted-foreground mb-2">{detail}</p>
            <p className="text-xs text-muted-foreground mb-4">
              Tente fazer login novamente ou usar o diagnóstico para entender o que houve.
            </p>
            <div className="flex flex-col gap-2">
              <Link to={"/login" as any} className="btn-primary justify-center">Ir para o login</Link>
              <Link to={"/diagnostico" as any} className="btn-secondary justify-center">Abrir diagnóstico</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
