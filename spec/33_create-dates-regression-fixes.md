# 33_create-dates-regression-fixes

## Objective

- Fix the two create-dates regressions from Spec 32: preserve valid pre-birthday campaign close dates in the form, and keep slash-date tolerance scoped to the host create flow instead of shared/API date parsing.

## In Scope

- Restore the create/dates form to the current runtime contract for campaign close dates.
- Narrow `DD/MM/YYYY` normalization to the host create flow only.
- Add focused regression coverage for the form, create action, shared date utils, and API boundary.
- Update [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md) for this session.

## Out Of Scope

- Changing the underlying create-flow business rules beyond restoring the existing contract.
- Broad dashboard/edit modal or public API behavior changes unrelated to the two reviewed regressions.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- `../src/app/(host)/create/dates/DatesForm.tsx`
- `../src/app/(host)/create/dates/actions.ts`
- `../src/lib/utils/date.ts`
- `../src/app/api/v1/dream-boards/route.ts`
- `../tests/unit/create-step-dates.test.ts`
- `../tests/unit/dates-form.test.tsx`
- `../tests/unit/date-utils.test.ts`
- `../tests/integration/api-dream-boards-list-create.test.ts`

## Stage Plan

1. Stage 1 — Restore the create/dates form’s campaign-close behavior so valid pre-birthday close dates are preserved while party-date ordering remains enforced.
2. Stage 2 — Re-scope slash-date normalization to a create-flow-local helper and restore the shared ISO-only date contract.
3. Stage 3 — Add regressions, run the full gate, dogfood the create/dates flow if possible, and close the session artifacts cleanly.

## Test Gate

- `pnpm exec vitest run tests/unit/create-step-dates.test.ts tests/unit/dates-form.test.tsx tests/unit/date-utils.test.ts tests/integration/api-dream-boards-list-create.test.ts`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Localhost dogfood of `/create/dates` if authenticated host access is available.

## Exit Criteria

- Valid future campaign close dates earlier than the birthday remain editable in the create/dates form as long as they stay on/before the party date.
- Same-day birthday/party validation stays fixed without teaching shared/API date parsing to accept slash-formatted strings.
- Public/API persistence paths remain ISO-only for date-only strings.
- Regression coverage protects both fixes and the full verification gate is green.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Restored the create/dates form to preserve valid future campaign-close dates before the birthday as long as they stay on/before the party date, moved slash-date tolerance into a create-flow-local normalizer used only by the host dates action, restored shared/API date helpers to ISO-only parsing, and added regression coverage for the form contract, create action, preview safety, and public API boundary. Full verification passed; localhost CLI probing still reached only the unauthenticated loading shell for `/create/dates`, so live submit dogfood remained blocked and the focused regressions plus full green gate serve as fallback proof.
