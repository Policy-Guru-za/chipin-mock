# 38_homepage-testimonial-scroll-glitch-fix

## Objective

- Eliminate the homepage testimonial scroll glitch by replacing the current interval-plus-CSS-fade coupling with the approved Option B robust state-driven transition inside the exact landing hero.

## In Scope

- Runtime changes in [`../src/components/landing-exact/LandingHeroTestimonialRotator.tsx`](../src/components/landing-exact/LandingHeroTestimonialRotator.tsx) to decouple testimonial swapping from the long-running fade animation and make quote transitions state-driven.
- Supporting animation and style updates needed to keep the testimonial visible and stable under scroll pressure, including the exact homepage animation contract in [`../src/app/globals.css`](../src/app/globals.css) and any directly related exact-hero styles.
- Preserving the existing testimonial cadence, Priya-first initial paint, and pause/reduced-motion behavior while removing the flicker.
- Focused regression coverage for the rotator plus homepage exact-shell/source-contract coverage updates.
- Full verification and localhost public-homepage dogfood that explicitly scrolls through the hero and timeline while the testimonial rotates.
- Required execution-artifact sync for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Changing homepage testimonial copy, authors, or the agreed 8-second cadence unless a minimal fix is required to support the transition contract.
- Reworking the broader exact-homepage layout, the footer, or unrelated landing sections.
- Redesigning or removing the [`../src/components/landing-exact/LandingTimelineExact.tsx`](../src/components/landing-exact/LandingTimelineExact.tsx) scroll behavior beyond what is needed to prove the testimonial glitch is resolved.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../src/components/landing-exact/LandingHeroTestimonialRotator.tsx`](../src/components/landing-exact/LandingHeroTestimonialRotator.tsx)
- [`../src/components/landing-exact/LandingTimelineExact.tsx`](../src/components/landing-exact/LandingTimelineExact.tsx)
- [`../src/components/landing/testimonials.ts`](../src/components/landing/testimonials.ts)
- [`../src/app/globals.css`](../src/app/globals.css)
- [`../tests/unit/landing-hero-testimonial-rotator.test.tsx`](../tests/unit/landing-hero-testimonial-rotator.test.tsx)
- [`../tests/unit/landing-below-nav-replica.test.ts`](../tests/unit/landing-below-nav-replica.test.ts)
- Live localhost homepage at `http://localhost:3000` for public scroll dogfood

## Stage Plan

1. Stage 1 — Refactor `LandingHeroTestimonialRotator` to use explicit transition state instead of swapping testimonials on the same 8-second loop that drives the fade all the way to `opacity: 0`.
2. Stage 2 — Update the supporting animation/styles so the outgoing and incoming testimonial phases stay visually stable even when homepage scrolling adds main-thread pressure via `LandingTimelineExact`, while preserving pause and reduced-motion safeguards.
3. Stage 3 — Expand focused regressions, run the full verification gate, dogfood the localhost homepage while scrolling through the hero/timeline during multiple testimonial rotations, and hand off into `39_session-placeholder`.

## Test Gate

- `pnpm exec vitest run tests/unit/landing-hero-testimonial-rotator.test.tsx tests/unit/landing-below-nav-replica.test.ts`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Public localhost dogfood of `/` confirming the testimonial no longer flickers or blanks while scrolling through the page during rotation.

## Exit Criteria

- The exact homepage testimonial no longer drops to a blank or visibly flickering state during normal idle rotation or while the page is actively being scrolled.
- `LandingHeroTestimonialRotator` uses a robust state-driven transition contract instead of relying on a single CSS animation that reaches `opacity: 0` at the swap boundary.
- Priya remains the initial testimonial, the 8-second cadence remains intact, and hover/focus pause plus reduced-motion behavior still work.
- Focused regression coverage and the full verification gate are green.
- Dogfood evidence records live localhost scrolling verification or an explicit environment block with safe fallback proof.
- Session handoff updates `progress.md` with the closed-spec outcome, green commands, dogfood evidence, and either a napkin link or `No durable napkin update.` before activating `39_session-placeholder`.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Completed with the approved robust state-driven transition in `LandingHeroTestimonialRotator`, replacing the keyed-remount plus long fade-to-zero contract. Focused tests, `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` were green, and localhost scroll-stress dogfood sampled 75 frames, observed the transition plus Priya and Rachel, and found no empty testimonial frame (`output/spec38-homepage-testimonial-before-scroll-cycle.png`, `output/spec38-homepage-testimonial-after-scroll-cycle.png`).
