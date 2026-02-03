# Resend Email Service Integration Guide

## For AI Coding Agents: Enterprise-Grade SaaS Email Implementation

**Version:** 1.0  
**Focus Area:** Magic Link Authentication + Full Transactional Email System  
**Target:** Production SaaS Application

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Installation & Setup](#2-installation--setup)
3. [Authentication & API Keys](#3-authentication--api-keys)
4. [Domain Configuration](#4-domain-configuration)
5. [Core Email Sending API](#5-core-email-sending-api)
6. [Magic Link Authentication Implementation](#6-magic-link-authentication-implementation)
7. [React Email Templates](#7-react-email-templates)
8. [Webhooks System](#8-webhooks-system)
9. [Error Handling](#9-error-handling)
10. [Rate Limiting & Quotas](#10-rate-limiting--quotas)
11. [Batch Operations](#11-batch-operations)
12. [Scheduled Emails](#12-scheduled-emails)
13. [Production Best Practices](#13-production-best-practices)
14. [Complete Code Examples](#14-complete-code-examples)

---

## 1. Overview & Architecture

### What is Resend

Resend is a developer-first email API platform designed for sending transactional and marketing emails. Key characteristics:

- **RESTful API** with comprehensive SDKs (Node.js, Python, Go, Rust, PHP, Ruby, Java, .NET)
- **React Email Integration** - Build emails using React components
- **Webhook Support** - Real-time delivery notifications
- **Multi-Region** - US (us-east-1), EU (eu-west-1), South America (sa-east-1)
- **DKIM/SPF/DMARC** - Built-in email authentication

### API Base URL

```
https://api.resend.com
```

### Core Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/emails` | POST | Send single email |
| `/emails/batch` | POST | Send up to 100 emails |
| `/emails/{id}` | GET | Retrieve email details |
| `/emails/{id}` | PATCH | Update scheduled email |
| `/emails/{id}/cancel` | POST | Cancel scheduled email |
| `/domains` | POST/GET | Manage sending domains |
| `/webhooks` | POST/GET | Manage webhook endpoints |

---

## 2. Installation & Setup

### Node.js SDK Installation

```bash
npm install resend
# or
yarn add resend
# or
pnpm add resend
```

### For React Email Templates

```bash
npm install @react-email/components resend
# Development preview server
npm install react-email --save-dev
```

### TypeScript Support

The Resend SDK is written in TypeScript and includes full type definitions. No additional `@types` packages required.

### Basic Client Initialization

```typescript
import { Resend } from 'resend';

// Initialize with API key from environment
const resend = new Resend(process.env.RESEND_API_KEY);

// Alternative: explicit key (not recommended for production)
const resend = new Resend('re_xxxxxxxxx');
```

### Environment Variables Required

```env
# Required
RESEND_API_KEY=re_xxxxxxxxx

# For webhook verification
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx

# Optional: Custom region
RESEND_REGION=us-east-1
```

---

## 3. Authentication & API Keys

### API Key Format

All Resend API keys begin with `re_` prefix.

### Authorization Header

```http
Authorization: Bearer re_xxxxxxxxx
```

### API Key Permission Levels

| Permission | Capabilities |
|------------|--------------|
| `full_access` | All operations: send emails, manage domains, webhooks, contacts |
| `sending_access` | Only send emails - cannot manage resources |

### Creating API Keys via Dashboard

1. Navigate to https://resend.com/api-keys
2. Click "Create API Key"
3. Select permission level
4. Optionally restrict to specific domains

### Creating API Keys via API

```typescript
const { data, error } = await resend.apiKeys.create({
  name: 'Production Key',
  permission: 'full_access',
  domain_id: 'domain-uuid' // Optional: restrict to domain
});

// Response: { id: 'key-uuid', token: 're_xxxxxxxxx' }
// IMPORTANT: Token is only shown once
```

---

## 4. Domain Configuration

### Why Domain Verification is Required

- Resend requires a verified domain to send emails to external recipients
- Without verification, you can only send to your own email address
- Verification enables DKIM/SPF authentication for deliverability

### DNS Records Required

When you add a domain, Resend provides these DNS records:

#### 1. SPF Record (TXT)
```
Type: TXT
Host: send (or your custom return path)
Value: v=spf1 include:_spf.resend.com ~all
```

#### 2. DKIM Record (TXT)
```
Type: TXT
Host: resend._domainkey
Value: [Provided by Resend - public key]
```

#### 3. MX Record (for bounce handling)
```
Type: MX
Host: send (or your custom return path)
Value: feedback-smtp.resend.com
Priority: 10
```

### Domain Verification via API

```typescript
// Create domain
const { data: domain } = await resend.domains.create({
  name: 'updates.yourdomain.com',
  region: 'us-east-1' // Optional
});

// Verify domain (after DNS records are set)
const { data: verified } = await resend.domains.verify(domain.id);

// Check domain status
const { data: status } = await resend.domains.get(domain.id);
```

### Domain Status Values

| Status | Description |
|--------|-------------|
| `not_started` | Domain added, verification not initiated |
| `pending` | DNS records being verified (up to 72 hours) |
| `verified` | Ready for sending |
| `failed` | DNS verification failed after 72 hours |
| `temporary_failure` | Previously verified, DNS check failed |

### Custom Return Path

```typescript
await resend.domains.create({
  name: 'yourdomain.com',
  customReturnPath: 'outbound' // Instead of default 'send'
});
// Creates: outbound.yourdomain.com for return path
```

### Subdomain Strategy (Recommended)

Use subdomains to isolate email reputation:

```
transactional.yourdomain.com  → Auth emails, receipts
marketing.yourdomain.com      → Newsletters, campaigns
notifications.yourdomain.com  → System alerts
```

---

## 5. Core Email Sending API

### Basic Email Send

```typescript
const { data, error } = await resend.emails.send({
  from: 'Acme <noreply@updates.yourdomain.com>',
  to: ['user@example.com'],
  subject: 'Welcome to Acme',
  html: '<h1>Welcome!</h1><p>Thanks for signing up.</p>',
  text: 'Welcome! Thanks for signing up.' // Optional but recommended
});

if (error) {
  console.error('Failed to send:', error);
  return;
}

console.log('Email sent:', data.id);
// Response: { id: '49a3999c-0ce1-4ea6-ab68-afcd6dc2e794' }
```

### Complete Send Parameters

```typescript
interface SendEmailParams {
  // Required
  from: string;          // "Name <email@domain>" or "email@domain"
  to: string | string[]; // Max 50 recipients
  subject: string;

  // Content (one required)
  html?: string;         // HTML content
  text?: string;         // Plain text (auto-generated from HTML if omitted)
  react?: React.ReactNode; // React Email component (Node.js SDK only)

  // Optional recipients
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string | string[];

  // Attachments (max 40MB total after Base64 encoding)
  attachments?: Array<{
    filename: string;
    content?: string | Buffer; // Base64 or Buffer
    path?: string;             // Remote URL
  }>;

  // Custom headers
  headers?: Record<string, string>;

  // Tags for filtering/analytics
  tags?: Array<{
    name: string;  // Max 256 chars, a-zA-Z0-9_-
    value: string; // Max 256 chars, a-zA-Z0-9_-
  }>;

  // Scheduling
  scheduledAt?: string; // ISO 8601, max 72 hours ahead

  // Template (alternative to html/text/react)
  template?: {
    id: string;           // Template ID or alias
    variables?: Record<string, string | number>;
  };
}
```

### Using React Email Templates

```typescript
import { WelcomeEmail } from './emails/welcome';

const { data, error } = await resend.emails.send({
  from: 'Acme <noreply@acme.com>',
  to: ['user@example.com'],
  subject: 'Welcome to Acme',
  react: WelcomeEmail({ firstName: 'John', company: 'Acme' })
});
```

### Using Stored Templates

```typescript
const { data, error } = await resend.emails.send({
  from: 'Acme <noreply@acme.com>',
  to: ['user@example.com'],
  subject: 'Your order confirmation',
  template: {
    id: 'order-confirmation', // Template ID or alias
    variables: {
      orderId: '12345',
      total: '99.99',
      customerName: 'John Doe'
    }
  }
});
```

### Sending with Attachments

```typescript
import fs from 'fs';

// From local file (Base64)
const { data } = await resend.emails.send({
  from: 'billing@acme.com',
  to: ['customer@example.com'],
  subject: 'Your Invoice',
  html: '<p>Please find your invoice attached.</p>',
  attachments: [
    {
      filename: 'invoice.pdf',
      content: fs.readFileSync('./invoice.pdf').toString('base64')
    }
  ]
});

// From remote URL
const { data } = await resend.emails.send({
  from: 'reports@acme.com',
  to: ['team@example.com'],
  subject: 'Monthly Report',
  html: '<p>Report attached.</p>',
  attachments: [
    {
      filename: 'report.pdf',
      path: 'https://storage.example.com/reports/monthly.pdf'
    }
  ]
});
```

### Custom Headers

```typescript
const { data } = await resend.emails.send({
  from: 'noreply@acme.com',
  to: ['user@example.com'],
  subject: 'Test',
  html: '<p>Hello</p>',
  headers: {
    'X-Custom-Header': 'custom-value',
    'List-Unsubscribe': '<mailto:unsubscribe@acme.com>'
  }
});
```

### Idempotency Keys

Prevent duplicate sends on retry:

```typescript
const { data, error } = await resend.emails.send(
  {
    from: 'noreply@acme.com',
    to: ['user@example.com'],
    subject: 'Order Confirmation',
    html: '<p>Your order is confirmed.</p>'
  },
  {
    headers: {
      'Idempotency-Key': `order-confirmation-${orderId}-${userId}`
    }
  }
);
```

**Idempotency Key Rules:**
- 1-256 characters
- Expire after 24 hours
- Same key + same payload = returns original response
- Same key + different payload = returns 409 error

---

## 6. Magic Link Authentication Implementation

### Architecture Overview

Magic link authentication flow:

```
1. User enters email → 
2. Server generates secure token → 
3. Server stores token with expiry → 
4. Server sends magic link email via Resend → 
5. User clicks link → 
6. Server validates token → 
7. Server creates session → 
8. User is authenticated
```

### Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Token entropy | Minimum 256-bit (32 bytes) |
| Token expiry | 10-30 minutes recommended |
| Single use | Delete/invalidate after use |
| Rate limiting | Max 1 request per 60 seconds per email |
| HTTPS only | Magic link URLs must use HTTPS |

### Database Schema (Example: PostgreSQL)

```sql
CREATE TABLE magic_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_email ON magic_links(email);
CREATE INDEX idx_magic_links_expires ON magic_links(expires_at);
```

### Token Generation

```typescript
import crypto from 'crypto';

function generateMagicToken(): string {
  // 32 bytes = 256 bits of entropy
  return crypto.randomBytes(32).toString('hex');
}

function generateSecureToken(): string {
  // Alternative: URL-safe base64
  return crypto.randomBytes(32).toString('base64url');
}
```

### Complete Magic Link Service

```typescript
// services/magic-link.service.ts
import { Resend } from 'resend';
import crypto from 'crypto';
import { db } from '@/lib/database';
import { MagicLinkEmail } from '@/emails/magic-link';

const resend = new Resend(process.env.RESEND_API_KEY);

interface MagicLinkConfig {
  expiryMinutes: number;
  baseUrl: string;
  fromEmail: string;
  fromName: string;
}

const config: MagicLinkConfig = {
  expiryMinutes: 15,
  baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
  fromEmail: 'auth@yourdomain.com',
  fromName: 'YourApp'
};

export class MagicLinkService {
  /**
   * Request a magic link for authentication
   */
  async requestMagicLink(
    email: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ success: boolean; error?: string }> {
    
    // 1. Rate limiting check
    const recentRequest = await db.magicLinks.findFirst({
      where: {
        email: email.toLowerCase(),
        createdAt: {
          gte: new Date(Date.now() - 60 * 1000) // Last 60 seconds
        }
      }
    });

    if (recentRequest) {
      return { 
        success: false, 
        error: 'Please wait before requesting another magic link' 
      };
    }

    // 2. Generate secure token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + config.expiryMinutes * 60 * 1000);

    // 3. Find or create user (optional - depends on your auth flow)
    let user = await db.users.findUnique({
      where: { email: email.toLowerCase() }
    });

    // 4. Store magic link
    await db.magicLinks.create({
      data: {
        email: email.toLowerCase(),
        token,
        expiresAt,
        userId: user?.id,
        ipAddress,
        userAgent
      }
    });

    // 5. Generate magic link URL
    const magicLinkUrl = `${config.baseUrl}/auth/verify?token=${token}`;

    // 6. Send email via Resend
    const { data, error } = await resend.emails.send({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: [email],
      subject: `Sign in to ${config.fromName}`,
      react: MagicLinkEmail({
        magicLink: magicLinkUrl,
        expiryMinutes: config.expiryMinutes
      }),
      // Add tags for tracking
      tags: [
        { name: 'category', value: 'authentication' },
        { name: 'type', value: 'magic_link' }
      ]
    });

    if (error) {
      console.error('Failed to send magic link:', error);
      // Clean up the stored token on email failure
      await db.magicLinks.delete({ where: { token } });
      return { success: false, error: 'Failed to send email' };
    }

    return { success: true };
  }

  /**
   * Verify magic link token and authenticate user
   */
  async verifyMagicLink(
    token: string
  ): Promise<{ 
    success: boolean; 
    user?: { id: string; email: string }; 
    error?: string 
  }> {
    
    // 1. Find the magic link
    const magicLink = await db.magicLinks.findUnique({
      where: { token }
    });

    // 2. Validate token exists
    if (!magicLink) {
      return { success: false, error: 'Invalid or expired link' };
    }

    // 3. Check if already used
    if (magicLink.usedAt) {
      return { success: false, error: 'This link has already been used' };
    }

    // 4. Check expiry
    if (new Date() > magicLink.expiresAt) {
      // Clean up expired token
      await db.magicLinks.delete({ where: { token } });
      return { success: false, error: 'This link has expired' };
    }

    // 5. Mark as used (single-use enforcement)
    await db.magicLinks.update({
      where: { token },
      data: { usedAt: new Date() }
    });

    // 6. Get or create user
    let user = await db.users.findUnique({
      where: { email: magicLink.email }
    });

    if (!user) {
      // Create new user (for sign-up flow)
      user = await db.users.create({
        data: {
          email: magicLink.email,
          emailVerified: new Date()
        }
      });
    } else if (!user.emailVerified) {
      // Mark email as verified
      await db.users.update({
        where: { id: user.id },
        data: { emailVerified: new Date() }
      });
    }

    // 7. Clean up old magic links for this email
    await db.magicLinks.deleteMany({
      where: {
        email: magicLink.email,
        token: { not: token }
      }
    });

    return { 
      success: true, 
      user: { id: user.id, email: user.email } 
    };
  }

  /**
   * Clean up expired magic links (run via cron)
   */
  async cleanupExpiredLinks(): Promise<number> {
    const result = await db.magicLinks.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    });
    return result.count;
  }
}
```

### Magic Link Email Template

```tsx
// emails/magic-link.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from '@react-email/components';

interface MagicLinkEmailProps {
  magicLink: string;
  expiryMinutes: number;
}

export function MagicLinkEmail({ 
  magicLink, 
  expiryMinutes = 15 
}: MagicLinkEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Sign in to YourApp</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto p-8 rounded-lg shadow-lg max-w-xl">
            <Heading className="text-2xl font-bold text-gray-900 text-center">
              Sign in to YourApp
            </Heading>
            
            <Text className="text-gray-600 text-center mt-4">
              Click the button below to sign in. This link will expire in {expiryMinutes} minutes.
            </Text>
            
            <Section className="text-center mt-8">
              <Button
                href={magicLink}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold no-underline"
              >
                Sign in to YourApp
              </Button>
            </Section>
            
            <Text className="text-gray-500 text-sm mt-8 text-center">
              If you didn't request this email, you can safely ignore it.
            </Text>
            
            <Text className="text-gray-400 text-xs mt-4 text-center">
              If the button doesn't work, copy and paste this link:
              <br />
              <Link href={magicLink} className="text-blue-600">
                {magicLink}
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default MagicLinkEmail;
```

### API Route Implementation (Next.js App Router)

```typescript
// app/api/auth/magic-link/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MagicLinkService } from '@/services/magic-link.service';
import { z } from 'zod';

const magicLinkService = new MagicLinkService();

const requestSchema = z.object({
  email: z.string().email('Invalid email address')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    const result = await magicLinkService.requestMagicLink(
      email,
      request.headers.get('x-forwarded-for') || request.ip,
      request.headers.get('user-agent') || undefined
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 429 }
      );
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ 
      message: 'If an account exists, a magic link has been sent' 
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Magic link request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

```typescript
// app/api/auth/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MagicLinkService } from '@/services/magic-link.service';
import { createSession } from '@/lib/session';

const magicLinkService = new MagicLinkService();

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(
      new URL('/auth/error?code=missing_token', request.url)
    );
  }

  const result = await magicLinkService.verifyMagicLink(token);

  if (!result.success) {
    return NextResponse.redirect(
      new URL(`/auth/error?code=invalid_token&message=${encodeURIComponent(result.error!)}`, request.url)
    );
  }

  // Create session
  const session = await createSession(result.user!);
  
  // Redirect to dashboard with session cookie
  const response = NextResponse.redirect(
    new URL('/dashboard', request.url)
  );
  
  response.cookies.set('session', session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  return response;
}
```

### Auth.js (NextAuth) Integration

If using Auth.js/NextAuth, Resend has first-class support:

```typescript
// auth.ts
import NextAuth from 'next-auth';
import Resend from 'next-auth/providers/resend';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Resend({
      from: 'auth@yourdomain.com',
      // Optional: custom sendVerificationRequest
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);
        const { data, error } = await resend.emails.send({
          from: provider.from,
          to: identifier,
          subject: `Sign in to ${host}`,
          html: `<a href="${url}">Sign in</a>`,
          text: `Sign in: ${url}`
        });
        
        if (error) {
          throw new Error('Failed to send verification email');
        }
      }
    })
  ],
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error'
  }
});
```

---

## 7. React Email Templates

### Installation & Setup

```bash
npm install @react-email/components
npm install react-email --save-dev
```

### Project Structure

```
src/
├── emails/
│   ├── components/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── button.tsx
│   ├── magic-link.tsx
│   ├── welcome.tsx
│   ├── password-reset.tsx
│   └── order-confirmation.tsx
└── lib/
    └── email.ts
```

### Available Components

```typescript
import {
  Html,           // Root element
  Head,           // HTML head for styles
  Body,           // Body wrapper
  Container,      // Centered content container
  Section,        // Section grouping
  Row,            // Table row
  Column,         // Table column
  Heading,        // h1-h6
  Text,           // Paragraph text
  Link,           // Anchor links
  Button,         // Call-to-action buttons
  Img,            // Images
  Hr,             // Horizontal rule
  Preview,        // Email preview text
  Tailwind,       // Tailwind CSS support
  Font,           // Custom fonts
  Markdown,       // Render markdown
  CodeBlock,      // Syntax-highlighted code
  CodeInline,     // Inline code
} from '@react-email/components';
```

### Complete Email Template Example

```tsx
// emails/welcome.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

interface WelcomeEmailProps {
  firstName: string;
  company: string;
  loginUrl: string;
}

export function WelcomeEmail({
  firstName = 'User',
  company = 'Acme',
  loginUrl = 'https://app.acme.com/login'
}: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to {company} - Let's get started!</Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="bg-white mx-auto p-8 rounded-lg shadow max-w-xl my-8">
            {/* Logo */}
            <Img
              src="https://yourdomain.com/logo.png"
              alt={company}
              width={120}
              height={40}
              className="mx-auto"
            />
            
            <Heading className="text-2xl font-bold text-gray-900 text-center mt-6">
              Welcome to {company}, {firstName}!
            </Heading>
            
            <Text className="text-gray-600 text-base leading-relaxed mt-4">
              We're thrilled to have you on board. Your account is ready, and you can 
              start exploring all the features we have to offer.
            </Text>
            
            <Section className="text-center mt-8">
              <Button
                href={loginUrl}
                className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-base no-underline"
              >
                Get Started
              </Button>
            </Section>
            
            <Hr className="my-8 border-gray-200" />
            
            <Text className="text-gray-600 text-base">
              Here's what you can do next:
            </Text>
            
            <ul className="text-gray-600 text-base mt-4 space-y-2">
              <li>✓ Complete your profile</li>
              <li>✓ Explore the dashboard</li>
              <li>✓ Invite your team members</li>
            </ul>
            
            <Hr className="my-8 border-gray-200" />
            
            <Text className="text-gray-400 text-sm text-center">
              Need help? Contact us at{' '}
              <Link href="mailto:support@acme.com" className="text-blue-600">
                support@acme.com
              </Link>
            </Text>
            
            <Text className="text-gray-400 text-xs text-center mt-4">
              {company} Inc. • 123 Main St • San Francisco, CA 94105
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default WelcomeEmail;
```

### Reusable Components

```tsx
// emails/components/email-button.tsx
import { Button } from '@react-email/components';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function EmailButton({ 
  href, 
  children, 
  variant = 'primary' 
}: EmailButtonProps) {
  const baseClasses = "px-6 py-3 rounded-lg font-semibold text-center no-underline";
  const variantClasses = variant === 'primary' 
    ? "bg-blue-600 text-white" 
    : "bg-gray-100 text-gray-900 border border-gray-300";
    
  return (
    <Button href={href} className={`${baseClasses} ${variantClasses}`}>
      {children}
    </Button>
  );
}
```

### Email Service Wrapper

```typescript
// lib/email.ts
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/welcome';
import { MagicLinkEmail } from '@/emails/magic-link';
import { PasswordResetEmail } from '@/emails/password-reset';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = 'YourApp <noreply@yourdomain.com>';

export const emailService = {
  async sendWelcome(to: string, firstName: string) {
    return resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: 'Welcome to YourApp!',
      react: WelcomeEmail({ 
        firstName, 
        company: 'YourApp',
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
      }),
      tags: [{ name: 'category', value: 'onboarding' }]
    });
  },

  async sendMagicLink(to: string, magicLink: string) {
    return resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: 'Sign in to YourApp',
      react: MagicLinkEmail({ magicLink, expiryMinutes: 15 }),
      tags: [{ name: 'category', value: 'authentication' }]
    });
  },

  async sendPasswordReset(to: string, resetLink: string) {
    return resend.emails.send({
      from: FROM_ADDRESS,
      to: [to],
      subject: 'Reset your password',
      react: PasswordResetEmail({ resetLink }),
      tags: [{ name: 'category', value: 'authentication' }]
    });
  }
};
```

### Development Preview

```bash
# Start React Email preview server
npx react-email dev

# Opens at http://localhost:3000
# Hot-reload for email development
```

---

## 8. Webhooks System

### Webhook Event Types

| Event | Description |
|-------|-------------|
| `email.sent` | API request successful, delivery attempted |
| `email.delivered` | Email delivered to recipient's server |
| `email.delivery_delayed` | Temporary delivery issue (full inbox, etc.) |
| `email.bounced` | Permanent delivery failure |
| `email.complained` | Recipient marked as spam |
| `email.opened` | Email opened (requires tracking enabled) |
| `email.clicked` | Link clicked (requires tracking enabled) |
| `email.received` | Inbound email received |
| `email.failed` | Email failed to send |
| `contact.created` | Contact added |
| `contact.updated` | Contact modified |
| `contact.deleted` | Contact removed |
| `domain.created` | Domain added |
| `domain.updated` | Domain modified |
| `domain.deleted` | Domain removed |

### Webhook Payload Structure

```typescript
interface WebhookPayload {
  type: string;          // Event type
  created_at: string;    // ISO 8601 timestamp
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    // Event-specific fields
    bounce?: {
      type: 'Permanent' | 'Transient' | 'Undetermined';
      subType: string;
      message: string;
    };
    click?: {
      link: string;
      timestamp: string;
      ipAddress: string;
      userAgent: string;
    };
    tags?: Record<string, string>;
    broadcast_id?: string;
    template_id?: string;
  };
}
```

### Webhook Handler Implementation

```typescript
// app/api/webhooks/resend/route.ts
import { Resend } from 'resend';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // CRITICAL: Get raw body for signature verification
    const payload = await request.text();
    
    // Verify webhook signature
    const event = resend.webhooks.verify({
      payload,
      headers: {
        'svix-id': request.headers.get('svix-id'),
        'svix-timestamp': request.headers.get('svix-timestamp'),
        'svix-signature': request.headers.get('svix-signature'),
      },
      secret: process.env.RESEND_WEBHOOK_SECRET!
    });

    // Process event based on type
    switch (event.type) {
      case 'email.sent':
        await handleEmailSent(event.data);
        break;
        
      case 'email.delivered':
        await handleEmailDelivered(event.data);
        break;
        
      case 'email.bounced':
        await handleEmailBounced(event.data);
        break;
        
      case 'email.complained':
        await handleEmailComplained(event.data);
        break;
        
      case 'email.opened':
        await handleEmailOpened(event.data);
        break;
        
      case 'email.clicked':
        await handleEmailClicked(event.data);
        break;
        
      default:
        console.log(`Unhandled webhook event: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    );
  }
}

async function handleEmailSent(data: any) {
  await db.emailLogs.create({
    data: {
      emailId: data.email_id,
      status: 'sent',
      to: data.to,
      subject: data.subject,
      sentAt: new Date(data.created_at)
    }
  });
}

async function handleEmailDelivered(data: any) {
  await db.emailLogs.update({
    where: { emailId: data.email_id },
    data: { 
      status: 'delivered',
      deliveredAt: new Date()
    }
  });
}

async function handleEmailBounced(data: any) {
  // Update email log
  await db.emailLogs.update({
    where: { emailId: data.email_id },
    data: { 
      status: 'bounced',
      bounceType: data.bounce.type,
      bounceMessage: data.bounce.message
    }
  });

  // For hard bounces, add to suppression list
  if (data.bounce.type === 'Permanent') {
    const email = data.to[0];
    await db.suppressionList.upsert({
      where: { email },
      create: {
        email,
        reason: 'hard_bounce',
        bouncedAt: new Date()
      },
      update: {
        reason: 'hard_bounce',
        bouncedAt: new Date()
      }
    });
  }
}

async function handleEmailComplained(data: any) {
  const email = data.to[0];
  
  // Add to suppression list
  await db.suppressionList.upsert({
    where: { email },
    create: {
      email,
      reason: 'spam_complaint',
      complainedAt: new Date()
    },
    update: {
      reason: 'spam_complaint',
      complainedAt: new Date()
    }
  });

  // Unsubscribe user
  await db.users.update({
    where: { email },
    data: { unsubscribedAt: new Date() }
  });
}

async function handleEmailOpened(data: any) {
  await db.emailEvents.create({
    data: {
      emailId: data.email_id,
      event: 'opened',
      timestamp: new Date()
    }
  });
}

async function handleEmailClicked(data: any) {
  await db.emailEvents.create({
    data: {
      emailId: data.email_id,
      event: 'clicked',
      link: data.click.link,
      timestamp: new Date(data.click.timestamp),
      ipAddress: data.click.ipAddress,
      userAgent: data.click.userAgent
    }
  });
}
```

### Webhook Retry Schedule

If Resend doesn't receive HTTP 200, retries occur:

| Attempt | Delay |
|---------|-------|
| 1 | 5 seconds |
| 2 | 5 minutes |
| 3 | 30 minutes |
| 4 | 2 hours |
| 5 | 5 hours |
| 6 | 10 hours |

### Webhook IP Allowlist

If firewall rules required:

```
44.228.126.217
50.112.21.217
52.24.126.164
54.148.139.208
2600:1f24:64:8000::/52 (IPv6)
```

### Creating Webhooks via API

```typescript
const { data, error } = await resend.webhooks.create({
  url: 'https://yourdomain.com/api/webhooks/resend',
  events: [
    'email.sent',
    'email.delivered',
    'email.bounced',
    'email.complained'
  ]
});

// Response includes signing secret
console.log('Webhook secret:', data.secret); // whsec_xxxxxxxxx
```

---

## 9. Error Handling

### Error Response Format

```typescript
interface ResendError {
  statusCode: number;
  message: string;
  name: string;
}
```

### Complete Error Reference

| Status | Type | Message | Action |
|--------|------|---------|--------|
| 400 | `invalid_idempotency_key` | Key must be 1-256 chars | Fix key format |
| 400 | `validation_error` | Field validation failed | Check error details |
| 401 | `missing_api_key` | No API key in header | Add `Authorization: Bearer` |
| 401 | `restricted_api_key` | Key lacks permissions | Use full_access key |
| 403 | `invalid_api_key` | Key is invalid | Regenerate key |
| 403 | `validation_error` | Domain not verified | Verify domain |
| 404 | `not_found` | Endpoint doesn't exist | Check URL |
| 405 | `method_not_allowed` | Wrong HTTP method | Use correct method |
| 409 | `invalid_idempotent_request` | Key reused with different payload | Change key or payload |
| 422 | `invalid_attachment` | Attachment missing content/path | Provide content or path |
| 422 | `invalid_from_address` | From address invalid | Use `email@domain` format |
| 422 | `missing_required_field` | Required field missing | Add required fields |
| 429 | `rate_limit_exceeded` | Too many requests | Implement backoff |
| 429 | `daily_quota_exceeded` | Daily limit reached | Upgrade or wait 24h |
| 429 | `monthly_quota_exceeded` | Monthly limit reached | Upgrade plan |
| 451 | `security_error` | Security issue detected | Contact support |
| 500 | `application_error` | Internal error | Retry later |
| 500 | `internal_server_error` | Server error | Retry later |

### Error Handling Implementation

```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmailWithErrorHandling(params: SendEmailParams) {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await resend.emails.send(params);

      // Resend SDK returns error in response, not exception
      if (error) {
        lastError = error;
        
        // Non-retryable errors
        if ([400, 401, 403, 422].includes(error.statusCode)) {
          console.error('Non-retryable error:', error);
          return { success: false, error };
        }

        // Rate limit - wait and retry
        if (error.statusCode === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          console.log(`Rate limited. Waiting ${waitTime}ms before retry...`);
          await sleep(waitTime);
          continue;
        }

        // Server error - retry
        if (error.statusCode >= 500) {
          const waitTime = Math.pow(2, attempt) * 1000;
          console.log(`Server error. Retrying in ${waitTime}ms...`);
          await sleep(waitTime);
          continue;
        }

        return { success: false, error };
      }

      return { success: true, data };

    } catch (err) {
      lastError = err;
      console.error(`Attempt ${attempt} failed:`, err);
      
      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000);
      }
    }
  }

  return { success: false, error: lastError };
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 10. Rate Limiting & Quotas

### Rate Limits

| Limit Type | Default | Notes |
|------------|---------|-------|
| API requests | 2/second | Per API key |
| Batch emails | 100/request | Single API call |

### Rate Limit Headers

```http
RateLimit-Limit: 2
RateLimit-Remaining: 1
RateLimit-Reset: 1640000000
Retry-After: 1
```

### Email Quotas (by Plan)

| Plan | Daily | Monthly | Contacts |
|------|-------|---------|----------|
| Free | 100 | 3,000 | 100 |
| Pro | Unlimited | Based on plan | Based on plan |
| Enterprise | Unlimited | Custom | Custom |

### Quota Headers

```http
X-Resend-Send-Quota-Limit: 3000
X-Resend-Send-Quota-Remaining: 2847
X-Resend-Send-Quota-Reset: 2024-02-01T00:00:00Z
```

### Queue Implementation for Rate Limiting

```typescript
// lib/email-queue.ts
import { Resend } from 'resend';

interface QueuedEmail {
  params: any;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class EmailQueue {
  private queue: QueuedEmail[] = [];
  private processing = false;
  private resend: Resend;
  private requestsPerSecond = 2;
  private interval = 1000 / this.requestsPerSecond; // 500ms

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async send(params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ params, resolve, reject });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    
    this.processing = true;

    while (this.queue.length > 0) {
      const { params, resolve, reject } = this.queue.shift()!;

      try {
        const result = await this.resend.emails.send(params);
        resolve(result);
      } catch (error) {
        reject(error);
      }

      // Wait to respect rate limit
      await new Promise(r => setTimeout(r, this.interval));
    }

    this.processing = false;
  }
}

export const emailQueue = new EmailQueue(process.env.RESEND_API_KEY!);
```

---

## 11. Batch Operations

### Batch Email Sending

Send up to 100 emails in a single API call:

```typescript
const { data, error } = await resend.batch.send([
  {
    from: 'Acme <noreply@acme.com>',
    to: ['user1@example.com'],
    subject: 'Hello User 1',
    html: '<p>Personalized content for user 1</p>'
  },
  {
    from: 'Acme <noreply@acme.com>',
    to: ['user2@example.com'],
    subject: 'Hello User 2',
    html: '<p>Personalized content for user 2</p>'
  },
  // ... up to 100 emails
]);

// Response
{
  data: [
    { id: 'uuid-1' },
    { id: 'uuid-2' }
  ]
}
```

### Batch Limitations

- **Max 100 emails** per batch
- **No attachments** in batch mode
- **No scheduled_at** in batch mode
- Each email counted toward quota

### Chunking for Large Lists

```typescript
async function sendBulkEmails(emails: EmailParams[]): Promise<BatchResult> {
  const BATCH_SIZE = 100;
  const results: { success: string[]; failed: string[] } = {
    success: [],
    failed: []
  };

  // Split into chunks
  const chunks: EmailParams[][] = [];
  for (let i = 0; i < emails.length; i += BATCH_SIZE) {
    chunks.push(emails.slice(i, i + BATCH_SIZE));
  }

  // Process chunks sequentially to respect rate limits
  for (const chunk of chunks) {
    const { data, error } = await resend.batch.send(chunk);

    if (error) {
      results.failed.push(...chunk.map(e => e.to[0]));
    } else if (data) {
      results.success.push(...data.map(d => d.id));
    }

    // Wait between batches
    await new Promise(r => setTimeout(r, 1000));
  }

  return results;
}
```

---

## 12. Scheduled Emails

### Scheduling an Email

```typescript
const { data, error } = await resend.emails.send({
  from: 'Acme <noreply@acme.com>',
  to: ['user@example.com'],
  subject: 'Scheduled Email',
  html: '<p>This was scheduled!</p>',
  scheduledAt: '2024-03-01T10:00:00Z' // ISO 8601 format
});

// Email status will be "scheduled" until send time
```

### Scheduling Limits

- **Max 72 hours** in advance
- **No batch scheduling**
- **No SMTP scheduling**
- **No attachments** with scheduled emails

### Updating Scheduled Email

```typescript
const { data, error } = await resend.emails.update(emailId, {
  scheduledAt: '2024-03-01T12:00:00Z' // New time
});
```

### Canceling Scheduled Email

```typescript
const { data, error } = await resend.emails.cancel(emailId);

// Once canceled, cannot be rescheduled
```

### Checking Scheduled Status

```typescript
const { data, error } = await resend.emails.get(emailId);

console.log(data.status); // 'scheduled' | 'sent' | 'delivered' | etc.
console.log(data.scheduledAt); // '2024-03-01T10:00:00Z'
```

---

## 13. Production Best Practices

### Environment Configuration

```typescript
// config/email.ts
export const emailConfig = {
  apiKey: process.env.RESEND_API_KEY!,
  webhookSecret: process.env.RESEND_WEBHOOK_SECRET!,
  fromAddress: process.env.EMAIL_FROM_ADDRESS || 'noreply@yourdomain.com',
  fromName: process.env.EMAIL_FROM_NAME || 'YourApp',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL!,
  
  // Feature flags
  enableTracking: process.env.EMAIL_TRACKING === 'true',
  
  // Rate limiting
  maxRetries: 3,
  retryDelay: 1000,
};
```

### Suppression List Management

```typescript
// Check suppression list before sending
async function canSendTo(email: string): Promise<boolean> {
  const suppressed = await db.suppressionList.findUnique({
    where: { email: email.toLowerCase() }
  });
  
  return !suppressed;
}

// Pre-filter recipients
async function filterRecipients(emails: string[]): Promise<string[]> {
  const suppressed = await db.suppressionList.findMany({
    where: { email: { in: emails.map(e => e.toLowerCase()) } },
    select: { email: true }
  });
  
  const suppressedSet = new Set(suppressed.map(s => s.email));
  return emails.filter(e => !suppressedSet.has(e.toLowerCase()));
}
```

### Logging & Monitoring

```typescript
// lib/email-logger.ts
import { logger } from '@/lib/logger';

export async function logEmailSend(
  result: { data?: any; error?: any },
  params: any,
  duration: number
) {
  const logData = {
    to: params.to,
    subject: params.subject,
    success: !result.error,
    emailId: result.data?.id,
    error: result.error?.message,
    duration,
    timestamp: new Date().toISOString()
  };

  if (result.error) {
    logger.error('Email send failed', logData);
  } else {
    logger.info('Email sent successfully', logData);
  }

  // Store in database for analytics
  await db.emailLogs.create({ data: logData });
}
```

### Health Check Endpoint

```typescript
// app/api/health/email/route.ts
import { Resend } from 'resend';

export async function GET() {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    // Test API connectivity
    const { data, error } = await resend.domains.list();
    
    if (error) {
      return Response.json(
        { status: 'unhealthy', error: error.message },
        { status: 503 }
      );
    }

    return Response.json({
      status: 'healthy',
      domains: data.data.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Connection failed' },
      { status: 503 }
    );
  }
}
```

### Testing with Test Emails

Resend provides test email addresses that simulate events:

| Email | Behavior |
|-------|----------|
| `delivered@resend.dev` | Simulates successful delivery |
| `bounced@resend.dev` | Simulates hard bounce |
| `complained@resend.dev` | Simulates spam complaint |

```typescript
// Use in development/testing
if (process.env.NODE_ENV === 'development') {
  const testRecipient = 'delivered@resend.dev';
}
```

### Security Checklist

- [ ] API keys stored in environment variables
- [ ] Webhook signatures verified on all endpoints
- [ ] Magic link tokens use cryptographic randomness (32+ bytes)
- [ ] Magic links expire within 15-30 minutes
- [ ] Magic links are single-use only
- [ ] Rate limiting on authentication endpoints
- [ ] HTTPS enforced for all magic link URLs
- [ ] Suppression list checked before sending
- [ ] Hard bounces automatically suppressed
- [ ] Spam complaints automatically unsubscribed

---

## 14. Complete Code Examples

### Full Email Service Implementation

```typescript
// services/email.service.ts
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/welcome';
import { MagicLinkEmail } from '@/emails/magic-link';
import { PasswordResetEmail } from '@/emails/password-reset';
import { emailConfig } from '@/config/email';
import { db } from '@/lib/database';

const resend = new Resend(emailConfig.apiKey);

export class EmailService {
  private async canSend(email: string): Promise<boolean> {
    const suppressed = await db.suppressionList.findUnique({
      where: { email: email.toLowerCase() }
    });
    return !suppressed;
  }

  private async logSend(
    type: string,
    to: string,
    result: { data?: any; error?: any }
  ) {
    await db.emailLogs.create({
      data: {
        type,
        to,
        emailId: result.data?.id,
        status: result.error ? 'failed' : 'sent',
        error: result.error?.message,
        sentAt: new Date()
      }
    });
  }

  async sendWelcome(to: string, firstName: string) {
    if (!(await this.canSend(to))) {
      return { success: false, error: 'Email suppressed' };
    }

    const result = await resend.emails.send({
      from: `${emailConfig.fromName} <${emailConfig.fromAddress}>`,
      to: [to],
      subject: `Welcome to ${emailConfig.fromName}!`,
      react: WelcomeEmail({
        firstName,
        company: emailConfig.fromName,
        loginUrl: `${emailConfig.baseUrl}/login`
      }),
      tags: [
        { name: 'category', value: 'onboarding' },
        { name: 'template', value: 'welcome' }
      ]
    });

    await this.logSend('welcome', to, result);
    return result;
  }

  async sendMagicLink(to: string, token: string) {
    if (!(await this.canSend(to))) {
      return { success: false, error: 'Email suppressed' };
    }

    const magicLink = `${emailConfig.baseUrl}/auth/verify?token=${token}`;

    const result = await resend.emails.send({
      from: `${emailConfig.fromName} <${emailConfig.fromAddress}>`,
      to: [to],
      subject: `Sign in to ${emailConfig.fromName}`,
      react: MagicLinkEmail({ magicLink, expiryMinutes: 15 }),
      tags: [
        { name: 'category', value: 'authentication' },
        { name: 'template', value: 'magic_link' }
      ]
    });

    await this.logSend('magic_link', to, result);
    return result;
  }

  async sendPasswordReset(to: string, token: string) {
    if (!(await this.canSend(to))) {
      return { success: false, error: 'Email suppressed' };
    }

    const resetLink = `${emailConfig.baseUrl}/auth/reset-password?token=${token}`;

    const result = await resend.emails.send({
      from: `${emailConfig.fromName} <${emailConfig.fromAddress}>`,
      to: [to],
      subject: 'Reset your password',
      react: PasswordResetEmail({ resetLink }),
      tags: [
        { name: 'category', value: 'authentication' },
        { name: 'template', value: 'password_reset' }
      ]
    });

    await this.logSend('password_reset', to, result);
    return result;
  }

  async sendTransactional(
    to: string,
    subject: string,
    html: string,
    options?: {
      replyTo?: string;
      attachments?: Array<{ filename: string; content: string }>;
      tags?: Array<{ name: string; value: string }>;
    }
  ) {
    if (!(await this.canSend(to))) {
      return { success: false, error: 'Email suppressed' };
    }

    const result = await resend.emails.send({
      from: `${emailConfig.fromName} <${emailConfig.fromAddress}>`,
      to: [to],
      subject,
      html,
      replyTo: options?.replyTo,
      attachments: options?.attachments,
      tags: options?.tags
    });

    await this.logSend('transactional', to, result);
    return result;
  }
}

export const emailService = new EmailService();
```

### Express.js Webhook Handler

```typescript
// routes/webhooks.ts
import express from 'express';
import { Resend } from 'resend';
import { db } from '../lib/database';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANT: Use raw body parser for signature verification
router.post(
  '/resend',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    try {
      const event = resend.webhooks.verify({
        payload: req.body.toString(),
        headers: {
          'svix-id': req.headers['svix-id'] as string,
          'svix-timestamp': req.headers['svix-timestamp'] as string,
          'svix-signature': req.headers['svix-signature'] as string,
        },
        secret: process.env.RESEND_WEBHOOK_SECRET!
      });

      // Handle event
      await handleWebhookEvent(event);
      
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ error: 'Invalid webhook' });
    }
  }
);

