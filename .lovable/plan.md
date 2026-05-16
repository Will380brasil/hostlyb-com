# Plan: Bug fixes + Pricing restructure

## Part 1 — Bug fixes

### 1. Employee invite flow
- Audit `accept_invite` RPC + `/convite/$token` route + invite creation in `equipe.tsx`.
- Ensure invite email is actually sent (currently only generates a link — add transactional email via the email infra; if not desired, surface the copyable link clearly with a "Copy invite link" button).
- After accept: redirect to `/app` and confirm `organization_members` row has correct role so RLS (`is_org_member`, `has_org_role`) grants access.
- Fix edge cases: expired token, already-accepted, signed-out user (route through `/login?redirect=/convite/<token>`).

### 2. Logo redirect based on auth
- In `AppShell` / landing header, make the logo `<Link>` dynamic: when `useAuth()` has a session → `to="/app"` (the dashboard route), otherwise `to="/"`.

### 3. Financial module formatting + contrast
- Create `formatMoney(amount, currency, lang)` helper using `Intl.NumberFormat` with correct locale (pt-BR, en-US, en-GB, de-DE, fr-FR, it-IT, es-ES).
- Replace ad-hoc formatting in `routes/financeiro.tsx`.
- Add semantic tokens in `src/styles.css`: `--finance-value` (#0f0f0f), `--finance-income` (#15803d), `--finance-expense` (#991b1b) — used via Tailwind classes.

### 4. Auto-sync transactions
- DB triggers (migration):
  - `AFTER INSERT/UPDATE ON guests` when `status='hospedado'` or on creation with `total_value > 0` → insert into `transactions` (type='receita', category='hospedagem', guest_id, property_id, amount=total_value).
  - `AFTER UPDATE ON cleaning_jobs` when `status='concluido'` → insert transaction (type='despesa', category='limpeza', cleaning_job_id, property_id, amount=payment_amount).
  - Idempotency: unique partial index on `(guest_id) WHERE category='hospedagem'` and `(cleaning_job_id) WHERE category='limpeza'`.
- Add `origin` text column to `transactions` (e.g. `'auto:guest'`, `'auto:cleaning'`, `'manual'`) for traceability — display as badge in UI.

### 5. Cleaner detail modal
- In `routes/equipe.tsx`, add `<Dialog>` opened on cleaner card click.
- Fetch: cleaner row, linked properties (via `property_cleaners` join), cleaning history (`cleaning_jobs` filtered by `cleaner_id`, with count + recent dates).
- Actions: Edit (existing form), Remove (soft via `is_active=false`), toggle active.

---

## Part 2 — Pricing restructure

### Remove trial messaging
Grep + remove from i18n strings and JSX in: `routes/index.tsx`, `routes/assinar.tsx`, `components/TrialGate.tsx`, `components/UpgradeModal.tsx`, dashboard banners, FAQ:
- "7 dias grátis" / "7 days free" / "free trial"
- "sem cartão de crédito" / "no credit card"
Keep only: "Cancele quando quiser" / "Cancel anytime".

Also remove the **Demo** link/button (`DemoLeadModal` trigger, `/demo` link) from landing header + hero CTAs. Keep the `/demo` route itself for now (no harm), just unlinked.

### Three permanent plans

| Plan | BRL | EUR | USD | GBP |
|---|---|---|---|---|
| Free | 0 | 0 | 0 | 0 |
| Pro | R$ 27,90 | €9 | $19 | £9 |
| Premium | R$ 54,90 | €19 | $39 | £19 |

Add GBP to `Currency` type in `src/lib/i18n.tsx` and to currency detection (en-GB → GBP). Update `currencyForCountry()` and `setLang()` mapping accordingly.

### Stripe products
Create 6 prices via `payments--batch_create_product`:
- `pro_monthly_brl` (2790), `pro_monthly_eur` (900), `pro_monthly_usd` (1900), `pro_monthly_gbp` (900)
- `premium_monthly_brl` (5490 — replaces old), `premium_monthly_eur` (1900 — replaces old), `premium_monthly_usd` (3900 — replaces old), `premium_monthly_gbp` (1900)

Update `ALLOWED_PRICES` in `src/utils/payments.functions.ts`.

### Subscription tier enforcement
Add `plan_tier` ('free'|'pro'|'premium') to `subscriptions` derived from `price_id` in webhook (`api/public/payments/webhook.ts`).
Update `can_add_property` and `user_can_access_app` DB functions:
- Free tier: max 2 properties, 1 user always allowed (no expiry).
- Pro: unlimited properties, max 5 org members.
- Premium: unlimited everything.
Remove the 7-day grace-period branch from both functions.

### Landing page `Pricing` component (`routes/index.tsx`)
Rebuild with 3 cards. Feature lists per spec above. CTAs: "Começar grátis" (Free → signup), "Assinar Pro" / "Assinar Premium" (→ `/assinar?plan=pro|premium`).

### `/assinar` page
- Show 3 plans (Free shown as current if applicable).
- `priceIdFor(currency, plan)` → returns correct Stripe price id.
- Saudi Arabia: keep SAR display, billed in EUR.
- Pass selected plan via query param or state.

### Feature gating (basic)
Gate the following UI behind `plan_tier`:
- Pro+: full financial module, spreadsheet guest import, advanced dashboard, "Powered by Hostlyb" removed from cleaner public link.
- Premium+: digital guidebook, check-in form, maintenance log, PDF reports (placeholder routes if not yet built).

This plan ships gating + removes branding; building Premium-only features (guidebook, check-in form, maintenance log, PDF report) is scaffolded as empty routes with "Coming soon" unless you want full implementations now — let me know.

---

## Open questions before I start

1. **Premium features** — do you want me to fully build the digital guidebook, digital check-in form, maintenance log, and per-property PDF report in this same pass, or scaffold them as "coming soon" pages and ship the bugfix + pricing now?
2. **Invite emails** — do you want real email delivery (I'd set up transactional email via Resend or similar), or is a copyable invite link enough for now?
3. **Existing subscribers** on the old `hostly_pro_*` / pre-existing `premium_monthly_*` prices — keep them grandfathered (no change) or migrate via Stripe portal? I recommend grandfather + keep legacy price IDs in `ALLOWED_PRICES`.
