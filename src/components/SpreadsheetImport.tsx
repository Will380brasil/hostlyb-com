import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Upload, FileSpreadsheet, X, Download, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { parseSpreadsheet, applyMapping, TARGET_FIELDS, type ParsedSpreadsheet, type ImportType } from "@/lib/spreadsheet-parser";
import { downloadGuestTemplate, downloadPropertyTemplate, downloadFinancialTemplate } from "@/lib/spreadsheet-templates";

const TYPE_LABEL: Record<string, string> = {
  guests: "👥 Hóspedes e reservas",
  properties: "🏠 Imóveis",
  financial: "💰 Financeiro",
  unknown: "❓ Tipo não identificado",
};

export function SpreadsheetImport({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"upload" | "templates">("upload");
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState<ParsedSpreadsheet | null>(null);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: string[] } | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => { setPreview(null); setResult(null); };

  async function handleFile(file: File) {
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (![".xlsx", ".xls", ".csv", ".ods"].includes(ext)) {
      toast.error("Formato não suportado. Use .xlsx, .xls ou .csv");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 10MB).");
      return;
    }
    setParsing(true);
    try {
      const r = await parseSpreadsheet(file);
      setPreview(r);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setParsing(false);
    }
  }

  async function confirmImport() {
    if (!preview || !user) return;
    setImporting(true);
    const r = { created: 0, skipped: 0, errors: [] as string[] };

    try {
      // Cache de imóveis (resolução por nome)
      let propMap: Record<string, string> = {};
      if (preview.type === "guests" || preview.type === "financial") {
        const { data: props } = await supabase.from("properties").select("id, name").eq("user_id", user.id);
        (props ?? []).forEach((p: any) => { propMap[p.name.toLowerCase().trim()] = p.id; });
      }

      for (const row of preview.rows) {
        try {
          if (preview.type === "guests") {
            const propName = String(row.property_name || "").toLowerCase().trim();
            const property_id = propMap[propName] || Object.entries(propMap).find(([n]) => n.includes(propName) || propName.includes(n))?.[1];
            if (!property_id) {
              r.errors.push(`Hóspede "${row.name}": imóvel "${row.property_name || "—"}" não encontrado`);
              r.skipped++; continue;
            }
            const ci = new Date(String(row.checkin_date));
            const co = new Date(String(row.checkout_date));
            const nights = Math.max(1, Math.round((+co - +ci) / 86400000));
            const { error } = await supabase.from("guests").insert({
              user_id: user.id, property_id,
              name: String(row.name),
              email: row.email ? String(row.email) : null,
              phone: row.phone ? String(row.phone) : null,
              checkin_date: String(row.checkin_date),
              checkout_date: String(row.checkout_date),
              total_value: Number(row.total_value ?? 0),
              platform: String(row.platform || "direto"),
              status: String(row.status || "confirmado"),
              notes: row.notes ? String(row.notes) : null,
              nights,
            });
            if (error) { r.errors.push(`"${row.name}": ${error.message}`); r.skipped++; } else r.created++;
          } else if (preview.type === "properties") {
            const { error } = await supabase.from("properties").insert({
              user_id: user.id,
              name: String(row.name),
              address: String(row.address || ""),
              city: row.city ? String(row.city) : null,
              state: row.state ? String(row.state) : null,
              zip_code: row.zip_code ? String(row.zip_code) : null,
              bedrooms: row.bedrooms ? Number(row.bedrooms) : 1,
              bathrooms: row.bathrooms ? Number(row.bathrooms) : 1,
              max_guests: row.max_guests ? Number(row.max_guests) : 2,
              wifi_password: row.wifi_password ? String(row.wifi_password) : null,
              notes: row.notes ? String(row.notes) : null,
            });
            if (error) { r.errors.push(`"${row.name}": ${error.message}`); r.skipped++; } else r.created++;
          } else if (preview.type === "financial") {
            let property_id: string | null = null;
            if (row.property_name) {
              const pn = String(row.property_name).toLowerCase().trim();
              property_id = propMap[pn] || Object.entries(propMap).find(([n]) => n.includes(pn))?.[1] || null;
            }
            const { error } = await supabase.from("transactions").insert({
              user_id: user.id,
              type: String(row.type),
              amount: Number(row.amount),
              date: String(row.date),
              category: String(row.category || "outros"),
              status: String(row.status || "pago"),
              property_id,
              description: row.description ? String(row.description) : String(row.category || "Importado"),
              payment_method: row.payment_method ? String(row.payment_method) : null,
            });
            if (error) { r.errors.push(`Linha: ${error.message}`); r.skipped++; } else r.created++;
          }
        } catch (e: any) {
          r.errors.push(e?.message || "erro desconhecido");
          r.skipped++;
        }
      }

      setResult(r);
      if (r.created > 0) {
        toast.success(`${r.created} registro(s) importado(s)!`);
        qc.invalidateQueries();
      }
      if (r.skipped > 0) toast.error(`${r.skipped} linha(s) ignorada(s).`);
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-card border border-card-border w-full max-w-[520px] mx-auto rounded-t-2xl sm:rounded-2xl p-5 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center gap-2"><FileSpreadsheet size={20} /> Importar planilha</h3>
          <button onClick={onClose} aria-label="Fechar"><X size={20} /></button>
        </div>

        {!preview && !result && (
          <>
            <div className="flex gap-1 p-1 rounded-lg bg-secondary mb-4">
              {(["upload", "templates"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`flex-1 py-2 rounded-md text-sm font-medium transition ${tab === k ? "bg-card shadow-sm" : "text-muted-foreground"}`}
                >
                  {k === "upload" ? "📤 Importar" : "📋 Modelos"}
                </button>
              ))}
            </div>

            {tab === "upload" && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                  onClick={() => inputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition ${dragOver ? "border-primary bg-primary/5" : "border-card-border bg-background"}`}
                >
                  <Upload size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="font-semibold mb-1">Arraste sua planilha aqui</p>
                  <p className="text-sm text-muted-foreground mb-2">ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground">.xlsx · .xls · .csv — máx 10MB</p>
                  <input
                    ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.ods" hidden
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />
                </div>
                {parsing && <p className="text-center text-sm text-muted-foreground mt-3">Lendo planilha...</p>}
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Detecta automaticamente hóspedes, imóveis ou financeiro. Aceita PT, EN e FR.
                </p>
              </>
            )}

            {tab === "templates" && (
              <div className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground">
                  Baixe o modelo, preencha com seus dados e importe aqui.
                </p>
                {[
                  { label: "👥 Hóspedes e reservas", desc: "Nome, datas, valor, plataforma", fn: downloadGuestTemplate },
                  { label: "🏠 Imóveis", desc: "Nome, endereço, quartos, WiFi", fn: downloadPropertyTemplate },
                  { label: "💰 Financeiro", desc: "Receitas e despesas com categoria", fn: downloadFinancialTemplate },
                ].map((t) => (
                  <button
                    key={t.label}
                    onClick={t.fn}
                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition text-left"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-sm">{t.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{t.desc}</p>
                    </div>
                    <Download size={18} className="text-muted-foreground shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {preview && !result && (
          <>
            <div className="hostly-card mb-3">
              <p className="font-semibold">{TYPE_LABEL[preview.type]}</p>
              <p className="text-xs text-muted-foreground">
                {preview.totalRows} linha(s) · {preview.validRows} válida(s)
                {preview.errors.length > 0 && ` · ${preview.errors.length} com problema`}
              </p>
            </div>

            {preview.type !== "unknown" && (
              <div className="hostly-card mb-3">
                <p className="text-xs font-semibold mb-2">MAPEAMENTO DE COLUNAS</p>
                <p className="text-[11px] text-muted-foreground mb-2">Confira se cada coluna da planilha está associada ao campo correto.</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {preview.headers.map((h) => (
                    <div key={h} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 truncate font-medium" title={h}>{h || "(sem nome)"}</span>
                      <span className="text-muted-foreground">→</span>
                      <select
                        value={preview.mapping[h] ?? "__ignore__"}
                        onChange={(e) => {
                          const next = { ...preview.mapping, [h]: e.target.value };
                          const re = applyMapping(preview.headers, preview.rawRows, next, preview.type);
                          setPreview({ ...preview, ...re, mapping: next });
                        }}
                        className="flex-1 px-2 py-1 rounded border border-card-border bg-background text-xs"
                      >
                        <option value="__ignore__">— Ignorar —</option>
                        {TARGET_FIELDS[preview.type as ImportType].map((f) => (
                          <option key={f.v} value={f.v}>{f.l}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {preview.errors.length > 0 && (
              <div className="rounded-xl p-3 mb-3 text-xs" style={{ background: "var(--color-warning-soft, #fef3c7)" }}>
                <p className="font-semibold flex items-center gap-1 mb-1"><AlertCircle size={13} /> Linhas ignoradas:</p>
                <ul className="space-y-0.5 max-h-32 overflow-y-auto">
                  {preview.errors.slice(0, 10).map((e, i) => <li key={i}>• {e}</li>)}
                  {preview.errors.length > 10 && <li className="text-muted-foreground">…e mais {preview.errors.length - 10}</li>}
                </ul>
              </div>
            )}

            {preview.validRows > 0 && (
              <div className="hostly-card mb-3">
                <p className="text-xs text-muted-foreground font-semibold mb-2">PRÉ-VISUALIZAÇÃO (5 primeiras)</p>
                {preview.rows.slice(0, 5).map((row, i) => (
                  <div key={i} className="text-xs py-1.5 border-b border-card-border last:border-0">
                    {Object.entries(row).slice(0, 5).map(([k, v]) => (
                      <span key={k} className="mr-3"><span className="text-muted-foreground">{k}:</span> {String(v)}</span>
                    ))}
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={reset} className="btn-secondary flex-1 justify-center"><ArrowLeft size={14} /> Voltar</button>
              <button
                onClick={confirmImport}
                disabled={importing || preview.validRows === 0 || preview.type === "unknown"}
                className="btn-primary flex-[2] justify-center disabled:opacity-50"
              >
                {importing ? "Importando..." : `Importar ${preview.validRows} registro(s)`}
              </button>
            </div>
          </>
        )}

        {result && (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: "var(--color-success)" }} />
            <p className="text-xl font-bold mb-1">{result.created} importado(s)!</p>
            {result.skipped > 0 && (
              <p className="text-sm text-muted-foreground mb-3">{result.skipped} linha(s) ignorada(s)</p>
            )}
            <button onClick={() => { reset(); onClose(); }} className="btn-primary mx-auto mt-2">Concluir</button>
          </div>
        )}
      </div>
    </div>
  );
}
