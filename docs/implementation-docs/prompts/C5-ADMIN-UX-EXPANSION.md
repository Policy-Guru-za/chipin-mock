# C5 — Admin UX Expansion

## Objective

Build the full admin panel with sidebar navigation, dashboard
overview, and five management sections (dream boards, contributions,
payouts, charities, settings) plus a reports page with CSV export.
All data comes from the B7 admin service layer — no new database
queries or schema changes required. Charity CRUD wires to the
existing B4 charity service.

---

## Context & Constraints

- Read these docs in order **before coding**:
  1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
     (C5 section)
  4. `docs/implementation-docs/GIFTA_UX_V2_SCREEN_COMPONENT_DELTA_SPEC.md`
     (admin rows)
  5. `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md`
  6. `docs/UX/ui-specs/18-ADMIN-PANEL.md`
  7. `docs/napkin/napkin.md` (all learnings)
- Gate commands: `pnpm lint && pnpm typecheck && pnpm test`
- All gates **must pass** before marking C5 complete.
- Do NOT proceed to C6.
- Do NOT modify Phase B backend APIs (partner/public API routes
  under `src/app/api/v1/`), DB schema, migration files, or
  webhook handlers.
- Do NOT change fee calculation logic (`src/lib/payments/fees.ts`).
- `UX_V2_ENABLE_BANK_WRITE_PATH` and
  `UX_V2_ENABLE_CHARITY_WRITE_PATH` remain **OFF**.
- Respect `prefers-reduced-motion` for all animations.
- All admin data access goes through `src/lib/admin/service.ts`
  (B7 layer). Do NOT create new database queries — use the
  existing typed service methods. You **may** extend existing B7
  filter types, parsers, and service method WHERE clauses to
  support filters required by C5 (e.g., adding
  `charityEnabled?: boolean` to `AdminDreamBoardFilters` and a
  corresponding `WHERE charity_id IS NOT NULL` clause in
  `listAdminDreamBoards`). This is a type/filter extension, not
  a new query — it stays in the same file and function.
- Charity CRUD goes through `src/lib/charities/service.ts` (B4
  layer). Do NOT duplicate charity logic.
- Admin auth uses `requireAdminAuth()` from
  `src/lib/auth/clerk-wrappers.ts` — already enforced in the
  layout.
- Admin write actions (flag board, close board, refund
  contribution) are **P2 deferred** — do not implement admin
  mutation endpoints for dream boards or contributions. These
  sections are read-only tables in C5.
- Settings page is **read-only** in C5 — uses
  `getAdminPlatformSettingsDataset()`. No write endpoint needed.
- **URL normalization:** The existing admin routes live under the
  `(admin)` route group, which means files at
  `src/app/(admin)/payouts/page.tsx` resolve to URL `/payouts`
  (NOT `/admin/payouts`). C5 must normalize all admin routes to
  live under `/admin/...` in the URL. Move existing payout routes
  into an `admin` segment: `src/app/(admin)/admin/payouts/...`
  (so the URL becomes `/admin/payouts`). All new routes follow
  the same pattern: `src/app/(admin)/admin/dream-boards/...`,
  `src/app/(admin)/admin/contributions/...`, etc. Alternatively,
  restructure the route group so that `(admin)` maps to the
  `/admin` URL prefix — use whichever approach is idiomatic for
  the existing Next.js App Router version in the project. The
  key requirement is that all admin URLs resolve to `/admin/...`.

---

## Current State

Admin panel exists at `/(admin)/` with three routes:

**`/admin` (via layout.tsx):**
- Server component with `requireAdminAuth()`
- Header shows "ChipIn Admin" (legacy branding — must change)
- Navigation: only links to payouts + host dashboard
- No sidebar, no breadcrumbs