async function handleWebhookEvent(event: any) {
  switch (event.type) {
    case 'email.bounced':
      if (event.data.bounce.type === 'Permanent') {
        await db.suppressionList.upsert({
          where: { email: event.data.to[0] },
          create: { email: event.data.to[0], reason: 'hard_bounce' },
          update: { reason: 'hard_bounce' }
        });
      }
      break;
      
    case 'email.complained':
      await db.suppressionList.upsert({
        where: { email: event.data.to[0] },
        create: { email: event.data.to[0], reason: 'complaint' },
        update: { reason: 'complaint' }
      });
      break;
  }
}

export default router;
```

---

## Quick Reference Card

### SDK Methods

```typescript
// Emails
resend.emails.send(params)
resend.emails.get(id)
resend.emails.update(id, params)
resend.emails.cancel(id)
resend.batch.send(emails[])

// Domains
resend.domains.create(params)
resend.domains.verify(id)
resend.domains.get(id)
resend.domains.list()
resend.domains.delete(id)

// Webhooks
resend.webhooks.create(params)
resend.webhooks.get(id)
resend.webhooks.list()
resend.webhooks.update(id, params)
resend.webhooks.delete(id)
resend.webhooks.verify(params)

// API Keys
resend.apiKeys.create(params)
resend.apiKeys.list()
resend.apiKeys.delete(id)

// Contacts
resend.contacts.create(params)
resend.contacts.get(id)
resend.contacts.list()
resend.contacts.update(id, params)
resend.contacts.delete(id)
```

### Common Environment Variables

```env
RESEND_API_KEY=re_xxxxxxxxx
RESEND_WEBHOOK_SECRET=whsec_xxxxxxxxx
EMAIL_FROM_ADDRESS=noreply@yourdomain.com
EMAIL_FROM_NAME=YourApp
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### HTTP Status Codes Summary

| Code | Meaning | Retry? |
|------|---------|--------|
| 200 | Success | No |
| 400 | Bad Request | No |
| 401 | Unauthorized | No |
| 403 | Forbidden | No |
| 404 | Not Found | No |
| 422 | Validation Error | No |
| 429 | Rate Limited | Yes, with backoff |
| 500 | Server Error | Yes, with backoff |

---

## Changelog & Version Notes

- **Resend SDK Version:** Check npm for latest
- **API Version:** v1
- **React Email Version:** 5.x recommended
- **Documentation Source:** https://resend.com/docs

---

*This document was compiled for AI coding agent consumption. All code examples are production-ready and follow current best practices.*
