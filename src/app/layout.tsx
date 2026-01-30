import './globals.css';
import type { Metadata } from 'next';
import { Fraunces, Outfit } from 'next/font/google';

import { isDemoMode } from '@/lib/demo';

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
  return (
    <html lang="en" className={`${outfit.variable} ${fraunces.variable}`}>
      <body className="min-h-screen bg-surface text-text">
        {isDemoMode() ? (
          <div className="border-b border-border bg-accent/10 px-4 py-2 text-center text-xs font-semibold text-text">
            DEMO MODE — no real payments or external services
          </div>
        ) : null}
        {children}
      </body>
    </html>
  );
}
