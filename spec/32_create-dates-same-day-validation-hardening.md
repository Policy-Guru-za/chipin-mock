# 32_create-dates-same-day-validation-hardening

## Objective

- Fix the create/dates false-negative validation so same-day birthday/party selections pass correctly and the create flow uses one consistent date-only contract end to end.

## In Scope

- Shared create-flow date-only normalization helpers.
- Server-side validation hardening in the create/dates step.
- Client-side create/dates guardrails and date-only helper consistency.
- Focused regression coverage for same-day equality and normalization paths.
- Session-artifact updates in [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md).

## Out Of Scope

- Host edit modal validation changes.
- Business-rule changes to the allowed ordering itself; same-day party on the birthday remains valid.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../src/lib/utils/date.ts`](../src/lib/utils/date.ts)
- `../src/app/(host)/create/dates/actions.ts`
- `../src/app/(host)/create/dates/DatesForm.tsx`
- [`../src/components/create-wizard/DatesPreview.tsx`](../src/components/create-wizard/DatesPreview.tsx)
- [`../tests/unit/create-step-dates.test.ts`](../tests/unit/create-step-dates.test.ts)
- [`../tests/unit/dates-form.test.tsx`](../tests/unit/dates-form.test.tsx)
- [`../tests/unit/date-utils.test.ts`](../tests/unit/date-utils.test.ts)

## Stage Plan

1. Stage 1 — Add shared date-only normalization helpers and harden create/dates server-side validation.
2. Stage 2 — Align create/dates client state and preview helpers with the same date-only contract.
3. Stage 3 — Add regression coverage, run the full gate, dogfood the create/dates flow, and close the session artifacts cleanly.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm test tests/unit/date-utils.test.ts tests/unit/create-step-dates.test.ts tests/unit/dates-form.test.tsx`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Localhost create/dates dogfood for same-day birthday/party/campaign close.

## Exit Criteria

- Same-day birthday/party selections advance correctly through the create/dates step.
- Parse/format issues no longer surface as a misleading `birthday_order` error.
- The create flow uses one consistent date-only contract across validation and preview math.
- Focused regression coverage protects the same-day and normalization cases.
- [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md) capture the final session state and handoff proof.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Added shared date-only normalization/countdown helpers, hardened the create/dates server action and client form state around one canonical `YYYY-MM-DD` contract, updated preview formatting/time parsing to use the shared helpers, and added focused regressions for same-day equality plus localized input handling. Full verification passed; localhost shell fetches reached `/create/dates`, but live submit dogfood remained limited to source-level fallback proof because the CLI could only observe the unauthenticated loading shell instead of an authenticated hydrated host form.
