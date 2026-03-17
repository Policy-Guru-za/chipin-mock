# 35_homepage-testimonial-rotation-restoration

## Objective

- Restore the lost multi-quote homepage testimonial rotation inside the exact landing hero without reintroducing the legacy testimonial card design.

## In Scope

- Exact homepage hero runtime changes needed to replace the static testimonial with a rotating version while preserving the current shell.
- Shared testimonial content extraction so the exact homepage and legacy landing testimonial read from one source.
- Reduced-motion and hover/focus pause behavior for the testimonial rotation.
- Focused regression coverage for the rotator behavior and homepage exact contract.
- Required execution artifacts for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Reintroducing the legacy testimonial card chrome, dots, or old homepage layout.
- Non-testimonial homepage redesign beyond the exact hero testimonial shell.
- Changes to the active footer-cleanup behavior already landed in Spec 34.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../src/components/landing-exact/LandingHeroExact.tsx`](../src/components/landing-exact/LandingHeroExact.tsx)
- [`../src/components/landing/LandingTestimonial.tsx`](../src/components/landing/LandingTestimonial.tsx)
- [`../src/components/landing/content.ts`](../src/components/landing/content.ts)
- [`../tests/unit/landing-below-nav-replica.test.ts`](../tests/unit/landing-below-nav-replica.test.ts)
- Live localhost homepage at `http://localhost:3000` for public dogfood

## Stage Plan

1. Stage 1 — Extract shared testimonial content and build a client-only exact-homepage rotator that preserves the current Priya-first shell.
2. Stage 2 — Mount the rotator inside `LandingHeroExact`, keep the exact design intact across breakpoints, and add pause/reduced-motion safeguards.
3. Stage 3 — Add focused regressions, run the full gate, dogfood the public homepage rotation, and hand off into `36_session-placeholder`.

## Test Gate

- `pnpm exec vitest run tests/unit/landing-below-nav-replica.test.ts`
- Focused rotator unit tests with fake timers
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Public localhost dogfood of `/` confirming Priya first paint plus ~5s rotation behavior.

## Exit Criteria

- The exact homepage hero cycles through the agreed three testimonials while keeping the current visual shell.
- Priya remains the initial first-render testimonial.
- Rotation pauses on hover/focus and disables itself for reduced-motion users.
- Homepage regression coverage and the full verification gate are green.
- Dogfood evidence records live public-homepage verification or an explicit environment block with safe fallback proof.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Restored the exact-homepage testimonial rotation with shared testimonial data, kept Priya as the first rendered quote, added reduced-motion plus hover/focus pause handling, locked the contract with focused regressions, verified the live localhost rotation in-browser, and handed off into `36_session-placeholder`.
