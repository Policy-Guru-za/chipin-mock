# Phase B - B0 Baseline and Freeze Evidence

Timestamp (UTC): 2026-02-07T13:56:32Z

## Scope Executed

- Read order completed exactly as requested:
  1. `docs/napkin/SKILL.md`
  2. `AGENTS.md`
  3. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  4. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  5. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_EXECUTION_PLAN.md`
- Created evidence folder: `docs/implementation-docs/evidence/ux-v2/phase-b/`
- Ran required gate chain: `pnpm lint && pnpm typecheck && pnpm test`

## Phase A Completion Verification (Schema + Artifacts)

### Artifact chain presence

- PASS `docs/implementation-docs/GIFTA_UX_V2_DB_ROLLOUT_RUNBOOK.md`
- PASS `docs/implementation-docs/GIFTA_UX_V2_GO_NO_GO_TEMPLATE.md`
- PASS `docs/implementation-docs/GIFTA_UX_V2_PROD_ROLLOUT_CHECKLIST.md`
- PASS `drizzle/migrations/0012_expand_ux_data_model.sql`
- PASS `drizzle/migrations/meta/_journal.json`
- PASS journal contains migration tag `0012_expand_ux_data_model` (`drizzle/migrations/meta/_journal.json:93`)

### Required schema objects/enums from Phase A migration

- PASS `payout_method` includes `bank` migration op (`drizzle/migrations/0012_expand_ux_data_model.sql:10`)
- PASS `payout_type` includes `charity` migration op (`drizzle/migrations/0012_expand_ux_data_model.sql:12`)
- PASS `charity_split_type` enum creation (`drizzle/migrations/0012_expand_ux_data_model.sql:18`)
- PASS `charities` table creation (`drizzle/migrations/0012_expand_ux_data_model.sql:27`)
- PASS `contribution_reminders` table creation (`drizzle/migrations/0012_expand_ux_data_model.sql:157`)

## Decision Register Lock Cross-Check (D-001 to D-010)

| ID | Status | Evidence |
|---|---|---|
| D-001 payout method enum (`karri_card`,`bank`) | PASS | `src/lib/db/schema.ts:29`, `src/app/api/v1/dream-boards/route.ts:44` |
| D-002 payout type enum (`karri_card`,`bank`,`charity`) | PARTIAL | DB enum matches (`src/lib/db/schema.ts:50`) but OpenAPI still `karri_card` only (`src/lib/api/openapi.ts:1254`) |
| D-003 charity split modes (`percentage`,`threshold`) | PASS | `src/lib/db/schema.ts:31`, `src/app/api/v1/dream-boards/route.ts:57` |
| D-004 fee semantics (gift amount + fee on top; raised tracks gift amount) | FAIL | Contribution create uses `total=amount+fee` (`src/app/api/internal/contributions/create/route.ts:92-93`) but `net_cents=amount-fee` (`src/lib/db/schema.ts:252`) |
| D-005 funded semantics (`raised_cents` toward goal; funded when raised>=goal) | FAIL | `raised_cents` sums `netCents` (`src/lib/db/queries.ts:411`), funded transition uses this value (`src/lib/db/queries.ts:427`) |
| D-006 write-path policy lock (bank+charity writes only after B4 parity gates) | FAIL | No bank/charity write toggle in feature flags (`src/lib/config/feature-flags.ts:38-49`); API write-path currently accepts bank/charity payloads (`src/app/api/v1/dream-boards/route.ts:349-394`) |
| D-007 reminder SLA (max 14d + idempotent dedupe + retries) | PARTIAL | max 14 days enforced (`src/app/api/internal/contributions/reminders/route.ts:15`), idempotent dedupe via conflict target (`src/app/api/internal/contributions/reminders/route.ts:103-109`), but no reminder dispatch/retry pipeline found in runtime paths |
| D-008 monthly charity payout cadence + per-charity reconciliation report | FAIL | Payout readiness still Karri-only expected type (`src/lib/payouts/queries.ts:77`); no monthly charity payout batch/reconciliation implementation found |
| D-009 branding string `Gifta` primary | PARTIAL | `Gifta` is present in metadata (`src/app/layout.tsx:46`), but legacy `chipin` strings remain (`package.json:2`, `src/lib/api/openapi.ts:12`, `public/v1/openapi.json:10`) |
| D-010 WCAG 2.1 AA baseline | PARTIAL | Requirement present in docs (`docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md:24`), but no automated accessibility gate in scripts (`package.json:5-25`) |

## Required Command Gates (B0 run)

Command:

```bash
pnpm lint && pnpm typecheck && pnpm test
```

Observed result:

- FAIL at first gate (`pnpm lint`): `eslint: command not found`
- Attempted remediation: `pnpm install`
- Remediation failed due network/DNS restriction: `getaddrinfo ENOTFOUND registry.npmjs.org`
- Because lint failed, `typecheck` and `test` did not execute in chained run

## B0 Acceptance Status

- `P0` FAIL
  - Required gate chain not green (`lint` fails in this environment)
  - Decision-critical financial semantics (D-004/D-005) still drift from locked values
- `P1` FAIL
  - Decision register cross-check completed, but D-002/D-006/D-007/D-008/D-009/D-010 are not fully reflected
- `P2` PASS
  - Backlog triaged with Phase B step IDs for detected drifts (see `BACKLOG.md` updates from this B0 run)

## Stop Condition

B0 is not fully green. Do **not** proceed to B1.