**`/admin/payouts` (list + queue):**
- Lists boards ready for payouts + pending/failed payouts
- "Expiring in 7 days" warning section
- CSV export at `/admin/payouts/export` (streaming, batched)
- **Missing:** search, status filters, date range filters,
  pagination, column-based data table layout

**`/admin/payouts/[id]` (detail + operations):**
- Payout summary, recipient data (decrypted), line items
- Status update actions (complete/fail with references)
- Admin notes + audit log
- Karri automation card
- This page is **functional and should be preserved** — C5
  should not break existing payout detail functionality

**Not implemented:** `/admin` dashboard, `/admin/dream-boards`,
`/admin/contributions`, `/admin/charities`, `/admin/reports`,
`/admin/settings`

**Available B7 service methods:**
- `listAdminDreamBoards(filters)` — paginated, cursor-based
- `listAdminContributions(filters)` — paginated, cursor-based
- `listAdminPayouts(filters)` — paginated, cursor-based
- `listAdminCharities(filters)` — paginated, cursor-based
- `listAdminHosts(filters)` — paginated, cursor-based
- `getAdminDashboardDataset(timeRange?)` — platform stats
- `getAdminPlatformSummaryDataset(timeRange?)` — summary
- `getAdminPlatformSettingsDataset()` — config snapshot
- `getAdminMonthlyCharityReconciliationDataset(year, month)`

**Available query param parsers (B7):**
- `parseAdminDreamBoardFilters(searchParams)`
- `parseAdminContributionFilters(searchParams)`
- `parseAdminPayoutFilters(searchParams)`
- `parseAdminCharityFilters(searchParams)`
- `parseAdminHostFilters(searchParams)`
- `parseReportMonthYear(searchParams)`
- `parseAdminReportWindow(searchParams)`

**Available CSV converters (B7):**
- `toAdminDreamBoardCsvRows()`
- `toAdminContributionCsvRows()`
- `toAdminPayoutCsvRows()`
- `toAdminCharityCsvRows()`
- `toAdminHostCsvRows()`

**Available charity CRUD (B4):**
- `createCharity(input)`
- `updateCharity({ id, input })`
- `setCharityActiveState({ id, isActive })`
- `listCharities(params)` (admin scope)
- `getCharityById({ id, scope: 'admin' })`

---

## Build Sub-steps (execute in order)

### Sub-step 1: Admin Layout + Sidebar + Shared Components

#### 1a — Sidebar Navigation Component

Create `src/components/admin/AdminSidebar.tsx` (`'use client'`):

- Fixed left sidebar: 240px wide on desktop (≥1024px),
  collapsible drawer on mobile/tablet
- Background: white, border-r border-gray-200
- Top: "Gifta Admin" text (Fraunces 18px, 700, teal-600) —
  **NOT "ChipIn Admin"**
- Navigation items (vertical stack, 8px gap):
  1. `"Dashboard"` → `/admin` (grid/chart icon)
  2. `"Dreamboards"` → `/admin/dream-boards` (gift icon)
  3. `"Contributions"` → `/admin/contributions` (wallet icon)
  4. `"Payouts"` → `/admin/payouts` (banknotes icon)
  5. `"Charities"` → `/admin/charities` (heart icon)
  6. `"Reports"` → `/admin/reports` (chart-bar icon)
  7. `"Settings"` → `/admin/settings` (cog icon)
- Active item: bg-teal-50, text-teal-700, font-semibold,
  border-l-2 border-teal-600
- Inactive: text-gray-600, hover:bg-gray-50, hover:text-gray-900
- Each item: flex row, icon (20px) + label (Outfit 14px), py-2.5
  px-4, rounded-r-lg
- Use `usePathname()` to determine active item
- Mobile: hamburger toggle in header, slide-in drawer,
  backdrop overlay

#### 1b — Rewrite Admin Layout

Update `src/app/(admin)/layout.tsx`:

- Replace inline header with sidebar-based layout
- Desktop: sidebar fixed left + main content area with left
  margin (ml-60)
