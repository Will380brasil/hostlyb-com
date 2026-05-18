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
      const { data, error } = await supabase.rpc("get_public_guidebook", { p_slug: slug });
      if (error) throw error;
      return (data as any) ?? null;
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
