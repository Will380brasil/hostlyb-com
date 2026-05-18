/**
 * Server-only helper to enqueue a transactional email without requiring a JWT.
 * Mirrors src/routes/lovable/email/transactional/send.ts but is callable from
 * server routes (cron hooks, DB triggers, internal admin actions).
 * NEVER import from client code.
 */
import * as React from "react";
import { render } from "@react-email/components";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "hostlyb-com";
const SENDER_DOMAIN = "notify.www.hostlyb.com";
const FROM_DOMAIN = "www.hostlyb.com";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface InternalSendArgs {
  templateName: string;
  recipientEmail: string;
  templateData?: Record<string, any>;
  idempotencyKey?: string;
}

export async function internalSendEmail({
  templateName,
  recipientEmail,
  templateData = {},
  idempotencyKey,
}: InternalSendArgs): Promise<{ ok: boolean; reason?: string; messageId?: string }> {
  const supabase = supabaseAdmin;
  const template = TEMPLATES[templateName];
  if (!template) return { ok: false, reason: "template_not_found" };

  const effectiveRecipient = (template.to || recipientEmail || "").trim();
  if (!effectiveRecipient) return { ok: false, reason: "missing_recipient" };

  const normalizedEmail = effectiveRecipient.toLowerCase();
  const messageId = crypto.randomUUID();
  const idem = idempotencyKey || messageId;

  // Suppression check
  const { data: suppressed } = await supabase
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (suppressed) {
    await supabase.from("email_send_log").insert({ message_id: messageId, template_name: templateName, recipient_email: effectiveRecipient, status: "suppressed" });
    return { ok: false, reason: "suppressed" };
  }

  // Unsubscribe token (one per email)
  let unsubscribeToken: string;
  const { data: existingToken } = await supabase
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();
  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    unsubscribeToken = generateToken();
    await supabase.from("email_unsubscribe_tokens").upsert(
      { token: unsubscribeToken, email: normalizedEmail },
      { onConflict: "email", ignoreDuplicates: true }
    );
    const { data: stored } = await supabase
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalizedEmail)
      .maybeSingle();
    if (stored?.token) unsubscribeToken = stored.token;
  } else {
    return { ok: false, reason: "suppressed" };
  }

  const element = React.createElement(template.component, { ...templateData, recipientEmail: effectiveRecipient });
  const html = await render(element);
  const plainText = await render(element, { plainText: true });
  const resolvedSubject = typeof template.subject === "function" ? template.subject(templateData) : template.subject;

  await supabase.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: "pending",
  });

  const { error: enqueueError } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject: resolvedSubject,
      html,
      text: plainText,
      purpose: "transactional",
      label: templateName,
      idempotency_key: idem,
      unsubscribe_token: unsubscribeToken!,
      queued_at: new Date().toISOString(),
    },
  });
  if (enqueueError) {
    await supabase.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "failed",
      error_message: enqueueError.message,
    });
    return { ok: false, reason: "enqueue_failed" };
  }

  return { ok: true, messageId };
}
