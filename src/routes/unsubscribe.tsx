import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({ meta: [{ title: "Unsubscribe · Hostlyb" }, { name: "robots", content: "noindex" }] }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const [state, setState] = useState<"loading" | "valid" | "invalid" | "already" | "done" | "error">("loading");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (!t) { setState("invalid"); return; }
    setToken(t);
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) setState("valid");
        else if (d.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, []);

  const confirm = async () => {
    if (!token) return;
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const d = await r.json();
      if (d.success) setState("done");
      else if (d.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch { setState("error"); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border rounded-lg p-8 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Hostlyb</h1>
        {state === "loading" && <p className="text-muted-foreground">Loading…</p>}
        {state === "invalid" && <p className="text-muted-foreground">Invalid or expired link.</p>}
        {state === "already" && <p className="text-muted-foreground">You're already unsubscribed.</p>}
        {state === "error" && <p className="text-destructive">Something went wrong. Please try again.</p>}
        {state === "valid" && (
          <>
            <p className="text-muted-foreground">Confirm to stop receiving emails from Hostlyb.</p>
            <button onClick={confirm} className="w-full bg-primary text-primary-foreground rounded-md py-2.5 font-medium hover:opacity-90">
              Confirm Unsubscribe
            </button>
          </>
        )}
        {state === "done" && <p className="text-foreground">You've been unsubscribed. ✓</p>}
      </div>
    </div>
  );
}
