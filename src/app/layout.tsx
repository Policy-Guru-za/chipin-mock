import './globals.css';
import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';

import {
  isMockKarri,
  isMockPaymentWebhooks,
  isMockPayments,
  isMockSentry,
} from '@/lib/config/feature-flags';
import { getClerkConfigStatus, getClerkUrls } from '@/lib/auth/clerk-config';

export const metadata: Metadata = {
  title: 'Gifta - One Dream Gift, Together.',
  description:
    "Create a Dream Board for your child's birthday. Friends and family chip in toward one meaningful gift.",
  openGraph: {
    type: 'website',
    url: 'https://gifta.co.za',
    title: 'Gifta',
    description:
      "Create a Dream Board for your child's birthday. Friends and family chip in toward one meaningful gift.",
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gifta',
    description:
      "Create a Dream Board for your child's birthday. Friends and family chip in toward one meaningful gift.",
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const activeMocks = [
    { label: 'payments', enabled: isMockPayments() },
    { label: 'payment webhooks', enabled: isMockPaymentWebhooks() },
    { label: 'karri', enabled: isMockKarri() },
    { label: 'sentry', enabled: isMockSentry() },
  ]
    .filter((mock) => mock.enabled)
    .map((mock) => mock.label);
  const bannerText =
    activeMocks.length > 0 ? `SANDBOX MODE — mock ${activeMocks.join(', ')}` : null;
  const clerkConfig = getClerkConfigStatus();
  const { signInUrl, signUpUrl, signInFallbackRedirectUrl, signUpFallbackRedirectUrl } =
    getClerkUrls();

  const layoutContent = (
    <>
      {bannerText ? (
        <div className="border-b border-border bg-accent/10 px-4 py-2 text-center text-xs font-semibold text-text">
          {bannerText}
        </div>
      ) : null}
      {children}
    </>
  );

  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-text">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary-700 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
        >
          Skip to content
        </a>
        <noscript>
          <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-3 text-center text-sm text-yellow-800">
            JavaScript is required to use Gifta. Please enable JavaScript in your browser settings.
          </div>
        </noscript>
        {clerkConfig.isEnabled ? (
          <ClerkProvider
            publishableKey={clerkConfig.publishableKey ?? ''}
            signInUrl={signInUrl}
            signUpUrl={signUpUrl}
            signInFallbackRedirectUrl={signInFallbackRedirectUrl}
            signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
          >
            {layoutContent}
          </ClerkProvider>
        ) : (
          layoutContent
        )}
      </body>
    </html>
  );
}
