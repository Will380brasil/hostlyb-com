# Plan — Bug fixes, Photo-by-Email, New Pricing

## A. Email infrastructure (Lovable Emails)
Set up Lovable email domain on `hostlyb.com` → scaffold transactional email infra → create 3 templates:
1. `invite-employee` — invite link + role + org name
2. `cleaning-photo` — per-photo (subject: "📸 [Property] — [Room] — HH:MM"), attaches photo
3. `cleaning-problem` — problem report with photo + urgency

Note: Lovable Emails do not natively support attachments. Workaround: upload to a **temporary** Supabase bucket (`photo-outbox`), include signed URL in email, then **delete the object** in the same server function after enqueue. Net result: no persistent storage cost. Email contains the photo as embedded inline image fetched at send time by the queue worker (we'll fetch + base64-attach via `@lovable.dev/email-js` attachments field).

## B. Photo flow rewrite
- New bucket `photo-outbox` (private, lifecycle: delete after 1h as safety net).
- Cleaner uploads photo → server fn `sendCleaningPhotoEmail({ jobId, roomName, photoBlob })`:
  1. Upload to `photo-outbox/<uuid>`
  2. Fetch bytes, base64
  3. Enqueue email to host with attachment
  4. Delete object
  5. Insert row in `cleaning_photo_log` `{ cleaning_job_id, room_name, sent_at, photo_sent: true }`
- Replace existing `cleaning-photos` bucket usage in `faxineira.$token.tsx` and forgotten-items flow.
- Dashboard cleaning history shows row from `cleaning_photo_log` with label "📸 Photos sent to your email" (no thumbnails for Free/Pro).
- Premium: also keep thumbnail in `cleaning-photos` (lifecycle delete after 30d) — separate gating.

## C. Invite flow fix
- Audit `accept_invite` RPC + `/convite/$token` route.
- On invite create in `equipe.tsx`: call new server fn `sendInviteEmail` (Lovable Emails template `invite-employee`) AND show copy-link button as backup.
- Handle: signed-out user → `/login?redirect=/convite/<token>`; expired/accepted/org-full clear errors.
- Verify role lands in `organization_members` and RLS works post-accept.

## D. Logo redirect
`AppShell` + landing header: dynamic `<Link to={session ? '/app' : '/'}>`.

## E. Financial module
- `formatMoney()` already locale-aware (done) — wire into `routes/financeiro.tsx`.
- Add tokens `--finance-value #0f0f0f`, `--finance-income #15803d`, `--finance-expense #991b1b` in `styles.css` + use as `text-[hsl(var(--finance-*))]`.
- Add `origin` badge column ("Reserva #abc", "Limpeza", "Manutenção", "Manual").
- Add manual `maintenance` category to transaction form; triggers already cover guest + cleaning. Add optional `maintenance_log` table later (Premium feature) — for now, manual "despesa / manutenção" with `origin='manual'`.

## F. Cleaner detail modal
`routes/equipe.tsx`: clicking a cleaner card opens `<Dialog>` with:
- Full name, email, phone, status, photo
- Linked properties (via `property_cleaners`)
- Last 10 cleanings + total count + total earnings
- Edit / Toggle active / Remove (soft `is_active=false`) buttons

## G. Pricing — new 3 tiers (grandfather old subscribers)
Create new Stripe prices (keep old IDs in `ALLOWED_PRICES` for grandfather):
| Plan | BRL | EUR | USD | GBP |
|---|---|---|---|---|
| Pro | R$34,90 | €14 | $19 | £14 |
| Premium | R$69,90 | €29 | $39 | £29 |

- `payments--batch_create_product`: `hostlyb_pro` (4 prices), `hostlyb_premium` (4 prices) at new amounts.
- Update `ALLOWED_PRICES` (add new, keep old).
- Webhook `plan_tier` derivation handles both old + new price ids.
- `can_add_property`: Free = **1** (not 2), Pro = 5, Premium = unlimited. Update existing migration.
- Add `max_org_members` enforcement: Free=1, Pro=3, Premium=999.

## H. Landing + checkout UI
- `routes/index.tsx` — rebuild `Pricing` with 3 cards (Free 1 prop, Pro 5 prop €14, Premium unlimited €29). Remove Demo button from header + hero. Remove all "7 dias grátis / no credit card" copy in i18n.
- `routes/assinar.tsx` — already 3-plan; update prices to new values, drop SAR special-case (keep simple EUR for non-listed countries).
- `TrialGate.tsx` / `useTrialStatus` — gut trial banner + lockout; Free is permanent and gated only by feature/property limits via `UpgradeModal`.

## I. Files affected
- migrations: bucket + lifecycle + `cleaning_photo_log` + update `can_add_property` to 1 + `max_org_members` enforcement function
- new: `src/lib/email-templates/{invite-employee,cleaning-photo,cleaning-problem}.tsx`, `src/lib/email-templates/registry.ts`
- new server fns: `src/lib/email/send.ts`, `src/utils/photo-email.functions.ts`, `src/utils/invite-email.functions.ts`
- edited: `assinar.tsx`, `index.tsx` (Pricing), `equipe.tsx` (modal + email), `financeiro.tsx` (format + colors + origin), `faxineira.$token.tsx` (photo flow), `AppShell.tsx` (logo), `TrialGate.tsx` (gut), `i18n.tsx` (strings), `payments.functions.ts` (new prices)

## Open
- "Powered by Hostlyb" on cleaner public link — add for Free, hide for Pro/Premium (gated on org's plan_tier).
- Premium-only features (guidebook, check-in, maintenance log, PDF report, AIMA): scaffold as "Coming soon" stubs to ship pricing now; full build in follow-up.

Approve and I'll execute in order: email infra → DB migration → email templates + server fns → photo flow rewrite → invite fix → pricing/landing/checkout → financial UI → cleaner modal → logo.