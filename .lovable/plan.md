# Admin Panel + Automated Emails

The current `/admin` is a single-page summary. I'll restructure it into a 6-section dashboard and wire up four automated email types plus a global floating support button.

Scope is large — I'll ship in 3 phases. Confirm scope and I'll start with Phase 1.

## Phase 1 — Admin shell, Overview, Users, Plans & Revenue

**Routing & access**
- Convert `/admin` into a layout route (`src/routes/admin.tsx` → renders sidebar + `<Outlet/>`)
- Children: `admin.index.tsx` (Overview), `admin.users.tsx`, `admin.revenue.tsx`, `admin.activity.tsx`, `admin.emails.tsx`, `admin.settings.tsx`
- Access gate: `beforeLoad` checks `auth.user.email === 'brasgold1@gmail.com'` OR row exists in `admin_users`. Anyone else → redirect to `/app`.
- Sidebar (dark, coral active): Overview · Users · Plans & Revenue · Activity · Emails · Settings

**Server functions** (`src/lib/admin.functions.ts`, all `requireSupabaseAuth` + admin email check, admin-client backed):
- `getOverviewMetrics()` → totals (users, paying, free), MRR, active 7d, inactive 3d/7d, churn risk count, plan distribution, signup series (30d), revenue series (6m)
- `listUsersAdmin({ search, plan, status, country, sort, limit, offset })` → joins auth.users + profiles + subscriptions + property/guest counts + last_sign_in_at
- `getUserDetailAdmin({ userId })` → profile, plan, properties, guests, last 5 activities (recent transactions/cleaning_jobs/guests), payment history
- `updateUserAdmin({ userId, action: 'suspend'|'delete'|'change_plan'|'note', payload })`
- `getRevenueMetrics()` → MRR per plan, ARR, paying users list, upgrade history (from subscriptions ordering), conversion rates
- `getActivityFeed({ limit })` → unioned recent rows across `cleaning_jobs`, `guests`, `transactions`, `maintenance_issues`, `alerts`
- `getEmailCampaignStats()` → from `email_send_log` deduped by message_id, grouped by template_name

**Pages**
- Overview: 3 stat rows + 4 charts (Recharts — already a dep? if not, use existing chart lib; signup line / revenue bar / plan pie / active-vs-inactive line)
- Users: filter bar, paginated table, row click → right-side panel with actions
- Plans & Revenue: MRR cards, paying users table, conversion %, popular plan trophy

## Phase 2 — Activity, Emails, Settings + floating support button

- Activity: live feed (refetch 60s), top-10 lists, "never logged back in" list
- Emails: list of automated emails with delivery stats + "Manual blast" panel (audience picker → subject → body textarea/Markdown → preview → confirm modal → fan out via `send-transactional-email`, capped at 50/min via existing queue)
- Settings: existing admin list + HOSTLY_ADMIN_EMAIL info
- **Floating support button**: `src/components/SupportFAB.tsx` mounted in `_authenticated` layout. Coral circle bottom-right, MessageCircle icon, tooltip i18n, click → modal with prefilled mailto including current URL. Hidden on `/admin/*` (admin already has email tools) and public routes.

## Phase 3 — Automated email pipeline

**Templates** (`src/lib/email-templates/`):
- `welcome.tsx`, `inactivity-3d.tsx`, `inactivity-7d.tsx`, `product-update.tsx`
- Each: mobile responsive, coral header (#FF6B6B), white body, primary CTA button, dark support button (`#0F172A`, "💬 Support — brasgold1@gmail.com", mailto with subject pre-filled with user email), Hostlyb footer
- Subject lines: function of `{ lang, name, monthYear }` — returns PT/EN/FR/DE/IT/ES per spec
- Register all 4 in `registry.ts` with `previewData`

**Triggers**:
- Welcome: DB trigger on `auth.users` insert → `pg_net` POST to `/api/public/hooks/send-welcome` with user id (HMAC via existing `SUPABASE_ANON_KEY` apikey pattern). The route resolves email + locale and enqueues via `enqueue_email` → `transactional_emails` queue.
- Inactivity 3d / 7d: `pg_cron` hourly → `/api/public/hooks/send-inactivity` → server scans `profiles` where `last_sign_in_at` is in the (3d−1h, 3d] or (7d−1h, 7d] window AND no prior send recorded in `email_send_log` for the same (template_name, recipient_email) within 30 days. For 3d email, builds the user's snapshot (properties count, upcoming checkouts in 7d, pending cleanings) by querying their own data with admin client.
- Product update: manual blast from admin Emails page (Phase 2).

**Locale**: pull preferred locale from `profiles` (add `locale TEXT` column defaulting to `'pt'`, populated from `i18n` setting at login).

**Tracking**: every send goes through existing `enqueue_email` so `email_send_log` captures delivery; admin Emails page reads from it (dedup on message_id).

## Database changes
- `profiles.locale TEXT NOT NULL DEFAULT 'pt'`
- `profiles.suspended_at TIMESTAMPTZ` (for suspend action)
- `admin_notes` table (user_id, note, created_by, created_at) with admin-only RLS via `is_admin(auth.uid())`
- Seed `admin_users` with the brasgold1 row using `HOSTLY_ADMIN_EMAIL`
- pg_cron: `send-inactivity-emails-hourly` (every hour at :05)
- DB trigger on `auth.users` AFTER INSERT → pg_net POST to welcome hook

## Out of scope (will confirm after Phase 1)
- I will NOT implement open-tracking pixels — current infra logs delivery only (`email_send_log` doesn't capture opens). I'll show "Delivery rate" instead of "Open rate" and label it clearly. If you need open tracking, that's a separate provider-level change.
- "Suspend" will set `suspended_at` and have RLS deny app writes; full session revocation requires service-role auth admin API call which I'll include.
- "Delete user" calls `auth.admin.deleteUser` (cascades via existing FKs).

## Confirm
Reply **go** (or **go phase 1**) and I'll ship Phase 1 immediately. If you want a different split or any item dropped, tell me now.
