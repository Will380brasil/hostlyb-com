import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Sparkles, MapPin, Wifi, AlertTriangle, Camera, Loader2, BedDouble, Bath, Eye, EyeOff, Plus, X, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SignedImage } from "@/components/SignedImage";
import { ReportProblemSheet } from "@/components/cleaner/ReportProblemSheet";
import { useAuth } from "@/hooks/useAuth";
import { useT, useLocale } from "@/lib/i18n";
import { toast } from "sonner";

export const Route = createFileRoute("/faxineira/$token")({
  head: () => ({ meta: [{ title: "Limpeza — Hostlyb" }, { name: "robots", content: "noindex" }] }),
  component: CleanerGate,
});

type TokenInfo = {
  cleaner_id: string | null;
  cleaner_email: string | null;
  cleaner_name: string | null;
  cleaner_phone: string | null;
  has_account: boolean;
  property_name: string;
};

/* ----------------------------- Auth gate ----------------------------- */

function CleanerGate() {
  const { token } = Route.useParams();
  const { session, loading: authLoading } = useAuth();
  const t = useT();

  const { data: info, isLoading, error } = useQuery({
    queryKey: ["cleaner-token-lookup", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("cleaner_token_lookup", { p_token: token });
      if (error) throw error;
      return data as unknown as TokenInfo;
    },
  });

  const claimed = useQuery({
    queryKey: ["cleaner-claim", token, session?.user.id],
    enabled: !!session?.user.id && !!info,
    queryFn: async () => {
      const { error } = await supabase.rpc("cleaner_claim_token", { p_token: token });
      if (error && error.message !== "cleaner_already_bound") {
        console.warn("claim failed", error);
      }
      return true;
    },
  });

  if (authLoading || isLoading) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">{t("fax.loading")}</div>;
  }

  if (error || !info || !info.cleaner_id) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <AlertTriangle className="mx-auto mb-3" />
          <h1 className="text-lg font-bold">{t("fax.invalidTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("fax.invalidBody")}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return info.has_account
      ? <CleanerLogin token={token} info={info} />
      : <CleanerSignup token={token} info={info} />;
  }

  if (claimed.isLoading) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">{t("fax.preparing")}</div>;
  }

  return <CleanerPortal token={token} />;
}

/* --------------------------- Signup screen --------------------------- */

