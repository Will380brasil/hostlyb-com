import { useEffect, useMemo, useState } from "react";
import { useLocale, useT } from "@/lib/i18n";
import { CheckCircle2, Circle, Download, ExternalLink, ShieldCheck, FileText, BookOpen, Award, Umbrella } from "lucide-react";

type Item = {
  id: string;
  icon: any;
  titleKey: string;
  bodyKey: string;
  linkLabelKey?: string;
  linkHref?: string;
};

const PT_ITEMS: Item[] = [
  { id: "aima", icon: ShieldCheck, titleKey: "legal.pt.aima.t", bodyKey: "legal.pt.aima.b", linkLabelKey: "legal.pt.aima.link", linkHref: "https://aima.gov.pt/pt" },
  { id: "complaints", icon: BookOpen, titleKey: "legal.pt.complaints.t", bodyKey: "legal.pt.complaints.b", linkLabelKey: "legal.pt.complaints.link", linkHref: "https://www.livroreclamacoes.pt/" },
  { id: "license", icon: Award, titleKey: "legal.pt.license.t", bodyKey: "legal.pt.license.b" },
  { id: "insurance", icon: Umbrella, titleKey: "legal.pt.insurance.t", bodyKey: "legal.pt.insurance.b" },
];

export function LegalComplianceTab({ propertyId, propertyName }: { propertyId: string; propertyName: string }) {
  const t = useT();
  const { lang } = useLocale();
  const storageKey = `hostly_legal_${propertyId}`;
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setChecked(JSON.parse(raw));
    } catch {}
  }, [storageKey]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  const items = PT_ITEMS;
  const done = useMemo(() => items.filter((i) => checked[i.id]).length, [items, checked]);
  const pct = Math.round((done / items.length) * 100);
  const isPt = lang === "pt";

  function downloadChecklist() {
    const lines: string[] = [];
    lines.push(`${t("legal.pt.title")} — ${propertyName}`);
    lines.push("");
    items.forEach((i, idx) => {
      const mark = checked[i.id] ? "[x]" : "[ ]";
      lines.push(`${mark} ${idx + 1}. ${t(i.titleKey)}`);
      lines.push(`    ${t(i.bodyKey)}`);
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compliance-${propertyName.replace(/\s+/g, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="hostly-card">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="section-title text-lg flex items-center gap-2">
              <ShieldCheck size={18} style={{ color: "var(--color-primary)" }} />
              {isPt ? t("legal.pt.title") : t("legal.generic.title")}
            </h2>
            <p className="text-sm text-secondary mt-1">
              {isPt ? t("legal.pt.subtitle") : t("legal.generic.subtitle")}
            </p>
          </div>
          <button onClick={downloadChecklist} className="btn-secondary text-xs">
            <Download size={14} /> {t("legal.export")}
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ width: `${pct}%`, background: "#FF6B6B" }}
            />
          </div>
          <span className="value-strong text-sm tabular-nums">{done}/{items.length}</span>
        </div>
      </div>

      {!isPt && (
        <div className="hostly-card text-sm text-secondary">
          {t("legal.generic.body")}
        </div>
      )}

      <ul className="flex flex-col gap-3 animate-fade-slide-stagger">
        {items.map((it) => {
          const Icon = it.icon;
          const isOn = !!checked[it.id];
          return (
            <li key={it.id} className="hostly-card">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  aria-pressed={isOn}
                  onClick={() => toggle(it.id)}
                  className="mt-0.5 shrink-0"
                  style={{ color: isOn ? "#22c55e" : "var(--color-muted-foreground)" }}
                >
                  {isOn ? <CheckCircle2 size={22} /> : <Circle size={22} />}
                </button>
                <div className="flex-1 min-w-0">
                  <h3 className="section-title flex items-center gap-2">
                    <Icon size={16} style={{ color: "var(--color-primary)" }} />
                    {t(it.titleKey)}
                  </h3>
                  <p className="text-sm text-secondary mt-1 whitespace-pre-line">{t(it.bodyKey)}</p>
                  {it.linkHref && (
                    <a
                      href={it.linkHref}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold mt-2"
                      style={{ color: "#FF6B6B" }}
                    >
                      {t(it.linkLabelKey!)} <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-secondary flex items-center gap-1.5">
        <FileText size={12} /> {t("legal.disclaimer")}
      </p>
    </div>
  );
}
