import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { PasswordField } from "@/components/PasswordField";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { sendTransactionalEmail } from "@/lib/email/send";

type SignupPlan = "free" | "pro" | "premium";
type SignupSearch = { plan?: SignupPlan };

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

function getPlanOptions(t: (k: string) => string): Array<{ id: SignupPlan; name: string; price: string; description: string; features: string[] }> {
  return [
    { id: "free",    name: t("signup.plan.free.name"),    price: t("signup.plan.free.price"),    description: t("signup.plan.free.desc"),    features: [t("signup.plan.free.f1"), t("signup.plan.free.f2")] },
    { id: "pro",     name: t("signup.plan.pro.name"),     price: "R$ 59,90/mês",                  description: t("signup.plan.pro.desc"),     features: [t("signup.plan.pro.f1"), t("signup.plan.pro.f2")] },
    { id: "premium", name: t("signup.plan.premium.name"), price: t("signup.plan.premium.price"), description: t("signup.plan.premium.desc"), features: [t("signup.plan.premium.f1"), t("signup.plan.premium.f2")] },
  ];
}


function SignupPage() {
  const t = useT();
  const navigate = useNavigate();
  const { plan } = useSearch({ from: "/signup" }) as SignupSearch;
  const [selectedPlan, setSelectedPlan] = useState<SignupPlan>(plan ?? "free");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("BR");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (plan) setSelectedPlan(plan);
  }, [plan]);

  useEffect(() => {
    try { localStorage.setItem("selected_plan", selectedPlan); } catch {}
  }, [selectedPlan]);

  const dial = COUNTRIES.find((c) => c.code === country)?.dial ?? "";
  const fullPhone = phone ? `${dial}${phone.replace(/\D/g, "")}` : "";

  const goToPlanSelection = () => {
    navigate({ to: "/assinar" as any, search: { onboarding: "1", plan: selectedPlan } as any });
  };

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
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: { full_name: name, phone: fullPhone, country, selected_plan: selectedPlan },
      },
    });
    setLoading(false);
    if (error) {
      const msg = error.message || "";
      if (/already registered|already exists|user.*exists/i.test(msg)) {
        toast.error(t("signup.emailExists"));
      } else if (/database error|unexpected/i.test(msg)) {
        toast.error(t("signup.dbError"));
      } else {
        toast.error(t("signup.dbError") + " " + msg);
      }
      return;
    }

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
      goToPlanSelection();
    } else {
      setSentTo(email);
    }
  };

  const resend = async () => {
    if (!sentTo) return;
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: sentTo,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setResending(false);
    if (error) toast.error(error.message);
    else toast.success("E-mail reenviado!");
  };

  // Google OAuth removed until provider is configured in Supabase.

  const inputCls = "px-4 py-3 rounded-xl bg-card border border-card-border";

  return (
    <div className="min-h-screen grid place-items-center px-5 py-8 bg-background">
      <div className="w-full max-w-2xl">
        <Link to="/" className="block mb-1">
          <h1 className="text-3xl font-black">Host<span style={{ color: "var(--color-accent)" }}>lyb</span></h1>
        </Link>
        {sentTo ? (
          <div className="mt-6 text-center max-w-sm mx-auto">
            <div className="mx-auto mb-4 grid place-items-center w-14 h-14 rounded-2xl text-2xl"
              style={{ background: "var(--color-accent-soft, #ffe4e0)", color: "var(--color-accent)" }}>📧</div>
            <h2 className="text-xl font-bold mb-2">Confirme seu e-mail</h2>
            <p className="text-sm text-muted-foreground mb-1">
              Enviamos um link de confirmação para <strong>{sentTo}</strong>.
            </p>
            <p className="text-xs text-muted-foreground mb-5">
              Depois da confirmação, você irá escolher ou confirmar o plano selecionado.
            </p>
            <button onClick={resend} disabled={resending} className="btn-primary justify-center w-full mb-2">
              {resending ? "Reenviando…" : "Reenviar e-mail"}
            </button>
            <button onClick={() => setSentTo(null)} className="text-xs text-muted-foreground">
              Usar outro e-mail
            </button>
          </div>
        ) : (
        <>
        <p className="text-sm text-muted-foreground mb-6">{t("signup.title")}</p>

        <section className="mb-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-sm font-bold">Escolha seu plano</h2>
            <span className="text-xs text-muted-foreground">Você pode trocar depois</span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {PLAN_OPTIONS.map((option) => {
              const active = selectedPlan === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedPlan(option.id)}
                  className="text-left rounded-xl border bg-card p-4 transition"
                  style={{ borderColor: active ? "var(--color-accent)" : "var(--color-card-border)", boxShadow: active ? "0 0 0 3px var(--color-accent-soft)" : "none" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold">{option.name}</div>
                      <div className="text-sm font-semibold" style={{ color: "var(--color-accent)" }}>{option.price}</div>
                    </div>
                    {active && <Check size={18} style={{ color: "var(--color-accent)" }} />}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{option.description}</p>
                  <ul className="mt-3 space-y-1">
                    {option.features.map((feature) => (
                      <li key={feature} className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Check size={12} style={{ color: "var(--color-success)" }} /> {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              );
            })}
          </div>
        </section>


        <form onSubmit={submit} className="flex flex-col gap-3 max-w-sm mx-auto md:max-w-none">
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
