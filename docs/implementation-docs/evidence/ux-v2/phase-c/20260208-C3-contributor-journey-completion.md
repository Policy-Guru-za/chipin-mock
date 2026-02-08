# 20260208-C3 Contributor Journey Completion

## 1) Summary
Milestone C3 completed.

Implemented the contributor journey split from one route into a two-step guest flow:
- Step 1 details at `/(guest)/[slug]/contribute`
- Step 2 payment at `/(guest)/[slug]/contribute/payment`

Key outcomes:
- Added sessionStorage flow bridge (`ContributeFlowData`) with TTL and SSR safety.
- Added payment-step recovery write path updates with backward compatibility (`paymentProvider` + legacy `attemptedMethod`).
- Replaced monolithic contribute route UI with C3 UX: amount presets, custom amount bounds, anonymous toggle behavior, optional message, reminder modal, and continue-to-payment routing.
- Added payment step client that reads flow storage, validates presence/TTL, submits existing Phase B create API payload, preserves fee semantics via `calculateFee`, supports provider modes (`form`, `redirect`, `qr`), and writes payment recovery state before provider handoff.
- Added reminder modal with accessible dialog behaviors and `/api/internal/contributions/reminders` integration (200/201 success).
- Removed legacy `ContributionForm` usage and retained shared payment primitives in `ContributionFormParts`.
- Updated copy/metadata labels to Gifta where required.
- Added full C3 unit and integration test coverage.

## 2) Files Created and Modified
Created:
- `src/lib/contributions/flow-storage.ts`
- `src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx`
- `src/app/(guest)/[slug]/contribute/payment/page.tsx`
- `src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx`
- `src/components/contribute/ReminderModal.tsx`
- `tests/unit/contribute-flow-storage.test.ts`
- `tests/unit/contribute-details.test.tsx`
- `tests/unit/contribute-payment.test.tsx`
- `tests/unit/reminder-modal.test.tsx`
- `tests/unit/payment-recovery-write.test.ts`
- `tests/integration/contribute-two-step-flow.test.tsx`
- `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C3-contributor-journey-completion.md`

Modified:
- `src/app/(guest)/[slug]/contribute/page.tsx`
- `src/app/(guest)/[slug]/payment-failed/PaymentFailedClient.tsx`
- `src/components/forms/ContributionFormParts.tsx`
- `src/components/forms/index.ts`
- `src/lib/payments/recovery.ts`
- `tests/unit/payment-recovery.test.ts`

Deleted:
- `src/components/forms/ContributionForm.tsx`

## 3) Gate Results (Exact Output)
Command run:
- `pnpm lint && pnpm typecheck && pnpm test`

