# Clerk Authentication Integration Guide

## For AI Coding Agents: Enterprise-Grade SaaS Authentication Implementation

> Repo note (2026-02-05): this is a general Clerk reference guide. The current app uses Clerk for auth, but does not implement Clerk webhooks in `src/` (so `CLERK_WEBHOOK_SIGNING_SECRET` is not used by the runtime).

**Version:** 1.0  
**Focus Area:** Complete Authentication + Multi-Tenancy (Organizations) System  
**Target:** Production SaaS Application (Next.js Primary)

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Installation & Setup](#2-installation--setup)
3. [Environment Variables & Configuration](#3-environment-variables--configuration)
4. [Middleware & Route Protection](#4-middleware--route-protection)
5. [Authentication Strategies](#5-authentication-strategies)
6. [Session Management](#6-session-management)
7. [UI Components](#7-ui-components)
8. [Organizations & Multi-Tenancy](#8-organizations--multi-tenancy)
9. [Webhooks System](#9-webhooks-system)
10. [Backend SDK](#10-backend-sdk)
11. [User Management](#11-user-management)
12. [Error Handling](#12-error-handling)
13. [Production Best Practices](#13-production-best-practices)
14. [Complete Code Examples](#14-complete-code-examples)

---

## 1. Overview & Architecture

### What is Clerk

Clerk is a complete authentication and user management platform designed for modern web applications. Key characteristics:

- **Drop-in UI Components** - Pre-built, customizable React components for auth flows
- **Multi-Tenancy (Organizations)** - Built-in support for B2B SaaS with teams/workspaces
- **Session Management** - JWT-based sessions with automatic refresh
- **Multiple Auth Strategies** - Email, OAuth, Passkeys, MFA, Enterprise SSO
- **Webhook Support** - Real-time event notifications via Svix
- **Backend SDKs** - Server-side helpers for all major frameworks

### API Base URLs

```
Frontend API: https://[your-instance].clerk.accounts.dev
Backend API: https://api.clerk.com/v1
```

### Core Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Your Application                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ ClerkProvider│  │ Middleware  │  │  UI Components          │ │
│  │  (Context)   │  │ (Auth Gate) │  │  SignIn, UserButton...  │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                      Clerk SDKs                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐  │
│  │ @clerk/nextjs   │  │ @clerk/backend  │  │ React Hooks    │  │
│  │ (Full Stack)    │  │ (Server Only)   │  │ useAuth, etc.  │  │
│  └─────────────────┘  └─────────────────┘  └────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                      Clerk Platform                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Auth API   │  │ User Store │  │ Org Store  │  │ Webhooks  │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Framework Support

| Framework | Package | Router Support |
|-----------|---------|----------------|
| Next.js | `@clerk/nextjs` | App Router, Pages Router |
| React | `@clerk/clerk-react` | SPA |
| Express | `@clerk/express` | Middleware |
| Fastify | `@clerk/fastify` | Plugin |
| Remix | `@clerk/remix` | Loaders/Actions |
| Astro | `@clerk/astro` | Middleware |
| React Router | `@clerk/react-router` | v6+ |
| Expo | `@clerk/clerk-expo` | React Native |

---

## 2. Installation & Setup

### Next.js SDK Installation (Primary)

```bash
npm install @clerk/nextjs
# or
yarn add @clerk/nextjs
# or
pnpm add @clerk/nextjs
```

### TypeScript Support

The Clerk SDK is written in TypeScript and includes full type definitions. No additional `@types` packages required.

### Basic Setup Steps

#### 1. Add Environment Variables

Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

#### 2. Add Middleware

For Next.js 16+, use `middleware.ts` (or `src/middleware.ts`).
This file runs in the Edge runtime by default.

```typescript
// middleware.ts (Edge runtime)
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

**Edge runtime note:** avoid Node-only APIs (e.g., `crypto.randomUUID()` from `node:crypto`).
Use `globalThis.crypto.randomUUID()` when you need request IDs in middleware.

#### 3. Add ClerkProvider

Wrap your application with `<ClerkProvider>`:

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'My App',
  description: 'My application with Clerk authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

### Other Framework Installations

#### React (Vite/CRA)

```bash
npm install @clerk/clerk-react
```

```typescript
// main.tsx
import { ClerkProvider } from '@clerk/clerk-react'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
```

#### Express.js

```bash
npm install @clerk/express
```

```typescript
import express from 'express'
import { clerkMiddleware } from '@clerk/express'

const app = express()
app.use(clerkMiddleware())
```

---

## 3. Environment Variables & Configuration

### Required Variables

```env
# Required for all Clerk applications
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
```

### Optional URL Configuration

```env
# Custom sign-in/sign-up pages
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Post-authentication redirects
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Webhook configuration
CLERK_WEBHOOK_SIGNING_SECRET=YOUR_WEBHOOK_SECRET
```

### Key Format Reference

| Key Type | Prefix | Purpose |
|----------|--------|---------|
| Publishable Key | `pk…` | Client-side, safe to expose |
| Secret Key | `sk…` | Server-side only, never expose |
| Webhook Secret | `whsec…` | Webhook signature verification |

### Development vs Production Keys

- **Development**: Keys with `_test_` suffix - use for local development
- **Production**: Keys with `_live_` suffix - use for production deployments
- Keys are instance-specific and found in Clerk Dashboard → API Keys

### ClerkProvider Configuration Options

```typescript
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  // Custom sign-in/up URLs
  signInUrl="/sign-in"
  signUpUrl="/sign-up"
  // Post-auth redirects
  afterSignInUrl="/dashboard"
  afterSignUpUrl="/onboarding"
  // Appearance customization
  appearance={{
    baseTheme: dark,
    variables: {
      colorPrimary: '#6c47ff',
    },
  }}
  // Localization
  localization={frFR}
>
  {children}
</ClerkProvider>
```

---

## 4. Middleware & Route Protection

### Basic Middleware Setup

By default, `clerkMiddleware()` does NOT protect any routes. All routes are public unless explicitly protected.

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Protecting Specific Routes

Use `createRouteMatcher()` with `auth().protect()`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/forum(.*)',
  '/api/private(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth().protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Protecting All Routes (Public Route List)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth().protect()
  }
})
```

### Custom Redirect on Unauthenticated

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  const { isAuthenticated, redirectToSignIn } = await auth()
  
  if (!isAuthenticated && isProtectedRoute(req)) {
    // Custom logic before redirect
    console.log('Unauthenticated access attempt:', req.url)
    return redirectToSignIn()
  }
})
```

### Authorization-Based Protection (Roles/Permissions)

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isAdminRoute = createRouteMatcher(['/admin(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    // Check for specific permission
    await auth().protect((has) => {
      return (
        has({ permission: 'org:admin:access' }) ||
        has({ role: 'org:admin' })
      )
    })
  }
})
```

### Route Matcher Patterns

```typescript
// Exact match
createRouteMatcher(['/dashboard'])

// Wildcard (all nested routes)
createRouteMatcher(['/dashboard(.*)'])

// Multiple routes
createRouteMatcher(['/dashboard(.*)', '/settings(.*)', '/api/admin(.*)'])

// Regex patterns work too
createRouteMatcher([/^\/admin\/.*/])
```

---

## 5. Authentication Strategies

### Available Authentication Methods

Clerk supports multiple authentication strategies, configured in the Clerk Dashboard:

| Strategy | Type | Description |
|----------|------|-------------|
| Email + Password | First Factor | Traditional email/password |
| Email + OTP | First Factor | One-time passcode to email |
| Email + Magic Link | First Factor | Passwordless email link |
| Phone + SMS | First Factor | OTP via SMS |
| Username + Password | First Factor | Username-based auth |
| OAuth/Social | First Factor | 20+ providers (Google, GitHub, etc.) |
| Passkeys | First Factor | WebAuthn biometric auth |
| Enterprise SSO | First Factor | SAML/OIDC for organizations |
| TOTP (Authenticator) | Second Factor | MFA via app |
| SMS Code | Second Factor | MFA via SMS |
| Backup Codes | Second Factor | Recovery codes |

### OAuth/Social Providers

Supported providers include:
- Google, GitHub, GitLab, Bitbucket
- Microsoft, Apple, Facebook
- Discord, Slack, Notion, Linear
- Twitter/X, LinkedIn, TikTok
- Spotify, Twitch, Dropbox
- And 10+ more...

#### Configuring OAuth

1. Enable provider in Clerk Dashboard → User & Authentication → Social Connections
2. Configure OAuth credentials (Client ID, Secret) for production
3. Components automatically show enabled providers

### Passkey Authentication

```typescript
// Enable in Dashboard: User & Authentication → Multi-factor → Passkeys

// Creating a passkey
import { useUser } from '@clerk/nextjs'

export function CreatePasskeyButton() {
  const { user } = useUser()
  
  const createPasskey = async () => {
    try {
      await user?.createPasskey()
    } catch (err) {
      console.error('Error creating passkey:', err)
    }
  }
  
  return <button onClick={createPasskey}>Create Passkey</button>
}

// Signing in with passkey
import { useSignIn } from '@clerk/nextjs'

export function SignInWithPasskey() {
  const { signIn, setActive } = useSignIn()
  
  const signInWithPasskey = async () => {
    try {
      const result = await signIn?.authenticateWithPasskey({
        flow: 'discoverable',
      })
      
      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }
  
  return <button onClick={signInWithPasskey}>Sign in with Passkey</button>
}
```

### Multi-Factor Authentication (MFA)

Enable MFA strategies in Dashboard → Multi-factor:

```typescript
// Managing TOTP MFA
import { useUser } from '@clerk/nextjs'

export function ManageTOTP() {
  const { user } = useUser()
  
  const enableTOTP = async () => {
    // Create TOTP - returns QR code URI
    const totp = await user?.createTOTP()
    // totp.secret - for manual entry
    // totp.uri - for QR code generation
    
    // Verify with code from authenticator app
    await totp?.verify({ code: '123456' })
  }
  
  const disableTOTP = async () => {
    await user?.disableTOTP()
  }
  
  return (
    <>
      {user?.twoFactorEnabled ? (
        <button onClick={disableTOTP}>Disable 2FA</button>
      ) : (
        <button onClick={enableTOTP}>Enable 2FA</button>
      )}
    </>
  )
}
```

### Enterprise SSO (SAML/OIDC)

Enterprise SSO connections are configured per-organization:

1. Create Organization in Dashboard
2. Navigate to Organization → SSO Connections
3. Configure SAML or OIDC with IdP metadata
4. Users with matching email domains auto-route to SSO

---

## 6. Session Management

### Session Token Structure

Clerk uses JWT tokens with the following default claims (v2):

```json
{
  "azp": "http://localhost:3000",
  "exp": 1744735488,
  "iat": 1744735428,
  "iss": "https://your-instance.clerk.accounts.dev",
  "jti": "unique-token-id",
  "nbf": 1744735418,
  "sid": "sess_123",
  "sub": "user_123",
  "v": 2,
  "o": {
    "id": "org_123",
    "rol": "org:admin",
    "slg": "acme-corp",
    "prm": ["org:billing:manage", "org:members:manage"]
  }
}
```

### Client-Side Session Access

#### useAuth() Hook

```typescript
'use client'
import { useAuth } from '@clerk/nextjs'

export default function Component() {
  const {
    isLoaded,      // Clerk has initialized
    isSignedIn,    // User is authenticated
    userId,        // Current user ID
    sessionId,     // Current session ID
    orgId,         // Active organization ID
    orgRole,       // Role in active organization
    orgSlug,       // Active organization slug
    getToken,      // Get session token
    has,           // Check permissions/roles
    signOut,       // Sign out function
  } = useAuth()
  
  if (!isLoaded) return <div>Loading...</div>
  if (!isSignedIn) return <div>Not signed in</div>
  
  return <div>User: {userId}</div>
}
```

#### useUser() Hook

```typescript
'use client'
import { useUser } from '@clerk/nextjs'

export default function Component() {
  const { isLoaded, isSignedIn, user } = useUser()
  
  if (!isLoaded || !isSignedIn) return null
  
  return (
    <div>
      <p>Name: {user.firstName} {user.lastName}</p>
      <p>Email: {user.primaryEmailAddress?.emailAddress}</p>
      <img src={user.imageUrl} alt="Avatar" />
    </div>
  )
}
```

#### useSession() Hook

```typescript
'use client'
import { useSession } from '@clerk/nextjs'

export default function Component() {
  const { isLoaded, session } = useSession()
  
  if (!isLoaded || !session) return null
  
  return (
    <div>
      <p>Session ID: {session.id}</p>
      <p>Last Active: {session.lastActiveAt?.toISOString()}</p>
      <p>Expires: {session.expireAt?.toISOString()}</p>
    </div>
  )
}
```

### Server-Side Session Access

#### App Router: auth() Helper

```typescript
// app/api/example/route.ts
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId, sessionId, orgId, orgRole, has } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check permissions
  const canManageTeam = has({ permission: 'org:team:manage' })
  
  return NextResponse.json({ userId, orgId, canManageTeam })
}
```

#### Pages Router: getAuth() Helper

```typescript
// pages/api/example.ts
import { getAuth } from '@clerk/nextjs/server'
import type { NextApiRequest, NextApiResponse } from 'next'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, sessionId, orgId } = getAuth(req)
  
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  
  return res.status(200).json({ userId, orgId })
}
```

#### Server Components: currentUser() Helper

```typescript
// app/profile/page.tsx
import { currentUser } from '@clerk/nextjs/server'

export default async function ProfilePage() {
  const user = await currentUser()
  
  if (!user) {
    return <div>Not signed in</div>
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.firstName} {user.lastName}</p>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  )
}
```

### Custom Session Token Claims

Add custom claims in Dashboard → Sessions → Customize session token:

```json
{
  "fullName": "{{user.full_name}}",
  "email": "{{user.primary_email_address}}",
  "metadata": "{{user.public_metadata}}"
}
```

Access custom claims:

```typescript
const { sessionClaims } = await auth()
const fullName = sessionClaims?.fullName
```

### Getting Tokens for External APIs

```typescript
'use client'
import { useAuth } from '@clerk/nextjs'

export default function Component() {
  const { getToken } = useAuth()
  
  const fetchExternalData = async () => {
    // Default session token
    const token = await getToken()
    
    // Custom JWT template (defined in Dashboard)
    const supabaseToken = await getToken({ template: 'supabase' })
    
    // Force refresh (bypass cache)
    const freshToken = await getToken({ skipCache: true })
    
    const response = await fetch('https://api.example.com/data', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return response.json()
  }
  
  return <button onClick={fetchExternalData}>Fetch Data</button>
}
```

---

## 7. UI Components

### Authentication Components

#### \<SignIn /> Component

```typescript
import { SignIn } from '@clerk/nextjs'

// Basic usage
export default function SignInPage() {
  return <SignIn />
}

// With configuration
export default function SignInPage() {
  return (
    <SignIn
      path="/sign-in"
      routing="path"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      appearance={{
        elements: {
          formButtonPrimary: 'bg-blue-500 hover:bg-blue-600',
        },
      }}
    />
  )
}
```

#### \<SignUp /> Component

```typescript
import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <SignUp
      path="/sign-up"
      routing="path"
      signInUrl="/sign-in"
      afterSignUpUrl="/onboarding"
    />
  )
}
```

### User Management Components

#### \<UserButton /> Component

```typescript
import { UserButton } from '@clerk/nextjs'

export default function Header() {
  return (
    <header>
      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: 'w-10 h-10',
          },
        }}
        userProfileMode="modal" // or "navigation"
        userProfileUrl="/profile"
      />
    </header>
  )
}
```

#### \<UserProfile /> Component

```typescript
import { UserProfile } from '@clerk/nextjs'

export default function ProfilePage() {
  return (
    <UserProfile
      path="/profile"
      routing="path"
      appearance={{
        elements: {
          rootBox: 'w-full max-w-4xl mx-auto',
        },
      }}
    />
  )
}
```

### Control Components

#### \<SignedIn /> and \<SignedOut />

```typescript
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs'

export default function Header() {
  return (
    <header className="flex justify-between p-4">
      <h1>My App</h1>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </header>
  )
}
```

#### \<Protect /> Component

```typescript
import { Protect } from '@clerk/nextjs'

export default function AdminSection() {
  return (
    <Protect
      permission="org:admin:access"
      fallback={<p>You don't have permission to view this.</p>}
    >
      <AdminDashboard />
    </Protect>
  )
}

// Role-based protection
export default function AdminSection() {
  return (
    <Protect
      role="org:admin"
      fallback={<p>Admin access required.</p>}
    >
      <AdminDashboard />
    </Protect>
  )
}
```

#### \<ClerkLoaded /> and \<ClerkLoading />

```typescript
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'

export default function App() {
  return (
    <>
      <ClerkLoading>
        <div className="spinner">Loading authentication...</div>
      </ClerkLoading>
      <ClerkLoaded>
        <MainApp />
      </ClerkLoaded>
    </>
  )
}
```

### Organization Components

#### \<OrganizationSwitcher />

```typescript
import { OrganizationSwitcher } from '@clerk/nextjs'

export default function Sidebar() {
  return (
    <OrganizationSwitcher
      hidePersonal={false}
      afterCreateOrganizationUrl="/org/:id"
      afterSelectOrganizationUrl="/org/:id"
      afterLeaveOrganizationUrl="/"
    />
  )
}
```

#### \<OrganizationProfile />

```typescript
import { OrganizationProfile } from '@clerk/nextjs'

export default function OrgSettingsPage() {
  return (
    <OrganizationProfile
      path="/org-settings"
      routing="path"
    />
  )
}
```

#### \<CreateOrganization />

```typescript
import { CreateOrganization } from '@clerk/nextjs'

export default function CreateOrgPage() {
  return (
    <CreateOrganization
      path="/create-org"
      routing="path"
      afterCreateOrganizationUrl="/org/:slug"
    />
  )
}
```

### Unstyled Button Components

```typescript
import {
  SignInButton,
  SignUpButton,
  SignOutButton,
} from '@clerk/nextjs'

export default function AuthButtons() {
  return (
    <div>
      {/* Opens sign-in modal by default */}
      <SignInButton mode="modal">
        <button className="btn">Sign In</button>
      </SignInButton>
      
      {/* Redirects to sign-up page */}
      <SignUpButton mode="redirect">
        <button className="btn btn-primary">Sign Up</button>
      </SignUpButton>
      
      {/* Sign out with redirect */}
      <SignOutButton signOutOptions={{ redirectUrl: '/' }}>
        <button className="btn btn-secondary">Sign Out</button>
      </SignOutButton>
    </div>
  )
}
```

---

## 8. Organizations & Multi-Tenancy

### Overview

Organizations enable B2B SaaS functionality with:
- Shared workspaces/teams
- Role-based access control (RBAC)
- Member invitations
- Enterprise SSO per organization

### Enabling Organizations

1. Dashboard → Organizations Settings → Enable Organizations
2. Choose membership model:
   - **Membership Required**: All users must belong to an org (B2B default)
   - **Membership Optional**: Personal accounts + orgs (B2C→B2B)

### Organization Data Model

```typescript
interface Organization {
  id: string                    // org_xxxxx
  name: string                  // "Acme Corp"
  slug: string                  // "acme-corp"
  imageUrl: string              // Avatar URL
  membersCount: number          // Total members
  pendingInvitationsCount: number
  maxAllowedMemberships: number
  publicMetadata: Record<string, unknown>
  privateMetadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

interface OrganizationMembership {
  id: string
  organization: Organization
  publicUserData: {
    userId: string
    firstName: string | null
    lastName: string | null
    imageUrl: string
    identifier: string
  }
  role: string                  // "org:admin" | "org:member" | custom
  createdAt: Date
  updatedAt: Date
}
```

### Default Roles & Permissions

| Role | Key | Description |
|------|-----|-------------|
| Admin | `org:admin` | Full organization management |
| Member | `org:member` | Basic member access |

### Custom Roles & Permissions

Create in Dashboard → Roles & Permissions:

```typescript
// Example custom roles
{
  "org:billing": "Billing Manager",
  "org:developer": "Developer",
  "org:viewer": "Read-only Viewer"
}

// Example custom permissions
{
  "org:invoices:create": "Create invoices",
  "org:invoices:read": "View invoices",
  "org:members:invite": "Invite members"
}
```

### Accessing Organization Data

#### Client-Side: useOrganization()

```typescript
'use client'
import { useOrganization } from '@clerk/nextjs'

export default function OrgInfo() {
  const { isLoaded, organization, membership } = useOrganization()
  
  if (!isLoaded) return <div>Loading...</div>
  if (!organization) return <div>No organization selected</div>
  
  return (
    <div>
      <h1>{organization.name}</h1>
      <p>Your role: {membership?.role}</p>
      <p>Members: {organization.membersCount}</p>
    </div>
  )
}
```

#### Client-Side: useOrganizationList()

```typescript
'use client'
import { useOrganizationList } from '@clerk/nextjs'

export default function OrgList() {
  const {
    isLoaded,
    userMemberships,
    setActive,
    createOrganization,
  } = useOrganizationList({
    userMemberships: { infinite: true },
  })
  
  if (!isLoaded) return <div>Loading...</div>
  
  return (
    <ul>
      {userMemberships.data?.map((mem) => (
        <li key={mem.id}>
          <button onClick={() => setActive({ organization: mem.organization.id })}>
            {mem.organization.name}
          </button>
        </li>
      ))}
    </ul>
  )
}
```

#### Server-Side

```typescript
import { auth, clerkClient } from '@clerk/nextjs/server'

export async function GET() {
  const { orgId, orgRole } = await auth()
  
  if (!orgId) {
    return Response.json({ error: 'No organization' }, { status: 400 })
  }
  
  const client = await clerkClient()
  const org = await client.organizations.getOrganization({
    organizationId: orgId,
  })
  
  return Response.json({ org, role: orgRole })
}
```

### Authorization Checks

#### Using has() for Permissions

```typescript
// Server-side
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  const { has, userId } = await auth()
  
  // Check permission
  if (!has({ permission: 'org:invoices:create' })) {
    return Response.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  // Check role
  if (!has({ role: 'org:admin' })) {
    return Response.json({ error: 'Admin required' }, { status: 403 })
  }
  
  return Response.json({ success: true })
}
```

#### Using auth().protect() with Authorization

```typescript
// Middleware
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isBillingRoute = createRouteMatcher(['/billing(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isBillingRoute(req)) {
    await auth().protect((has) => has({ permission: 'org:billing:manage' }))
  }
})
```

### Inviting Members

```typescript
'use client'
import { useOrganization } from '@clerk/nextjs'

export default function InviteForm() {
  const { organization } = useOrganization()
  
  const inviteMember = async (email: string, role: string) => {
    await organization?.inviteMember({
      emailAddress: email,
      role: role, // 'org:admin' | 'org:member' | custom
    })
  }
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      inviteMember(
        formData.get('email') as string,
        formData.get('role') as string
      )
    }}>
      <input name="email" type="email" placeholder="Email" required />
      <select name="role">
        <option value="org:member">Member</option>
        <option value="org:admin">Admin</option>
      </select>
      <button type="submit">Invite</button>
    </form>
  )
}
```

### Verified Domains

Auto-enroll users based on email domain:

```typescript
// Server-side: Add verified domain
const client = await clerkClient()
await client.organizations.createOrganizationDomain(orgId, {
  name: 'acme.com',
  enrollmentMode: 'automatic_invitation', // or 'automatic_suggestion'
})
```

---

## 9. Webhooks System

### Overview

Clerk uses [Svix](https://svix.com/) for webhook delivery with:
- Automatic retries with exponential backoff
- Signature verification
- Message replay capability
- IP allowlisting

### Setting Up Webhooks

1. Dashboard → Webhooks → Add Endpoint
2. Enter your endpoint URL
3. Select events to subscribe to
4. Copy the Webhook Signing Secret

### Webhook Events

| Category | Events |
|----------|--------|
| User | `user.created`, `user.updated`, `user.deleted` |
| Session | `session.created`, `session.ended`, `session.removed`, `session.revoked` |
| Organization | `organization.created`, `organization.updated`, `organization.deleted` |
| Membership | `organizationMembership.created`, `organizationMembership.updated`, `organizationMembership.deleted` |
| Invitation | `organizationInvitation.created`, `organizationInvitation.accepted`, `organizationInvitation.revoked` |
| Email | `email.created` |
| SMS | `sms.created` |

### Webhook Payload Structure

```typescript
interface WebhookEvent {
  data: Record<string, any>  // Event-specific payload (User, Org, etc.)
  object: 'event'
  type: string               // e.g., 'user.created'
  timestamp: number          // Unix timestamp in milliseconds
  instance_id: string        // Your Clerk instance ID
}
```

### Example Payload (user.created)

```json
{
  "data": {
    "id": "user_29w83sxmDNGwOuEthce5gg56FcC",
    "object": "user",
    "email_addresses": [
      {
        "email_address": "user@example.com",
        "id": "idn_29w83yL7CwVlJXylYLxcslromF1",
        "verification": {
          "status": "verified",
          "strategy": "ticket"
        }
      }
    ],
    "first_name": "John",
    "last_name": "Doe",
    "created_at": 1654012591514,
    "updated_at": 1654012591835
  },
  "object": "event",
  "type": "user.created",
  "timestamp": 1654012591835,
  "instance_id": "ins_123"
}
```

### Implementing Webhook Handler (Next.js)

```typescript
// app/api/webhooks/clerk/route.ts
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    // Verify the webhook signature
    const evt = await verifyWebhook(req)
    
    // Handle the event
    const { id } = evt.data
    const eventType = evt.type
    
    console.log(`Webhook received: ${eventType} for ${id}`)
    
    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
      case 'organization.created':
        await handleOrgCreated(evt.data)
        break
      // Add more event handlers as needed
    }
    
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }
}

async function handleUserCreated(data: any) {
  // Sync user to database
  const { id, email_addresses, first_name, last_name } = data
  const email = email_addresses[0]?.email_address
  
  await db.user.create({
    data: {
      clerkId: id,
      email,
      firstName: first_name,
      lastName: last_name,
    },
  })
}

async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name } = data
  const email = email_addresses[0]?.email_address
  
  await db.user.update({
    where: { clerkId: id },
    data: {
      email,
      firstName: first_name,
      lastName: last_name,
    },
  })
}

async function handleUserDeleted(data: any) {
  const { id } = data
  await db.user.delete({ where: { clerkId: id } })
}

async function handleOrgCreated(data: any) {
  const { id, name, slug } = data
  await db.organization.create({
    data: {
      clerkId: id,
      name,
      slug,
    },
  })
}
```

### Manual Webhook Verification (Svix)

If not using the Clerk helper:

```typescript
import { Webhook } from 'svix'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing webhook secret')
  }
  
  const svixId = req.headers.get('svix-id')
  const svixTimestamp = req.headers.get('svix-timestamp')
  const svixSignature = req.headers.get('svix-signature')
  
  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }
  
  const body = await req.text()
  const wh = new Webhook(WEBHOOK_SECRET)
  
  let evt: any
  try {
    evt = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    })
  } catch (err) {
    return new Response('Verification failed', { status: 400 })
  }
  
  // Process evt...
}
```

### Retry Schedule

Svix retries failed webhooks with exponential backoff:
- Immediately
- 5 seconds
- 5 minutes
- 30 minutes
- 2 hours
- 5 hours
- 10 hours (repeated)

### Replaying Webhooks

In Dashboard → Webhooks → Select Endpoint → Message Attempts:
- Replay individual failed messages
- Replay all failed messages in a date range

---

## 10. Backend SDK

### Overview

The JS Backend SDK (`@clerk/backend`) provides server-side access to:
- User management
- Organization management
- Session management
- Invitation management
- And more...

### Initialization

#### Next.js

```typescript
import { clerkClient } from '@clerk/nextjs/server'

// In server components, API routes, or server actions
const client = await clerkClient()
```

#### Express/Other Frameworks

```typescript
import { createClerkClient } from '@clerk/backend'

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})
```

### User Operations

```typescript
const client = await clerkClient()

// List users with filters
const { data: users, totalCount } = await client.users.getUserList({
  limit: 10,
  offset: 0,
  orderBy: '-created_at',
  emailAddress: ['user@example.com'],
  // query: 'search term',
  // organizationId: ['org_123', '+org_456', '-org_789'],
})

// Get single user
const user = await client.users.getUser('user_123')

// Create user
const newUser = await client.users.createUser({
  emailAddress: ['user@example.com'],
  password: 'securePassword123',
  firstName: 'John',
  lastName: 'Doe',
})

// Update user
const updatedUser = await client.users.updateUser('user_123', {
  firstName: 'Jane',
  publicMetadata: { plan: 'pro' },
})

// Delete user
await client.users.deleteUser('user_123')

// Update user metadata
await client.users.updateUserMetadata('user_123', {
  publicMetadata: { role: 'admin' },
  privateMetadata: { stripeCustomerId: 'cus_123' },
})
```

### Organization Operations

```typescript
const client = await clerkClient()

// List organizations
const { data: orgs } = await client.organizations.getOrganizationList({
  limit: 10,
  includeMembersCount: true,
})

// Get organization
const org = await client.organizations.getOrganization({
  organizationId: 'org_123',
  // or: slug: 'acme-corp'
})

// Create organization
const newOrg = await client.organizations.createOrganization({
  name: 'Acme Corp',
  slug: 'acme-corp',
  createdBy: 'user_123',
})

// Update organization
await client.organizations.updateOrganization('org_123', {
  name: 'New Name',
  publicMetadata: { plan: 'enterprise' },
})

// Delete organization
await client.organizations.deleteOrganization('org_123')

// Get organization members
const { data: members } = await client.organizations.getOrganizationMembershipList({
  organizationId: 'org_123',
  limit: 100,
})

// Add member
await client.organizations.createOrganizationMembership({
  organizationId: 'org_123',
  userId: 'user_456',
  role: 'org:member',
})

// Update member role
await client.organizations.updateOrganizationMembership({
  organizationId: 'org_123',
  userId: 'user_456',
  role: 'org:admin',
})

// Remove member
await client.organizations.deleteOrganizationMembership({
  organizationId: 'org_123',
  userId: 'user_456',
})
```

### Invitation Operations

```typescript
const client = await clerkClient()

// Create organization invitation
const invitation = await client.organizations.createOrganizationInvitation({
  organizationId: 'org_123',
  emailAddress: 'newuser@example.com',
  role: 'org:member',
  redirectUrl: 'https://myapp.com/accept-invite',
})

// List pending invitations
const { data: invitations } = await client.organizations.getOrganizationInvitationList({
  organizationId: 'org_123',
  status: ['pending'],
})

// Revoke invitation
await client.organizations.revokeOrganizationInvitation({
  organizationId: 'org_123',
  invitationId: 'orginv_123',
  requestingUserId: 'user_123',
})
```

### Session Operations

```typescript
const client = await clerkClient()

// Get session
const session = await client.sessions.getSession('sess_123')

// Revoke session
await client.sessions.revokeSession('sess_123')

// Get all user sessions
const { data: sessions } = await client.sessions.getSessionList({
  userId: 'user_123',
})
```

### Error Handling

```typescript
import { isClerkAPIResponseError } from '@clerk/backend'

try {
  const user = await client.users.getUser('invalid_id')
} catch (error) {
  if (isClerkAPIResponseError(error)) {
    console.error('Clerk API Error:', error.errors)
    // error.errors: Array<{ code: string, message: string, longMessage?: string }>
    // error.status: HTTP status code
    // error.clerkTraceId: Trace ID for support
  }
  throw error
}
```

---

## 11. User Management

### User Object Structure

```typescript
interface User {
  id: string                              // user_xxxxx
  firstName: string | null
  lastName: string | null
  fullName: string | null
  username: string | null
  imageUrl: string
  hasImage: boolean
  primaryEmailAddressId: string | null
  primaryEmailAddress: EmailAddress | null
  emailAddresses: EmailAddress[]
  primaryPhoneNumberId: string | null
  primaryPhoneNumber: PhoneNumber | null
  phoneNumbers: PhoneNumber[]
  primaryWeb3WalletId: string | null
  web3Wallets: Web3Wallet[]
  externalAccounts: ExternalAccount[]     // OAuth connections
  passkeys: Passkey[]
  organizationMemberships: OrganizationMembership[]
  publicMetadata: Record<string, unknown>
  privateMetadata: Record<string, unknown> // Server-only
  unsafeMetadata: Record<string, unknown>  // Deprecated
  twoFactorEnabled: boolean
  passwordEnabled: boolean
  totpEnabled: boolean
  backupCodeEnabled: boolean
  lastSignInAt: Date | null
  createdAt: Date
  updatedAt: Date
}
```

### User Metadata

| Type | Client Read | Client Write | Server Read | Server Write |
|------|-------------|--------------|-------------|--------------|
| `publicMetadata` | ✅ | ❌ | ✅ | ✅ |
| `privateMetadata` | ❌ | ❌ | ✅ | ✅ |
| `unsafeMetadata` | ✅ | ✅ | ✅ | ✅ |

```typescript
// Server-side: Update metadata
const client = await clerkClient()
await client.users.updateUserMetadata('user_123', {
  publicMetadata: {
    role: 'admin',
    plan: 'pro',
  },
  privateMetadata: {
    stripeCustomerId: 'cus_123',
    internalNotes: 'VIP customer',
  },
})

// Client-side: Update unsafeMetadata (via useUser)
const { user } = useUser()
await user.update({
  unsafeMetadata: {
    theme: 'dark',
    preferences: { notifications: true },
  },
})
```

### Client-Side User Updates

```typescript
'use client'
import { useUser } from '@clerk/nextjs'

export default function ProfileForm() {
  const { user } = useUser()
  
  const updateProfile = async (formData: FormData) => {
    await user?.update({
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    })
  }
  
  const updateAvatar = async (file: File) => {
    await user?.setProfileImage({ file })
  }
  
  const removeAvatar = async () => {
    await user?.setProfileImage({ file: null })
  }
  
  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      updateProfile(new FormData(e.target as HTMLFormElement))
    }}>
      <input name="firstName" defaultValue={user?.firstName || ''} />
      <input name="lastName" defaultValue={user?.lastName || ''} />
      <button type="submit">Update</button>
    </form>
  )
}
```

### Email Management

```typescript
'use client'
import { useUser } from '@clerk/nextjs'

export default function EmailManagement() {
  const { user } = useUser()
  
  const addEmail = async (email: string) => {
    const emailAddress = await user?.createEmailAddress({ email })
    // Send verification
    await emailAddress?.prepareVerification({ strategy: 'email_code' })
  }
  
  const verifyEmail = async (emailId: string, code: string) => {
    const emailAddress = user?.emailAddresses.find((e) => e.id === emailId)
    await emailAddress?.attemptVerification({ code })
  }
  
  const setPrimaryEmail = async (emailId: string) => {
    await user?.update({ primaryEmailAddressId: emailId })
  }
  
  const removeEmail = async (emailId: string) => {
    const emailAddress = user?.emailAddresses.find((e) => e.id === emailId)
    await emailAddress?.destroy()
  }
  
  return (
    <div>
      <h2>Email Addresses</h2>
      <ul>
        {user?.emailAddresses.map((email) => (
          <li key={email.id}>
            {email.emailAddress}
            {email.id === user.primaryEmailAddressId && ' (Primary)'}
            {email.verification.status === 'verified' ? ' ✓' : ' (Unverified)'}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

---

## 12. Error Handling

### Client-Side Error Handling

```typescript
'use client'
import { useSignIn, isClerkAPIResponseError } from '@clerk/nextjs'

export default function SignInForm() {
  const { signIn, setActive } = useSignIn()
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await signIn?.create({
        identifier: formData.get('email') as string,
        password: formData.get('password') as string,
      })
      
      if (result?.status === 'complete') {
        await setActive({ session: result.createdSessionId })
      }
    } catch (err) {
      if (isClerkAPIResponseError(err)) {
        // Handle specific error codes
        const errorCode = err.errors[0]?.code
        switch (errorCode) {
          case 'form_identifier_not_found':
            setError('No account found with this email')
            break
          case 'form_password_incorrect':
            setError('Incorrect password')
            break
          case 'form_password_pwned':
            setError('This password has been compromised')
            break
          case 'session_exists':
            setError('You are already signed in')
            break
          default:
            setError(err.errors[0]?.message || 'An error occurred')
        }
      } else {
        setError('An unexpected error occurred')
      }
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `form_identifier_not_found` | Email/username doesn't exist |
| `form_password_incorrect` | Wrong password |
| `form_password_pwned` | Password found in breach database |
| `form_code_incorrect` | Invalid verification code |
| `verification_expired` | Verification link/code expired |
| `session_exists` | Already signed in |
| `not_allowed_access` | User not allowed to access |
| `organization_membership_required` | Must belong to an organization |
| `too_many_requests` | Rate limit exceeded |

### Server-Side Error Handling

```typescript
import { auth, clerkClient } from '@clerk/nextjs/server'
import { isClerkAPIResponseError } from '@clerk/backend'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    
    return NextResponse.json({ user })
  } catch (error) {
    if (isClerkAPIResponseError(error)) {
      console.error('Clerk API Error:', {
        status: error.status,
        errors: error.errors,
        traceId: error.clerkTraceId,
      })
      
      return NextResponse.json(
        { error: error.errors[0]?.message || 'API Error' },
        { status: error.status }
      )
    }
    
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}
```

### Webhook Error Handling

```typescript
export async function POST(req: Request) {
  try {
    const evt = await verifyWebhook(req)
    
    // Process event...
    
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    // Log error but return 200 to prevent retries for invalid payloads
    if (error instanceof Error && error.message.includes('signature')) {
      console.error('Webhook signature verification failed')
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
    
    // For processing errors, return 500 to trigger retry
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Processing failed' },
      { status: 500 }
    )
  }
}
```

---

## 13. Production Best Practices

### Security Checklist

- [ ] Use production API keys from your Clerk production instance
- [ ] Store secret key in environment variables only
- [ ] Never expose `CLERK_SECRET_KEY` to client
- [ ] Verify webhook signatures on all endpoints
- [ ] Use HTTPS for all webhook endpoints
- [ ] Implement proper CORS configuration
- [ ] Enable and configure MFA options
- [ ] Set up IP allowlist for webhooks (Svix IPs)
- [ ] Review session token expiry settings
- [ ] Configure proper redirect URLs

### Session Security

Clerk automatically implements:
- **HttpOnly cookies** - XSS protection
- **SameSite flag** - CSRF protection
- **Session rotation** - On sign-in/out
- **Short-lived tokens** - Auto-refresh every 60 seconds

### Rate Limits

Be aware of Clerk's rate limits:
- Frontend API: Higher limits for auth flows
- Backend API: Request-based limits
- Contact support for limit increases in production

### Environment Setup

```env
# Production environment variables
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
CLERK_WEBHOOK_SIGNING_SECRET=YOUR_WEBHOOK_SECRET

# Production URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### Custom Domain Setup

1. Dashboard → Domains → Add Domain
2. Configure DNS records:
   - CNAME for `accounts.yourdomain.com`
3. Enable custom domain in production settings

### Monitoring & Logging

```typescript
// middleware with logging
export default clerkMiddleware(async (auth, req) => {
  const start = Date.now()
  const { userId, orgId } = await auth()
  
  // Log auth events
  console.log({
    timestamp: new Date().toISOString(),
    path: req.nextUrl.pathname,
    userId,
    orgId,
    duration: Date.now() - start,
  })
})
```

### Testing

```typescript
// Use testing tokens for E2E tests
import { clerkClient } from '@clerk/nextjs/server'

async function getTestingToken() {
  const client = await clerkClient()
  const token = await client.testingTokens.create()
  return token.token
}

// In tests, include the token in requests
// This bypasses bot detection
```

### Deployment Checklist

- [ ] Switch to production API keys
- [ ] Configure custom domain (recommended)
- [ ] Set up production webhook endpoints
- [ ] Update redirect URLs to production URLs
- [ ] Configure OAuth provider production credentials
- [ ] Test all authentication flows
- [ ] Test webhook delivery
- [ ] Monitor error rates after deployment

---

## 14. Complete Code Examples

### Full Authentication Layout

```typescript
// app/layout.tsx
import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs'
import './globals.css'

export const metadata: Metadata = {
  title: 'My SaaS App',
  description: 'Enterprise SaaS with Clerk authentication',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6c47ff',
        },
      }}
    >
      <html lang="en">
        <body>
          <header className="flex justify-between items-center p-4 border-b">
            <nav className="flex items-center gap-4">
              <a href="/" className="font-bold text-xl">
                MyApp
              </a>
              <SignedIn>
                <a href="/dashboard">Dashboard</a>
                <a href="/settings">Settings</a>
              </SignedIn>
            </nav>
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="px-4 py-2 text-sm">Sign In</button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="px-4 py-2 text-sm bg-primary text-white rounded">
                    Sign Up
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10',
                    },
                  }}
                />
              </SignedIn>
            </div>
          </header>
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### Protected Dashboard with Organizations

```typescript
// app/dashboard/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { OrganizationSwitcher } from '@clerk/nextjs'

export default async function DashboardPage() {
  const { userId, orgId, orgRole } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }
  
  const user = await currentUser()
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || 'User'}!
          </p>
        </div>
        <OrganizationSwitcher />
      </div>
      
      {orgId ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Organization Dashboard</h2>
          <p>Organization ID: {orgId}</p>
          <p>Your Role: {orgRole}</p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">No Organization Selected</h2>
          <p>Select or create an organization to get started.</p>
        </div>
      )}
    </div>
  )
}
```

### Complete Webhook Handler

```typescript
// app/api/webhooks/clerk/route.ts
import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db' // Your database client

type WebhookEvent = {
  data: Record<string, any>
  type: string
  timestamp: number
}

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req) as WebhookEvent
    
    console.log(`[Webhook] Received: ${evt.type}`)
    
    switch (evt.type) {
      // User events
      case 'user.created':
        await handleUserCreated(evt.data)
        break
      case 'user.updated':
        await handleUserUpdated(evt.data)
        break
      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break
        
      // Organization events
      case 'organization.created':
        await handleOrgCreated(evt.data)
        break
      case 'organization.updated':
        await handleOrgUpdated(evt.data)
        break
      case 'organization.deleted':
        await handleOrgDeleted(evt.data)
        break
        
      // Membership events
      case 'organizationMembership.created':
        await handleMemberAdded(evt.data)
        break
      case 'organizationMembership.deleted':
        await handleMemberRemoved(evt.data)
        break
        
      default:
        console.log(`[Webhook] Unhandled event: ${evt.type}`)
    }
    
    return NextResponse.json({ received: true }, { status: 200 })
  } catch (err) {
    console.error('[Webhook] Error:', err)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 400 }
    )
  }
}

// Handler implementations
async function handleUserCreated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url } = data
  const primaryEmail = email_addresses?.find(
    (e: any) => e.id === data.primary_email_address_id
  )?.email_address
  
  await db.user.upsert({
    where: { clerkId: id },
    create: {
      clerkId: id,
      email: primaryEmail,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
    },
    update: {
      email: primaryEmail,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
    },
  })
  
  console.log(`[Webhook] User created: ${id}`)
}

async function handleUserUpdated(data: any) {
  const { id, email_addresses, first_name, last_name, image_url } = data
  const primaryEmail = email_addresses?.find(
    (e: any) => e.id === data.primary_email_address_id
  )?.email_address
  
  await db.user.update({
    where: { clerkId: id },
    data: {
      email: primaryEmail,
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
    },
  })
  
  console.log(`[Webhook] User updated: ${id}`)
}

async function handleUserDeleted(data: any) {
  const { id } = data
  
  await db.user.delete({
    where: { clerkId: id },
  })
  
  console.log(`[Webhook] User deleted: ${id}`)
}

async function handleOrgCreated(data: any) {
  const { id, name, slug, image_url } = data
  
  await db.organization.create({
    data: {
      clerkId: id,
      name,
      slug,
      imageUrl: image_url,
    },
  })
  
  console.log(`[Webhook] Organization created: ${id}`)
}

async function handleOrgUpdated(data: any) {
  const { id, name, slug, image_url } = data
  
  await db.organization.update({
    where: { clerkId: id },
    data: {
      name,
      slug,
      imageUrl: image_url,
    },
  })
  
  console.log(`[Webhook] Organization updated: ${id}`)
}

async function handleOrgDeleted(data: any) {
  const { id } = data
  
  await db.organization.delete({
    where: { clerkId: id },
  })
  
  console.log(`[Webhook] Organization deleted: ${id}`)
}

async function handleMemberAdded(data: any) {
  const { organization, public_user_data, role } = data
  
  await db.membership.create({
    data: {
      organizationId: organization.id,
      userId: public_user_data.user_id,
      role,
    },
  })
  
  console.log(`[Webhook] Member added: ${public_user_data.user_id} to ${organization.id}`)
}

async function handleMemberRemoved(data: any) {
  const { organization, public_user_data } = data
  
  await db.membership.delete({
    where: {
      organizationId_userId: {
        organizationId: organization.id,
        userId: public_user_data.user_id,
      },
    },
  })
  
  console.log(`[Webhook] Member removed: ${public_user_data.user_id} from ${organization.id}`)
}
```

### API Route with Full Auth

```typescript
// app/api/projects/route.ts
import { auth, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const { userId, orgId, has } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Fetch projects based on context
  const projects = await db.project.findMany({
    where: orgId
      ? { organizationId: orgId }
      : { userId, organizationId: null },
  })
  
  return NextResponse.json({ projects })
}

export async function POST(req: Request) {
  const { userId, orgId, has } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  // Check permission for organization context
  if (orgId && !has({ permission: 'org:projects:create' })) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  const body = await req.json()
  const { name, description } = body
  
  const project = await db.project.create({
    data: {
      name,
      description,
      userId,
      organizationId: orgId || null,
    },
  })
  
  return NextResponse.json({ project }, { status: 201 })
}

export async function DELETE(req: Request) {
  const { userId, orgId, has } = await auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('id')
  
  if (!projectId) {
    return NextResponse.json({ error: 'Missing project ID' }, { status: 400 })
  }
  
  const project = await db.project.findUnique({
    where: { id: projectId },
  })
  
  if (!project) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  
  // Authorization check
  const canDelete =
    project.userId === userId ||
    (orgId && has({ permission: 'org:projects:delete' }))
  
  if (!canDelete) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  
  await db.project.delete({ where: { id: projectId } })
  
  return NextResponse.json({ success: true })
}
```

---

## Quick Reference Card

### SDK Methods

```typescript
// Client-side hooks
useAuth()              // Auth state + methods
useUser()              // User object
useSession()           // Session object
useClerk()             // Clerk object
useOrganization()      // Active organization
useOrganizationList()  // User's organizations
useSignIn()            // Sign-in flow control
useSignUp()            // Sign-up flow control

// Server-side helpers (Next.js)
auth()                 // Auth object (App Router)
getAuth(req)           // Auth object (Pages Router)
currentUser()          // Full User object
clerkClient()          // Backend SDK instance

// Backend SDK (clerkClient)
client.users.getUserList()
client.users.getUser(userId)
client.users.createUser(params)
client.users.updateUser(userId, params)
client.users.deleteUser(userId)
client.users.updateUserMetadata(userId, metadata)

client.organizations.getOrganizationList()
client.organizations.getOrganization(params)
client.organizations.createOrganization(params)
client.organizations.updateOrganization(orgId, params)
client.organizations.deleteOrganization(orgId)

client.organizations.getOrganizationMembershipList(params)
client.organizations.createOrganizationMembership(params)
client.organizations.updateOrganizationMembership(params)
client.organizations.deleteOrganizationMembership(params)

client.organizations.createOrganizationInvitation(params)
client.organizations.revokeOrganizationInvitation(params)
```

### Common Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_SECRET_KEY
CLERK_WEBHOOK_SIGNING_SECRET=YOUR_WEBHOOK_SECRET

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
```

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | - |
| 400 | Bad Request | Fix request |
| 401 | Unauthorized | Sign in required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource doesn't exist |
| 422 | Validation Error | Fix input |
| 429 | Rate Limited | Back off and retry |
| 500 | Server Error | Retry with backoff |

---

## Changelog & Version Notes

- **@clerk/nextjs Version:** Check npm for latest
- **API Version:** v1
- **Session Token Version:** v2
- **Documentation Source:** https://clerk.com/docs

---

*This document was compiled for AI coding agent consumption. All code examples are production-ready and follow current best practices.*