- Mobile: no fixed sidebar, hamburger menu in top bar
- Top bar (mobile only): "Gifta Admin" + hamburger + user email
- Main content: `<main className="flex-1 p-6 lg:p-8">` with
  max-width constraint (max-w-7xl)
- Preserve `requireAdminAuth()` in layout
- Add breadcrumbs component slot (optional, per page)

#### 1c — Shared AdminDataTable Component

Create `src/components/admin/AdminDataTable.tsx`:

```typescript
interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => React.ReactNode;
  className?: string;        // column width/alignment
  sortable?: boolean;        // future: client-side sort
}

interface AdminDataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
}
```

- `<table>` with `<thead>` / `<tbody>` semantic HTML
- Header: bg-gray-50, Outfit 12px uppercase text-gray-500,
  sticky top
- Rows: border-b border-gray-100, hover:bg-gray-50, py-3 px-4
- Empty state: centered message in `<td colSpan={columns.length}>`
- Responsive: horizontal scroll wrapper on mobile
  (`overflow-x-auto`)
- `role="table"`, headers use `<th scope="col">`

#### 1d — Shared AdminFilterPanel Component

Create `src/components/admin/AdminFilterPanel.tsx`:

```typescript
interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdminFilterPanelProps {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onApply: () => void;
  onReset: () => void;
}
```

- Horizontal layout on desktop (flex-wrap), stacked on mobile
- Each filter: label above, input below
- Select: styled `<select>` with Outfit 14px
- Date: `<input type="date">` with label
- Text: `<input type="text">` with search icon, placeholder
- "Apply filters" button (sage outline, small)
- "Reset" link (text button, gray)
- Filters apply via URL search params (server-side filtering)

#### 1e — Shared AdminPagination Component

Create `src/components/admin/AdminPagination.tsx`:

```typescript
interface AdminPaginationProps {
  hasMore: boolean;
  nextCursor: string | null;
  totalCount?: number;
  currentPage: number;        // derived from cursor state
  basePath: string;
}
```

- "Previous" / "Next" navigation buttons
- Current page indicator: `"Showing {count} results"`
- Disabled state when no previous/next
- Navigates via URL search params (`?cursor=...`)
- Cursor-based (matches B7 service pagination)

#### 1f — Shared AdminStatsCard Component

Create `src/components/admin/AdminStatsCard.tsx`:

```typescript
interface AdminStatsCardProps {
  label: string;
  value: string;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}
```

- Card: white bg, rounded-xl, shadow-sm, p-5
- Value: Fraunces 28px, 700, color per variant
- Label: Outfit 12px, uppercase, text-gray-500
- Subtitle: Outfit 12px, text-gray-400

#### 1g — Shared StatusBadge Component

Create `src/components/admin/StatusBadge.tsx`:

```typescript
interface StatusBadgeProps {
  status: string;
  variant?: 'teal' | 'green' | 'amber' | 'red' | 'blue' | 'gray';
}
```

- Pill: inline-flex, rounded-full, px-2.5 py-0.5
- Text: Outfit 12px, 500, capitalize
- Colors: bg-{variant}-50, text-{variant}-700
- Maps common statuses to variants automatically:
  - active/completed/paid_out → green
  - pending/processing → amber
  - failed → red
  - closed → gray
  - funded → teal

#### 1h — Export to barrel

Create `src/components/admin/index.ts` re-exporting all shared
components.

---

### Sub-step 2: Dashboard Overview

**Route:** `/(admin)/admin/page.tsx` — **new file** (the admin
index was previously the layout redirect to `/payouts`)

Create `src/app/(admin)/admin/page.tsx` (server component):

**Note:** Depending on the existing route structure, this may
need to be at `src/app/(admin)/page.tsx` if the admin group
root is at `/(admin)/`. Check the existing layout routing and
place the dashboard at the admin index route so navigating to
`/admin` shows the dashboard.

