import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — Hostly" }, { name: "description", content: "Crie sua conta Hostly grátis." }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/app` : undefined;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: redirectTo, data: { full_name: name } },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Conta criada!"); navigate({ to: "/app" as any }); }
  };

  return (
    <div className="min-h-screen grid place-items-center px-5 bg-background">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black mb-1">Host<span style={{ color: "var(--color-accent)" }}>ly</span></h1>
        <p className="text-sm text-muted-foreground mb-6">Crie sua conta grátis</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input required placeholder="Seu nome" value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-card-border" />
          <input type="email" required placeholder="E-mail" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-card-border" />
          <input type="password" required minLength={6} placeholder="Senha (mín. 6 caracteres)" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-card-border" />
          <button disabled={loading} className="btn-primary justify-center">
            {loading ? "Criando..." : "Criar conta"}
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
          Já tem conta? <Link to={"/login" as any} style={{ color: "var(--color-accent)" }}>Entrar</Link>
        </p>
      </div>
    </div>
  );
}
