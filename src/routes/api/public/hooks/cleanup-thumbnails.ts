import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/hooks/cleanup-thumbnails")({
  server: {
    handlers: {
      POST: async () => {
        const url = process.env.SUPABASE_URL!;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        if (!url || !key) return Response.json({ error: "Server misconfigured" }, { status: 500 });

        const admin = createClient(url, key);

        const { data: expired, error } = await admin
          .from("cleaning_photo_thumbnails")
          .select("id, thumbnail_path")
          .lt("expires_at", new Date().toISOString())
          .limit(500);
        if (error) return Response.json({ error: error.message }, { status: 500 });
        if (!expired || expired.length === 0) return Response.json({ ok: true, removed: 0 });

        const paths = expired.map((r: any) => r.thumbnail_path).filter(Boolean);
        if (paths.length > 0) {
          await admin.storage.from("cleaning-thumbnails").remove(paths).catch(() => {});
        }
        await admin
          .from("cleaning_photo_thumbnails")
          .delete()
          .in("id", expired.map((r: any) => r.id));

        return Response.json({ ok: true, removed: expired.length });
      },
    },
  },
});
