import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Hostly" }, { name: "description", content: "Acesse sua conta Hostly." }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (session) navigate({ to: "/app" as any }); }, [session, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/app" as any });
  };

  return (
    <div className="min-h-screen grid place-items-center px-5 bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black mb-1">Host<span style={{ color: "var(--color-accent)" }}>ly</span></h1>
        <p className="text-sm text-muted-foreground mb-6">Entre na sua conta</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input type="email" required placeholder="E-mail" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-card-border" />
          <input type="password" required placeholder="Senha" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-card-border" />
          <button disabled={loading} className="btn-primary justify-center">
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <button
          type="button"
          onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
            if (r.error) toast.error("Falha no login com Google");
          }}
          className="btn-secondary justify-center w-full mt-3"
        >
          Continuar com Google
        </button>
        <p className="text-sm text-muted-foreground mt-5 text-center">
          Não tem conta? <Link to={"/signup" as any} style={{ color: "var(--color-accent)" }}>Criar conta</Link>
        </p>
      </div>
    </div>
  );
}