function CleanerSignup({ token, info }: { token: string; info: TokenInfo }) {
  const t = useT();
  const [name, setName] = useState(info.cleaner_name ?? "");
  const [email, setEmail] = useState(info.cleaner_email ?? "");
  const [phone, setPhone] = useState(info.cleaner_phone ?? "");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [mode, setMode] = useState<"signup" | "login">("signup");

  if (mode === "login") return <CleanerLogin token={token} info={{ ...info, cleaner_email: email || info.cleaner_email }} />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: { data: { full_name: name.trim(), phone: phone.trim(), role: "cleaner" } },
      });
      if (error) {
        const msg = (error.message || "").toLowerCase();
        if (msg.includes("already registered") || msg.includes("already exists")) {
          setErr(t("fax.signup.errExists"));
        } else if (msg.includes("password")) {
          setErr(t("fax.signup.errPassword"));
        } else {
          setErr(t("fax.signup.errCreate"));
        }
        return;
      }
      toast.success(t("fax.signup.success"));
    } catch {
      setErr(t("fax.signup.errUnexpected"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-5 py-8 mx-auto w-full max-w-[460px]">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🧹</div>
        <h1 className="text-2xl font-black">{t("fax.signup.title")}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t("fax.signup.subtitle")}</p>
        <p className="text-xs text-muted-foreground mt-3">
          {t("fax.signup.cleaningAt")} <strong>{info.property_name}</strong>
        </p>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-muted-foreground">{t("fax.signup.name")}
          <input required value={name} onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full px-3 py-3 rounded-xl bg-card border border-card-border text-sm" />
        </label>
        <label className="text-xs font-semibold text-muted-foreground">{t("fax.signup.email")}
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full px-3 py-3 rounded-xl bg-card border border-card-border text-sm" />
        </label>
        <label className="text-xs font-semibold text-muted-foreground">{t("fax.signup.phone")}
          <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full px-3 py-3 rounded-xl bg-card border border-card-border text-sm" />
        </label>
        <label className="text-xs font-semibold text-muted-foreground">{t("fax.signup.password")}
          <div className="relative mt-1">
            <input type={showPwd ? "text" : "password"} required minLength={6} value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 pr-10 rounded-xl bg-card border border-card-border text-sm" />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground">
              {showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </label>

        {err && (
          <div className="text-xs text-destructive bg-destructive/10 rounded-lg p-3">
            {err}
            {err === t("fax.signup.errExists") && (
              <button type="button" onClick={() => setMode("login")} className="block mt-1 underline font-semibold">
                {t("fax.signup.loginCta")}
              </button>
            )}
          </div>
        )}

        <button disabled={loading} className="mt-2 py-3 rounded-2xl font-bold text-white disabled:opacity-50"
          style={{ background: "var(--color-accent)" }}>
          {loading ? t("fax.signup.submitting") : t("fax.signup.submit")}
        </button>

        <p className="text-xs text-center text-muted-foreground mt-2">
          {t("fax.signup.hasAccount")}{" "}
          <button type="button" onClick={() => setMode("login")} className="font-semibold underline" style={{ color: "var(--color-accent)" }}>
            {t("fax.signup.login")}
          </button>
        </p>
      </form>
    </div>
  );
}

/* ---------------------------- Login screen --------------------------- */

function CleanerLogin({ token, info }: { token: string; info: TokenInfo }) {
  const t = useT();
  const [method, setMethod] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState(info.cleaner_email ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function loginPwd(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    setLoading(false);
    if (error) setErr(t("fax.login.invalid"));
  }

  async function sendMagic() {
    setErr(null);
    if (!email) { setErr(t("fax.login.needEmail")); return; }
    setLoading(true);
    const redirectTo = `${window.location.origin}/faxineira/${token}`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: redirectTo },
    });
    setLoading(false);
    if (error) setErr(t("fax.login.magicErr"));
    else setMagicSent(true);
  }

  if (magicSent) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <div>
          <div className="text-5xl mb-3">📧</div>
          <h1 className="text-lg font-bold">{t("fax.login.magicSentTitle")}</h1>
          <p className="text-sm text-muted-foreground mt-2">
            {t("fax.login.magicSentBody")} <strong>{email}</strong>.
          </p>
          <button onClick={() => setMagicSent(false)} className="mt-4 text-xs underline text-muted-foreground">
            {t("fax.login.magicRetry")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 py-8 mx-auto w-full max-w-[460px]">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🧹</div>
        <h1 className="text-2xl font-black">{t("fax.login.title")}</h1>
        <p className="text-sm text-muted-foreground mt-2">{t("fax.login.subtitle")} <strong>{info.property_name}</strong>.</p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl bg-muted mb-4">
        <button onClick={() => setMethod("password")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${method === "password" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
          🔑 {t("fax.login.password")}
        </button>
        <button onClick={() => setMethod("magic")}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold ${method === "magic" ? "bg-card shadow-sm" : "text-muted-foreground"}`}>
          ✉️ {t("fax.login.magic")}
        </button>
      </div>

      {method === "password" ? (
        <form onSubmit={loginPwd} className="flex flex-col gap-3">
          <input type="email" required placeholder={t("fax.signup.email")} value={email} onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-3 rounded-xl bg-card border border-card-border text-sm" />
          <input type="password" required placeholder={t("fax.login.password")} value={password} onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-3 rounded-xl bg-card border border-card-border text-sm" />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button disabled={loading} className="py-3 rounded-2xl font-bold text-white disabled:opacity-50"
            style={{ background: "var(--color-accent)" }}>
            {loading ? t("fax.login.signingIn") : t("fax.login.signin")}
          </button>
        </form>
      ) : (
        <div className="flex flex-col gap-3">
          <input type="email" required placeholder={t("fax.signup.email")} value={email} onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-3 rounded-xl bg-card border border-card-border text-sm" />
          {err && <p className="text-xs text-destructive">{err}</p>}
          <button disabled={loading} onClick={sendMagic}
            className="py-3 rounded-2xl font-bold text-white disabled:opacity-50"
            style={{ background: "var(--color-accent)" }}>
            {loading ? t("fax.login.magicSending") : t("fax.login.magicSend")}
          </button>
          <p className="text-xs text-muted-foreground text-center">{t("fax.login.magicHelp")}</p>
        </div>
      )}

      <p className="text-xs text-center text-muted-foreground mt-6">
        {t("fax.login.noAccount")}{" "}
        <Link to="/faxineira/$token" params={{ token }} reloadDocument className="font-semibold underline" style={{ color: "var(--color-accent)" }}>
          {t("fax.login.createNow")}
        </Link>
      </p>
    </div>
  );
}

/* ----------------------- Checklist (authorised) ---------------------- */

type ChecklistItem = { label: string; done: boolean };
type ForgottenItem = { id: string; description: string; photo_url: string | null; status: string; notes: string | null };
type Job = {
  id: string;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  started_at: string | null;
  checklist: ChecklistItem[] | string[];
  photos: string[];
  notes: string | null;
  has_forgotten_items: boolean;
  property: { id: string; name: string; address: string; city: string | null; wifi_password: string | null; bedrooms: number | null; bathrooms: number | null };
  cleaner: { id: string; name: string; photo_url: string | null } | null;
  forgotten_items: ForgottenItem[];
};

const STATUS_KEY: Record<string, string> = {
  agendado: "status.agendado", em_andamento: "status.em_andamento", concluido: "status.concluido", problema: "status.problema", cancelado: "status.cancelado",
};

function formatTimer(secs: number) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

function normalizeChecklist(raw: any): ChecklistItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((it) => typeof it === "string" ? { label: it, done: false } : { label: String(it.label ?? ""), done: !!it.done });
}

function CleanerPortal({ token }: { token: string }) {
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["cleaner-job", token],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("cleaner_get_job", { p_token: token });
      if (error) throw error;
      return data as unknown as Job;
    },
  });

  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [notes, setNotes] = useState("");
  const [newItem, setNewItem] = useState({ description: "", location: "" });
  const [newItemFile, setNewItemFile] = useState<File | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showProblem, setShowProblem] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (data) {
      setChecklist(normalizeChecklist(data.checklist));
      setNotes(data.notes ?? "");
    }
  }, [data?.id]);

  useEffect(() => {
    if (!data?.started_at || data.status !== "em_andamento") { setElapsed(0); return; }
    const start = new Date(data.started_at).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data?.started_at, data?.status]);

  const update = useMutation({
    mutationFn: async (payload: { checklist?: any; notes?: string; status?: string; photos?: any }) => {
      const { error } = await supabase.rpc("cleaner_update_job", {
        p_token: token,
        p_checklist: payload.checklist ?? undefined,
        p_notes: payload.notes ?? undefined,
        p_status: payload.status ?? undefined,
        p_photos: payload.photos ?? undefined,
      });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cleaner-job", token] }),
    onError: (e: any) => toast.error(e.message ?? "Erro ao guardar"),
  });

  const addItem = useMutation({
    mutationFn: async (vars: { description: string; location: string; photo_url: string | null }) => {
      const { error } = await supabase.rpc("cleaner_add_forgotten_item", {
        p_token: token, p_description: vars.description, p_photo_url: vars.photo_url ?? undefined, p_notes: vars.location || undefined,
      });
      if (error) throw error;
      // Fire-and-forget: extra realtime notification to host (alert is also created by DB trigger)
      void notifyHostWithThumb({ type: "photo", description: `Objeto esquecido: ${vars.description}${vars.location ? ` (${vars.location})` : ""}` });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cleaner-job", token] });
      setNewItem({ description: "", location: "" });
      setNewItemFile(null);
      setShowItemForm(false);
      toast.success("Objeto registado. Anfitrião notificado.");
    },
    onError: (e: any) => toast.error(e.message ?? "Erro"),
  });

  async function uploadPhoto(file: File, bucket: "cleaning-photos" | "forgotten-items") {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${token}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
    if (error) throw error;
    return path;
  }

  async function makeThumbnail(file: File): Promise<string | null> {
    try {
      const bitmap = await createImageBitmap(file).catch(() => null);
      if (!bitmap) return null;
      const maxDim = 480;
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(bitmap, 0, 0, w, h);
      for (const q of [0.7, 0.55, 0.4, 0.3, 0.22]) {
        const dataUrl = canvas.toDataURL("image/jpeg", q);
        const b64 = dataUrl.split(",")[1] ?? "";
        const bytes = Math.floor((b64.length * 3) / 4);
        if (bytes <= 50_000) return b64;
      }
      return null;
    } catch { return null; }
  }

  async function notifyHostWithThumb(payload: {
    type: "photo" | "problem";
    description?: string;
    urgency?: "low" | "medium" | "high";
    bucket?: "cleaning-photos" | "forgotten-items";
    path?: string;
    thumbnailBase64?: string | null;
  }) {
    try {
      const res = await fetch("/api/public/cleaner/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...payload, thumbnailBase64: payload.thumbnailBase64 ?? undefined }),
      });
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      console.warn("notifyHostWithThumb failed", e);
    }
  }

  async function onAddPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    setUploading(true);
    try {
      const path = await uploadPhoto(file, "cleaning-photos");
      const thumbnailBase64 = await makeThumbnail(file);
      await notifyHostWithThumb({ type: "photo", bucket: "cleaning-photos", path, thumbnailBase64 });
      toast.success("Foto enviada ao anfitrião");
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao enviar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onAddForgottenWithPhoto(file: File | null) {
    if (!newItem.description.trim()) { toast.error("Descreva o objeto"); return; }
    setUploading(true);
    try {
      let photo_url: string | null = null;
      if (file) photo_url = await uploadPhoto(file, "forgotten-items");
      await addItem.mutateAsync({ description: newItem.description.trim(), location: newItem.location.trim(), photo_url });
    } catch (err: any) {
      toast.error(err.message ?? "Falha ao registar");
    } finally { setUploading(false); }
  }

  async function afterProblemReported() {
    try { await update.mutateAsync({ status: "problema", checklist, notes }); } catch {}
  }

  if (isLoading) return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">A carregar…</div>;
  if (error || !data) return (
    <div className="min-h-screen grid place-items-center px-6 text-center">
      <div>
        <AlertTriangle className="mx-auto mb-3" />
        <h1 className="text-lg font-bold">Link inválido</h1>
        <p className="text-sm text-muted-foreground mt-1">Peça um novo link ao anfitrião.</p>
      </div>
    </div>
  );

  const allDone = checklist.length > 0 && checklist.every((c) => c.done);
  const dirty = JSON.stringify(checklist) !== JSON.stringify(normalizeChecklist(data.checklist)) || (notes ?? "") !== (data.notes ?? "");

  return (
    <div className="min-h-screen mx-auto w-full max-w-[480px] bg-background pb-32">
      <header className="sticky top-0 z-10 px-5 py-4 bg-background/95 backdrop-blur border-b border-card-border">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">Host<span style={{ color: "var(--color-accent)" }}>lyb</span></h1>
          <span className="text-xs px-2.5 py-1 rounded-full font-semibold"
            style={{ background: data.status === "concluido" ? "var(--color-accent)" : "var(--color-card)", color: data.status === "concluido" ? "white" : "var(--color-foreground)", border: "1px solid var(--color-card-border)" }}>
            {STATUS_LABEL[data.status] ?? data.status}
          </span>
        </div>
      </header>

      <main className="px-4 pt-4 space-y-4">
        <section className="rounded-2xl bg-card border border-card-border p-4">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} style={{ color: "var(--color-accent)" }} />
            <h2 className="font-bold">{data.property.name}</h2>
          </div>
          <p className="text-xs text-muted-foreground flex items-start gap-1">
            <MapPin size={12} className="mt-0.5 shrink-0" />
            <span>{data.property.address}{data.property.city ? `, ${data.property.city}` : ""}</span>
          </p>
          <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
            {data.property.bedrooms != null && <span className="flex items-center gap-1"><BedDouble size={12} /> {data.property.bedrooms}</span>}
            {data.property.bathrooms != null && <span className="flex items-center gap-1"><Bath size={12} /> {data.property.bathrooms}</span>}
            <span>📅 {new Date(data.scheduled_date + "T" + data.scheduled_time).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          {data.property.wifi_password && (
            <div className="mt-3 pt-3 border-t border-card-border text-xs flex items-center gap-2">
              <Wifi size={12} /> <span className="font-mono">{data.property.wifi_password}</span>
            </div>
          )}
        </section>

        {data.status !== "em_andamento" && data.status !== "concluido" && (
          <button onClick={() => update.mutate({ status: "em_andamento" })} className="w-full py-3 rounded-2xl font-bold text-white" style={{ background: "var(--color-accent)" }}>
            Iniciar limpeza
          </button>
        )}

        {data.status === "em_andamento" && (
          <section className="rounded-2xl border border-card-border p-4 text-center" style={{ background: "var(--color-accent)11" }}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Limpeza em curso</p>
            <p className="text-5xl font-mono font-bold tracking-widest" style={{ color: "var(--color-accent)" }}>{formatTimer(elapsed)}</p>
          </section>
        )}

        <section className="rounded-2xl bg-card border border-card-border p-4">
          <h3 className="font-bold mb-3">Checklist</h3>
          {checklist.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhum item.</p>
          ) : (
            <ul className="space-y-2">
              {checklist.map((it, i) => (
                <li key={i}>
                  <button onClick={() => setChecklist((cs) => cs.map((c, j) => j === i ? { ...c, done: !c.done } : c))}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background text-left">
                    <span className="w-5 h-5 rounded-md grid place-items-center border"
                      style={{ background: it.done ? "var(--color-accent)" : "transparent", borderColor: it.done ? "var(--color-accent)" : "var(--color-card-border)" }}>
                      {it.done && <Check size={14} className="text-white" />}
                    </span>
                    <span className={`text-sm ${it.done ? "line-through text-muted-foreground" : ""}`}>{it.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl bg-card border border-card-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Fotos da limpeza</h3>
            <label className="text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer flex items-center gap-1" style={{ background: "var(--color-accent)", color: "white" }}>
              {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />} Adicionar
              <input type="file" accept="image/*" capture="environment" className="hidden" onChange={onAddPhoto} disabled={uploading} />
            </label>
          </div>
          {data.photos?.length ? (
            <div className="grid grid-cols-3 gap-2">
              {data.photos.map((p, i) => <SignedImage key={i} bucket="cleaning-photos" path={p} alt="" className="aspect-square object-cover rounded-lg w-full" />)}
            </div>
          ) : <p className="text-xs text-muted-foreground">Nenhuma foto enviada.</p>}
        </section>

        <section className="rounded-2xl bg-card border border-card-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><Package size={14} /> Objetos esquecidos</h3>
            <button onClick={() => setShowItemForm(true)} className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1" style={{ background: "var(--color-accent)", color: "white" }}>
              <Plus size={12} /> Registar objeto
            </button>
          </div>

          {data.forgotten_items.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nada registado.</p>
          ) : (
            <ul className="space-y-2">
              {data.forgotten_items.map((it) => (
                <li key={it.id} className="flex gap-2 p-2 rounded-lg bg-background">
                  {it.photo_url && <SignedImage bucket="forgotten-items" path={it.photo_url} alt="" className="w-12 h-12 rounded-md object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{it.description}</p>
                    {it.notes && <p className="text-xs text-muted-foreground truncate flex items-center gap-1"><MapPin size={10} /> {it.notes}</p>}
                    <span className="text-[10px] text-muted-foreground">{it.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {showItemForm && (
          <div className="fixed inset-0 z-50 bg-black/50 grid place-items-end sm:place-items-center px-4 py-6" onClick={() => !uploading && setShowItemForm(false)}>
            <div className="w-full max-w-[460px] rounded-2xl bg-card border border-card-border p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2"><Package size={16} /> Registar objeto esquecido</h3>
                <button onClick={() => setShowItemForm(false)} disabled={uploading} className="p-1 text-muted-foreground"><X size={18} /></button>
              </div>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Descrição do objeto</span>
                <input value={newItem.description} onChange={(e) => setNewItem((n) => ({ ...n, description: e.target.value }))} placeholder="Ex.: Carregador de telemóvel" autoFocus
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-card-border bg-background text-sm" />
              </label>

              <label className="block">
                <span className="text-xs font-semibold text-muted-foreground">Localização no imóvel</span>
                <input value={newItem.location} onChange={(e) => setNewItem((n) => ({ ...n, location: e.target.value }))} placeholder="Ex.: Quarto 1, casa de banho, sala"
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-card-border bg-background text-sm" />
              </label>

              <div>
                <span className="text-xs font-semibold text-muted-foreground">Foto (opcional)</span>
                <label className="mt-1 flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-card-border text-xs cursor-pointer">
                  <Camera size={14} /> {newItemFile ? newItemFile.name : "Tirar foto / escolher imagem"}
                  <input type="file" accept="image/*" capture="environment" className="hidden" disabled={uploading}
                    onChange={(e) => setNewItemFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setShowItemForm(false)} disabled={uploading}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-card-border">
                  Cancelar
                </button>
                <button disabled={uploading || !newItem.description.trim()} onClick={() => onAddForgottenWithPhoto(newItemFile)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50 flex items-center justify-center gap-2"
                  style={{ background: "var(--color-accent)" }}>
                  {uploading ? <><Loader2 size={14} className="animate-spin" /> A registar…</> : "Registar"}
                </button>
              </div>
            </div>
          </div>
        )}

        <section className="rounded-2xl bg-card border border-card-border p-4">
          <h3 className="font-bold mb-2">Observações</h3>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Algo importante para o anfitrião…"
            className="w-full px-3 py-2 rounded-lg border border-card-border bg-background text-sm" />
        </section>

        <button onClick={() => setShowProblem(true)} disabled={uploading}
          className="w-full py-2.5 rounded-xl text-sm font-semibold border border-card-border flex items-center justify-center gap-2"
          style={{ color: "var(--color-destructive, #ef4444)" }}>
          <AlertTriangle size={14} /> Reportar problema
        </button>
        {showProblem && <ReportProblemSheet token={token} onClose={() => setShowProblem(false)} onReported={afterProblemReported} />}
      </main>

      <footer className="fixed bottom-0 inset-x-0 mx-auto max-w-[480px] p-4 bg-background/95 backdrop-blur border-t border-card-border space-y-2">
        {dirty && (
          <button onClick={() => update.mutate({ checklist, notes })} disabled={update.isPending}
            className="w-full py-2.5 rounded-xl text-sm font-semibold border border-card-border">
            {update.isPending ? "A guardar…" : "Guardar progresso"}
          </button>
        )}
        <button onClick={() => update.mutate({ status: "concluido", checklist, notes })}
          disabled={!allDone || update.isPending || data.status === "concluido"}
          className="w-full py-3 rounded-2xl font-bold text-white disabled:opacity-50"
          style={{ background: "var(--color-accent)" }}>
          {data.status === "concluido" ? "✓ Limpeza concluída" : allDone ? "Concluir limpeza" : `Conclua o checklist (${checklist.filter(c => c.done).length}/${checklist.length})`}
        </button>
        <div style={{ height: "env(safe-area-inset-bottom)" }} />
      </footer>
    </div>
  );
}
