import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Loader2 } from "lucide-react";

export const Route = createFileRoute("/checkin/$token")({
  head: () => ({ meta: [{ title: "Check-in" }, { name: "robots", content: "noindex" }] }),
  component: PublicCheckin,
});

function PublicCheckin() {
  const { token } = Route.useParams();
  const t = useT();
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: "", document: "", docCountry: "", dob: "", nationality: "" });

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("guest_checkin_get", { p_token: token });
      if (error || !data) { setLoading(false); return; }
      setInfo(data);
      setForm({
        name: (data as any).name ?? "",
        document: (data as any).document ?? "",
        docCountry: (data as any).document_country ?? "",
        dob: (data as any).date_of_birth ?? "",
        nationality: (data as any).nationality ?? "",
      });
      if ((data as any).submitted_at) setDone(true);
      setLoading(false);
    })();
  }, [token]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.rpc("guest_checkin_submit", {
      p_token: token,
      p_name: form.name,
      p_document: form.document,
      p_document_country: form.docCountry,
      p_date_of_birth: form.dob || (null as any),
      p_nationality: form.nationality,
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!info) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">—</div>;

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="hostly-card max-w-md text-center py-10">
          <CheckCircle2 className="mx-auto mb-3" size={40} style={{ color: "var(--color-success)" }} />
          <h2 className="text-xl font-bold mb-2">{t("checkin.submitted")}</h2>
          <p className="text-sm text-muted-foreground">{t("checkin.thanks")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 py-8">
        <header className="text-center mb-6">
          <ShieldCheck className="mx-auto mb-2" size={28} style={{ color: "var(--color-primary)" }} />
          <h1 className="text-2xl font-bold">{t("checkin.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("checkin.subtitle")}</p>
          <p className="text-xs text-muted-foreground mt-2">{info.property_name} · {info.checkin_date} → {info.checkout_date}</p>
        </header>

        <form onSubmit={submit} className="hostly-card flex flex-col gap-3">
          {([
            ["name", "checkin.field.name", "text"],
            ["document", "checkin.field.document", "text"],
            ["docCountry", "checkin.field.docCountry", "text"],
            ["dob", "checkin.field.dob", "date"],
            ["nationality", "checkin.field.nationality", "text"],
          ] as [keyof typeof form, string, string][]).map(([k, label, type]) => (
            <label key={k} className="text-sm">
              <span className="block font-semibold mb-1">{t(label)}</span>
              <input required type={type} className="w-full rounded-lg border p-2 text-sm"
                value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
            </label>
          ))}
          <button disabled={submitting} type="submit" className="btn-primary justify-center mt-2">
            {submitting && <Loader2 size={14} className="animate-spin" />} {t("checkin.submit")}
          </button>
        </form>
      </div>
    </div>
  );
}
