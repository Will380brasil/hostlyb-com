import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";

const ADMIN_EMAIL = "brasgold1@gmail.com";

const PUBLIC_PREFIXES = ["/", "/login", "/signup", "/demo", "/guia", "/checkin", "/faxineira", "/convite", "/unsubscribe", "/auth"];

export function SupportFAB() {
  const { user } = useAuth();
  const loc = useLocation();
  const t = useT();
  const [open, setOpen] = useState(false);

  if (!user) return null;
  if (loc.pathname.startsWith("/admin")) return null;
  if (PUBLIC_PREFIXES.some((p) => p !== "/" && loc.pathname.startsWith(p))) return null;
  if (loc.pathname === "/") return null;

  const subject = encodeURIComponent(`Hostlyb Support — ${user.email ?? ""}`);
  const body = encodeURIComponent(`\n\n---\nPage: ${typeof window !== "undefined" ? window.location.href : ""}\nUser: ${user.email ?? ""}`);
  const href = `mailto:${ADMIN_EMAIL}?subject=${subject}&body=${body}`;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title={t("support.tooltip") || "Need help? Talk to us"}
        aria-label="Support"
        className="fixed bottom-5 right-5 z-50 h-12 w-12 rounded-full bg-[#FF6B6B] text-white shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
      >
        <MessageCircle className="h-5 w-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold">{t("support.modalTitle") || "Send support email"}</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              {t("support.modalBody") || "We'll open your email client with the support address pre-filled."}
            </p>
            <a href={href} onClick={() => setOpen(false)} className="block text-center bg-[#FF6B6B] text-white font-semibold py-3 rounded-lg">
              💬 {t("support.send") || "Open mail to"} {ADMIN_EMAIL}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
