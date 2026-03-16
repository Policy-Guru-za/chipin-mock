# 21_landing-nav-seam-alignment

## Objective

- Remove the unintended white-bar effect below the preserved homepage nav by aligning the nav spacer, responsive nav chrome, and first-hero seam spacing to one shared breakpoint contract.

## In Scope

- Homepage landing seam spacing changes in `src/components/landing/` and `src/components/landing-exact/` needed to fix the below-nav gap.
- Responsive nav-spacing alignment so the live app matches the reviewed landing breakpoint behavior around `1100px`, `480px`, and `375px`.
- Focused regression coverage for the landing seam contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Broad redesign of homepage copy, structure, or motion outside the seam-spacing fix.
- Auth/menu behavior changes beyond preserving the existing nav states while aligning their spacing contract.
- Non-homepage layout or global body/background redesigns unless they are strictly required to remove the seam artifact.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Reviewed homepage prototype spacing contract in `../tmp/gifta-react/src/styles.css`
- Active homepage runtime in `../src/components/landing/LandingPage.tsx`, `../src/components/landing/LandingNav.tsx`, and `../src/components/landing-exact/LandingHeroExact.module.css`
- Existing homepage regression coverage in `../tests/unit/landing-below-nav-replica.test.ts`

## Stage Plan

1. Stage 1 — Replace the current hard-coded landing seam spacer/padding drift with one shared landing nav-offset contract that follows the reviewed breakpoint behavior.
2. Stage 2 — Sync the first homepage hero spacing to that contract, then add focused regression coverage for the seam breakpoint rules.
3. Stage 3 — Run the verification gate, dogfood the landing seam behavior at the affected viewport ranges, and hand off into `22_session-placeholder`.

## Test Gate

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual dogfood of `/` focused on the preserved nav seam at desktop/tablet/mobile widths, or explicit fallback evidence if the local app cannot be run in this workspace.

## Exit Criteria

- The homepage no longer applies the oversized desktop nav spacer at widths where the reviewed design still expects the tighter tablet seam.
- Landing nav chrome, spacer, and first-hero seam spacing are driven by one consistent responsive contract.
- Focused regression coverage proves the seam breakpoint contract so the white-bar regression does not return.
- `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records homepage seam verification or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Introduced shared landing chrome spacing tokens so the preserved nav spacer and nav padding follow the reviewed `1100/480` breakpoint contract, wired the first homepage hero height math to that shared nav offset, added focused seam regression coverage, and verified with lint, typecheck, and the full test suite. Live localhost seam dogfood was blocked because the app still returned `503 Authentication unavailable` without Clerk keys, so the session records that blocker plus source-level breakpoint alignment and regression proof as the safe fallback.