#### 2a — Stats Cards Row
- Fetch `getAdminDashboardDataset()` for platform stats
- Layout: 4-column grid on desktop, 2x2 on tablet, stacked
  on mobile
- Cards:
  - **GMV:** `"R{grossMerchandiseValueCents formatted}"`
    (label: `"Total GMV"`)
  - **Dreamboards:** `"{totalBoards}"` (label:
    `"Dreamboards"`, subtitle: `"{activeBoards} active"`)
  - **Contributors:** `"{totalContributors}"` (label:
    `"Contributors"`)
  - **Fees Retained:** `"R{totalFeesRetainedCents formatted}"`
    (label: `"Fees Retained"`)
- Use `AdminStatsCard` component

#### 2b — Requires Attention Section
- Header: `"Requires attention"` (Fraunces 20px, 700)
- Items: cards showing counts that need action:
  - **Pending Payouts:** `"{pendingPayoutsCount} pending"`
    — links to `/admin/payouts?status=pending`
  - **Failed Payouts:** `"{failedPayoutsCount} failed"`
    — links to `/admin/payouts?status=failed` (red variant if
    > 0)
- If all counts are zero: `"Nothing needs attention right now"`
  (Outfit 14px, text-gray-400, centered)

#### 2c — Quick Links
- Row of outline buttons linking to key sections:
  `"View payouts"`, `"View Dreamboards"`, `"Export reports"`
- Links to respective admin routes

---

### Sub-step 3: Dreamboards + Contributions Management

These two sections follow the same pattern: server-component page
reading URL search params, calling the B7 service with parsed
filters, rendering an `AdminDataTable` with `AdminFilterPanel`
and `AdminPagination`.

#### 3a — Dreamboards Page

Create `src/app/(admin)/dream-boards/page.tsx` (server component):

- Parse filters from URL: `parseAdminDreamBoardFilters(searchParams)`
- Fetch: `listAdminDreamBoards(filters)`
- Page title: `"Dreamboards"` (Fraunces 24px, 700)

**Filter fields:**
- Status: select (active, funded, closed, paid_out, expired,
  cancelled)
- Date range: from/to date inputs
- Search: text input (searches child name, gift name)
- Charity: boolean toggle (charity enabled boards only)

**Table columns:**

| Column | Source Field | Render |
|--------|-------------|--------|
| Child | childName | text + link to `/admin/dream-boards` detail (or public board) |
| Host | hostName + hostEmail | name, email below in gray-400 |
| Status | status | `StatusBadge` component |
| Goal | goalCents | `formatZar()` |
| Raised | raisedCents | `formatZar()` |
| Contributors | contributorCount | number |
| Created | createdAt | formatted date |
| Actions | — | "View" link → `/{slug}` (new tab) |

**CSV Export:**
- `"Export CSV"` button (outline, top-right)
- Links to `/admin/dream-boards/export` route (create this)
- Uses `toAdminDreamBoardCsvRows()` + streaming response

Create `src/app/(admin)/dream-boards/export/route.ts`:
- `requireAdminAuth()`
- Parse date range from searchParams
- Fetch `listAdminDreamBoards(filters)` with high limit
- Convert via `toAdminDreamBoardCsvRows()`
- Return CSV response with Content-Disposition header

#### 3b — Contributions Page

Create `src/app/(admin)/contributions/page.tsx` (server component):

- Parse: `parseAdminContributionFilters(searchParams)`
- Fetch: `listAdminContributions(filters)`
- Page title: `"Contributions"` (Fraunces 24px, 700)

**Filter fields:**
- Status: select (pending, processing, completed, failed,
  refunded)
- Payment method: select (payfast, ozow, snapscan)
- Date range: from/to date inputs
- Search: text input (searches contributor name, board name)

**Table columns:**

