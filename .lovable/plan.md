
# Implementation Plan

## 1. Bug fixes

**1a. Logo click routing** — Update header logo `onClick` in landing/app shells: `user ? navigate('/dashboard') : navigate('/')`. Files: `src/components/Header*.tsx`, landing nav.

**1b. Invite flow (`/equipe` + `/convite/$token`)**
- Verify `organization_invites` insert generates a token, and `convite.$token.tsx` properly accepts (insert into `organization_members`, mark `accepted_at`).
- Wire transactional email send via existing email infra: new template `team-invite.tsx` with accept link `${origin}/convite/${token}`.
- Server fn `acceptInvite(token)` using `requireSupabaseAuth` → validates expiry, inserts membership, marks accepted.
- After accept, redirect to `/dashboard` with proper org context.

**1c. Financial formatting & contrast**
- `src/lib/format.ts`: `formatCurrencyLocale(value, currency, lang)` using `Intl.NumberFormat` (pt-BR→BRL, en-US→USD, pt-PT/de/fr/it/es→EUR with EU separators).
- Apply across `financeiro.tsx`, dashboard `FinancialSummary.tsx`, performance PDF.
- Color tokens: add `--finance-value`, `--finance-income`, `--finance-expense` to `styles.css` (light + dark).

**1d. Transaction sync triggers (DB)**
- Trigger `sync_guest_to_transaction` on `guests` insert/update of `total_value` → upsert revenue row (category `accommodation`, origin `guest:<id>`).
- Trigger `sync_cleaning_to_transaction` on `cleaning_jobs` when `payment_status='pago'` → upsert expense (category `cleaning`, origin `cleaning:<id>`).
- Maintenance trigger already exists; ensure origin format `maintenance:<id>`.
- Add "Origin" column in financial UI showing e.g. "from reservation Maria S." via lookup.

**1e. Professional (cleaner) detail modal**
- New `CleanerDetailModal.tsx`: name, email, phone, pix/payment, linked properties (`property_cleaners`), recent cleaning history (last 10 jobs), rating, status badge, Edit + Remove buttons.
- Wire from cleaner cards in `equipe.tsx` / cleaners list.

## 2. Photo-by-email system

**Architecture**: photos NEVER stored. Sent as email attachments via existing Lovable email gateway (SendGrid behind the scenes — we use the platform's `send-transactional-email` which supports inline content; if attachments unsupported, embed photo as base64 inline `<img>` in email body — same UX, zero storage).

**Note**: Lovable email infra does not support file attachments per the guide. We will inline the photo as a `data:` image embedded in the React Email template body (full-quality). For "Report Problem" same approach.

- Server route `POST /api/public/cleaner/photo` (token-scoped): accepts base64 photo + metadata → resolves host email → enqueues transactional email with photo embedded inline → inserts row in `cleaning_photo_log { cleaning_job_id, room_name, kind, sent_at, photo_sent: true, description?, urgency? }`. Returns 200. No bucket upload.
- React Email templates:
  - `cleaning-photo.tsx`: subject `📸 Limpeza — {property} — {room} — {HH:MM}`, body with property, address, room, cleaner name, timestamp, inline photo, footer.
  - `cleaning-problem.tsx`: subject `🔴 PROBLEMA REPORTADO — {property} — {urgency}`, body with description + photo + urgency.
- Update `faxineira.$token.tsx` checklist photo handler: stop uploading to storage; call new endpoint with base64.
- Update `ReportProblemSheet.tsx`: same.
- Cleaning history UI: show "📸 Photos sent to host email" badge with count from `cleaning_photo_log`, not images.
- DB: drop/ignore `photos jsonb` on `cleaning_jobs` going forward (keep column for back-compat).

## 3. Pricing restructure

**Remove**: every "7 days free trial", "free trial", "no credit card", landing "Demo" button. Keep "Cancel anytime".

**New plans** (`src/lib/pricing.ts`):
```
free:    1 property, 1 user, branded cleaner link
pro:     5 properties, 3 users — €14 / $19 / R$34.90
premium: unlimited — €29 / $39 / R$69.90
```
Per-locale price selection: PT/EU langs → EUR, en → USD, pt-BR → BRL. Never cross-show.

Update:
- `src/lib/pricing.ts` data.
- Landing `index.tsx` pricing section (3 cards, feature lists per spec).
- `assinar.tsx` plan picker.
- `usePremium` hook: tier from subscription `plan_tier` ('free'|'pro'|'premium'); gate Premium-only features (guidebook, checkin, maintenance log, performance PDF, photo thumbs).
- Property limit enforcement on insert.
- Remove demo button from landing `index.tsx` and Header.

## 4. Migration (single SQL)
- Triggers: guest→tx, cleaning→tx (with origin tracking).
- Ensure `transactions.origin` indexed.
- No new tables.

## 5. i18n
Add keys: `invite.email.*`, `cleaner.modal.*`, `photo.sent_label`, `pricing.cancel_anytime`, plan feature lists for 6 langs.

## Execution order
1. DB migration (triggers)
2. Pricing data + landing + assinar updates + Premium gating
3. Logo redirect + finance formatting/colors + finance origin column
4. Cleaner modal
5. Photo email templates + endpoint + faxineira/report wiring
6. Invite email template + accept fn + equipe wiring
7. i18n keys for all 6 languages
8. Verify build

This is large — I'll proceed straight through after approval.
