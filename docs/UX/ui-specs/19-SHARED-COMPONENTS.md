# 19. SHARED COMPONENTS — UI Specification
**Gifta UX v2 | Runtime-aligned with inventory corrections**

---

## Runtime Alignment (2026-02-11)

- Runtime source: `src/components/ui/*`, `src/components/dream-board/*`, `src/components/admin/*`, `src/components/landing/*`, `src/components/effects/*`.
- Legacy references to `src/components/layout/Header.tsx` in this document are stale; runtime uses route-specific layouts and `src/components/admin/AdminSidebar.tsx` for admin nav.
- Current shared UI primitives are in `src/components/ui` (button/input/textarea/card/skeleton/state-card/error fallback).
- Dreamboard shared components are implemented in `src/components/dream-board` (status badge, progress bar, contributor display, charity card, time remaining).

## Table of Contents
1. [Navigation & Layout Components](#navigation--layout-components)
2. [Loading States](#loading-states)
3. [Empty States](#empty-states)
4. [Error States](#error-states)
5. [Form Components](#form-components)
6. [Dreamboard Components](#dream-board-components)
7. [Component Architecture Patterns](#component-architecture-patterns)

---

## Navigation & Layout Components

### 1. App Header (Authenticated Pages)
**Purpose**: Primary navigation and branding for all authenticated app pages (Dashboard, Dreamboard edit, Contributions, etc.). Sticky positioning allows quick access to navigation and account controls.

**File Path**: `src/components/layout/Header.tsx`

**Visual Specification**:
- Sticky positioning: `position: sticky; top: 0; z-index: 40`
- Height: 64px (desktop), 56px (mobile)
- Background: `#FFFFFF` with `backdrop-filter: blur(8px)` for glass morphism effect
- Border bottom: 1px solid `#E7E5E4` (light border)
- Padding: 16px 24px (desktop), 12px 16px (mobile)

**Layout**:
- Flexbox row: `justify-content: space-between; align-items: center`
- Left section: Logo + nav links (desktop only)
- Right section: Dashboard link (if signed in) + UserButton avatar

**Logo Component**:
- Text: "Gifta" (NOT "ChipIn")
- Font: 'Nunito' 600, 24px, color: `#0D9488` (primary teal)
- Icon: 🎁 emoji (1.2em size) before text
- Letter-spacing: -0.5px

**Navigation Links** (Desktop only, hidden on mobile):
- Links: "Dashboard" → `/dashboard`, "Create" → `/create`, "FAQ" → `/faq`
- Font: 'Outfit' 500, 14px, color: `#57534E` (secondary text)
- Hover state: color becomes `#0D9488`, transition: 150ms ease-out
- Active state (current page): color `#0D9488`, underline (2px solid, offset 4px below)

**UserButton (Authentication)**:
- Signed-out state: "Sign in" link, font: 'Outfit' 500, 14px, color: `#F97316` (orange), hover: opacity 0.9
- Signed-in state: Avatar circle (40px × 40px), initials inside or image, cursor: pointer
- Avatar background: gradient from `#0D9488` to `#6B9E88` (sage)
- Avatar text: white, font: 'Outfit' 600, 14px, centered
- Click opens Clerk auth menu

**Responsive Behavior**:
- Desktop (1024px+): Full horizontal layout, all nav links visible, logo + text
- Tablet (768px-1023px): Logo only (no text), nav links visible, drawer icon appears for mobile nav
- Mobile (<768px): Logo + hamburger menu (3-line icon), nav links hidden, drawer navigation active

**Accessibility**:
- `<header role="banner">`
- Nav links: `<nav role="navigation" aria-label="Main navigation">`
- UserButton: `aria-label="Open user menu"` with `aria-haspopup="menu"`
- Skip link: `<a href="#main-content" class="sr-only">Skip to main content</a>` (visible on focus)

**States**:
| State | Condition | Visual Change |
|-------|-----------|---------------|
| Default | Page loaded, signed in | Standard layout |
| Signed-out | Not authenticated | "Sign in" link instead of avatar |
| Mobile | Width < 768px | Drawer icon, condensed layout |
| Scrolled (sticky) | Page scrolled 200px+ | Subtle shadow added, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)` |

**Code Structure**:
```tsx
// src/components/layout/Header.tsx
interface HeaderProps {
  currentPath?: string;
  onMobileMenuOpen?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, onMobileMenuOpen }) => {
  const { isSignedIn } = useAuth();
  const isMobile = useMediaQuery('max-width: 768px');

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border-light backdrop-blur-sm">
      {/* Logo + Nav */}
      {/* UserButton */}
    </header>
  );
};
```

---

### 2. Landing Page Navigation
**Purpose**: Distinct navigation for unauthenticated landing pages. Simpler styling to guide conversion without overwhelming users.

**File Path**: `src/components/landing/LandingNav.tsx`

**Visual Specification**:
- Height: 64px (desktop), 56px (mobile)
- Background: transparent (on landing hero), or `#FEFDFB` on scroll
- Padding: 16px 24px
- No border or backdrop blur

**Logo**:
- Text: "Gifta"
- Font: 'Nunito' 600, 24px, color: `#0D9488`
- Icon: 🎁 emoji

**Navigation Links** (Desktop):
- "Features", "How It Works", "FAQ"
- Font: 'Outfit' 500, 14px, color: `#57534E`
- Hover: color `#0D9488`, transition: 150ms

**CTA Button** (Primary):
- Text: "Sign in" or "Get Started"
- Font: 'Outfit' 600, 14px
- Background: `#F97316` (orange)
- Text: white
- Padding: 10px 20px
- Border-radius: 6px
- Hover: brightness(1.1) filter
- Mobile: Full width or drawer

**Mobile Navigation**:
- Hamburger icon (3 lines) on right, color: `#1C1917`
- Drawer slides in from right: width 80vw (max 320px), `backdrop-filter: blur(12px)`, semi-transparent overlay
- Links stacked vertically, padding: 24px
- Focus trap: Tab loops within drawer, Escape closes
- Animated transition: slide-in 300ms ease-out

**File**: `src/components/landing/MobileNav.tsx` (separate drawer component)

---

### 3. Footer
**Purpose**: Universal footer for all pages. Contains branding, social links, legal, and trust signals.

**File Path**: `src/components/layout/Footer.tsx`

**Visual Specification**:
- Height: auto (min 200px desktop, 280px mobile)
- Background: `#FAFAF9` (surface)
- Border-top: 1px solid `#E7E5E4`
- Padding: 48px 24px (desktop), 32px 16px (mobile)

**Content Layout** (Desktop: 4 columns):
- Column 1: Logo + Tagline
  - "Gifta" in Nunito 600, 20px, `#0D9488`
  - Tagline: "Birthday gifting, simplified." in Outfit 400, 14px, `#57534E`
  - Line above tagline: 2px solid `#F97316`, width: 32px, margin-bottom: 8px

- Column 2: Product Links
  - Links: "Home", "How It Works", "FAQ", "Create Dreamboard"
  - Font: Outfit 500, 14px, color: `#57534E`
  - Hover: color `#0D9488`

- Column 3: Company Links
  - Links: "About", "Blog", "Contact"
  - Same styling as Column 2

- Column 4: Legal & Social
  - Legal: "Privacy", "Terms", "Cookies", "Contact"
  - Social icons: Facebook, Twitter, Instagram, LinkedIn (24px × 24px SVGs, color: `#6B9E88`)
  - Social hover: color `#0D9488`, scale(1.1) transform

**Trust Badges**:
- Row of icons + text: "Secure payments", "POPIA compliant", "Zero fees for nonprofits"
- Icons: 16px × 16px, color: `#059669` (success)
- Text: Outfit 12px, `#57534E`

**Copyright**:
- Text: "© 2024 Gifta. All rights reserved."
- Font: Outfit 12px, `#A8A29E` (muted)
- Centered on mobile, left-aligned on desktop

**Mobile Layout** (Stacked vertically):
- Logo + Tagline at top
- Links: 2-column grid
- Social icons: Centered row
- Trust badges: Stacked
- Copyright: Full width

**Accessibility**:
- Semantic `<footer role="contentinfo">`
- Logo link: `aria-label="Gifta home"`
- Social links: `aria-label="Follow us on [Platform]"`
- Skip to footer link in header: `href="#footer"`

---

### 4. Mobile Navigation Drawer
**Purpose**: Slide-in menu for mobile and tablet navigation with full accessibility.

**File Path**: `src/components/layout/MobileNav.tsx`

**Visual Specification**:
- Position: fixed, right: 0, top: 0
- Width: 80vw (max 320px)
- Height: 100vh
- Background: `#FFFFFF`
- Box-shadow: -2px 0 16px rgba(0,0,0,0.1)
- Z-index: 50 (above main content, below modals)
- Animated slide-in from right: `transform: translateX(0)` (open) / `translateX(100%)` (closed)
- Duration: 300ms ease-out (Framer Motion or CSS transition)

**Content Structure**:
- Header (40px): Close button (X icon, 20px × 20px) on right, Padding: 12px 16px
- Navigation list:
  - Links: "Dashboard", "Create", "FAQ", "About", "Contact"
  - Font: Outfit 500, 16px, color: `#1C1917`
  - Padding: 16px 24px per link
  - Divider line (1px `#E7E5E4`) between sections
  - Hover: background `#F5F5F4`, transition: 150ms

- Footer section:
  - CTA: "Sign out" or "Sign in" (depending on auth state)
  - Font: Outfit 600, 14px
  - Padding: 16px 24px
  - Button styling: Full width, orange background if CTA, gray if secondary

**Overlay**:
- Semi-transparent backdrop (dark), opacity: 0.3, click to close
- Position: fixed, covers entire viewport, z-index: 49 (below drawer)

**Focus Management** (Accessibility):
- Focus trap: Tab key cycles through drawer items only, wraps at end
- Initial focus: First link (Dashboard)
- Escape key: Closes drawer, focus returns to hamburger button
- Implementation: use `react-focus-lock` or `react-aria` utilities

**Animation States**:
| State | Transform | Opacity | Duration |
|-------|-----------|---------|----------|
| Closed | `translateX(100%)` | 0 | 300ms |
| Opening | `translateX(0)` | 1 | 300ms ease-out |
| Open | `translateX(0)` | 1 | - |
| Closing | `translateX(100%)` | 0 | 300ms ease-in |

**Code Structure**:
```tsx
// src/components/layout/MobileNav.tsx
interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  // Focus trap logic
  // Escape key listener
  // Backdrop click handler

  return (
    <>
      {/* Overlay backdrop */}
      <nav role="navigation" aria-label="Mobile navigation" className={`${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Drawer content */}
      </nav>
    </>
  );
};
```

---

### 5. Create Flow Shell (Wizard Layout)
**Purpose**: Container for multi-step contribution or Dreamboard creation flows. Provides consistent step progress indicator and back/next navigation.

**File Path**: `src/components/layout/CreateFlowShell.tsx`

**Visual Specification**:
- Layout: Centered container on desktop, full width on mobile
- Max-width: 600px (desktop)
- Min-height: 100vh (ensures content stretches full screen)
- Background: `#FEFDFB` (off-white, same as page background)
- Padding: 40px 24px (desktop), 24px 16px (mobile)

**Header Section** (above step indicator):
- Close button (X) top-right, 24px × 24px icon, color: `#57534E`, hover: `#1C1917`
- Title: "Create Dreamboard" or "Contribute to [Child]'s Gift"
- Font: 'Fraunces' 700, 28px (desktop), 24px (mobile), color: `#1C1917`
- Optional subtitle: Font Outfit 400, 14px, color: `#57534E`

**Step Progress Indicator**:
- File: `src/components/layout/WizardStepIndicator.tsx` (separate component)
- Display: Numbered steps (1, 2, 3, etc.) connected by lines
- Step circle: 40px × 40px, border: 2px
  - Completed: filled background `#059669` (success), white text "✓"
  - Current: background `#0D9488` (teal), white text, slightly larger
  - Upcoming: background `#E7E5E4` (border), text `#A8A29E` (muted)
- Connector line: height 2px, horizontal, color matches step state (completed: `#059669`, current: `#0D9488`, upcoming: `#E7E5E4`)
- Labels below circles: Outfit 400, 12px, color: `#57534E`, truncate on mobile
- Spacing: 8px between steps, 24px margin bottom

**Content Area**:
- Flexbox column, flex-grow: 1, padding: 32px 0 (desktop), 24px 0 (mobile)
- Houses step content (forms, selections, confirmations)
- Fade-in animation: `fadeUp` 0.6s ease-out on mount

**Navigation Footer**:
- Sticky bottom on mobile, fixed to content on desktop
- Flexbox row, justify-content: space-between, gap: 16px
- Padding: 24px, margin-top: 32px
- Border-top: 1px solid `#E7E5E4` on mobile (divides from content)

**Navigation Buttons**:
- Back button: Secondary style
  - Text: "Back"
  - Font: Outfit 600, 14px, color: `#0D9488`
  - Background: transparent
  - Border: 1px solid `#D6D3D1` (strong border)
  - Padding: 12px 24px
  - Hover: background `#F5F5F4`, border-color `#0D9488`
  - Disabled: opacity 0.5, cursor not-allowed (hidden on step 1)

- Next/CTA button: Primary style (orange)
  - Text: "Next" or "Create" or "Contribute"
  - Font: Outfit 600, 14px, color: white
  - Background: `#F97316` (orange)
  - Padding: 12px 32px
  - Border-radius: 6px
  - Hover: brightness(1.08) filter
  - Disabled: opacity 0.6, cursor not-allowed
  - Loading: Shows spinner, text "Processing..."

**Props Interface**:
```tsx
interface CreateFlowShellProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
  onBack?: () => void;
  onClose: () => void;
  onNext?: (stepData: Record<string, any>) => void;
  nextButtonText?: string;
  nextButtonDisabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}
```

**Responsive Behavior**:
- Desktop (1024px+): Centered card, max-width 600px, padding 40px
- Tablet (768px-1023px): Full width with padding, step labels abbreviated or hidden on smaller screens
- Mobile (<768px): Full width, padding 24px 16px, step indicator scrolls horizontally if needed

---

## Loading States

### 1. Skeleton Components
**Purpose**: Placeholder UI while content loads. Multiple variants for different content types.

**File Path**: `src/components/ui/skeleton.tsx`

**Visual Specification**:
- Base skeleton: Background `#E7E5E4`, border-radius: 4px
- Animation: Shimmer effect 2s infinite, left-to-right gradient sweep
  - CSS: `background: linear-gradient(90deg, #E7E5E4 0%, #FAFAF9 50%, #E7E5E4 100%)`
  - Animation: `background-position` shift 2s infinite, `background-size: 200% 100%`
- Semantics: `role="status"`, `aria-busy="true"`, `aria-label="Loading..."`

**Skeleton Variants**:

**a) Text Line Skeleton**
- Width: 100% (or custom via prop)
- Height: 16px (body text), 20px (subheading), 28px (heading)
- Border-radius: 2px
- Margin-bottom: 8px (between lines)
- Count: Usually 3-5 lines for paragraph content

**b) Circle Skeleton (Avatar)**
- Width: 40px × 40px (small), 64px × 64px (medium), 96px × 96px (large)
- Border-radius: 50%
- Margin-bottom: 12px

