# 39_shared-header-top-link-removal

## Objective

- Remove the shared-shell `How it works` and `Trust & safety` nav headings so every page using the shared `Header` matches the logged-out homepage top-nav contract.

## In Scope

- Runtime changes in [`../src/components/layout/Header.tsx`](../src/components/layout/Header.tsx) to remove the desktop shared-header top links while preserving the create CTA and auth controls.
- Runtime changes in [`../src/components/layout/MobileNav.tsx`](../src/components/layout/MobileNav.tsx) to remove the matching drawer links so mobile stays aligned with the shared desktop header.
- Minimal spacing/alignment polish needed to keep the shared header balanced after the two links are removed.
- Focused regression updates for shared-header parity and mobile-nav rendering.
- Required execution-artifact sync for this session (`spec/00_overview.md`, `progress.md`, this spec, and the next placeholder at handoff).

## Out Of Scope

- Changing the logged-out marketing nav in [`../src/components/landing/LandingNav.tsx`](../src/components/landing/LandingNav.tsx) or [`../src/components/landing/content.ts`](../src/components/landing/content.ts), which already ship with no top links.
- Changing footer behavior, auth flows, route structure, or any other shared-shell copy beyond removing the two requested headings.
- Reworking the broader shell layout beyond the minimal spacing needed to preserve balance after the removals.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../src/components/layout/Header.tsx`](../src/components/layout/Header.tsx)
- [`../src/components/layout/MobileNav.tsx`](../src/components/layout/MobileNav.tsx)
- [`../src/components/landing/content.ts`](../src/components/landing/content.ts)
- [`../tests/unit/auth-nav-user-menu.test.ts`](../tests/unit/auth-nav-user-menu.test.ts)
- [`../tests/unit/mobile-nav.test.tsx`](../tests/unit/mobile-nav.test.tsx)

## Stage Plan

1. Stage 1 — Remove the shared-header top links from the desktop shell in `Header.tsx`, keeping the CTA/auth cluster intact.
2. Stage 2 — Remove the same links from `MobileNav.tsx` and apply only the minimal spacing polish needed to keep the shared header balanced.
3. Stage 3 — Update focused regressions, run the verification gate, dogfood shared-header pages on desktop/mobile, and hand off into `40_session-placeholder`.

## Test Gate

- `pnpm exec vitest run tests/unit/auth-nav-user-menu.test.ts tests/unit/mobile-nav.test.tsx`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Shared-header dogfood on desktop and mobile widths confirming the two top headings are gone and the remaining nav spacing still looks intentional.

## Exit Criteria

- No page using the shared `Header`/`MobileNav` renders the `How it works` or `Trust & safety` nav headings anymore.
- The shared header still presents the Gifta mark, create CTA, and sign-in/avatar controls with balanced spacing after the removals.
- Focused regression coverage and the full verification gate are green.
- Dogfood evidence records desktop/mobile confirmation or an explicit environment block with safe fallback proof.
- Session handoff updates `progress.md` with the closed-spec outcome, green commands, dogfood evidence, and napkin outcome before activating `40_session-placeholder`.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Removed the shared-shell `How it works` and `Trust & safety` links from `Header.tsx` and `MobileNav.tsx`, preserved the remaining CTA/auth balance, and updated focused nav regressions. `pnpm exec vitest run tests/unit/auth-nav-user-menu.test.ts tests/unit/mobile-nav.test.tsx`, `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` were green. Local dogfood confirmed the shared header on `http://localhost:3000/maya-birthday-demo` shows only Gifta, Create, and Sign in on desktop plus the same reduced mobile drawer (`output/spec39-shared-header-demo-board-desktop.png`, `output/spec39-shared-header-demo-board-mobile-drawer.png`); direct host-route visual proof stayed auth-blocked by the signed-out Clerk redirect.
