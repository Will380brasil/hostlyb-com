import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Sparkles,
  Users,
  Camera,
  Search,
  Bell,
  Calendar,
  LayoutDashboard,
  MessageCircle,
  ChevronDown,
  Gift,
} from "lucide-react";
import { PasswordField } from "@/components/PasswordField";
import { supabase } from "@/integrations/supabase/client";
import { useLocale } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/inscrever-se")({
  head: () => ({
    meta: [
      { title: "Inscrever-se — Planos Hostlyb" },
      {
        name: "description",
        content:
          "Escolha o plano ideal para sua operação. 14 dias grátis, sem cartão de crédito.",
      },
    ],
  }),
  component: SubscribePage,
});

// ---------- Data ----------

type BillingCycle = "monthly" | "annual";
type CurrencyCode = "EUR" | "USD" | "BRL" | "GBP";

const CURRENCIES: Record<
  CurrencyCode,
  { symbol: string; rate: number; label: string }
> = {
  EUR: { symbol: "€", rate: 1, label: "EUR €" },
  USD: { symbol: "$", rate: 1.08, label: "USD $" },
  BRL: { symbol: "R$", rate: 5.6, label: "BRL R$" },
  GBP: { symbol: "£", rate: 0.85, label: "GBP £" },
};

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  PT: "EUR", ES: "EUR", FR: "EUR", DE: "EUR", IT: "EUR", NL: "EUR", IE: "EUR",
  US: "USD", BR: "BRL", GB: "GBP",
};

type Plan = {
  id: "starter" | "professional" | "premium" | "enterprise";
  name: string;
  basePrice: number; // EUR monthly
  tagline: string;
  highlighted?: boolean;
};

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", basePrice: 19.99, tagline: "Para quem está a começar" },
  { id: "professional", name: "Professional", basePrice: 34.99, tagline: "Para operações em crescimento", highlighted: true },
  { id: "premium", name: "Premium", basePrice: 59.99, tagline: "Para equipas profissionais" },
  { id: "enterprise", name: "Enterprise", basePrice: 99.99, tagline: "Para grandes operações" },
];

const FEATURES: Array<{ icon: typeof Users; label: string }> = [
  { icon: Users, label: "Profissionais ilimitados" },
  { icon: Camera, label: "Checklist com fotos" },
  { icon: Search, label: "Rastreio de objetos esquecidos" },
  { icon: Bell, label: "Alertas automáticos" },
  { icon: Calendar, label: "Integração Google Calendar" },
  { icon: LayoutDashboard, label: "Dashboard em tempo real" },
  { icon: MessageCircle, label: "Notificações por WhatsApp" },
];

const COUNTRIES = [
  { code: "PT", flag: "🇵🇹", dial: "+351" },
  { code: "BR", flag: "🇧🇷", dial: "+55" },
  { code: "ES", flag: "🇪🇸", dial: "+34" },
  { code: "FR", flag: "🇫🇷", dial: "+33" },
  { code: "IT", flag: "🇮🇹", dial: "+39" },
  { code: "DE", flag: "🇩🇪", dial: "+49" },
  { code: "GB", flag: "🇬🇧", dial: "+44" },
  { code: "US", flag: "🇺🇸", dial: "+1" },
];

const FAQ = [
  {
    q: "Como funciona o período de teste de 14 dias?",
    a: "Pode usar todas as funcionalidades do plano escolhido durante 14 dias sem cobrança. Não pedimos cartão de crédito no início.",
  },
  {
    q: "Posso mudar de plano depois?",
    a: "Sim. Pode fazer upgrade ou downgrade a qualquer momento. A diferença é calculada proporcionalmente.",
  },
  {
    q: "Qual a diferença entre os planos?",
    a: "Todos os planos incluem as mesmas funcionalidades ilimitadas. A escolha depende do tamanho da operação e do nível de suporte que precisa.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem fidelização. Cancela com um clique no painel e mantém o acesso até ao fim do período pago.",
  },
  {
    q: "Aceitam que tipo de pagamento?",
    a: "Aceitamos cartões de crédito e débito (Visa, Mastercard, Amex), Apple Pay, Google Pay e SEPA na zona euro.",
  },
];

// ---------- Helpers ----------