**c) Rectangle Skeleton (Image)**
- Width: 100%, Height: 200px (default)
- Border-radius: 8px
- Aspect-ratio: 16/9 (customizable)

**d) Card Skeleton**
- Combines: Rectangle (200px) + Text lines (3) + minimal spacing
- Width: 100%, border-radius: 8px
- Padding: 16px
- Simulates Dreamboard card structure

**e) Table Row Skeleton**
- Horizontal row: 5-6 columns of varied widths
- Heights: 16px (data), 24px (header)
- Spacing: 12px between columns
- Border-bottom: 1px solid `#E7E5E4`

**Shimmer Animation CSS**:
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(90deg,
    #E7E5E4 0%,
    #FAFAF9 50%,
    #E7E5E4 100%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
```

**Usage Example**:
```tsx
<div className="space-y-3">
  <Skeleton.TextLine count={3} />
  <Skeleton.Avatar size="md" />
  <Skeleton.Rectangle height={200} />
</div>
```

**Accessibility**:
- Avoid using skeletons for screen readers (use live regions or loading text)
- `aria-label="Content is loading"` on parent container
- Alternative: Hidden text "Loading content..." with `sr-only` class

---

### 2. Page Loading State
**Purpose**: Full-page skeleton matching the target page layout while data loads.

**Visual Specification**:
- Entire viewport replaced with skeleton grid
- Example: Dashboard page
  - Header skeleton (top bar, 64px height)
  - Sidebar skeleton (if applicable)
  - Main content skeleton:
    - Heading skeleton (28px height, width 60%)
    - 3 × Card skeletons (200px each, with image + text)
    - Pagination skeleton (8 dots, spaced)

**Implementation**:
- Centralized loader components for each page route
- File: `src/components/ui/PageSkeleton.tsx`
- Props: `variant` (dashboard, dreamBoard, contributions, etc.)

---

### 3. Button Loading State
**Purpose**: Provide feedback when button action is processing (e.g., form submission).

**Visual Specification**:
- Button styling remains (orange, padding, etc.)
- Content changes:
  - Text becomes "Processing..." (Outfit 600, 14px)
  - Icon/spinner replaces any leading icon: 16px × 16px spinner
  - Text color: white (unchanged)
  - Cursor: `not-allowed`
  - Opacity: 0.9 (slightly faded)
  - Disabled: `pointer-events: none`

**Spinner Animation**:
- SVG circle, stroke: white, stroke-width: 2, r: 8px
- Rotation: 360deg infinite, duration: 1s linear
- CSS: `@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`

**Code**:
```tsx
export const Button: React.FC<ButtonProps> = ({ isLoading, children, ...props }) => {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4 inline mr-2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="2" fill="none" />
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};
```

---

### 4. Payment Processing Overlay
**Purpose**: Full-screen overlay during payment processing. Prevents user from closing/navigating away.

**File Path**: `src/components/effects/PaymentOverlay.tsx`

**Visual Specification**:
- Position: fixed, full viewport, z-index: 60 (above all other content)
- Background: `rgba(0, 0, 0, 0.7)` (dark overlay with transparency)
- Flexbox centering: justify-content center, align-items center

**Content Card**:
- Width: 90vw, max-width: 400px
- Background: `#FFFFFF`
- Border-radius: 12px
- Padding: 48px 32px
- Box-shadow: 0 20px 60px rgba(0,0,0,0.2)
- Centered content: flex-direction column, align-items center

**Content Elements**:
- Heading: "Processing your contribution..." (Fraunces 700, 20px, `#1C1917`)
- Spinner: 48px × 48px, centered below heading, margin-bottom: 24px
  - Animation: rotation 1s linear infinite
  - Color: gradient from `#0D9488` to `#F97316` (teal to orange)
- Subtext: "Please don't close this page." (Outfit 400, 14px, `#57534E`, margin-top: 16px)
- Optional progress indicator: Percentage text (12px, muted) underneath spinner

**Animation**:
- Entry: Fade in + scale up (0.8 to 1.0) over 300ms, easing: ease-out
- Exit: Fade out + scale down over 300ms
- Spinner: Continuous rotation (no interruption during processing)

**Accessibility**:
- Role: `role="status"`, `aria-busy="true"`
- Label: `aria-label="Payment is being processed"`
- Prevent interaction: Overlay blocks all clicks/scrolls outside modal
- Keyboard: Escape key disabled (cannot close during processing)

**Props Interface**:
```tsx
interface PaymentOverlayProps {
  isVisible: boolean;
  progress?: number; // Optional: 0-100 for progress bar
  message?: string; // Custom message (default: "Processing your contribution...")
}
```

**Code Structure**:
```tsx
export const PaymentOverlay: React.FC<PaymentOverlayProps> = ({
  isVisible,
  progress = 0,
  message = "Processing your contribution..."
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-60">
      <div className="bg-white rounded-2xl p-12 w-96 text-center">
        <h2 className="text-xl font-fraunces font-bold text-dark mb-6">{message}</h2>
        <div className="relative h-12 w-12 mx-auto mb-6">
          {/* Spinner SVG */}
        </div>
        <p className="text-sm text-secondary">Please don't close this page.</p>
        {progress > 0 && (
          <p className="text-xs text-muted mt-2">{progress}%</p>
        )}
      </div>
    </div>
  );
};
```

---

## Empty States

### 1. Dashboard: No Dreamboards
**Trigger**: User signed in but hasn't created any Dreamboards.

**Visual Specification**:
- Centered card in main content area
- Width: 100%, max-width: 400px, margin: auto
- Padding: 48px 32px
- Background: `#FAFAF9` (surface), border-radius: 12px
- Border: 1px dashed `#D6D3D1`

**Content**:
- Icon: Large 🎁 emoji, font-size: 64px, margin-bottom: 16px
- Heading: "You haven't created any Dreamboards yet..." (Fraunces 600, 18px, `#1C1917`)
- Subtext: "Create your first Dreamboard to share gift ideas with friends and family." (Outfit 400, 14px, `#57534E`)
- CTA Button: "Create Dreamboard", orange background, margin-top: 24px

---

### 2. Contributions: No Contributions
**Trigger**: Dreamboard created but no contributions received yet.

**Visual Specification**:
- Similar card layout as above
- Icon: 🎈 emoji, 64px
- Heading: "No contributions yet — but they're coming!" (Fraunces 600, 18px)
- Subtext: "Share your Dreamboard link with friends and family to start receiving gifts."
- CTA Button: "Share Dreamboard", margin-top: 24px
- Secondary action (below): "Copy link", text button, color: `#0D9488`

---

### 3. Birthday Messages: Empty
**Trigger**: Campaign is live but no custom messages from contributors.

**Visual Specification**:
- Icon: 💬 emoji, 48px
- Heading: "No messages yet." (Outfit 600, 16px, `#1C1917`)
- Subtext: "Messages from contributors will appear here." (Outfit 400, 14px, `#57534E`)
- No CTA (informational only)

**File Path**: `src/components/ui/empty-state.tsx`

**Props Interface**:
```tsx
interface EmptyStateProps {
  icon: React.ReactNode; // Emoji or SVG
  heading: string;
  subtext?: string;
  cta?: {
    label: string;
    onClick: () => void;
  };
  secondaryCta?: {
    label: string;
    onClick: () => void;
  };
}
```

---

## Error States

### 1. Error Card Component
**Purpose**: Consistent error display across the app (server errors, validation errors, network issues).

**File Path**: `src/components/ui/state-card.tsx` (or `error-card.tsx`)

**Visual Specification**:
- Width: 100%, max-width: 500px
- Background: `#FEE2E2` (light red), border: 1px solid `#FECACA` (lighter red)
- Border-radius: 8px
- Padding: 16px 20px

**Content Layout** (Flexbox row):
- Icon: ⚠️ emoji, 24px, color: `#DC2626` (error red), margin-right: 12px
- Text section (flex-grow):
  - Title (optional): Outfit 600, 14px, `#DC2626`
  - Message: Outfit 400, 14px, `#991B1B` (dark red), line-height: 1.5
- Action button (optional, right-aligned): "Retry" or "Dismiss", text-style, color: `#DC2626`, hover: underline

**Tone**:
- Friendly and warm, not technical
- Examples:
  - ❌ "Failed to connect to database."
  - ✓ "We're having trouble connecting. Please check your internet and try again."
  - ❌ "CORS error: origin not allowed."
  - ✓ "Something went wrong. Please refresh the page."

**Variants**:
- Warning: Yellow background `#FEF3C7`, border `#FCD34D`, icon: 🔔, text color: `#92400E`
- Success: Green background `#DCFCE7`, border `#BBF7D0`, icon: ✓, text color: `#166534`
- Info: Blue background `#DBEAFE`, border `#BFDBFE`, icon: ℹ️, text color: `#1E40AF`

**Accessibility**:
- Role: `role="alert"`, `aria-live="polite"`
- Ensures screen readers announce errors immediately

---

### 2. Inline Field Errors
**Purpose**: Validation feedback for form inputs.

**Visual Specification**:
- Error text: Outfit 400, 12px, color: `#DC2626` (error red), margin-top: 4px
- Input border: Changes to `#DC2626` (2px solid)
- Input label (if present): Color changes to `#DC2626`
- Background remains white, no background color change

**Example HTML**:
```tsx
<div className="space-y-1">
  <label className="block text-sm font-outfit text-dark">Email</label>
  <input
    type="email"
    className={`border-2 rounded-md px-3 py-2 w-full ${error ? 'border-error text-error' : 'border-border-light'}`}
  />
  {error && <p className="text-error text-xs mt-1">{error}</p>}
</div>
```

---

### 3. Toast Notifications (Transient Errors)
**Purpose**: Quick notification for temporary errors (failed copy, network hiccup, etc.).

**Visual Specification**:
- Position: Fixed, bottom-right corner, 16px from bottom/right
- Width: 300px (or full width - 32px on mobile)
- Background: `#FAFAF9` (surface), border: 1px solid `#E7E5E4`
- Border-radius: 8px
- Padding: 12px 16px
- Box-shadow: 0 4px 12px rgba(0,0,0,0.1)
- Z-index: 50

**Content**:
- Icon (left): ⚠️ (warning), ✓ (success), ❌ (error), ℹ️ (info)
- Text (Outfit 400, 13px, `#57534E`): One-line message
- Close button (X, 16px, color: `#A8A29E`, hover: `#57534E`)

**Animation**:
- Entry: Slide up from bottom + fade in, 300ms ease-out
- Exit: Slide down + fade out, 300ms ease-in
- Auto-dismiss: 4 seconds (errors), 3 seconds (success)

**Stacking**:
- If multiple toasts: Stack vertically, 8px gap between each
- Max 3 toasts visible; queue additional

**File Path**: `src/components/ui/toast.tsx` (or use `sonner` library)

---

### 4. Network Error State
**Purpose**: Specific guidance when network connectivity is lost.

**Visual Specification**:
- Page-level banner or modal (depending on context)
- Heading: "Connection Lost" (Fraunces 600, 18px, `#DC2626`)
- Message: "We're having trouble connecting. Please check your internet and try again." (Outfit 400, 14px, `#57534E`)
- Icon: 🌐 broken or ⚠️
- CTA Button: "Retry" (orange background)
- Optional: Show timestamp "Last connected: 2 minutes ago"

**Behavior**:
- Show after 5 seconds of failed API request
- Auto-retry every 10 seconds in background
- Dismiss when connection restored
- Prevent critical actions (form submission, payment) while offline

---

## Form Components

### 1. Amount Selector
**Purpose**: Interactive component for selecting contribution amount in donation flow.

**File Path**: `src/components/forms/AmountSelector.tsx`

**Visual Specification**:
- Layout: Grid of buttons + custom input field
- Grid: 2 columns on desktop, 1 column on mobile
- Button size: ~120px × 60px (flex-based)
- Gap between buttons: 12px

**Preset Amount Buttons**:
- Options: $10, $25, $50, $100, $250
- Font: Outfit 600, 14px
- Default state:
  - Background: `#F5F5F4` (light gray)
  - Border: 1px solid `#D6D3D1`
  - Color: `#57534E` (secondary)
  - Border-radius: 6px
  - Cursor: pointer
  - Transition: 150ms ease-out
- Hover state:
  - Background: `#EFEFED` (slightly darker)
  - Border-color: `#0D9488` (teal)
  - Color: `#1C1917` (darker text)
- Selected state:
  - Background: `#0D9488` (teal)
  - Border-color: `#0D9488`
  - Color: white
  - Box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.2) (focus ring)
