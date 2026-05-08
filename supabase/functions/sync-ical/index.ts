import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Unauthorized");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { feed_id } = await req.json();
    const { data: feed, error: fErr } = await supabase.from("ical_feeds")
      .select("*").eq("id", feed_id).eq("user_id", user.id).maybeSingle();
    if (fErr || !feed) throw new Error("Feed not found");

    let imported = 0, skipped = 0;
    try {
      const res = await fetch(feed.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const events = parseICS(await res.text());
      for (const ev of events) {
        const summary = (ev.summary || "").toLowerCase();
        if (summary.includes("not available") || summary.includes("blocked")) { skipped++; continue; }
        const { error } = await supabase.from("guests").upsert({
          user_id: user.id,
          property_id: feed.property_id,
          name: ev.summary || `Reserva ${feed.platform}`,
          checkin_date: fmtDate(ev.start),
          checkout_date: fmtDate(ev.end),
          platform: feed.platform,
          status: "confirmado",
          ical_uid: ev.uid,
          source: "ical",
        }, { onConflict: "user_id,ical_uid" });
        if (error) skipped++; else imported++;
      }
      await supabase.from("ical_feeds").update({
        last_synced_at: new Date().toISOString(), last_error: null,
      }).eq("id", feed_id);
    } catch (e) {
      await supabase.from("ical_feeds").update({ last_error: String(e) }).eq("id", feed_id);
      throw e;
    }

    return new Response(JSON.stringify({ ok: true, imported, skipped }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
