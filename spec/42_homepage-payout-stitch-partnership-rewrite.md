# 42_homepage-payout-stitch-partnership-rewrite

## Objective

- Replace the homepage's voucher-and-retail payout story with a direct-payout narrative centered on secure bank-account and Karri Card delivery, while intentionally elevating Stitch as Gifta's strategic payments partner across the exact landing experience.

## In Scope

- Runtime copy and visual updates in [`../src/components/landing-exact/LandingHeroExact.tsx`](../src/components/landing-exact/LandingHeroExact.tsx), [`../src/components/landing-exact/LandingTimelineExact.tsx`](../src/components/landing-exact/LandingTimelineExact.tsx), and [`../src/components/landing-exact/LandingVoucherBandExact.tsx`](../src/components/landing-exact/LandingVoucherBandExact.tsx).
- Supporting style/token updates in the exact-homepage CSS modules and shared exact-homepage shell needed to remove voucher/Takealot visual language and introduce Stitch + Karri partner lockups.
- Adding the approved Stitch and Karri homepage assets under `public/images/homepage-exact/` and wiring them into the live marketing page.
- Updating directly coupled legacy landing copy in [`../src/components/landing/content.ts`](../src/components/landing/content.ts) so voucher-first messaging cannot regress through older shared landing surfaces.
- Updating focused homepage source-contract tests that assert the old Takealot/voucher story.
- Full verification and public-homepage dogfood of the new payout-partnership narrative.

## Out Of Scope

- Changing the broader create-flow payout product logic, admin payout operations, or API/OpenAPI payout contracts in this spec.
- Reworking the shared nav/footer shell beyond minimal homepage copy or asset assertions directly coupled to the payout-story rewrite.
- Introducing new homepage sections beyond the approved hero trust row, timeline payout proof point, and repurposed payout-partnership band.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- `../src/app/(marketing)/page.tsx`
- [`../src/components/landing/LandingPage.tsx`](../src/components/landing/LandingPage.tsx)
- [`../src/components/landing/content.ts`](../src/components/landing/content.ts)
- [`../src/components/landing-exact/LandingBodyExact.tsx`](../src/components/landing-exact/LandingBodyExact.tsx)
- [`../src/components/landing-exact/LandingBodyExactShell.module.css`](../src/components/landing-exact/LandingBodyExactShell.module.css)
- [`../src/components/landing-exact/LandingHeroExact.tsx`](../src/components/landing-exact/LandingHeroExact.tsx)
- [`../src/components/landing-exact/LandingHeroExact.module.css`](../src/components/landing-exact/LandingHeroExact.module.css)
- [`../src/components/landing-exact/LandingTimelineExact.tsx`](../src/components/landing-exact/LandingTimelineExact.tsx)
- [`../src/components/landing-exact/LandingTimelineExact.module.css`](../src/components/landing-exact/LandingTimelineExact.module.css)
- [`../src/components/landing-exact/LandingVoucherBandExact.tsx`](../src/components/landing-exact/LandingVoucherBandExact.tsx)
- [`../src/components/landing-exact/LandingVoucherBandExact.module.css`](../src/components/landing-exact/LandingVoucherBandExact.module.css)
- [`../tests/unit/landing-below-nav-replica.test.ts`](../tests/unit/landing-below-nav-replica.test.ts)
- [`../tests/unit/copy-matrix-compliance.test.ts`](../tests/unit/copy-matrix-compliance.test.ts)
- Public homepage assets sourced from Stitch and Karri brand surfaces

## Stage Plan

1. Stage 1 — Create the full-path execution artifacts, add the partner assets, and rewrite the exact-homepage hero/timeline/band content so the live page tells the approved Stitch + Karri direct-payout story.
2. Stage 2 — Retune supporting styling/tokens and coupled legacy landing copy so the page visually reads as secure payout infrastructure rather than retail voucher fulfilment.
3. Stage 3 — Update focused homepage contract tests, run the full verification gate, dogfood the public homepage flow, and close the spec with progress + napkin evidence.

## Test Gate

- `pnpm exec vitest run tests/unit/landing-below-nav-replica.test.ts tests/unit/copy-matrix-compliance.test.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Public homepage dogfood of `/` confirming the Stitch trust strip, secure-payout Step 3, and Stitch + Karri payout band render coherently with no voucher/Takealot cues.

## Exit Criteria

- The live homepage no longer suggests Takealot, vouchers, redemption, or retail-partner fulfilment.
- Stitch branding appears in the approved high-value locations with the repeated strapline `Superpowered by Stitch.` and supporting strategic-partner framing.
- The homepage clearly states the two intended payout destinations: host parent bank account and birthday child Karri Card when available.
- Official Stitch and Karri homepage assets are wired cleanly into the live marketing page without creating branding clutter.
- Focused homepage regression coverage and the full verification gate are green.
- Dogfood evidence records homepage review proof, and handoff updates [`../progress.md`](../progress.md) plus napkin evidence before the spec is closed.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Rewrote the live exact homepage away from Takealot voucher fulfilment into a direct-payout story with a Stitch trust strip in the hero, a secure-payout Step 3, and a Stitch + Karri partnership band. Added project-local Stitch/Karri assets, updated coupled landing copy/tests, and verified with focused homepage tests, lint, typecheck, the full test suite, and localhost screenshot dogfood across the hero, timeline, and payout band.