- Recommended badge (on one button, e.g., $50):
  - Small pill above/below button: "Recommended"
  - Font: Outfit 500, 10px, `#F97316` (orange)
  - Positioned: `top: -6px` (overlapping button top edge)

**Custom Amount Input**:
- Label: "Other amount", Font: Outfit 500, 12px, `#57534E`, margin-bottom: 4px
- Input field:
  - Prefix: "$" (16px Outfit 600, `#57534E`)
  - Type: number, min: 1, max: 999999
  - Placeholder: "Enter amount"
  - Width: 100%, padding: 12px 16px 12px 28px (account for $ prefix)
  - Font: Outfit 500, 14px, color: `#1C1917`
  - Border: 1px solid `#D6D3D1`, border-radius: 6px
  - Background: white
  - Cursor: text
  - Focus state: border-color `#0D9488`, box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1)
  - Invalid state (< 1): border-color `#DC2626`, text-color `#DC2626`

**Props Interface**:
```tsx
interface AmountSelectorProps {
  presetAmounts?: number[]; // [10, 25, 50, 100, 250]
  recommendedAmount?: number; // Highlights one button
  selectedAmount?: number;
  onAmountChange: (amount: number) => void;
  currency?: string; // Default: "$"
  error?: string;
}
```

**Behavior**:
- Clicking preset button selects that amount, clears custom input
- Typing in custom input deselects any preset button
- Form validation: Ensure at least 1 cent entered before proceeding
- Real-time feedback: Show "Selected: $50" confirmation message

