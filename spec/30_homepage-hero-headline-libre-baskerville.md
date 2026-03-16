# 30_homepage-hero-headline-libre-baskerville

## Objective

- Change only the active homepage hero headline from Fraunces to Libre Baskerville while preserving all other homepage typography.

## In Scope

- Homepage font-config updates required to support Libre Baskerville bold upright plus regular italic in the active hero headline.
- Selector-level hero headline styling changes in the active landing exact surface.
- Focused regression coverage for the headline-only font contract.
- Session-artifact updates in [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md).

## Out Of Scope

- Global editorial-token rewiring.
- Typography changes to the testimonial quote ornament, tagline, dreamboard card, timeline, voucher band, footer, nav, or legacy unused landing hero path.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../src/app/layout.tsx`](../src/app/layout.tsx)
- [`../src/app/globals.css`](../src/app/globals.css)
- [`../src/components/landing-exact/LandingHeroExact.module.css`](../src/components/landing-exact/LandingHeroExact.module.css)
- [`../tests/unit/landing-below-nav-replica.test.ts`](../tests/unit/landing-below-nav-replica.test.ts)

## Stage Plan

1. Stage 1 — Expand the active Libre Baskerville font registration without disturbing the shared Fraunces editorial token.
2. Stage 2 — Update only the active hero headline selectors to use Libre Baskerville and add focused regression coverage.
3. Stage 3 — Run the full verification gate, dogfood the homepage hero, and close the session artifacts cleanly.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm test tests/unit/landing-below-nav-replica.test.ts`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Localhost homepage screenshot dogfood at desktop width confirming headline-only impact.

## Exit Criteria

- The active homepage hero headline uses Libre Baskerville with upright `700` for line 1 and italic `400` for line 2.
- The shared Fraunces editorial token remains in place for non-headline homepage surfaces, including the testimonial quote ornament.
- Focused regression coverage locks the headline-only font contract.
- [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md) capture the session state and handoff proof.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Expanded the existing Libre Baskerville Next font registration to cover bold upright plus italic, moved only the active homepage hero headline selectors onto `--font-libre-baskerville`, preserved Fraunces on the shared editorial token and testimonial quote ornament, added focused regression coverage, and verified the result with the full gate plus localhost hero screenshot dogfood.
