# Gifta UX v2: Host Dashboard - Post-Campaign (Completed Board)
## Comprehensive UI Specification

**Document Version:** 1.0
**Status:** Implementation-Ready
**Route:** `/dashboard/[id]` (state-dependent rendering)
**Last Updated:** February 20, 2026
**Target Audience:** AI coding agents, UI developers

---

## Runtime Alignment (2026-02-20)

- Runtime source: `src/app/(host)/dashboard/[id]/page.tsx`, `src/app/(host)/dashboard/[id]/DashboardPostCampaignClient.tsx`, `src/app/api/internal/downloads/contributor-list/route.ts`.
- Post-campaign contributions list intentionally excludes per-contributor contribution amounts.
- Contributor CSV export intentionally excludes per-contributor financial columns and currently exports: `Name, Date, Message, Anonymous`.

---

## Table of Contents

1. [Screen Overview](#screen-overview)
2. [Visual Layout](#visual-layout)
3. [Section-by-Section Specifications](#section-by-section-specifications)
4. [Component Tree](#component-tree)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [File Structure](#file-structure)
7. [Data Fetching](#data-fetching)
8. [State Management](#state-management)
9. [Responsive Behavior](#responsive-behavior)
10. [Animations](#animations)
11. [Accessibility](#accessibility)
12. [Download Functionality](#download-functionality)
13. [Edge Cases](#edge-cases)

---

## Screen Overview

### Purpose
The Post-Campaign View displays the completed Dreamboard with a celebration tone, financial breakdown, payout details, and downloadable files (birthday messages PDF, thank you card list CSV).

### Trigger Conditions
- Dreamboard status: `closed` or `paid_out`
- Rendered on the same `/dashboard/[id]` route as active boards
- Conditional rendering based on `board.status === 'closed' || board.status === 'paid_out'`

### Key Differences from Active View
- ✅ Celebration heading instead of progress tracking
- ✅ Financial breakdown card shows all fees and net payout
- ✅ Payout status shows completion state
- ✅ No edit/extend buttons (board is closed)
- ✅ Download buttons for messages and thank you cards
- ✅ Full contribution history preserved
- ✅ Birthday messages section still visible

---

## Visual Layout

### Mobile Layout (320px - 767px)

```
┌─────────────────────────────────────┐
│  GIFTA              [≡ menu]        │
├─────────────────────────────────────┤
│                                     │
│  ← Back to all Dreamboards         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  🎉 Emma's Dreamboard              │
│  is complete!                       │ ← Celebration heading
│                                     │
│  Age 7 • Birthday Jan 15            │
│  ✓ COMPLETE • Ended 2 days ago      │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  FINANCIAL BREAKDOWN                │
│  ┌─────────────────────────────────┐│
│  │                                 ││
│  │ Total Raised         R2,450     ││
│  │ ─────────────────────────────── ││
│  │ Card Processing Fee (2.9%) -R71 ││
│  │ Charity Donation (5%)    -R122  ││
│  │ ─────────────────────────────── ││
│  │ Your Payout              R2,257 ││
│  │                                 ││
│  └─────────────────────────────────┘│
│                                     │
│  ✅ Sent to Karri Card ••••5678     │
│  Reference: GIF-2025-001234         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [📥 Download Birthday Messages    │
│   Book (PDF)]                       │
│                                     │
│  [📤 Download Thank You Card List   │
│   (CSV)]                            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  CONTRIBUTION HISTORY               │
│  (12 total)                         │
│                                     │
│  [Full list of contributions...]    │
│                                     │
│  [View all contributions]           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  BIRTHDAY MESSAGES                  │
│  (4 messages)                       │
│                                     │
│  [Messages preview...]              │
│                                     │
└─────────────────────────────────────┘
```

### Desktop Layout (1024px+)

```
┌────────────────────────────────────────────────────────────────┐
│ GIFTA     [Nav]                                   [Profile]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ← Back to all Dreamboards                                   │
│                                                                │
├──────────────────────────────────────────────────────────────┐│
│  🎉 Emma's Dreamboard is complete!                          ││
│  Age 7 • Birthday Jan 15 • ✓ COMPLETE • Ended 2 days ago   ││
└──────────────────────────────────────────────────────────────┘│
│                                                                │
│  ┌───────────────────────────────┐  ┌──────────────────────┐ │
│  │  FINANCIAL BREAKDOWN          │  │ PAYOUT STATUS        │ │
│  │                               │  │                      │ │
│  │ Total Raised:                 │  │ ✅ Sent              │ │
│  │ R2,450                        │  │                      │ │
│  │                               │  │ Karri Card           │ │
│  │ ─────────────────────────────│  │ ****5678             │ │
│  │                               │  │                      │ │
│  │ Card Fee (2.9%)    -R71      │  │ Reference:           │ │
│  │ Charity (5%)      -R122      │  │ GIF-2025-001234      │ │
│  │                               │  │                      │ │
│  │ ─────────────────────────────│  │                      │ │
│  │ Your Payout      R2,257      │  │                      │ │
│  │                               │  │                      │ │
│  └───────────────────────────────┘  └──────────────────────┘ │
│                                                                │
│  [📥 Download Messages PDF] [📤 Download Thank You CSV]      │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────┐  ┌────────────────────────────────┤
│  │ CONTRIBUTION HISTORY   │  │ BIRTHDAY MESSAGES (4)          │
│  │ (12 total)             │  │                                │
│  │                        │  │ "Can't wait for the party!"   │
│  │ Karri Okeefe · R500    │  │ - Sarah Jones, contributed    │
│  │ John Smith · R250      │  │                                │
│  │ Sarah Jones · R1,700   │  │ "So excited for Emma!"        │
│  │                        │  │ - John Smith, contributed     │
│  │ [+ Show all (9 more)]  │  │                                │
│  │                        │  │ [View all messages →]         │
│  └────────────────────────┘  └────────────────────────────────┤
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## Section-by-Section Specifications

### 1. Celebration Header Section

**Component:**
```html
<Card variant="elevated" padding="lg" className="mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
  <div className="text-center md:text-left space-y-4">
    <!-- Celebration Emoji & Heading -->
    <div>
      <h1 className="text-4xl md:text-5xl font-display font-bold text-text flex items-center justify-center md:justify-start gap-2">
        <span>🎉</span>
        <span>{childName}'s Dreamboard is complete!</span>
      </h1>
    </div>

    <!-- Metadata -->
    <p className="text-text-secondary text-lg">
      Age {age} • Birthday {birthdayFormatted} •{' '}
      <span className="inline-flex items-center gap-1">
        <CheckIcon className="w-5 h-5 text-success" />
        COMPLETE
      </span>
      • Ended {endedDaysAgo}
    </p>
  </div>
</Card>
```

**Specifications:**
- Variant: `elevated` (white background, lifted shadow)
- Background gradient: `from-primary/5 to-accent/5` (subtle teal-to-orange)
- Border: `border-primary/20` (light teal)
- Padding: `lg` (2rem)
- Title: `text-4xl md:text-5xl font-display font-bold`
- Emoji: 🎉 (celebratory)
- Icon: ✓ (check mark, success color)
- Text alignment: Center on mobile, left on desktop

---

### 2. Financial Breakdown Card

**Component:**
```html
<Card variant="default" padding="lg" className="mb-6">
  <h2 className="text-2xl font-display font-bold text-text mb-6">
    Financial Breakdown
  </h2>

  <div className="space-y-4">
    <!-- Total Raised -->
    <div className="flex items-baseline justify-between">
      <span className="text-base text-text-secondary">Total Raised</span>
      <span className="text-3xl md:text-4xl font-bold text-text">
        R{amountRaised}
      </span>
    </div>

    <!-- Divider -->
    <hr className="border-border" />

    <!-- Fee Items -->
    <div className="space-y-3">
      <!-- Card Processing Fee -->
      <div className="flex items-center justify-between">
        <div>
          <span className="text-text">Card Processing Fee</span>
          <span className="text-xs text-text-muted ml-2">
            ({platformFeePercent}%)
          </span>
        </div>
        <span className="text-text-secondary font-semibold">
          -R{cardFeeAmount}
        </span>
      </div>

      <!-- Charity Donation (if applicable) -->
      {charityDonation > 0 && (
        <div className="flex items-center justify-between">
          <div>
            <span className="text-text">Charity Donation</span>
            <span className="text-xs text-text-muted ml-2">
              ({charityPercent}% to {charityName})
            </span>
          </div>
          <span className="text-text-secondary font-semibold">
            -R{charityDonation}
          </span>
        </div>
      )}
    </div>

    <!-- Divider -->
    <hr className="border-border" />

    <!-- Net Payout (Highlighted) -->
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-baseline justify-between">
      <span className="text-lg font-semibold text-text">Your Payout</span>
      <span className="text-3xl md:text-4xl font-bold text-primary">
        R{netPayout}
      </span>
    </div>
  </div>
</Card>
```

**Specifications:**
- Title: `text-2xl font-display font-bold text-text`
- Layout: Vertical stack with clear hierarchy
- Amount colors:
  - Total Raised: `text-text` (dark, prominent)
  - Fees: `text-text-secondary` (slightly grayed)
  - Net Payout: `text-primary` (teal, prominent)
- Net Payout highlight: `bg-primary/5 border border-primary/20`
- Fee breakdown: Show percentage in parentheses
- Dividers: `border-border` horizontal lines

---

### 3. Payout Status Card

**Component:**
```html
<Card variant="default" padding="lg" className="mb-6">
  <h3 className="text-lg font-semibold text-text mb-4">Payout Status</h3>

  <div className="space-y-4">
    <!-- Status Badge -->
    <div className="flex items-center gap-3">
      <div className="w-3 h-3 rounded-full bg-success" />
      <span className="text-lg font-semibold text-text">Sent</span>
    </div>

    <!-- Payout Details -->
    <div className="bg-surface-elevated rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-sm text-text-muted">Payout Method</span>
        <span className="text-base font-semibold text-text">
          {payoutMethod}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-text-muted">Card</span>
        <span className="text-base font-semibold font-mono text-text">
          ****{cardLast4}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-text-muted">Reference</span>
        <span className="text-base font-semibold font-mono text-text">
          {payoutReference}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-text-muted">Sent On</span>
        <span className="text-base font-semibold text-text">
          {payoutDateFormatted}
        </span>
      </div>
    </div>

    <!-- Info Text -->
    <p className="text-xs text-text-muted">
      The payout has been sent to your registered payout method.
      Please allow 1-2 business days for the funds to appear in your account.
    </p>
  </div>
</Card>
```

**Specifications:**
- Status indicator: Green dot + "Sent" text
- Status color: `bg-success` (#059669)
- Details layout: Key-value pairs
- Container: `bg-surface-elevated` with padding
- Font for references: `font-mono` (monospace)
- Info text: Small, secondary color
- Reference format: "GIF-2025-001234" (8+ characters)

---

### 4. Download Buttons Section

**Component:**
```html
<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
  <!-- Download Birthday Messages PDF -->
  <Button
    variant="secondary"
    size="lg"
    onClick={downloadBirthdayMessages}
    loading={isDownloadingMessages}
    className="flex items-center justify-center gap-2"
  >
    <DownloadIcon size="md" />
    <span>
      Download Birthday Messages Book (PDF)
    </span>
  </Button>

  <!-- Download Thank You Card List CSV -->
  <Button
    variant="secondary"
    size="lg"
    onClick={downloadThankYouList}
    loading={isDownloadingCSV}
    className="flex items-center justify-center gap-2"
  >
    <DownloadIcon size="md" />
    <span>
      Download Thank You Card List (CSV)
    </span>
  </Button>
</div>
```

**Specifications:**
- Variant: `secondary` (orange gradient)
- Size: `lg` (large, prominent)
- Layout: `grid grid-cols-1 md:grid-cols-2 gap-4`
- Mobile: Stack vertically (1 column)
- Desktop: Side-by-side (2 columns)
- Icon: Download icon (↓), 24px
- Text: Full button label
- Loading: Show spinner during download
- Action: Trigger download when clicked

**Download Implementation:**
```typescript
const downloadBirthdayMessages = async () => {
  setIsDownloadingMessages(true);
  try {
    const response = await fetch(`/api/dream-boards/${boardId}/messages/pdf`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${childName}-birthday-messages.pdf`;
    link.click();
    window.URL.revokeObjectURL(url);

    showSuccessToast('Birthday Messages downloaded');
  } catch (error) {
    showErrorToast('Failed to download messages');
  } finally {
    setIsDownloadingMessages(false);
  }
};

const downloadThankYouList = async () => {
  setIsDownloadingCSV(true);
  try {
    const response = await fetch(`/api/dream-boards/${boardId}/contributors/csv`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error('Download failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${childName}-thank-you-list.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    showSuccessToast('Thank You List downloaded');
  } catch (error) {
    showErrorToast('Failed to download list');
  } finally {
    setIsDownloadingCSV(false);
  }
};
```

---

### 5. Contributions History Section

**Same as active board**, but without expandable feature:

```html
<Card variant="default" padding="lg" className="mb-8">
  <h2 className="text-2xl font-display font-bold text-text mb-4">
    Contribution History ({contributionCount} total)
  </h2>

  <div className="space-y-1">
    {contributions.map((contrib) => (
      <div key={contrib.id} className="py-4 border-b border-border last:border-b-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-semibold text-text">{contrib.name}</p>
            <p className="text-sm text-text-muted">{contrib.relativeTime} ago</p>
            {contrib.hasMessage && (
              <p className="text-sm text-primary mt-1 flex items-center gap-1">
                <CommentIcon size="sm" />
                Has message
              </p>
            )}
          </div>
        </div>
      </div>
    ))}
  </div>

  {contributionCount > 10 && (
    <Button
      variant="link"
      className="mt-4"
      onClick={toggleShowMore}
    >
      {isExpanded ? '- Show less' : `+ Show all (${remaining} more)`}
    </Button>
  )}
</Card>
```

---

### 6. Birthday Messages Section

**Same as active board:**
```html
<Card variant="default" padding="lg">
  <h2 className="text-2xl font-display font-bold text-text mb-4">
    Birthday Messages ({messageCount})
  </h2>

  <div className="space-y-4 mb-4">
    {messages.slice(0, 2).map((msg) => (
      <Card key={msg.id} variant="minimal" padding="md">
        <blockquote className="text-text-secondary italic mb-2">
          "{msg.text}"
        </blockquote>
        <footer className="text-sm text-text-muted">
          - {msg.contributorName}, {msg.relationshipType}
        </footer>
      </Card>
    ))}
  </div>

  {messageCount > 2 && (
    <Link href="#" className="text-primary font-semibold">
      View all messages →
    </Link>
  )}
</Card>
```

---

## Component Tree

```
PostCampaignDashboardPage (Server Component)
├── Header (Sticky)
├── Back Navigation Link
├── Main Content (max-w-6xl container)
│   ├── Celebration Header Card
│   │   ├── Emoji (🎉)
│   │   ├── Title
│   │   └── Metadata
│   │
│   ├── Financial Breakdown Card
│   │   ├── Total Raised (large number)
│   │   ├── Card Fee Item
│   │   ├── Charity Donation Item (conditional)
│   │   └── Net Payout (highlighted)
│   │
│   ├── Payout Status Card
│   │   ├── Status Badge (green dot + "Sent")
│   │   ├── Payout Details Grid
│   │   │   ├── Payout Method
│   │   │   ├── Card Last 4
│   │   │   ├── Reference
│   │   │   └── Sent Date
│   │   └── Info Text
│   │
│   ├── Download Buttons Section
│   │   ├── Download Birthday Messages Button
│   │   └── Download Thank You List Button
│   │
│   ├── Contribution History Card
│   │   ├── Section Title
│   │   ├── Contribution List Items
│   │   └── Show More/Less Toggle
│   │
│   └── Birthday Messages Card
│       ├── Section Title
│       ├── Message Preview Cards
│       └── View All Link
│
└── Footer (Optional)
```

---

## TypeScript Interfaces

### Completed Board Data

```typescript
interface CompletedDreamBoardDetail {
  id: string;
  child_name: string;
  child_photo_url: string;
  child_date_of_birth: string; // ISO 8601
  birthday_date: string; // YYYY-MM-DD
  status: 'closed' | 'paid_out'; // Closed and paid-out statuses render this view
  end_date: string; // ISO 8601 (when board closed)
  amount_raised_cents: number;
  contributor_count: number;
  progress_percentage: number; // Will be 100%
  platform_fee_percent: number; // e.g., 2.9
  card_fee_cents: number; // Calculated
  charity_donation_cents: number; // 0 if no charity
  charity_name?: string;
  charity_percent?: number;
  net_payout_cents: number; // amount_raised - fees - charity
  payout_method: 'karri_card' | 'bank_transfer';
  payout_status: 'complete' | 'sent';
  payout_card_last4?: string;
  payout_reference: string; // e.g., "GIF-2025-001234"
  payout_date: string; // ISO 8601
  created_at: string;
  updated_at: string;
}

interface CompletedBoardResponse {
  data: {
    board: CompletedDreamBoardDetail;
    contributions: ContributionItem[];
    messages: BirthdayMessage[];
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### Download Response Types

```typescript
interface DownloadBirthdayMessagesResponse {
  success: boolean;
  file_url?: string;
  file_size?: number;
  content_type?: 'application/pdf';
  error?: {
    code: string;
    message: string;
  };
}

interface DownloadThankYouListResponse {
  success: boolean;
  file_url?: string;
  file_size?: number;
  content_type?: 'text/csv';
  error?: {
    code: string;
    message: string;
  };
}

interface ContributorCSVRow {
  name: string;
  email: string;
  amount: number;
  date: string;
  message: boolean;
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
│   │       │   ├── page.tsx                      # Routes to correct view based on status
│   │       │   ├── _views/
│   │       │   │   ├── ActiveBoardView.tsx       # For active boards
│   │       │   │   ├── CompletedBoardView.tsx    # For completed boards
│   │       │   │   └── index.ts
│   │       │   └── _components/
│   │       │       ├── CelebrationHeader.tsx
│   │       │       ├── FinancialBreakdown.tsx
│   │       │       ├── PayoutStatus.tsx
│   │       │       ├── DownloadButtons.tsx
│   │       │       └── ContributionHistory.tsx
│
├── lib/
│   ├── api/
│   │   ├── dream-boards.ts
│   │   ├── downloads.ts                         # PDF/CSV generation
│   │   └── payments.ts
│   └── utils/
│       ├── formatting.ts
│       └── currency.ts
│
└── components/
    └── ui/
        ├── card.tsx
        ├── button.tsx
        └── skeleton.tsx
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

  // Render correct view based on status
  return data.board.status === 'closed' || data.board.status === 'paid_out' ? (
    <CompletedBoardView board={data.board} contributions={data.contributions} messages={data.messages} />
  ) : (
    <ActiveBoardView board={data.board} contributions={data.contributions} messages={data.messages} />
  );
}
```

### Download API Functions

```typescript
export async function downloadBirthdayMessagessPDF(
  boardId: string
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/dream-boards/${boardId}/messages/pdf`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to download messages PDF');
  }

  return await response.blob();
}

export async function downloadThankYouListCSV(
  boardId: string
): Promise<Blob> {
  const response = await fetch(
    `${API_BASE}/dream-boards/${boardId}/contributors/csv`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.API_SECRET}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to download thank you list');
  }

  return await response.blob();
}
```

---

## State Management

### Component State

```typescript
const [isDownloadingMessages, setIsDownloadingMessages] = useState(false);
const [isDownloadingCSV, setIsDownloadingCSV] = useState(false);
const [isExpandedContributions, setIsExpandedContributions] = useState(false);
const [isExpandedMessages, setIsExpandedMessages] = useState(false);
const [downloadError, setDownloadError] = useState<string | null>(null);

const handleDownloadMessages = async () => {
  setIsDownloadingMessages(true);
  try {
    const blob = await downloadBirthdayMessagessPDF(boardId);
    triggerDownload(blob, `${childName}-birthday-messages.pdf`);
    showSuccessToast('Birthday Messages downloaded');
  } catch (error) {
    setDownloadError('Failed to download messages');
    showErrorToast('Failed to download messages');
  } finally {
    setIsDownloadingMessages(false);
  }
};
```

---

## Responsive Behavior

### Mobile vs Desktop

**Mobile (320px - 767px):**
- Single column layout
- Download buttons: Stack vertically
- Financial items: Full width
- Payout details: Single column

**Desktop (1024px+):**
- Two-column layout (optional)
- Download buttons: Side-by-side
- Financial breakdown: Centered, max-width
- Payout details: Horizontal layout

### Download Button Responsiveness

```css
/* Mobile: Full width */
@media (max-width: 768px) {
  .download-buttons {
    grid-template-columns: 1fr;
  }
}

/* Desktop: Side-by-side */
@media (min-width: 769px) {
  .download-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## Animations

### Celebration Entry

```css
@keyframes celebrationFadeUp {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.celebration-header {
  animation: celebrationFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Confetti Animation (Optional)

```typescript
useEffect(() => {
  // Trigger confetti on page load for celebration
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.3 },
  });
}, []);
```

### Download Button Loading State

```css
.download-button[aria-busy="true"] {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}
```

---

## Accessibility

### WCAG 2.1 AA Compliance

**Celebration Heading:**
```html
<h1 className="text-5xl font-display font-bold">
  <span aria-hidden="true">🎉</span>
  <span>Emma's Dreamboard is complete!</span>
</h1>
```

**Download Buttons:**
```html
<button
  onClick={downloadMessages}
  aria-busy={isDownloading}
  aria-label="Download Emma's birthday messages as PDF"
>
  <DownloadIcon aria-hidden="true" />
  Download Birthday Messages Book (PDF)
</button>
```

**Status Indicator:**
```html
<div className="flex items-center gap-3" role="status" aria-live="polite">
  <div className="w-3 h-3 rounded-full bg-success" aria-label="Payout sent" />
  <span>Sent</span>
</div>
```

**Color Contrast:**
- Text on white: 7:1+ ratio
- Green status dot: Paired with text label
- Orange buttons: 5.5:1 on gradient background

---

## Download Functionality

### PDF Generation (Backend)

```typescript
// Backend endpoint for generating PDF
export async function generateBirthdayMessagesPDF(
  boardId: string
): Promise<Buffer> {
  const messages = await getBirthdayMessages(boardId);

  const doc = new PDFDocument();

  // Add title
  doc.fontSize(24).font('Helvetica-Bold').text('Birthday Messages', {
    align: 'center',
  });

  doc.moveDown();
  doc.fontSize(12).text(`For [Child Name]'s Birthday`, {
    align: 'center',
  });

  doc.moveDown(2);

  // Add messages
  messages.forEach((message) => {
    doc.fontSize(11).text(`"${message.text}"`, {
      width: 500,
      align: 'left',
    });

    doc.fontSize(9).text(`— ${message.contributorName}`, {
      align: 'left',
    });

    doc.moveDown();
  });

  return doc.end();
}
```

### CSV Generation (Backend)

```typescript
export async function generateThankYouListCSV(
  boardId: string
): Promise<string> {
  const contributions = await getContributions(boardId);

  const csv = [
    ['Name', 'Date', 'Message', 'Anonymous'],
    ...contributions.map((c) => [
      c.contributor_name,
      new Date(c.created_at).toISOString().split('T')[0],
      c.message ?? '',
      c.is_anonymous ? 'Yes' : 'No',
    ]),
  ]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  return csv;
}
```

### Browser Download Trigger

```typescript
function triggerDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
```

---

## Edge Cases

### 1. No Birthday Messages Yet

**Display:** "Birthday Messages (0)"
**Copy:** "No birthday messages were added by contributors. Celebrate anyway!"
**Show:** Don't show section or show empty state

### 2. Large Payout Amount (R100,000+)

**Display:** R123,450 (standard formatting with commas)
**Formatting:** Use currency formatter with 2 decimal places

### 3. Charity Donation Zero

**Display:** Don't show charity donation line
**Condition:** `if (charityDonationCents > 0) { ... }`

### 4. Many Contributions (500+)

**Display:** Initially show 10, "Show all (490 more)"
**Performance:** Consider pagination or lazy loading

### 5. Download Fails

**Error State:**
```typescript
{downloadError && (
  <div className="bg-red-50 border border-error rounded-lg p-4 mb-4">
    <p className="text-error font-semibold">{downloadError}</p>
    <Button
      variant="outline"
      size="sm"
      onClick={retryDownload}
      className="mt-2"
    >
      Retry
    </Button>
  </div>
)}
```

### 6. Payout Not Yet Sent

**Status:** Show "Processing" instead of "Sent"
**Color:** Orange warning color instead of green
**Message:** "Payout is being processed. Expected arrival in 1-2 business days."

### 7. Network Error on Page Load

**Error State:** Full page error with retry button
**Fallback:** Cached data if available

---

## Testing Considerations

### Unit Tests
- Financial calculation accuracy
- Currency formatting
- Date formatting
- CSV generation
- PDF generation

### Integration Tests
- Download PDF functionality
- Download CSV functionality
- File naming conventions
- Error handling on download fail

### E2E Tests
- Navigate to completed board
- See celebration heading
- View financial breakdown
- Download birthday messages PDF
- Download thank you list CSV
- View full contribution history

---

## Implementation Checklist

- [ ] Create CompletedBoardView component
- [ ] Create CelebrationHeader component
- [ ] Create FinancialBreakdown component
- [ ] Create PayoutStatus component
- [ ] Create DownloadButtons component
- [ ] Implement PDF generation (backend)
- [ ] Implement CSV generation (backend)
- [ ] Add download API endpoints
- [ ] Test downloads on all browsers
- [ ] Test responsive layouts
- [ ] Test error handling
- [ ] Verify WCAG AA compliance
- [ ] Test with slow network
- [ ] Add analytics tracking for downloads

---

**Document Version:** 1.0
**Status:** Implementation-Ready
**Last Updated:** February 2025
