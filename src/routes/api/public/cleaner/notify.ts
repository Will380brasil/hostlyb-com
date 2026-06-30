import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import * as React from "react";
import { render } from "@react-email/components";
import { z } from "zod";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "Hostlyb";
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

        // Rate limit per (template, recipient): max 30/hour, 5s cooldown.
        const templateNameForLimit = body.type === "photo" ? "cleaning-photo" : "cleaning-problem";
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
        const cooldownAgo = new Date(Date.now() - 5 * 1000).toISOString();
        const { count: recentCount } = await admin
          .from("email_send_log")
          .select("message_id", { count: "exact", head: true })
          .eq("template_name", templateNameForLimit)
          .eq("recipient_email", owner.email)
          .gte("created_at", hourAgo);
        if ((recentCount ?? 0) >= 30) {
          return Response.json(
            { error: "Rate limit exceeded for this notification type" },
            { status: 429 }
          );
        }
        const { data: lastSend } = await admin
          .from("email_send_log")
          .select("message_id")
          .eq("template_name", templateNameForLimit)
          .eq("recipient_email", owner.email)
          .gte("created_at", cooldownAgo)
          .limit(1);
        if (lastSend && lastSend.length > 0) {
          return Response.json(
            { error: "Please wait a few seconds before sending another notification" },
            { status: 429 }
          );
        }


        // Generate a signed URL for the photo (24h) if provided
        let photoUrl: string | undefined;
        if (body.bucket && body.path) {
          // Ensure the path belongs to this job's access token to prevent
          // cross-job file access/deletion via the service-role client.
          if (!body.path.startsWith(`${body.token}/`)) {
            return Response.json(
              { error: "Path does not belong to this job" },
              { status: 403 }
            );
          }
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

        // Premium-only: persist a small thumbnail (≤50KB) for 30 days so the host
        // can see an inline preview in the cleaning history.
        if (body.thumbnailBase64 && body.type === "photo") {
          try {
            const { data: member } = await admin
              .from("organization_members")
              .select("organization_id")
              .eq("user_id", job.user_id)
              .order("created_at", { ascending: true })
              .limit(1)
              .maybeSingle();
            let isPremium = false;
            if (member?.organization_id) {
              const { data: sub } = await admin
                .from("subscriptions")
                .select("plan_tier,status,current_period_end")
                .eq("organization_id", member.organization_id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();
              if (sub && sub.plan_tier === "premium") {
                const active = sub.status === "active" || sub.status === "trialing" ||
                  ((sub.status === "canceled" || sub.status === "past_due") &&
                    sub.current_period_end && new Date(sub.current_period_end) > new Date());
                isPremium = !!active;
              }
            }
            if (isPremium) {
              const b64 = body.thumbnailBase64.replace(/^data:image\/\w+;base64,/, "");
              const bytes = Buffer.from(b64, "base64");
              if (bytes.byteLength > 0 && bytes.byteLength <= 60_000) {
                const thumbPath = `${job.user_id}/${job.id}/${Date.now()}.jpg`;
                const { error: upErr } = await admin.storage
                  .from("cleaning-thumbnails")
                  .upload(thumbPath, bytes, { contentType: "image/jpeg", upsert: false });
                if (!upErr) {
                  await admin.from("cleaning_photo_thumbnails").insert({
                    user_id: job.user_id,
                    property_id: job.property_id,
                    cleaning_job_id: job.id,
                    thumbnail_path: thumbPath,
                    description: body.description ?? null,
                  });
                }
              }
            }
          } catch (e: any) {
            console.warn("thumbnail persist failed", e?.message);
          }
        }

        // Zero-storage policy: delete the full-resolution photo after the email is enqueued.
        if (body.bucket && body.path) {
          await admin.storage.from(body.bucket).remove([body.path]).catch(() => {});
        }

        return Response.json({ ok: true });
      },
    },
  },
});
