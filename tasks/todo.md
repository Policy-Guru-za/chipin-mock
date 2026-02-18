# Task Todo

## Plan
- [x] Fix draft persistence unmount flush in `useDraftPersistence`.
- [x] Fix inline error id uniqueness in `WizardInlineError`.
- [x] Run gate checks (`pnpm lint`, `pnpm typecheck`, `pnpm test`).
- [x] Add review notes.

## Review
- Implemented cleanup flush for pending debounced draft writes before unmount timer clear.
- Added unique scope support for inline error IDs (`idScope` + `useId()` fallback) to avoid duplicate DOM ids.
- Verification: `pnpm lint` (warnings-only, no errors), `pnpm typecheck` (pass), `pnpm test` (168 files, 752 tests passed).
