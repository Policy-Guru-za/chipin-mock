# Phase B - B1 API Contract Normalization Evidence

Timestamp (UTC): 2026-02-07T14:43:30Z

## Scope Executed

Read order completed as requested:
1. `docs/napkin/napkin.md`
2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_EXECUTION_PLAN.md`
4. `docs/implementation-docs/GIFTA_UX_V2_API_CONTRACT_PARITY_SPEC.md`
5. `src/lib/ux-v2/decision-locks.ts`

Implemented B1 normalization only (no B2/B4/B6 runtime enablement):
- OpenAPI enum/schema parity updates in `src/lib/api/openapi.ts`
- Dreamboard request/response contract expansion:
  - `src/app/api/v1/dream-boards/route.ts`
  - `src/app/api/v1/dream-boards/[id]/route.ts`
  - `src/lib/api/dream-boards.ts`
  - `src/lib/db/api-queries.ts`
  - `src/lib/db/queries.ts`
- Contribution contract expansion (`charity_cents`):
  - `src/lib/api/contributions.ts`
  - `src/lib/db/api-queries.ts`
- Payout contract expansion (`type` parity + `charity_cents` and recipient fields):
  - `src/app/api/v1/payouts/pending/route.ts`
  - `src/lib/api/payouts.ts`
  - `src/lib/db/api-queries.ts`
- Error taxonomy alignment (`unsupported_operation`) in `src/lib/api/response.ts`
- Contract tests updated:
  - `tests/unit/openapi-spec.test.ts`
  - `tests/integration/api-dream-boards-list-create.test.ts`
  - `tests/integration/api-dream-boards-update.test.ts`
  - `tests/integration/api-payouts.test.ts`
  - `tests/integration/api-contributions.test.ts`

## Decision/Register Contract Cross-Check (B1-relevant)

| Decision | Locked Value | Runtime | OpenAPI | Result |
|---|---|---|---|---|
| D-001 | payout_method = `karri_card`,`bank` | `z.enum(LOCKED_PAYOUT_METHODS)` in Dreamboard create/update routes | `PayoutMethod.enum = LOCKED_PAYOUT_METHODS` | PASS |
| D-002 | payout_type = `karri_card`,`bank`,`charity` | `z.enum(LOCKED_PAYOUT_TYPES)` in payouts pending route | `PayoutType.enum = LOCKED_PAYOUT_TYPES` | PASS |
| D-003 | charity_split_type = `percentage`,`threshold` | `z.enum(LOCKED_CHARITY_SPLIT_MODES)` in Dreamboard create/update routes | `CharitySplitType.enum = LOCKED_CHARITY_SPLIT_MODES` | PASS |
| D-006 | bank/charity writes gated by phase policy | Create/update return `unsupported_operation` (422) for gated payout/charity mutation payloads | 422 documented via `UnsupportedOperationError` response | PASS (phase-appropriate gating) |

## Error Taxonomy Alignment

- Added/normalized public API error code support for `unsupported_operation`.
- Preserved validation behavior for incomplete charity payloads (`validation_error`), including all-or-nothing charity config rules.
- OpenAPI `ApiError.code` now includes required B1 additions for parity docs: `unsupported_operation` and `invalid_reminder_window`.

## Contract/Shape Parity Highlights

- Dreamboard OpenAPI and runtime now include bank + charity fields in create/update request schemas and in response serialization.
- Dreamboard PATCH is now documented in OpenAPI (`/dream-boards/{id}`) with request shape and 422 unsupported-operation response.
- Contribution responses expose `charity_cents` (nullable) in runtime and OpenAPI.
- Payout responses/filters support full payout type enum set in runtime and OpenAPI.

## Deprecation Notes (P1)

Documented in OpenAPI schema descriptions:
- `PayoutMethod`: legacy karri-only enum assumptions are deprecated; clients must handle `bank`.
- `PayoutType`: legacy karri-only enum assumptions are deprecated; clients must handle `bank` and `charity`.

## Command Gates

| Gate | Result | Notes |
|---|---|---|
| `pnpm openapi:generate` | PASS | required sandbox escalation (tsx IPC pipe EPERM in sandbox) |
| `pnpm test tests/unit/openapi-spec.test.ts` | PASS | 3 tests passed |
| `pnpm lint` | PASS | 0 errors, warnings only |
| `pnpm typecheck` | PASS | no TS errors |
| `pnpm test` | PASS | 93 files, 345 tests passed |

## B1 Acceptance Assessment

- P0: PASS - runtime and OpenAPI enums are identical and bound to `decision-locks.ts`
- P0: PASS - contract test suite green (`openapi-spec` + full test gate)
- P1: PASS - deprecation notes documented in OpenAPI enum descriptions
- P2: PASS - no additional polish blockers discovered for B1

## Stop/Proceed Decision

B1 is fully green per milestone criteria. Ready for B2 when explicitly requested.
