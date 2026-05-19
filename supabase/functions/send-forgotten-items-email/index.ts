import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const secret = Deno.env.get("CRON_SECRET");
    const authHeader = req.headers.get("Authorization");
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { cleaning_job_id } = await req.json();
    if (!cleaning_job_id) throw new Error("cleaning_job_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: job, error } = await supabase.from("cleaning_jobs")
      .select("*, properties(name, address, city), cleaners(name)")
      .eq("id", cleaning_job_id).maybeSingle();
    if (error || !job) throw new Error("Job not found");

    const { data: items = [] } = await supabase.from("forgotten_items")
      .select("*").eq("cleaning_job_id", cleaning_job_id);

    const adminEmail = Deno.env.get("HOSTLY_ADMIN_EMAIL");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const propName = (job as any).properties?.name ?? "—";
    const cleanerName = (job as any).cleaners?.name ?? "—";

    // Sign URLs (private bucket) — válido por 7 dias
    const itemsWithUrl = await Promise.all((items ?? []).map(async (it: any) => {
      let signed: string | null = null;
      if (it.photo_url) {
        // strip legacy public URL prefix if present
        const m = String(it.photo_url).match(/\/object\/(?:public|sign|authenticated)\/forgotten-items\/([^?]+)/);
        const path = m ? decodeURIComponent(m[1]) : it.photo_url;
        const { data: s } = await supabase.storage.from("forgotten-items").createSignedUrl(path, 60 * 60 * 24 * 7);
        signed = s?.signedUrl ?? null;
      }
      return { ...it, signed_url: signed };
    }));

    const escHtml = (s: unknown) => String(s ?? "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    const itemsHtml = itemsWithUrl.map((it: any) =>
      `<li><strong>${escHtml(it.description)}</strong> — status: ${escHtml(it.status)}${it.signed_url ? ` — <a href="${escHtml(it.signed_url)}">ver foto</a>` : ""}</li>`
    ).join("");

    const html = `
      <h2>Objetos esquecidos — ${escHtml(propName)}</h2>
      <p>Limpeza concluída em ${escHtml(new Date(job.completed_at ?? Date.now()).toLocaleString("pt-BR"))}</p>
      <p>Profissional: ${escHtml(cleanerName)}</p>
      <p>Endereço: ${escHtml((job as any).properties?.address ?? "")}, ${escHtml((job as any).properties?.city ?? "")}</p>
      <h3>Itens encontrados:</h3>
      <ul>${itemsHtml || "<li>Nenhum item</li>"}</ul>
    `;

    if (adminEmail && lovableKey) {
      try {
        await fetch("https://ai.gateway.lovable.dev/v1/email/send", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${lovableKey}` },
          body: JSON.stringify({
            to: adminEmail,
            subject: `[Hostlyb] Objetos esquecidos — ${propName}`,
            html,
          }),
        });
      } catch (e) {
        console.warn("email send failed", e);
      }
    } else {
      console.warn("HOSTLY_ADMIN_EMAIL not configured; skipping email send");
    }

    await supabase.from("cleaning_jobs").update({ admin_email_sent: true }).eq("id", cleaning_job_id);

    return new Response(JSON.stringify({ ok: true, items: items?.length ?? 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