function formatPrice(eurPrice: number, currency: CurrencyCode, cycle: BillingCycle) {
  const { symbol, rate } = CURRENCIES[currency];
  const monthly = cycle === "annual" ? eurPrice * 0.8 : eurPrice;
  const converted = monthly * rate;
  const formatted = converted.toLocaleString("pt-PT", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

function scorePassword(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return Math.min(s, 4);
}

// ---------- Page ----------

function SubscribePage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const PLANS_I18N: Plan[] = [
    { id: "starter", name: t("plans.starter.name") || "Starter", basePrice: 19.99, tagline: t("plans.starter.tagline") || "Para quem está a começar" },
    { id: "professional", name: t("plans.professional.name") || "Professional", basePrice: 34.99, tagline: t("plans.professional.tagline") || "Para operações em crescimento", highlighted: true },
    { id: "premium", name: t("plans.premium.name") || "Premium", basePrice: 59.99, tagline: t("plans.premium.tagline") || "Para equipas profissionais" },
    { id: "enterprise", name: t("plans.enterprise.name") || "Enterprise", basePrice: 99.99, tagline: t("plans.enterprise.tagline") || "Para grandes operações" },
  ];
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan["id"]>("professional");

  // form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [dial, setDial] = useState("+351");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Auto-detect currency
  useEffect(() => {
    try {
      const locale = navigator.language || "pt-PT";
      const region = locale.split("-")[1]?.toUpperCase();
      if (region && COUNTRY_TO_CURRENCY[region]) {
        setCurrency(COUNTRY_TO_CURRENCY[region]);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const pwScore = useMemo(() => scorePassword(password), [password]);
  const pwLabels = ["Muito fraca", "Fraca", "Média", "Forte", "Excelente"];
  const pwColors = [
    "bg-destructive",
    "bg-destructive",
    "bg-yellow-500",
    "bg-green-500",
    "bg-emerald-600",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      toast.error("Preencha todos os campos");
      return;
    }
    if (pwScore < 2) {
      toast.error("A palavra-passe é demasiado fraca");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As palavras-passe não coincidem");
      return;
    }
    setLoading(true);
    try {
      const fullPhone = `${dial}${phone.replace(/\D/g, "")}`;
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/app`,
          data: {
            full_name: name.trim(),
            phone: fullPhone,
            selected_plan: selectedPlan,
            billing_cycle: cycle,
            currency,
          },
        },
      });
      if (error) throw error;
      toast.success("Conta criada! Verifique o seu email para confirmar.");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Hostlyb</Link>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Já tem conta? Entrar
          </Link>
        </div>
      </header>

      {/* Trial banner */}
      <div className="bg-primary/10 border-b border-primary/20">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-center gap-2 text-sm">
          <Gift className="h-4 w-4 text-primary" />
          <span><strong>14 dias grátis</strong> — sem cartão de crédito, cancela quando quiser.</span>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Escolha o plano ideal para si
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Todas as funcionalidades, em todos os planos. Pague apenas pelo nível de suporte e tamanho da operação.
          </p>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Currency */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Moeda:</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              >
                {Object.entries(CURRENCIES).map(([code, { label }]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>

            {/* Cycle toggle */}
            <div className="inline-flex items-center rounded-full border border-border bg-card p-1">
              <button
                type="button"
                onClick={() => setCycle("monthly")}
                className={`px-4 py-1.5 text-sm rounded-full transition ${
                  cycle === "monthly" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setCycle("annual")}
                className={`px-4 py-1.5 text-sm rounded-full transition flex items-center gap-2 ${
                  cycle === "annual" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                }`}
              >
                Anual
                <span className="rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 font-semibold">
                  -20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Plans */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS_I18N.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative text-left rounded-2xl border p-6 transition flex flex-col ${
                  plan.highlighted
                    ? "border-primary shadow-lg shadow-primary/10 scale-[1.02]"
                    : "border-border"
                } ${isSelected ? "ring-2 ring-primary" : "hover:border-primary/50"}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" /> Mais popular
                  </div>
                )}
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.tagline}</p>
                </div>
                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">
                      {formatPrice(plan.basePrice, currency, cycle)}
                    </span>
                    <span className="text-sm text-muted-foreground">/mês</span>
                  </div>
                  {cycle === "annual" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Faturado anualmente
                    </p>
                  )}
                </div>
                <ul className="mt-6 space-y-2 flex-1">
                  {FEATURES.map((f) => (
                    <li key={f.label} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f.label}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className={`mt-6 text-center rounded-lg px-4 py-2 text-sm font-medium ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {isSelected ? (t("signup.selectPlan") || "Selecionado") : (t("signup.selectPlan") || "Selecionar plano")}
                </div>
              </button>
            );
          })}
        </section>

        {/* Signup form */}
        <section className="max-w-xl mx-auto rounded-2xl border border-border bg-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{t("signup.createAccount") || "Criar a sua conta"}</h2>
            <p className="text-sm text-muted-foreground">
              {t("signup.selectPlan") || "Plano selecionado"}:{" "}
              <strong>{PLANS_I18N.find((p) => p.id === selectedPlan)?.name}</strong> ·{" "}
              {formatPrice(PLANS_I18N.find((p) => p.id === selectedPlan)!.basePrice, currency, cycle)}/mês
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("signup.fullName") || "Nome completo"}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="O seu nome"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("signup.email") || "Email"}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="voce@exemplo.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("signup.phone") || "Telemóvel"}</label>
              <div className="flex gap-2">
                <select
                  value={dial}
                  onChange={(e) => setDial(e.target.value)}
                  className="rounded-md border border-input bg-background px-2 py-2 text-sm"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.dial}>
                      {c.flag} {c.dial}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="912 345 678"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("signup.password") || "Palavra-passe"}</label>
              <PasswordField
                value={password}
                onChange={setPassword}
                placeholder="Mínimo 8 caracteres"
              />
              {password && (
                <div className="space-y-1 pt-1">
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition ${
                          i < pwScore ? pwColors[pwScore] : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Força: {pwLabels[pwScore]}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">{t("signup.confirmPassword") || "Confirmar palavra-passe"}</label>
              <PasswordField
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Repita a palavra-passe"
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">As palavras-passe não coincidem</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary text-primary-foreground font-medium py-2.5 text-sm hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? (t("signup.submitting") || "A criar conta...") : (t("signup.submit") || "Começar 14 dias grátis")}
            </button>

            <p className="text-xs text-center text-muted-foreground">
              Ao criar conta concorda com os{" "}
              <Link to="/trust" className="underline">Termos</Link> e a{" "}
              <Link to="/trust" className="underline">Política de Privacidade</Link>.
            </p>
          </form>
        </section>

        {/* FAQ */}
        <section className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl font-bold text-center">Perguntas frequentes</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="rounded-lg border border-border bg-card">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="font-medium text-sm">{item.q}</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-sm text-muted-foreground">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border mt-16">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Hostlyb. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
