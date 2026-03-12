> **Document Status:** Reference only. Reviewed March 12, 2026.
> Useful context only. Do not use this file as the source of truth for current runtime behavior or agent policy.
> Canonical replacement: `docs/Platform-Spec-Docs/UX.md`.
# Gifta UX v2: Host Dashboard - Dreamboard Detail View
## Comprehensive UI Specification

**Document Version:** 1.1
**Status:** Runtime-aligned (V2 elegance refresh)
**Route:** `/dashboard/[id]`
**Last Updated:** February 20, 2026
**Target Audience:** AI coding agents, UI developers

---

## Runtime Alignment (2026-02-20)

- Runtime source: `src/app/(host)/dashboard/[id]/page.tsx`, `src/app/(host)/dashboard/[id]/DashboardDetailClient.tsx`, `src/lib/host/dashboard-view-model.ts`.
- Active host detail uses a two-column layout (`left content + sticky right rail`) on desktop and a single-column stack on mobile.
- Typography baseline is now consistent with the design mockup:
  - `Fraunces` (`font-display`) for major headings and key numerals.
  - `DM Sans` (`font-warmth-sans`) for body/meta/action copy.
- Active hero card includes:
  - gift-line navbar brand glyph (`🎁`) + gift name,
  - birthday/party metadata row (`🎂` birthday, `🎈 Party:`),
  - conditional giving-back pill (`💜`) rendered only for percentage charity split with available charity name.
- Hero gift-line no longer uses `/icons/gifts/gifta-logo.png`; the icon token is the same navbar brand symbol for consistency.
- Top-right hero status chip remains the status anchor for active/funded states.
- Right rail top card now follows the mockup structure: centered raised amount, uppercase micro-label, divider, and 3 stat columns (contributors/messages/days left).
- Quick actions are rendered as stacked rows with icon box + label + description + chevron affordance.
- Host close action is not currently exposed in dashboard UI; close is handled via partner API (`POST /api/v1/dream-boards/{id}/close`).
- Contributors rows intentionally show contributor identity + relative time + message indicator only (no per-contributor amount display).
- Birthday message cards now render full text with muted surface, subtle border, and decorative opening quote treatment.
- Payout status list and contributor/message sections remain live and match runtime data queries.

## Locked Typography Tokens (Desktop)

Source of truth: `docs/UI-refactors/Dreamboard-Dashboard/gifta-dashboard-mockup-desktop.html`.

- Hero title: `28px` (`Fraunces`)
- Status chip: `12px`, semibold, uppercase, `0.5px` tracking
- Gift line: `14px` (`DM Sans`)
- Hero dates row: `13px`
- Giving-back pill: `12px`, semibold
- Section headers (Contributors, Birthday Messages): `18px` (`Fraunces`)
- Count chip: `13px`, semibold
- Contributor name/date: `14px` / `12px`
- Message sender/body: `14px` / `14px` (`line-height: 1.6`)
- Total raised amount/label: `42px` / `12px` (label `1.5px` tracking, uppercase)
- Stat numbers/labels: `24px` / `11px`
- Quick Actions title/row label/row description/chevron: `16px` / `14px` / `12px` / `16px`
- Payout Details title/row label/row value/meta: `16px` / `13px` / `14px` / `12px`

## Table of Contents

