# PHASE0_ORIENTATION.md — ChipIn Codebase Reference

> Generated: 2026-01-29
> Purpose: Structured orientation for DEMO_MODE conversion

---

## 1. STACK & FRAMEWORK

| Attribute | Value |
|-----------|-------|
| Framework | Next.js 16.1.4 (App Router) |
| Language | TypeScript (strict mode) |
| Runtime | Node.js >=20 <21 |
| Package Manager | pnpm 10.14.0 |
| Monorepo | No — single app |

### Config Files
| File | Purpose |
|------|---------|
| `next.config.js` | Next.js config, wrapped with Sentry |
| `tsconfig.json` | Strict mode, `@/*` path alias |
| `tailwind.config.ts` | Custom theme (Outfit/Fraunces fonts, custom palette) |
| `drizzle.config.ts` | Drizzle ORM config |
| `vitest.config.ts` | Test runner config |

---

## 2. ENTRYPOINTS

| Type | Path |
|------|------|
| App Layout | `src/app/layout.tsx` |
| Instrumentation | `src/instrumentation.ts` |
| Global CSS | `src/app/globals.css` |

### Commands
| Command | Script |
|---------|--------|
| Dev | `pnpm dev` → `next dev` |
| Build | `pnpm build` → `next build` |
| Start | `pnpm start` → `next start` |
| Lint | `pnpm lint` → `eslint .` |
| Typecheck | `pnpm typecheck` → `tsc --noEmit` |
| Test | `pnpm test` → `vitest run --passWithNoTests` |
| Test Coverage | `pnpm test:coverage` → `vitest run --coverage` |
| DB Seed | `pnpm db:seed` → `tsx scripts/seed.ts` |
| DB Generate | `pnpm drizzle:generate` → `drizzle-kit generate` |
| DB Push | `pnpm drizzle:push` → `drizzle-kit push` |
| OpenAPI Gen | `pnpm openapi:generate` → `tsx scripts/generate-openapi.ts` |
| Dead Code | `pnpm knip` → `knip` |

---

## 3. ENVIRONMENT & CONFIG

### Env Loading
- Standard Next.js `process.env.*` loading
- No explicit dotenv import

### Env Files
- `.env*` files are gitignored (not in repo)
- Reference variables documented in `AGENTS.md`

### Config Validation
- No centralized startup validation
- Individual integrations throw on missing credentials:
  - `getPayfastConfig()` in `src/lib/payments/payfast.ts`
  - `getOzowConfig()` in `src/lib/payments/ozow.ts`
  - `getSnapScanConfig()` in `src/lib/payments/snapscan.ts`
  - `getResendClient()` in `src/lib/integrations/email.ts`

---

## 4. ROUTING & API STRUCTURE

### Pages / Route Groups
| Route Group | Path | Purpose |
|-------------|------|---------|
| (marketing) | `src/app/(marketing)/` | Landing page |
| (host) | `src/app/(host)/` | Host dashboard, creation wizard |
| (guest) | `src/app/(guest)/` | Dream board view, contribution flow |
| (admin) | `src/app/(admin)/` | Admin panel |
| auth | `src/app/auth/` | Login, verify, logout |
| health | `src/app/health/` | Health endpoints |

### API Routes
| Path | Purpose |
|------|---------|
| `src/app/api/v1/dream-boards/` | Public API: Dream boards CRUD |
| `src/app/api/v1/contributions/` | Public API: Contributions |
| `src/app/api/v1/payouts/` | Public API: Payouts |
| `src/app/api/v1/webhooks/` | Public API: Partner webhook config |
| `src/app/api/internal/auth/` | Internal: Auth endpoints |
| `src/app/api/internal/upload/` | Internal: File uploads |
| `src/app/api/internal/products/` | Internal: Product lookups |
| `src/app/api/internal/analytics/` | Internal: Analytics |
| `src/app/api/internal/metrics/` | Internal: Metrics |
| `src/app/api/internal/api-keys/` | Internal: API key management |
| `src/app/api/internal/contributions/` | Internal: Contribution management |
| `src/app/api/internal/payments/` | Internal: Payment processing |
| `src/app/api/internal/payouts/` | Internal: Payout processing |
| `src/app/api/internal/retention/` | Internal: Retention data |
| `src/app/api/internal/webhooks/` | Internal: Webhook management |
| `src/app/api/webhooks/payfast/` | Webhook: PayFast ITN |
| `src/app/api/webhooks/ozow/` | Webhook: Ozow notifications |
| `src/app/api/webhooks/snapscan/` | Webhook: SnapScan notifications |
| `src/app/api/health/` | Health check endpoints |

### Route Registration
- App Router file-based routing (no central registration file)

