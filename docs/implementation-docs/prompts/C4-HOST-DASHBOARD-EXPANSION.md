# C4 — Host Dashboard Expansion

## Objective

Rebuild the host dashboard list and detail pages to match UX v2
architecture. The list page gets richer cards with child photo
avatars, status badges, time-remaining labels, and a create-new
prompt. The detail page gains summary stats, financial breakdown,
payout status, birthday messages, quick actions, and an edit modal.
Completed boards (`closed` / `paid_out`) render a celebration
post-campaign view with financial breakdown, payout tracking, and
download capabilities for birthday messages (PDF) and contributor
lists (CSV).

---

## Context & Constraints

- Read these docs in order **before coding**:
  1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
     (C4 section)
  4. `docs/implementation-docs/GIFTA_UX_V2_SCREEN_COMPONENT_DELTA_SPEC.md`
     (dashboard rows)
  5. `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md`
  6. `docs/UX/ui-specs/14-HOST-DASHBOARD-LIST.md`
  7. `docs/UX/ui-specs/15-HOST-DASHBOARD-DETAIL.md`
  8. `docs/UX/ui-specs/16-HOST-DASHBOARD-EDIT.md`
  9. `docs/UX/ui-specs/17-HOST-DASHBOARD-POST-CAMPAIGN.md`
  10. `docs/napkin/napkin.md` (all learnings)
- Gate commands: `pnpm lint && pnpm typecheck && pnpm test`
- All gates **must pass** before marking C4 complete.
- Do NOT proceed to C5.
- Do NOT modify Phase B backend APIs (partner/public API routes
  under `src/app/api/v1/`), DB schema, migration files, or
  webhook handlers.
- Do NOT change fee calculation logic (`src/lib/payments/fees.ts`).
- Do NOT modify payment integration patterns.
- `UX_V2_ENABLE_BANK_WRITE_PATH` and
  `UX_V2_ENABLE_CHARITY_WRITE_PATH` remain **OFF**.
- Respect `prefers-reduced-motion` for all animations.
- New host-facing API routes (download endpoints) and server
  actions (edit) are in-scope — these are Phase C frontend support
  endpoints, not Phase B partner APIs.
- Notification preference UI is **out of scope** — not present in
  UX specs 14–17 as a distinct surface.

---

## Current State

The dashboard exists at two routes with minimal implementations:

**`/dashboard` (list page):**
- Server component fetching `listDreamBoardsForHost(hostId)`
- ViewModel: `buildDashboardViewModel()` returns boardTitle,
  percentage, raisedLabel, contributionCount, statusLabel,
  manageHref
- Cards show: title, progress bar, raised amount, contributor
  count, status, "Manage" button
- Empty state via `StateCard`
- **Missing from spec:** child photo avatar, status badges with
  semantic colors, days remaining / ended label, party date,
  enhanced grid layout, create-new card, loading skeleton

**`/dashboard/[id]` (detail page):**
- Server component fetching `getDreamBoardDetailForHost(id, hostId)`
  + last 100 contributions
- Two Card sections: board summary + contributor list
- Share URL built from NEXT_PUBLIC_APP_URL
- **Missing from spec:** summary stats (3-column), financial
  breakdown (fees/charity/net), payout details section, birthday
  messages section with preview, quick actions, edit modal,
  post-campaign view, download buttons

**Key existing files:**
- `src/app/(host)/dashboard/page.tsx` — list route
- `src/app/(host)/dashboard/[id]/page.tsx` — detail route
- `src/app/(host)/layout.tsx` — host layout wrapper
- `src/lib/host/dashboard-view-model.ts` — ViewModel builder
- `src/lib/db/queries.ts` — contains listDreamBoardsForHost,
  getDreamBoardDetailForHost, listContributionsForDreamBoard
- `src/components/dream-board/ProgressBar.tsx` — reusable
- `src/components/dream-board/ContributorList.tsx` — reusable
- `src/lib/admin/csv.ts` — CSV generation patterns (reference)

---

## Build Sub-steps (execute in order)

### Sub-step 1: Expand Query + ViewModel Layer

#### 1a — Extend Host Dashboard Queries

In `src/lib/db/queries.ts` (or create `src/lib/host/queries.ts`
if a separate file is cleaner — follow existing codebase patterns):

**Extend `listDreamBoardsForHost`** to also select:
- `partyDate`, `campaignEndDate`, `createdAt`, `childPhotoUrl`,
  `charityEnabled`
