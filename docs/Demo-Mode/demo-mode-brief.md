# Demo Mode: Implementation Brief for AI Coding Agent

## Context and objective

Gifta is a mobile-first birthday gifting platform. The core product works: hosts can sign in, create a Dreamboard (a shareable page for one child's birthday + one dream gift), and share it via WhatsApp. Guests arrive at the shared link and see the Dreamboard.

**The problem:** Payment provider integration is not yet live. This means:

- No real contributions flow through the system.
- No Dreamboards exist with contributor messages, contributor avatars, or social proof.
- No Dreamboards exist in closed, paid-out, or post-campaign states.
- The host dashboard has nothing meaningful to display.
- The admin panel has no operational data.

**The objective:** Build a demo mode that showcases the full Gifta lifecycle with rich, realistic data — so that investors, payment partners, and creative/brand partners can experience the platform as it will look and feel when fully operational.

**What does NOT need mocking:** The create wizard flow (Steps 1–6). This works in production today and can be demonstrated live. The demo mode covers everything *after* creation: the guest-facing Dreamboard with social proof, the contribution flow (up to but not including actual payment), host dashboard views, and post-campaign/payout states.

---

## Critical product constraints

These constraints are locked design decisions. The demo must respect them:

1. **No funding targets.** Gifta removed all goal/target mechanics. There are no progress bars, no "X% funded" indicators, no goal amounts. The social proof is purely participation-based: how many people have chipped in, not how much.

2. **No individual contribution amounts displayed.** Gifta deliberately hides individual amounts to prevent social pressure and embarrassment. The guest-facing Dreamboard shows contributor names/initials (as avatar circles) and a count ("8 loved ones have chipped in"). The host dashboard contribution list shows names, messages, and timestamps — never amounts. The only place amounts appear is in private payout accounting (host dashboard payout section, admin views).

3. **No authentication required for the demo.** The demo walkthrough must be zero-auth. Guest pages are already public. Host dashboard and admin pages — which normally require Clerk authentication — must be accessible without signing in during a demo.

4. **Child images are pre-made.** AI-generated child illustrations are available and will be provided as assets. No need to source or generate these.

---

## What the demo must showcase

### Guest-facing Dreamboard (`/[slug]`)

Four Dreamboards at different lifecycle stages:

**Board 1 — Active, early momentum (e.g. "Layla turns 5")**
- 3–4 contributions, campaign has ~12 days left.
- Contributor avatars visible (mix of named + anonymous).
- 2 visible birthday messages from contributors.
- CTA state: "4 people have chipped in. 12 days left to chip in 🎁"
- Charity enabled (percentage split). CharitableGivingCard visible.
- This board demonstrates the guest contribution flow — tapping "Chip in" should navigate through the contribute details page and payment selection page with realistic content.

**Board 2 — Active, strong social proof + urgency (e.g. "Noah turns 7")**
- 8–10 contributions, 3 days left.
- Rich contributor avatar row with +N overflow.
- Multiple heartfelt messages from a believable mix of people.
- CTA state: "10 people have chipped in. Just 3 days left! 🎁"
- No charity — keeps it clean to contrast with Board 1.
- This is the board to share live via WhatsApp during a demo.

**Board 3 — Closed, post-campaign (e.g. "Amara turns 3")**
- 12–15 contributions, campaign ended.
- Guest page shows closed state: "This Dreamboard is closed to new contributions."
- CTA disabled, contribution button replaced with closed message.
- Charity enabled (threshold split). CharitableGivingCard visible.
- Host dashboard shows post-campaign view with all messages, payout status "Completed".

**Board 4 — Paid out, full lifecycle complete (e.g. "Zara turns 10")**
- 6 contributions, campaign ended, payout completed weeks ago.
- Guest page shows closed state.
- Host dashboard shows the final archive: all messages, payout "Completed" (green) with Karri Card reference and completion date.
- This board exists primarily for the host dashboard demo.

### Guest contribution flow (`/[slug]/contribute` → `/[slug]/contribute/payment` → `/[slug]/thanks`)

Navigable on Boards 1 and 2 (active boards). The demo should allow:

- Amount selection (R150 / R250 / R500 / custom) — this is private to the contributor, consistent with the no-amounts-displayed constraint.
- Name + optional anonymity toggle.
- Message textarea with character counter.
- Payment provider selection page showing PayFast, Ozow, SnapScan options.
- Thank-you page with confetti, receipt capture, charity impact display (if applicable), and share CTA.

The contribution flow should work end-to-end in demo mode — meaning a demo user can complete a "contribution" that appears on the board (new avatar, new message) without real payment processing.

### Host dashboard (`/dashboard` → `/dashboard/[id]`)

Accessible without authentication in demo mode. Shows:

- **Dashboard list:** All 4 demo boards as timeline cards with status badges, contribution counts, and dates.
- **Active board detail (Boards 1 & 2):** Contribution list (names, messages, timestamps — no amounts), message wall, share/edit/view quick actions, payout section showing "Pending".
- **Post-campaign detail (Board 3):** Final summary, all messages, payout status "Completed", charity payout line item.
- **Archived detail (Board 4):** Same as Board 3 but with older dates, showing the platform's archival state.

### Admin dashboard (`/admin`)

Accessible without authentication in demo mode. Shows:

- Stats cards: Total GMV (last 30 days), active Dreamboards, total contributors, fees retained.
- "Requires attention" section with pending payout counts.
- Payout queue with records across all 4 boards at varying statuses.
- Contribution list populated from all demo boards.

### Thank-you page (`/[slug]/thanks`)

Rendered with realistic contribution data:

- Personalised headline: "Thank you, [Name]!"
- Confetti animation.
- Charity impact line (for charity-enabled boards).
- Share CTA and receipt email input.

---

## Content requirements

### Contributor personas (across all 4 boards, ~25–30 total)

Each contributor needs: a name (South African, culturally diverse), a relationship context (implied by the message tone), an optional message (max 500 chars), and an anonymity flag. Messages should feel like real WhatsApp-generation people writing for a child's birthday — warm, casual, sometimes bilingual (English/Afrikaans), occasionally emoji-heavy.

Examples of tone:
- "Vir my liefste kleinkind — mag jy groot droom! Ouma is so trots op jou."
- "Happy birthday little man! Can't wait to see you open your gift 🎁🎉"
- "From the Naidoo family — wishing you the most magical birthday, sweetheart."
- "You deserve the world, baby girl. Love from Aunty Thandi and Uncle Siya 💛"
- 2–3 anonymous contributions (no message, or short message like "Enjoy! 🎂")

### Charity data (2 charities)

The seed must create at least 2 charities:

1. **A children's literacy organisation** (for Board 1, percentage split). Needs: name, description, category, logoUrl, isActive.
2. **Reach for a Dream** or similar (for Board 3, threshold split). Needs: same fields.

Logo images can be placeholder PNGs in `/public/demo/` or URLs if available.

### Gift choices (4 boards)

Each board has one gift. Suggestions (to be confirmed by product owner):
- Board 1: Polaroid camera
- Board 2: Telescope
- Board 3: Wooden play kitchen
- Board 4: Art supplies set

Gift icons: use the universal Gifta logo (`/icons/gifts/gifta-logo.png`) per the Step 2 simplification decision — all new boards use this logo instead of per-gift category icons.

### Payout records (Boards 3 & 4)

- Board 3: Karri Card payout, status `completed`, with `externalRef` (e.g. "KRR-2026-00487"), `completedAt` set to ~2 weeks ago.
- Board 4: Karri Card payout, status `completed`, with `externalRef`, `completedAt` set to ~6 weeks ago.
- Board 3 also has a charity payout: type `charity`, status `completed`.
- Boards 1 & 2: Karri Card payout, status `pending` (campaign still active).

---

## Existing infrastructure to leverage

### Mock flags (`.env.demo`)

The codebase already has sandbox flags:
```
MOCK_PAYMENTS=true
MOCK_PAYMENT_WEBHOOKS=true
MOCK_KARRI=true
MOCK_SENTRY=true
```

These are checked via `/src/lib/config/feature-flags.ts`:
- `isMockPayments()` — simulates payment responses
- `isMockPaymentWebhooks()` — skips webhook validation
- `isMockKarri()` — mocks Karri Card payout API

There is also a safety guard: `assertNotProductionDb()` blocks mock mode against production databases.

### Existing seed script

`/src/lib/db/seed.ts` (run via `pnpm db:seed`) currently:
1. Truncates all tables.
2. Creates a default partner (UUID: `00000000-0000-0000-0000-000000000001`).
3. Creates one host: Lerato Mahlangu (`lerato@chipin.co.za`).
4. Creates one active Dreamboard ("maya-birthday-demo") with 1 contribution and 1 pending payout.
5. Creates a test API key and webhook event.

This script is idempotent (truncates first) and uses Drizzle ORM typed inserts.

### Auth system (Clerk)

Routes are protected by Clerk middleware in `/src/middleware.ts`. Protected routes: `/dashboard/*`, `/create/*`, `/admin/*`. Guest routes (`/[slug]`, `/[slug]/contribute/*`, `/[slug]/thanks`) are public.

Key auth functions in `/src/lib/auth/clerk.ts`:
- `requireClerkUser()` — used by host pages; redirects to sign-in on failure.
- `requireAdminClerkUser()` — used by admin pages; checks email allowlist.

### Database

PostgreSQL via Drizzle ORM. Connection configured in `/src/lib/db/index.ts` with two driver options: `node-postgres` (local) or Neon HTTP (serverless/Vercel). Schema in `/src/lib/db/schema.ts`.

`.env.demo` points at `postgresql://localhost:5432/chipin_demo` with `DATABASE_DRIVER=pg`.

### Guest view model

`buildGuestViewModel()` in `/src/lib/dream-boards/view-model.ts` computes the full guest page data shape from a `DreamBoardRecord`. Key fields: `contributionCount`, `timeRemainingMessage`, `timeRemainingUrgency`, `isActive`, `isFunded`, `isClosed`, `isExpired`, `charityAllocationLabel`. The guest page consumes this view model directly.

### Contributor display

`ContributorDisplay` in `/src/components/dream-board/ContributorDisplay.tsx` renders contributor avatars (initials in circles, max 6 shown, overflow count). Input: `contributors: { name, isAnonymous }[]` and `totalCount: number`. No amounts anywhere.

### CTA card

`DreamboardCtaCard` in `/src/components/dream-board/DreamboardCtaCard.tsx` renders the call-to-action with state-dependent messaging via `buildDreamboardCtaStateMessage()`. States: zero contributions, active with contributions, funded, expired/closed.

### Demo DB reset procedure

Documented in `/docs/demo_db_full_reset.md`:
1. Drop and recreate schema.
2. `pnpm drizzle:push` to apply current schema.
3. Apply SQL views from migrations.
4. `pnpm db:seed` to seed data.

---

## Implementation options

The following are distinct architectural approaches. Each has different tradeoffs around fidelity, maintenance burden, production safety, and implementation effort. The options are not mutually exclusive — some could be combined.

### Option A: Expanded seed script against a dedicated demo database

**What it is:** Extend the existing `/src/lib/db/seed.ts` to create the 4 Dreamboards, 25–30 contributions, payout records, and charity records described above. Run this seed against a separate PostgreSQL database (`chipin_demo`) that the app connects to via `.env.demo`. Deploy the app locally or on a preview branch pointed at this database.

**Auth bypass:** Add a `DEMO_AUTH_BYPASS=true` environment variable. When set, the auth functions (`requireClerkUser`, `requireAdminClerkUser`) return a hardcoded demo host/admin user instead of checking Clerk. Middleware skips `auth.protect()` for protected routes.

**How contributions work in the demo:** The seed pre-populates all contributions. If a live demo user wants to make a new contribution during a walkthrough, `MOCK_PAYMENTS=true` already simulates payment — so the full contribute flow would work end-to-end, with the contribution appearing on the board afterward.

**What changes:**
- `/src/lib/db/seed.ts` — expanded with 4 boards, ~30 contributions, charities, payouts.
- `/src/lib/auth/clerk.ts` — add `DEMO_AUTH_BYPASS` check at the top of `requireClerkUser()` and `requireAdminClerkUser()`.
- `/src/middleware.ts` — skip `auth.protect()` when `DEMO_AUTH_BYPASS=true`.
- `/public/demo/` — child images + charity logos as static assets.
- No changes to any component, page, or view model code.

**Tradeoffs:**
- Highest fidelity: investors see the real app, real components, real data flow.
- Zero component-level changes — entirely data-layer and auth-layer.
- Requires a running PostgreSQL instance for the demo database.
- Seed script must be maintained as the schema evolves.
- Auth bypass code exists in production source (behind env var), which some teams consider a security smell — though `assertNotProductionDb()` already guards against accidental activation.
- If the demo database gets corrupted or schema drifts, re-seeding requires running the full reset procedure.

### Option B: Demo mode with hardcoded view models (no database)

**What it is:** Add a `DEMO_MODE=true` environment variable. When set, specific page-level data fetchers return hardcoded view model objects instead of querying the database. The four Dreamboards and their contributions exist only as TypeScript constants — no database needed at all.

**Auth bypass:** Same as Option A — `DEMO_AUTH_BYPASS=true` short-circuits auth.

**How it works:** Each route's server component (e.g. `/[slug]/page.tsx`, `/dashboard/page.tsx`, `/dashboard/[id]/page.tsx`) checks `isDemoMode()` before calling the database query. If true, it resolves the slug or ID against a `DEMO_BOARDS` map and returns the pre-built view model. Guest pages, host dashboard, admin dashboard — all served from static data.

**What changes:**
- New file: `/src/lib/demo/data.ts` — all 4 board view models, contribution lists, payout records, charity data as typed constants.
- New file: `/src/lib/demo/demo-mode.ts` — `isDemoMode()` helper, `getDemoBoardBySlug()`, `getDemoDashboardList()`, `getDemoBoardDetail()`, etc.
- `/src/lib/auth/clerk.ts` and `/src/middleware.ts` — same auth bypass as Option A.
- Each page-level server component — add `if (isDemoMode())` branch at the top of the data-fetching logic. Approximately 8–10 files.
- `/public/demo/` — child images + charity logos.

**Tradeoffs:**
- No database dependency at all — the demo can run anywhere, even as a static-ish deployment.
- Fast to iterate on content (edit TypeScript constants, no re-seeding).
- Requires conditional branches in ~10 page files, which adds maintenance surface.
- The contribution flow would NOT work end-to-end (no database to write to), so "Chip in" on active boards would need to either be disabled, show a "demo mode" toast, or redirect to the thank-you page with mock data.
- Less fidelity than Option A: the data doesn't flow through the same query/view-model pipeline, so subtle rendering differences could exist between demo and production.
- Risk of demo view models drifting from the real view model types as the codebase evolves.

### Option C: Separate Vercel preview deployment with seeded database

**What it is:** A dedicated Vercel preview deployment (e.g. `demo.gifta.co.za` or a Vercel preview URL) running the same codebase from a `demo` branch, connected to its own Neon (or other hosted) PostgreSQL database. The seed script from Option A populates this database. The `.env` for this deployment sets all mock flags and `DEMO_AUTH_BYPASS=true`.

**Auth bypass:** Same mechanism as Option A, activated via the deployment's environment variables.

**What changes (codebase):** Identical to Option A — expanded seed script + auth bypass. The difference is operational: instead of running locally, you deploy to a persistent, shareable URL.

**Additional operational steps:**
- Create a Neon (or equivalent) database for demo.
- Configure Vercel preview environment variables.
- Run the seed script against the demo database (one-time, or via a CI step on the demo branch).
- Optionally set up a scheduled re-seed (e.g. weekly) to keep dates fresh and prevent boards from expiring.

**Tradeoffs:**
- Most polished for investor demos: hand someone a URL, no local setup, works on their phone.
- Same high fidelity as Option A (real app, real data).
- Ongoing cost: hosted database + Vercel deployment (likely minimal on free/hobby tiers).
- Requires maintaining the demo branch (or using `main` with demo env vars).
- Dates in seed data will go stale — if a board is seeded with "party in 12 days" and the demo is shown 3 weeks later, the board will be expired. This needs either dynamic date calculation in the seed script (dates relative to `now()`) or periodic re-seeding.
- More operational overhead than Options A or B.

### Option D: Demo showcase route with in-memory data

**What it is:** A single new route — `/demo` — that renders a purpose-built showcase page. This page is not part of the normal app navigation. It displays the four Dreamboards as interactive cards, each linking to the real guest-facing page for that board. The data backing those pages comes from the same hardcoded approach as Option B, but scoped to a `/demo/*` route namespace instead of conditional branches in existing pages.

**Auth bypass:** The `/demo` route and all sub-routes are added to the public route matcher in middleware. No auth bypass needed for existing routes — the demo lives in its own namespace.

**How it works:**
- `/demo` — landing page with 4 board cards + a "Host Dashboard" card + an "Admin" card.
- `/demo/board/[slug]` — renders the same guest page components but with demo data injected via props (not database queries).
- `/demo/dashboard` — renders the dashboard components with demo data.
- `/demo/admin` — renders admin components with demo data.
- Existing routes (`/[slug]`, `/dashboard`, `/admin`) are untouched.

**What changes:**
- New route tree: `/src/app/demo/` with ~6–8 new page files that compose existing components with demo data.
- New file: `/src/lib/demo/data.ts` — same as Option B.
- `/src/middleware.ts` — add `/demo(.*)` to public routes.
- `/public/demo/` — child images + charity logos.
- No changes to any existing page, component, auth function, or query.

**Tradeoffs:**
- Zero risk to production: no auth bypass, no conditional branches in existing code, no database changes.
- Complete isolation — the demo route tree can be removed cleanly when no longer needed.
- Contribution flow would not work end-to-end (same limitation as Option B).
- Requires creating ~8 new page files that compose existing components, which means understanding their props interfaces and keeping them in sync.
- The demo pages are technically *different* pages from the real ones (even though they render the same components), so there's a subtle fidelity gap.
- More code to write upfront than Options A or C, but more contained.

### Option E: Hybrid — Seeded database + demo showcase entry point

**What it is:** Combine Option A (seeded database) with a lightweight showcase entry point. The seed script creates all 4 boards with rich data. A single new `/demo` page provides a curated entry point with cards linking to the real guest pages (e.g. `/layla-turns-5`, `/noah-turns-7`) and the real dashboard (with auth bypass). The demo showcase page is just a table of contents — the actual pages are the production pages, running against seeded data.

**Auth bypass:** Same as Option A.

**What changes:**
- Everything from Option A (expanded seed, auth bypass).
- One new page: `/src/app/demo/page.tsx` — a simple grid of cards linking to the 4 demo board slugs, the dashboard, and the admin panel.
- `/src/middleware.ts` — add `/demo` to public routes.

**Tradeoffs:**
- Best of both worlds: highest fidelity (real pages, real data) with a polished entry point for demos.
- Contribution flow works end-to-end (MOCK_PAYMENTS handles it).
- Requires database + auth bypass (same considerations as Option A).
- Slightly more work than Option A alone, but the showcase page is trivial.
- The showcase page gives demos a professional, intentional feel rather than "let me type in a URL."

---

## Key technical considerations for all options

### Date freshness

Any approach using seeded data with absolute dates will go stale. Boards seeded with `partyDate: '2026-03-05'` will show as expired after March 5th. Two mitigations:

1. **Relative dates in the seed script:** Compute all dates relative to `new Date()` at seed time. "Board 1 party date = 14 days from now." Re-seed whenever dates drift.
2. **Evergreen seed with re-seed schedule:** A CI job or manual step that re-runs the seed weekly/before each demo.

### Slug stability

Demo board slugs should be memorable and stable (e.g. `layla-turns-5`, `noah-turns-7`) so that demo scripts, bookmarks, and showcase links remain valid across re-seeds.

### Image assets

Child images (AI-generated, provided by product owner) should live in `/public/demo/children/` with filenames matching the board (e.g. `layla.png`, `noah.png`). Charity logos in `/public/demo/charities/`. These are static assets committed to the repo — not uploaded via Vercel Blob.

### Admin data realism

The admin dashboard shows GMV, contribution counts, and fee totals computed from real database aggregates. For Options B and D (no database), these would need to be hardcoded in the demo data layer. For Options A, C, and E (seeded database), admin data computes naturally from the seed.

### Contribution flow in demo mode

For seeded-database options (A, C, E): `MOCK_PAYMENTS=true` already simulates payment. A demo user can tap "Chip in," enter details, select a provider, and reach the thank-you page — with the contribution actually written to the database and appearing on the board. This is the most impressive demo path.

For hardcoded options (B, D): The contribution flow can navigate up to the payment page, but actual submission would either fail (no database) or need a special demo handler that shows the thank-you page with mock data. This is less impressive but still functional.

### Cleanup and removal

When demo mode is no longer needed:
- Options A, C, E: Delete the demo database, remove auth bypass env vars, revert auth code changes.
- Options B, D: Delete the `/src/lib/demo/` directory and demo route files, remove middleware entry.
- Option D has the cleanest removal story (self-contained route tree, no auth changes).

---

## Files referenced in this brief

| File | Role |
|------|------|
| `/src/lib/db/seed.ts` | Existing seed script to extend |
| `/src/lib/db/schema.ts` | Full database schema (565 lines) |
| `/src/lib/config/feature-flags.ts` | Mock flags (`isMockPayments()`, etc.) |
| `/src/lib/ux-v2/write-path-gates.ts` | UX v2 feature gates |
| `/src/lib/auth/clerk.ts` | Auth functions (`requireClerkUser`, `requireAdminClerkUser`) |
| `/src/middleware.ts` | Route protection (public vs protected) |
| `/src/lib/dream-boards/view-model.ts` | Guest view model builder |
| `/src/components/dream-board/ContributorDisplay.tsx` | Contributor avatars (no amounts) |
| `/src/components/dream-board/DreamboardCtaCard.tsx` | CTA with state messaging |
| `/src/lib/host/queries.ts` | Host dashboard query types |
| `/src/app/(guest)/[slug]/page.tsx` | Guest Dreamboard page |
| `/src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx` | Contribution form |
| `/src/app/(guest)/[slug]/contribute/payment/PaymentClient.tsx` | Payment provider selection |
| `/src/app/(guest)/[slug]/thanks/ThankYouClient.tsx` | Thank-you page |
| `/src/app/(host)/dashboard/page.tsx` | Host dashboard list |
| `/src/app/(host)/dashboard/[id]/page.tsx` | Host board detail |
| `/src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx` | Active campaign view |
| `/src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx` | Post-campaign view |
| `/src/app/admin/page.tsx` | Admin dashboard |
| `.env.demo` | Demo environment configuration |
| `/docs/demo_db_full_reset.md` | Existing demo DB reset procedure |

---

## What the product owner will provide

- AI-generated child illustrations (4 images, one per board).
- Final gift names for each board (current suggestions: Polaroid camera, telescope, wooden play kitchen, art supplies set).
- Charity names and descriptions (or approval to use placeholder organisations).
- Any specific contributor names or messages they want included.

---

## Decision needed

Select one of Options A through E (or a combination) and provide it to the coding agent along with this brief. The agent has all the context needed to begin implementation immediately upon receiving the chosen approach.
