# Progress

## Active Full Specs

- None.

## Quick Tasks

| Task ID | Scope | Owner | Verification | Status | Next Step |
| --- | --- | --- | --- | --- | --- |
| Q-2026-03-19-homepage-stitch-trim | Remove the extra Stitch hero strip and inline payout-band Stitch card on `/`, then rebalance spacing | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-timeline-copy | Update the homepage timeline Step 2 description on `/` to the approved contribution-collection wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-step-copy-correction | Move the approved contribution-collection copy to Step 1 and restore the original Step 2 WhatsApp copy on `/` | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |

## Recently Closed Specs

- `42_homepage-payout-stitch-partnership-rewrite` — Done
- `41_workflow-audit-hardening` — Done
- `40_parallel-active-specs-hybrid-fast-path` — Done

## Last Completed Spec

- `42_homepage-payout-stitch-partnership-rewrite`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 195 markdown files)
- `pnpm exec vitest run tests/unit/landing-below-nav-replica.test.ts tests/unit/copy-matrix-compliance.test.ts` (passed; 27 tests)
- `pnpm lint` (0 errors, 110 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (199 test files, 971 tests passed)

## Dogfood Evidence

- Dogfooded the localhost homepage payout rewrite at `http://127.0.0.1:3000` and captured the new Stitch trust strip in the hero plus the rewritten payout Step 3 and Stitch/Karri payout band in `output/spec42-homepage-hero.png`, `output/spec42-homepage-timeline.png`, and `output/spec42-homepage-payout-band.png`, confirming the live marketing page no longer shows Takealot/voucher messaging.

## Napkin Evidence

- No durable napkin update.