| Column | Source Field | Render |
|--------|-------------|--------|
| Contributor | contributorName | text (or "Anonymous") |
| Dreamboard | childName + dreamBoardSlug | name as link |
| Amount | amountCents | `formatZar()` |
| Fee | feeCents | `formatZar()`, gray-400 |
| Net | netCents | `formatZar()` |
| Status | paymentStatus | `StatusBadge` |
| Method | paymentProvider | capitalize |
| Date | createdAt | formatted date |

**CSV Export:**
- Same pattern as dream boards
- Create `/admin/contributions/export/route.ts`
- Uses `toAdminContributionCsvRows()`

---

### Sub-step 4: Payouts Enhancement

The existing payouts page works but lacks filters, search,
pagination, and uses the old layout. Rewrite to use the shared
admin components while preserving ALL existing functionality.

#### 4a — Rewrite `/admin/payouts/page.tsx`

- Parse: `parseAdminPayoutFilters(searchParams)`
- Fetch: `listAdminPayouts(filters)`
- Page title: `"Payout queue"` (per copy matrix) (Fraunces 24px,
  700)

**Filter fields:**
- Status: select (pending, processing, completed, failed)
- Type: select (karri_card, bank, charity)
- Date range: from/to date inputs

**Table columns:**

| Column | Source Field | Render |
|--------|-------------|--------|
| Dreamboard | childName + dreamBoardSlug | name as link |
| Host | hostEmail | text |
| Type | type | label (Karri Card / Bank / Charity) |
| Amount | netCents | `formatZar()` |
| Status | status | `StatusBadge` |
| Created | createdAt | formatted date |
| Completed | completedAt | formatted date or "—" |
| Actions | id | "Review" link → `/admin/payouts/{id}` |

**Preserve:**
- The existing CSV export at `/admin/payouts/export/route.ts`
  — do not modify it (it's already functional with streaming
  and date range filtering)
- The existing detail page at `/admin/payouts/[id]/page.tsx`
  — do not modify (it has complete payout operations, notes,
  audit log)
- Add a "Export CSV" button that links to the existing export
  route

**Remove:**
- The old inline payout queue / boards-ready-for-payout sections
  — these are replaced by the filtered data table
- The old "Expiring in 7 days" section — this information is
  now available through date filtering

---

### Sub-step 5: Charities Management

Create `src/app/(admin)/charities/page.tsx` (server component)
and `src/app/(admin)/charities/CharitiesClient.tsx`
(`'use client'`).

The charities section needs a client component because it
includes CRUD modals that manage local state.

#### 5a — Charities List Page

Server component:
- Parse: `parseAdminCharityFilters(searchParams)`
- Fetch: `listAdminCharities(filters)`
- Pass data to `CharitiesClient`

**Filter fields:**
- Active: boolean toggle (show active only / show all)
- Category: select (Education, Health, Environment, Community,
  Other)
- Search: text input (name, description)

**Table columns:**

| Column | Source Field | Render |
|--------|-------------|--------|
| Name | name | text, bold |
| Category | category | capitalize |
| Status | isActive | `StatusBadge` (green "Active" / gray "Inactive") |
| Boards Using | lifetimeTotals.totalBoards | number |
| Total Donated | lifetimeTotals.totalRaisedCents | `formatZar()` |
| Actions | — | "Edit" button + "Deactivate"/"Activate" toggle |

- `"Add charity"` button (sage filled, top-right next to title)

**CSV Export:**
- Create `/admin/charities/export/route.ts`
- Uses `toAdminCharityCsvRows()`

#### 5b — Add/Edit Charity Modal

Create within `CharitiesClient.tsx` or as separate component
`src/components/admin/CharityFormModal.tsx` (`'use client'`):

