import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, ChevronRight, Download, Share2, X, FileSpreadsheet, Calendar as CalIcon, Clock, MapPin } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/calendario")({
  head: () => ({ meta: [{ title: "Calendário — Hostlyb" }, { name: "description", content: "Veja check-ins, check-outs e limpezas." }] }),
  component: CalendarPage,
});

type Ev = {
  id: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  type: "checkin" | "checkout" | "cleaning";
  label: string;
  property: string;
  color: string;
  notes?: string;
};

const TYPE_LABEL: Record<string, string> = { checkin: "Check-in", checkout: "Check-out", cleaning: "Limpeza" };

function downloadIcs(events: Ev[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Hostlyb//PT", "CALSCALE:GREGORIAN"];
  events.forEach((e) => {
    const d = e.date.replace(/-/g, "");
    const t = e.time.replace(":", "") + "00";
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@hostlyb.com`,
      `DTSTART:${d}T${t}`,
      `DTEND:${d}T${t}`,
      `SUMMARY:${e.label}`,
      `LOCATION:${e.property}`,
      "END:VEVENT",
    );
  });
  lines.push("END:VCALENDAR");
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "hostlyb.ics"; a.click();
  URL.revokeObjectURL(a.href);
}

function downloadXlsx(events: Ev[]) {
  const rows = [
    ["Hostlyb — Agenda exportada"],
    [`Gerado em ${new Date().toLocaleString()}`],
    [],
    ["Data", "Horário", "Tipo", "Imóvel", "Descrição"],
    ...events.map((e) => [e.date, e.time, TYPE_LABEL[e.type] ?? e.type, e.property, e.label]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 12 }, { wch: 9 }, { wch: 12 }, { wch: 28 }, { wch: 40 }];
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }, { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Agenda Hostlyb");
  XLSX.writeFile(wb, `hostlyb-agenda-${new Date().toISOString().slice(0, 10)}.xlsx`);
}

async function shareEvent(e: Ev) {
  const text = `${TYPE_LABEL[e.type]} — ${e.property}\n📅 ${e.date} às ${e.time}\n${e.label}`;
  if (navigator.share) {
    try { await navigator.share({ title: "Hostlyb", text }); return; } catch { /* cancelled */ }
  }
  try { await navigator.clipboard.writeText(text); toast.success("Copiado"); } catch { toast.error("Falha ao compartilhar"); }
}

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];

function CalendarPage() {
  const today = new Date();
  const [view, setView] = useState<"mes" | "dia">("mes");
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDay, setSelectedDay] = useState<string>(today.toISOString().slice(0, 10));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [shareEv, setShareEv] = useState<Ev | null>(null);

  const { data: guests = [] } = useQuery({
    queryKey: ["guests-cal"],
    queryFn: async () => (await supabase.from("guests").select("id, name, checkin_date, checkout_date, properties(name)")).data ?? [],
  });
  const { data: jobs = [] } = useQuery({
    queryKey: ["jobs-cal"],
    queryFn: async () => (await supabase.from("cleaning_jobs").select("id, scheduled_date, scheduled_time, notes, properties(name)")).data ?? [],
  });

  const events: Ev[] = useMemo(() => {
    const evs: Ev[] = [];
    guests.forEach((g: any) => {
      const prop = g.properties?.name ?? "—";
      evs.push({ id: `gi-${g.id}`, date: g.checkin_date, time: "15:00", type: "checkin", label: `Check-in ${g.name}`, property: prop, color: "var(--color-success)" });
      evs.push({ id: `go-${g.id}`, date: g.checkout_date, time: "11:00", type: "checkout", label: `Check-out ${g.name}`, property: prop, color: "var(--color-warning)" });
    });
    jobs.forEach((j: any) => {
      const prop = j.properties?.name ?? "—";
      evs.push({ id: `cj-${j.id}`, date: j.scheduled_date, time: (j.scheduled_time ?? "10:00").slice(0, 5), type: "cleaning", label: `Limpeza ${prop}`, property: prop, color: "var(--color-info)", notes: j.notes ?? undefined });
    });
    return evs.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  }, [guests, jobs]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const isoFor = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const eventsForIso = (iso: string) => events.filter((e) => e.date === iso);
  const dayEvents = eventsForIso(selectedDay);
  const upcoming = events.filter((e) => e.date >= today.toISOString().slice(0, 10)).slice(0, 10);

  return (
    <AppShell>
      <header className="flex items-center justify-between mb-4 gap-2">
        <h2 className="text-2xl font-bold">Calendário</h2>
        <div className="flex items-center gap-2">
          <button className="btn-secondary !py-1.5 !px-2.5" title="Exportar Excel" onClick={() => downloadXlsx(events)}><FileSpreadsheet size={14} /></button>
          <button className="btn-secondary !py-1.5 !px-2.5" title="Exportar .ics" onClick={() => downloadIcs(events)}><Download size={14} /></button>
        </div>
      </header>

      <div className="flex items-center gap-2 mb-3 text-xs">
        <button onClick={() => setView("mes")} className={`px-3 py-1.5 rounded-lg ${view === "mes" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Mês</button>
        <button onClick={() => setView("dia")} className={`px-3 py-1.5 rounded-lg ${view === "dia" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>Dia</button>
        <button onClick={() => { const t = new Date(); setCursor(new Date(t.getFullYear(), t.getMonth(), 1)); setSelectedDay(t.toISOString().slice(0, 10)); }}
          className="ml-auto px-3 py-1.5 rounded-lg bg-secondary">Hoje</button>
      </div>

      {view === "mes" && (
        <div className="hostly-card !p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setCursor(new Date(year, month - 1, 1))} className="p-2 rounded-lg bg-secondary"><ChevronLeft size={16} /></button>
            <button onClick={() => setPickerOpen(true)} className="font-semibold capitalize px-3 py-1 rounded-lg hover:bg-secondary">
              {MONTHS[month]} {year}
            </button>
            <button onClick={() => setCursor(new Date(year, month + 1, 1))} className="p-2 rounded-lg bg-secondary"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-2">
            {WEEKDAYS.map((d, i) => <div key={i}>{d[0]}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (!d) return <div key={i} className="aspect-square" />;
              const iso = isoFor(d);
              const evs = eventsForIso(iso);
              const isToday = today.toDateString() === new Date(year, month, d).toDateString();
              const isSel = iso === selectedDay;
              return (
                <button key={i} onClick={() => { setSelectedDay(iso); setView("dia"); }}
                  className="aspect-square rounded-lg p-1 text-[11px] flex flex-col items-stretch text-left"
                  style={{ background: isSel ? "var(--color-accent-soft)" : "var(--color-secondary)", border: isToday ? "1px solid var(--color-accent)" : "1px solid transparent" }}>
                  <span className="font-semibold">{d}</span>
                  <div className="flex flex-wrap gap-0.5 mt-auto">
                    {evs.slice(0, 3).map((e, k) => (<span key={k} className="w-1.5 h-1.5 rounded-full" style={{ background: e.color }} />))}
                    {evs.length > 3 && <span className="text-[9px] text-muted-foreground">+{evs.length - 3}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === "dia" && (
        <div className="hostly-card !p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() - 1); setSelectedDay(d.toISOString().slice(0, 10)); }} className="p-2 rounded-lg bg-secondary"><ChevronLeft size={16} /></button>
            <button onClick={() => setPickerOpen(true)} className="font-semibold px-3 py-1 rounded-lg hover:bg-secondary capitalize">
              {new Date(selectedDay + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </button>
            <button onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() + 1); setSelectedDay(d.toISOString().slice(0, 10)); }} className="p-2 rounded-lg bg-secondary"><ChevronRight size={16} /></button>
          </div>
          {dayEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">Nada agendado.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {dayEvents.map((e) => (
                <li key={e.id}>
                  <button onClick={() => setShareEv(e)} className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary hover:opacity-80 text-left">
                    <span className="w-12 text-xs font-mono text-muted-foreground"><Clock size={11} className="inline mr-1" />{e.time}</span>
                    <span className="w-1 h-10 rounded" style={{ background: e.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{e.label}</p>
                      <p className="text-xs text-muted-foreground truncate"><MapPin size={10} className="inline mr-1" />{e.property}</p>
                    </div>
                    <Share2 size={14} className="text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className="mt-5">
        <h3 className="font-bold mb-3 text-sm">Próximos eventos</h3>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum evento.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((e) => (
              <li key={e.id}>
                <button onClick={() => setShareEv(e)} className="w-full hostly-card !p-3 flex items-center gap-3 text-left">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{e.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{e.property}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{e.date} {e.time}</span>
                  <Share2 size={13} className="text-muted-foreground" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pickerOpen && (
        <MonthYearPicker
          year={year} month={month}
          onClose={() => setPickerOpen(false)}
          onSelect={(y, m) => { setCursor(new Date(y, m, 1)); setPickerOpen(false); }}
        />
      )}

      {shareEv && <ShareSheet ev={shareEv} onClose={() => setShareEv(null)} />}
    </AppShell>
  );
}

function MonthYearPicker({ year, month, onClose, onSelect }: { year: number; month: number; onClose: () => void; onSelect: (y: number, m: number) => void }) {
  const [y, setY] = useState(year);
  const years = Array.from({ length: 11 }, (_, i) => year - 5 + i);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">Selecionar mês</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex items-center justify-center gap-2 mb-4">
          <button onClick={() => setY(y - 1)} className="p-2 rounded-lg bg-secondary"><ChevronLeft size={14} /></button>
          <select value={y} onChange={(e) => setY(Number(e.target.value))} className="px-3 py-2 rounded-lg bg-background border border-card-border">
            {years.map((yr) => <option key={yr} value={yr}>{yr}</option>)}
          </select>
          <button onClick={() => setY(y + 1)} className="p-2 rounded-lg bg-secondary"><ChevronRight size={14} /></button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {MONTHS.map((m, i) => (
            <button key={i} onClick={() => onSelect(y, i)}
              className={`py-3 rounded-lg text-sm ${i === month && y === year ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
              {m.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShareSheet({ ev, onClose }: { ev: Ev; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end" onClick={onClose}>
      <div className="bg-card border-t border-card-border w-full max-w-[480px] mx-auto rounded-t-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold">{TYPE_LABEL[ev.type]}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-2 text-sm mb-4">
          <p className="font-medium">{ev.label}</p>
          <p className="text-muted-foreground"><MapPin size={12} className="inline mr-1" />{ev.property}</p>
          <p className="text-muted-foreground"><CalIcon size={12} className="inline mr-1" />{ev.date} às {ev.time}</p>
          {ev.notes && <p className="text-muted-foreground">📝 {ev.notes}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={() => shareEvent(ev)} className="btn-primary flex-1 justify-center"><Share2 size={14} /> Compartilhar</button>
          <button onClick={() => downloadIcs([ev])} className="btn-secondary !px-3"><Download size={14} /></button>
        </div>
      </div>
    </div>
  );
}
