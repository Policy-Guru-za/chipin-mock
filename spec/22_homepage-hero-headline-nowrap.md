# 22_homepage-hero-headline-nowrap

## Objective

- Restore the homepage hero headline contract so both intended headline lines stay on one line at the approved desktop-wide comparison range without clipping or overflow, while preserving the reviewed design feel.

## In Scope

- Homepage hero layout and typography changes in `src/components/landing-exact/LandingHeroExact.module.css` needed to guarantee a wider desktop text track and prevent internal headline wrapping.
- Any small supporting homepage-hero structural updates that keep the existing reviewed content and component boundaries intact.
- Focused regression coverage for the desktop hero headline contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Broad homepage redesign outside the hero headline width fix.
- Copy, asset, or motion changes unrelated to the headline wrapping issue.
- Changes to auth behavior, top-nav behavior, or non-hero landing sections unless strictly required by the fix.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Active homepage hero runtime in `../src/components/landing-exact/LandingHeroExact.tsx` and `../src/components/landing-exact/LandingHeroExact.module.css`
- Landing regression coverage in `../tests/unit/landing-below-nav-replica.test.ts`
- Reviewed design references from the attached screenshots plus the prototype source in `../tmp/gifta-react/src/styles.css`

## Stage Plan

1. Stage 1 — Replace the current desktop hero equal-column squeeze with a layout contract that guarantees enough headline width for the design target.
2. Stage 2 — Add the desktop headline no-wrap protection and focused regression coverage, then reconcile any supporting font-size/gap behavior needed to avoid overflow.
3. Stage 3 — Run the verification gate, dogfood the homepage hero at the relevant desktop width, and hand off into `23_session-placeholder`.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual dogfood of `/` focused on the hero headline at desktop-wide viewport, or explicit fallback evidence if local auth middleware blocks in-app verification.

## Exit Criteria

- The homepage hero guarantees enough desktop text width for `One dream gift.` and `Everyone chips in.` to stay on one line in the approved comparison range.
- The desktop hero headline contract is explicit in code rather than accidental width luck.
- Focused regression coverage locks the desktop no-wrap hero behavior.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records live homepage hero verification or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Replaced the desktop hero equal-column squeeze with a wider explicit text/card split, added desktop-only headline no-wrap protection plus a single-column fallback below the desktop threshold, and locked the behavior with focused regression coverage. Live localhost hero dogfood remained blocked because the local app still returned `503 Authentication unavailable` without Clerk keys, so the session records that blocker and uses source-level contract verification plus the green regression/full-suite evidence as fallback proof.