```typescript
interface CharityFormModalProps {
  charity?: AdminCharityDataset | null; // null = create mode
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Modal shell:** Same pattern as C4 `EditDreamBoardModal`
(overlay, focus trap, Esc close, backdrop close, `aria-modal`)

**Form fields (all required unless noted — matches B4
`createCharity` non-null DB contract):**
- **Charity Name:** text, required, max 100 chars
- **Description:** textarea, required, max 500 chars, with
  character counter
- **Category:** select dropdown, required (Education, Health,
  Environment, Community, Other)
- **Website:** text, required, URL validation
- **Logo URL:** text, required, URL validation
- **Bank Account Details:** textarea, required (stored encrypted
  — display placeholder `"••• encrypted •••"` in edit mode;
  admin must re-enter to change)
- **Contact Name:** text, required
- **Contact Email:** text, required, email validation

**Behavior:**
- Create mode: empty form, title `"Add charity"`, submit calls
  `createCharity(input)` from B4 service via server action
- Edit mode: pre-filled, title `"Edit charity"`, submit calls
  `updateCharity({ id, input })` via server action
- Validation: Zod schema
- On success: close modal, refresh page (via `router.refresh()`)
- On error: inline error message below form

#### 5c — Charity Server Actions

Create `src/app/(admin)/charities/actions.ts`:

```typescript
'use server'

export async function createCharityAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }>

export async function updateCharityAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }>

export async function toggleCharityStatusAction(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }>
```

- All require `requireAdminAuth()`
- Validate with Zod
- Call B4 charity service methods
- `revalidatePath('/admin/charities')`
- Return result (no redirect — modal pattern, same as C4
  learning)

#### 5d — Activate/Deactivate Toggle

On the charities table, each row has an activate/deactivate
action:
- If active: `"Deactivate"` button (red outline, small)
- If inactive: `"Activate"` button (green outline, small)
- On click: call `toggleCharityStatusAction(id, !isActive)`
- Show loading state on button during action
- Refresh table on success

---

### Sub-step 6: Reports + Settings

#### 6a — Reports Page

Create `src/app/(admin)/reports/page.tsx` (server component)
and `src/app/(admin)/reports/ReportsClient.tsx` (`'use client'`):

The reports page is a **download hub** for admin CSV exports,
with optional summary stats.

**Page title:** `"Financial reports"` (per copy matrix)

**Layout:**
- Date range selector: "From" / "To" date inputs (default:
  last 30 days)
- Report cards (grid, 2 cols desktop, 1 col mobile):

| Report | Description | Export Action |
|--------|-------------|---------------|
| Dreamboards | All boards with progress and host info | CSV download → `/admin/dream-boards/export` |
| Contributions | All contributions with fees and status | CSV download → `/admin/contributions/export` |
| Payouts | All payouts with status and amounts | CSV download → `/admin/payouts/export` |
| Charities | Charity summary with lifetime totals | CSV download → `/admin/charities/export` |
| Monthly Charity Reconciliation | Per-charity monthly totals | CSV download → `/admin/reports/charity-reconciliation/export` |

Each card:
- Title (Fraunces 16px, 700)
- Description (Outfit 14px, text-gray-500)
- `"Download CSV"` button (outline, small)
- Loading state during download

**Monthly Charity Reconciliation Export:**

Create `/admin/reports/charity-reconciliation/export/route.ts`:
- Parse year/month from searchParams
  (`parseReportMonthYear(searchParams)`)
- Call `getAdminMonthlyCharityReconciliationDataset({ year,
  month })`
- Generate CSV with columns: Charity Name, Category, Boards,
  Total Donated, Status
- Return CSV response

#### 6b — Settings Page

Create `src/app/(admin)/settings/page.tsx` (server component):

- Fetch: `getAdminPlatformSettingsDataset()`
- Page title: `"Platform settings"` (Fraunces 24px, 700)

**Read-only display** (no edit capability in C5):

Display cards for each settings group:

**Fee configuration card:**
- Platform Fee: `"{feePercentage}%"` (e.g., "3%")
- Min Fee: `"R{minFeeCents/100}"` (e.g., "R3")
- Max Fee: `"R{maxFeeCents/100}"` (e.g., "R500")

**Contribution limits card:**
- Min Contribution: `"R{minContributionCents/100}"`
- Max Contribution: `"R{maxContributionCents/100}"`

**Feature gates card:**
- Bank Write Path: `"Enabled"` / `"Disabled"` with StatusBadge
- Charity Write Path: `"Enabled"` / `"Disabled"` with StatusBadge

**Branding card:**
- Platform Name: value from settings
- Accessibility Target: value from settings

Each card: white bg, rounded-xl, shadow-sm, p-5. Label/value
pairs in rows (flex, justify-between).

Info banner at top: `"Settings are managed via environment
variables. Contact engineering to make changes."` (blue-50 bg,
info icon, Outfit 14px)

