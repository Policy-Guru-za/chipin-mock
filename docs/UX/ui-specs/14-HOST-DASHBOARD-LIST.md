> **Document Status:** Reference only. Reviewed March 12, 2026.
> Useful context only. Do not use this file as the source of truth for current runtime behavior or agent policy.
> Canonical replacement: `docs/Platform-Spec-Docs/UX.md`.
# Gifta UX v2: Host Dashboard - Dreamboard List View
## Comprehensive UI Specification

**Document Version:** 1.0
**Status:** Runtime-aligned with inventory/model notes
**Route:** `/dashboard`
**Last Updated:** February 11, 2026
**Target Audience:** AI coding agents, UI developers

---

## Runtime Alignment (2026-02-11)

- Runtime source: `src/app/(host)/dashboard/page.tsx`, `src/lib/host/queries.ts`, `src/lib/host/dashboard-view-model.ts`.
- Dashboard list cards are generated from live host query totals (`raisedCents`, contribution count, status labels/variants).
- Legacy file-path references in this doc to shared `Header.tsx` are historical; runtime uses route layouts and in-page header sections.
- Goal values can be zero in runtime (`goal_cents` default 0), and list cards prioritize raised totals/status over goal progression.

## Table of Contents

1. [Screen Overview](#screen-overview)
2. [Visual Layout](#visual-layout)
3. [Section-by-Section Specifications](#section-by-section-specifications)
4. [Component Tree](#component-tree)
5. [TypeScript Interfaces](#typescript-interfaces)
6. [File Structure](#file-structure)
7. [Data Fetching](#data-fetching)
8. [Responsive Behavior](#responsive-behavior)
9. [Animations](#animations)
10. [Accessibility](#accessibility)
11. [State Management](#state-management)
12. [Edge Cases](#edge-cases)

---

## Screen Overview

### Purpose
The Host Dashboard List View displays all Dreamboards created by the authenticated parent/host. It serves as the primary management hub where parents can view the status, progress, and contributors for each Dreamboard at a glance.

### Route & Authentication
- **Route:** `/dashboard`
- **Auth Required:** Yes (Must be signed in parent)
- **Role:** `parent` / `host`
- **Redirect on Unauth:** `/sign-in?redirect_url=/dashboard`

### Key Features
- Visual overview of all active and completed Dreamboards
- Quick action to create new Dreamboards
  - Runtime behavior: create CTAs navigate to `/create` (fresh-start entry) and clear any existing host draft before landing on `/create/child`
- Status indicators (Active, Complete)
- Progress metrics (contributions, money raised, time remaining)
- Empty state with call-to-action
- Navigation to detail views

---

## Visual Layout

### Mobile Layout (320px - 767px)

```
┌─────────────────────────────────────┐
│  GIFTA              [≡ menu]        │  ← Header (sticky)
├─────────────────────────────────────┤
│                                     │
│  My Dreamboards                    │
│  Manage your child's wishes         │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────────────────────────┐   │
│  │ [●●●●●●●●●●] (80%)         │   │ ← Dreamboard Card #1
│  │                              │   │
│  │ Emma's Dreamboard           │   │
│  │ Age 7 • Birthday Jan 15      │   │
│  │ ● ACTIVE                      │   │
│  │                              │   │
│  │ 23 days left                 │   │
│  │ R2,450 from 12 contributors  │   │
│  │                              │   │
│  │           [View →]           │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │ [●●●●●●●●●●] (100%)        │   │ ← Dreamboard Card #2 (Complete)
│  │                              │   │
│  │ Sophie's Dreamboard         │   │
│  │ Age 5 • Birthday Dec 20      │   │
│  │ ✓ COMPLETE                    │   │
│  │                              │   │
│  │ Ended 2 days ago             │   │
│  │ R1,890 from 8 contributors   │   │
│  │                              │   │
│  │           [View →]           │   │
│  └──────────────────────────────┘   │
│                                     │
│  ┌──────────────────────────────┐   │
│  │         + Create another      │   │ ← Add New Card
│  │         Dreamboard           │   │
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

### Tablet Layout (768px - 1023px)

```
┌──────────────────────────────────────────────────────┐
│ GIFTA                    [Home] [How it works] [≡]   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  My Dreamboards                                    │
│  Manage your child's wishes                         │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ [●●●●●●●●●●]      │  │ [●●●●●●●●●●]      │    │
│  │ (80%)              │  │ (100%)             │    │
│  │                    │  │                    │    │
│  │ Emma's Dreamboard │  │ Sophie's Dream...  │    │
│  │ Age 7 • Jan 15     │  │ Age 5 • Dec 20     │    │
│  │ ● ACTIVE           │  │ ✓ COMPLETE         │    │
│  │                    │  │                    │    │
│  │ R2,450 / 12 donors │  │ R1,890 / 8 donors  │    │
│  │ 23 days left       │  │ Ended 2 days ago   │    │
│  │ [View →]           │  │ [View →]           │    │
│  └────────────────────┘  └────────────────────┘    │
│                                                      │
│  ┌────────────────────┐  ┌────────────────────┐    │
│  │ + Create another   │  │   [empty slot]     │    │
│  │   Dreamboard      │  │                    │    │
│  └────────────────────┘  └────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Desktop Layout (1024px+)

```
┌──────────────────────────────────────────────────────────────────────┐
│ GIFTA     [Home] [How it works] [Trust & Safety] [Create Dreamboard] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  My Dreamboards                                                     │
│  Manage your child's wishes                                          │
│                                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌──────────────┐ │
│  │ [●●●●●●●●●●] (80%) │  │ [●●●●●●●●●●](100%) │  │ + Create     │ │
│  │                     │  │                     │  │   another    │ │
│  │ Emma's Dreamboard  │  │ Sophie's Dream...   │  │   Dream      │ │
│  │ Age 7 • Jan 15      │  │ Age 5 • Dec 20      │  │   Board      │ │
│  │ ● ACTIVE            │  │ ✓ COMPLETE          │  │              │ │
│  │                     │  │                     │  │              │ │
│  │ R2,450 / 12 donors  │  │ R1,890 / 8 donors   │  │              │ │
│  │ 23 days left        │  │ Ended 2 days ago    │  │              │ │
│  │ [View →]            │  │ [View →]            │  │              │ │
│  └─────────────────────┘  └─────────────────────┘  └──────────────┘ │
│                                                                       │
│  ┌─────────────────────┐  ┌─────────────────────┐                  │
│  │ [●●●●●●●●●●](95%)  │  │ [●●●●●●●●●●](50%)  │                  │
│  │                     │  │                     │                  │
│  │ Liam's Dreamboard  │  │ Noah's Dreamboard  │                  │
│  │ Age 9 • Mar 5       │  │ Age 6 • Feb 1       │                  │
│  │ ● ACTIVE            │  │ ● ACTIVE            │                  │
│  │                     │  │                     │                  │
│  │ R8,920 / 24 donors  │  │ R3,120 / 15 donors  │                  │
│  │ 45 days left        │  │ 38 days left        │                  │
│  │ [View →]            │  │ [View →]            │                  │
│  └─────────────────────┘  └─────────────────────┘                  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Section-by-Section Specifications

### 1. Header Section

**Component:** Sticky Header (reference 00-DESIGN-SYSTEM.md Header specs)

**Styling:**
- `sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur`
- Height: 64px (4rem)
- Max-width: 1152px (max-w-6xl)

**Content:**
- Logo: "Gifta" (Nunito font, 20px/1.25rem, bold)
- Navigation (desktop only): Home, How it works, Trust & Safety
- Primary CTA: "Create Dreamboard" button (primary variant)
- Mobile: Menu hamburger icon

**Accessibility:**
- Landmark: `<header>` element
- Logo is also homepage link with `href="/"`
- ARIA labels on hamburger: `aria-label="Open navigation menu"` + `aria-expanded`

---

### 2. Page Title Section

**Layout:**
```html
<section class="mx-auto max-w-6xl px-6 py-8 md:py-12">
  <h1 class="text-3xl md:text-4xl font-display font-bold text-text mb-2">
    My Dreamboards
  </h1>
  <p class="text-text-secondary text-base md:text-lg">
    Manage your child's wishes
  </p>
</section>
```

**Specifications:**
- Heading: `text-3xl md:text-4xl font-display font-bold`
- Color: `text-text` (#1C1917)
- Subtitle: `text-base md:text-lg text-text-secondary`
- Spacing: `mb-2` between title and subtitle
- Container: Full width with max-width container, px-6 padding

---

### 3. Grid Container

**Mobile (320px - 767px):**
- `grid grid-cols-1 gap-4 px-5`
- Cards stack in single column
- Full width cards

**Tablet (768px - 1023px):**
- `grid grid-cols-2 gap-6 px-10`
- Two columns side-by-side
- Cards equal width

**Desktop (1024px+):**
- `grid grid-cols-3 gap-6 max-w-6xl mx-auto px-20`
- Three columns side-by-side
- Cards equal width with max-width container

**Spacing:**
- Mobile gap: `gap-4` (1rem)
- Tablet/Desktop gap: `gap-6` (1.5rem)

---

### 4. Dreamboard Card

#### Card Layout Structure

```html
<Card
  variant="default"
  padding="md"
  className="flex flex-col"
  interactive={true}
>
  <!-- Progress Bar Section -->
  <div class="mb-4">
    <ProgressIndicator value={progressPercentage} size="md" />
  </div>

  <!-- Card Header -->
  <CardHeader class="flex-1">
    <div class="flex gap-3 items-start mb-3">
      <!-- Child Avatar -->
      <img
        src={childPhotoUrl}
        alt={childName}
        class="w-12 h-12 rounded-full object-cover border-2 border-primary"
      />
      <div class="flex-1">
        <CardTitle class="text-xl">{childName}'s Dreamboard</CardTitle>
        <CardDescription>Age {age} • Birthday {birthdayFormatted}</CardDescription>
      </div>
    </div>

    <!-- Status Badge -->
    <div class="mb-3">
      {status === 'active' ? (
        <Badge variant="success" icon="circle-check">
          ● ACTIVE
        </Badge>
      ) : (
        <Badge variant="success" icon="check">
          ✓ COMPLETE
        </Badge>
      )}
    </div>
  </CardHeader>

  <!-- Card Content -->
  <CardContent class="space-y-3 text-sm mb-4">
    <!-- Time Remaining -->
    <div class="flex items-center justify-between">
      <span class="text-text-secondary">
        {daysRemaining} days left
      </span>
      <span class="text-text-muted text-xs">
        Ends {endDate}
      </span>
    </div>

    <!-- Contributions Summary -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-text font-semibold">R{amountRaised}</p>
        <p class="text-text-muted text-xs">
          from {contributorCount} {contributorCount === 1 ? 'contributor' : 'contributors'}
        </p>
      </div>
    </div>
  </CardContent>

  <!-- Card Footer -->
  <CardFooter class="mt-auto pt-4 border-t border-border">
    <Button variant="ghost" size="sm" asChild>
      <Link href={`/dashboard/${boardId}`}>
        View →
      </Link>
    </Button>
  </CardFooter>
</Card>
```

#### Card Specifications

**Card Wrapper:**
- Variant: `default`
- Padding: `md` (1.5rem)
- Border: `border border-border` (#E7E5E4)
- Background: `bg-surface` (#FAFAF9)
- Border radius: `rounded-2xl` (1.5rem)
- Shadow: `shadow-soft` (default), `hover:shadow-lifted` (on hover)
- Interactive: `cursor-pointer` (true)

**Typography:**
- Title: Font `Fraunces`, size `text-xl` (20px), weight `font-bold`
- Description: Font `Outfit`, size `text-sm` (14px), color `text-text-muted`
- Amount: Font `Outfit`, size `text-base`, weight `font-semibold`, color `text-text`
- Meta: Font `Outfit`, size `text-xs`, color `text-text-muted`

**Child Photo Avatar:**
- Size: 48px × 48px (w-12 h-12)
- Border radius: `rounded-full` (full circle)
- Object-fit: `object-cover` (crop center)
- Border: `border-2 border-primary` (teal accent)
- Alt text: Semantic image labeling

**Progress Bar:**
- Height: 8px (h-2 in Tailwind)
- Background: `bg-border` (#E7E5E4)
- Fill: Linear gradient `from-primary to-primary-700`
- Border radius: `rounded-full`
- Values: 0-100% progress

**Status Badge:**
- Active: `● ACTIVE` with success color badge
- Complete: `✓ COMPLETE` with success color badge
- Styling: `inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold`
- Background: `bg-success/10` (#059669 at 10% opacity)
- Text color: `text-success` (#059669)

**Button - "View →":**
- Variant: `ghost`
- Size: `sm`
- Icon: Arrow right icon (→)
- Hover: `hover:text-primary hover:bg-subtle`
- Accessibility: `aria-label="View Emma's Dreamboard details"`

**Card Hover State:**
- Shadow transition: `shadow-soft` → `shadow-lifted`
- Duration: 300ms
- Cursor: `cursor-pointer`

#### Data Fields on Card

| Field | Format | Source | Notes |
|-------|--------|--------|-------|
| Child Name | "Emma's Dreamboard" | `dream_boards.child_name` | Append " 's Dreamboard" |
| Child Photo | URL | `dream_boards.child_photo_url` | 48px avatar, rounded full |
| Age | "Age 7" | Calculated from DOB | Integer value |
| Birthday | "Jan 15" | `dream_boards.birthday_date` | Format: "MMM DD" |
| Status | "● ACTIVE", "FUNDED", "✓ COMPLETE", "EXPIRED", "CANCELLED" | `dream_boards.status` | `active`, `funded`, `closed`, `paid_out`, `expired`, `cancelled` |
| Days Remaining | "23 days left" | Calculated from `end_date` - today | If status is `closed` or `paid_out`: "Ended X days ago" |
| Amount Raised | "R2,450" | `dream_boards.amount_raised_cents / 100` | Format with currency + thousands separator |
| Contributor Count | "12 contributors" | `dream_boards.contributor_count` | Singular/plural handling |
| End Date | "Jan 20" | `dream_boards.end_date` | Format: "MMM DD" (shown in gray meta text) |
| Card Link | `/dashboard/{id}` | `dream_boards.id` | Navigate to detail view |

---

### 5. Create New Dreamboard Card

#### Card Layout

```html
<Card
  variant="default"
  padding="lg"
  className="flex flex-col items-center justify-center min-h-[280px] cursor-pointer hover:bg-subtle"
  interactive={true}
  asChild
>
  <Link href="/create">
    <div class="flex flex-col items-center gap-3 text-center">
      <div class="text-4xl text-text-muted">+</div>
      <div>
        <h3 class="text-lg font-semibold text-text mb-1">
          Create another Dreamboard
        </h3>
        <p class="text-sm text-text-secondary">
          Ready to make another wish come true?
        </p>
      </div>
    </div>
  </Link>
</Card>
```

#### Card Specifications

- **Variant:** `default`
- **Padding:** `lg` (2rem)
- **Min height:** `min-h-[280px]` (matching standard card height)
- **Display:** Flex column, centered items/content
- **Background:** `bg-surface`, `hover:bg-subtle` (slightly lighter on hover)
- **Border:** `border border-border` dashed
- **Icon:** Large "+" symbol, `text-3xl text-text-muted`
- **Heading:** `text-lg font-semibold text-text`
- **Description:** `text-sm text-text-secondary`
- **Link:** Wraps entire card as `<Link href="/create">` for navigation
  - Route behavior: `/create` starts a fresh flow and clears prior draft state before Step 1
- **Accessibility:** Semantic link element, descriptive text

---

### 6. Empty State

Displayed when user has zero Dreamboards.

```html
<div class="flex flex-col items-center justify-center py-16 px-6">
  <div class="w-20 h-20 mb-6 rounded-full bg-primary/10 flex items-center justify-center">
    <GiftIcon class="w-10 h-10 text-primary" />
  </div>

  <h2 class="text-2xl md:text-3xl font-display font-bold text-text mb-3 text-center">
    🎁 You haven't created any Dreamboards yet
  </h2>

  <p class="text-text-secondary text-center max-w-sm mb-8">
    Ready to make your child's birthday extra special? Create your first Dreamboard and start gathering support!
  </p>

  <Button variant="primary" size="lg" asChild>
    <Link href="/create">
      Create your first Dreamboard
    </Link>
  </Button>
</div>
```

**Specifications:**
- Container: `flex flex-col items-center justify-center py-16`
- Icon: 80px × 80px, centered, with background circle `bg-primary/10`
- Heading: `text-2xl md:text-3xl font-display font-bold text-text`
- Description: `text-text-secondary text-center max-w-sm`
- Button: Primary variant, size lg
- Emoji: 🎁 included in heading for warmth

---

### 7. Loading State

When fetching Dreamboards list:

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6 md:px-10 lg:px-20">
  {[1, 2, 3].map((i) => (
    <Card key={i} variant="default" padding="md">
      <Skeleton height="16px" width="100%" className="mb-4" />
      <Skeleton height="48px" width="48px" className="rounded-full mb-4" />
      <Skeleton height="20px" width="80%" className="mb-2" />
      <Skeleton height="16px" width="60%" className="mb-6" />
      <Skeleton height="40px" width="100%" />
    </Card>
  ))}
</div>
```

**Specifications:**
- Show 3 skeleton cards (mobile: 1, tablet: 2, desktop: 3)
- Skeleton component: `animate-shimmer` with gradient
- Heights: Match actual content heights
- Duration: 2s infinite loop
- Respects `prefers-reduced-motion: reduce` for accessibility

---

## Component Tree

```
DashboardPage (Server Component)
├── Header (Sticky)
├── Section: Page Title
│   ├── h1 "My Dreamboards"
│   └── p "Manage your child's wishes"
│
├── Section: Main Content
│   ├── IF loading === true
│   │   └── Grid [3 Skeleton Cards]
│   │
│   ├── ELSE IF dreamBoards.length === 0
│   │   └── EmptyState Component
│   │
│   └── ELSE
│       ├── Grid Container
│       │   ├── Dreamboard Card (repeated)
│       │   │   ├── Progress Bar
│       │   │   ├── Card Header
│       │   │   │   ├── Child Avatar
│       │   │   │   ├── Title
│       │   │   │   └── Description
│       │   │   ├── Status Badge
│       │   │   ├── Card Content
│       │   │   │   ├── Time Remaining
│       │   │   │   └── Contribution Summary
│       │   │   └── Card Footer
│       │   │       └── View Button
│       │   └── Create New Card
│       │       ├── Plus Icon
│       │       ├── Heading
│       │       └── Description
│       └── (Card links to /dashboard/[id])
│
└── Footer (Optional)
```

---

## TypeScript Interfaces

### Page Props

```typescript
interface DashboardPageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}
```

### Dreamboard Card Data

```typescript
interface DreamBoardListItem {
  id: string;
  child_name: string;
  child_photo_url: string;
  child_date_of_birth: string; // ISO 8601 date
  birthday_date: string; // e.g., "2025-01-15" (YYYY-MM-DD)
  status: 'active' | 'funded' | 'closed' | 'paid_out' | 'expired' | 'cancelled'; // board status
  end_date: string; // ISO 8601 date when collection ends
  amount_raised_cents: number; // Total cents raised (e.g., 245000 = R2,450)
  contributor_count: number; // Total unique contributors
  created_at: string; // ISO 8601 timestamp
  updated_at: string; // ISO 8601 timestamp
  parent_id: string; // FK to parent
  progress_percentage: number; // 0-100, calculated from goal vs raised
  target_amount_cents?: number; // Optional goal amount
}
```

### API Response

```typescript
interface GetDreamBoardsResponse {
  data: DreamBoardListItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}
```

### Component Props

```typescript
interface DreamBoardCardProps {
  board: DreamBoardListItem;
  onNavigate?: (boardId: string) => void;
}

interface CreateNewCardProps {
  onNavigate?: () => void;
}

interface EmptyStateProps {
  onCreateClick: () => void;
}
```

---

## File Structure

```
src/
├── app/
│   ├── (host)/
│   │   └── dashboard/
│   │       ├── page.tsx                          # Main list page
│   │       ├── _components/
│   │       │   ├── DreamBoardCard.tsx            # Card component
│   │       │   ├── DreamBoardCard.types.ts       # TypeScript types
│   │       │   ├── CreateNewCard.tsx             # "Create another" card
│   │       │   ├── DashboardEmptyState.tsx       # Empty state
│   │       │   └── DashboardSkeleton.tsx         # Loading skeleton
│   │       └── layout.tsx                        # Layout (if needed)
│
├── components/
│   ├── layout/
│   │   └── Header.tsx                            # (Update: Change "ChipIn" → "Gifta")
│   ├── ui/
│   │   ├── card.tsx                              # Card component
│   │   ├── button.tsx                            # Button component
│   │   ├── skeleton.tsx                          # Skeleton component
│   │   └── badge.tsx                             # Badge component
│   └── icons/
│       ├── GiftIcon.tsx                          # Gift emoji icon
│       ├── ArrowRightIcon.tsx                    # Arrow right
│       └── CheckIcon.tsx                         # Check mark
│
└── lib/
    ├── api/
    │   └── dream-boards.ts                       # API functions
    └── utils/
        └── formatting.ts                         # Date/currency helpers
```

---

## Data Fetching

### Server Component Strategy

```typescript
// src/app/(host)/dashboard/page.tsx
import { getDreamBoardsForParent } from '@/lib/api/dream-boards';
import { auth } from '@clerk/nextjs/server';

export const dynamic = 'force-dynamic'; // Don't cache user-specific data

export default async function DashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/dashboard');
  }

  const { data: dreamBoards, error } = await getDreamBoardsForParent(userId);

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <main>
      {dreamBoards.length === 0 ? (
        <DashboardEmptyState />
      ) : (
        <DashboardGrid boards={dreamBoards} />
      )}
    </main>
  );
}
```

### API Function

```typescript
// src/lib/api/dream-boards.ts
export async function getDreamBoardsForParent(
  parentId: string
): Promise<GetDreamBoardsResponse> {
  try {
    const response = await fetch(`${API_BASE}/dream-boards/parent/${parentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.API_SECRET}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dream boards: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    return {
      data: [],
      error: {
        code: 'FETCH_ERROR',
        message: 'Unable to load your Dreamboards. Please try again.',
      },
    };
  }
}
```

### Pagination (Future Enhancement)

```typescript
interface DashboardPageProps {
  searchParams?: Promise<{ page?: string; limit?: string }>;
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const page = parseInt(params?.page || '1', 10);
  const limit = parseInt(params?.limit || '12', 10);

  const { data, pagination } = await getDreamBoardsForParent(userId, {
    page,
    limit,
  });

  // Render pagination controls if needed
}
```

---

## Responsive Behavior

### Breakpoint Strategy (Mobile-First)

**Mobile (320px - 767px):**
- Grid: 1 column (`grid-cols-1`)
- Padding: `px-5` (20px)
- Gap: `gap-4` (16px)
- Card height: flexible, min 280px
- Font size: base for titles

**Tablet (768px - 1023px):**
- Grid: 2 columns (`md:grid-cols-2`)
- Padding: `md:px-10` (40px)
- Gap: `md:gap-6` (24px)
- Card height: equal grid cells
- Title: increased emphasis

**Desktop (1024px+):**
- Grid: 3 columns (`lg:grid-cols-3`)
- Padding: `lg:px-20` (80px)
- Max-width: `max-w-6xl` (1152px)
- Gap: `lg:gap-6` (24px)
- Center container with margins

### Image Responsive Behavior

```css
/* Child photo avatar */
@media (max-width: 768px) {
  .child-avatar {
    width: 3rem;   /* 48px */
    height: 3rem;
  }
}

@media (min-width: 1024px) {
  .child-avatar {
    width: 3rem;   /* maintain 48px */
    height: 3rem;
  }
}
```

### Text Scaling

```html
<!-- Title scales with breakpoints -->
<h1 class="text-3xl md:text-4xl lg:text-4xl font-display">
  My Dreamboards
</h1>

<!-- Subtitle responsive text -->
<p class="text-base md:text-lg lg:text-lg text-text-secondary">
  Manage your child's wishes
</p>

<!-- Card title -->
<h3 class="text-lg md:text-xl lg:text-xl font-display font-bold">
  {childName}'s Dreamboard
</h3>
```

---

## Animations

### Card Entrance Animation

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

.dream-board-card {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
  animation-fill-mode: both;
}

/* Stagger cards */
.dream-board-card:nth-child(1) { animation-delay: 0.1s; }
.dream-board-card:nth-child(2) { animation-delay: 0.2s; }
.dream-board-card:nth-child(3) { animation-delay: 0.3s; }
```

### Card Hover Animation

```css
.dream-board-card {
  transition: all 300ms ease-out;
}

.dream-board-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04),
              0 12px 24px rgba(0, 0, 0, 0.06);
}
```

### Button Hover Animation

```css
.view-button {
  transition: all 150ms ease-out;
}

.view-button:hover {
  transform: translateX(2px);
  color: #0D9488;
}
```

### Reduce Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  .dream-board-card,
  .view-button {
    animation: none;
    transition: none;
  }

  .dream-board-card:hover {
    transform: none;
  }
}
```

---

## Accessibility

### WCAG 2.1 AA Compliance

**Semantic HTML:**
```html
<main class="mx-auto max-w-6xl">
  <section>
    <h1>My Dreamboards</h1>
    <p>Manage your child's wishes</p>
  </section>

  <section>
    <ul role="list" class="grid ...">
      <li>
        <article>
          <!-- Card content -->
        </article>
      </li>
    </ul>
  </section>
</main>
```

**Focus Management:**
- All interactive elements keyboard accessible
- Focus visible indicators: 2px teal outline
- Tab order: logical left-to-right, top-to-bottom
- Links include `aria-label` for context

**Color Contrast:**
- Text on surface: `#1C1917` on `#FAFAF9` = 7:1 ratio ✓
- Secondary text: `#57534E` on `#FAFAF9` = 5:1 ratio ✓
- Button text: `#FFFFFF` on `#0D9488` = 5.5:1 ratio ✓

**Touch Targets:**
- Minimum 44×44px: All buttons, card clicks
- "View →" button: `h-9 px-4` = 36px height (mobile consideration)

**ARIA Labels:**
```html
<!-- Icon-only elements -->
<button aria-label="View Emma's Dreamboard details">
  View →
</button>

<!-- Images -->
<img alt="Emma's photo" src="..." />

<!-- Empty state messaging -->
<p role="status" aria-live="polite">
  You haven't created any Dreamboards yet
</p>
```

**Icon Accessibility:**
- All icons combined with text labels (no icon-only buttons)
- Arrow icon (→) conveys direction with text "View"
- Plus icon (+) combined with text "Create another Dreamboard"

---

## State Management

### Loading State

```typescript
const [isLoading, setIsLoading] = useState(true);
const [dreamBoards, setDreamBoards] = useState<DreamBoardListItem[]>([]);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function fetchBoards() {
    try {
      const { data, error } = await getDreamBoardsForParent(userId);
      if (error) {
        setError(error.message);
      } else {
        setDreamBoards(data);
      }
    } finally {
      setIsLoading(false);
    }
  }

  fetchBoards();
}, [userId]);

// Render logic
if (isLoading) return <DashboardSkeleton />;
if (error) return <ErrorState message={error} />;
if (dreamBoards.length === 0) return <DashboardEmptyState />;
return <DashboardGrid boards={dreamBoards} />;
```

### Error Handling

```typescript
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div class="bg-red-50 border border-error rounded-xl p-6 text-center">
      <h2 class="text-xl font-semibold text-error mb-2">
        Unable to load Dreamboards
      </h2>
      <p class="text-text-secondary mb-4">{message}</p>
      <Button variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
```

---

## Edge Cases

### 1. No Dreamboards
**Display:** EmptyState component with CTA to create first board
**Copy:** "🎁 You haven't created any Dreamboards yet. Ready to make your child's birthday extra special?"

### 2. Network Error
**Display:** Error state banner with retry button
**Copy:** "Unable to load your Dreamboards. Please check your connection and try again."

### 3. Long Child Names
**Handling:** Truncate with ellipsis after 20 characters
```html
<span class="truncate max-w-[180px]">
  {childName}'s Dreamboard
</span>
```

### 4. Large Amounts (R100,000+)
**Formatting:** Use standard formatting with comma separators
- R2,450 (standard)
- R25,890 (5 digits)
- R145,000 (6 digits)

### 5. Completed Boards in Past
**Copy Update:** "Ended 2 days ago" instead of "23 days left"
**Status:** ✓ COMPLETE badge shows instead of ● ACTIVE

### 6. Single Column on Very Small Screens (320px)
**Special handling:**
```css
@media (max-width: 375px) {
  .card-title {
    font-size: 0.95rem; /* Slightly smaller on tiny screens */
  }
}
```

### 7. Slow Network / Stuck Loading
**Timeout:** Implement 10-second timeout before showing error state
**User Feedback:** Optional loading skeleton with "This is taking longer than expected..."

### 8. Deleted Board (Race Condition)
**Handling:** When board deleted while page is open, fetch will return updated list
**UX:** Board card animates out with fade-out transition

---

## Performance Considerations

### Image Optimization

```typescript
// Use Next.js Image component for optimization
<Image
  src={childPhotoUrl}
  alt={childName}
  width={48}
  height={48}
  className="rounded-full border-2 border-primary"
  priority={false}
  loading="lazy"
/>
```

### Data Fetching Strategy

- **Cache:** Server component cache disabled (`force-dynamic`)
- **Revalidation:** ISR would be `revalidate: 60` (1 minute) if using static generation
- **Pagination:** Implement if > 20 boards per user

### Code Splitting

```typescript
// Lazy load editing modal on demand
const EditBoardModal = dynamic(() => import('./EditBoardModal'), {
  loading: () => <Skeleton />,
});
```

---

## Testing Considerations

### Unit Tests
- Card component renders with correct data
- Progress calculation accuracy
- Date formatting functions
- Currency formatting

### Integration Tests
- Fetch and display dream boards
- Empty state renders when no boards
- Error state displays on API failure
- Navigation links work correctly

### E2E Tests
- User can view dashboard
- User can navigate to detail page
- User can click "Create another" and start creation flow
- Responsive layout works at all breakpoints

---

## Implementation Checklist

- [ ] Header updated to say "Gifta" instead of "ChipIn"
- [ ] Create `/dashboard` page component
- [ ] Create DreamBoardCard component
- [ ] Create CreateNewCard component
- [ ] Create DashboardEmptyState component
- [ ] Create DashboardSkeleton component
- [ ] Implement `getDreamBoardsForParent` API function
- [ ] Add date formatting utility
- [ ] Add currency formatting utility
- [ ] Implement error boundary
- [ ] Test responsive layouts at all breakpoints
- [ ] Verify WCAG AA compliance
- [ ] Test keyboard navigation
- [ ] Implement animations (respect prefers-reduced-motion)
- [ ] Add analytics tracking on navigation
- [ ] Test with slow network (DevTools throttling)

---

**Document Version:** 1.0
**Status:** Implementation-Ready
**Last Updated:** February 2025
