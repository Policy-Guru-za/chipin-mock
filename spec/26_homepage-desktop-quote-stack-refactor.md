# 26_homepage-desktop-quote-stack-refactor

## Objective

- Refactor the desktop homepage hero composition so the testimonial and CTA sit directly beneath the funded-this-year chip with a tighter, more elegant left-column narrative stack while preserving the current mobile flow.

## In Scope

- Desktop-only homepage hero layout changes in `src/components/landing-exact/LandingHeroExact.tsx` and `src/components/landing-exact/LandingHeroExact.module.css` needed to move the quote/attribution/CTA higher beneath the funded chip.
- Any small supporting homepage-hero structural extraction needed to keep the desktop composition explicit while preserving the existing mobile order and copy.
- Focused regression coverage for the desktop-only quote-stack contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Mobile/tablet layout changes beyond what is strictly required to preserve the existing flow.
- Nav seam token changes, font-token changes, or Agentation overlay changes.
- Timeline, voucher band, footer, or other non-hero homepage sections.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`../docs/DOCUMENT_CONTROL_MATRIX.md`](../docs/DOCUMENT_CONTROL_MATRIX.md)
- Current landing hero runtime in `../src/components/landing-exact/LandingHeroExact.tsx` and `../src/components/landing-exact/LandingHeroExact.module.css`
- Landing regression coverage in `../tests/unit/landing-below-nav-replica.test.ts`
- Live localhost homepage currently reachable at `http://localhost:3000` for desktop dogfood

## Stage Plan

1. Stage 1 — Replace the current desktop-separated lower hero beats with an explicit desktop quote-stack composition that puts testimonial + CTA beneath the funded chip.
2. Stage 2 — Preserve the current mobile flow while wiring focused regression coverage for the desktop-only composition contract.
3. Stage 3 — Run the verification gate, dogfood the desktop homepage layout against localhost, and hand off into `27_session-placeholder`.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Manual desktop localhost screenshot dogfood of `/` focused on the funded-chip -> testimonial -> CTA relationship.

## Exit Criteria

- On desktop only, the testimonial and CTA sit substantially higher and read as part of the left hero narrative directly beneath the funded chip.
- The large dead space between the funded chip and the quote/CTA is removed without reintroducing a visible strip beneath the nav.
- Mobile/tablet flow remains intact.
- Focused regression coverage locks the desktop-only quote-stack contract.
- `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` are green.
- Dogfood evidence records live desktop homepage verification or an explicit environment block with safe fallback proof.
- Session-close napkin handling is recorded in [`../progress.md`](../progress.md).

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Refactored the desktop homepage hero so the testimonial and CTA now live in an explicit left narrative rail directly beneath the funded-this-year chip, while a matching desktop contributors block sits beneath the dreamboard card on the right. The existing mobile flow remains intact through the retained mobile-only village/CTA sections, and focused regression coverage now locks the desktop-only quote-stack contract. Live localhost screenshot dogfood at `1440x1200` confirmed the requested tighter composition (`output/spec26-homepage-desktop-annotated.png`).
