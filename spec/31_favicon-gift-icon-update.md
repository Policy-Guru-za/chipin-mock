# 31_favicon-gift-icon-update

## Objective

- Replace the app favicon with the uploaded gift icon without changing any other brand assets or homepage/runtime behavior.

## In Scope

- Wiring the root app metadata/favicon to the uploaded gift icon asset.
- Renaming the uploaded asset to a stable repo path if needed for favicon use.
- Focused regression coverage for the favicon contract.
- Session-artifact updates in [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md).

## Out Of Scope

- Changes to nav logos, marketing illustrations, OG images, or other product branding surfaces.
- Broader homepage/layout visual updates beyond favicon metadata wiring.

## Dependencies

- [`../AGENTS.md`](../AGENTS.md)
- [`../workflow-orchestration.md`](../workflow-orchestration.md)
- [`../progress.md`](../progress.md)
- [`./00_overview.md`](./00_overview.md)
- [`./SPEC_TEMPLATE.md`](./SPEC_TEMPLATE.md)
- [`../src/app/layout.tsx`](../src/app/layout.tsx)
- Uploaded gift icon asset currently present at `../public/Logos/Untitled.png`

## Stage Plan

1. Stage 1 — Move the uploaded gift icon to a stable favicon asset path and wire the root app metadata to use it.
2. Stage 2 — Add focused regression coverage that locks the favicon path contract.
3. Stage 3 — Run the verification gate, dogfood the rendered icon contract if localhost is available, and close the session artifacts cleanly.

## Test Gate

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- Localhost verification of the root page icon link or an explicit environment block with source-level fallback proof.

## Exit Criteria

- The root app favicon points at the uploaded gift icon.
- The uploaded favicon asset lives at a stable, intentional repo path.
- Focused regression coverage locks the favicon contract.
- [`./00_overview.md`](./00_overview.md) and [`../progress.md`](../progress.md) capture the session state and handoff proof.

## Final State

- Status: Done
- Exit Criteria State: satisfied
- Successor Slot: none
- Notes: Renamed the uploaded gift icon to `public/Logos/Gifta-favicon.png`, wired the root metadata favicon links to that stable asset path, added focused regression coverage for the icon contract, and verified the runtime output via localhost HTML/icon fetches plus the full verification gate.
