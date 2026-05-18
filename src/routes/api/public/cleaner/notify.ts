import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import * as React from "react";
import { render } from "@react-email/components";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "hostlyb-com";
const SENDER_DOMAIN = "notify.www.hostlyb.com";
const FROM_DOMAIN = "www.hostlyb.com";

const BodySchema = z.object({
  token: z.string().uuid(),
  type: z.enum(["photo", "problem"]),
  description: z.string().max(2000).optional(),
  urgency: z.enum(["low", "medium", "high"]).optional(),
  bucket: z.enum(["cleaning-photos", "forgotten-items"]).optional(),
  path: z.string().max(500).optional(),
  recordIssue: z.boolean().optional(),
  // base64-encoded JPEG, ≤ ~70KB after encoding (50KB binary). Premium only.
  thumbnailBase64: z.string().max(120_000).optional(),
});

export const Route = createFileRoute("/api/public/cleaner/notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = process.env.SUPABASE_URL!;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        if (!url || !key) return Response.json({ error: "Server misconfigured" }, { status: 500 });

        let body;
        try {
          body = BodySchema.parse(await request.json());
        } catch (e: any) {
          return Response.json({ error: "Invalid payload", details: e?.message }, { status: 400 });
        }

        const admin = createClient(url, key);

        // Validate token and load job + property + owner
        const { data: job, error: jobErr } = await admin
          .from("cleaning_jobs")
          .select("id, user_id, property_id, cleaner_id, properties(name), cleaners(name)")
          .eq("access_token", body.token)
          .maybeSingle();
        if (jobErr || !job) return Response.json({ error: "Invalid token" }, { status: 404 });

        const { data: owner } = await admin
          .from("profiles")
          .select("email")
          .eq("id", job.user_id)
          .maybeSingle();
        if (!owner?.email) return Response.json({ error: "Owner email missing" }, { status: 422 });

        // Generate a signed URL for the photo (24h) if provided
        let photoUrl: string | undefined;
        if (body.bucket && body.path) {
          const { data: signed } = await admin.storage
            .from(body.bucket)
            .createSignedUrl(body.path, 60 * 60 * 24);
          photoUrl = signed?.signedUrl;
        }

        // Optional: persist a maintenance issue via RPC (also creates alert + pending transaction via trigger)
        if (body.type === "problem" && body.recordIssue) {
          const urg = body.urgency === "high" ? "urgent" : "normal";
          const { error: rpcErr } = await admin.rpc("cleaner_report_problem", {
            p_token: body.token,
            p_description: body.description ?? "(sem descrição)",
            p_photo_url: photoUrl,
            p_urgency: urg,
          });
          if (rpcErr) console.warn("cleaner_report_problem failed:", rpcErr.message);
        }

        const templateName = body.type === "photo" ? "cleaning-photo" : "cleaning-problem";
        const template = TEMPLATES[templateName];
        if (!template) return Response.json({ error: "Template missing" }, { status: 500 });

        const propertyName = (job as any).properties?.name ?? "Property";
        const cleanerName = (job as any).cleaners?.name ?? "Cleaner";
        const sentAt = new Date().toLocaleString("pt-PT");

        const templateData: Record<string, any> = {
          propertyName,
          cleanerName,
          description: body.description ?? "",
          photoUrl: photoUrl ?? "",
          sentAt,
          ...(body.type === "problem" ? { urgency: body.urgency ?? "medium" } : {}),
        };

        const element = React.createElement(template.component, templateData);
        const html = await render(element);
        const text = await render(element, { plainText: true });
        const subject = typeof template.subject === "function" ? template.subject(templateData) : template.subject;

        const messageId = crypto.randomUUID();
        await admin.from("email_send_log").insert({
          message_id: messageId,
          template_name: templateName,
          recipient_email: owner.email,
          status: "pending",
        });

        const { error: enqErr } = await admin.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: owner.email,
            from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject,
            html,
            text,
            purpose: "transactional",
            label: templateName,
            idempotency_key: `${templateName}-${job.id}-${messageId}`,
            queued_at: new Date().toISOString(),
          },
        });

        if (enqErr) {
          await admin.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: owner.email,
            status: "failed",
            error_message: enqErr.message,
          });
          return Response.json({ error: "Failed to enqueue email" }, { status: 500 });
        }

        // Zero-storage policy: delete the photo after the email is enqueued.
        if (body.bucket && body.path) {
          await admin.storage.from(body.bucket).remove([body.path]).catch(() => {});
        }

        return Response.json({ ok: true });
      },
    },
  },
});