- These columns already exist on `dream_boards` — just add them
  to the select clause

**Create `getDashboardDetailExpanded(id, hostId)`** that returns:
- All fields from the existing `getDreamBoardDetailForHost`
- Plus aggregated financial data from completed contributions:
  - `totalRaisedCents` = `SUM(amount_cents)` WHERE
    payment_status = 'completed'
  - `totalFeeCents` = `SUM(fee_cents)` WHERE
    payment_status = 'completed'
  - `totalCharityCents` = `SUM(COALESCE(charity_cents, 0))` WHERE
    payment_status = 'completed'
  - `contributionCount` = `COUNT(*)` WHERE
    payment_status = 'completed'
  - `messageCount` = `COUNT(*)` WHERE payment_status = 'completed'
    AND message IS NOT NULL AND message != ''
- **Use B6 semantics**: raised = SUM(amount_cents), NOT
  SUM(net_cents). This is critical.

**Create `listPayoutsForDreamBoard(dreamBoardId)`:**
- Select from `payouts`: id, type, status, gross_cents, fee_cents,
  net_cents, external_ref, completed_at
- Filter by dream_board_id
- Order by type (gift first, then charity)

**Create `listBirthdayMessages(dreamBoardId)`:**
- Select from `contributions`: contributor_name, message,
  is_anonymous, amount_cents, created_at
- Filter: payment_status = 'completed' AND message IS NOT NULL
  AND message != ''
- Order by created_at ASC

**Create `updateDreamBoardForHost(id, hostId, data)`:**
- Update `dream_boards` SET only provided fields
  (childName, childPhotoUrl, partyDate, campaignEndDate)
- WHERE id = id AND host_id = hostId (authorization check)
- Return boolean success

#### 1b — Expand ViewModels

Expand `src/lib/host/dashboard-view-model.ts`:

**Enhanced list card ViewModel:**

```typescript
interface DashboardCardViewModel {
  // Existing
  boardId: string;
  boardTitle: string;
  percentage: number;
  raisedLabel: string;
  contributionCount: number;
  statusLabel: string;
  manageHref: string;
  displayTitle: string;
  displaySubtitle: string;
  displayImage: string | null;
  // New
  slug: string;
  childPhotoUrl: string | null;
  partyDate: Date | null;
  campaignEndDate: Date | null;
  daysRemaining: number | null;  // null if no deadline
  timeLabel: string;             // "5 days left" / "Ended 3 Feb" / "No deadline"
  statusVariant: 'active' | 'funded' | 'closed' | 'paid_out'
    | 'expired' | 'cancelled' | 'draft';
  isComplete: boolean;           // true when closed or paid_out
  charityEnabled: boolean;
}
```

**Detail ViewModel:**

```typescript
interface DashboardDetailViewModel {
  // Board identity
  boardId: string;
  slug: string;
  childName: string;
  childPhotoUrl: string | null;
  giftName: string;
  giftImageUrl: string | null;
  partyDate: Date | null;
  campaignEndDate: Date | null;
  status: string;
  statusLabel: string;
  statusVariant: string;
  message: string | null;

  // Progress
  goalCents: number;
  raisedCents: number;
  percentage: number;
  raisedLabel: string;
  goalLabel: string;
  progressLabel: string;     // "65% funded · R3,250 of R5,000"

  // Financial
  totalFeeCents: number;
  totalCharityCents: number;
  netPayoutCents: number;    // raised - fees - charity
  feeLabel: string;
  charityLabel: string;
  payoutLabel: string;

  // Counts
  contributionCount: number;
  messageCount: number;

  // Time
  daysRemaining: number | null;
  timeLabel: string;

  // Payout
  payoutMethod: string;
  payoutMethodLabel: string; // "Karri Card" / "Bank Transfer"
  payoutRecipientDisplay: string; // holder name
  payouts: PayoutSummary[];

  // Charity
  charityEnabled: boolean;
  charityName: string | null;

  // URLs
  shareUrl: string;
  publicUrl: string;

  // State flags
  isComplete: boolean;       // closed or paid_out
  isFunded: boolean;
  isEditable: boolean;       // active or funded (not closed/paid_out/expired/cancelled)
}

interface PayoutSummary {
  id: string;
  type: string;
  typeLabel: string;         // "Gift Payout" / "Charity Payout"
  status: string;
  statusLabel: string;       // "Pending" / "Processing" / "Sent" / "Failed"
  statusVariant: string;     // amber / blue / green / red
  amountCents: number;
  amountLabel: string;
  externalRef: string | null;
  completedAt: Date | null;
  completedLabel: string | null; // formatted date
}
```