---

### 2. Payment Method Selector
**Purpose**: Choose between Card and SnapScan payment methods.

**File Path**: `src/components/forms/PaymentMethodSelector.tsx`

**Visual Specification**:
- Layout: 2 radio cards (desktop) or stacked (mobile)
- Card size: Equal width, min-height: 100px
- Gap: 16px between cards

**Card Design** (for each method):
- Default state:
  - Background: `#FAFAF9` (surface)
  - Border: 2px solid `#D6D3D1`
  - Border-radius: 8px
  - Padding: 16px
  - Cursor: pointer
  - Transition: 150ms ease-out
- Hover state:
  - Border-color: `#0D9488` (teal)
  - Background: `#F5F5F4` (slightly darker)
- Selected state:
  - Border-color: `#0D9488` (teal), 2px solid
  - Background: `#F0F9F7` (very light teal)
  - Box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1)

**Card Content** (Flexbox row, align-items center):
- Left: Radio button (16px × 16px)
  - Unchecked: Border 2px `#D6D3D1`, background white
  - Checked: Background `#0D9488`, inner dot white (6px)
  - Margin-right: 12px
- Middle (flex-grow): Text content
  - Method name: Outfit 600, 14px, `#1C1917`
  - Description: Outfit 400, 12px, `#57534E` (below name)
  - Examples:
    - Card: "Credit/Debit Card", "Visa, Mastercard, Amex"
    - SnapScan: "SnapScan", "Instant secure payment"
