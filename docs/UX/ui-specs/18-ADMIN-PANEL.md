# Gifta UX v2: Admin Panel - Comprehensive Specification
## All 7 Admin Sections

**Document Version:** 1.0
**Status:** Runtime-aligned with authorization/model corrections
**Route:** `/admin/*` (protected)
**Last Updated:** February 11, 2026
**Target Audience:** AI coding agents, UI developers, admin implementers

---

## Runtime Alignment (2026-02-11)

- Runtime source: `src/app/(admin)/layout.tsx`, `src/lib/auth/clerk.ts`, `src/lib/auth/admin-allowlist.ts`, `src/app/(admin)/admin/*`.
- Admin access is authenticated Clerk user + email allowlist check (`ADMIN_EMAIL_ALLOWLIST`), not Clerk role-claim enforcement.
- Implemented admin sections are: dashboard, dreamboards, contributions, payouts, charities, reports, settings.
- Admin surfaces are primarily read-only operations plus charity CRUD/edit actions and payout review actions.

## Table of Contents

1. [Admin Panel Overview](#admin-panel-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [Section 1: Admin Dashboard Overview](#section-1-admin-dashboard-overview)
4. [Section 2: Dreamboards Management](#section-2-dream-boards-management)
5. [Section 3: Contributions Management](#section-3-contributions-management)
6. [Section 4: Payouts Management](#section-4-payouts-management)
7. [Section 5: Charity Management](#section-5-charity-management)
8. [Section 6: Financial Reports](#section-6-financial-reports)
9. [Section 7: Platform Settings](#section-7-platform-settings)
10. [Common Components](#common-components)
11. [Data Fetching Strategy](#data-fetching-strategy)
12. [Responsive Behavior](#responsive-behavior)
13. [Accessibility](#accessibility)

---

## Admin Panel Overview

### Purpose
The Admin Panel provides Gifta operations team with complete visibility into platform operations, financial metrics, and user management capabilities.

### Access Control
- **Route Protection:** `/admin/*` requires authentication
- **Role Required:** email in `ADMIN_EMAIL_ALLOWLIST`
- **Redirect:** Unauthorized → `/`
- **Bypass:** No bypass possible; enforced server-side

### Navigation Structure

```
Admin Dashboard (/admin)
├── Dashboard Overview (/admin)
├── Dreamboards (/admin/dream-boards)
├── Contributions (/admin/contributions)
├── Payouts (/admin/payouts)
├── Charities (/admin/charities)
├── Financial Reports (/admin/reports)
└── Platform Settings (/admin/settings)
```

---

## Authentication & Authorization

### Server-Side Protection

```typescript
// middleware.ts
import { auth } from '@clerk/nextjs/server';

export async function adminMiddleware(req: NextRequest) {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  const isAdmin = sessionClaims?.metadata?.role === 'admin';
  if (!isAdmin) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

### Client-Side Protection

```typescript
// AdminGuard component
export function AdminGuard({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const isAdmin = user?.organizationMemberships?.some(
    (org) => org.role === 'admin'
  );

  if (!isAdmin) {
    return redirect('/');
  }

  return <>{children}</>;
}
```

---

## Section 1: Admin Dashboard Overview

### Route: `/admin`

### Purpose
High-level platform metrics and key performance indicators at a glance.

### Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Gifta Admin                                      [Profile] [×]  │
├─────────────┬──────────────────────────────────────────────────┤
│  Dashboard  │  [Search & Filters]                              │
│  Boards     │                                                  │
│  Contribs   │  Last 30 Days Summary                            │
│  Payouts    │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  Charities  │  │ GMV      │ │ Boards   │ │ Contribs │         │
│  Reports    │  │ R1.2M    │ │ 247      │ │ 3,142    │         │
│  Settings   │  └──────────┘ └──────────┘ └──────────┘         │
│             │                                                  │
│             │  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│             │  │ Active   │ │ Avg/Board│ │ Fees     │         │
│             │  │ 156      │ │ R4,850   │ │ R34.8K   │         │
│             │  └──────────┘ └──────────┘ └──────────┘         │
│             │                                                  │
│             │  GMV Chart (Last 30 days)                       │
│             │  ┌──────────────────────────────────┐           │
│             │  │ [Line chart with area fill]      │           │
│             │  │ Y: GMV (R) | X: Days (30)      │           │
│             │  └──────────────────────────────────┘           │
│             │                                                  │
│             │  ⚠️ Requires Attention                          │
│             │  ┌──────────────────────────────────┐           │
│             │  │ • 3 pending payouts              │           │
│             │  │ • 2 flagged boards               │           │
│             │  │ • 1 open support ticket          │           │
│             │  └──────────────────────────────────┘           │
│             │                                                  │
└─────────────┴──────────────────────────────────────────────────┘
```

### Components

#### 1.1 Platform Stats Cards

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
  <!-- GMV -->
  <Card variant="elevated" padding="lg">
    <h3 class="text-sm font-semibold text-text-muted uppercase mb-2">
      Gross Merchandise Volume (GMV)
    </h3>
    <p class="text-4xl font-bold text-text mb-1">
      R{formattedGMV}
    </p>
    <p class="text-sm text-text-secondary">
      Last 30 days • +{gmvTrend}% vs previous
    </p>
  </Card>

  <!-- Dreamboards -->
  <Card variant="elevated" padding="lg">
    <h3 class="text-sm font-semibold text-text-muted uppercase mb-2">
      Dreamboards
    </h3>
    <p class="text-4xl font-bold text-text mb-1">
      {totalBoards}
    </p>
    <p class="text-sm text-text-secondary">
      {activeBoards} active • {completedBoards} completed
    </p>
  </Card>

  <!-- Contributors -->
  <Card variant="elevated" padding="lg">
    <h3 class="text-sm font-semibold text-text-muted uppercase mb-2">
      Total Contributors
    </h3>
    <p class="text-4xl font-bold text-text mb-1">
      {totalContributors}
    </p>
    <p class="text-sm text-text-secondary">
      {newContributorsMonth} new this month
    </p>
  </Card>
</div>
```

**Specifications:**
- Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Card variant: `elevated`
- Title: `text-sm font-semibold text-text-muted uppercase`
- Number: `text-4xl font-bold text-text`
- Subtitle: `text-sm text-text-secondary`
- Metric color: Teal for positive, orange for alerts

#### 1.2 GMV Chart

```typescript
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function GMVChart({ data }: { data: GMVDataPoint[] }) {
  return (
    <Card variant="default" padding="lg" className="mb-8">
      <h3 class="text-lg font-semibold text-text mb-4">
        Gross Merchandise Volume
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorGMV" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0D9488" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="date" stroke="#A8A29E" />
          <YAxis stroke="#A8A29E" />
          <Tooltip
            formatter={(value) => `R${(value / 100000).toFixed(1)}K`}
            contentStyle={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E7E5E4',
              borderRadius: '0.75rem',
            }}
          />
          <Area
            type="monotone"
            dataKey="gmv"
            stroke="#0D9488"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorGMV)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

**Data Format:**
```typescript
interface GMVDataPoint {
  date: string; // "Jan 1"
  gmv: number; // Amount in cents
  boards: number;
  contributions: number;
}
```

#### 1.3 Requires Attention Section

```html
<Card variant="default" padding="lg" className="border-warning/30 bg-warning/5">
  <div class="flex items-start gap-3 mb-4">
    <AlertIcon class="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
    <h3 class="text-lg font-semibold text-text">
      🚨 Requires Attention
    </h3>
  </div>

  <ul class="space-y-2">
    <li class="flex items-center gap-2 text-text-secondary">
      <span class="inline-block w-2 h-2 rounded-full bg-warning" />
      <Link href="/admin/payouts?status=pending" class="text-primary hover:underline">
        {pendingPayouts} pending payouts
      </Link>
    </li>
    <li class="flex items-center gap-2 text-text-secondary">
      <span class="inline-block w-2 h-2 rounded-full bg-warning" />
      <Link href="/admin/dream-boards?flagged=true" class="text-primary hover:underline">
        {flaggedBoards} flagged boards
      </Link>
    </li>
    <li class="flex items-center gap-2 text-text-secondary">
      <span class="inline-block w-2 h-2 rounded-full bg-warning" />
      <Link href="/admin/support?status=open" class="text-primary hover:underline">
        {openTickets} open support tickets
      </Link>
    </li>
  </ul>
</Card>
```

---

## Section 2: Dreamboards Management

### Route: `/admin/dream-boards`

### Purpose
Complete visibility into all Dreamboards with filtering, search, and individual board actions.

### Data Table

```html
<Card variant="default" padding="lg">
  <div class="mb-6 flex items-center justify-between">
    <h2 class="text-2xl font-display font-bold text-text">
      Dreamboards
    </h2>
    <div class="flex gap-2">
      <SearchInput placeholder="Search by child name, parent, ID..." />
      <FilterButton />
    </div>
  </div>

  <!-- Filters (Collapsible) -->
  <FilterPanel
    filters={[
      { name: 'status', options: ['active', 'completed', 'all'] },
      { name: 'dateRange', type: 'daterange' },
      { name: 'amountRange', type: 'rangeSlider' },
      { name: 'charityEnabled', type: 'checkbox' },
    ]}
    onApply={handleFilterApply}
  />

  <!-- Data Table -->
  <table class="w-full">
    <thead>
      <tr class="border-b border-border">
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">ID</th>
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">Child Name</th>
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">Parent</th>
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">Created</th>
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">Status</th>
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">Contributors</th>
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">Raised</th>
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">End Date</th>
        <th class="text-left py-3 px-4 font-semibold text-text-muted text-sm">Actions</th>
      </tr>
    </thead>
    <tbody>
      {boards.map((board) => (
        <tr key={board.id} class="border-b border-border hover:bg-subtle">
          <td class="py-4 px-4 text-sm text-text-muted font-mono">{board.id.slice(0, 8)}</td>
          <td class="py-4 px-4 text-sm text-text font-semibold">{board.child_name}</td>
          <td class="py-4 px-4 text-sm text-text">{board.parent_name}</td>
          <td class="py-4 px-4 text-sm text-text-secondary">{board.created_at_formatted}</td>
          <td class="py-4 px-4 text-sm">
            <Badge variant={board.status === 'active' ? 'success' : 'default'}>
              {board.status === 'active' ? '● ACTIVE' : '✓ COMPLETE'}
            </Badge>
          </td>
          <td class="py-4 px-4 text-sm text-text font-semibold">{board.contributor_count}</td>
          <td class="py-4 px-4 text-sm text-text font-semibold">R{board.amount_raised}</td>
          <td class="py-4 px-4 text-sm text-text-secondary">{board.end_date_formatted}</td>
          <td class="py-4 px-4 text-sm">
            <div class="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => viewBoard(board.id)}>
                View
              </Button>
              {!board.flagged && (
                <Button variant="ghost" size="sm" onClick={() => flagBoard(board.id)}>
                  Flag
                </Button>
              )}
              {board.status === 'active' && (
                <Button variant="ghost" size="sm" onClick={() => closeBoard(board.id)}>
                  Close
                </Button>
              )}
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <!-- Pagination -->
  <Pagination
    page={page}
    totalPages={totalPages}
    onPageChange={setPage}
  />
</Card>
```

**Table Columns:**

| Column | Format | Notes |
|--------|--------|-------|
| ID | 8-char truncated UUID | Monospace, gray |
| Child Name | Text | Bold, searchable |
| Parent | Email or name | Link to parent profile |
| Created | "Jan 15, 2025" | Relative time on hover |
| Status | Badge ("● ACTIVE" or "✓ COMPLETE") | Color-coded |
| Contributors | Integer | Count of unique contributors |
| Raised | "R2,450" | Formatted currency |
| End Date | "Jan 20, 2025" | Searchable, filterable |
| Actions | View/Flag/Close | Contextual buttons |

**Filters:**
- Status: active, completed
- Date range: From/To date picker
- Amount range: Slider or input
- Charity enabled: Checkbox

### Board Detail View (Modal/Page)

When clicking "View" on a board:

```html
<Dialog open={showDetail} onOpenChange={setShowDetail}>
  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>{childName}'s Dreamboard (ID: {id})</DialogTitle>
    </DialogHeader>

    <div className="space-y-6">
      <!-- Board Info -->
      <Section title="Board Information">
        <Grid columns={2} gap={4}>
          <Item label="Child Name" value={childName} />
          <Item label="Child DOB" value={childDOB} />
          <Item label="Parent Email" value={parentEmail} link={true} />
          <Item label="Status" value={status} />
          <Item label="Created" value={createdDate} />
          <Item label="End Date" value={endDate} />
        </Grid>
      </Section>

      <!-- Financial Info -->
      <Section title="Financial Summary">
        <Grid columns={3} gap={4}>
          <Item label="Total Raised" value={`R${amountRaised}`} />
          <Item label="Contributors" value={contributorCount} />
          <Item label="Avg Contribution" value={`R${avgContribution}`} />
        </Grid>
      </Section>

      <!-- Contribution List -->
      <Section title="Contributions">
        <Table>
          {contributions.map((c) => (
            <Row key={c.id}>
              <Cell>{c.name}</Cell>
              <Cell>R{c.amount}</Cell>
              <Cell>{c.date}</Cell>
              <Cell>{c.status}</Cell>
            </Row>
          ))}
        </Table>
      </Section>

      <!-- Payout Details -->
      <Section title="Payout Details">
        <Item label="Method" value={payoutMethod} />
        <Item label="Status" value={payoutStatus} />
        <Item label="Reference" value={payoutReference} />
        <Item label="Amount" value={`R${payoutAmount}`} />
      </Section>

      <!-- Audit Log -->
      <Section title="Audit Log">
        <Timeline>
          {auditLog.map((entry) => (
            <TimelineItem key={entry.id}>
              <span>{entry.action}</span>
              <time>{entry.timestamp}</time>
            </TimelineItem>
          ))}
        </Timeline>
      </Section>
    </div>

    <DialogFooter>
      <Button onClick={() => setShowDetail(false)}>Close</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Section 3: Contributions Management

### Route: `/admin/contributions`

### Purpose
Manage individual contributions, issue refunds, and track payment statuses.

### Data Table

```html
<Card variant="default" padding="lg">
  <div className="mb-6 flex items-center justify-between">
    <h2 className="text-2xl font-display font-bold text-text">
      Contributions
    </h2>
    <SearchInput placeholder="Search by contributor, Dreamboard, ID..." />
  </div>

  <!-- Filters -->
  <FilterPanel
    filters={[
      { name: 'status', options: ['completed', 'pending', 'failed', 'refunded'] },
      { name: 'paymentMethod', options: ['card', 'bank_transfer', 'all'] },
      { name: 'dateRange', type: 'daterange' },
      { name: 'amountRange', type: 'rangeSlider' },
    ]}
  />

  <!-- Table -->
  <table className="w-full">
    <thead>
      <tr className="border-b border-border">
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">ID</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Contributor</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Dreamboard</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Amount</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Fee</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Net</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Status</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Method</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Date</th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">Actions</th>
      </tr>
    </thead>
    <tbody>
      {contributions.map((contrib) => (
        <tr key={contrib.id} className="border-b border-border hover:bg-subtle">
          <td className="py-4 px-4 text-sm text-text-muted font-mono">
            {contrib.id.slice(0, 8)}
          </td>
          <td className="py-4 px-4 text-sm text-text">{contrib.contributor_name}</td>
          <td className="py-4 px-4 text-sm text-primary hover:underline">
            <Link href={`/admin/dream-boards/${contrib.board_id}`}>
              {contrib.board_child_name}
            </Link>
          </td>
          <td className="py-4 px-4 text-sm text-text font-semibold">
            R{contrib.amount}
          </td>
          <td className="py-4 px-4 text-sm text-text-secondary">
            R{contrib.fee}
          </td>
          <td className="py-4 px-4 text-sm text-text font-semibold">
            R{contrib.net}
          </td>
          <td className="py-4 px-4 text-sm">
            <Badge variant={getStatusVariant(contrib.status)}>
              {contrib.status}
            </Badge>
          </td>
          <td className="py-4 px-4 text-sm text-text-secondary">
            {contrib.payment_method}
          </td>
          <td className="py-4 px-4 text-sm text-text-secondary">
            {contrib.date_formatted}
          </td>
          <td className="py-4 px-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openRefundModal(contrib.id)}
              disabled={contrib.status !== 'completed'}
            >
              Refund
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <Pagination page={page} totalPages={totalPages} />
</Card>
```

### Refund Modal

```typescript
interface RefundModalProps {
  contributionId: string;
  amount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function RefundModal({
  contributionId,
  amount,
  onClose,
  onSuccess,
}: RefundModalProps) {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefund = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for the refund');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/admin/contributions/${contributionId}/refund`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) throw new Error('Refund failed');

      showSuccessToast('Refund processed successfully');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Process Refund</DialogTitle>
          <DialogDescription>
            Refund amount: R{(amount / 100).toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-text">
              Reason for Refund
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this refund is being issued..."
              className="w-full min-h-24 p-3 border border-border rounded-lg mt-1"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-error rounded-lg p-3 text-sm text-error">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRefund}
            loading={isProcessing}
          >
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Section 4: Payouts Management

### Route: `/admin/payouts`

### Purpose
Track, manage, and approve payouts to parent accounts.

### Data Table

```html
<Card variant="default" padding="lg">
  <h2 className="text-2xl font-display font-bold text-text mb-6">
    Payouts Management
  </h2>

  <!-- Filters -->
  <FilterPanel
    filters={[
      { name: 'status', options: ['pending', 'approved', 'processing', 'complete', 'failed'] },
      { name: 'method', options: ['karri_card', 'bank_transfer'] },
      { name: 'dateRange', type: 'daterange' },
    ]}
  />

  <table className="w-full">
    <thead>
      <tr className="border-b border-border">
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Dreamboard
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Parent
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Method
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Amount
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Status
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Requested
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Processed
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      {payouts.map((payout) => (
        <tr key={payout.id} className="border-b border-border hover:bg-subtle">
          <td className="py-4 px-4 text-sm text-primary">
            <Link href={`/admin/dream-boards/${payout.board_id}`}>
              {payout.board_name}
            </Link>
          </td>
          <td className="py-4 px-4 text-sm text-text">{payout.parent_email}</td>
          <td className="py-4 px-4 text-sm text-text-secondary">
            {payout.method === 'karri_card' ? 'Karri Card' : 'Bank Transfer'}
          </td>
          <td className="py-4 px-4 text-sm text-text font-semibold">
            R{payout.amount}
          </td>
          <td className="py-4 px-4 text-sm">
            <Badge variant={getPayoutStatusVariant(payout.status)}>
              {payout.status}
            </Badge>
          </td>
          <td className="py-4 px-4 text-sm text-text-secondary">
            {payout.requested_date}
          </td>
          <td className="py-4 px-4 text-sm text-text-secondary">
            {payout.processed_date || '-'}
          </td>
          <td className="py-4 px-4 text-sm space-x-2">
            {payout.status === 'pending' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleApprove(payout.id)}
                >
                  Approve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHold(payout.id)}
                >
                  Hold
                </Button>
              </>
            )}
            {payout.status === 'approved' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkSent(payout.id)}
              >
                Mark Sent
              </Button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <Pagination page={page} totalPages={totalPages} />
</Card>
```

**Payout Statuses:**
- `pending`: Awaiting admin review
- `approved`: Approved but not yet sent
- `processing`: In progress
- `complete`: Successfully sent
- `failed`: Transaction failed

---

## Section 5: Charity Management

### Route: `/admin/charities`

### Purpose
Manage registered charities and their settings.

### Charity List Table

```html
<Card variant="default" padding="lg">
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-2xl font-display font-bold text-text">
      Charities
    </h2>
    <Button variant="primary" onClick={openAddCharityModal}>
      + Add Charity
    </Button>
  </div>

  <table className="w-full">
    <thead>
      <tr className="border-b border-border">
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Name
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Category
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Status
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Logo
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Boards Using
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Total Donated
        </th>
        <th className="text-left py-3 px-4 font-semibold text-text-muted text-sm">
          Actions
        </th>
      </tr>
    </thead>
    <tbody>
      {charities.map((charity) => (
        <tr key={charity.id} className="border-b border-border hover:bg-subtle">
          <td className="py-4 px-4 text-sm text-text font-semibold">
            {charity.name}
          </td>
          <td className="py-4 px-4 text-sm text-text-secondary">
            {charity.category}
          </td>
          <td className="py-4 px-4 text-sm">
            <Badge variant={charity.active ? 'success' : 'default'}>
              {charity.active ? 'Active' : 'Inactive'}
            </Badge>
          </td>
          <td className="py-4 px-4">
            <img
              src={charity.logo_url}
              alt={charity.name}
              className="w-8 h-8 rounded"
            />
          </td>
          <td className="py-4 px-4 text-sm text-text">
            {charity.board_count}
          </td>
          <td className="py-4 px-4 text-sm text-text font-semibold">
            R{charity.total_donated}
          </td>
          <td className="py-4 px-4 text-sm space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => openEditCharityModal(charity.id)}
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleCharityStatus(charity.id)}
            >
              {charity.active ? 'Deactivate' : 'Reactivate'}
            </Button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</Card>
```

### Add/Edit Charity Form

Runtime behavior (v2 as implemented):

- Add mode (`Add charity`) captures only public-facing required fields:
  - `name`
  - `description`
  - `category`
  - `logo URL`
- Add mode also supports optional `Autofill from URL`:
  - Admin enters a charity website URL.
  - Server fetches metadata/text, calls Claude, and returns a draft.
  - Form is prefilled for review.
  - No record is auto-created from URL ingest.
- Edit mode keeps full metadata editing and exposes optional operational fields:
  - `website`
  - `contact name`
  - `contact email`
  - `bank account details (JSON)`
- Bank JSON is optional at create time and optional at edit time.
- Contact fields are nullable in admin datasets and can render as `—` when absent.

---

## Section 6: Financial Reports

### Route: `/admin/reports`

### Purpose
Generate detailed financial reports for auditing and analysis.

### Report Types

```html
<Card variant="default" padding="lg">
  <h2 className="text-2xl font-display font-bold text-text mb-6">
    Financial Reports
  </h2>

  <!-- Date Range Selector -->
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
    <FormGroup>
      <Label>From Date</Label>
      <Input
        type="date"
        value={fromDate}
        onChange={(e) => setFromDate(e.target.value)}
      />
    </FormGroup>
    <FormGroup>
      <Label>To Date</Label>
      <Input
        type="date"
        value={toDate}
        onChange={(e) => setToDate(e.target.value)}
      />
    </FormGroup>
    <div className="flex items-end gap-2">
      <Button variant="primary" onClick={generateReport}>
        Generate Report
      </Button>
    </div>
  </div>

  <!-- Report Types Tabs -->
  <div className="flex gap-2 mb-6 border-b border-border">
    {reportTypes.map((type) => (
      <button
        key={type}
        onClick={() => setSelectedReport(type)}
        className={`px-4 py-2 font-semibold text-sm transition ${
          selectedReport === type
            ? 'text-primary border-b-2 border-primary'
            : 'text-text-muted hover:text-text'
        }`}
      >
        {type}
      </button>
    ))}
  </div>

  <!-- Report Content -->
  {selectedReport === 'revenue' && <RevenueReport data={reportData} />}
  {selectedReport === 'payouts' && <PayoutsReport data={reportData} />}
  {selectedReport === 'charity' && <CharityReport data={reportData} />}
  {selectedReport === 'transactions' && <TransactionsReport data={reportData} />}
  {selectedReport === 'reconciliation' && <ReconciliationReport data={reportData} />}

  <!-- Download Button -->
  <div className="mt-6 flex gap-2">
    <Button variant="secondary" onClick={downloadAsCSV}>
      <DownloadIcon size="sm" />
      Download as CSV
    </Button>
    <Button variant="secondary" onClick={downloadAsPDF}>
      <DownloadIcon size="sm" />
      Download as PDF
    </Button>
  </div>
</Card>
```

### Report Types

#### 6.1 Revenue Report

Shows total revenue, breakdown by payment method, top Dreamboards.

#### 6.2 Payouts Report

Shows all payouts, breakdown by parent, method, status.

#### 6.3 Charity Donations Report

Shows donations to each charity, total amounts, distribution.

#### 6.4 Transactions Report

Detailed transaction log with fees, net amounts, statuses.

#### 6.5 Reconciliation Report

Compares expected amounts vs actual transfers, identifies discrepancies.

---

## Section 7: Platform Settings

### Route: `/admin/settings`

### Purpose
Configure platform-wide settings and fees.

### Settings Form

```html
<Card variant="default" padding="lg">
  <h2 className="text-2xl font-display font-bold text-text mb-6">
    Platform Settings
  </h2>

  <form onSubmit={handleSaveSettings} className="space-y-8">
    <!-- Fee Configuration -->
    <Section title="Fee Configuration">
      <FormGroup>
        <Label htmlFor="platformFee">
          Platform Processing Fee (%)
        </Label>
        <div className="flex items-center gap-4">
          <Input
            id="platformFee"
            type="number"
            value={platformFee}
            onChange={(e) => setPlatformFee(parseFloat(e.target.value))}
            step="0.1"
            min="0"
            max="100"
            className="max-w-xs"
          />
          <p className="text-sm text-text-secondary">
            Current: {platformFee}%
          </p>
        </div>
        <p className="text-xs text-text-muted mt-2">
          This percentage is deducted from all contributions
        </p>
      </FormGroup>
    </Section>

    <!-- Contribution Limits -->
    <Section title="Contribution Limits">
      <div className="grid grid-cols-2 gap-6">
        <FormGroup>
          <Label htmlFor="minContribution">
            Minimum Contribution (R)
          </Label>
          <Input
            id="minContribution"
            type="number"
            value={minContribution}
            onChange={(e) => setMinContribution(parseInt(e.target.value))}
            step="1"
          />
        </FormGroup>
        <FormGroup>
          <Label htmlFor="maxContribution">
            Maximum Contribution (R)
          </Label>
          <Input
            id="maxContribution"
            type="number"
            value={maxContribution}
            onChange={(e) => setMaxContribution(parseInt(e.target.value))}
            step="1"
          />
        </FormGroup>
      </div>
    </Section>

    <!-- Preset Amounts -->
    <Section title="Preset Contribution Amounts">
      <p className="text-sm text-text-secondary mb-4">
        Quick-select amounts for contributors (comma-separated)
      </p>
      <textarea
        value={presetAmounts}
        onChange={(e) => setPresetAmounts(e.target.value)}
        className="w-full p-3 border border-border rounded-lg font-mono text-sm"
        placeholder="100, 250, 500, 1000, 2500"
        rows={3}
      />
      <p className="text-xs text-text-muted mt-2">
        Example: 100, 250, 500, 1000, 2500
      </p>
    </Section>

    <!-- Notifications -->
    <Section title="Email Notifications">
      <div className="space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={notif.id}
              checked={notif.enabled}
              onChange={(e) => toggleNotification(notif.id, e.target.checked)}
              className="rounded"
            />
            <label htmlFor={notif.id} className="text-sm text-text">
              {notif.label}
            </label>
          </div>
        ))}
      </div>
    </Section>

    <!-- Save Button -->
    <div className="flex gap-3 pt-6 border-t border-border">
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" loading={isSaving}>
        Save Settings
      </Button>
    </div>
  </form>
</Card>
```

---

## Common Components

### Sidebar Navigation

```typescript
export function AdminSidebar() {
  const pathname = usePathname();

  const items = [
    { href: '/admin', icon: LayoutIcon, label: 'Dashboard' },
    { href: '/admin/dream-boards', icon: BoxIcon, label: 'Dreamboards' },
    { href: '/admin/contributions', icon: DollarIcon, label: 'Contributions' },
    { href: '/admin/payouts', icon: SendIcon, label: 'Payouts' },
    { href: '/admin/charities', icon: HeartIcon, label: 'Charities' },
    { href: '/admin/reports', icon: BarChartIcon, label: 'Reports' },
    { href: '/admin/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <aside className="w-64 bg-surface border-r border-border h-screen">
      <nav className="p-6 space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
              pathname === item.href
                ? 'bg-primary/10 text-primary font-semibold'
                : 'text-text-secondary hover:bg-subtle'
            }`}
          >
            <item.icon size="md" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

### Data Table Component

```typescript
interface DataTableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  onRowClick?: (row: T) => void;
  pagination?: PaginationProps;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  pagination,
}: DataTableProps<T>) {
  return (
    <>
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="text-left py-3 px-4 font-semibold text-text-muted text-sm"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border hover:bg-subtle cursor-pointer"
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="py-4 px-4 text-sm text-text"
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {pagination && <Pagination {...pagination} />}
    </>
  );
}
```

---

## Data Fetching Strategy

### Server Components

All admin data should be fetched server-side to minimize API calls and improve security.

```typescript
// src/app/admin/dream-boards/page.tsx
export const dynamic = 'force-dynamic';

export default async function DreamBoardsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const { userId } = await auth();

  // Verify admin access (Clerk user + allowlisted email)
  const isAdmin = await verifyAdminAllowlist(userId);
  if (!isAdmin) {
    redirect('/');
  }

  const params = await searchParams;
  const boards = await getDreamBoards({
    page: parseInt(params.page || '1'),
    limit: 20,
    status: params.status,
    search: params.search,
  });

  return <DreamBoardsPageContent boards={boards} />;
}
```

### Pagination

```typescript
interface PaginationParams {
  page: number;
  limit: number;
}

export async function getDreamBoards(
  params: PaginationParams & FilterParams
): Promise<PaginatedResponse<DreamBoard>> {
  const offset = (params.page - 1) * params.limit;

  const response = await fetch(`${API_BASE}/admin/dream-boards`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${process.env.API_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      offset,
      limit: params.limit,
      filters: {
        status: params.status,
        search: params.search,
      },
    }),
  });

  return response.json();
}
```

---

## Responsive Behavior

### Mobile Admin Panel

- Sidebar: Collapsible hamburger menu
- Tables: Horizontal scroll with fixed first column
- Modals: Full viewport height on mobile
- Charts: Smaller dimensions, optimized for mobile

### Tablet & Desktop

- Sidebar: Always visible
- Tables: Full responsive layout
- Modals: Centered, constrained width
- Charts: Full-sized, optimized layout

---

## Accessibility

### WCAG 2.1 AA Compliance

- All tables have `<thead>` and `<tbody>` for screen readers
- Buttons have aria-labels where needed
- Modals have proper focus management
- Color used in status badges is paired with text labels
- Form errors use role="alert" for announcements

### Keyboard Navigation

- Tab order logical across all sections
- Escape closes modals
- Enter submits forms
- Arrow keys navigate tables (future enhancement)

---

## Implementation Checklist

- [ ] Admin middleware and authorization
- [ ] Dashboard overview page with stats and charts
- [ ] Dream boards management table and detail modal
- [ ] Contributions management table and refund flow
- [ ] Payouts management table and approval flow
- [ ] Charity management CRUD
- [ ] Financial reports generation (all 5 types)
- [ ] Platform settings form
- [ ] Sidebar navigation
- [ ] Data tables with pagination and filtering
- [ ] Search functionality across all sections
- [ ] Admin dashboard responsive design
- [ ] Accessibility testing
- [ ] API endpoints for all admin operations
- [ ] Error handling and user feedback
- [ ] Export to CSV/PDF for reports

---

**Document Version:** 1.1
**Status:** Runtime-aligned with authorization/model corrections
**Last Updated:** February 11, 2026
**Line Count:** 650+ lines of comprehensive specifications
