# Scope check — this is huge

You're asking for 3 large tracks at once. Realistically, doing all of it well in a single response will exceed practical limits and risk regressions across every screen. I'd like to split it into 3 batches you can approve one at a time.

Current state I verified:
- `src/lib/i18n.tsx` already has 6 languages (PT/EN/ES/FR/IT/DE). I'll audit DE+IT for missing keys and align them with PT/EN.
- "Airbnb" appears in 5 files (`hospedes.tsx`, `financeiro.tsx`, `pricing.ts`, `i18n.tsx`, `spreadsheet-templates.ts`).
- Currency already follows language in `setLang` (pt→BRL, en→USD, others→EUR) but doesn't differentiate EN-US vs EN-GB. Pricing section uses `formatPrice(currency, lang)` already — should already work; I'll verify.
- Internal screens currently use a card style defined globally (`.hostly-card`) plus inline styles in places. There is no dark-mode toggle.

---

## Batch 1 — i18n + Airbnb removal (ship first)

1. **DE + IT audit**: diff keys vs PT/EN in `i18n.tsx` and `landing-copy.ts`, fill every missing key with native translation. Same for landing copy (`landing-copy.ts` ~590 lines × 6 langs).
2. **Replace "Airbnb"** with locale-appropriate generic term via a new helper `tRental(lang)` returning: PT "alojamento local" / EN "short-term rental" / FR "location courte durée" / DE "Ferienwohnung" / IT "affitto breve" / ES "alojamiento local". Replace in 5 files (copy strings only — no DB/feature change).
3. **Currency by country**: extend mapping so `en` + country `GB` → GBP; otherwise en→USD. Pricing section already renders in active currency — sanity check.
4. **Hardcoded strings sweep** on these high-traffic files: `app.tsx`, `financeiro.tsx`, `hospedes.tsx`, `limpezas.tsx`, `calendario.tsx`, `imoveis.index.tsx`, `imoveis.$id.tsx`, dashboard components, `OperationCenter`, `FinancialSummary`, `OperationProgress`, `PropertyScoreBadge`, `GuestChart`. Move all visible PT strings into `i18n.tsx` and translate to 6 langs. (Email templates: route them through i18n via recipient locale.)

Heads-up: I will not touch DB-stored content, tooltip strings inside third-party libs, or error messages that already live in i18n.

## Batch 2 — Visual design upgrade (internal screens)

1. **Design tokens** in `src/styles.css`: white/`#f9fafb` backgrounds, card border `#e5e7eb` + radius 12 + shadow `0 1px 4px rgba(0,0,0,.06)`, sidebar `#0f172a` with coral `#FF6B6B` active, primary text `#0f0f0f`, secondary `#374151`. Define semantic tokens (`--surface`, `--surface-muted`, `--border-subtle`, `--text-strong`, `--text-secondary`, `--sidebar-bg`, `--sidebar-active`) so we never use raw hex in components.
2. **Update `.hostly-card`** and `AppShell` nav/header to match.
3. **Tables**: zebra rows + new header style — apply to financial/guests/cleanings tables.
4. **Buttons**: refactor `Button` variants — primary = coral, secondary = outline.
5. **Empty states**: add lightweight illustration + CTA on each module (dashboard, guests, cleanings, financial, calendar, properties).
6. **Skeleton loaders**: replace any spinner usages with `Skeleton` from `ui/skeleton.tsx`.
7. **Micro-animations**: 150–200ms fade+slide on dashboard cards (CSS-only, no extra deps).

## Batch 3 — Dark mode

1. Define `.dark` variants for all tokens above with the palette you specified (bg `#111827`, cards `#1f2937`, text `#f9fafb`/`#9ca3af`, coral `#FF6B6B`, green `#4ade80`, red `#f87171`).
2. Add `ThemeProvider` (system/light/dark) with `localStorage` persistence.
3. Add toggle in `equipe.tsx` / settings area.
4. Audit screens for hardcoded `text-white`/`bg-white` etc. and replace with tokens.

---

## How I suggest we proceed

Tell me which to start with:
- **(A) All 3 batches sequentially in this thread** — I'll start Batch 1 now and ping you between batches. Expect 3 long messages.
- **(B) Just Batch 1 now** (i18n + Airbnb), then you review before I touch visuals.
- **(C) Different priority** — tell me which batch matters most.

My recommendation: **B**. The i18n/Airbnb work is functional and shippable on its own; the visual overhaul is high-risk and you'll want to review tokens before they cascade through every screen.
