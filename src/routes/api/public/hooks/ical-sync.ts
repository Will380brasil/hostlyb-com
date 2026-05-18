import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { syncOneFeed } from "@/lib/ical.functions";

export const Route = createFileRoute("/api/public/hooks/ical-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.CRON_SECRET;
        const auth = request.headers.get("authorization");
        if (!secret || auth !== `Bearer ${secret}`) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { data: feeds, error } = await supabaseAdmin
          .from("ical_feeds")
          .select("*")
          .eq("is_active", true);
        if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
        const results: any[] = [];
        for (const f of (feeds ?? []) as any[]) {
          results.push({ feedId: f.id, ...(await syncOneFeed(supabaseAdmin, f)) });
        }
        return Response.json({ ok: true, processed: results.length, results });
      },
    },
  },
});
