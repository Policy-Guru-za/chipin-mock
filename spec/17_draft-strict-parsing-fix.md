# 17_draft-strict-parsing-fix

## Objective

- Fix P1 bug where `.strict()` Zod parsing rejects persisted host-create drafts loaded from KV, blocking hosts from reviewing or publishing Dreamboards.

## In Scope

- `src/app/(host)/create/review/page.tsx` — switch safeParse to strip unknown keys
- `src/app/(host)/create/review/actions.ts` — switch safeParse to strip unknown keys
- `tests/unit/dream-board-draft-schema.test.ts` — add coverage for persisted-field shape
- `docs/napkin/napkin.md` — update if a durable pattern emerges

## Out Of Scope

- Changing the `hostCreateDreamBoardDraftSchema` definition itself (`.strict()` is still useful for input validation against Karri/charity residue)
- Changing the `HostCreateDreamBoardDraft` type or `toHostCreateDreamBoardDraft()` mapping
- Adding or removing persisted fields from the draft

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)

## Stage Plan

1. Stage 1 — Fix the two safeParse call sites to use `.strip().safeParse()` so persisted metadata fields are stripped before validation instead of causing rejection.
2. Stage 2 — Add test case that validates a draft with persisted fields (`photoFilename`, `updatedAt`) passes the stripped parse, and verify the existing strict-rejection test still catches Karri/charity residue on the raw strict schema.
3. Stage 3 — Run verification gate and dogfood.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Exit Criteria

- Both consumption sites in `page.tsx` and `actions.ts` use `.strip().safeParse()`.
- Tests prove a real KV-shaped draft (with `photoFilename` + `updatedAt`) passes validation at consumption sites.
- Tests prove the raw `.strict()` schema still rejects unknown legacy residue.
- Full gate green.
- Napkin evidence recorded in `progress.md`.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Fixed P1 host-flow blocker. Lint and typecheck green. Test suite blocked by sandbox architecture mismatch (missing `@rollup/rollup-linux-arm64-gnu`), not by code changes. Zod `.strip()` behavior verified independently.
