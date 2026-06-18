import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({ meta: [{ title: "Entrar — Hostlyb" }, { name: "description", content: "Aceda à sua conta Hostlyb." }] }),
  component: LoginPage,
});

async function resolveDestination(userId: string, fallback?: string) {
  if (fallback) return fallback;
  const { data } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "cleaner" ? "/minha-agenda" : "/app";
}

function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const { redirect } = useSearch({ from: "/login" });
  const { session, loading: authLoading } = useAuth();

  const [method, setMethod] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    (async () => {
      if (authLoading || !session) return;
      const dest = await resolveDestination(session.user.id, redirect);
      navigate({ to: dest as any, replace: true });
    })();
  }, [session, authLoading, redirect, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setLoading(false);
    if (error) toast.error(t("login.fail"));
  };

  const sendMagic = async () => {
    if (!email) { toast.error(t("login.email")); return; }
    setLoading(true);
    const target = redirect ?? "/minha-agenda";
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: `${window.location.origin}${target}` },
    });
    setLoading(false);
    if (error) toast.error("Não foi possível enviar o link.");
    else setMagicSent(true);
  };

  if (magicSent) {
    return (
      <div className="min-h-screen grid place-items-center px-5 bg-background">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-3">📧</div>
          <h1 className="text-xl font-black">Verifique o seu email</h1>
          <p className="text-sm text-muted-foreground mt-2">Enviámos um link de acesso para <strong>{email}</strong>.</p>
          <button onClick={() => setMagicSent(false)} className="mt-4 text-xs underline text-muted-foreground">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid place-items-center px-5 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/" className="block mb-1">
          <h1 className="text-3xl font-black">Host<span style={{ color: "var(--color-accent)" }}>lyb</span></h1>
        </Link>
        <p className="text-sm text-muted-foreground mb-6">{t("login.title")}</p>

        <div className="flex gap-1 p-1 rounded-xl bg-muted mb-4">
          <button onClick={() => setMethod("password")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${method === "password" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            🔑 Palavra-passe
          </button>
          <button onClick={() => setMethod("magic")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${method === "magic" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            ✉️ Link por email
          </button>
        </div>

        {method === "password" ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input type="email" required placeholder={t("login.email")} value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-card border border-card-border" />
            <input type="password" required placeholder={t("login.password")} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 rounded-xl bg-card border border-card-border" />
            <button disabled={loading || authLoading} className="btn-primary justify-center">
              {loading ? t("login.submitting") : t("login.submit")}
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-3">
            <input type="email" required placeholder={t("login.email")} value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-card border border-card-border" />
            <button disabled={loading} onClick={sendMagic} className="btn-primary justify-center">
              {loading ? "A enviar…" : "Enviar link de acesso"}
            </button>
            <p className="text-xs text-muted-foreground text-center">Receberá um link para entrar sem palavra-passe.</p>
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-5 text-center">
          {t("login.noAccount")} <Link to={"/signup" as any} style={{ color: "var(--color-accent)" }}>{t("login.signup")}</Link>
        </p>
      </div>
    </div>
  );
}
