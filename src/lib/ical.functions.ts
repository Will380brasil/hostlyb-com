import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const PLATFORMS = ["airbnb", "booking", "vrbo", "custom"] as const;

function toDateOnly(d: Date): string {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast/reserved
  return false;
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (v === "::1" || v === "::" || v === "0:0:0:0:0:0:0:1") return true;
  if (v.startsWith("fe80:") || v.startsWith("fc") || v.startsWith("fd")) return true;
  if (v.startsWith("ff")) return true; // multicast
  // IPv4-mapped (::ffff:a.b.c.d)
  const m = v.match(/^::ffff:([\d.]+)$/);
  if (m) return isPrivateIPv4(m[1]);
  return false;
}

function assertSafeFeedUrl(raw: string): URL {
  let parsed: URL;
  try { parsed = new URL(raw); } catch { throw new Error("Invalid URL"); }
  if (parsed.protocol !== "https:") throw new Error("Only HTTPS iCal URLs are allowed");
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  const blocked = [
    "localhost", "ip6-localhost", "ip6-loopback",
    "metadata.google.internal", "metadata", "metadata.goog",
    "instance-data",
  ];
  if (blocked.includes(host)) throw new Error("Host not allowed");
  // Literal IPs in the URL itself
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && isPrivateIPv4(host)) {
    throw new Error("Private hosts not allowed");
  }
  if (host.includes(":") && isPrivateIPv6(host)) {
    throw new Error("Private hosts not allowed");
  }
  return parsed;
}

// DNS-over-HTTPS lookup via Cloudflare; blocks DNS-rebinding by resolving
// the hostname ourselves and re-checking the resolved IPs against the
// private-range blocklist before fetch().
async function resolveAndAssertPublic(host: string): Promise<void> {
  // If the URL already used a literal IP, assertSafeFeedUrl handled it.
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) || host.includes(":")) return;
  const types = [{ t: "A", check: isPrivateIPv4 }, { t: "AAAA", check: isPrivateIPv6 }];
  for (const { t, check } of types) {
    try {
      const r = await fetch(
        `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${t}`,
        { headers: { accept: "application/dns-json" } }
      );
      if (!r.ok) continue;
      const j: any = await r.json();
      for (const ans of j?.Answer ?? []) {
        const ip = String(ans?.data ?? "").trim();
        if (!ip) continue;
        if (check(ip)) throw new Error("Resolved host is private");
      }
    } catch (e: any) {
      if (e?.message === "Resolved host is private") throw e;
      // DoH failure → fail closed
      throw new Error("Unable to validate iCal host");
    }
  }
}

const MAX_ICAL_BYTES = 5 * 1024 * 1024; // 5MB

async function fetchAndParse(url: string): Promise<Array<{ uid: string; start: Date; end: Date; summary: string }>> {
  const safeUrl = assertSafeFeedUrl(url);
  await resolveAndAssertPublic(safeUrl.hostname.toLowerCase());
  const res = await fetch(url, { headers: { "User-Agent": "Hostlyb/1.0 iCal-Sync" }, redirect: "error" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const lenHeader = Number(res.headers.get("content-length") ?? 0);
  if (lenHeader && lenHeader > MAX_ICAL_BYTES) throw new Error("iCal feed too large");
  const text = await res.text();
  if (text.length > MAX_ICAL_BYTES) throw new Error("iCal feed too large");
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
