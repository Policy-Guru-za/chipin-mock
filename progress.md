# Progress

## Current Spec

- `04_contract-truth-and-payfast-recovery`

## Current Stage

- Gate A — Stage 1 complete; approval required before Stage 2

## Status

- Renamed the active placeholder in place to [`spec/04_contract-truth-and-payfast-recovery.md`](./spec/04_contract-truth-and-payfast-recovery.md) for the remediation session covering webhook contract narrowing, guest-flow message-limit fixes, PayFast reconciliation hardening, and payout-doc surface removal.
- Session scope and bounded stage plan are now recorded under the active spec before runtime changes begin.
- Stage 1 completed:
  - narrowed the shared webhook contract to `contribution.received` and `pot.funded`
  - added webhook endpoint rollback snapshot/restore tooling and the `0018_sanitize_webhook_endpoint_events.sql` backfill
  - review follow-up fixed the missing Drizzle journal registration for `0018_sanitize_webhook_endpoint_events`
  - removed wildcard delivery matching, normalized legacy webhook rows at the API boundary, and synced generated OpenAPI plus Tier 1 docs
  - replaced stale Stitch / PayFast trust copy with provider-neutral trust text and corrected active `gifta.co` support/share fallbacks to `gifta.co.za`
- Stage 1 verification passed:
  - `pnpm openapi:generate`
  - `pnpm typecheck`
  - `pnpm test -- tests/unit/webhook-contract.test.ts tests/unit/webhook-rollback.test.ts tests/integration/api-webhooks.test.ts tests/unit/webhook-dispatcher.test.ts tests/unit/dreamboard-cta-card.test.tsx tests/unit/create-review-publish.test.ts tests/integration/thank-you-display.test.tsx tests/unit/payment-failed-client.test.tsx tests/unit/openapi-spec.test.ts`
  - `pnpm docs:audit -- --sync`
  - `pnpm docs:audit`
  - `node -e "const j=require('./drizzle/migrations/meta/_journal.json'); const last=j.entries.at(-1); if(last.tag!=='0018_sanitize_webhook_endpoint_events'||last.idx!==18) throw new Error(JSON.stringify(last)); console.log(last.tag);"`

## Blockers

- Gate A approval required before continuing beyond the first green bounded slice on the public webhook contract.
- Live rollback-tool dogfood is blocked in this shell because `DATABASE_URL` is not set; the bounded slice is covered by unit tests plus generated-artifact verification, but the snapshot/restore commands could not be executed against a real database here.

## Next Step

- Pause for Gate A approval, then continue with Stage 2 guest message-limit alignment.

## Last Completed Spec

- `03_placeholder-handoff-proof-model`

## Last Green Commands

- `pnpm docs:audit -- --sync`
- `pnpm docs:audit`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Dogfood Evidence

- Start-of-session dogfood succeeded: this session began by renaming [`spec/03_session-placeholder.md`](./spec/03_placeholder-handoff-proof-model.md) in place to a concrete numbered spec and continuing the work under that same number.
- Handoff dogfood succeeded: [`spec/04_contract-truth-and-payfast-recovery.md`](./spec/04_contract-truth-and-payfast-recovery.md) is now the single `Active` spec while [`spec/03_placeholder-handoff-proof-model.md`](./spec/03_placeholder-handoff-proof-model.md) is `Done` in [`spec/00_overview.md`](./spec/00_overview.md), and [`progress.md`](./progress.md) attributes proof through `Last Completed Spec`.
- Verification dogfood succeeded: `pnpm docs:audit -- --sync`, `pnpm docs:audit`, `pnpm lint`, `pnpm typecheck`, and `pnpm test` all passed on the final handoff state; the test suite finished at `192` files / `978` tests passing.
