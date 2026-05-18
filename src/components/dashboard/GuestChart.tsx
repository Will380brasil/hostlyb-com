import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { supabase } from "@/integrations/supabase/client";

type Range = "day" | "week" | "month" | "year";

function rangeStart(r: Range) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (r === "day") d.setDate(d.getDate() - 13);
  else if (r === "week") d.setDate(d.getDate() - 7 * 11);
  else if (r === "month") d.setMonth(d.getMonth() - 11);
  else d.setFullYear(d.getFullYear() - 4);
  return d;
}

function bucketKey(date: Date, r: Range): string {
  if (r === "day") return date.toISOString().slice(0, 10);
  if (r === "week") {
    const monday = new Date(date);
    const dow = (monday.getDay() + 6) % 7;
    monday.setDate(monday.getDate() - dow);
    return monday.toISOString().slice(0, 10);
  }
  if (r === "month") return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  return String(date.getFullYear());
}

function bucketLabel(key: string, r: Range): string {
  if (r === "day" || r === "week") {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  }
  if (r === "month") {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
  }
  return key;
}

export function GuestChart() {
  const [range, setRange] = useState<Range>("month");
  const start = useMemo(() => rangeStart(range), [range]);

  const { data: guests = [] } = useQuery({
    queryKey: ["chart-guests", start.toISOString()],
    queryFn: async () => {
      const { data } = await supabase.from("guests").select("checkin_date")
        .gte("checkin_date", start.toISOString().slice(0, 10))
        .order("checkin_date");
      return data ?? [];
    },
  });

  const data = useMemo(() => {
    const map = new Map<string, number>();
    const end = new Date();
    const cur = new Date(start);
    while (cur <= end) {
      map.set(bucketKey(cur, range), 0);
      if (range === "day") cur.setDate(cur.getDate() + 1);
      else if (range === "week") cur.setDate(cur.getDate() + 7);
      else if (range === "month") cur.setMonth(cur.getMonth() + 1);
      else cur.setFullYear(cur.getFullYear() + 1);
    }
    for (const g of guests as any[]) {
      const [y, m, d] = g.checkin_date.split("-").map(Number);
      const key = bucketKey(new Date(y, m - 1, d), range);
      if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([k, v]) => ({ label: bucketLabel(k, range), value: v }));
  }, [guests, range, start]);

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold">Hóspedes por período</h3>
        <div className="flex p-0.5 rounded-lg bg-card border border-card-border text-[11px]">
          {(["day", "week", "month", "year"] as Range[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className="px-2 py-1 rounded-md font-semibold capitalize"
              style={{
                background: range === r ? "var(--color-accent)" : "transparent",
                color: range === r ? "var(--color-accent-foreground, white)" : "var(--color-muted-foreground)",
              }}>
              {r === "day" ? "Dia" : r === "week" ? "Semana" : r === "month" ? "Mês" : "Ano"}
            </button>
          ))}
        </div>
      </div>
      <div className="hostly-card !p-2" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--color-card-border)" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} stroke="var(--color-muted-foreground)" allowDecimals={false} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-card-border)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "var(--color-muted-foreground)" }} />
            <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