1. [Screen Overview](#screen-overview)
2. [Visual Layout](#visual-layout)
3. [Section-by-Section Specifications](#section-by-section-specifications)
4. [Component Tree](#component-tree)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [File Structure](#file-structure)
7. [Data Fetching](#data-fetching)
8. [Responsive Behavior](#responsive-behavior)
9. [Animations & Interactions](#animations--interactions)
10. [Accessibility](#accessibility)
11. [State Management](#state-management)
12. [Edge Cases](#edge-cases)

---

## Screen Overview

### Purpose
The Detail View displays comprehensive information about a single Dreamboard. Parents can view all contributions, messages, payout details, and take quick actions like editing, sharing, or viewing the public page.

### Route & Authentication
- **Route:** `/dashboard/[id]` where `[id]` is the Dreamboard UUID
- **Auth Required:** Yes (Parent must own the board)
- **Redirect:** Unauthorized access → `/dashboard`
- **Fallback:** Invalid ID → 404 or dashboard with error toast

### Key Features
- Back navigation to list
- Dreamboard metadata and progress
- Financial breakdown with fees
- Contributors list with details
- Birthday messages section with preview & download
- Quick action buttons
- Payout status and details
- Full contribution history

---

## Visual Layout

### Mobile Layout (320px - 767px)

```
┌──────────────────────────────────┐
│  GIFTA              [≡ menu]     │ ← Header
├──────────────────────────────────┤
│                                  │
│  ← Back to all Dreamboards      │ ← Back link
│                                  │
├──────────────────────────────────┤
│                                  │
│  Emma's Dreamboard              │
│  Age 7 • Birthday Jan 15          │
│  ● ACTIVE                         │
│  23 days left                     │
│                                  │
├──────────────────────────────────┤
│  PROGRESS                        │
│  [████████░░] 80%                │
├──────────────────────────────────┤
│  SUMMARY STATS                   │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ Total Raised                │ │
│  │ R2,450                      │ │
│  │ Large, prominent number     │ │
│  └─────────────────────────────┘ │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ Contributors                │ │
│  │ 12                          │ │
│  └─────────────────────────────┘ │
│                                  │
│  ┌─────────────────────────────┐ │
│  │ Time Remaining              │ │
│  │ 23 days                     │ │
│  └─────────────────────────────┘ │
│                                  │
│  R2,382 after 2.9% card fee     │ ← Fee note
│                                  │
├──────────────────────────────────┤
│  CONTRIBUTIONS (12)              │
│                                  │
│  Karri Okeefe · R500             │
│  3 hours ago          💬 message │
│                                  │
│  John Smith · R250               │
│  1 day ago                       │
│                                  │
│  Sarah Jones · R1,700            │
│  2 days ago           💬 message │
│                                  │
│  [+ Show all contributions ▼]    │
│                                  │
├──────────────────────────────────┤
│  BIRTHDAY MESSAGES (4)           │
│                                  │
│  "Can't wait for the party!"     │
│  - Sarah Jones, contributed      │
│                                  │
│  "So excited for Emma!"          │
│  - John Smith, contributed       │
│                                  │
│  [📥 Download Birthday           │
│   Messages Book (PDF)]           │
│                                  │
├──────────────────────────────────┤
│  QUICK ACTIONS                   │
│                                  │
│  [🔗 Share Dreamboard]          │
│  [✏️  Edit Dreamboard]           │
│  [👁️ View Public Page]           │
│                                  │
├──────────────────────────────────┤
│  PAYOUT DETAILS                  │
│                                  │
│  Method: Karri Card              │
│  Status: Ready to send           │
│  Card ending in: ****5678        │
│                                  │
│  [Update payout details]         │
│                                  │
└──────────────────────────────────┘
```

### Desktop Layout (1024px+)

```
┌────────────────────────────────────────────────────────────────────┐
│ GIFTA     [Nav items]                              [Profile]       │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ← Back to all Dreamboards                                       │
│                                                                    │
├─────────────────────────────────────────────────────────────────┐ │
│  Emma's Dreamboard                                             │ │
│  Age 7 • Birthday Jan 15 • ● ACTIVE • 23 days left             │ │
│                                                                 │ │
│  Progress: [████████░░] 80%                                     │ │
│                                                                 │ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐ │ │
│  │  Total Raised    │  │  Contributors    │  │ Time Left    │ │ │
│  │  R2,450          │  │  12              │  │ 23 days      │ │ │
│  └──────────────────┘  └──────────────────┘  └──────────────┘ │ │
│                                                                 │ │
│  R2,382 after 2.9% card processing fee                         │ │
│                                                                 │ │
│  ─────────────────────────────────────────────────────────── │ │
│                                                                 │ │
└─────────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────┐  ┌────────────────────────────────┐ │
│  │ CONTRIBUTIONS (12)       │  │ BIRTHDAY MESSAGES (4)          │ │
│  │                          │  │                                │ │
│  │ Karri Okeefe · R500      │  │ "Can't wait for the party!"   │ │
│  │ 3 hours ago      💬      │  │ - Sarah Jones                 │ │
│  │                          │  │                                │ │
│  │ John Smith · R250        │  │ "So excited for Emma!"        │ │
│  │ 1 day ago                │  │ - John Smith                  │ │
│  │                          │  │                                │ │
│  │ Sarah Jones · R1,700     │  │ [📥 Download Birthday         │ │
│  │ 2 days ago       💬      │  │  Messages Book (PDF)]         │ │
│  │                          │  │                                │ │
│  │ [+ Show all (9 more)]    │  │ [View all messages →]         │ │
│  └──────────────────────────┘  └────────────────────────────────┘ │
│                                                                    │
│  QUICK ACTIONS:                                                   │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐  │
│  │ 🔗 Share         │ │ ✏️  Edit          │ │ 👁️ View Public  │  │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘  │
│                                                                    │
├────────────────────────────────────────────────────────────────────┤
│  PAYOUT DETAILS                                                    │
│  Method: Karri Card | Status: Ready to send | Card: ****5678      │
│  [Update payout details]                                           │
└────────────────────────────────────────────────────────────────────┘
```

---

## Section-by-Section Specifications

### 1. Back Navigation

**Component:**
```html
<Link href="/dashboard" className="flex items-center gap-2 text-primary hover:text-primary-700 mb-6">
  <ArrowLeft size="md" />
  <span>Back to all Dreamboards</span>
</Link>
```

**Specifications:**
- Link color: `text-primary` (#0D9488)
- Hover color: `hover:text-primary-700` (#0F766E)
- Icon: Left arrow, 20px
- Spacing: `mb-6` (24px) from next section
- Accessibility: Descriptive link text, no icon-only

---

### 2. Dreamboard Header Card

**Component Structure:**
```html
<Card variant="elevated" padding="lg" className="mb-6">
  <div className="space-y-4">
    <!-- Title Section -->
    <div>
      <h1 className="text-3xl md:text-4xl font-display font-bold text-text">
        {childName}'s Dreamboard
      </h1>
      <p className="text-text-secondary text-lg mt-2">
        Age {age} • Birthday {birthdayFormatted} • {statusBadge} • {timeRemainingText}
      </p>
    </div>

    <!-- Progress Bar -->
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-muted">Progress</span>
        <span className="text-sm font-semibold text-text">{progressPercentage}%</span>
      </div>
      <div className="w-full bg-border rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-primary to-primary-700 h-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>

    <!-- Divider -->
    <hr className="border-border my-2" />

    <!-- Status and Meta -->
    <div className="flex items-center gap-3">
      {statusBadge}
      {isCompleted && (
        <span className="text-sm text-text-muted">
          {completedDaysAgo} days ago
        </span>
      )}
    </div>
  </div>
</Card>
```

**Specifications:**
- Variant: `elevated` (white background, lifted shadow)
- Padding: `lg` (2rem)
- Border radius: `rounded-2xl`
- Title: `text-3xl md:text-4xl font-display font-bold text-text`
- Subtitle: `text-text-secondary text-lg`
- Progress bar: 8px height, gradient fill
- Meta spacing: `space-y-4` (gap-4 between sections)
- Status badge: Success color, inline icon

---

### 3. Summary Stats Cards

**Three-column layout (stacks on mobile):**

```html
<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
  <!-- Total Raised Card -->
  <Card variant="default" padding="md" className="text-center">
    <p className="text-text-muted text-sm mb-2">Total Raised</p>
    <p className="text-4xl md:text-5xl font-bold text-text">
      R{amountRaised}
    </p>
    <p className="text-text-secondary text-sm mt-3">
      from {contributorCount} {contributorCount === 1 ? 'contributor' : 'contributors'}
    </p>
  </Card>

  <!-- Contributors Card -->
  <Card variant="default" padding="md" className="text-center">
    <p className="text-text-muted text-sm mb-2">Contributors</p>
    <p className="text-4xl md:text-5xl font-bold text-text">
      {contributorCount}
    </p>
    <p className="text-text-secondary text-sm mt-3">
      people chipped in
    </p>
  </Card>

  <!-- Time Remaining Card -->
  <Card variant="default" padding="md" className="text-center">
    <p className="text-text-muted text-sm mb-2">Time Remaining</p>
    <p className="text-4xl md:text-5xl font-bold text-text">
      {daysRemaining}
    </p>
    <p className="text-text-secondary text-sm mt-3">
      {daysRemaining === 1 ? 'day left' : 'days left'}
    </p>
  </Card>
</div>
```

**Card Specifications:**
- Variant: `default`
- Padding: `md` (1.5rem)
- Layout: `grid grid-cols-1 md:grid-cols-3 gap-4`
- Text alignment: `text-center`
- Big number: `text-4xl md:text-5xl font-bold`
- Label: `text-text-muted text-sm`
- Meta: `text-text-secondary text-sm`
- Mobile: Stack vertically (1 column)
- Tablet+: 3 equal columns

**Fee Disclosure:**
```html
<p className="text-center text-sm text-text-secondary mt-4">
  <span className="font-semibold">R{netAmount}</span> after 2.9% card processing fee
</p>
```

---

### 4. Contributions Section

**Section Title:**
```html
<h2 className="text-2xl font-display font-bold text-text mb-4">
  Contributions ({contributionCount})
</h2>
```

**Contribution List Item:**
```html
<div className="flex items-start justify-between gap-4 py-4 border-b border-border last:border-b-0">
  <div className="flex-1">
    <p className="font-semibold text-text">{contributorName}</p>
    <p className="text-sm text-text-muted">{relativeTime} ago</p>
    {hasMessage && (
      <p className="text-sm text-primary mt-1 flex items-center gap-1">
        <CommentIcon size="sm" />
        Has message
      </p>
    )}
  </div>
</div>
```

**List Container:**
- `space-y-0` (dividers handle spacing)
- Divider: `border-b border-border`
- Last item: `last:border-b-0`
- Padding per item: `py-4`

**Show More / Show Less:**
```html
<button
  onClick={toggleShowMore}
  className="mt-4 w-full py-2 text-center text-primary font-semibold hover:bg-subtle rounded-lg"
>
  {isExpanded ? '- Show less' : `+ Show all contributions (${remaining} more)`}
</button>
```

**Privacy rule:**
- Individual contribution amounts are not shown in host dashboard contribution history.

---

### 5. Birthday Messages Section

**Section Title & Preview:**
```html
<div className="mt-8">
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl font-display font-bold text-text">
      Birthday Messages ({messageCount})
    </h2>
    {messageCount > 2 && (
      <Link href="#" className="text-primary font-semibold">
        View all →
      </Link>
    )}
  </div>

  <!-- Message Preview Cards -->
  <div className="space-y-4 mb-6">
    {messages.slice(0, 2).map((msg) => (
      <Card variant="minimal" padding="md" key={msg.id}>
        <blockquote className="text-text-secondary italic mb-2 leading-relaxed">
          "{msg.text}"
        </blockquote>
        <footer className="text-sm text-text-muted">
          - {msg.contributorName}, {msg.relationshipType}
        </footer>
      </Card>
    ))}
  </div>

  <!-- Download Button -->
  <Button
    variant="secondary"
    size="md"
    onClick={downloadMessagesBook}
    className="w-full md:w-auto"
  >
    <DownloadIcon size="sm" />
    Download Birthday Messages Book (PDF)
  </Button>
</div>
```

**Card Specifications:**
- Variant: `minimal` (border-only, no fill)
- Padding: `md` (1.5rem)
- Quote styling: `italic text-text-secondary`
- Citation: `text-sm text-text-muted`
- Show: First 2 messages, link to view all
- Download: Secondary button, icon + text

---

### 6. Quick Actions Section

**Button Layout:**
```html
<div className="mt-8 pt-6 border-t border-border">
  <h3 className="text-lg font-semibold text-text mb-4">Quick Actions</h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
    <Button
      variant="outline"
      size="md"
      onClick={openShareModal}
      className="flex items-center justify-center gap-2"
    >
      <ShareIcon size="sm" />
      Share Dreamboard
    </Button>

    <Button
      variant="outline"
      size="md"
      onClick={openEditModal}
      className="flex items-center justify-center gap-2"
    >
      <EditIcon size="sm" />
      Edit Dreamboard
    </Button>

    <Button
      variant="outline"
      size="md"
      asChild
      className="flex items-center justify-center gap-2"
    >
      <Link href={`/dream-board/${boardId}`} target="_blank">
        <EyeIcon size="sm" />
        View Public Page
      </Link>
    </Button>
  </div>
</div>
```

**Specifications:**
- Variant: `outline`
- Size: `md`
- Layout: `grid grid-cols-1 md:grid-cols-3 gap-3`
- Icons + text in each button
- Mobile: Stack vertically
- Tablet+: 3 equal columns
- Icon size: `sm` (20px)

---

### 7. Payout Details Section

**Component:**
```html
<Card variant="default" padding="lg" className="mt-8">
  <h3 className="text-lg font-semibold text-text mb-4">Payout Details</h3>

  <div className="space-y-4">
    <!-- Payout Info Grid -->
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
          Payout Method
        </p>
        <p className="text-base font-semibold text-text">
          {payoutMethod}
        </p>
      </div>

      <div>
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
          Status
        </p>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${statusColor}`} />
          <p className="text-base font-semibold text-text">
            {payoutStatus}
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs text-text-muted uppercase tracking-wider mb-1">
          Card
        </p>
        <p className="text-base font-semibold text-text font-mono">
          ****{cardLast4}
        </p>
      </div>
    </div>

    <!-- Update Link -->
    <div className="pt-4 border-t border-border">
      <Button
        variant="link"
        onClick={openPayoutModal}
        className="text-primary hover:text-primary-700"
      >
        Update payout details
      </Button>
    </div>
  </div>
</Card>
```

**Payout Status Colors:**
- Ready: Green (#059669)
- Processing: Orange (#D97706)
- Complete: Green (#059669)
- Pending: Gray (#A8A29E)

---

## Component Tree

```
DashboardDetailPage (Server Component)
├── Header (Sticky)
├── Back Navigation Link
├── Main Content (max-w-6xl container)
│   ├── Dreamboard Header Card
│   │   ├── Title + Metadata
│   │   ├── Progress Bar
│   │   └── Status Badge
│   │
│   ├── Summary Stats Section
│   │   ├── Total Raised Card
│   │   ├── Contributors Card
│   │   └── Time Remaining Card
│   │   └── Fee Disclosure Text
│   │
│   ├── Contributions Section
│   │   ├── Section Title
│   │   ├── Contribution List Items
│   │   │   ├── Contributor Name
│   │   │   ├── Relative Time
│   │   │   └── Message Indicator
│   │   └── Show More/Less Toggle
│   │
│   ├── Birthday Messages Section
│   │   ├── Section Title + View All Link
│   │   ├── Message Preview Cards (2 max)
│   │   │   ├── Quote Text
│   │   │   └── Attribution
│   │   └── Download PDF Button
│   │
│   ├── Quick Actions Section
│   │   ├── Share Button
│   │   ├── Edit Button
│   │   └── View Public Button
│   │
│   └── Payout Details Card
│       ├── Payout Method
│       ├── Status (with indicator dot)
│       ├── Card Last 4
│       └── Update Link
│
├── Modals (lazy loaded)
│   ├── ShareModal (ShareDreamBoardModal)
│   ├── EditModal (EditDreamBoardModal)
│   └── PayoutModal (UpdatePayoutModal)
│
└── Footer (Optional)
```

---

## TypeScript Interfaces

### Dreamboard Detail Data

```typescript
interface DreamBoardDetail {
  id: string;
  child_name: string;
  child_photo_url: string;
  child_date_of_birth: string; // ISO 8601
  birthday_date: string; // YYYY-MM-DD
  status: 'active' | 'funded' | 'closed' | 'paid_out' | 'expired' | 'cancelled';
  end_date: string; // ISO 8601
  amount_raised_cents: number;
  contributor_count: number;
  progress_percentage: number;
  target_amount_cents?: number;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  parent_id: string;
  payout_method: 'karri_card' | 'bank_transfer';
  payout_status: 'pending' | 'ready' | 'processing' | 'complete';
  payout_card_last4?: string;
  payout_bank_account?: string;
  platform_fee_percent: number; // e.g., 2.9
}
```

### Contribution Item

```typescript
interface ContributionItem {
  id: string;
  dream_board_id: string;
  contributor_name: string | null;
  is_anonymous: boolean;
  message: string | null;
  status: 'completed' | 'pending' | 'failed';
  created_at: string; // ISO 8601
}
```

### Birthday Message

```typescript
interface BirthdayMessage {
  id: string;
  contribution_id: string;
  contributor_name: string;
  relationship_type: string; // e.g., "friend", "family", "colleague"
  message_text: string;
  created_at: string; // ISO 8601
}
```

### API Response

```typescript
interface GetDreamBoardDetailResponse {
  data: {
    board: DreamBoardDetail;
    contributions: ContributionItem[];
    messages: BirthdayMessage[];
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### Component Props

```typescript
interface DashboardDetailPageProps {
  params: Promise<{ id: string }>;
}

interface PayoutDetailsProps {
  method: string;
  status: string;
  cardLast4?: string;
  onUpdate: () => void;
}
```

---

## File Structure

```
src/
├── app/
│   ├── (host)/
│   │   └── dashboard/
│   │       ├── [id]/
│   │       │   ├── page.tsx                      # Main detail page
│   │       │   ├── _components/
│   │       │   │   ├── DreamBoardHeader.tsx      # Header card
│   │       │   │   ├── SummaryStats.tsx          # Stats cards
│   │       │   │   ├── ContributionsList.tsx     # Contributions section
│   │       │   │   ├── BirthdayMessages.tsx      # Messages section
│   │       │   │   ├── QuickActions.tsx          # Action buttons
│   │       │   │   ├── PayoutDetails.tsx         # Payout card
│   │       │   │   └── DashboardDetailSkeleton.tsx
│   │       │   └── layout.tsx
│   │       │
│   │       └── _modals/
│   │           ├── ShareDreamBoardModal.tsx
│   │           ├── EditDreamBoardModal.tsx
│   │           └── UpdatePayoutModal.tsx
│   │
├── components/
│   ├── ui/
│   │   ├── card.tsx
│   │   ├── button.tsx
│   │   ├── skeleton.tsx
│   │   └── badge.tsx
│   ├── icons/
│   │   ├── ArrowLeftIcon.tsx
│   │   ├── ShareIcon.tsx
│   │   ├── EditIcon.tsx
│   │   ├── EyeIcon.tsx
│   │   ├── DownloadIcon.tsx
│   │   └── CommentIcon.tsx
│   └── modals/
│       └── DialogOverlay.tsx
│
└── lib/
    ├── api/
    │   ├── dream-boards.ts
    │   └── contributions.ts
    └── utils/
        ├── formatting.ts
        └── calculations.ts
```

---

## Data Fetching

### Server Component

```typescript
// src/app/(host)/dashboard/[id]/page.tsx
import { getDreamBoardDetail } from '@/lib/api/dream-boards';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic';

export default async function DashboardDetailPage({
  params,
}: DashboardDetailPageProps) {
  const { userId } = await auth();
  const { id } = await params;

  if (!userId) {
    redirect(`/sign-in?redirect_url=/dashboard/${id}`);
  }

  const { data, error } = await getDreamBoardDetail(id, userId);

  if (error) {
    return <ErrorState error={error} boardId={id} />;
  }

  if (!data) {
    return notFound();
  }

  return (
    <main className="min-h-screen">
      <DreamBoardHeader board={data.board} />
      <SummaryStats board={data.board} />
      <ContributionsList contributions={data.contributions} />
      <BirthdayMessages messages={data.messages} boardId={id} />
      <QuickActions board={data.board} />
      <PayoutDetails board={data.board} />
    </main>
  );
}
```

### API Function

```typescript
export async function getDreamBoardDetail(
  boardId: string,
  parentId: string
): Promise<GetDreamBoardDetailResponse> {
  try {
    const response = await fetch(
      `${API_BASE}/dream-boards/${boardId}?parent_id=${parentId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.API_SECRET}`,
        },
        cache: 'no-store',
      }
    );

    if (response.status === 404) {
      return {
        data: null,
        error: { code: 'NOT_FOUND', message: 'Dreamboard not found' },
      };
    }

    if (response.status === 403) {
      return {
        data: null,
        error: {
          code: 'UNAUTHORIZED',
          message: 'You do not have access to this Dreamboard',
        },
      };
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const result = await response.json();
    return { data: result };
  } catch (error) {
    return {
      data: null,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to load Dreamboard details',
      },
    };
  }
}
```

---

## Responsive Behavior

### Layout Breakpoints

**Mobile (320px - 767px):**
- Single column layout
- Stats: 1 column stack
- Buttons: Full width (vertical stack)
- Contribution list: Expanded (no table)
- Messages: Card-based

**Tablet (768px - 1023px):**
- Two-column layout (content + sidebar)
- Stats: 3 columns
- Buttons: 2-3 columns
- Contribution list: Readable columns

**Desktop (1024px+):**
- Two-column layout with max-width
- Stats: 3 columns, centered
- Buttons: 3 columns, full width
- Contribution list: Full table or list

### Responsive Classes

```typescript
const responsiveClasses = {
  statsGrid: 'grid grid-cols-1 md:grid-cols-3 gap-4',
  buttonGrid: 'grid grid-cols-1 md:grid-cols-3 gap-3',
  actionGrid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
  container: 'mx-auto max-w-6xl px-6 md:px-10 lg:px-20 py-8',
};
```

---

## Animations & Interactions

### Page Entry Animation

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-page {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (prefers-reduced-motion: reduce) {
  .detail-page {
    animation: none;
  }
}
```

### Progress Bar Animation

```css
.progress-fill {
  transition: width 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Animate when value changes */
.progress-fill[data-old-value]::before {
  content: attr(data-old-value);
  animation: slideIn 300ms ease-out;
}

@keyframes slideIn {
  from {
    width: var(--old-width);
  }
  to {
    width: var(--new-width);
  }
}
```

### Button Interactions

```css
.action-button {
  transition: all 150ms ease-out;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-button:active {
  transform: scale(0.97);
}
```

### Expand/Collapse Animation

```typescript
// Show more contributions
const [isExpanded, setIsExpanded] = useState(false);

return (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: isExpanded ? 1 : 0, height: isExpanded ? 'auto' : 0 }}
    transition={{ duration: 300, ease: 'easeOut' }}
  >
    {/* Additional contributions */}
  </motion.div>
);
```

---

## Accessibility

### WCAG 2.1 AA Compliance

**Semantic HTML:**
```html
<main>
  <article>
    <header>
      <h1>Emma's Dreamboard</h1>
    </header>
    <section>
      <h2>Contributions</h2>
      <ul>
        <li><!-- contribution items --></li>
      </ul>
    </section>
  </article>
</main>
```

**Focus Management:**
- All buttons keyboard accessible
- Tab order: logical
- Focus visible: 2px teal outline
- Modal focus trap when opened

**Color Contrast:**
- Dark text on light: 7:1+ ratio
- Links: 5.5:1 ratio minimum
- Status badges: 4.5:1 ratio

**ARIA Labels:**
```html
<!-- Back button context -->
<Link aria-label="Back to all Dreamboards" href="/dashboard">
  ← Back to all Dreamboards
</Link>

<!-- Icon buttons -->
<button aria-label="Share this Dreamboard">
  <ShareIcon />
</button>

<!-- Download button -->
<button aria-label="Download Birthday Messages as PDF">
  Download Birthday Messages Book (PDF)
</button>

<!-- Live regions for updates -->
<div aria-live="polite" aria-busy={isLoading}>
  {isLoading ? 'Loading contributions...' : null}
</div>
```

**Touch Targets:**
- All buttons: minimum 44×44px
- Links: minimum 44px height

---

## State Management

### Loading States

```typescript
const [isLoading, setIsLoading] = useState(true);
const [isExpandedContributions, setIsExpandedContributions] = useState(false);
const [isExpandedMessages, setIsExpandedMessages] = useState(false);
const [activeModal, setActiveModal] = useState<'share' | 'edit' | 'payout' | null>(null);

return (
  <>
    {isLoading && <DashboardDetailSkeleton />}
    {!isLoading && (
      <>
        <DreamBoardHeader board={board} />
        <ContributionsList
          contributions={contributions}
          isExpanded={isExpandedContributions}
          onToggle={() => setIsExpandedContributions(!isExpandedContributions)}
        />
        {activeModal === 'share' && <ShareModal onClose={() => setActiveModal(null)} />}
      </>
    )}
  </>
);
```

### Modal Management

```typescript
type ModalType = 'share' | 'edit' | 'payout' | null;

const [activeModal, setActiveModal] = useState<ModalType>(null);

const modals = {
  share: <ShareDreamBoardModal boardId={id} onClose={() => setActiveModal(null)} />,
  edit: <EditDreamBoardModal board={board} onClose={() => setActiveModal(null)} />,
  payout: <UpdatePayoutModal board={board} onClose={() => setActiveModal(null)} />,
};

return <>{modals[activeModal]}</>;
```

---

## Edge Cases

### 1. Board Just Completed
**Display:** Status changed from "Active" to "Complete"
**Copy:** "Ended just now" or "Ended today"
**Show:** Payout status moves to "Ready" or "Processing"

### 2. No Messages Yet
**Section title:** "Birthday Messages (0)"
**Display:** Empty state message: "No messages yet. Contributors can add messages when they contribute."

### 3. Very Long Contributor Names
**Handling:** Truncate after 20 characters with ellipsis
```css
.contributor-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 4. Many Contributions (100+)
**Show:** First 5, then "Show all (95 more)"
**Performance:** Implement pagination or virtual scrolling for large lists

### 5. Mobile: Viewing Long Message
**Handling:** Modal/dialog overlay with full message text
**Copy:** "View full message" link

### 6. Payout Not Yet Set
**Display:** "Payout Method: Not set"
**Color:** Orange warning badge
**Action:** Prominent "Set payout method" button

### 7. Network Failure on Load
**Error State:**
```html
<div class="bg-red-50 border border-error rounded-xl p-6">
  <h2>Unable to load Dreamboard</h2>
  <p>Check your connection and try again</p>
  <Button onClick={reload}>Try again</Button>
</div>
```

---

## Performance Optimizations

### Image Optimization

```typescript
<Image
  src={childPhotoUrl}
  alt={childName}
  width={100}
  height={100}
  priority={true} // Load above the fold
  className="rounded-full"
/>
```

### Lazy Load Modals

```typescript
const ShareModal = dynamic(() => import('./modals/ShareModal'), {
  loading: () => <div>Loading...</div>,
});
```

### Pagination for Contributions

```typescript
const [page, setPage] = useState(1);
const itemsPerPage = 10;

const displayedContributions = contributions.slice(0, page * itemsPerPage);
```

---

## Testing Considerations

### Unit Tests
- Data calculations (fees, net amount)
- Date formatting
- Contribution grouping

### Integration Tests
- Fetch and display detail page
- Modal opening/closing
- Share/edit/payout action triggers

### E2E Tests
- Navigate to detail page from list
- View contributions
- Download birthday messages
- Share Dreamboard
- Update payout details

---

## Implementation Checklist

- [ ] Create `/dashboard/[id]` page component
- [ ] Create DreamBoardHeader component
- [ ] Create SummaryStats component
- [ ] Create ContributionsList component
- [ ] Create BirthdayMessages component
- [ ] Create QuickActions component
- [ ] Create PayoutDetails component
- [ ] Implement modals (Share, Edit, Payout)
- [ ] Add API function for detail fetching
- [ ] Test responsive layouts
- [ ] Verify WCAG AA compliance
- [ ] Test keyboard navigation
- [ ] Implement error boundaries
- [ ] Test with slow network
- [ ] Add analytics tracking

---

**Document Version:** 1.1
**Status:** Runtime-aligned with noted action-surface differences
**Last Updated:** February 11, 2026
