# Backlog

> **Status:** Current operational queue  
> **Last reviewed:** March 12, 2026

Durable debt only. Do not use this file as the live tracker for active work sessions; use [`progress.md`](./progress.md) and [`spec/`](./spec/) instead.

- [ ] Fix Karri batch pending retry bookkeeping in [`src/lib/integrations/karri-batch.ts`](./src/lib/integrations/karri-batch.ts) so pending responses keep the incremented attempt count. Owner: Ryan. ETA: next payout hardening pass.
- [ ] Fix seed/demo correctness in [`src/lib/db/seed.ts`](./src/lib/db/seed.ts): encrypt seeded Karri card numbers and keep seeded webhook/event data aligned with runtime contracts. Owner: Ryan. ETA: next demo-data pass.
- [ ] Expand `pnpm docs:audit` token coverage if new classes of doc drift appear. Owner: Ryan. ETA: ongoing.
- [ ] Review whether current Tier 2 UX spec files should be promoted back to current-reference after the next major UI/doc sync. Owner: Ryan. ETA: after next UX milestone.
