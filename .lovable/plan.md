
# Operational Modules Upgrade — Implementation Plan

This is a large multi-area change. Grouped into 4 batches by concern. All UI copy will be added to `src/lib/i18n.tsx` (PT/EN/ES/FR/IT/DE).

---

## Batch 1 — Database & schema

One migration adding the schema needed by the new features:

1. `cleaning_jobs`: add `started_at TIMESTAMPTZ`, `duration_minutes INT GENERATED` (or computed in SQL view). Add trigger: when `status` flips to `em_andamento` → set `started_at = now()`; when `concluido` → set `completed_at = now()` (already exists) and compute duration.
2. `guests`: add `is_vip BOOLEAN DEFAULT false`, `had_issue BOOLEAN DEFAULT false`.
3. New table `maintenance_issues`:
   - `id, user_id, property_id, cleaning_job_id?, description, photo_url?, urgency ('normal'|'urgent'), status ('open'|'resolved'), reported_by ('cleaner'|'host'), created_at, resolved_at`.
   - RLS: owner-only (`auth.uid() = user_id`).
   - Trigger on insert: `create_alert(...)` + auto-insert pending `transactions` entry (category "Manutenção", status "pendente", amount 0) for the host to fill in.
4. New RPC `cleaner_report_problem(p_token, p_description, p_photo_url, p_urgency)` (security definer, mirrors `cleaner_add_forgotten_item`).
5. Optional view `property_cleaning_stats` aggregating last cleaning date / monthly count / issue count per property → consumed by the score badge.

---

## Batch 2 — Dashboard rewrite (`src/routes/app.tsx`)

Sections in order:

1. **Today in your operation** — 6 KPI cards (Check-ins, Check-outs, Pending cleanings, Currently staying, Maintenance, Estimated revenue today). Each card is a `Link` to the relevant page with a query string pre-filter (e.g. `/hospedes?filter=checkin-today`). Maintenance hidden when count is 0.
2. **Financial summary** — 4 big numbers (month revenue, expenses, profit, top property) + month-over-month % comparison (green/red). Queries `transactions` aggregated by month.
3. **Guest chart** — line chart (recharts is already a dep) with Day/Week/Month/Year toggle, grouping `guests.checkin_date`.
4. **Operation progress bar** — computes a 0–100 score from 6 criteria, hover/click opens a sheet listing missing items with direct links. Premium criterion (guidebook) opens UpgradeModal.

Keep the existing "Your properties" / "Upcoming cleanings" / "Alerts" sections below.

---

## Batch 3 — Cleaning module

1. `src/routes/limpezas.tsx`: each job in the host view shows `⏱️ duration_minutes` (when complete) and "avg X min on this property" (averaged client-side from completed jobs for the same `property_id`).
2. `src/routes/faxineira.$token.tsx`: when user taps the first checklist item or "Start", call `cleaner_update_job(status: 'em_andamento')` if still `agendado` (trigger records start). On submit `concluido`, duration is computed automatically.
3. `src/routes/imoveis.$id.tsx` and the property card on dashboard: render a **cleaning score badge** (🟢/🟡/🔴) using stats from the new view. Show last cleaning date, count this month, # issues.
4. **Report Problem button** in cleaner portal — red button above checklist. Opens a sheet with photo upload (existing `forgotten-items` bucket pattern, or new `maintenance-photos`), description, urgency radio. POSTs to a new server route `/api/public/cleaner/report-problem` (zero-storage policy similar to `/api/public/cleaner/notify`) which calls the RPC + sends email via existing `cleaning-problem` template + creates alert.

---

## Batch 4 — Guest module

1. **Status tags** on list + detail sheet: compute client-side
   - 🔵 Returning: more than 1 row with same email/phone
   - 🟡 VIP: `is_vip = true` (manual toggle in detail sheet)
   - 🔴 Attention: `had_issue = true` OR any `maintenance_issues` linked to a past stay
   - 🟢 Check-in confirmed: `status = 'confirmado' | 'hospedado'`
   - ⚪ Payment pending: linked `transactions` row with `status = 'pendente'` (or `total_value = 0`)
2. **WhatsApp button** in `GuestDetailSheet` with pre-filled localized template message using host's display name + property name (already wired via existing `wa.me/` pattern — just add a deep-link with `?text=`).
3. **Import guests** button — the SpreadsheetImport modal already supports guests. Plan: surface column-mapping UI (currently inferred only). Add a `MappingStep` between parse and import showing detected columns vs system fields with `<select>` overrides, plus the first-5-row preview + per-row validation errors (already partially there).

---

## Files touched

**Created**
- `supabase/migrations/<ts>_ops_upgrade.sql`
- `src/components/dashboard/OperationCenter.tsx`
- `src/components/dashboard/FinancialSummary.tsx`
- `src/components/dashboard/GuestChart.tsx`
- `src/components/dashboard/OperationProgress.tsx`
- `src/components/dashboard/PropertyScoreBadge.tsx`
- `src/components/cleaner/ReportProblemSheet.tsx`
- `src/routes/api/public/cleaner/report-problem.ts`

**Edited**
- `src/routes/app.tsx` (full rewrite around new sections)
- `src/routes/limpezas.tsx` (duration display + avg)
- `src/routes/faxineira.$token.tsx` (auto-start on first interaction + Report Problem button)
- `src/routes/imoveis.$id.tsx` and `imoveis.index.tsx` (score badge)
- `src/routes/hospedes.tsx` (tags, VIP toggle, WhatsApp deeplink)
- `src/components/SpreadsheetImport.tsx` (column-mapping step)
- `src/lib/i18n.tsx` (all new strings × 6 locales)

---

## Sequencing

1. Run migration (Batch 1) — wait for approval.
2. Add i18n strings + Batch 2 dashboard components.
3. Batch 3 (cleaning module + score) + Batch 4 (guest module).
4. Spreadsheet column-mapping polish.
5. Verify with browser preview.

**Estimated edits:** ~12 files, ~1500 LOC. Migration must be approved before code changes.
