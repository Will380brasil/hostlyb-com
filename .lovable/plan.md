This is a large scope spanning 6 modules. I'll ship it in 5 ordered phases so the preview stays usable between batches. Reply "go" to start, or tell me which phase to prioritize / drop.

## Phase 1 — Dashboard "Today's Operation Center"
- New `TodayOperationCenter` component at top of `/app` (dashboard):
  - Cards: check-ins today, check-outs today, pending cleanings, guests staying, maintenance open (only if >0), estimated revenue today.
  - Each card clickable → opens a side sheet with the filtered list (link to full module).
- `FinancialSummary` strip: 4 KPIs (revenue, expenses, profit, top property) + month-over-month % line (colored).
- `GuestChart` (recharts line): toggle Day/Week/Month/Year, thin lines, hover tooltip.
- `OperationProgress` bar: computes % from 6 criteria, popover lists missing items with deep links. Premium criterion (guidebook) shows upgrade nudge for Pro.

## Phase 2 — iCal Sync (free channel manager)
- DB: new table `ical_feeds` (user_id, property_id, platform, label, url, last_sync_at, last_status, last_error). RLS = own.
- DB: extend `guests` with `ical_uid` (text, unique per user) + `ical_source` to dedupe.
- Server fn `syncIcalFeed` (uses `node-ical`): parses VEVENTs, upserts guests as confirmed bookings.
- Cron via pg_cron → `/api/public/hooks/ical-sync` every 60 min, iterates all feeds.
- Settings UI: "Connect booking platforms" section under existing settings route. Fields per platform + custom. Status badge + "Sync now" button.
- Calendar: render imported events with source label/color.

## Phase 3 — Cleaning module upgrades
- Timer: `started_at` already exists; ensure `/limpeza/[token]` checklist sets it on first open and `completed_at` on submit. Show duration + property avg.
- History view per cleaning: shows "📸 Photos sent to host@email" (NOT the photos themselves) + problems list.
- Property cleaning score badge (🟢🟡🔴) on property cards, computed from last cleaning recency + open issues.
- Cleaner link "Report Problem" button (orange) → form (photo+text+urgency) → POSTs to existing `/api/public/cleaner/notify` route extended to also insert into `maintenance_issues` + a `pendente` expense `transactions` row.

## Phase 4 — Guest module
- Status tags component (returning detected by repeat email/phone, VIP from `is_vip`, attention from `had_issue`, check-in confirmed from `checkin_submitted_at`, payment pending from related tx).
- WhatsApp button → `wa.me/<digits>?text=<i18n template>`.
- Import: new modal supporting CSV + XLSX (`papaparse` + `xlsx`), column mapping UI, preview 5 rows, per-row validation, bulk insert linked to chosen property.

## Phase 5 — Financial auto-sync (verify + complete)
- Existing triggers `trg_sync_guest_tx` and `trg_sync_cleaning_tx` are already in place. Add `trg_sync_maintenance_tx` for `maintenance_issues.cost`.
- Add `origin` display badge in transactions list ("From booking" / "From cleaning" / "From maintenance" / "Manual") — column already exists.
- Locale-aware number formatting helper via existing `formatCurrency` (verify usage in finance list).

## Out of scope (flagging)
- Real iCal write-back to Airbnb/Booking (those don't accept it — iCal is read-only by design).
- Realtime sync <60min (correctly surfaced as a warning per spec).

Confirm and I'll execute Phase 1 first, then continue through 5.