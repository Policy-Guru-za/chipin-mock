# Progress

## Active Full Specs

| Spec | Title | Owner | Stage | Status | Blockers | Next Step | Last Updated |
| --- | --- | --- | --- | --- | --- | --- | --- |

No active full specs.

## Quick Tasks

| Task ID | Scope | Owner | Verification | Status | Next Step |
| --- | --- | --- | --- | --- | --- |
| Q-2026-03-19-homepage-social-metadata-hardening | Harden homepage social metadata with generated OG/Twitter images and align Dreamboard metadata to the Gifta sharing contract | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage metadata/image fetches, Dreamboard metadata unit coverage | Completed | Done |
| Q-2026-03-19-authoritative-payment-doc-sync | Sync Tier 1 payment docs with the Stitch-placeholder runtime and remove stale PayFast/Ozow/SnapScan references from authoritative guidance | Codex | `pnpm docs:audit -- --sync`, `pnpm docs:audit` | Completed | Done |
| Q-2026-03-19-homepage-exact-step-copy | Update the live homepage exact timeline Step 1 copy to the approved payout-option wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-how-it-works-copy | Update the public homepage how-it-works Step 1 copy to the approved payout-option wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-stitch-trim | Remove the extra Stitch hero strip and inline payout-band Stitch card on `/`, then rebalance spacing | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-timeline-copy | Update the homepage timeline Step 2 description on `/` to the approved contribution-collection wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-step-copy-correction | Move the approved contribution-collection copy to Step 1 and restore the original Step 2 WhatsApp copy on `/` | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-mobile-card-motion | Remove the landing hero and payout-card tilt/float motion on mobile-width viewports while keeping desktop and iPad behavior unchanged | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost landing screenshot dogfood at desktop, iPad, and mobile widths | Completed | Done |
| Q-2026-03-19-homepage-payout-copy-tweaks | Apply the requested final payout/Karri wording refinements and payout-band chip removal across the live landing timeline and payout band | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |

## Recently Closed Specs

- `45_payment-docs-and-voucher-removal-sync` — Done
- `44_www-host-stitch-placeholder-payment-hard-removal` — Done
- `43_public-landing-responsiveness-audit` — Done
- `42_homepage-payout-stitch-partnership-rewrite` — Done
- `41_workflow-audit-hardening` — Done

## Last Completed Spec

- `45_payment-docs-and-voucher-removal-sync`

## Last Green Commands

- `pnpm docs:audit -- --sync` (passed; 198 markdown files)
- `pnpm docs:audit` (passed; 198 markdown files)

## Dogfood Evidence

- Dogfooded the docs sync after `pnpm docs:audit -- --sync` by tracing the updated reference chain across `README.md`, `docs/Platform-Spec-Docs/CANONICAL.md`, `docs/Demo-Mode/demo-mode-brief.md`, one superseded voucher-era spec (`spec/08_dreamboard-create-voucher-flow.md`), and `BACKLOG.md`. Confirmed current docs now describe the Stitch-coming-soon guest placeholder plus bank/optional Karri payout truth, while legacy payment/voucher docs are explicitly marked as historical or reference-only.

## Napkin Evidence

No durable napkin update.
