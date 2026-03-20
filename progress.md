# Progress

## Active Full Specs

| Spec | Title | Owner | Stage | Status | Blockers | Next Step | Last Updated |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Quick Tasks

| Task ID | Scope | Owner | Verification | Status | Next Step |
| --- | --- | --- | --- | --- | --- |
| Q-2026-03-20-google-search-console-html-verification | Publish the provided Google Search Console HTML verification file at the site root so Google can verify ownership and support re-crawl actions | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm docs:audit`, localhost fetch of `/google5154e017d4f8496a.html` | Completed | Done (exact file copied from `tmp/`, validators green, localhost fetch returned `200 OK` with the expected body) |
| Q-2026-03-20-next-env-route-types-revert | Revert the generated dev-only `next-env.d.ts` route-type import so clean environments keep resolving stable Next route typings | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm docs:audit` | Completed | Done |
| Q-2026-03-20-homepage-search-seo-hardening | Add homepage-only product-descriptive search metadata and JSON-LD while preserving the current social-preview contract | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm docs:audit`, localhost homepage HTML metadata/JSON-LD check | Completed | Done (automated coverage green; localhost HTML fetch blocked by Clerk dev-browser / missing-key middleware states) |
| Q-2026-03-20-homepage-share-hires-branding | Replace the homepage share image source with the higher-fidelity `public/Logos/IMG_1209.PNG` branding asset | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm docs:audit`, localhost `/opengraph-image` verification | Completed | Done |
| Q-2026-03-19-homepage-share-fullbleed-email | Simplify the homepage share image to a full-bleed `public/Logos/Email.png` visual with no overlaid copy or chips | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm docs:audit`, localhost `/opengraph-image` visual check | Completed | Done |
| Q-2026-03-19-homepage-share-email-lockup | Update the homepage share image to use the approved `public/Logos/Email.png` wordmark instead of the temporary brand-card imagery | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm docs:audit`, localhost `/opengraph-image` visual check | Completed | Done |
| Q-2026-03-19-homepage-share-brand-card | Replace the homepage share image with a pure Gifta brand card so social scrapers stop falling back to the Mia avatar | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost `/opengraph-image` + homepage meta fetch, live HTML diagnosis proof | Completed | Done |
| Q-2026-03-19-homepage-social-metadata-hardening | Harden homepage social metadata with generated OG/Twitter images and align Dreamboard metadata to the Gifta sharing contract | Codex | `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage metadata/image fetches, Dreamboard metadata unit coverage | Completed | Done |
| Q-2026-03-19-authoritative-payment-doc-sync | Sync Tier 1 payment docs with the Stitch-placeholder runtime and remove stale PayFast/Ozow/SnapScan references from authoritative guidance | Codex | `pnpm docs:audit -- --sync`, `pnpm docs:audit` | Completed | Done |
| Q-2026-03-19-homepage-exact-step-copy | Update the live homepage exact timeline Step 1 copy to the approved payout-option wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-how-it-works-copy | Update the public homepage how-it-works Step 1 copy to the approved payout-option wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-stitch-trim | Remove the extra Stitch hero strip and inline payout-band Stitch card on `/`, then rebalance spacing | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-timeline-copy | Update the homepage timeline Step 2 description on `/` to the approved contribution-collection wording | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-step-copy-correction | Move the approved contribution-collection copy to Step 1 and restore the original Step 2 WhatsApp copy on `/` | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |
| Q-2026-03-19-homepage-mobile-card-motion | Remove the landing hero and payout-card tilt/float motion on mobile-width viewports while keeping desktop and iPad behavior unchanged | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost landing screenshot dogfood at desktop, iPad, and mobile widths | Completed | Done |
| Q-2026-03-19-homepage-payout-copy-tweaks | Apply the requested final payout/Karri wording refinements and payout-band chip removal across the live landing timeline and payout band | Codex | `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, localhost homepage dogfood | Completed | Done |

## Recently Closed Specs

- `50_legacy_voucher_compatibility_cleanup` — Done
- `49_harden_0021_voucher_migration_replay` — Done
- `48_voucher-migration-guard-and-seed-repair` — Done
- `47_payout-encryption-and-openapi-follow-up` — Done
- `46_voucher-runtime-removal-and-payout-flow-reset` — Done
- `45_payment-docs-and-voucher-removal-sync` — Done
- `44_www-host-stitch-placeholder-payment-hard-removal` — Done
- `43_public-landing-responsiveness-audit` — Done
- `42_homepage-payout-stitch-partnership-rewrite` — Done

## Last Completed Spec

- `50_legacy_voucher_compatibility_cleanup`

## Last Green Commands

- `pnpm exec vitest run tests/unit/payout-service-create.test.ts tests/integration/api-dream-boards-close.test.ts tests/integration/api-payouts-voucher.test.ts tests/unit/host-dashboard-view-model.test.ts tests/integration/dashboard-host-flow.test.tsx`
- `pnpm lint` (passed with existing warnings-only baseline)
- `pnpm typecheck`
- `pnpm test`
- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`

## Dogfood Evidence

- Live voucher-row dogfood was intentionally not repeated because specs 48-49 already removed the last known voucher boards/payouts from the main DB. Fallback dogfood exercised the close route, payout API, and host dashboard compatibility surfaces through `pnpm exec vitest run tests/unit/payout-service-create.test.ts tests/integration/api-dream-boards-close.test.ts tests/integration/api-payouts-voucher.test.ts tests/unit/host-dashboard-view-model.test.ts tests/integration/dashboard-host-flow.test.tsx`, proving unsupported voucher closes now fail before state mutation, public payout responses hide voucher rows, and dashboard rendering uses explicit `Takealot Voucher` labeling instead of Karri copy.

## Napkin Evidence

Updated [`docs/napkin/napkin.md`](./docs/napkin/napkin.md) with the Google Search Console reminder to publish HTML verification files under `public/` with the exact provided filename/content and verify the root URL directly.