```text

> chipin@0.1.0 lint /Users/ryanlaubscher/Projects/gifta-codex5.3
> eslint .


/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(admin)/payouts/page.tsx
  65:16  warning  Async function 'AdminPayoutsPage' has too many lines (122). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx
  28:8  warning  Function 'ContributeDetailsClient' has too many lines (246). Maximum allowed is 120  max-lines-per-function
  28:8  warning  Function 'ContributeDetailsClient' has a complexity of 22. Maximum allowed is 12     complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx
   94:8   warning  Function 'PaymentClient' has too many lines (164). Maximum allowed is 120  max-lines-per-function
   94:8   warning  Function 'PaymentClient' has a complexity of 15. Maximum allowed is 12     complexity
  124:33  warning  Async arrow function has a complexity of 20. Maximum allowed is 12         complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(guest)/[slug]/thanks/ThankYouClient.tsx
  24:8  warning  Function 'ThankYouClient' has too many lines (150). Maximum allowed is 120  max-lines-per-function
  24:8  warning  Function 'ThankYouClient' has a complexity of 16. Maximum allowed is 12     complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(host)/create/dates/page.tsx
  64:8  warning  Async function 'saveDatesAction' has a complexity of 15. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(host)/create/giving-back/GivingBackForm.tsx
  32:8  warning  Function 'GivingBackForm' has too many lines (158). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(host)/create/giving-back/page.tsx
  80:8  warning  Async function 'saveGivingBackAction' has a complexity of 19. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(host)/create/payout/PayoutForm.tsx
  33:8  warning  Function 'PayoutForm' has too many lines (176). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(host)/create/payout/page.tsx
  157:8  warning  Async function 'savePayoutAction' has a complexity of 13. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/(host)/create/review/page.tsx
  15:8  warning  Async function 'publishDreamBoardAction' has a complexity of 29. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/api/internal/debug/auth-events/route.ts
  88:8  warning  Async function 'POST' has a complexity of 17. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/api/v1/dream-boards/[id]/route.ts
   43:16  warning  Arrow function has too many lines (166). Maximum allowed is 120        max-lines-per-function
   43:29  warning  Arrow function has a complexity of 50. Maximum allowed is 12           complexity
  408:3   warning  Async arrow function has too many lines (160). Maximum allowed is 120  max-lines-per-function
  408:65  warning  Async arrow function has a complexity of 37. Maximum allowed is 12     complexity
  453:1   warning  File has too many lines (521). Maximum allowed is 400                  max-lines

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/api/v1/dream-boards/route.ts
   64:16  warning  Arrow function has too many lines (131). Maximum allowed is 120        max-lines-per-function
   64:29  warning  Arrow function has a complexity of 32. Maximum allowed is 12           complexity
  203:71  warning  Arrow function has a complexity of 15. Maximum allowed is 12           complexity
  270:4   warning  Async arrow function has a complexity of 31. Maximum allowed is 12     complexity
  390:54  warning  Async arrow function has too many lines (153). Maximum allowed is 120  max-lines-per-function
  390:92  warning  Async arrow function has a complexity of 46. Maximum allowed is 12     complexity
  434:1   warning  File has too many lines (512). Maximum allowed is 400                  max-lines

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/api/v1/payouts/[id]/confirm/route.ts
  17:65  warning  Async arrow function has a complexity of 13. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/api/webhooks/ozow/route.ts
  35:8  warning  Async function 'POST' has a complexity of 25. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/api/webhooks/payfast/route.ts
  178:8  warning  Async function 'POST' has a complexity of 28. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/app/api/webhooks/snapscan/route.ts
  135:8  warning  Async function 'POST' has a complexity of 17. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/components/contribute/ReminderModal.tsx
  18:8  warning  Function 'ReminderModal' has too many lines (122). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/components/dream-board/ContributorDisplay.tsx
  71:8  warning  Function 'ContributorDisplay' has too many lines (165). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/components/dream-board/ProgressBar.tsx
  24:8  warning  Function 'ProgressBar' has a complexity of 13. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/components/forms/AmountSelector.tsx
  20:8  warning  Function 'AmountSelector' has too many lines (122). Maximum allowed is 120  max-lines-per-function
  20:8  warning  Function 'AmountSelector' has a complexity of 13. Maximum allowed is 12     complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/components/gift/GiftSelectionCard.tsx
  20:8  warning  Function 'GiftSelectionCard' has a complexity of 13. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/components/landing/LandingDreamBoard.tsx
  7:8  warning  Function 'LandingDreamBoard' has too many lines (121). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/components/landing/LandingNav.tsx
  12:8  warning  Function 'LandingNav' has too many lines (148). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/components/layout/MobileNav.tsx
  23:8  warning  Function 'MobileNav' has too many lines (150). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/admin/service.ts
  128:47  warning  Async arrow function has a complexity of 13. Maximum allowed is 12  complexity
  261:49  warning  Async arrow function has a complexity of 15. Maximum allowed is 12  complexity
  360:43  warning  Async arrow function has a complexity of 15. Maximum allowed is 12  complexity
  455:1   warning  File has too many lines (797). Maximum allowed is 400               max-lines

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/api/dream-boards.ts
  52:82  warning  Arrow function has a complexity of 17. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/api/payouts.ts
  36:68  warning  Arrow function has a complexity of 14. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/auth/host-mapping.ts
  32:8  warning  Async function 'ensureHostForClerkUser' has a complexity of 16. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/config/feature-flags.ts
  91:45  warning  Arrow function has a complexity of 21. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/db/queries.ts
  440:1  warning  File has too many lines (479). Maximum allowed is 400  max-lines

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/db/schema.ts
  439:1  warning  File has too many lines (520). Maximum allowed is 400  max-lines

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/dream-boards/schema.ts
  35:29  warning  Arrow function has a complexity of 18. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/dream-boards/view-model.ts
  305:23  warning  Arrow function has a complexity of 14. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/host/create-view-model.ts
  100:59  warning  Arrow function has a complexity of 20. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/integrations/karri-batch.ts
  106:73  warning  Async arrow function has a complexity of 13. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/integrations/whatsapp-webhook.ts
  178:106  warning  Async arrow function has a complexity of 20. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/integrations/whatsapp.ts
  91:32  warning  Async arrow function has a complexity of 13. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/payouts/automation.ts
  88:8  warning  Async function 'executeAutomatedPayout' has a complexity of 13. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/payouts/queries.ts
  194:4  warning  Async arrow function has a complexity of 13. Maximum allowed is 12  complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/payouts/service.ts
  457:1  warning  File has too many lines (463). Maximum allowed is 400  max-lines

/Users/ryanlaubscher/Projects/gifta-codex5.3/src/lib/reminders/service.ts
  221:25  warning  Async arrow function has too many lines (156). Maximum allowed is 120  max-lines-per-function
  227:18  warning  Async arrow function has too many lines (150). Maximum allowed is 120  max-lines-per-function
  227:29  warning  Async arrow function has a complexity of 17. Maximum allowed is 12     complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/api-dream-boards-close.test.ts
  62:50  warning  Arrow function has too many lines (201). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/api-dream-boards-list-create.test.ts
  126:39  warning  Arrow function has too many lines (560). Maximum allowed is 120  max-lines-per-function
  470:1   warning  File has too many lines (665). Maximum allowed is 400            max-lines

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/api-dream-boards-update.test.ts
  89:45  warning  Arrow function has too many lines (294). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/contribute-two-step-flow.test.tsx
  43:50  warning  Arrow function has too many lines (130). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/create-flow-steps.test.ts
  98:42  warning  Arrow function has too many lines (146). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/internal-contribution-reminders.test.ts
  75:56  warning  Arrow function has too many lines (240). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/internal-contributions-create.test.ts
  31:53  warning  Arrow function has too many lines (130). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/internal-debug-auth-events.test.ts
  16:50  warning  Arrow function has too many lines (128). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/integration/ozow-webhook.test.ts
  23:38  warning  Arrow function has too many lines (122). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/amount-selector.test.tsx
  12:38  warning  Arrow function has too many lines (123). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/charity-service.test.ts
  52:29  warning  Arrow function has too many lines (144). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/contribute-payment.test.tsx
  36:27  warning  Arrow function has too many lines (125). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/create-step-dates.test.ts
  33:29  warning  Arrow function has too many lines (135). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/create-step-giving-back.test.ts
  32:34  warning  Arrow function has too many lines (174). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/create-step-payout.test.ts
  41:30  warning  Arrow function has too many lines (220). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/host-create-view-model.test.ts
  26:38  warning  Arrow function has too many lines (160). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/karri-batch.test.ts
  57:31  warning  Arrow function has too many lines (169). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/karri-integration.test.ts
  20:31  warning  Arrow function has too many lines (152). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/payout-queries.test.ts
  28:28  warning  Arrow function has too many lines (190). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/payout-service-create.test.ts
  30:37  warning  Arrow function has too many lines (370). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/payout-service.test.ts
  17:28  warning  Arrow function has too many lines (160). Maximum allowed is 120  max-lines-per-function

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/reminder-dispatch-service.test.ts
  83:34  warning  Arrow function has too many lines (145). Maximum allowed is 120  max-lines-per-function
  86:25  warning  Arrow function has a complexity of 15. Maximum allowed is 12     complexity

/Users/ryanlaubscher/Projects/gifta-codex5.3/tests/unit/whatsapp-webhook-processing.test.ts
  20:43  warning  Arrow function has too many lines (156). Maximum allowed is 120  max-lines-per-function

✖ 87 problems (0 errors, 87 warnings)


> chipin@0.1.0 typecheck /Users/ryanlaubscher/Projects/gifta-codex5.3
> tsc --noEmit


> chipin@0.1.0 test /Users/ryanlaubscher/Projects/gifta-codex5.3
> vitest run --passWithNoTests


 RUN  v4.0.17 /Users/ryanlaubscher/Projects/gifta-codex5.3

stderr | tests/integration/ozow-webhook.test.ts > Ozow webhook integration > accepts a valid webhook payload
{"level":"warn","message":"payments.ozow_timestamp_missing","timestamp":"2026-02-08T15:11:14.199Z"}

stderr | tests/integration/ozow-webhook.test.ts > Ozow webhook integration > accepts a valid webhook payload
{"level":"error","message":"webhooks.payload_board_failed","timestamp":"2026-02-08T15:11:14.200Z","data":{"dreamBoardId":"board-1","error":"DATABASE_URL is not set"}}

stderr | tests/integration/ozow-webhook.test.ts > Ozow webhook integration > accepts a valid webhook payload
{"level":"error","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:14.200Z","data":{"type":"contribution.received","error":"DATABASE_URL is not set"}}

stderr | tests/integration/ozow-webhook.test.ts > Ozow webhook integration > accepts a valid webhook payload
{"level":"warn","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:14.201Z","data":{"eventType":"contribution.received","contributionId":"contrib-1"}}

stderr | tests/integration/payfast-webhook.test.ts > PayFast webhook integration - success > accepts a valid ITN payload and updates contribution state
{"level":"error","message":"webhooks.payload_board_failed","timestamp":"2026-02-08T15:11:14.204Z","data":{"dreamBoardId":"board-1","error":"DATABASE_URL is not set"}}

stderr | tests/integration/payfast-webhook.test.ts > PayFast webhook integration - success > accepts a valid ITN payload and updates contribution state
{"level":"error","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:14.205Z","data":{"type":"contribution.received","error":"DATABASE_URL is not set"}}

stderr | tests/integration/payfast-webhook.test.ts > PayFast webhook integration - success > accepts a valid ITN payload and updates contribution state
{"level":"warn","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:14.205Z","data":{"eventType":"contribution.received","contributionId":"contrib-1"}}

stderr | tests/integration/payfast-webhook.test.ts > PayFast webhook integration - errors > rejects requests when rate limited
{"level":"warn","message":"payments.payfast_rate_limited","timestamp":"2026-02-08T15:11:14.218Z","data":{"ip":"197.97.145.144"}}

stderr | tests/integration/ozow-webhook.test.ts > Ozow webhook integration > rejects payloads without amounts
{"level":"warn","message":"payments.ozow_timestamp_missing","timestamp":"2026-02-08T15:11:14.220Z"}

stderr | tests/integration/ozow-webhook.test.ts > Ozow webhook integration > rejects payloads without amounts
{"level":"warn","message":"payments.ozow_amount_missing","timestamp":"2026-02-08T15:11:14.220Z","data":{"paymentRef":"OZOW-123"}}

stderr | tests/integration/ozow-webhook.test.ts > Ozow webhook integration > rejects requests when rate limited
{"level":"warn","message":"payments.ozow_rate_limited","timestamp":"2026-02-08T15:11:14.226Z","data":{"ip":null}}

 ✓ tests/integration/ozow-webhook.test.ts (3 tests) 530ms
     ✓ accepts a valid webhook payload  507ms
stderr | tests/integration/payfast-webhook.test.ts > PayFast webhook integration - errors > accepts payloads without a timestamp
{"level":"warn","message":"payments.payfast_timestamp_missing","timestamp":"2026-02-08T15:11:14.228Z","data":{"paymentRef":"pay-123"}}

stderr | tests/integration/payfast-webhook.test.ts > PayFast webhook integration - errors > accepts payloads without a timestamp
{"level":"error","message":"webhooks.payload_board_failed","timestamp":"2026-02-08T15:11:14.228Z","data":{"dreamBoardId":"board-1","error":"DATABASE_URL is not set"}}

stderr | tests/integration/payfast-webhook.test.ts > PayFast webhook integration - errors > accepts payloads without a timestamp
{"level":"error","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:14.228Z","data":{"type":"contribution.received","error":"DATABASE_URL is not set"}}

stderr | tests/integration/payfast-webhook.test.ts > PayFast webhook integration - errors > accepts payloads without a timestamp
{"level":"warn","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:14.228Z","data":{"eventType":"contribution.received","contributionId":"contrib-1"}}

 ✓ tests/integration/payfast-webhook.test.ts (3 tests) 485ms
     ✓ accepts a valid ITN payload and updates contribution state  462ms
 ✓ tests/integration/create-flow-steps.test.ts (6 tests) 526ms
     ✓ full happy path: karri payout with no charity  474ms
 ✓ tests/integration/api-dream-boards-list-create.test.ts (16 tests) 569ms
     ✓ returns paginated dream boards  451ms
 ✓ tests/unit/reminder-modal.test.tsx (8 tests) 682ms
 ✓ tests/unit/amount-selector.test.tsx (16 tests) 835ms
 ✓ tests/unit/button.test.tsx (11 tests) 380ms
 ✓ tests/unit/contribute-payment.test.tsx (8 tests) 370ms
 ✓ tests/integration/contribute-two-step-flow.test.tsx (5 tests) 382ms
 ✓ tests/unit/create-step-giving-back.test.ts (8 tests) 230ms
 ✓ tests/integration/thank-you-display.test.tsx (8 tests) 494ms
 ✓ tests/unit/contributor-display.test.tsx (6 tests) 293ms
 ✓ tests/integration/api-payouts.test.ts (11 tests) 189ms
 ✓ tests/integration/public-board-display.test.tsx (9 tests) 314ms
stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - success > accepts a valid webhook payload
{"level":"error","message":"webhooks.payload_board_failed","timestamp":"2026-02-08T15:11:16.355Z","data":{"dreamBoardId":"board-1","error":"DATABASE_URL is not set"}}

stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - success > accepts a valid webhook payload
{"level":"error","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:16.356Z","data":{"type":"contribution.received","error":"DATABASE_URL is not set"}}

stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - success > accepts a valid webhook payload
{"level":"warn","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:16.357Z","data":{"eventType":"contribution.received","contributionId":"contrib-1"}}

 ✓ tests/integration/api-dream-boards-update.test.ts (11 tests) 211ms
stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - validation > rejects payloads without amounts
{"level":"warn","message":"payments.snapscan_amount_missing","timestamp":"2026-02-08T15:11:16.368Z","data":{"paymentRef":"SNAP-123"}}

stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - validation > accepts payloads without a timestamp
{"level":"warn","message":"payments.snapscan_timestamp_missing","timestamp":"2026-02-08T15:11:16.380Z"}

stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - validation > accepts payloads without a timestamp
{"level":"error","message":"webhooks.payload_board_failed","timestamp":"2026-02-08T15:11:16.380Z","data":{"dreamBoardId":"board-1","error":"DATABASE_URL is not set"}}

stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - validation > accepts payloads without a timestamp
{"level":"error","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:16.380Z","data":{"type":"contribution.received","error":"DATABASE_URL is not set"}}

stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - validation > accepts payloads without a timestamp
{"level":"warn","message":"webhooks.emit_failed","timestamp":"2026-02-08T15:11:16.380Z","data":{"eventType":"contribution.received","contributionId":"contrib-1"}}

 ✓ tests/integration/internal-contributions-create.test.ts (2 tests) 183ms
stderr | tests/integration/snapscan-webhook.test.ts > SnapScan webhook integration - rate limiting > rejects requests when rate limited
{"level":"warn","message":"payments.snapscan_rate_limited","timestamp":"2026-02-08T15:11:16.388Z","data":{"ip":null}}

 ✓ tests/integration/snapscan-webhook.test.ts (4 tests) 224ms
stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - updates > updates completed contributions from providers
{"level":"info","message":"reconciliation.ozow_paging_started","timestamp":"2026-02-08T15:11:16.468Z","data":{"phase":"primary","fromDate":"2026-01-22T08:00:00.000Z","toDate":"2026-02-08T15:11:16.467Z","pendingCount":1}}

stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - updates > updates completed contributions from providers
{"level":"info","message":"reconciliation.ozow_paging_completed","timestamp":"2026-02-08T15:11:16.468Z","data":{"phase":"primary","pagesFetched":1,"transactionCount":1,"pagingComplete":true}}

stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - updates > updates completed contributions from providers
{"level":"info","message":"reconciliation.snapscan_batch_started","timestamp":"2026-02-08T15:11:16.468Z","data":{"phase":"primary","fromDate":"2026-01-22T08:10:00.000Z","toDate":"2026-02-08T15:11:16.467Z","pendingCount":1}}

stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - updates > updates completed contributions from providers
{"level":"info","message":"reconciliation.snapscan_batch_completed","timestamp":"2026-02-08T15:11:16.469Z","data":{"phase":"primary","paymentCount":1}}

stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - mismatches > flags mismatches without updating
{"level":"info","message":"reconciliation.snapscan_batch_started","timestamp":"2026-02-08T15:11:16.474Z","data":{"phase":"primary","fromDate":"2026-01-22T08:10:00.000Z","toDate":"2026-02-08T15:11:16.473Z","pendingCount":1}}

stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - mismatches > flags mismatches without updating
{"level":"info","message":"reconciliation.snapscan_batch_completed","timestamp":"2026-02-08T15:11:16.474Z","data":{"phase":"primary","paymentCount":1}}

stderr | tests/integration/reconcile-payments.test.ts > payments reconciliation job - mismatches > flags mismatches without updating
{"level":"warn","message":"reconciliation.mismatch","timestamp":"2026-02-08T15:11:16.474Z","data":{"provider":"snapscan","paymentRef":"snap-ref","expectedTotal":5250,"receivedTotal":5100,"status":"completed","phase":"primary"}}

stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - long tail > reconciles long-tail contributions
{"level":"info","message":"reconciliation.long_tail_scan","timestamp":"2026-02-08T15:11:16.480Z","data":{"scanned":1}}

stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - long tail > reconciles long-tail contributions
{"level":"info","message":"reconciliation.snapscan_batch_started","timestamp":"2026-02-08T15:11:16.480Z","data":{"phase":"long_tail","fromDate":"2026-01-10T08:10:00.000Z","toDate":"2026-02-08T15:11:16.480Z","pendingCount":1}}

stdout | tests/integration/reconcile-payments.test.ts > payments reconciliation job - long tail > reconciles long-tail contributions
{"level":"info","message":"reconciliation.snapscan_batch_completed","timestamp":"2026-02-08T15:11:16.481Z","data":{"phase":"long_tail","paymentCount":1}}

 ✓ tests/integration/reconcile-payments.test.ts (4 tests) 185ms
 ✓ tests/integration/api-dream-boards.test.ts (8 tests) 253ms
 ✓ tests/unit/reminder-dispatch-service.test.ts (4 tests) 193ms
 ✓ tests/integration/api-dream-boards-close.test.ts (5 tests) 215ms
 ✓ tests/integration/health.test.ts (3 tests) 256ms
 ✓ tests/unit/progress-bar.test.tsx (12 tests) 310ms
 ✓ tests/integration/internal-upload.test.ts (3 tests) 141ms
 ✓ tests/integration/internal-contribution-reminders.test.ts (6 tests) 227ms
 ✓ tests/unit/webhook-dispatcher.test.ts (2 tests) 188ms
 ✓ tests/integration/whatsapp-webhook-route.test.ts (4 tests) 185ms
 ✓ tests/unit/create-step-dates.test.ts (7 tests) 218ms
 ✓ tests/integration/api-key-management.test.ts (3 tests) 306ms
 ✓ tests/integration/api-contributions.test.ts (3 tests) 168ms
stderr | tests/unit/create-step-payout.test.ts > savePayoutAction > returns karri_unavailable when verification throws
{"level":"error","message":"karri_card_verify_failed","timestamp":"2026-02-08T15:11:17.976Z","data":{"hostId":"host-1","error":"timeout"}}

 ✓ tests/integration/api-webhooks.test.ts (3 tests) 203ms
 ✓ tests/unit/create-step-payout.test.ts (8 tests) 260ms
 ✓ tests/integration/internal-debug-auth-events.test.ts (4 tests) 318ms
 ✓ tests/integration/internal-reminders-dispatch.test.ts (2 tests) 93ms
stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/analytics > returns 200 for valid web vitals payload
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/analytics > returns 400 for invalid metric name
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/analytics > returns 400 for missing required fields
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/analytics > returns 400 for invalid rating value
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/analytics > returns 400 for malformed JSON
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/metrics > returns 200 for valid custom metric payload
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/metrics > returns 400 for invalid metric name
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/metrics > returns 400 for missing timestamp
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/metrics > accepts all valid metric names
KV not configured. Using in-memory KV store for local development.

stderr | tests/unit/analytics-endpoints.test.ts > POST /api/internal/metrics > returns 400 for malformed JSON
KV not configured. Using in-memory KV store for local development.

 ✓ tests/unit/api-handler.test.ts (3 tests) 184ms
 ✓ tests/unit/analytics-endpoints.test.ts (10 tests) 234ms
 ✓ tests/unit/return-visit-banner.test.tsx (2 tests) 374ms
     ✓ ignores malformed stored contribution payloads  367ms
 ✓ tests/integration/internal-auth.test.ts (2 tests) 62ms
 ✓ tests/unit/snapscan-panel.test.tsx (1 test) 222ms
stdout | tests/integration/webhook-process.test.ts > POST /api/internal/webhooks/process > processes the webhook queue
{"level":"info","message":"webhooks.process_complete","timestamp":"2026-02-08T15:11:18.816Z","data":{"processed":3}}

 ✓ tests/integration/webhook-process.test.ts (1 test) 101ms
 ✓ tests/unit/db-index.test.ts (3 tests) 89ms
 ✓ tests/unit/mobile-nav.test.tsx (2 tests) 206ms
 ✓ tests/unit/ozow-pagination.test.ts (2 tests) 49ms
 ✓ tests/unit/ozow-token.test.ts (2 tests) 56ms
 ✓ tests/unit/admin-payout-documents.test.ts (3 tests) 57ms
 ✓ tests/unit/sentry-config.test.ts (2 tests) 44ms
 ✓ tests/unit/api-auth.test.ts (4 tests) 25ms
 ✓ tests/unit/guest-view-model.test.ts (17 tests) 64ms
 ✓ tests/unit/logger.test.ts (2 tests) 17ms
 ✓ tests/unit/payment-intent.test.ts (3 tests) 16ms
 ✓ tests/unit/time-remaining.test.tsx (6 tests) 162ms
 ✓ tests/unit/charitable-giving-card.test.tsx (3 tests) 9ms
 ✓ tests/unit/ozow-utils.test.ts (5 tests) 17ms
stderr | tests/unit/dream-board-image.test.tsx > DreamBoardImage > uses fallback when src is empty
Received `true` for a non-boolean attribute `fill`.

If you want to write it to the DOM, pass a string instead: fill="true" or fill={value.toString()}.
Received `false` for a non-boolean attribute `priority`.

If you want to write it to the DOM, pass a string instead: priority="false" or priority={value.toString()}.

If you used to conditionally omit it with priority={condition && value}, pass priority={condition ? value : undefined} instead.

 ✓ tests/unit/dream-board-image.test.tsx (2 tests) 10ms
 ✓ tests/unit/dream-board-cache.test.ts (3 tests) 17ms
 ✓ tests/unit/state-card.test.tsx (2 tests) 9ms
 ✓ tests/unit/useReducedMotion.test.ts (5 tests) 23ms
 ✓ tests/unit/payment-overlay.test.tsx (2 tests) 53ms
 ✓ tests/unit/whatsapp.test.ts (3 tests) 9ms
 ✓ tests/unit/contribute-details.test.tsx (8 tests) 5898ms
     ✓ enforces a 500-char birthday message cap  2564ms
     ✓ shows threshold styling text when approaching message limit  2758ms
 ✓ tests/unit/payout-automation.test.ts (6 tests) 11ms
 ✓ tests/unit/payment-failed-page.test.tsx (1 test) 26ms
stderr | tests/unit/payout-service-create.test.ts > payout service creation > skips legacy karri boards without throwing
{"level":"error","message":"payout_missing_karri_card","timestamp":"2026-02-08T15:11:20.407Z","data":{"dreamBoardId":"board-legacy","payoutEmail":"host@chipin.co.za"}}

 ✓ tests/unit/payout-service-create.test.ts (7 tests) 14ms
 ✓ tests/unit/startup-config.test.ts (5 tests) 18ms
stderr | tests/unit/middleware-auth-unavailable.test.ts > middleware auth unavailable > returns 503 for public pages when keys are missing
Clerk keys are missing. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.

 ✓ tests/unit/middleware-auth-unavailable.test.ts (5 tests) 11ms
 ✓ tests/unit/health-checks.test.ts (6 tests) 15ms
 ✓ tests/unit/karri-integration.test.ts (11 tests) 9ms
 ✓ tests/unit/api-rate-limit.test.ts (2 tests) 7ms
 ✓ tests/unit/middleware-public-routes.test.ts (4 tests) 2ms
 ✓ tests/unit/image-generation.test.ts (3 tests) 8ms
 ✓ tests/unit/admin-csv-and-settings.test.ts (3 tests) 3ms
 ✓ tests/unit/internal-job-endpoints.test.ts (2 tests) 5ms
 ✓ tests/unit/dream-board-view-model.test.ts (8 tests) 5ms
 ✓ tests/unit/payout-service.test.ts (5 tests) 7ms
 ✓ tests/unit/demo-mode.test.ts (5 tests) 6ms
 ✓ tests/unit/charity-service.test.ts (6 tests) 4ms
 ✓ tests/unit/blob-upload.test.ts (6 tests) 5ms
 ✓ tests/unit/charity-allocation.test.ts (7 tests) 5ms
 ✓ tests/unit/payfast-signature.test.ts (2 tests) 5ms
 ✓ tests/unit/payout-queries.test.ts (8 tests) 5ms
 ✓ tests/unit/host-dashboard-view-model.test.ts (1 test) 2ms
 ✓ tests/unit/webhook-utils.test.ts (6 tests) 5ms
 ✓ tests/unit/karri-batch.test.ts (4 tests) 5ms
 ✓ tests/unit/reconciliation-utils.test.ts (4 tests) 5ms
 ✓ tests/unit/encryption.test.ts (4 tests) 11ms
stderr | tests/unit/mock-db-guard.test.ts > assertNotProductionDb > throws when mock mode targets a production database
FATAL: Mock mode cannot run against a production database. Refusing to start.

 ✓ tests/unit/mock-db-guard.test.ts (4 tests) 5ms
 ✓ tests/unit/payout-calculation.test.ts (5 tests) 2ms
 ✓ tests/unit/demo-kv-mock.test.ts (4 tests) 8ms
 ✓ tests/unit/webhook-signature.test.ts (3 tests) 7ms
 ✓ tests/unit/admin-query-params.test.ts (5 tests) 10ms
 ✓ tests/unit/clerk-config.test.ts (4 tests) 4ms
 ✓ tests/unit/snapscan-signature.test.ts (1 test) 6ms
 ✓ tests/integration/admin-datasets.test.ts (2 tests) 5ms
 ✓ tests/unit/dream-board-validation.test.ts (3 tests) 4ms
 ✓ tests/unit/whatsapp-webhook-processing.test.ts (3 tests) 6ms
 ✓ tests/unit/rate-limit.test.ts (2 tests) 7ms
 ✓ tests/unit/openapi-spec.test.ts (4 tests) 11ms
 ✓ tests/unit/payment-recovery.test.ts (6 tests) 4ms
 ✓ tests/unit/date-range.test.ts (3 tests) 4ms
 ✓ tests/unit/host-create-view-model.test.ts (12 tests) 5ms
 ✓ tests/unit/date-utils.test.ts (3 tests) 4ms
 ✓ tests/unit/db-views.test.ts (3 tests) 2ms
 ✓ tests/unit/snapscan-utils.test.ts (5 tests) 3ms
 ✓ tests/unit/payment-failed-messages.test.ts (7 tests) 4ms
 ✓ tests/unit/retention-utils.test.ts (4 tests) 3ms
 ✓ tests/unit/dream-board-metadata.test.ts (1 test) 3ms
 ✓ tests/unit/guest-contribution-endpoint.test.ts (3 tests) 4ms
 ✓ tests/unit/middleware-clerk-protect.test.ts (2 tests) 2ms
 ✓ tests/unit/whatsapp-webhook-signature.test.ts (2 tests) 4ms
 ✓ tests/unit/reminder-templates.test.ts (3 tests) 5ms
 ✓ tests/unit/contribute-flow-storage.test.ts (7 tests) 6ms
 ✓ tests/unit/slug-utils.test.ts (2 tests) 4ms
 ✓ tests/integration/payout-actions.test.ts (1 test) 5ms
 ✓ tests/unit/payment-providers.test.ts (4 tests) 2ms
 ✓ tests/unit/ux-v2-write-path-gates.test.ts (4 tests) 2ms
 ✓ tests/unit/ui-copy.test.ts (1 test) 1ms
 ✓ tests/unit/payfast-itn.test.ts (3 tests) 2ms
 ✓ tests/unit/ip-utils.test.ts (4 tests) 3ms
 ✓ tests/unit/ux-v2-decision-locks.test.ts (4 tests) 2ms
 ✓ tests/unit/karri-batch-backoff.test.ts (2 tests) 2ms
 ✓ tests/unit/payment-recovery-write.test.ts (5 tests) 3ms
 ✓ tests/unit/payout-admin-copy.test.ts (2 tests) 1ms
 ✓ tests/unit/demo-utils.test.ts (2 tests) 2ms
 ✓ tests/unit/payment-fees.test.ts (1 test) 1ms
 ✓ tests/unit/schema-types.test.ts (1 test) 2ms
 ✓ tests/unit/normalize-email.test.ts (1 test) 1ms

 Test Files  126 passed (126)
      Tests  573 passed (573)
   Start at  17:11:13
   Duration  9.05s (transform 5.08s, setup 0ms, import 15.26s, tests 18.98s, environment 10.18s)

```

