# Progress

## Active Full Specs

- None.

## Quick Tasks

| Task ID | Scope | Owner | Verification | Status | Next Step |
| --- | --- | --- | --- | --- | --- |
| Q-2026-03-19-homepage-exact-step-copy | Update the live homepage exact timeline Step 1 copy to the approved payout-option wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-how-it-works-copy | Update the public homepage how-it-works Step 1 copy to the approved payout-option wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-stitch-trim | Remove the extra Stitch hero strip and inline payout-band Stitch card on `/`, then rebalance spacing | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-timeline-copy | Update the homepage timeline Step 2 description on `/` to the approved contribution-collection wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-step-copy-correction | Move the approved contribution-collection copy to Step 1 and restore the original Step 2 WhatsApp copy on `/` | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |

## Recently Closed Specs

- `43_public-landing-responsiveness-audit` — Done
- `42_homepage-payout-stitch-partnership-rewrite` — Done
- `41_workflow-audit-hardening` — Done
- `40_parallel-active-specs-hybrid-fast-path` — Done

## Last Completed Spec

- `43_public-landing-responsiveness-audit`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 196 markdown files)
- `pnpm docs:audit` (passed; 196 markdown files)

## Dogfood Evidence

- Dogfooded the public localhost surfaces across desktop, iPad, and mobile form factors, capturing evidence under `output/spec43-responsive/`. Confirmed the marketing landing and Clerk auth entry routes stay visually stable with no horizontal overflow, then confirmed the main guest public routes are currently blocked by a runtime `DATABASE_URL is not set` failure because `/maya-birthday-demo` and `/maya-birthday-demo/contribute` both render the shared guest error boundary instead of real Dreamboard content.

## Napkin Evidence

- Updated `docs/napkin/napkin.md` with a 2026-03-19 audit note: check the browser console on the first DB-backed guest page before treating the guest error boundary as the real route layout.
