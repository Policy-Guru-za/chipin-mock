# UX

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Current UX Contracts

- Mobile-first across guest and host flows
- Public Dreamboard shows:
  - child/gift context
  - percentage plus aggregate Rand progress
  - contributor list without public contribution amounts
  - contribute CTA for non-host viewers
- Host dashboard shows detailed financial and contribution data
- Admin surface covers dashboard, Dreamboards, contributions, direct-access charity records, payouts, reports, and settings

## Current Design System Reality

- Global styles in [`src/app/globals.css`](../../src/app/globals.css)
- component implementation in `src/components/`
- route-specific UI in `src/app/`

## Accessibility Baseline

- reduced motion support is present in shared motion-aware components
- minimum focus/landmark coverage is expected in current route shells
- exact acceptance tests live in runtime test files, not only in design docs

## Note on Tier 2 UX Specs

Detailed UI specs under `docs/UX/ui-specs/` are preserved as non-authoritative reference material unless the control matrix promotes them back to current-reference.