- Right: Icon/logo
  - Card: 🏧 emoji or card SVG, 32px × 20px
  - SnapScan: Brand logo (if available) or 📱 emoji
  - Color: `#0D9488`

**Props Interface**:
```tsx
interface PaymentMethodSelectorProps {
  methods: Array<{
    id: string; // "card" | "snapscan"
    name: string;
    description: string;
    icon?: React.ReactNode;
  }>;
  selectedMethod?: string;
  onMethodChange: (methodId: string) => void;
}
```

**Form Integration**:
- Part of contribution form, comes after amount selection
- Required: User must select before proceeding to payment entry
- Validation message if attempting to submit without selection

---

### 3. Contribution Form
**Purpose**: Orchestrates entire contribution flow (amount + optional message + payment).

**File Path**: `src/components/forms/ContributionForm.tsx`

**Form Sections**:

**Section 1: Amount Selection**
- Component: `<AmountSelector />`
- Preset amounts: $10, $25, $50, $100, $250
- Recommended: $50
- Required: Yes

**Section 2: Optional Personal Message**
- Label: "Add a message (optional)" (Outfit 500, 12px)
- Text area:
  - Placeholder: "Share birthday wishes, a memory, or a note..."
  - Rows: 3, resizable: true
  - Max-length: 500 characters
  - Font: Outfit 400, 14px, `#1C1917`
  - Padding: 12px
  - Border: 1px solid `#D6D3D1`, border-radius: 6px
  - Focus: border-color `#0D9488`, box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1)
