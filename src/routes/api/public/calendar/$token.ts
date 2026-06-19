import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

function ics(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toISOString().slice(0, 10).replace(/-/g, "");
}
function esc(s: string) {
  return (s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}
function fold(line: string) {
  if (line.length <= 75) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    out.push((i === 0 ? "" : " ") + line.slice(i, i + 73));
    i += 73;
  }
  return out.join("\r\n");
}

export const Route = createFileRoute("/api/public/calendar/$token")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const token = params.token.replace(/\.ics$/i, "");
        const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRe.test(token)) {
          return new Response("Not found", { status: 404 });
        }
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } }
        );
        const { data, error } = await supabase.rpc("get_ical_export", { p_token: token });
        if (error) {
          return new Response("error", { status: 500 });
        }
        const rows = (data ?? []) as Array<{
          guest_name: string;
          property_name: string;
          platform: string | null;
          checkin_date: string;
          checkout_date: string;
          guest_id: string;
        }>;

        const lines: string[] = [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Hostlyb//Hostlyb Calendar//EN",
          "CALSCALE:GREGORIAN",
          "METHOD:PUBLISH",
          fold("X-WR-CALNAME:Hostlyb — Reservas"),
        ];
        for (const r of rows) {
          lines.push("BEGIN:VEVENT");
          lines.push(`UID:${r.guest_id}@hostlyb.com`);
          lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`);
          lines.push(`DTSTART;VALUE=DATE:${ics(r.checkin_date)}`);
          lines.push(`DTEND;VALUE=DATE:${ics(r.checkout_date)}`);
          lines.push(
            fold(`SUMMARY:${esc(r.guest_name ?? "Reserva")} — ${esc(r.property_name ?? "")}`)
          );
          lines.push(
            fold(
              `DESCRIPTION:${esc(
                `Plataforma: ${r.platform ?? "—"} | Imóvel: ${r.property_name ?? "—"}`
              )}`
            )
          );
          lines.push("END:VEVENT");
        }
        lines.push("END:VCALENDAR");
        const body = lines.join("\r\n") + "\r\n";

        return new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/calendar; charset=utf-8",
            "Cache-Control": "private, max-age=300",
            "Content-Disposition": `inline; filename="hostlyb.ics"`,
          },
        });
      },
    },
  },
});
