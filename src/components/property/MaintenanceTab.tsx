import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useT, useLocale } from "@/lib/i18n";
import { formatMoney } from "@/lib/format";
import { Plus, Wrench, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

export function MaintenanceTab({ propertyId }: { propertyId: string }) {
  const t = useT();
  const { user } = useAuth();
  const { currency, lang } = useLocale();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "in_progress" | "resolved">("all");
  const [form, setForm] = useState({ description: "", responsible: "", cost: "", status: "open" as const, identified_date: new Date().toISOString().slice(0, 10) });

  const { data: issues = [] } = useQuery({
    queryKey: ["maint", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase.from("maintenance_issues")
        .select("*").eq("property_id", propertyId).order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("auth");
      const { error } = await supabase.from("maintenance_issues").insert({
        user_id: user.id, property_id: propertyId,
        description: form.description, responsible: form.responsible || null,
        cost: Number(form.cost) || 0, status: form.status,
        identified_date: form.identified_date, reported_by: "host", urgency: "normal",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("✓"); setShowForm(false);
      setForm({ description: "", responsible: "", cost: "", status: "open", identified_date: new Date().toISOString().slice(0, 10) });
      qc.invalidateQueries({ queryKey: ["maint", propertyId] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, cost }: { id: string; status: string; cost?: number }) => {
      const upd: any = { status };
      if (typeof cost === "number") upd.cost = cost;
      const { error } = await supabase.from("maintenance_issues").update(upd).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maint", propertyId] }),
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("maintenance_issues").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maint", propertyId] }),
  });

  const filtered = issues.filter((i: any) =>
    (filter === "all" || i.status === filter) &&
    (q === "" || (i.description ?? "").toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input className="w-full rounded-lg border pl-7 pr-2 py-1.5 text-sm" placeholder={t("maint.search")}
            value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="rounded-lg border text-sm py-1.5 px-2" value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="all">{t("maint.filter.all")}</option>
          <option value="open">{t("maint.status.open")}</option>
          <option value="in_progress">{t("maint.status.in_progress")}</option>
          <option value="resolved">{t("maint.status.resolved")}</option>
        </select>
        <button className="btn-primary" onClick={() => setShowForm((s) => !s)}>
          <Plus size={14} /> {t("maint.add")}
        </button>
      </div>

      {showForm && (
        <form className="hostly-card mb-3 grid gap-2" onSubmit={(e) => { e.preventDefault(); create.mutate(); }}>
          <textarea required className="rounded-lg border p-2 text-sm" placeholder={t("maint.description")}
            value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-lg border p-2 text-sm" placeholder={t("maint.responsible")}
              value={form.responsible} onChange={(e) => setForm({ ...form, responsible: e.target.value })} />
            <input type="number" step="0.01" className="rounded-lg border p-2 text-sm" placeholder={t("maint.cost")}
              value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            <input type="date" className="rounded-lg border p-2 text-sm"
              value={form.identified_date} onChange={(e) => setForm({ ...form, identified_date: e.target.value })} />
            <select className="rounded-lg border p-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
              <option value="open">{t("maint.status.open")}</option>
              <option value="in_progress">{t("maint.status.in_progress")}</option>
              <option value="resolved">{t("maint.status.resolved")}</option>
            </select>
          </div>
          <button type="submit" className="btn-primary justify-center" disabled={create.isPending}>{t("maint.add")}</button>
        </form>
      )}

      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-6"><Wrench size={20} className="mx-auto mb-2 opacity-50" />{t("maint.empty")}</div>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((i: any) => (
            <li key={i.id} className="hostly-card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{i.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.identified_date} · {i.responsible ?? "—"} · {formatMoney(Number(i.cost ?? 0), currency, lang)}
                  </p>
                </div>
                <select className="text-xs rounded border py-1 px-1.5" value={i.status}
                  onChange={(e) => updateStatus.mutate({ id: i.id, status: e.target.value })}>
                  <option value="open">{t("maint.status.open")}</option>
                  <option value="in_progress">{t("maint.status.in_progress")}</option>
                  <option value="resolved">{t("maint.status.resolved")}</option>
                </select>
                <button className="text-muted-foreground hover:text-red-500" onClick={() => { if (confirm("?")) del.mutate(i.id); }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