Contract command run:
- `pnpm openapi:generate && pnpm test tests/unit/openapi-spec.test.ts`

```text

> chipin@0.1.0 openapi:generate /Users/ryanlaubscher/Projects/gifta-codex5.3
> tsx scripts/generate-openapi.ts

OpenAPI spec written to /Users/ryanlaubscher/Projects/gifta-codex5.3/public/v1/openapi.json

> chipin@0.1.0 test /Users/ryanlaubscher/Projects/gifta-codex5.3
> vitest run --passWithNoTests tests/unit/openapi-spec.test.ts


 RUN  v4.0.17 /Users/ryanlaubscher/Projects/gifta-codex5.3

 ✓ tests/unit/openapi-spec.test.ts (4 tests) 5ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  17:11:48
   Duration  257ms (transform 56ms, setup 0ms, import 134ms, tests 5ms, environment 0ms)

```

## 4) Test Coverage (C3)
New C3 test files and counts:
- `tests/unit/contribute-flow-storage.test.ts`: 7 tests
- `tests/unit/contribute-details.test.tsx`: 8 tests
- `tests/unit/contribute-payment.test.tsx`: 8 tests
- `tests/unit/reminder-modal.test.tsx`: 8 tests
- `tests/unit/payment-recovery-write.test.ts`: 5 tests
- `tests/integration/contribute-two-step-flow.test.tsx`: 5 tests

C3-specific total: 41 tests.

Updated existing tests:
- `tests/unit/payment-recovery.test.ts`

Current full suite after C3:
- 126 test files
- 573 tests
- 100% pass on gate run

## 5) Spec Gaps / Deferred Items
- Backend contribution-create contract still enforces the existing message semantics; C3 UI allows up to 500 chars and truncates to 280 chars at payment submit (locked default retained, no backend contract changes).
- No new backend polling/status endpoints introduced for SnapScan in C3; existing QR panel pattern preserved.
- No schema, webhook, or fee-semantic changes performed (by design and contract).

## 6) P2 Deferred Items
- No additional P2 items deferred inside C3 scope.

## 7) Runtime Verification Notes
Two-step flow behavior verified by automated integration coverage (`tests/integration/contribute-two-step-flow.test.tsx`) and full suite gates:
- Step 1 saves flow data and routes to payment.
- Payment step restores flow state, enforces missing/expired redirect back to details, and submits provider payload with preserved money semantics.
- Anonymous contributions omit `contributorName` in API payload.
- Closed/expired dream boards are blocked on both routes with state-card rendering.
