import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — Hostlyb" }, { name: "description", content: "Acesse sua conta Hostlyb." }] }),
  component: LoginPage,
});

function LoginPage() {
  const t = useT();
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
    if (error) toast.error(t("login.fail"));
    else navigate({ to: "/app" as any });
  };

  return (
    <div className="min-h-screen grid place-items-center px-5 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/" className="block mb-1">
          <h1 className="text-3xl font-black">Host<span style={{ color: "var(--color-accent)" }}>ly</span></h1>
        </Link>
        <p className="text-sm text-muted-foreground mb-6">{t("login.title")}</p>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input type="email" required placeholder={t("login.email")} value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-card-border" />
          <input type="password" required placeholder={t("login.password")} value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 rounded-xl bg-card border border-card-border" />
          <button disabled={loading} className="btn-primary justify-center">
            {loading ? t("login.submitting") : t("login.submit")}
          </button>
        </form>
        <button
          type="button"
          onClick={async () => {
            try {
              const r = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin + "/app",
              });
              if (r.redirected) return;
              if (r.error) {
                console.error("[google-oauth login]", r.error);
                toast.error(`${t("login.googleFail")}: ${(r.error as any)?.message ?? r.error}`);
                return;
              }
              window.location.assign("/app");
            } catch (err: any) {
              console.error("[google-oauth login] threw", err);
              toast.error(`${t("login.googleFail")}: ${err?.message ?? "erro desconhecido"}`);
            }
          }}
          className="btn-secondary justify-center w-full mt-3"
        >
          {t("login.google")}
        </button>
        <p className="text-sm text-muted-foreground mt-5 text-center">
          {t("login.noAccount")} <Link to={"/signup" as any} style={{ color: "var(--color-accent)" }}>{t("login.signup")}</Link>
        </p>
      </div>
    </div>
  );
}
