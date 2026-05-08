import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

export const Route = createFileRoute("/calendario")({
  head: () => ({ meta: [{ title: "Calendário — Hostly" }, { name: "description", content: "Veja check-ins, check-outs e limpezas." }] }),
  component: CalendarPage,
});

type Ev = { date: string; label: string; color: string };

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
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });

  const { data: guests = [] } = useQuery({
    queryKey: ["guests-cal"],
    queryFn: async () => (await supabase.from("guests").select("checkin_date, checkout_date, properties(name)")).data ?? [],
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs-cal"],
    queryFn: async () => (await supabase.from("cleaning_jobs").select("scheduled_date, properties(name)")).data ?? [],
  });

  const events: Ev[] = useMemo(() => {
    const evs: Ev[] = [];
    guests.forEach((g: any) => {
      evs.push({ date: g.checkin_date, label: `Check-in ${g.properties?.name ?? ""}`, color: "var(--color-accent)" });
      evs.push({ date: g.checkout_date, label: `Check-out ${g.properties?.name ?? ""}`, color: "var(--color-warning)" });
    });
    jobs.forEach((j: any) => evs.push({ date: j.scheduled_date, label: `Limpeza ${j.properties?.name ?? ""}`, color: "var(--color-info)" }));
    return evs.sort((a, b) => a.date.localeCompare(b.date));
  }, [guests, jobs]);

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
        <button className="btn-secondary" onClick={() => downloadIcs(events)}><Download size={14} /> Exportar</button>
      </header>

      <div className="hostly-card !p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 rounded-lg bg-secondary"><ChevronLeft size={16} /></button>
          <span className="font-semibold capitalize">{monthName}</span>
          <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 rounded-lg bg-secondary"><ChevronRight size={16} /></button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-2">
          {["D","S","T","Q","Q","S","S"].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            const evs = d ? eventsForDay(d) : [];
            const isToday = d && new Date().toDateString() === new Date(year, month, d).toDateString();
            return (
              <div key={i} className="aspect-square rounded-lg p-1 text-[11px] flex flex-col"
                style={{ background: d ? "var(--color-secondary)" : "transparent", border: isToday ? "1px solid var(--color-accent)" : "none" }}>
                {d && (<>
                  <span className="font-semibold">{d}</span>
                  <div className="flex flex-wrap gap-0.5 mt-auto">
                    {evs.slice(0, 3).map((e, k) => (<span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />))}
                  </div>
                </>)}
              </div>
            );
          })}
        </div>
      </div>

      <section className="mt-5">
        <h3 className="font-bold mb-3 text-sm">Próximos eventos</h3>
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {events.slice(0, 8).map((e, i) => (
              <li key={i} className="hostly-card !p-3 flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                <span className="flex-1 text-sm">{e.label}</span>
                <span className="text-xs text-muted-foreground font-mono">{e.date}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
