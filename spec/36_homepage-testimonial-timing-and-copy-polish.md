# 36_homepage-testimonial-timing-and-copy-polish

## Objective

- Slow the homepage testimonial rotation cadence, soften the transition feel, and tighten the long testimonial copy so the exact hero quote block stays visually balanced.

## In Scope

- Adjusting the shared testimonial rotation timing used by the homepage testimonial rotators.
- Refining the exact hero testimonial transition feel so fades are calmer and less jittery than the first restoration pass.
- Shortening the Rachel testimonial copy while preserving the intended meaning and 3-line visual target.
- Focused regression updates plus required execution-artifact sync for this session.

## Out Of Scope

- Broader homepage redesign beyond the testimonial cadence/copy polish.
- Changes to the testimonial author names or attribution lines.
- Non-testimonial landing copy edits elsewhere on the page.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../src/components/landing/testimonials.ts`](../src/components/landing/testimonials.ts)
- [`../src/components/landing-exact/LandingHeroTestimonialRotator.tsx`](../src/components/landing-exact/LandingHeroTestimonialRotator.tsx)
- [`../src/app/globals.css`](../src/app/globals.css)
- [`../tests/unit/landing-hero-testimonial-rotator.test.tsx`](../tests/unit/landing-hero-testimonial-rotator.test.tsx)
- Live localhost homepage at `http://localhost:3000` for public dogfood

## Stage Plan

1. Stage 1 — Adjust the shared rotation timing and refine the long testimonial copy in the shared testimonial data module.
2. Stage 2 — Soften the exact hero transition behavior so the quote change feels calmer without regressing reduced-motion or pause behavior.
3. Stage 3 — Update focused regressions, run the verification gate, dogfood the homepage rotation again, and hand off into `37_session-placeholder`.

## Test Gate

- `pnpm exec vitest run tests/unit/landing-hero-testimonial-rotator.test.tsx tests/unit/landing-below-nav-replica.test.ts`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Public localhost dogfood of `/` confirming the slower cadence and refined quote fit.

## Exit Criteria

- Testimonial rotation waits about 8 seconds between quote changes.
- The exact hero transition feels calmer than the prior pass while keeping hover/focus pause and reduced-motion handling intact.
- The Rachel testimonial copy is shorter and keeps the quote block to the requested tighter footprint.
- Focused regression coverage and the full verification gate are green.
- Dogfood evidence records live localhost verification or an explicit environment block with safe fallback proof.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Slowed the shared testimonial cadence from 5s to 8s, shortened the Rachel quote, removed the exact hero's extra per-quote entrance replay so the transition feels calmer, verified the homepage contract with focused regressions plus a full green gate, dogfooded the slower cadence on localhost, and handed off into `37_session-placeholder`.
