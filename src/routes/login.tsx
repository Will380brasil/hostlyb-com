import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

type LoginSearch = { redirect?: string };

const MAGIC_LINK_ENABLED = false;

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

function translateError(error: string): string {
    const errorMap: Record<string, string> = {
          'Invalid login credentials': 'E-mail ou senha incorretos.',
          'Email not confirmed': 'Confirme o seu e-mail antes de entrar.',
          'User not found': 'Conta não encontrada.',
          'Too many requests': 'Muitas tentativas. Aguarde alguns minutos.',
    };

    return errorMap[error] || 'Erro ao entrar. Tente novamente.';
}

function LoginPage() {
  const t = useT();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { session, loading: authLoading } = useAuth();

  const [method, setMethod] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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

        {!MAGIC_LINK_ENABLED ? null : (        <div className="flex gap-1 p-1 rounded-xl bg-muted mb-4">
          <button onClick={() => setMethod("password")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${method === "password" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            🔑 Palavra-passe
          </button>
          <button onClick={() => setMethod("magic")}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold ${method === "magic" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
            ✉️ Link por email
          </button>
        </div>
                                       )}


        {!MAGIC_LINK_ENABLED && (
                    <div style={{ background: "#FFF8E6", border: "1px solid #FFB34740", padding: "12px 16px", borderRadius: "6px", marginBottom: "16px" }}>
                                      <p style={{ color: "#92600A", margin: 0, fontSize: "14px" }}>
                                                          🔗 Link mágico temporariamente indisponível. Use e-mail e senha.
                                      </p>
                    </div>
                  )}
                  {!MAGIC_LINK_ENABLED || method === "password" ? (
          <form onSubmit={submit} className="flex flex-col gap-3">
            <input type="email" required placeholder={t("login.email")} value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-3 rounded-xl bg-card border border-card-border" />
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder={t("login.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9E9E9E" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <Link to="/esqueci-senha" className="text-xs text-muted-foreground text-right hover:underline" style={{ textDecoration: "none" }}>
              {t("login.forgotPassword")}
            </Link>
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