#### 1c — ViewModel Builder Functions

**`buildDashboardCardViewModel(board, baseUrl?)`** — extend
existing `buildDashboardViewModel` or replace it, maintaining
backward compatibility with any call sites.

**`buildDashboardDetailViewModel(board, financials, payouts, baseUrl)`**
— new builder that constructs the full detail ViewModel.

**`buildFinancialBreakdown(raisedCents, feeCents, charityCents)`**
— pure function returning `{ netPayoutCents, feeLabel,
charityLabel, payoutLabel }`. Uses `formatZar` for all labels.

**`buildPayoutSummary(payout)`** — maps a payout row to
`PayoutSummary` with display labels.

---

### Sub-step 2: Rewrite Dashboard List Page

**Route:** `/(host)/dashboard/page.tsx`

Keep as server component. Expand data fetching and rendering.

#### 2a — Page Header
- Title: `"Your Dream Boards"` (Fraunces 28px, 700) — per copy
  matrix
- CTA: `"Create a Dreamboard +"` (Sage filled button `#6B9E88`,
  right-aligned on desktop, full-width below title on mobile)
- Layout: flex row, space-between, items-center on desktop;
  stacked on mobile

#### 2b — Board Cards Grid
- Layout: responsive grid — 1 col mobile, 2 cols tablet (≥768px),
  3 cols desktop (≥1024px)
- Gap: 24px

Each card (white bg, rounded-xl, shadow-sm, hover:shadow-md
transition, padding 20px):

- **Top row:** Child photo avatar (48×48px, rounded-full,
  border-2 border-teal-500, object-cover) next to child name
  (Fraunces 18px, 700). If no photo, show initials circle with
  teal bg.
- **Status badge:** Inline with name, pill-shaped, small text
  (Outfit 12px, 500):
  - `active` / `draft`: teal-50 bg, teal-700 text, `"Active"`
  - `funded`: green-50 bg, green-700 text, `"Funded!"`
  - `closed` / `paid_out`: gray-100 bg, gray-600 text,
    `"Complete"`
  - `expired`: amber-50 bg, amber-700 text, `"Expired"`
  - `cancelled`: red-50 bg, red-700 text, `"Cancelled"`
- **Progress bar:** Thin (4px height), below header, rounded,
  teal fill. Reuse existing `ProgressBar` component in compact
  mode, or render a simple styled div.
- **Stats:** `"R{raised} raised"` (Outfit 16px, 600) +
  `"from {N} contributors"` (Outfit 14px, text-gray-500)
- **Time:** `"{N} days left"` / `"Ended {date}"` /
  `"No deadline"` (Outfit 14px, text-gray-500)
- **Action:** `"View →"` (sage text link, right-aligned, bottom
  of card)
- Entire card is a link to `/dashboard/{id}` — wrap in `<Link>`

#### 2c — Create New Card
- Dashed border (2px, gray-300), rounded-xl, same height as
  board cards
- Center-aligned: `"+"` icon (32px, text-gray-400) +
  `"Create a Dreamboard"` (Outfit 16px, 500, text-gray-500)
- Hover: border-teal-300, text-teal-600
- Links to `/create/child`
- Renders as last item in grid

#### 2d — Empty State
- When no boards exist, replace entire grid with centered state:
- Heading: `"You haven't created a Dreamboard yet."` (Outfit
  18px, text-gray-600)
- CTA: `"Create your first Dreamboard"` (Sage filled button,
  large)
- Links to `/create/child`

---

### Sub-step 3: Rewrite Dashboard Detail Page — Active/Funded State

**Route:** `/(host)/dashboard/[id]/page.tsx`

**Server component (`page.tsx`):**
- `requireHostAuth()` → hostId
- `getDashboardDetailExpanded(id, hostId)` → board + financials
- `listPayoutsForDreamBoard(id)` → payout rows
- `listContributionsForDreamBoard(id)` → all contributions
  (remove the `limit: 100` — fetch all for the detail view)
- `listBirthdayMessages(id)` → messages
- Build `DashboardDetailViewModel`
- If board not found → redirect to `/dashboard`
- If `isComplete` (status in `['closed', 'paid_out']`) → render
  `DashboardPostCampaignClient` (sub-step 4)
- Otherwise → render `DashboardDetailClient`
- Pass contributions and messages as separate props (not embedded
  in the ViewModel — keeps data concerns separate)