- Character count: "123 / 500", Font: Outfit 400, 12px, `#A8A29E`, right-aligned, margin-top: 4px
- Validation: None required (optional), but warn if > 500 chars

**Section 3: Payment Method**
- Component: `<PaymentMethodSelector />`
- Methods: Card, SnapScan
- Required: Yes

**Section 4: Payment Details** (conditional, shown based on selected method)
- Card flow (Stripe):
  - Cardholder name input
  - Card number field (iframe or tokenization)
  - Expiry date + CVC fields
  - Billing address (optional)
- SnapScan flow:
  - Display QR code (scannable)
  - Text: "Scan with your phone's camera or SnapScan app"
  - Amount displayed: "Amount: R50"
  - Poll for payment confirmation

**Form State Management**:
- Validation on blur (inputs) and on submit (full form)
- Error messages inline for each field
- Success state: Confirmation page before proceeding

**Navigation**:
- Back button: Previous section (or close if single-page form)
- Next/Contribute button: Submit form to API
- Loading state: Button shows spinner while processing

**Props Interface**:
```tsx
interface ContributionFormProps {
  dreamBoardId: string;
  childName: string;
  onSuccess: (contributionData: any) => void;
  onCancel: () => void;
  showMessage?: boolean; // Default: true
}

interface FormData {
  amount: number;
  message?: string;
  paymentMethod: "card" | "snapscan";
  cardDetails?: StripeTokenData;
}
```

**Accessibility**:
- Form wrapper: `<form role="form" aria-label="Contribute to [Child]'s Dreamboard">`
- Fieldset for each section with legend
- Error messages: `aria-describedby="field-error"` on inputs
- Required indicator: `aria-required="true"` on inputs

---

## Dreamboard Components

### 1. Dreamboard Card
**Purpose**: Public-facing card displayed on dashboard, discovery, and share pages. Shows gift, progress, contributors, and CTA.

**File Path**: `src/components/dream-board/DreamBoardCard.tsx`

**Visual Specification**:
- Dimensions: Responsive, typically 100% width in grid (330px on desktop, 100% on mobile)
- Aspect-ratio: Variable (image-dependent, typically 4:5)
- Background: `#FFFFFF`, border-radius: 12px
- Shadow: `0 2px 8px rgba(0,0,0,0.08)`, hover: `0 8px 24px rgba(0,0,0,0.12)`
- Overflow: hidden (rounded corners apply to image)

**Layout Structure** (Flexbox column):

**a) Image Section** (top, 60% of card height):
- Component: `<DreamBoardImage />` (separate component, see below)
- Width: 100%, aspect-ratio: 1/1 (square)
- Circular crop of child's photo
- Overlay badge (top-right corner):
  - Background: `rgba(15, 23, 42, 0.8)` (dark translucent)
  - Padding: 8px 12px
  - Border-radius: 4px
  - Text: "3 days left" or "5 months away" (Outfit 500, 12px, white)
  - Icon: 🕐 clock emoji before text

**b) Content Section** (middle, 30% of card):
- Padding: 16px
- Flex-grow: 1, flex-direction: column, justify-content: space-between

  **Child Name & Age**:
  - Name: Fraunces 600, 18px, `#1C1917`
  - Age: Outfit 400, 12px, `#57534E` (below name, on same line with punctuation)
  - Line: "Emma, 7"

  **Gift Description**:
  - Font: Outfit 500, 14px, `#1C1917`
  - Max-width: 2 lines (truncate with ellipsis if longer)
  - Format: "Dream gift: [Gift name]" or just "[Gift name]"
  - Example: "Dream gift: Nintendo Switch"

  **Progress Bar**:
  - Component: `<ProgressBar />` (separate component, see below)
  - Width: 100%, margin-top: 12px
  - Height: 8px, border-radius: 4px
  - Background: `#E7E5E4` (light border)
  - Fill: Gradient from `#0D9488` to `#6B9E88` (teal to sage)
  - Percentage: "75% funded" label below bar (Outfit 500, 12px, `#0D9488`)

  **Contributor Chips**:
  - Component: `<ContributorChips />` (separate component, see below)
  - Overlapping avatars, max 4-5 visible, "+3 more" label if exceeds
  - Margin-top: 12px

