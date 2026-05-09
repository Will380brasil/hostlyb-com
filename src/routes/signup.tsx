import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — Hostly" }, { name: "description", content: "Crie sua conta Hostly grátis." }] }),
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [country, setCountry] = useState("BR");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

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
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/app` : undefined;
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: redirectTo, data: { full_name: name, phone: fullPhone, country } },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success(t("signup.success")); navigate({ to: "/app" as any }); }
  };

  const inputCls = "px-4 py-3 rounded-xl bg-card border border-card-border";

  return (
    <div className="min-h-screen grid place-items-center px-5 bg-background">
      <div className="w-full max-w-sm">
        <Link to="/" className="block mb-1">
          <h1 className="text-3xl font-black">Host<span style={{ color: "var(--color-accent)" }}>ly</span></h1>
        </Link>
        <p className="text-sm text-muted-foreground mb-6">{t("signup.title")}</p>

        <button
          type="button"
          onClick={async () => {
            const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/app" });
            if (r.error) toast.error(t("signup.googleFail"));
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

          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              required minLength={6}
              placeholder={t("signup.password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls + " w-full pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={showPass ? t("signup.hide") : t("signup.show")}
            >
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button disabled={loading} className="btn-primary justify-center">
            {loading ? t("signup.submitting") : t("signup.submit")}
          </button>
        </form>

        <p className="text-sm text-muted-foreground mt-5 text-center">
          {t("signup.have")} <Link to={"/login" as any} style={{ color: "var(--color-accent)" }}>{t("signup.signin")}</Link>
        </p>
      </div>
    </div>
  );
}