Create `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx`
(`'use client'`):

#### 3a — Back Navigation
- `"← Back to Dream Boards"` (Outfit 14px, sage `#6B9E88`,
  link to `/dashboard`)

#### 3b — Header Card
- Layout: white bg card, rounded-xl, shadow-sm, padding 24px
- Child photo (64×64px, rounded-full, border-2 border-teal-500)
  next to:
  - Child name (Fraunces 24px, 700)
  - Status badge (same pill styling as list cards)
- Progress bar below: full-width, 8px height, rounded, teal fill
- Progress label below bar: `"{percentage}% funded · R{raised}
  of R{goal}"` (Outfit 14px, text-gray-500)

#### 3c — Summary Stats (3-column)
- Layout: 3-column grid on desktop (≥768px), stacked on mobile
- Each stat: white bg card, rounded-xl, shadow-sm, padding 24px,
  text-center
- **Total Raised:** Large number `"R{raised}"` (Fraunces 32px,
  700, teal-600) + label `"Total Raised"` (Outfit 12px,
  text-gray-500)
- **Contributors:** `"{count}"` (Fraunces 32px, 700) + label
  `"Contributors"`
- **Time Remaining:** `"{N} days"` / `"Ended"` / `"No deadline"`
  (Fraunces 32px, 700) + label `"Time Remaining"`

#### 3d — Contributions Section
- Header: `"Contributions ({count})"` (Fraunces 20px, 700)
- List: show first 5 by default. If more than 5, show toggle:
  `"Show all {N} contributions"` / `"Show fewer"`
- Each contribution row (flex row, padding 12px 0, border-b
  border-gray-100):
  - Name: contributor name or `"Anonymous"` if is_anonymous
    (Outfit 14px, 600)
  - Amount: `"R{amount}"` (Outfit 14px, 600, teal-600)
  - Date: relative format (Outfit 12px, text-gray-400)
  - Message indicator: 💬 icon if message is non-null/non-empty
- Sorted by created_at DESC (newest first)
- Empty state: `"No contributions yet"` (Outfit 14px,
  text-gray-400)

#### 3e — Birthday Messages Section
- Header: `"Birthday Messages ({messageCount})"` (Fraunces 20px,
  700)
- If no messages: `"No birthday messages yet"` (Outfit 14px,
  text-gray-400)
- First 2 messages previewed:
  - Name: contributor name or `"Anonymous"` (Outfit 14px, 600)
  - Message: first 120 chars, truncated with `"..."` if longer
    (Outfit 14px, text-gray-600)
- If more than 2: `"View all {N} messages"` toggle (sage text
  link)
- `"Download Birthday Messages"` button (outline variant, small)
  — calls download route from sub-step 6. **If messageCount is
  0, hide this button.**

#### 3f — Quick Actions
- Layout: horizontal button group on desktop, stacked on mobile
- **"Share Dreamboard"** (outline button, link icon):
  copies `shareUrl` to clipboard via `navigator.clipboard
  .writeText()`. Show toast `"Link copied!"` (auto-dismiss 3s).
  Fallback: select-and-copy if clipboard API unavailable.
- **"Edit Dreamboard"** (outline button, pencil icon):
  opens `EditDreamBoardModal` (sub-step 5). Only visible when
  `isEditable` is true.
- **"View Public Page"** (outline button, external-link icon):
  opens `publicUrl` in new tab (`target="_blank"`,
  `rel="noopener noreferrer"`)

#### 3g — Payout Details Card
- Card: white bg, rounded-xl, shadow-sm, padding 24px
- Header: `"Payout Details"` (Fraunces 20px, 700) — per copy
  matrix
- **Method:** `"Payout Method: {Karri Card / Bank Transfer}"`
  (Outfit 14px)
- **Recipient:** Display `karri_card_holder_name` or
  `bank_account_name` from board data (Outfit 14px,
  text-gray-600)
- **Payout rows** (if any exist — from `payouts` table):
  - For each payout: type label, status with color indicator,
    amount
  - Status display:
    - `pending`: amber dot + `"Pending"`
    - `processing`: blue dot + `"Processing"`
    - `completed`: green dot + `"Sent"`
    - `failed`: red dot + `"Failed"`
- **No payout rows yet:** `"Payout will be processed when the
  Dreamboard is closed."` (Outfit 14px, text-gray-500)

---

### Sub-step 4: Post-Campaign View

