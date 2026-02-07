# Authentication UI Specification (02-AUTHENTICATION.md)

**Version:** 2.0
**Last Updated:** February 2026
**Status:** Implementation-Ready
**Target:** AI Coding Agent Implementation
**Auth Provider:** Clerk (https://clerk.com)

---

## Table of Contents

1. [Authentication Overview](#authentication-overview)
2. [Sign Up Screen Specification](#sign-up-screen-specification)
3. [Sign In Screen Specification](#sign-in-screen-specification)
4. [Post-Auth User Experience](#post-auth-user-experience)
5. [Header States (Signed Out / Signed In)](#header-states)
6. [Route Protection & Middleware](#route-protection--middleware)
7. [Legacy Route Handling](#legacy-route-handling)
8. [Session Management](#session-management)
9. [TypeScript Interfaces & Types](#typescript-interfaces--types)
10. [File Structure](#file-structure)
11. [Clerk Configuration](#clerk-configuration)
12. [Error Handling](#error-handling)
13. [Accessibility](#accessibility)
14. [Edge Cases](#edge-cases)

---

## Authentication Overview

### Architecture

Gifta uses **Clerk** for user authentication and session management. Clerk provides:
- Pre-built Sign In/Sign Up components
- OAuth integrations (Google, Apple, etc.)
- Email/password authentication
- Session tokens (httpOnly cookies)
- User profile management via UserButton component

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ VISITOR LANDS ON GIFTA                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  No session?                                                     │
│  ├─ Landing page (/) visible → accessible without auth          │
│  ├─ /sign-up → Clerk SignUp component                           │
│  ├─ /sign-in → Clerk SignIn component                           │
│  └─ /dashboard → Redirects to /sign-in                          │
│                                                                   │
│  Session exists?                                                 │
│  ├─ / → Landing page visible (optional signed-in header)        │
│  ├─ /sign-up → Redirects to /dashboard                          │
│  ├─ /sign-in → Redirects to /dashboard                          │
│  ├─ /dashboard → Loads user dashboard                           │
│  ├─ /create/child → Board creation flow                         │
│  └─ /board/[id] → Public dreamboard view                        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Seamless signup** – Minimal friction, 2-3 steps
2. **Social login ready** – Google, Apple, Facebook optional
3. **Branded styling** – Clerk components themed to match Gifta
4. **Clear error states** – User-friendly validation messages
5. **Session persistence** – httpOnly cookies, automatic refresh

---

## Sign Up Screen Specification

### Route & Purpose

- **Route:** `/sign-up`
- **Purpose:** User registration and account creation
- **Clerk component:** `<SignUp />`
- **Redirect on success:** `/dashboard` (or `/create/child` if first-time user)

### Screen Layout (Desktop & Mobile)

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│ ╔════════════════════════════════════════════════════════════╗ │
│ ║ SIGN UP PAGE                                               ║ │
│ ║                                                             ║ │
│ ║  🎁 Gifta                                                  ║ │
│ ║                                                             ║ │
│ ║  "Create Your Birthday Gift Account"                       ║ │
│ ║  "In just a few minutes, start pooling gifts."             ║ │
│ ║                                                             ║ │
│ ║  [Clerk SignUp Component]                                  ║ │
│ ║  ├─ Email input field                                      ║ │
│ ║  ├─ Password input field                                   ║ │
│ ║  ├─ Confirm password input field                           ║ │
│ ║  ├─ Sign up button                                         ║ │
│ ║  ├─ OR separator                                           ║ │
│ ║  ├─ Google OAuth button                                    ║ │
│ ║  ├─ Apple OAuth button (if on iOS/macOS)                   ║ │
│ ║  └─ "Already have an account? Sign in" link                ║ │
│ ║                                                             ║ │
│ ║  [Clerk verification/phone optional]                       ║ │
│ ║  ├─ Email verification code input (if required)            ║ │
│ ║  ├─ Verify button                                          ║ │
│ ║  └─ "Didn't receive code? Resend" link                     ║ │
│ ║                                                             ║ │
│ ║  [Trust info]                                              ║ │
│ ║  "Your data is secure and private. See our Privacy Policy" ║ │
│ ║                                                             ║ │
│ ╚════════════════════════════════════════════════════════════╝ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Page Container

**Overall layout:**
- **Background:** `#FFFCF9` (warm off-white, same as landing)
- **Min height:** `min-h-screen` (full viewport)
- **Display:** `flex flex-col items-center justify-center`
- **Padding:** `px-4 py-8 md:px-6 md:py-12 lg:px-8` (responsive padding)
- **Font family:** `font-sans` (DM Sans for body)

**Warm ambient gradients (decorative):**
```tsx
<div className="absolute inset-0 pointer-events-none">
  <div className="absolute w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(248,220,180,0.08)_0%,transparent_70%)] -top-[100px] left-[10%]" />
  <div className="absolute w-[250px] h-[250px] bg-[radial-gradient(circle,rgba(220,190,160,0.06)_0%,transparent_70%)] -bottom-[50px] -right-[30px]" />
</div>
```

### Header Section

**Logo & branding:**
- **Container:** Centered, `mb-6 md:mb-8` (24px/32px margin bottom)
- **Logo:**
  - **Icon:** 🎁 (emoji or SVG)
  - **Text:** "Gifta"
  - **Font family:** Nunito, bold
  - **Size:** 28px (desktop), 24px (mobile)
  - **Link:** Navigate to `/` on click (home)
  - **Display:** `flex items-center gap-2`

**Headline:**
- **Text:** "Create Your Birthday Gift Account"
- **Font family:** DM Serif Display
- **Font weight:** Medium (500)
- **Size:** 36px (desktop), 28px (mobile)
- **Color:** `#2D2D2D`
- **Margin bottom:** `mb-2` (8px)
- **Text align:** center

**Subheading:**
- **Text:** "In just a few minutes, start pooling gifts."
- **Font family:** DM Sans
- **Font size:** 17px (desktop), 15px (mobile)
- **Color:** `#666`
- **Margin bottom:** `mb-8 md:mb-10` (32px/40px)
- **Text align:** center
- **Line height:** 1.6

### Clerk SignUp Component

**Configuration (via Clerk props):**
```tsx
<SignUp
  appearance={{
    elements: {
      rootBox: "w-full max-w-[450px] mx-auto",
      card: "shadow-[0_16px_48px_rgba(0,0,0,0.08)] border border-black/[0.04] rounded-2xl",
      headerTitle: "text-[28px] font-semibold text-[#2D2D2D] font-dm-serif",
      headerSubtitle: "text-[14px] text-[#666]",
      formFieldLabel: "text-[14px] font-medium text-[#333]",
      formFieldInput: "border border-[#DDD] rounded-[10px] px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30",
      formButtonPrimary: "bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white font-semibold px-6 py-3 rounded-[10px] hover:-translate-y-0.5 transition-all",
      dividerLine: "bg-[#EEE]",
      dividerText: "text-[14px] text-[#999]",
      socialButtonsBlockButton: "border border-[#DDD] rounded-[10px] py-3 text-[#333] font-medium hover:bg-[#F9F9F9]",
      footerActionLink: "text-[#0D9488] font-medium hover:text-[#5A8E78]",
      validationElementText: "text-red-600 text-[13px]",
      formResendCodeLink: "text-[#0D9488] font-medium hover:text-[#5A8E78]",
    },
    variables: {
      colorPrimary: "#0D9488",
      colorText: "#2D2D2D",
      colorTextSecondary: "#666",
      colorBackground: "#FFFCF9",
      colorInputBackground: "#FFFFFF",
      colorInputBorder: "#DDD",
      borderRadius: "10px",
      fontFamilyBody: "var(--font-dm-sans)",
      fontFamilyButtons: "var(--font-dm-sans)",
    },
  }}
  signInUrl="/sign-in"
  afterSignUpUrl="/dashboard"
  redirectUrl={getRedirectUrl()}
/>
```

**Form fields (rendered by Clerk):**
1. **Email address:**
   - Label: "Email address"
   - Type: `email`
   - Placeholder: "your@email.com"
   - Required: Yes
   - Validation: Valid email format
   - Error message: "Please enter a valid email address"

2. **Password:**
   - Label: "Password"
   - Type: `password`
   - Placeholder: "••••••••"
   - Required: Yes
   - Min length: 8 characters
   - Requirements: Upper + lower + number (Clerk default)
   - Error message: "Password must be at least 8 characters with uppercase, lowercase, and number"

3. **Confirm password:**
   - Label: "Confirm password"
   - Type: `password`
   - Placeholder: "••••••••"
   - Required: Yes
   - Validation: Must match password field
   - Error message: "Passwords do not match"

**Buttons:**
- **Primary CTA (Sign Up):**
  - Background: `gradient-to-br from-[#6B9E88] to-[#5A8E78]`
  - Text: White, semibold
  - Padding: `px-6 py-3` (24px, 12px)
  - Border radius: `rounded-[10px]`
  - Width: `w-full`
  - Disabled state: Opacity 60%, cursor not-allowed
  - Hover: `-translate-y-0.5` lift + shadow increase
  - Loading state: Spinner icon, text: "Creating account..."

- **Divider (OR):**
  - Text: "or" centered
  - Color: `#999`
  - Font size: 14px

- **Social OAuth buttons:**
  - Background: White with `border border-[#DDD]`
  - Padding: `px-4 py-3` (16px, 12px)
  - Border radius: `rounded-[10px]`
  - Width: `w-full`
  - Icon + text: "Continue with Google", "Continue with Apple"
  - Color: `#333`
  - Hover: `bg-[#F9F9F9]`
  - Order: Google first, Apple second (if available)

- **Sign In link:**
  - Text: "Already have an account? Sign in"
  - Color: `#0D9488` (primary teal)
  - Hover: `#5A8E78` (darker teal)
  - Font weight: medium
  - No underline

**Verification step (if email verification enabled):**
- Input: Code field (6-digit code)
- Label: "Enter the verification code sent to your email"
- Placeholder: "000000"
- Resend link: "Didn't receive a code? Resend"
- Verify button: Same styling as primary CTA

### Trust & Security Footer

**Container:**
- **Margin top:** `mt-8` (32px)
- **Text align:** center
- **Font size:** 13px
- **Color:** `#999`

**Content:**
```
"Your data is secure and private.
See our Privacy Policy and Terms of Service"
```

**Links:**
- Privacy Policy → `/privacy`
- Terms of Service → `/terms`
- Link color: `#0D9488`
- Hover: `#5A8E78`

---

## Sign In Screen Specification

### Route & Purpose

- **Route:** `/sign-in`
- **Purpose:** User login / session creation
- **Clerk component:** `<SignIn />`
- **Redirect on success:** `/dashboard` (or previous route if deep-linked)

### Screen Layout

```
┌────────────────────────────────────────────────────────────────┐
│                                                                 │
│ ╔════════════════════════════════════════════════════════════╗ │
│ ║ SIGN IN PAGE                                               ║ │
│ ║                                                             ║ │
│ ║  🎁 Gifta                                                  ║ │
│ ║                                                             ║ │
│ ║  "Welcome Back"                                            ║ │
│ ║  "Sign in to access your Dreamboards."                     ║ │
│ ║                                                             ║ │
│ ║  [Clerk SignIn Component]                                  ║ │
│ ║  ├─ Email input field                                      ║ │
│ ║  ├─ Password input field (with "Forgot?" link)             ║ │
│ ║  ├─ Sign in button                                         ║ │
│ ║  ├─ "Remember me" checkbox (optional)                      ║ │
│ ║  ├─ OR separator                                           ║ │
│ ║  ├─ Google OAuth button                                    ║ │
│ ║  ├─ Apple OAuth button (if on iOS/macOS)                   ║ │
│ ║  └─ "Don't have an account? Sign up" link                  ║ │
│ ║                                                             ║ │
│ ║  [Trust info]                                              ║ │
│ ║  "Your data is secure and private. See our Privacy Policy" ║ │
│ ║                                                             ║ │
│ ╚════════════════════════════════════════════════════════════╝ │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

### Page Structure

**Layout:** Identical to Sign Up (centered card, warm background)

**Header section:**
- **Logo:** Same as Sign Up (🎁 Gifta, centered)
- **Headline:** "Welcome Back"
  - Font: DM Serif Display, 36px (desktop), 28px (mobile)
  - Color: `#2D2D2D`
  - Margin: `mb-2`
- **Subheading:** "Sign in to access your Dreamboards."
  - Font: DM Sans, 17px (desktop), 15px (mobile)
  - Color: `#666`
  - Margin: `mb-8 md:mb-10`

### Clerk SignIn Component

**Configuration:**
```tsx
<SignIn
  appearance={{
    elements: {
      rootBox: "w-full max-w-[450px] mx-auto",
      card: "shadow-[0_16px_48px_rgba(0,0,0,0.08)] border border-black/[0.04] rounded-2xl",
      headerTitle: "text-[24px] font-semibold text-[#2D2D2D] font-dm-serif",
      headerSubtitle: "text-[14px] text-[#666]",
      formFieldLabel: "text-[14px] font-medium text-[#333]",
      formFieldInput: "border border-[#DDD] rounded-[10px] px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30",
      formButtonPrimary: "bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white font-semibold px-6 py-3 rounded-[10px] hover:-translate-y-0.5 transition-all",
      dividerLine: "bg-[#EEE]",
      dividerText: "text-[14px] text-[#999]",
      socialButtonsBlockButton: "border border-[#DDD] rounded-[10px] py-3 text-[#333] font-medium hover:bg-[#F9F9F9]",
      formResendCodeLink: "text-[#0D9488] font-medium hover:text-[#5A8E78]",
      footerActionLink: "text-[#0D9488] font-medium hover:text-[#5A8E78]",
    },
    variables: {
      colorPrimary: "#0D9488",
      colorText: "#2D2D2D",
      colorTextSecondary: "#666",
      colorBackground: "#FFFCF9",
      colorInputBackground: "#FFFFFF",
      colorInputBorder: "#DDD",
      borderRadius: "10px",
      fontFamilyBody: "var(--font-dm-sans)",
      fontFamilyButtons: "var(--font-dm-sans)",
    },
  }}
  signUpUrl="/sign-up"
  afterSignInUrl="/dashboard"
  redirectUrl={getRedirectUrl()}
/>
```

**Form fields (rendered by Clerk):**

1. **Email address:**
   - Label: "Email address"
   - Type: `email`
   - Placeholder: "your@email.com"
   - Required: Yes
   - Autofocus: Yes (first field)
   - Validation: Valid email format
   - Error message: "Email not found"

2. **Password:**
   - Label: "Password"
   - Type: `password`
   - Placeholder: "••••••••"
   - Required: Yes
   - Autocomplete: `current-password` (browser integration)
   - Error message: "Incorrect password"

3. **Forgot password link:**
   - Text: "Forgot password?"
   - Position: Right-aligned below password input
   - Color: `#0D9488`
   - Hover: `#5A8E78`
   - Link: `/forgot-password` (Clerk-handled)

4. **Remember me checkbox (optional):**
   - Label: "Remember me"
   - Checked: False by default
   - Font size: 14px
   - Color: `#666`

**Buttons:**
- **Primary CTA (Sign In):**
  - Same styling as Sign Up button
  - Text: "Sign in"
  - Loading state: "Signing in..."

- **Social OAuth buttons:**
  - Same as Sign Up (Google, Apple)

- **Sign Up link:**
  - Text: "Don't have an account? Sign up"
  - Color: `#0D9488`
  - Hover: `#5A8E78`

### Trust Footer

Same as Sign Up section.

---

## Post-Auth User Experience

### Successful Sign Up / Sign In

**Flow:**
```
User clicks "Sign Up" / "Sign In"
    ↓
Valid credentials submitted to Clerk
    ↓
Clerk returns session token (httpOnly cookie)
    ↓
User redirected to:
  - `/dashboard` (if returning user with existing boards)
  - `/create/child` (if first-time user, no boards yet)
  - Previous page (if deep-linked)
```

**Session creation:**
- **Cookie:** `__session` (httpOnly, Secure, SameSite=Strict)
- **Duration:** 1 week (default Clerk)
- **Automatic refresh:** Handled by Clerk middleware
- **Stored location:** httpOnly (not accessible via JavaScript)

### Post-Auth Header Update

**Before authentication:**
- Landing page: Logo + nav links + [Create] button + [Login] button

**After authentication:**
- All pages: Logo + nav links + [Create] button + **UserButton**

**UserButton (Clerk component):**
```tsx
import { UserButton } from "@clerk/nextjs";

export function AuthenticatedHeader() {
  return (
    <header>
      {/* Logo & nav */}
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-10 w-10 rounded-full border-2 border-[#0D9488]",
            userButtonPopoverCard: "shadow-[0_16px_48px_rgba(0,0,0,0.08)] border border-black/[0.04] rounded-2xl",
            userPreviewMainIdentifier: "font-semibold text-[#2D2D2D]",
            userButtonTrigger: "transition-all hover:scale-105",
          },
        }}
      />
    </header>
  );
}
```

**UserButton menu:**
- **Avatar:** User profile photo (circular, 40x40px)
- **Dropdown menu items:**
  1. **Profile**
     - Icon: 👤
     - Text: "Manage account"
     - Link: Clerk-managed profile page
  2. **My Dreamboards**
     - Icon: 🎁
     - Text: "My Dreamboards"
     - Link: `/dashboard`
  3. **Settings**
     - Icon: ⚙️
     - Text: "Settings"
     - Link: Clerk-managed settings page
  4. **Sign out**
     - Icon: 🚪
     - Text: "Sign out"
     - Action: Clears session + redirects to `/`

### Profile Requirement (First-Time Setup)

**After first sign-up, user may need to complete:**
- Name (first + last)
- Profile photo (optional)
- Birthdate (for age calculation, optional)

**Where:** Clerk profile completion modal (auto-triggered) or `/create/child` form

---

## Header States

### Unsigned Header (Landing & Public Pages)

**Navigation bar layout:**
```
[🎁 Gifta]  [How it works] [Trust & safety]  [Create] [Login]
```

**States:**
- **Logo:** Always visible, links to `/`
- **Nav links:** Desktop only (`lg:flex`)
- **Create button (Primary):**
  - Link: `/create`
  - Style: Teal gradient, white text
  - Hover: Lift + shadow
- **Login button (Secondary):**
  - Link: `/sign-in`
  - Style: White bg, teal border + text
  - Hover: Teal bg, white text
- **Mobile:** Hamburger menu expands to show all links

### Signed-In Header (All Pages)

**Navigation bar layout:**
```
[🎁 Gifta]  [Dashboard] [Create]  [UserButton with avatar]
```

**States:**
- **Logo:** Always visible, links to `/`
- **Dashboard link:**
  - Text: "My Boards" or icon
  - Link: `/dashboard`
  - Active state: Text color `#0D9488`
- **Create button (Primary):**
  - Link: `/create`
  - Visible, same styling as unsigned
- **UserButton:**
  - Avatar: User photo (40x40px, circular, bordered)
  - Click: Dropdown menu with profile, settings, sign out
  - Color: Border `#0D9488`
- **Mobile:** Hamburger menu, same structure

---

## Route Protection & Middleware

### Protected Routes (Require Authentication)

```typescript
// Routes that require logged-in user
const protectedRoutes = [
  '/dashboard',
  '/create',
  '/create/child',
  '/create/gift',
  '/board/:id/edit',
  '/board/:id/manage',
  '/account',
  '/account/settings',
  '/account/payment',
];
```

**Middleware behavior:**
```typescript
import { auth } from "@clerk/nextjs/server";

export async function middleware(request: NextRequest) {
  const { userId } = await auth();

  // If user not authenticated and trying to access protected route
  if (!userId && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL(`/sign-in?redirect_url=${pathname}`, request.url));
  }

  // If authenticated user tries to access auth page
  if (userId && ['/sign-in', '/sign-up'].includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/(api|trpc)(.*)'],
};
```

**Implementation:**
- File: `src/middleware.ts`
- Uses Clerk's `auth()` helper to check session
- Redirects unauthenticated users to `/sign-in` with `redirect_url` param
- Redirects authenticated users away from `/sign-in` and `/sign-up`

### Public Routes (No Authentication Required)

```typescript
const publicRoutes = [
  '/',                        // Landing page
  '/sign-up',                // Sign up
  '/sign-in',                // Sign in
  '/forgot-password',        // Password reset
  '/board/:id',              // Public dreamboard view
  '/privacy',                // Legal pages
  '/terms',
  '/popia',
  '/contact',
  '/help',
];
```

**Behavior:**
- No redirect
- User can browse with or without session
- If authenticated, header shows signed-in version
- If not authenticated, header shows sign-up/login options

### Guest Access (Limited)

**Public dreamboard viewing:**
- Route: `/board/:id` (dynamic route)
- Authentication: None required
- Viewing: See child name, gift, progress, contributors
- Interaction: Can "Chip in" button (links to `/sign-up?board=:id` or checkout)
- No editing permissions

---

## Legacy Route Handling

### Migration from Old Auth System

**Old login routes (deprecated):**
```
/auth/login          → redirect to /sign-in
/auth/signup         → redirect to /sign-up
/auth/verify         → friendly message + redirect
/auth/forgot         → redirect to /forgot-password
```

**Implementation:**
```typescript
// src/app/auth/[[...path]]/route.ts or page.tsx

export default function AuthRedirectPage({ params }) {
  const path = params?.path?.[0];

  if (path === 'login') {
    redirect('/sign-in');
  } else if (path === 'signup') {
    redirect('/sign-up');
  } else if (path === 'verify') {
    return <VerifyOldSystemMessage />;
  } else if (path === 'forgot') {
    redirect('/forgot-password');
  } else {
    redirect('/');
  }
}
```

### Old Verification Page Message

**Route:** `/auth/verify`
**Content:**
```
┌─────────────────────────────────────────┐
│  Email Verification                     │
│                                          │
│  Thank you for signing up!              │
│                                          │
│  Your email is now verified. You can    │
│  proceed to create your first           │
│  Dreamboard or access your dashboard.   │
│                                          │
│  [Continue to Dashboard]                │
│  [Create a Dreamboard]                  │
└─────────────────────────────────────────┘
```

**Button links:**
- Dashboard: `/dashboard`
- Create: `/create/child`

### Cookie Cleanup

**Old session cookie:** `chipin_session` (from legacy system)

**Cleanup script (runs on successful Clerk auth):**
```typescript
export async function cleanupLegacyCookies() {
  // Delete old Chipin session cookie
  document.cookie = 'chipin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';

  // Clear old localStorage keys
  localStorage.removeItem('chipin_user');
  localStorage.removeItem('chipin_token');
  sessionStorage.clear();
}

// Call in sign-in success handler
useEffect(() => {
  if (isSignedIn) {
    cleanupLegacyCookies();
  }
}, [isSignedIn]);
```

---

## Session Management

### Session Lifecycle

**Creation:**
1. User submits credentials to Clerk
2. Clerk verifies and creates session
3. Session token stored in httpOnly cookie `__session`
4. User redirected to authenticated route
5. Clerk middleware validates session on each request

**Maintenance:**
- **Duration:** 1 week (7 days)
- **Auto-refresh:** Clerk SDK refreshes token before expiry
- **Inactivity timeout:** 30 minutes (customizable)

**Destruction (Sign Out):**
1. User clicks "Sign out" in UserButton menu
2. Clerk clears session cookie
3. Local state cleared
4. User redirected to `/` (home)
5. `afterSignOutUrl` configured as `/`

**Implementation:**
```typescript
export async function signOut() {
  await auth.signOut({
    redirectUrl: '/',
  });

  // Cleanup legacy data
  cleanupLegacyCookies();
}
```

### Token Refresh

**Automatic token refresh:**
- Clerk SDK monitors token expiry
- Refreshes token in background ~5 minutes before expiry
- No user interruption required
- Uses `useAuth()` hook to trigger refresh

**Manual token access (if needed):**
```typescript
import { auth } from "@clerk/nextjs/server";

export async function getAuthToken() {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });
  return token;
}
```

### Session Validation

**Server-side validation (API routes):**
```typescript
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Process authenticated request
}
```

**Client-side validation:**
```typescript
import { useAuth } from "@clerk/nextjs";

export function ProtectedComponent() {
  const { isSignedIn, userId } = useAuth();

  if (!isSignedIn) {
    return <div>Please sign in first</div>;
  }

  return <div>Welcome, {userId}!</div>;
}
```

---

## TypeScript Interfaces & Types

```typescript
// ============================================
// Clerk Auth Interfaces
// ============================================

interface ClerkUser {
  id: string;
  emailAddresses: EmailAddress[];
  phoneNumbers: PhoneNumber[];
  profileImageUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClerkSession {
  id: string;
  userId: string;
  status: 'active' | 'abandoned' | 'expired' | 'removed' | 'replaced' | 'ended';
  lastActiveAt: Date;
  expireAt: Date;
  abandonAt: Date;
}

interface EmailAddress {
  id: string;
  emailAddress: string;
  verification: {
    status: 'verified' | 'unverified' | 'failed' | 'expired';
    strategy: 'email_code' | 'email_link' | 'saml' | 'oauth_google';
    attempts: number;
    expireAt: Date;
  };
  linkedTo: object[];
  createdAt: Date;
  updatedAt: Date;
}

interface PhoneNumber {
  id: string;
  phoneNumber: string;
  reserved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Sign Up / Sign In Component Props
// ============================================

interface SignUpProps {
  appearance?: Appearance;
  signInUrl?: string;
  afterSignUpUrl?: string;
  redirectUrl?: string;
  routing?: 'path' | 'hash' | 'virtual';
  path?: string;
}

interface SignInProps {
  appearance?: Appearance;
  signUpUrl?: string;
  afterSignInUrl?: string;
  redirectUrl?: string;
  routing?: 'path' | 'hash' | 'virtual';
  path?: string;
}

interface Appearance {
  baseTheme?: 'light' | 'dark';
  elements?: Record<string, string>;
  variables?: Record<string, string>;
}

// ============================================
// Auth Context / Hooks
// ============================================

interface AuthContextType {
  isSignedIn: boolean;
  user: ClerkUser | null | undefined;
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  orgId: string | null | undefined;
  orgRole: string | null | undefined;
  orgSlug: string | null | undefined;
  getToken: (options?: GetTokenOptions) => Promise<string | null>;
  signOut: (options?: SignOutOptions) => Promise<void>;
}

interface GetTokenOptions {
  template?: string;
  leewayInSeconds?: number;
  skipCache?: boolean;
}

interface SignOutOptions {
  redirectUrl?: string;
}

// ============================================
// Post-Auth Redirect Logic
// ============================================

interface PostAuthRedirectConfig {
  isFirstTimeUser: boolean;
  hasExistingBoards: boolean;
  deepLinkPath?: string;
}

type PostAuthRedirectDestination =
  | '/dashboard'
  | '/create/child'
  | string; // custom deep link

// ============================================
// Auth Page State
// ============================================

interface AuthPageState {
  isLoading: boolean;
  error: AuthError | null;
  step: 'email' | 'password' | 'verification' | 'complete';
  formData: {
    email: string;
    password: string;
    confirmPassword: string;
    verificationCode?: string;
  };
}

interface AuthError {
  code: string;
  message: string;
  statusCode: number;
}
```

---

## File Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-up/
│   │   │   └── page.tsx              (Sign up page with Clerk component)
│   │   ├── sign-in/
│   │   │   └── page.tsx              (Sign in page with Clerk component)
│   │   ├── forgot-password/
│   │   │   └── page.tsx              (Forgot password page)
│   │   └── layout.tsx                (Auth layout wrapper)
│   │
│   ├── auth/
│   │   └── [[...path]]/
│   │       └── page.tsx              (Legacy auth route redirects)
│   │
│   ├── (protected)/
│   │   ├── dashboard/
│   │   │   └── page.tsx              (Requires auth)
│   │   ├── create/
│   │   │   ├── child/
│   │   │   │   └── page.tsx          (Requires auth)
│   │   │   └── gift/
│   │   │       └── page.tsx          (Requires auth)
│   │   └── layout.tsx                (Protected layout)
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── me/
│   │   │   │   └── route.ts          (Get current user)
│   │   │   ├── refresh/
│   │   │   │   └── route.ts          (Refresh session)
│   │   │   └── logout/
│   │   │       └── route.ts          (Clear session)
│   │   └── webhooks/
│   │       └── clerk/
│   │           └── route.ts          (Clerk webhook handler)
│   │
│   ├── middleware.ts                  (Route protection logic)
│   └── layout.tsx                     (Root layout with ClerkProvider)
│
├── components/
│   ├── auth/
│   │   ├── SignUpForm.tsx            (Sign up page wrapper)
│   │   ├── SignInForm.tsx            (Sign in page wrapper)
│   │   ├── AuthHeader.tsx            (Signed in/out header)
│   │   ├── UserButton.tsx            (User menu button)
│   │   └── ProtectedRoute.tsx        (Route wrapper)
│   │
│   └── layout/
│       ├── Header.tsx                (Main app header)
│       └── Footer.tsx                (Main app footer)
│
├── lib/
│   ├── auth/
│   │   ├── clerk-config.ts           (Clerk configuration)
│   │   ├── clerk-wrappers.ts         (Helper functions)
│   │   ├── session.ts                (Session utils)
│   │   └── redirects.ts              (Post-auth redirect logic)
│   │
│   └── hooks/
│       ├── useAuth.ts                (Custom auth hook)
│       └── useProtectedRoute.ts      (Route protection hook)
│
├── env.example                        (Environment variables template)
├── .env.local                         (Environment secrets - gitignored)
└── tsconfig.json
```

---

## Clerk Configuration

### Environment Variables

**`.env.local` (never commit this):**
```bash
# Clerk API Keys (from Clerk Dashboard)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Clerk URLs (custom domain or Clerk-hosted)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/create/child

# Clerk Webhook Secret (for webhook verification)
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# App URLs
NEXT_PUBLIC_APP_URL=https://gifta.co.za
NEXT_PUBLIC_API_URL=https://api.gifta.co.za
```

### Root Layout Setup

**`src/app/layout.tsx`:**
```typescript
import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gifta - Birthday Gifting, Simplified',
  description: 'Pool contributions from friends and family toward one meaningful birthday gift.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Sign Up Page Implementation

**`src/app/(auth)/sign-up/page.tsx`:**
```typescript
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col items-center justify-center px-4 py-8 md:px-6 relative overflow-hidden">
      {/* Ambient gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(248,220,180,0.08)_0%,transparent_70%)] -top-[100px] left-[10%]" />
        <div className="absolute w-[250px] h-[250px] bg-[radial-gradient(circle,rgba(220,190,160,0.06)_0%,transparent_70%)] -bottom-[50px] -right-[30px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-3xl">🎁</span>
          <span className="text-2xl font-bold text-[#3D3D3D]" style={{ fontFamily: 'var(--font-nunito)' }}>
            Gifta
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2D2D2D] mb-2" style={{ fontFamily: 'var(--font-dm-serif)' }}>
          Create Your Account
        </h1>
        <p className="text-[#666] text-lg">In just a few minutes, start pooling gifts.</p>
      </div>

      {/* Clerk SignUp Component */}
      <div className="relative z-10 w-full max-w-[450px]">
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'shadow-[0_16px_48px_rgba(0,0,0,0.08)] border border-black/[0.04]',
              // ... additional styling
            },
          }}
          signInUrl="/sign-in"
          afterSignUpUrl="/dashboard"
        />
      </div>

      {/* Trust footer */}
      <p className="relative z-10 mt-8 text-center text-[13px] text-[#999]">
        Your data is secure. See our{' '}
        <a href="/privacy" className="text-[#0D9488] hover:text-[#5A8E78]">
          Privacy Policy
        </a>{' '}
        and{' '}
        <a href="/terms" className="text-[#0D9488] hover:text-[#5A8E78]">
          Terms of Service
        </a>
      </p>
    </div>
  );
}
```

### Sign In Page Implementation

**`src/app/(auth)/sign-in/page.tsx`:**
```typescript
import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#FFFCF9] flex flex-col items-center justify-center px-4 py-8 md:px-6 relative overflow-hidden">
      {/* Same structure as sign-up with SignIn component */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradients */}
      </div>

      <div className="relative z-10 mb-8 text-center">
        {/* Logo + header */}
      </div>

      <div className="relative z-10 w-full max-w-[450px]">
        <SignIn
          appearance={{
            elements: {
              // ... styling
            },
          }}
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />
      </div>

      {/* Trust footer */}
    </div>
  );
}
```

### Middleware Configuration

**`src/middleware.ts`:**
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/create(.*)',
  '/board(.*)/edit(.*)',
  '/board(.*)/manage(.*)',
  '/account(.*)',
]);

const isAuthRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // If user is not signed in and route is protected, redirect to sign-in
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // If user is signed in and accessing auth routes, redirect to dashboard
  if (userId && isAuthRoute(req)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|.*\\..*|api|static).*)', '/(api|trpc)(.*)'],
};
```

### Post-Auth Redirect Logic

**`src/lib/auth/redirects.ts`:**
```typescript
import { auth } from '@clerk/nextjs/server';

export async function getPostAuthRedirectUrl(): Promise<string> {
  const { userId } = await auth();

  if (!userId) {
    return '/';
  }

  try {
    // Check if user has existing boards
    const response = await fetch('/api/boards', {
      headers: {
        'Authorization': `Bearer ${await (await auth()).getToken()}`,
      },
    });

    if (response.ok) {
      const boards = await response.json();
      if (boards.length > 0) {
        return '/dashboard';
      }
    }
  } catch (error) {
    console.error('Failed to check existing boards:', error);
  }

  // First-time user: guide to board creation
  return '/create/child';
}
```

---

## Error Handling

### Sign Up Errors

**Email already exists:**
```
"That email address is already in use.
Did you mean to sign in instead?"
[Sign In button]
```

**Weak password:**
```
"Password must contain:
- At least 8 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number"
```

**Password mismatch:**
```
"Passwords do not match. Please try again."
```

**Network error:**
```
"Something went wrong. Please check your connection and try again.
[Retry button]"
```

### Sign In Errors

**User not found:**
```
"No account found with that email address.
Did you mean to sign up instead?
[Sign Up button]"
```

**Incorrect password:**
```
"Incorrect email or password. Please try again.
[Forgot Password?] link"
```

**Account locked (too many attempts):**
```
"Too many login attempts. Your account has been temporarily locked.
Please try again in 30 minutes or reset your password.
[Forgot Password?] link"
```

**Email not verified (if required):**
```
"Please verify your email address before signing in.
[Resend verification code] link"
```

### Error Styling

**Container:**
- Background: `#FEE2E2` (light red)
- Border: `border-l-4 border-[#DC2626]` (red left border)
- Padding: `p-4` (16px)
- Border radius: `rounded-lg`
- Margin: `mb-4` (16px bottom)

**Text:**
- Color: `#7F1D1D` (dark red)
- Font size: 14px
- Line height: 1.6

**Example:**
```tsx
{error && (
  <div className="bg-[#FEE2E2] border-l-4 border-[#DC2626] p-4 rounded-lg mb-4">
    <p className="text-[#7F1D1D] text-sm">{error.message}</p>
  </div>
)}
```

---

## Accessibility

### Keyboard Navigation

- Tab order: Email → Password → Button → Links
- Focus outline: Visible on all interactive elements
- Escape key: No special handling needed (Clerk handles modals)

### Screen Reader Support

- Headings: Proper `<h1>`, `<h2>` hierarchy
- Form labels: Associated with inputs via `<label for="...">`
- Error messages: `aria-live="polite"` for dynamic updates
- Buttons: Visible text labels (no icon-only)

### Color Contrast

- Text on white: `#2D2D2D` on `#FFFFFF` = WCAG AAA (contrast 14.2:1)
- Text on light background: `#666` on `#FFFCF9` = WCAG AA (contrast 7.8:1)
- Primary button: `#FFFFFF` on `#0D9488` = WCAG AAA (contrast 9.2:1)
- Error text: `#7F1D1D` on `#FEE2E2` = WCAG AA (contrast 12.3:1)

### Touch Targets

- All buttons: Min 44x44px (touch-friendly)
- Input fields: Min 44px height
- Links: Min 44x44px interactive area

---

## Edge Cases

### Simultaneous Tabs / Windows

**Scenario:** User signs in on one tab, other tabs still show signed-out header

**Handling:**
- Clerk SDK broadcasts session changes via `broadcastChannel` API
- All tabs update automatically when session changes
- No page reload needed

**Implementation:**
```typescript
useEffect(() => {
  const unsubscribe = useUser().subscribe(() => {
    // React to user changes across all tabs
    setHeader(isSignedIn ? 'signed-in' : 'signed-out');
  });

  return unsubscribe;
}, []);
```

### Network Offline

**Sign-in attempt while offline:**
- Error message: "No internet connection. Please check and try again."
- Retry button visible
- Form data preserved in browser

### Very Long Email/Password Fields

**Email:** Max ~254 characters (RFC standard)
- Input field width: Full width
- Text overflow: Handled by browser (scroll inside field)
- No visual issues

**Password:** No length limit (typically 72+ chars)
- Display as dots (••••••)
- Field width: Full width

### Account Created But Not Verified (Email Verification Required)

**Flow:**
1. User completes sign-up
2. Clerk sends verification email
3. User sees: "Check your email for a verification link"
4. User clicks link in email
5. Email verified, automatic redirect to `/dashboard`
6. If user tries to sign-in before verification:
   - Error: "Please verify your email first"
   - "Resend" link to receive new code

### Session Expired

**Scenario:** User idle > 30 minutes, token expires

**Handling:**
- Clerk SDK attempts automatic silent refresh
- If refresh fails:
  - User redirected to `/sign-in`
  - Message: "Your session has expired. Please sign in again."
  - Previous page stored in redirect_url param

### Custom OAuth Failure

**Scenario:** User clicks "Continue with Google" but OAuth flow fails

**Error message:**
```
"Google sign-in failed. Please try again or use email instead.
[Try Google Again] [Use Email] buttons"
```

---

## Final Checklist

- [ ] Clerk publishable + secret keys configured
- [ ] Sign Up route `/sign-up` tested and styled
- [ ] Sign In route `/sign-in` tested and styled
- [ ] Forgot password flow implemented (`/forgot-password`)
- [ ] Post-auth redirect logic working (dashboard vs create/child)
- [ ] Header updates when user signs in/out
- [ ] UserButton menu implemented and styled
- [ ] Protected routes blocked without auth
- [ ] Legacy routes (`/auth/*`) redirecting correctly
- [ ] Old session cookies cleaned up on new sign-in
- [ ] Middleware.ts protecting routes correctly
- [ ] OAuth buttons (Google, Apple) configured
- [ ] Email verification flow tested (if enabled)
- [ ] Error messages user-friendly and styled
- [ ] WCAG 2.1 AA compliance verified
- [ ] Mobile sign-up/sign-in responsive at 375px, 768px, 1024px+
- [ ] Focus indicators visible on all interactive elements
- [ ] Form labels associated with inputs
- [ ] Tab order logical and accessible
- [ ] No console errors or warnings
- [ ] Clerk webhook endpoint configured for user events

---

**End of 02-AUTHENTICATION.md**
