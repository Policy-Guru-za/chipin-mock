# Progress

## Current Spec

- `35_session-placeholder`

## Current Stage

- Awaiting the next session topic

## Status

- Closed [`spec/34_homepage-footer-voucher-partner-pill-removal.md`](./spec/34_homepage-footer-voucher-partner-pill-removal.md) as done and activated [`spec/35_session-placeholder.md`](./spec/35_session-placeholder.md).
- Removed the footer voucher-partner pill from the exact landing footer and pruned the now-unused partner image/styles.
- Tightened the remaining footer spacing, updated the landing regression coverage, and preserved the upstream voucher-band partner messaging.

## Blockers

- None.

## Next Step

- Rename [`spec/35_session-placeholder.md`](./spec/35_session-placeholder.md) in place when the next session topic is known.

## Last Session Spec

- `34_homepage-footer-voucher-partner-pill-removal`

## Last Completed Spec

- `34_homepage-footer-voucher-partner-pill-removal`

## Last Green Commands

- `pnpm exec vitest run tests/unit/landing-below-nav-replica.test.ts` (passed; 1 file, 12 tests)
- `pnpm docs:audit -- --sync` (passed; 188 markdown files)
- `pnpm docs:audit` (passed; 188 markdown files)
- `pnpm lint` (0 errors, 108 warnings)
- `pnpm typecheck` (clean)
- `pnpm test` (198 test files, 960 tests passed)

## Dogfood Evidence

- Live localhost dogfood succeeded on the already-running marketing server at `http://localhost:3000`: `agent-browser open http://localhost:3000 && agent-browser set viewport 1920 929 && agent-browser wait --load networkidle && agent-browser eval 'window.scrollTo(0, document.body.scrollHeight)' && agent-browser wait 1000 && agent-browser screenshot output/spec34-footer-no-partner-pill-bottom.png --annotate && agent-browser close` captured the footer viewport and confirmed the voucher-partner pill is gone while the remaining footer blocks stay balanced; the upstream voucher band still carries the official partner callout.
- Screenshot proof for Spec 34 is saved at [`output/spec34-footer-no-partner-pill-bottom.png`](./output/spec34-footer-no-partner-pill-bottom.png).
- Focused regression proof: `pnpm exec vitest run tests/unit/landing-below-nav-replica.test.ts` passed after the runtime update and now locks the no-pill footer contract plus the tightened footer spacing rules.
- Full gate proof: docs audit sync, docs audit, lint, typecheck, and the full test suite all passed after the footer cleanup and final artifact sync.

## Napkin Evidence

- Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with Spec 34 learning: when a marketing partnership already has a dedicated upstream section, remove redundant footer pills and rebalance the footer rhythm instead of repeating the claim again in the closing footer.
