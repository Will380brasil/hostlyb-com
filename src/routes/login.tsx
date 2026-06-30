import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

type LoginSearch = { redirect?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Entrar — Hostlyb" },
      { name: "description", content: "Aceda à sua conta Hostlyb." },
    ],
  }),
  component: LoginPage,
});

async function resolveDestination(userId: string, fallback?: string) {
  if (fallback) return fallback;
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();
  return data?.role === "cleaner" ? "/minha-agenda" : "/app";
}

function LoginPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { session, loading: authLoading } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const translateLoginError = (msg: string): string => {
    const lower = (msg || "").toLowerCase();
    if (
      lower.includes("invalid login credentials") ||
      lower.includes("invalid email or password") ||
      lower.includes("user not found")
    ) return t("login.error");
    if (lower.includes("email not confirmed")) return t("login.error");
    if (lower.includes("too many requests") || lower.includes("rate limit")) {
      return "Too many attempts. Please wait a few minutes.";
    }
    if (lower.includes("failed to fetch") || lower.includes("network")) {
      return "Network error. Check your connection.";
    }
    return t("login.error");
  };

  useEffect(() => {
    (async () => {
      if (authLoading || !session) return;
      const dest = await resolveDestination(session.user.id, redirect);
      navigate({ to: dest as any, replace: true });
    })();
  }, [session, authLoading, redirect, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("login.error"));
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) {
        toast.error(translateLoginError(error.message));
        return;
      }
      if (!data?.user) {
        toast.error(t("login.error"));
        return;
      }
      const dest = await resolveDestination(data.user.id, redirect);
      navigate({ to: dest as any, replace: true });
    } catch (err: any) {
      toast.error(translateLoginError(err?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center px-5 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/" className="block mb-1">
          <h1 className="text-3xl font-black">
            Host<span style={{ color: "var(--color-accent)" }}>lyb</span>
          </h1>
        </Link>
        <p className="text-sm text-muted-foreground mb-6">{t("login.title")}</p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 5, color: "#212121" }}>
              {t("login.email")}
            </label>
            <input
              type="email" required placeholder="seu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#212121" }}>{t("login.password")}</label>
              <Link to="/esqueci-senha" style={{ fontSize: 12, color: "var(--color-accent)", textDecoration: "none", fontWeight: 600 }}>
                {t("login.forgotPassword")}
              </Link>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"} required
                placeholder="••••••••" value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-xl bg-card border border-card-border"
                style={{ paddingRight: 44 }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9E9E9E", display: "flex", alignItems: "center" }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading || authLoading}
            className="btn-primary justify-center"
            style={{ opacity: loading ? 0.7 : 1 }}>
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-5 text-center">
          {t("login.noAccount")}{" "}
          <Link to={"/inscrever-se" as any} style={{ color: "var(--color-accent)", fontWeight: 700, textDecoration: "none" }}>
            {t("login.signup")}
          </Link>
        </p>
      </div>
    </div>
  );
}