**c) CTA Button** (bottom):
- Full width: `width: 100% - (2 × padding)`
- Text: "Contribute" or "View Details"
- Font: Outfit 600, 14px, color: white
- Background: `#F97316` (orange)
- Padding: 12px 16px
- Border-radius: 6px
- Cursor: pointer
- Hover: brightness(1.08) filter, transform: translateY(-1px)
- Disabled state (if goal reached): Background `#059669` (success), text: "Fully Funded", cursor: not-allowed

**States**:
| State | Condition | Visual Change |
|-------|-----------|---------------|
| Default | Card loaded normally | Standard layout |
| Hover | Mouse over card | Elevated shadow, slight scale (1.02) |
| Loading | Image/data still loading | Image skeleton placeholder |
| Fully funded | Progress >= 100% | CTA button green, text "Fully Funded" |
| Expired | Birthday past | Overlay: "Campaign ended" badge, CTA disabled |

**Responsive Behavior**:
- Desktop (1024px+): 3-column grid, card width ~330px
- Tablet (768px-1023px): 2-column grid
- Mobile (<768px): 1-column, full width

**Props Interface**:
```tsx
interface DreamBoardCardProps {
  id: string;
  childName: string;
  childAge: number;
  giftName: string;
  giftImage: string; // Image URL
  targetAmount: number;
  currentAmount: number;
  contributorCount: number;
  contributors?: Array<{ id: string; initials: string; }>;
  daysUntilBirthday: number;
  isExpired?: boolean;
  isFullyFunded?: boolean;
  onContribute: () => void;
  onViewDetails?: () => void;
}
```

**Accessibility**:
- Card wrapper: `role="article"`, `aria-label="Emma's Dreamboard, Nintendo Switch, 75% funded"`
- Image alt: `alt="Emma, age 7, profile photo"`
- Button: `aria-label="Contribute to Emma's Dreamboard"`
- Progress bar: `aria-valuenow={75}`, `aria-valuemin={0}`, `aria-valuemax={100}`

---

### 2. Dreamboard Image
**Purpose**: Displays child's photo in circular crop format. Handles image loading, fallback, and lazy-loading.

**File Path**: `src/components/dream-board/DreamBoardImage.tsx`

**Visual Specification**:
- Dimensions: 100% width of card, aspect-ratio: 1/1 (square)
- Border-radius: 12px 12px 0 0 (rounded top, matching card)
- Object-fit: cover (crop image to fill container)
- Object-position: center (center image)

**Image Loading States**:
- Loading (skeleton): Gradient pulse, same dimensions as final image
- Loaded: Fade-in animation, 300ms ease-out
- Error: Fallback gradient background

**Fallback Design** (if image fails to load):
- Background: Gradient from `#0D9488` to `#6B9E88` (teal to sage)
- Icon: 🎁 emoji, 64px, centered, white overlay at 50% opacity
- Text: "Photo unavailable" (Outfit 400, 12px, white, centered below emoji)

**Next.js Image Integration**:
```tsx
<Image
  src={giftImage}
  alt={`${childName}'s dream gift image`}
  width={400}
  height={400}
  priority={false} // Lazy load
  onLoadingComplete={() => setIsLoaded(true)}
  className="w-full aspect-square object-cover"
/>
```

**Responsive Sizes** (Next.js optimization):
- Small (mobile): 300px
- Medium (tablet): 400px
- Large (desktop): 450px
- Srcset generated automatically for 1x and 2x DPI

**Props Interface**:
```tsx
interface DreamBoardImageProps {
  src: string;
  alt: string;
  childName: string;
  onLoadComplete?: () => void;
  priority?: boolean;
  rounded?: boolean; // Default: true
}
```

---

### 3. Progress Bar
**Purpose**: Visual indicator of funding progress toward goal.

**File Path**: `src/components/dream-board/ProgressBar.tsx`

**Visual Specification**:
- Dimensions: 100% width of parent, height: 8px, border-radius: 4px
- Background: `#E7E5E4` (light border, unfilled section)
- Filled portion (animated):
  - Gradient: Linear left-to-right, from `#0D9488` (teal) to `#6B9E88` (sage)
  - Width: Percentage of target amount (e.g., 75%)
  - Animation: Width transitions smoothly on amount change, 600ms ease-out

**Shine Effect** (subtle, moving reflection):
- Positioned absolutely over filled portion
- Gradient: `linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)`
- Animation: Slides left-to-right infinitely, 2s ease-in-out
- Opacity: 0.5 (subtle, not distracting)

**Label** (below bar):
- Font: Outfit 500, 12px, `#0D9488` (teal)
- Format: "75% funded" or "R3,750 of R5,000"
- Text-align: right or center
- Margin-top: 4px

**States**:
| State | Width | Fill Color | Label |
|-------|-------|-----------|--------|
| 0-50% | 0-50% | Teal gradient | "X% funded" |
| 50-99% | 50-99% | Sage gradient | "X% funded" |
| 100%+ | 100% | `#059669` (success green) | "Fully funded!" |

**Animation CSS**:
```css
.progress-bar-fill {
  transition: width 600ms cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-bar-shine {
  animation: shine 2s ease-in-out infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(100%); }
  100% { transform: translateX(100%); }
}
```

**Props Interface**:
```tsx
interface ProgressBarProps {
  currentAmount: number;
  targetAmount: number;
  showLabel?: boolean; // Default: true
  labelFormat?: "percentage" | "currency"; // Default: "percentage"
  animated?: boolean; // Default: true
  currency?: string; // Default: "R"
}
```

