# Progress

## Active Full Specs

- None.

## Quick Tasks

- None.

## Recently Closed Specs

- `41_workflow-audit-hardening` — Done
- `40_parallel-active-specs-hybrid-fast-path` — Done
- `39_shared-header-top-link-removal` — Done

## Last Completed Spec

- `41_workflow-audit-hardening`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 193 markdown files)
- `pnpm lint` (0 errors, 110 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (199 test files, 970 tests passed)

## Dogfood Evidence

- Dogfooded the hardened workflow end to end by running Spec 41 as a live full-path task with no placeholder spec, keeping the README/review entrypoints napkin-first while AGENTS stayed canonical, proving in regression fixtures that successor references no longer misclassify active specs, and then closing the spec with overview-level `Closed At` metadata so newest-proof ownership is derived independently of `Recently Closed Specs` wording.

## Napkin Evidence

- See [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) for the 2026-03-18 note about parsing only the primary recently-closed spec entry and using overview-level `Closed At` metadata for independent closure ordering.
