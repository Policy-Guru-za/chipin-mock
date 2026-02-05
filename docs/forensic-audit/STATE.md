# Forensic Audit State (compaction-safe)

Last updated: 2026-02-05

Purpose: single source of truth for the ongoing “forensic + docs drift” review. After any Codex “compact conversation”, resume by re-opening this file and continuing from **Next actions**.

## Resume protocol (after compaction)

1) Open `docs/forensic-audit/STATE.md`
2) Continue from **Next actions**
3) Use **Findings register** IDs when discussing changes
4) Update “Last updated” + statuses as work completes

## Progress

- ✅ Repo structure + config inventory (broad pass)
- ✅ Runtime flows + route inventory (guest/host/admin/partner/internal)
- ✅ Data model + migrations + jobs/integrations (broad pass)
- ✅ Security/ops/observability/test posture (broad pass)
- ⏳ Docs vs code drift matrix (in progress)
- ⏳ Final forensic report (pending)

## Known key code locations (fast resume)

- Guest pages:
  - `src/app/(guest)/[slug]/page.tsx`
  - `src/app/(guest)/[slug]/contribute/page.tsx`
  - `src/app/(guest)/[slug]/thanks/page.tsx`
  - `src/app/(guest)/[slug]/payment-failed/page.tsx`
- Contribution create + fee calc:
  - `src/app/api/internal/contributions/create/route.ts`
  - `src/lib/payments/fees.ts`
  - `src/components/forms/ContributionFormParts.tsx`
- Provider webhooks + partner webhook dispatch:
  - `src/app/api/webhooks/payfast/route.ts`
  - `src/app/api/webhooks/ozow/route.ts`
  - `src/app/api/webhooks/snapscan/route.ts`
  - `src/lib/webhooks/dispatcher.ts`
  - `src/lib/webhooks/types.ts`
- Partner API pot close:
  - `src/app/api/v1/dream-boards/[id]/close/route.ts`
- Payouts + Karri:
  - `src/lib/payouts/service.ts`
  - `src/lib/payouts/queries.ts`
  - `src/lib/integrations/karri-batch.ts`
- DB + views:
  - `src/lib/db/schema.ts`
  - `drizzle/migrations/*` (notably view definitions)
- Auth / middleware:
  - `middleware.ts`
  - `src/lib/auth/*` (Clerk integration points)

## Findings register (status: needs-confirmation | confirmed)

| ID | Status | Area | Summary | Evidence pointers | Doc impact |
|---:|:--|:--|:--|:--|:--|
| F-001 | confirmed | Guest UX | Guest pages display ZAR amounts; docs claim “% only” | guest page shows `formatZar(view.raisedCents) of formatZar(view.goalCents)` | CANONICAL/SPEC/JOURNEYS/UX/README |
| F-002 | confirmed | Lifecycle | “Auto-close on party date” asserted in docs; repo has no auto-close job | only explicit close is partner API `POST /api/v1/dream-boards/[id]/close` | CANONICAL/SPEC/JOURNEYS/ARCHITECTURE |
| F-003 | confirmed | Webhooks | Event catalog supports many events; runtime emits only `contribution.received` + `pot.funded` | payfast/ozow/snapscan webhooks emit these only | API/INTEGRATIONS/ARCHITECTURE |
| F-004 | confirmed | Karri batch | `pending` result resets attempts counter (likely infinite retries) | `markQueuePending(entry.id, entry.attempts)` after increment | KARRI/runbooks |
| F-005 | confirmed | Payments | Fee semantics inconsistent: checkout charges `amount + fee` but `net_cents = amount - fee` and “raised” sums `net_cents` | `fees.ts`, contribution create route, `schema.ts` + queries | PAYMENTS/DATA/UX/JOURNEYS |
| F-006 | confirmed | Seed | Seed inserts raw card number (should be encrypted) + wrong webhook event type/payload shape | `seed.ts` uses `karriCardNumber: '5234...'`, eventType `dream_board.created` | demo/reset docs |
| F-007 | confirmed | Branding | App metadata is “Gifta”; many docs still “ChipIn” | `src/app/layout.tsx` metadata title/OG | README/CANONICAL/UX/API |

## Evidence anchors (line refs)

- F-001:
  - `src/app/(guest)/[slug]/page.tsx` (GoalProgressCard): line 68
  - `src/app/(guest)/[slug]/thanks/page.tsx` (progress summary): line 49
- F-002:
  - `src/app/api/v1/dream-boards/[id]/close/route.ts`: close request reason includes `party_date_reached`; status change is API-triggered only.
  - `src/lib/db/schema.ts`: `partyDate` comment “serves as pot close date”; no matching scheduler in repo.
- F-003:
  - `src/lib/webhooks/types.ts`: catalog includes `dreamboard.*`, `pot.closed`, `payout.*`.
  - `src/app/api/webhooks/payfast/route.ts`: emits `contribution.received` + `pot.funded` only (same for ozow/snapscan).
- F-004:
  - `src/lib/integrations/karri-batch.ts`: lines 126–129 reset attempts on `pending`.
- F-005:
  - `src/lib/payments/fees.ts`: total = amount + fee.
  - `src/app/api/internal/contributions/create/route.ts`: `feeCents = total - contribution`.
  - `src/lib/db/schema.ts`: `net_cents = amount - fee`.
  - `src/lib/db/queries.ts`: `raised_cents = SUM(contributions.netCents)`.
- F-006:
  - `src/lib/db/seed.ts`: raw card numbers + eventType `dream_board.created`.
- F-007:
  - `src/app/layout.tsx`: metadata title “Gifta…”, OG `gifta.co.za`, `og-image.png`.

## Clarifications needed (blocking correctness)

1) Guest privacy: should guests see exact `raised/goal` ZAR amounts, or only % funded?
2) Pot closure: should pots auto-close on `party_date` (and via what scheduler), or stay manual/partner-triggered?
3) Fee semantics: is the platform fee an add-on (payer pays amount+fee) or deducted from contribution/payout? (This defines `net_cents`, “raised”, and payout totals.)

## Next actions (do these, in order)

1) Confirm F-001..F-007 with direct file quotes/line refs and mark `confirmed`.
2) Produce `docs/forensic-audit/DOC-DRIFT.md`:
   - For every tracked doc (`git ls-files '*.md'`), mark: Update required yes/no.
   - For each “yes”: exact mismatched claims + precise change list.
3) Produce `docs/forensic-audit/REPORT.md`:
   - Multi-section architecture overview (routes, data model, payments, webhooks, payouts, jobs, auth, ops).
   - Risk register + prioritized remediation plan.