---

## 5. DATABASE

| Attribute | Value |
|-----------|-------|
| ORM | Drizzle ORM 0.33.0 |
| Client | `@neondatabase/serverless` (Neon PostgreSQL) |
| DB Init | `src/lib/db/index.ts` |
| Schema | `src/lib/db/schema.ts` |
| Migrations Dir | `drizzle/migrations/` |
| Seed Entry | `scripts/seed.ts` |
| Seed Logic | `src/lib/db/seed.ts` |
| Queries | `src/lib/db/queries.ts` |
| API Queries | `src/lib/db/api-queries.ts` |
| API Key Queries | `src/lib/db/api-key-queries.ts` |
| Views | `src/lib/db/views.ts` |
| Partners | `src/lib/db/partners.ts` |

### Tables (from schema)
| Table | Purpose |
|-------|---------|
| `hosts` | Host accounts |
| `partners` | Partner organizations |
| `dreamBoards` | Gift pooling boards |
| `contributions` | Guest contributions |
| `payouts` | Payout records |
| `payoutItems` | Individual payout line items |
| `auditLogs` | Audit trail |
| `apiKeys` | Partner API keys |
| `webhookEndpoints` | Partner webhook URLs |
| `webhookEvents` | Outbound webhook event queue |

### Migration Files
- `0000_lonely_ronan.sql` — Initial schema
- `0001_workable_starbolt.sql`
- `0002_tranquil_firestar.sql`
- `0003_sticky_logan.sql`
- `0004_clumsy_dragon_lord.sql`
- `0005_add_contributions_pending_processing_index.sql`
- `0006_add_pagination_indexes.sql`
- `0007_add_db_views.sql`

---

## 6. EXTERNAL INTEGRATIONS

### 6.1 Payments
| Provider | Init/Config Path |
|----------|------------------|
| PayFast | `src/lib/payments/payfast.ts` |
| Ozow | `src/lib/payments/ozow.ts` |
| SnapScan | `src/lib/payments/snapscan.ts` |
| Abstraction Layer | `src/lib/payments/index.ts` |
| Fee Calculation | `src/lib/payments/fees.ts` |
| Reconciliation | `src/lib/payments/reconciliation.ts` |
| Reconciliation Job | `src/lib/payments/reconciliation-job.ts` |
| Reference Gen | `src/lib/payments/reference.ts` |
| Webhook Utils | `src/lib/payments/webhook-utils.ts` |

### 6.2 Commerce / Product APIs
| Integration | Init/Config Path |
|-------------|------------------|
| Takealot Product Scraper | `src/lib/integrations/takealot.ts` |
| Takealot Gift Cards | `src/lib/integrations/takealot-gift-cards.ts` |
| Karri Card Top-up | `src/lib/integrations/karri.ts` |
| GivenGain (Philanthropy) | `src/lib/integrations/givengain.ts` |

### 6.3 Notifications
| Integration | Init/Config Path |
|-------------|------------------|
| Email (Resend) | `src/lib/integrations/email.ts` |

### 6.4 Storage
| Integration | Init/Config Path |
|-------------|------------------|
| Vercel Blob | `src/lib/integrations/blob.ts` |

### 6.5 Cache / KV
| Integration | Usage Locations |
|-------------|-----------------|
| Vercel KV | `src/lib/auth/session.ts` (sessions) |
| | `src/lib/auth/magic-link.ts` (tokens) |
| | `src/lib/auth/rate-limit.ts` (rate limiting) |
| | `src/lib/integrations/takealot.ts` (product cache) |
| | `src/lib/payments/ozow.ts` (access token cache) |

### 6.6 Error Tracking
| Integration | Config Path |
|-------------|-------------|
| Sentry (Client) | `sentry.client.config.ts` |
| Sentry (Server) | `sentry.server.config.ts` |
| Sentry (Edge) | `sentry.edge.config.ts` |

### 6.7 Observability / Analytics
| Integration | Config Path |
|-------------|-------------|
| OpenTelemetry Init | `src/instrumentation.ts` |
| OTEL Exporter | `src/lib/observability/otel.ts` |
| Web Vitals | `src/lib/analytics/web-vitals.ts` |
| Metrics | `src/lib/analytics/metrics.ts` |

### 6.8 Shared HTTP Client Wrappers
- **None found** — all integrations use direct `fetch()` calls