When `isComplete` is true (status `'closed'` or `'paid_out'`),
the server component renders this view **instead of** the active
detail view. Use the same route (`/dashboard/[id]`).

Important: `'funded'` boards are **still active** — guests can
keep contributing until the host explicitly closes. Do NOT render
post-campaign for funded boards.

Create `src/app/(host)/dashboard/[id]/DashboardPostCampaignClient
.tsx` (`'use client'`):

#### 4a — Back Navigation
- Same as 3a: `"← Back to Dream Boards"` link

#### 4b — Celebration Header
- `"🎉"` (40px, block, centered)
- `"{childName}'s Dreamboard is complete!"` (Fraunces 28px, 700,
  centered)
- `"Campaign complete"` (Outfit 16px, text-gray-500, centered)
  — per copy matrix

#### 4c — Financial Breakdown Card
- Card: white bg, rounded-xl, shadow-sm, padding 24px
- Header: `"Financial Summary"` (Fraunces 20px, 700)
- Line items (Outfit 16px, flex row, justify-between, py-3):
  - `"Total Raised"` → `"R{totalRaised}"` (font-semibold)
  - `"Gifta Fee (3%)"` → `"-R{fees}"` (text-gray-500)
  - If charityEnabled: `"Charity Donation"` →
    `"-R{charity}"` (text-gray-500)
  - Divider: `<hr>` (1px, gray-200)
  - `"Your Payout"` → `"R{netPayout}"` (Fraunces 20px, 700,
    teal-600) — highlight row with bg-teal-50, rounded-lg,
    px-4 py-3

**Use real computed values from the database:**
- Total Raised = `totalRaisedCents` (SUM of amount_cents per B6)
- Fees = `totalFeeCents` (SUM of fee_cents)
- Charity = `totalCharityCents` (SUM of charity_cents)
- Net Payout = totalRaisedCents − totalFeeCents −
  totalCharityCents

Do NOT use hardcoded percentages for the amounts.
The `"Gifta Fee (3%)"` label is a display label only — the
amount shown is the actual sum from the database.

#### 4d — Payout Status Card
- Card: white bg, rounded-xl, shadow-sm, padding 24px
- Header: `"Payout Status"` (Fraunces 20px, 700)
- For each payout row:
  - **Type:** `"Gift Payout"` / `"Charity Payout"` (Outfit 16px,
    600)
  - **Status indicator** (flex row, items-center, gap-2):
    - `completed`: green-500 dot + `"Sent"` (green-700 text)
    - `processing`: blue-500 dot + `"Processing"` (blue-700)
    - `pending`: amber-500 dot + `"Pending"` (amber-700)
    - `failed`: red-500 dot + `"Failed — contact support"`
      (red-700)
  - **Method:** `"via Karri Card"` / `"via Bank Transfer"` /
    `"via Charity"` (Outfit 14px, text-gray-500)
  - **Reference:** `"Ref: {externalRef}"` — only if completed
    and ref exists (Outfit 12px, text-gray-400)
  - **Date:** `"Sent {completedAt formatted}"` — only if
    completed (Outfit 12px, text-gray-400)
- If no payout rows: `"Payout processing has not started yet."`

#### 4e — Download Buttons
- Layout: flex row gap-3, wrap on mobile
- **"Download Birthday Messages"** (outline button, small):
  - On click: `fetch('/api/internal/downloads/birthday-messages
    ?dreamBoardId={id}')`, convert response to blob, trigger
    browser download
  - Loading state: spinner icon, button disabled
  - Error: toast `"Download failed. Please try again."`
  - Filename: `"{childName}-birthday-messages.pdf"`
  - **Hide entirely if messageCount === 0**
- **"Download Contributor List"** (outline button, small):
  - On click: `fetch('/api/internal/downloads/contributor-list
    ?dreamBoardId={id}')`, trigger download
  - Filename: `"{childName}-contributors.csv"`
  - **Hide if contributionCount === 0**

#### 4f — Contribution History
- Same component/rendering as 3d, but show ALL contributions
  (no 5-item limit, no toggle). Post-campaign is a complete
  record.

#### 4g — Birthday Messages
- Same component/rendering as 3e, but show ALL messages (no
  2-item limit, no toggle).

---

### Sub-step 5: Edit Modal

Create `src/components/host/EditDreamBoardModal.tsx`
(`'use client'`):