**Accessibility**:
- Role: `role="progressbar"`
- Aria attributes: `aria-valuenow={75}`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-label="75% funded"`
- Label included in aria-label for screen readers

---

### 4. Contributor Chips
**Purpose**: Display overlapping avatar circles for contributors, with "+N more" badge if exceeds visible count.

**File Path**: `src/components/dream-board/ContributorChips.tsx`

**Visual Specification**:
- Layout: Horizontal row, avatars overlapped (20px overlap)
- Avatar size: 32px × 32px (small), or 40px × 40px (medium)
- Avatar styling:
  - Border-radius: 50% (circle)
  - Background: Gradient from primary teal to sage (`linear-gradient(135deg, #0D9488, #6B9E88)`)
  - Text: White, Outfit 600, 12px (initials), centered
  - Border: 2px solid `#FFFFFF` (separates from background)

**Avatar Content**:
- Initials (1-2 characters) centered in circle
- Font: Outfit 600, 12px, color: white
- Example: "JD" (John Doe)

**Overflow Badge** (if > max visible):
- Position: Last visible avatar slot or separate badge
- Format: "+5 more"
- Font: Outfit 600, 12px, color: `#57534E`
- Background: `#EFEFED` (light gray)
- Border: 2px solid `#FFFFFF`
- Cursor: pointer (click to expand full list)
- Hover: Background `#E7E5E4`, cursor: pointer

**Animation**:
- Staggered entry: Each avatar appears with delay (0.1s increments), fade-in + scale (0.8 to 1.0)
- Hover (on container): Avatars separate slightly (reduce overlap), subtle elevation

**Props Interface**:
```tsx
interface ContributorChipsProps {
  contributors: Array<{
    id: string;
    name: string;
    initials: string;
    avatar?: string; // Image URL (optional)
  }>;
  maxVisible?: number; // Default: 5
  size?: "small" | "medium"; // Default: "small"
  onShowMore?: () => void;
  interactive?: boolean; // Default: true
}
```

**Accessibility**:
- Aria label: `aria-label="Contributors: John Doe, Jane Smith, and 3 others"`
- Tooltip on hover (per avatar): "John Doe"
- "+N more" button: `role="button"`, `aria-label="View all contributors"`

---

### 5. Contributor List
**Purpose**: Full-screen or modal view of all contributors with their contributions and messages.

**File Path**: `src/components/dream-board/ContributorList.tsx`

**Visual Specification**:
- Layout: Stacked vertical list, each item is a card
- Card dimensions: 100% width of container, auto-height
- Padding: 16px 24px (desktop), 12px 16px (mobile)
- Border-bottom: 1px solid `#E7E5E4` (divider between items)
- Background: `#FFFFFF`, alternating rows `#FAFAF9` for visual rhythm

**Contributor Item** (per card):
- Flexbox row, align-items: flex-start

**Left Section**:
- Avatar: 40px × 40px circle, initials, gradient background
- Margin-right: 16px

**Middle Section** (flex-grow):
- Contributor name: Outfit 600, 14px, `#1C1917`
- Contribution message (if present): Outfit 400, 13px, `#57534E`, margin-top: 4px, italic, max-width: 80%
- Date contributed: Outfit 400, 12px, `#A8A29E`, margin-top: 4px

**Right Section**:
- Amount contributed: Outfit 600, 14px, `#0D9488`, text-align: right
- Icon: ❤️ emoji (red heart), 16px, margin-left: 8px

**Empty State**:
- Text: "No contributors yet. Be the first to contribute!" (Outfit 400, 14px, `#57534E`, centered)
- Padding: 48px 24px

**Props Interface**:
```tsx
interface ContributorListProps {
  contributors: Array<{
    id: string;
    name: string;
    initials: string;
    amount: number;
    message?: string;
    dateContributed: string; // ISO date
  }>;
  totalContributions?: number;
}
```

**Sorting**:
- Default: Most recent contributions first (newest at top)
- Optional: Sort by amount (highest first)

---

## Component Architecture Patterns

### 1. State Management
- **Provider Pattern**: Wrap app with contexts (AuthContext, DreamBoardContext, NotificationContext)
- **Custom Hooks**: `useContribution`, `useDreamBoard`, `usePayment` for encapsulated logic
- **Server State**: Use React Query or SWR for API data fetching with caching

### 2. Error Boundaries
- Wrap form sections and card grids with error boundary component
- File: `src/components/ui/ErrorBoundary.tsx`
- Fallback UI: Friendly error card with "Try again" button
- Log errors to error tracking (e.g., Sentry)

### 3. Loading Fallbacks
- Skeleton screens for all async components
- Suspense boundaries for code splitting
- Transitional UI during form submission

### 4. Responsive Design Utilities
- Custom hook: `useMediaQuery(query: string)` for responsive rendering
- Tailwind breakpoints: xs (320px), sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile-first CSS: Start with mobile styles, add desktop with `@media (min-width: ...)`

### 5. Testing Standards
- Unit tests for all form components (validation, submission)
- Integration tests for flows (contribution form → payment → confirmation)
- Accessibility tests using `axe-core` or `jest-axe`
- Visual regression tests using Chromatic or Percy

---

## File Summary
- `src/components/layout/Header.tsx` — App header with navigation
- `src/components/landing/LandingNav.tsx` — Landing page navigation
- `src/components/landing/MobileNav.tsx` — Mobile drawer menu
- `src/components/layout/Footer.tsx` — Universal footer
- `src/components/layout/CreateFlowShell.tsx` — Multi-step wizard wrapper
- `src/components/layout/WizardStepIndicator.tsx` — Step progress component
- `src/components/ui/skeleton.tsx` — Skeleton loading states (variants)
- `src/components/ui/empty-state.tsx` — Empty state card
- `src/components/ui/state-card.tsx` — Error/warning/success card
- `src/components/effects/PaymentOverlay.tsx` — Payment processing overlay
- `src/components/ui/toast.tsx` — Toast notification system
- `src/components/forms/AmountSelector.tsx` — Amount selection UI
- `src/components/forms/PaymentMethodSelector.tsx` — Payment method radio cards
- `src/components/forms/ContributionForm.tsx` — Full contribution flow
- `src/components/dream-board/DreamBoardCard.tsx` — Dreamboard display card
- `src/components/dream-board/DreamBoardImage.tsx` — Image with fallback
- `src/components/dream-board/ProgressBar.tsx` — Funding progress visualization
- `src/components/dream-board/ContributorChips.tsx` — Overlapping avatars
- `src/components/dream-board/ContributorList.tsx` — Full contributor view

---

**Cross-Reference**: See `00-DESIGN-SYSTEM.md` for color tokens, typography scales, animation definitions, and component library integration (Radix UI, Shadcn, etc.).

**Next Steps**: Implement components in order of dependency (shared utilities first), write Storybook stories, and conduct accessibility audit before deployment.

---

*Document Version: 1.1 | Last Updated: 2026-02-11 | Runtime-aligned with inventory corrections*
