import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PLATFORMS = ["airbnb", "booking", "vrbo", "custom"] as const;

function toDateOnly(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

async function fetchAndParse(url: string): Promise<Array<{ uid: string; start: Date; end: Date; summary: string }>> {
  const res = await fetch(url, { headers: { "User-Agent": "Hostlyb/1.0 iCal-Sync" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  const ical = await import("node-ical");
  const parsed = ical.sync.parseICS(text);
  const events: Array<{ uid: string; start: Date; end: Date; summary: string }> = [];
  for (const k of Object.keys(parsed)) {
    const ev: any = (parsed as any)[k];
    if (!ev || ev.type !== "VEVENT") continue;
    if (!ev.start || !ev.end) continue;
    const summary = String(ev.summary ?? "").toLowerCase();
    // Skip blocked/unavailable entries
    if (/not available|blocked|unavailable|reserved/.test(summary) && !/reservation|booking|guest/.test(summary)) {
      // still import as a guest? Airbnb exports often only say "Reserved". Treat all VEVENTS as bookings.
    }
    events.push({
      uid: String(ev.uid ?? k),
      start: new Date(ev.start),
      end: new Date(ev.end),
      summary: String(ev.summary ?? "Reserved"),
    });
  }
  return events;
}

export async function syncOneFeed(
  supabase: any,
  feed: { id: string; user_id: string; property_id: string; platform: string; url: string }
): Promise<{ imported: number; status: "healthy" | "error"; error?: string }> {
  try {
    const events = await fetchAndParse(feed.url);
    let imported = 0;
    for (const ev of events) {
      const checkin = toDateOnly(ev.start);
      const checkout = toDateOnly(ev.end);
      const nights = Math.max(1, Math.round((ev.end.getTime() - ev.start.getTime()) / 86400000));
      const name = ev.summary && ev.summary !== "Reserved" ? ev.summary.slice(0, 120) : `Reserva ${feed.platform}`;
      const { error } = await supabase.from("guests").upsert(
        {
          user_id: feed.user_id,
          property_id: feed.property_id,
          name,
          checkin_date: checkin,
          checkout_date: checkout,
          nights,
          status: "confirmado",
          platform: feed.platform,
          source: "ical",
          ical_uid: ev.uid,
          ical_source: feed.platform,
        },
        { onConflict: "user_id,ical_uid", ignoreDuplicates: false }
      );
      if (!error) imported++;
    }
    await supabase
      .from("ical_feeds")
      .update({
        last_sync_at: new Date().toISOString(),
        last_status: "healthy",
        last_error: null,
        events_imported: imported,
      })
      .eq("id", feed.id);
    return { imported, status: "healthy" };
  } catch (e: any) {
    const msg = String(e?.message ?? e).slice(0, 300);
    await supabase
      .from("ical_feeds")
      .update({
        last_sync_at: new Date().toISOString(),
        last_status: "error",
        last_error: msg,
      })
      .eq("id", feed.id);
    return { imported: 0, status: "error", error: msg };
  }
}

export const syncIcalFeed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { feedId: string }) => z.object({ feedId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: feed, error } = await supabase
      .from("ical_feeds")
      .select("*")
      .eq("id", data.feedId)
      .eq("user_id", userId)
      .single();
    if (error || !feed) throw new Error("Feed not found");
    return syncOneFeed(supabase, feed as any);
  });

export const syncAllMyFeeds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: feeds = [] } = await supabase
      .from("ical_feeds")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true);
    const results: any[] = [];
    for (const f of (feeds ?? []) as any[]) {
      results.push({ feedId: f.id, ...(await syncOneFeed(supabase, f)) });
    }
    return { results };
  });

export const PLATFORM_OPTIONS = PLATFORMS;
