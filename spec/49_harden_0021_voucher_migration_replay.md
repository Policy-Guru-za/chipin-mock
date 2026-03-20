# 49_harden_0021_voucher_migration_replay

## Objective

- Harden `0021_remove_takealot_voucher_payout.sql` so remaining environments can apply the voucher-enum cleanup without tripping on enum-type comparison drift, dependent view locking, or pre-cast constraint binding.

## In Scope

- `drizzle/migrations/0021_remove_takealot_voucher_payout.sql`
- Focused regression coverage for the migration SQL contract
- Full-path spec/progress/napkin updates required for this follow-up

## Out Of Scope

- Manual remediation for the already-recovered main DB
- New payout runtime, API, or UI behavior changes
- Additional database docs unless runtime/source truth changes require them

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../drizzle/migrations/0021_remove_takealot_voucher_payout.sql`](../drizzle/migrations/0021_remove_takealot_voucher_payout.sql)
- [`../drizzle/migrations/0010_update_db_views.sql`](../drizzle/migrations/0010_update_db_views.sql)
- [`../tests/unit/voucher-migration-guard.test.ts`](../tests/unit/voucher-migration-guard.test.ts)

## Stage Plan

1. Stage 1 — Patch `0021` so the voucher guard casts enum values via `::text`, the dependent totals view is dropped/recreated around the enum cast, and the payout-data check constraint is recreated only after the new enum type is in place.
2. Stage 2 — Expand migration regression coverage to lock those sequencing rules and prevent regression.
3. Stage 3 — Run the gate, update the execution artifacts, and close with proof.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`

## Exit Criteria

- `0021` no longer compares old/new enum values directly in its voucher guard.
- `0021` drops/recreates `dream_boards_with_totals` around the `dream_boards.payout_method` enum cast.
- `valid_dream_board_payout_data` is recreated after `dream_boards.payout_method` has been cast to the new enum type.
- Regression coverage and execution artifacts prove the hardened sequencing before the spec is marked done.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Follow-up hardening for the voucher-enum removal migration after live Neon replay exposed remaining enum/view/constraint sequencing faults. `0021` now compares voucher rows via `::text`, drops/recreates `dream_boards_with_totals`, and only restores `valid_dream_board_payout_data` after the new enum cast is complete.

## Stage Status

- Stage 1 complete: patched `0021_remove_takealot_voucher_payout.sql` so its voucher guard casts enum-backed columns through `::text`, drops `dream_boards_with_totals` before the `dream_boards.payout_method` enum rebuild, and recreates the totals view at the end.
- Stage 2 complete: moved `valid_dream_board_payout_data` recreation to after the `dream_boards.payout_method` cast and strengthened `tests/unit/voucher-migration-guard.test.ts` to lock the guard casts, view ordering, constraint sequencing, and explicit text-based casts for both enum columns.
- Stage 3 complete: verified with `pnpm exec vitest run tests/unit/voucher-migration-guard.test.ts`, `pnpm lint` (warnings-only baseline), `pnpm typecheck`, `pnpm test`, `pnpm docs:audit -- --sync`, and `pnpm docs:audit`.

## Dogfood Notes

- Live Neon replay on the main DB had already been manually recovered before this repo hardening slice, so rerunning `0021` there would have been both unnecessary and unsafe.
- Fallback dogfood for this follow-up came from the exact live failure transcripts (`cannot alter type of a column used by a view or rule` and `operator does not exist: payout_method = payout_method_old`) plus the new source-level regression checks that now encode the required sequencing directly.