### 6.9 Outbound Call Origins
| File | External Target |
|------|-----------------|
| `src/lib/integrations/takealot.ts` | `takealot.com` (HTML scraping) |
| `src/lib/integrations/email.ts` | Resend API |
| `src/lib/integrations/givengain.ts` | GivenGain API (`GIVENGAIN_API_URL`) |
| `src/lib/integrations/karri.ts` | Karri API (`KARRI_BASE_URL`) |
| `src/lib/integrations/takealot-gift-cards.ts` | Takealot Gift Card API (`TAKEALOT_GIFTCARD_API_URL`) |
| `src/lib/payments/payfast.ts` | PayFast validation endpoint |
| `src/lib/payments/ozow.ts` | Ozow token/payments/transactions APIs (`OZOW_BASE_URL`) |
| `src/lib/payments/snapscan.ts` | SnapScan payments API (`pos.snapscan.io`) |

---

## 7. BACKGROUND JOBS / WORKERS

| Type | Status |
|------|--------|
| Workers | Not found in codebase |
| Cron jobs | Not found in codebase |
| Queues | Not found in codebase |

### Reconciliation
- `src/lib/payments/reconciliation-job.ts` exports `reconcilePending()` function
- Invoked on-demand (likely via API endpoint), not scheduled
- No Vercel cron config found

---

## 8. AUTHENTICATION

| Attribute | Value |
|-----------|-------|
| Approach | Magic link (passwordless) + session cookies |
| Session Store | Vercel KV |
| Session TTL | 7 days |
| Magic Link TTL | 1 hour |

### Auth Files
| File | Purpose |
|------|---------|
| `src/lib/auth/magic-link.ts` | Token generation, email sending, verification |
| `src/lib/auth/session.ts` | Session CRUD, admin allowlist check |
| `src/lib/auth/rate-limit.ts` | Rate limiting for auth endpoints |

### Auth Pages
| Path | Purpose |
|------|---------|
| `src/app/auth/login/` | Email input form |
| `src/app/auth/verify/` | Magic link verification |

### API Authentication
| File | Purpose |
|------|---------|
| `src/lib/api/auth.ts` | Partner API key validation |
| `src/lib/db/api-key-queries.ts` | API key DB queries |
| `src/lib/api/internal-auth.ts` | Internal API auth |

### Admin Access
- Controlled via `ADMIN_EMAIL_ALLOWLIST` env var
- Checked in `src/lib/auth/session.ts` → `isAdminEmail()`

---

## 9. COMPONENTS STRUCTURE

| Directory | Purpose |
|-----------|---------|
| `src/components/ui/` | shadcn/ui base components |
| `src/components/dream-board/` | Dream board display components |
| `src/components/forms/` | Form components |
| `src/components/layout/` | Header, footer, navigation |
| `src/components/animations/` | Animation components |
| `src/components/effects/` | Visual effects (confetti) |
| `src/components/gift/` | Gift display components |
| `src/components/icons/` | Icon components |
| `src/components/payment/` | Payment UI components |
| `src/components/shared/` | Shared utility components |

---

## 10. WEBHOOKS (OUTBOUND)

| File | Purpose |
|------|---------|
| `src/lib/webhooks/index.ts` | Webhook module exports |
| `src/lib/webhooks/dispatcher.ts` | Event dispatch logic |
| `src/lib/webhooks/payloads.ts` | Payload builders |
| `src/lib/webhooks/queries.ts` | Webhook endpoint queries |
| `src/lib/webhooks/signature.ts` | HMAC signature generation |
| `src/lib/webhooks/types.ts` | Type definitions |

---

## 11. SUMMARY FOR DEMO_MODE CONVERSION

### Key Integration Points to Stub/Mock

| Priority | Integration | Location |
|----------|-------------|----------|
| P0 | PayFast payments | `src/lib/payments/payfast.ts` |
| P0 | Ozow payments | `src/lib/payments/ozow.ts` |
| P0 | SnapScan payments | `src/lib/payments/snapscan.ts` |
| P0 | Payment abstraction | `src/lib/payments/index.ts` |
| P1 | Takealot product scraper | `src/lib/integrations/takealot.ts` |
| P1 | Takealot gift cards | `src/lib/integrations/takealot-gift-cards.ts` |
| P1 | Karri top-up | `src/lib/integrations/karri.ts` |
| P1 | GivenGain donations | `src/lib/integrations/givengain.ts` |
| P2 | Email (Resend) | `src/lib/integrations/email.ts` |
| P2 | Vercel Blob | `src/lib/integrations/blob.ts` |
| P2 | Vercel KV | Multiple locations (auth, cache) |
| P3 | Neon PostgreSQL | `src/lib/db/index.ts` |

### No Background Jobs to Stub
- All operations are request-driven

### Env Vars to Consider for DEMO_MODE Toggle
- `DEMO_MODE=true` (new)
- Payment provider credentials (can be omitted in demo)
- `DATABASE_URL` (may need in-memory alternative)
- `KV_*` vars (may need in-memory alternative)