```typescript
interface EditDreamBoardModalProps {
  board: {
    id: string;
    childName: string;
    childPhotoUrl: string | null;
    partyDate: Date | null;
    campaignEndDate: Date | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

#### 5a — Modal Shell
- Overlay: fixed inset-0, bg-black/50, z-50, flex
  items-center justify-center
- Card: white, rounded-2xl, shadow-xl, max-w-lg w-full,
  max-h-[90vh] overflow-y-auto, p-6
- Title: `"Edit Dreamboard"` (Fraunces 20px, 700)
- Close: X button top-right, Esc key handler,
  backdrop click closes
- Focus trap: tab cycles within modal
- `aria-modal="true"`, `role="dialog"`,
  `aria-labelledby="edit-modal-title"`

#### 5b — Locked Fields Notice
- Info banner (bg-blue-50, border-l-4 border-blue-400,
  p-4, rounded-r-lg):
- `"Gift details and charity settings cannot be changed after
  creation to protect contributor trust."` (Outfit 14px,
  text-blue-800)

#### 5c — Editable Fields
- **Child's Name:** text input, max 30 chars, character counter
  (`{current}/30`), pre-filled with current value, label
  `"Child's Name"` (Outfit 12px, 700, uppercase, text-gray-500)
  - Validation: 2-30 chars, required
- **Child's Photo:** file input styled as upload area, 5MB max,
  accepts PNG/JPG/WebP. Show current photo as preview if exists.
  Optional — keep existing if not changed.
- **Party Date:** date input, pre-filled with current value.
  Minimum value = current partyDate (can only extend forward).
  If current partyDate is in the past, minimum = today.
  - Validation: must be >= current party date, must be in the
    future
- **Campaign End Date:** date input, pre-filled with current
  value (if set). Minimum value = current campaignEndDate.
  - Validation: must be >= current end date (if set), must be
    in the future

#### 5d — Confirmation Step
Before submitting, show a diff preview:
- Only display fields that changed
- Format: `"{Field}: {old value} → {new value}"`
- Photo change: `"Photo: Updated"`
- `"Save Changes"` button (sage filled) +
  `"Cancel"` (outline, closes diff and returns to form)
- If no fields changed, disable "Save Changes"

#### 5e — Server Action

Create `src/app/(host)/dashboard/[id]/actions.ts`:

```typescript
'use server'

import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const editSchema = z.object({
  boardId: z.string().uuid(),
  childName: z.string().min(2).max(30).optional(),
  partyDate: z.string().datetime().optional(),
  campaignEndDate: z.string().datetime().optional(),
  // Photo handled via FormData separately
});

export async function updateDreamBoard(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  // 1. requireHostAuth() → hostId
  // 2. Parse and validate formData with Zod
  // 3. Verify board exists and belongs to host
  // 4. Verify forward-only date constraints against current
  //    board values
  // 5. If photo file present: validate size/type, upload to
  //    Vercel Blob, get new URL
  // 6. Call updateDreamBoardForHost(id, hostId, data)
  // 7. revalidatePath('/dashboard')
  //    revalidatePath(`/dashboard/${boardId}`)
  // 8. Return { success: true }
  // On error: return { success: false, error: message }
}
```

**Do NOT use redirect() in this action** — it's a modal action
that returns a result. The client handles success/error.
(Ref: napkin C1 learning about server actions + redirects.)

---

### Sub-step 6: Download API Routes

#### 6a — Birthday Messages PDF

Create `src/app/api/internal/downloads/birthday-messages/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';

export async function GET(request: NextRequest) {
  // 1. requireHostAuth() → hostId
  // 2. Extract dreamBoardId from searchParams
  // 3. getDashboardDetailExpanded(dreamBoardId, hostId)
  //    — verify board belongs to host (return 403 if not)
  // 4. listBirthdayMessages(dreamBoardId)
  // 5. Generate PDF:
  //    - Title page: "{childName}'s Birthday Messages"
  //    - Subtitle: "From their Dreamboard on Gifta"
  //    - Each message as a section:
  //      - "From: {contributorName}" (or "From: Anonymous")
  //      - Message text
  //      - Date formatted
  //    - Footer: "Generated by Gifta · {date}"
  // 6. Return new Response(pdfBuffer, {
  //      headers: {
  //        'Content-Type': 'application/pdf',
  //        'Content-Disposition':
  //          `attachment; filename="${childName}-birthday-messages.pdf"`
  //      }
  //    })
}
```

For PDF generation, try `pdfkit` first:
`pnpm add pdfkit && pnpm add -D @types/pdfkit`

