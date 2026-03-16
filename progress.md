# Progress

## Current Spec

- `20_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/19_control-matrix-gap-remediation.md`](./spec/19_control-matrix-gap-remediation.md) as done and activated [`spec/20_session-placeholder.md`](./spec/20_session-placeholder.md).
- Fixed docs-audit scope so transient markdown under `tmp/` and `.reference/` no longer creates control-matrix failures.
- Codified explicit `CLAUDE.md` retirement toward `AGENTS.md`, changed docs audit to report unsupported markdown as actionable policy errors, and added focused regression coverage for the audit helpers.

## Blockers

- None.

## Next Step

- Rename [`spec/20_session-placeholder.md`](./spec/20_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `19_control-matrix-gap-remediation`

## Last Completed Spec

- `19_control-matrix-gap-remediation`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 173 markdown files)
- `pnpm docs:audit` (passed; 173 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (197 test files, 938 tests passed)

## Dogfood Evidence

- Dogfooded the docs-governance flow by regenerating [`docs/DOCUMENT_CONTROL_MATRIX.md`](./docs/DOCUMENT_CONTROL_MATRIX.md) with `pnpm docs:audit -- --sync` and immediately rerunning `pnpm docs:audit` clean (173 markdown files in scope).
- Focused regression proof: `tests/unit/docs-audit.test.ts` verifies `tmp/**` and `.reference/**` are excluded, governed root docs remain classifiable, and `CLAUDE.md` now fails with an explicit retirement message.
- Full gate proof: lint, typecheck, and the full test suite all stayed green after the docs-audit refactor.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 19 learning: keep transient import folders out of docs governance scope and emit explicit retirement errors for unsupported root docs instead of generic unclassified-file throws.