---

### Sub-step 7: Tests

Create these test files:

**`tests/unit/admin-sidebar.test.tsx`** (~6 tests):
- Sidebar renders all 7 navigation items
- Active item highlighted for current path
- Mobile hamburger toggle shows/hides sidebar
- All links point to correct routes
- "Gifta Admin" branding displayed (not "ChipIn Admin")
- Esc key closes mobile drawer

**`tests/unit/admin-data-table.test.tsx`** (~6 tests):
- Table renders correct columns and rows
- Empty state shows when data is empty
- Rows use keyExtractor for React keys
- Semantic HTML: `<table>`, `<thead>`, `<th scope="col">`,
  `<tbody>`, `<tr>`, `<td>`
- Column render functions called with correct items
- Horizontal scroll wrapper present for responsive

**`tests/unit/admin-dashboard.test.tsx`** (~5 tests):
- Stats cards render with formatted values
- Pending payouts count links to filtered payouts page
- Failed payouts count shows red variant when > 0
- Zero attention items shows "nothing needs attention" message
- Quick links render and point to correct routes

**`tests/unit/admin-dream-boards.test.tsx`** (~5 tests):
- Table renders Dreamboard rows with correct columns
- Status badges render for each status variant
- CSV export button links to export route
- Filter panel renders status/date/search fields
- Empty state renders when no boards match filters

**`tests/unit/admin-contributions.test.tsx`** (~5 tests):
- Table renders contribution rows with amounts and fees
- Anonymous contributors show "Anonymous" instead of name
- Status badges render for payment statuses
- Filter panel renders status/method/date fields
- CSV export button links to export route

**`tests/unit/admin-payouts-rewrite.test.tsx`** (~5 tests):
- Table renders payout rows with type labels
- Status badges render for payout statuses
- "Review" action links to existing detail page
- Filter panel renders status/type/date fields
- Existing payout detail page still accessible via link

**`tests/unit/admin-charities.test.tsx`** (~8 tests):
- Table renders charity rows with lifetime totals
- "Add charity" button opens create modal
- "Edit" button opens edit modal with pre-filled data
- Activate/Deactivate toggle calls correct server action
- Create action validates required fields (name)
- Edit action preserves unchanged fields
- Modal closes on success
- Empty state renders when no charities

**`tests/unit/admin-settings.test.tsx`** (~4 tests):
- Fee configuration card shows correct percentages/amounts
- Feature gates display enabled/disabled status
- Info banner about environment variables is present
- All settings sourced from service dataset (not hardcoded)

**`tests/unit/admin-csv-exports.test.ts`** (~6 tests):
- Dream boards export returns CSV with correct headers
- Contributions export returns CSV with correct headers
- Charities export returns CSV with correct headers
- Charity reconciliation export returns CSV
- All exports require admin auth (401 without)
- Date range filters applied correctly to export queries

**`tests/integration/admin-navigation-flow.test.tsx`** (~4 tests):
- Sidebar navigation between sections works
- Filter params persist in URL
- CSV export download triggers correctly
- Charity CRUD flow: create → appears in list → edit → update
  reflected

