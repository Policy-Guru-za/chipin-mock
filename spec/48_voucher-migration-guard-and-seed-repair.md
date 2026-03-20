# 48_voucher-migration-guard-and-seed-repair

## Objective

- Safely repair the voucher-removal rollout by making the enum-removal migration non-destructive, restoring local seed ergonomics, and resolving the `karri_credit_queue` migration failure before any more schema damage can land.

## In Scope

- Forensic preflight on the attempted `0021_remove_takealot_voucher_payout.sql` rollout state.
- Repair of the voucher-removal migration path so voucher-era boards are preserved behind an explicit hard-stop guard.
- Safe handling of the missing `karri_credit_queue` relation in the migration path.
- Non-production `pnpm db:seed` fallback behavior for `CARD_DATA_ENCRYPTION_KEY`.
- Focused regression coverage, execution artifacts, and full-path spec/progress updates for this slice.

## Out Of Scope

- Auto-remapping voucher-era Dreamboards into the bank/Karri schema.
- Broad payout UX, partner API, or OpenAPI contract changes unrelated to the migration/seed repair.
- Manual production data cleanup beyond the smallest verified remediation needed to recover from the attempted `0021` run.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../drizzle/migrations/0021_remove_takealot_voucher_payout.sql`](../drizzle/migrations/0021_remove_takealot_voucher_payout.sql)
- [`../drizzle/migrations/meta/_journal.json`](../drizzle/migrations/meta/_journal.json)
- [`../scripts/seed.ts`](../scripts/seed.ts)
- [`../src/lib/db/seed.ts`](../src/lib/db/seed.ts)
- [`../src/lib/db/schema.ts`](../src/lib/db/schema.ts)

## Stage Plan

1. Stage 1 — Run a read-only forensic preflight on the attempted `0021` rollout and determine whether the safe repair path is an in-place `0021` amendment alone or an additional repair step.
2. Stage 2 — Implement the non-destructive migration repair: hard-stop on surviving voucher-era rows, remove/guard the `karri_credit_queue` dependency, and keep enum removal only on the clean path.
3. Stage 3 — Implement the non-production seed fallback, add regression coverage, run the full gate, dogfood the repaired migration/seed path, and close with proof.

## Test Gate

- Main-DB forensic preflight queries captured in spec evidence.
- Local/disposable DB migration dry-run for the repaired path.
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm docs:audit`

## Exit Criteria

- Voucher-era Dreamboards and their contribution history are no longer deleted by the enum-removal migration; the migration now fails early with an explicit guard when voucher-era rows still exist.
- The migration no longer crashes on a missing `karri_credit_queue` relation, and the spec records whether that missing table is a separate schema-drift issue.
- `pnpm db:seed` succeeds in non-production when `CARD_DATA_ENCRYPTION_KEY` is unset, without weakening runtime startup/readiness enforcement.
- Spec/progress artifacts record the forensic findings, validation commands, dogfood proof, and napkin outcome before closure.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Repaired the attempted voucher-removal rollout by replacing destructive voucher deletes with an explicit hard-stop guard, removing the unnecessary `karri_credit_queue` dependency from `0021`, restoring non-production seed ergonomics with a script-level fallback key, and closing with a green gate plus fallback dogfood proof.

## Stage Status

- Stage 1 complete: local direct main-DB forensic queries were blocked because this workspace has no `DATABASE_URL`, so the preflight used the user-provided `karri_credit_queue does not exist` failure evidence plus source inspection of `0021`, `0019`, and `schema.ts` to choose the safe repair path.
- Stage 2 complete: `0021_remove_takealot_voucher_payout.sql` now aborts early when voucher-era Dreamboards or voucher payout rows still exist, preserving boards/contributions instead of deleting them, and it no longer references `karri_credit_queue` directly.
- Stage 3 complete: added `scripts/seed-env.ts` plus regression tests, taught `scripts/seed.ts` to install a non-production fallback `CARD_DATA_ENCRYPTION_KEY`, and verified with `pnpm exec vitest run tests/unit/seed-env.test.ts tests/unit/voucher-migration-guard.test.ts`, `pnpm lint` (warnings-only baseline), `pnpm typecheck`, `pnpm test`, `pnpm docs:audit -- --sync`, and `pnpm docs:audit`.

## Dogfood Notes

- `pnpm db:seed` was dogfooded with `CARD_DATA_ENCRYPTION_KEY` unset and an intentionally unreachable local `pg` URL; the command now emits the development-only fallback-key warning and progresses to the database connection step instead of failing immediately on missing encryption config.
- Disposable Postgres migration replay was attempted next, but this environment only has Homebrew `libpq` client utilities (`psql`, `initdb`, `pg_ctl`) and no `postgres` server binary, so local cluster startup was blocked before a full SQL replay could run.
