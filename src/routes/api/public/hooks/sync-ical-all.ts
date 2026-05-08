import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function parseICS(text: string) {
  const events: { uid: string; start: string; end: string; summary: string }[] = [];
  const lines = text.replace(/\r\n[ \t]/g, "").split(/\r?\n/);
  let cur: any = null;
  for (const line of lines) {
    if (line === "BEGIN:VEVENT") cur = {};
    else if (line === "END:VEVENT") {
      if (cur?.uid && cur?.start && cur?.end) events.push(cur);
      cur = null;
    } else if (cur) {
      const [k, ...rest] = line.split(":");
      const v = rest.join(":");
      const key = k.split(";")[0];
      if (key === "UID") cur.uid = v;
      else if (key === "DTSTART") cur.start = v.slice(0, 8);
      else if (key === "DTEND") cur.end = v.slice(0, 8);
      else if (key === "SUMMARY") cur.summary = v;
    }
  }
  return events;
}
const fmtDate = (s: string) => `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;

async function syncFeed(feed: any) {
  const res = await fetch(feed.url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const events = parseICS(await res.text());
  let imported = 0;
  for (const ev of events) {
    const summary = (ev.summary || "").toLowerCase();
    if (summary.includes("not available") || summary.includes("blocked")) continue;
    const { error } = await supabaseAdmin.from("guests").upsert({
      user_id: feed.user_id,
      property_id: feed.property_id,
      name: ev.summary || `Reserva ${feed.platform}`,
      checkin_date: fmtDate(ev.start),
      checkout_date: fmtDate(ev.end),
      platform: feed.platform,
      status: "confirmado",
      ical_uid: ev.uid,
      source: "ical",
    }, { onConflict: "user_id,ical_uid" });
    if (!error) imported++;
  }
  return imported;
}

export const Route = createFileRoute("/api/public/hooks/sync-ical-all")({
  server: {
    handlers: {
      POST: async () => {
        const nowIso = new Date().toISOString();
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

        const { data: feeds, error } = await supabaseAdmin
          .from("ical_feeds")
          .select("*")
          .neq("sync_frequency", "manual");
        if (error) return Response.json({ error: error.message }, { status: 500 });

        const due = (feeds ?? []).filter((f: any) => {
          if (!f.last_synced_at) return true;
          if (f.sync_frequency === "hourly") return f.last_synced_at < hourAgo;
          if (f.sync_frequency === "daily") return f.last_synced_at < dayAgo;
          return false;
        });

        const results: any[] = [];
        for (const f of due) {
          try {
            const imported = await syncFeed(f);
            await supabaseAdmin.from("ical_feeds").update({
              last_synced_at: nowIso, last_error: null,
            }).eq("id", f.id);
            results.push({ id: f.id, imported });
          } catch (e: any) {
            await supabaseAdmin.from("ical_feeds").update({ last_error: String(e) }).eq("id", f.id);
            results.push({ id: f.id, error: String(e) });
          }
        }
        return Response.json({ ok: true, processed: results.length, results });
      },
    },
  },
});
