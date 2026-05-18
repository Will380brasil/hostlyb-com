import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { sendTransactionalEmail } from "@/lib/email/send";

type SignupSearch = { plan?: "free" | "pro" | "premium" };

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — Hostlyb" }, { name: "description", content: "Crie sua conta Hostlyb grátis." }] }),
  validateSearch: (s: Record<string, unknown>): SignupSearch => {
    const p = s.plan;
    return p === "free" || p === "pro" || p === "premium" ? { plan: p } : {};
  },
  component: SignupPage,
});

const COUNTRIES = [
  { code: "BR", flag: "🇧🇷", dial: "+55" },
  { code: "PT", flag: "🇵🇹", dial: "+351" },
  { code: "US", flag: "🇺🇸", dial: "+1" },
  { code: "ES", flag: "🇪🇸", dial: "+34" },
  { code: "FR", flag: "🇫🇷", dial: "+33" },
  { code: "IT", flag: "🇮🇹", dial: "+39" },
  { code: "DE", flag: "🇩🇪", dial: "+49" },
  { code: "GB", flag: "🇬🇧", dial: "+44" },
  { code: "MX", flag: "🇲🇽", dial: "+52" },
  { code: "AR", flag: "🇦🇷", dial: "+54" },
  { code: "CO", flag: "🇨🇴", dial: "+57" },
  { code: "CL", flag: "🇨🇱", dial: "+56" },
];

function SignupPage() {
  const t = useT();
  const navigate = useNavigate();
  const { plan } = useSearch({ from: "/signup" }) as SignupSearch;
  if (typeof window !== "undefined" && plan) {
    try { localStorage.setItem("selected_plan", plan); } catch {}
  }
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // password visibility now handled inside PasswordField
  const [country, setCountry] = useState("BR");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? "";
  const fullPhone = phone ? `${dial}${phone.replace(/\D/g, "")}` : "";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      toast.error(t("signup.phoneInvalid"));
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        emailRedirectTo: "https://hostlyb.com/auth/callback",
        data: { full_name: name, phone: fullPhone, country },
      },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    // Fire welcome email (best-effort, non-blocking)
    if (data.user?.id) {
      sendTransactionalEmail({
        templateName: "welcome",
        recipientEmail: email,
        idempotencyKey: `welcome-${data.user.id}`,
        templateData: { name, lang: "pt" },
      }).catch((e) => console.warn("[welcome email] failed", e));
    }
    if (data.session) {
      toast.success(t("signup.success"));
      const planParam = plan ?? (typeof window !== "undefined" ? localStorage.getItem("selected_plan") : null);
      const qs = planParam ? `?onboarding=1&plan=${planParam}` : "?onboarding=1";
      navigate({ to: ("/assinar" + qs) as any });
    } else {
      // Awaiting email confirmation
      setSentTo(email);
    }
  };

  const resend = async () => {
    if (!sentTo) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: sentTo,
      options: { emailRedirectTo: "https://hostlyb.com/auth/callback" },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("E-mail reenviado!");
  };

  const inputCls = "px-4 py-3 rounded-xl bg-card border border-card-border";

  return (
    <div className="min-h-screen grid place-items-center px-5 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/" className="block mb-1">
          <h1 className="text-3xl font-black">Host<span style={{ color: "var(--color-accent)" }}>lyb</span></h1>
        </Link>
        {sentTo ? (
          <div className="mt-6 text-center">
            <div className="mx-auto mb-4 grid place-items-center w-14 h-14 rounded-2xl text-2xl"
              style={{ background: "var(--color-accent-soft, #ffe4e0)", color: "var(--color-accent)" }}>📧</div>
            <h2 className="text-xl font-bold mb-2">Confirme seu e-mail</h2>
            <p className="text-sm text-muted-foreground mb-1">
              Enviamos um link de confirmação para <strong>{sentTo}</strong>.
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              Não recebeu? Verifique a caixa de spam ou reenvie abaixo.
            </p>
            <button onClick={resend} disabled={resending} className="btn-primary justify-center w-full mb-2">
              {resending ? "Reenviando…" : "Reenviar e-mail"}
            </button>
            <button onClick={() => setSentTo(null)} className="text-xs text-muted-foreground">
              Usar outro e-mail
            </button>
            <p className="mt-5 text-xs text-muted-foreground">
              Problemas? Abra o <Link to={"/diagnostico" as any} style={{ color: "var(--color-accent)" }}>diagnóstico</Link>.
            </p>
          </div>
        ) : (
        <>
        <p className="text-sm text-muted-foreground mb-6">{t("signup.title")}</p>

        <button
          type="button"
          onClick={async () => {
            try {
              const r = await lovable.auth.signInWithOAuth("google", {
                redirect_uri: window.location.origin + "/app",
              });
              if (r.redirected) return; // navegador vai para o Google
              if (r.error) {
                console.error("[google-oauth signup]", r.error);
                toast.error(`${t("signup.googleFail")}: ${(r.error as any)?.message ?? r.error}`);
                return;
              }
              // tokens recebidos sem redirect → já autenticado
              window.location.assign("/app");
            } catch (err: any) {
              console.error("[google-oauth signup] threw", err);
              toast.error(`${t("signup.googleFail")}: ${err?.message ?? "erro desconhecido"}`);
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-card-border bg-card hover:bg-muted transition font-semibold"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.09A6.62 6.62 0 0 1 5.5 12c0-.72.13-1.43.34-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A10.99 10.99 0 0 0 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
          {t("signup.google")}
        </button>

        <div className="flex items-center gap-3 my-5 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          {t("signup.or")}
          <div className="flex-1 h-px bg-border" />
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input required placeholder={t("signup.name")} value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          <input type="email" required placeholder={t("signup.email")} value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />

          <div className="flex gap-2">
            <select value={country} onChange={(e) => setCountry(e.target.value)} className={inputCls + " w-28"} aria-label="Country">
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.dial}</option>
              ))}
            </select>
            <input type="tel" inputMode="numeric" placeholder={t("signup.phone")} value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls + " flex-1"} />
          </div>

          <PasswordField
            value={password}
            onChange={setPassword}
            placeholder={t("signup.password")}
            required
            minLength={6}
            showStrength
            className={inputCls + " w-full"}
          />

          <button disabled={loading} className="btn-primary justify-center">
            {loading ? t("signup.submitting") : t("signup.submit")}
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-5 text-center">
          {t("signup.have")} <Link to={"/login" as any} style={{ color: "var(--color-accent)" }}>{t("signup.signin")}</Link>
        </p>
        </>
        )}
      </div>
    </div>
  );
}
