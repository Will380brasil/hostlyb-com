import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { cleaningJobs, guests, getProperty } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

export const Route = createFileRoute("/calendario")({
  head: () => ({ meta: [{ title: "Calendário — Hostly" }, { name: "description", content: "Visualize check-ins, check-outs e limpezas." }] }),
  component: CalendarPage,
});

type Ev = { date: string; label: string; color: string };

function buildEvents(): Ev[] {
  const evs: Ev[] = [];
  guests.forEach((g) => {
    const prop = getProperty(g.property_id);
    evs.push({ date: g.checkin_date,  label: `Check-in ${prop?.name ?? ""}`,  color: "var(--color-accent)" });
    evs.push({ date: g.checkout_date, label: `Check-out ${prop?.name ?? ""}`, color: "var(--color-warning)" });
  });
  cleaningJobs.forEach((j) => {
    const prop = getProperty(j.property_id);
    evs.push({ date: j.scheduled_date, label: `Limpeza ${prop?.name ?? ""}`, color: "var(--color-info)" });
  });
  return evs;
}

function downloadIcs(events: Ev[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hostly//PT"];
  events.forEach((e, i) => {
    const d = e.date.replace(/-/g, "");
    lines.push("BEGIN:VEVENT", `UID:${i}-${d}@hostly.app`, `DTSTART;VALUE=DATE:${d}`,
      `DTEND;VALUE=DATE:${d}`, `SUMMARY:${e.label}`, "END:VEVENT");
  });
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "hostly.ics"; a.click();
  URL.revokeObjectURL(url);
}

function CalendarPage() {
  const [cursor, setCursor] = useState(() => {
    const d = new Date(); d.setDate(1); return d;
  });
  const events = useMemo(buildEvents, []);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = cursor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const eventsForDay = (d: number) => {
    const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return events.filter((e) => e.date === iso);
  };

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Calendário</h2>
        <button className="btn-secondary" onClick={() => downloadIcs(events)}>
          <Download size={14} /> Exportar
        </button>
      </header>

      <div className="hostly-card !p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 rounded-lg bg-secondary">
            <ChevronLeft size={16} />
          </button>
          <span className="font-semibold capitalize">{monthName}</span>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 rounded-lg bg-secondary">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-2">
          {["D","S","T","Q","Q","S","S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const evs = d ? eventsForDay(d) : [];
            const isToday = d && new Date().toDateString() === new Date(year, month, d).toDateString();
            return (
              <div
                key={i}
                className="aspect-square rounded-lg p-1 text-[11px] flex flex-col"
                style={{
                  background: d ? "var(--color-secondary)" : "transparent",
                  border: isToday ? "1px solid var(--color-accent)" : "none",
                }}
              >
                {d && (
                  <>
                    <span className="font-semibold">{d}</span>
                    <div className="flex flex-wrap gap-0.5 mt-auto">
                      {evs.slice(0, 3).map((e, k) => (
                        <span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <section className="mt-5">
        <h3 className="font-bold mb-3 text-sm">Próximos eventos</h3>
        <ul className="flex flex-col gap-2">
          {events.slice(0, 6).map((e, i) => (
            <li key={i} className="hostly-card !p-3 flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
              <span className="flex-1 text-sm">{e.label}</span>
              <span className="text-xs text-muted-foreground font-mono">{e.date}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex flex-wrap gap-3 text-[11px] mt-5 text-muted-foreground">
        <Legend color="var(--color-accent)" label="Check-in" />
        <Legend color="var(--color-warning)" label="Check-out" />
        <Legend color="var(--color-info)" label="Limpeza" />
      </div>
    </AppShell>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />{label}
    </span>
  );
}
