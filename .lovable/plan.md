## Premium Plan Features — Implementation Plan

Four major features gated behind Premium subscription, with upgrade prompts for Pro/Free users.

### Shared infrastructure

**Premium gate hook + component** (`src/hooks/use-premium.ts`, `src/components/PremiumGate.tsx`):
- Reads current subscription tier from existing `subscriptions` table via existing org context
- `PremiumGate` wraps content; shows upgrade card with copy "This is a Premium feature. Upgrade to unlock professional-grade tools for your operation." + button → `/billing`
- i18n strings for all 6 languages

### Feature 1 — Digital Property Guidebook

**DB migration** — extend `properties` table:
- `guidebook_enabled boolean default false`
- `guidebook_slug text unique` (random short slug for public URL)
- `guidebook_data jsonb` ({ checkin, checkout, wifi_password, house_rules, appliances, local_tips, host_contact, host_phone })

**Routes:**
- `/imoveis/$id/guia` — host editor (Premium gate)
- `/guia/$slug` — public mobile-optimized page (no auth, SSR-friendly)
- RLS: public SELECT on `properties` where `guidebook_enabled = true` (limited columns via server fn using `supabaseAdmin`)
- Server fn `getPublicGuidebook(slug)` returns sanitized guidebook data + plan tier of owner (to toggle Hostlyb branding)

**Sharing:** WhatsApp / email links + QR code (use `qrcode` npm package, render as canvas)

### Feature 2 — Digital Check-in Form

**DB migration** — extend `guests` table:
- `checkin_token uuid unique default gen_random_uuid()`
- `checkin_submitted_at timestamptz`
- `document_country text`, `date_of_birth date`, `nationality text` (full_name + document already exist)

**Routes:**
- `/checkin/$token` — public form (no auth)
- Server fn `submitGuestCheckin(token, data)` validates + writes via `supabaseAdmin`
- In `hospedes.tsx`: "Send check-in link" button (Premium gate) generates link, WhatsApp share
- Guest detail: show submission status + filled data
- "Export registration data" CSV button per property

### Feature 3 — Maintenance Log

Already have `maintenance_issues` table + cleaner reporting (Prompt 3 done). Need:
- **DB migration:** add `cost numeric`, `responsible text`, `identified_date date`, `notes text` to `maintenance_issues`. Status enum already exists (open/in_progress/resolved).
- **Property detail page** (`imoveis.$id.tsx`): add "Manutenção" tab with full CRUD (Premium gate)
- Filter by status, search by description
- Trigger update: when issue has `cost > 0` and status changes to `resolved`, sync to `transactions` as expense in "Manutenção" category (extend existing `on_maintenance_issue_created` trigger or add new `on_maintenance_issue_resolved`)
- Notification already wired via existing alert trigger ✓

### Feature 4 — Performance Report PDF

**Property detail page:** add "Performance" tab (Premium gate) computing:
- Occupancy rate = booked nights / available nights in period
- Total revenue (sum of `transactions` type=entrada for property)
- Avg revenue per night
- Guest count, cleaning cost, maintenance cost, net profit
- Month-over-month delta
- Period selector (current month / last 3 / last 6 / YTD)

**PDF export:** use `jspdf` + `jspdf-autotable` (already common) — generate client-side one-pager with Hostlyb logo, metrics grid, simple bar chart (manual rect drawing) of last 6 months revenue.

### Files to create/edit

- DB migration (single): properties guidebook cols, guests checkin cols, maintenance_issues cols, RLS for public guidebook + public checkin submission, transaction sync trigger for maintenance cost
- `src/hooks/use-premium.ts`, `src/components/PremiumGate.tsx`
- `src/routes/imoveis.$id.guia.tsx` (editor), `src/routes/guia.$slug.tsx` (public)
- `src/routes/checkin.$token.tsx` (public form)
- `src/lib/guidebook.functions.ts`, `src/lib/guest-checkin.functions.ts`
- Extend `src/routes/imoveis.$id.tsx` with Maintenance + Performance tabs
- Extend `src/routes/hospedes.tsx` with "Send check-in" action
- `src/lib/performance-pdf.ts` (jspdf generator)
- `src/lib/i18n.tsx` — add all new keys × 6 languages
- `bun add qrcode jspdf jspdf-autotable` + types

### Suggested execution order (one turn each)

1. DB migration + Premium gate primitives + i18n keys
2. Feature 1 — Digital guidebook (editor + public page + QR)
3. Feature 2 — Digital check-in form
4. Feature 3 — Maintenance tab
5. Feature 4 — Performance tab + PDF export

Want me to start with step 1 (migration + gate + i18n scaffolding)?
