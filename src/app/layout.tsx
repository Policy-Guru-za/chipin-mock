import './globals.css';
import type { Metadata, Viewport } from 'next';
import {
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Libre_Baskerville,
  Nunito,
  Outfit,
} from 'next/font/google';
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

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-dm-serif',
  display: 'swap',
});

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-libre-baskerville',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Gifta - Everyone Chips In. One Perfect Gift.',
  description:
    'Create a Dreamboard for your child\'s birthday. Friends and family chip in toward one meaningful gift — no more gift piles, no more guesswork.',
  openGraph: {
    type: 'website',
    url: 'https://gifta.co.za',
    title: 'Gifta',
    description:
      'Create a Dreamboard for your child\'s birthday. Friends and family chip in toward one meaningful gift — no more gift piles, no more guesswork.',
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
      'Create a Dreamboard for your child\'s birthday. Friends and family chip in toward one meaningful gift — no more gift piles, no more guesswork.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
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
    <html
      lang="en"
      className={`${outfit.variable} ${fraunces.variable} ${dmSans.variable} ${dmSerifDisplay.variable} ${libreBaskerville.variable} ${nunito.variable}`}
    >
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