---

### Sub-step 8: Accessibility Pass

Verify all new and modified components meet WCAG 2.1 AA:

- **Sidebar navigation:** `<nav aria-label="Admin navigation">`,
  `<ul>` / `<li>`, active item `aria-current="page"`,
  keyboard navigable (arrow keys within nav, Tab to move in/out)
- **Data tables:** `<table>`, `<thead>` / `<tbody>`,
  `<th scope="col">`, `<caption>` (visually hidden) describing
  table purpose
- **Filter panel:** All inputs have associated `<label>` elements,
  `<fieldset>` / `<legend>` for filter group
- **Pagination:** `<nav aria-label="Pagination">`, disabled
  buttons have `aria-disabled="true"`
- **Stats cards:** `aria-label` on each card with value + label
  (e.g., `"Total GMV: R45,230"`)
- **Status badges:** Text content conveys status (not color-only)
- **Charity modal:** focus trap, `aria-modal="true"`,
  `role="dialog"`, `aria-labelledby`, return focus on close
- **Mobile drawer:** `aria-expanded` on hamburger,
  `aria-hidden` on closed drawer, focus trap when open
- **Export buttons:** `aria-label="Export dream boards as CSV"`
- **Minimum contrast:** 4.5:1 for all text
- **Focus indicators:** 2px solid outline on all interactive
  elements

---

### Sub-step 9: Gate & Evidence

1. Run `pnpm lint && pnpm typecheck && pnpm test`
2. All three must pass (0 errors; warnings OK)
3. Verify existing payout detail page still works (navigate to
   `/admin/payouts/[id]` with a test ID — ensure no regressions)
4. Record: total test count, total test files, new C5-specific
   test count
5. Create evidence file at:
   `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C5-admin-ux-expansion.md`
6. Evidence must contain:
   - Files created
   - Files modified
   - Gate output (lint, typecheck, test)
   - Test count breakdown (total vs C5-new)
   - Any deferred items with milestone target
7. Append C5 learnings to `docs/napkin/napkin.md` under
   `## C5 Learnings (2026-02-09)`

---

## Acceptance Criteria

### P0 (blocks merge)
- Admin layout renders with sidebar navigation (all 7 items)
- Dashboard shows platform stats from real data
- All data tables render data from B7 service layer correctly
- Admin auth enforced on all pages (existing `requireAdminAuth()`
  in layout)
- Existing payout detail page (`/admin/payouts/[id]`) not broken
- "Gifta Admin" branding (not "ChipIn Admin")
- Gates pass

### P1 (blocks rollout)
- Filter panels functional on dream boards, contributions,
  payouts, charities pages
- Filters applied via URL search params (bookmarkable/shareable)
- CSV export functional for all data sections
- Charities CRUD works: create, edit, activate/deactivate
- Settings page displays current platform configuration
- Pagination functional on all data tables
- Copy matrix terms: `"Payout queue"`, `"Charity management"`,
  `"Financial reports"`
- Monthly charity reconciliation export functional
- Requires Attention section on dashboard shows correct counts

### P2 (defer with waiver)
- GMV chart on dashboard (requires Recharts — skip if
  `pnpm add recharts` fails due to registry)
- Dreamboard flag/close admin actions (requires new service
  methods — defer to C6 or post-C9)
- Contribution refund admin action (requires new service method
  — defer)
- Settings write capability (currently read-only)
- Mobile sidebar slide-in animation
- Table column sorting (client-side)

---

## Stop Conditions

- Any P0 gate failure → stop, fix, re-run
- Schema or migration file touched → STOP (Phase B is locked)
- Webhook handler modified → STOP
- Fee calculation logic modified → STOP
- Write-path gate toggles changed → STOP
- Existing payout detail page broken → STOP (regression)
- New database queries created outside B7 service layer → STOP
  (use existing typed service methods)
- Any test count regression → stop, investigate
