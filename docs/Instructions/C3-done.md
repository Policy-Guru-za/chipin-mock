C3 complete.

Agent's feedback:
"✅ DONE: C3 contributor journey completion
Changes implemented:
* Two-step contributor flow shipped:
   * page.tsx
   * ContributeDetailsClient.tsx
   * page.tsx
   * PaymentClient.tsx
* Reminder modal added:
   * ReminderModal.tsx
* Flow storage bridge added:
   * flow-storage.ts
* Payment recovery contract updated (with legacy compatibility):
   * recovery.ts
   * PaymentFailedClient.tsx
* Legacy monolithic form removed/cleaned:
   * Deleted ContributionForm.tsx
   * Updated ContributionFormParts.tsx
   * Updated index.ts
* C3 tests added/updated:
   * contribute-flow-storage.test.ts
   * contribute-details.test.tsx
   * contribute-payment.test.tsx
   * reminder-modal.test.tsx
   * payment-recovery-write.test.ts
   * contribute-two-step-flow.test.tsx
   * Updated payment-recovery.test.ts
Verify:
* pnpm lint && pnpm typecheck && pnpm test passed.
* Full suite now: 126 files, 573 tests, all passing.
* openapi-spec.test.ts passed.
* Lint remains warnings-only (no errors), consistent with repo baseline.
Evidence + napkin updated:
* 20260208-C3-contributor-journey-completion.md
* napkin.md (## C3 Learnings (2026-02-08) appended)"

Next: 
* Review the evidence document and the updated napkin, then...
* conduct a comprehensive code review of these latest uncommitted codebase changes.