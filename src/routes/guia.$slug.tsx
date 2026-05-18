import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useT } from "@/lib/i18n";
import { Wifi, Home, LogIn, LogOut, Sparkles, MapPin, Phone, BookOpen } from "lucide-react";

export const Route = createFileRoute("/guia/$slug")({
  head: () => ({ meta: [{ title: "Guia do imóvel" }, { name: "robots", content: "noindex" }] }),
  component: PublicGuidebook,
});

function PublicGuidebook() {
  const { slug } = Route.useParams();
  const t = useT();

  const { data, isLoading } = useQuery({
    queryKey: ["public-guidebook", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id,name,address,city,user_id,guidebook_data,guidebook_enabled")
        .eq("guidebook_slug", slug)
        .eq("guidebook_enabled", true)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      // fetch plan tier of owner via org members → subscriptions
      const { data: m } = await supabase.from("organization_members").select("organization_id").eq("user_id", data.user_id).limit(1).maybeSingle();
      let tier = "free";
      if (m) {
        const { data: s } = await supabase.from("subscriptions").select("plan_tier,status,current_period_end")
          .eq("organization_id", m.organization_id).order("created_at", { ascending: false }).limit(1).maybeSingle();
        if (s) {
          const active = s.status === "active" || s.status === "trialing" ||
            ((s.status === "canceled" || s.status === "past_due") && s.current_period_end && new Date(s.current_period_end) > new Date());
          if (active) tier = s.plan_tier ?? "free";
        }
      }
      return { ...data, ownerTier: tier };
    },
  });

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">…</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center px-6 text-center text-muted-foreground">{t("guidebook.notFound")}</div>;

  const gb = (data.guidebook_data ?? {}) as Record<string, string>;
  const sections: [string, string, any][] = [
    ["checkin", "guidebook.field.checkin", LogIn],
    ["checkout", "guidebook.field.checkout", LogOut],
    ["wifi", "guidebook.field.wifi", Wifi],
    ["rules", "guidebook.field.rules", Home],
    ["appliances", "guidebook.field.appliances", Sparkles],
    ["tips", "guidebook.field.tips", MapPin],
    ["host", "guidebook.field.host", Phone],
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto px-5 py-8">
        <header className="mb-6 text-center">
          <BookOpen className="mx-auto mb-2" size={28} style={{ color: "var(--color-primary)" }} />
          <h1 className="text-2xl font-bold">{data.name}</h1>
          {data.address && <p className="text-sm text-muted-foreground">{data.address}{data.city ? `, ${data.city}` : ""}</p>}
        </header>

        <div className="flex flex-col gap-4">
          {sections.map(([k, label, Icon]) => {
            const v = gb[k];
            if (!v || !v.trim()) return null;
            return (
              <section key={k} className="hostly-card">
                <h2 className="font-bold mb-2 flex items-center gap-2"><Icon size={16} style={{ color: "var(--color-primary)" }} /> {t(label)}</h2>
                <p className="text-sm whitespace-pre-wrap">{v}</p>
              </section>
            );
          })}
        </div>

        {data.ownerTier !== "premium" && (
          <p className="text-center text-xs text-muted-foreground mt-8 py-4 border-t">
            {t("guidebook.poweredBy")}
          </p>
        )}
      </div>
    </div>
  );
}
