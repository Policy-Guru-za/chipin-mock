import './globals.css';
import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';

import {
  isMockKarri,
  isMockPaymentWebhooks,
  isMockPayments,
  isMockSentry,
} from '@/lib/config/feature-flags';
import { getClerkConfigStatus, getClerkUrls } from '@/lib/auth/clerk-config';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-primary',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ChipIn',
  description: 'A gift pooling platform for joyful celebrations.',
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
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-surface text-text">
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