If `pdfkit` proves problematic (binary dependencies, build
issues), fall back to generating a simple formatted text document
as PDF using the `pdf-lib` package (`pnpm add pdf-lib`) which is
pure JavaScript and has no native dependencies — preferred for
serverless environments.

Keep the PDF simple and readable — this is a keepsake document.
No complex layouts required. Clean typography with clear spacing
between messages.

#### 6b — Contributor List CSV

Create `src/app/api/internal/downloads/contributor-list/route.ts`:

```typescript
export async function GET(request: NextRequest) {
  // 1. requireHostAuth() → hostId
  // 2. Extract dreamBoardId from searchParams
  // 3. Verify board belongs to host (403 if not)
  // 4. listContributionsForDreamBoard(dreamBoardId)
  //    — all completed contributions
  // 5. Generate CSV with columns:
  //    Name, Amount (ZAR), Fee (ZAR), Date, Message, Anonymous
  // 6. Return new Response(csvString, {
  //      headers: {
  //        'Content-Type': 'text/csv',
  //        'Content-Disposition':
  //          `attachment; filename="${childName}-contributors.csv"`
  //      }
  //    })
}
```

Reference `src/lib/admin/csv.ts` for CSV generation patterns.
Manually construct the CSV string — no external library needed.

#### 6c — Route Auth + Middleware

- Both routes require host authentication via `requireHostAuth()`
- Both verify the Dreamboard belongs to the authenticated host
- Return 401 on missing auth, 403 on wrong host, 404 on missing
  board
- Add these routes to the middleware allowlist if the codebase
  uses route-level middleware (check
  `src/middleware.ts` for patterns)

---

### Sub-step 7: Tests

Create these test files:

**`tests/unit/dashboard-view-model.test.ts`** (~12 tests):
- `buildDashboardCardViewModel`: correct percentage, statusLabel,
  timeLabel, daysRemaining for various statuses
- statusVariant mappings for all status enum values
- Percentage capped at 100 for overfunded boards
- timeLabel shows "X days left" for future dates
- timeLabel shows "Ended {date}" for past dates
- timeLabel shows "No deadline" when no campaignEndDate
- `buildDashboardDetailViewModel`: financial breakdown correct
  (raised − fees − charity = net)
- Financial breakdown uses amount_cents NOT net_cents (B6)
- PayoutSummary correctly maps type and status labels
- charityEnabled=false → totalCharityCents = 0, no charity line
- Zero contributions → all financial fields are 0
- `buildFinancialBreakdown` pure function correctness

**`tests/unit/dashboard-list.test.tsx`** (~8 tests):
- Grid renders correct number of cards for given boards
- Cards show child photo (or initials), name, status badge,
  progress, stats, time
- Status badges have correct variant classes for each status
- Create-new card renders and links to `/create/child`
- Empty state renders when no boards with correct CTA
- Time remaining displays correctly for various date scenarios
- Cards link to `/dashboard/{id}`
- Page title is "Your Dream Boards"

**`tests/unit/dashboard-detail.test.tsx`** (~10 tests):
- Summary stats render correctly (raised, contributors, time)
- Contributions section shows first 5 with toggle for more
- Birthday messages section shows first 2 with toggle
- Quick actions: share, edit, view buttons render
- Share copies URL to clipboard
- Edit button only visible when board is editable
- Payout details display method and status
- "No payout rows" message when payouts array is empty
- Empty contributions shows `"No contributions yet"`
- Empty messages shows `"No birthday messages yet"`
- Back link navigates to `/dashboard`

**`tests/unit/dashboard-post-campaign.test.tsx`** (~8 tests):
- Celebration header renders with child name
- Financial breakdown shows correct amounts for all line items
- Financial breakdown excludes charity line when
  charityEnabled=false
- Payout status card shows correct status per payout state
  (pending/processing/completed/failed)
- Download buttons render when messages/contributions exist
- Download birthday messages button hidden when messageCount=0
- Download contributor list button hidden when
  contributionCount=0
- Contribution history shows all items (no toggle)

**`tests/unit/dashboard-edit-modal.test.tsx`** (~10 tests):
- Modal renders when isOpen=true, hidden when false
- Pre-fills current values from board prop
- Child name validates 2-30 chars with inline error
- Party date rejects dates before current partyDate
- Campaign end date rejects dates before current endDate
- Confirmation diff shows only changed fields
- "Save Changes" disabled when no fields changed
- Submit calls server action with correct data
- Success triggers onSuccess callback
- Esc key and backdrop click close modal

**`tests/unit/dashboard-downloads.test.ts`** (~6 tests):
- PDF route returns 401 without auth
- PDF route returns 403 for board owned by different host
- PDF route returns response with content-type application/pdf
- CSV route returns 401 without auth
- CSV route returns response with content-type text/csv
- CSV response contains expected column headers

**`tests/integration/dashboard-host-flow.test.tsx`** (~5 tests):
- List page → detail page navigation
- Active board renders detail view (not post-campaign)
- Completed board (closed/paid_out) renders post-campaign view
- Funded board renders active detail view (NOT post-campaign)
- Financial breakdown values match contribution data

---

### Sub-step 8: Accessibility Pass

Verify all new and modified components meet WCAG 2.1 AA:

- **Dashboard cards:** Wrap grid in `<ul>`, each card in `<li>`.
  Card link wraps entire card with `aria-label="{childName}'s
  Dreamboard — {statusLabel}"`. Status badge includes text (not
  color-only).
- **Summary stats:** Each stat card has `aria-label` describing
  both value and label (e.g., `"Total Raised: R3,250"`)
- **Contributions list:** `<ul>` / `<li>` with proper semantics
- **Show more/less toggles:** `aria-expanded="true|false"`,
  descriptive `aria-label`
- **Edit modal:** focus trap, `aria-modal="true"`,
  `role="dialog"`, `aria-labelledby="edit-modal-title"`. Return
  focus to trigger button on close.
- **Download buttons:** `aria-label="Download birthday messages
  as PDF"` / `aria-label="Download contributor list as CSV"`
- **Quick action buttons:** Each has descriptive `aria-label`
- **Payout status:** Status communicated via text, not color
  alone (dot is decorative)
- **Minimum contrast:** 4.5:1 for all text
- **Focus indicators:** 2px solid outline on all interactive
  elements
- **Tab order:** Back → Header → Stats → Contributions →
  Messages → Quick Actions → Payout → Downloads (logical
  document flow)

---

### Sub-step 9: Gate & Evidence

1. Run `pnpm lint && pnpm typecheck && pnpm test`
2. All three must pass (0 errors; warnings OK)
3. Record: total test count, total test files, new C4-specific
   test count
4. Create evidence file at:
   `docs/implementation-docs/evidence/ux-v2/phase-c/20260208-C4-host-dashboard-expansion.md`
5. Evidence must contain:
   - Files created
   - Files modified
   - Gate output (lint, typecheck, test)
   - Test count breakdown (total vs C4-new)
   - Any deferred items with milestone target
6. Append C4 learnings to `docs/napkin/napkin.md` under
   `## C4 Learnings (2026-02-08)`

---

## Acceptance Criteria

### P0 (blocks merge)
- Dashboard list page renders all boards with correct status,
  progress, amounts, and time labels
- Dashboard detail page shows correct financial totals
  (raised = SUM(amount_cents) per B6 semantics)
- Payout status and method displayed correctly from payouts table
- Post-campaign view renders for closed/paid_out boards (NOT for
  funded boards)
- Post-campaign financial breakdown is correct:
  raised − fees − charity = net payout
- No money-movement semantic changes (read-only display of
  existing data)
- Board authorization enforced on all routes and API endpoints
  (host can only see own boards)
- Gates pass

### P1 (blocks rollout)
- Birthday messages section functional with preview + full toggle
- Quick actions work: share copies link with toast, edit opens
  modal, view opens public page in new tab
- Edit modal saves changes with forward-only date validation and
  confirmation diff
- Contributions section with show more/less toggle
- Status badges display correct variant/color for all statuses
- Time remaining / ended labels display correctly
- Create-new card and empty state render correctly
- Copy matrix terms used throughout: `"Your Dream Boards"`,
  `"Payout Details"`, `"Campaign complete"`
- Download endpoints return correctly formatted PDF and CSV

### P2 (defer with waiver)
- Loading skeletons on list page
- Card hover lift animations
- Photo upload preview in edit modal with drag-and-drop
- Initials-circle fallback for missing child photos

---

## Stop Conditions

- Any P0 gate failure → stop, fix, re-run
- Schema or migration file touched → STOP (Phase B is locked)
- Webhook handler modified → STOP
- Fee calculation logic modified → STOP
- Write-path gate toggles changed → STOP
- Financial totals computed from net_cents instead of amount_cents
  → STOP (violates B6 semantics)
- Post-campaign view rendered for funded boards → STOP (funded
  boards are still active per spec)
- Any test count regression → stop, investigate
