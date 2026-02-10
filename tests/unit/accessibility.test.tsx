import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buttonVariants } from '@/components/ui/button';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('C7 accessibility hardening', () => {
  it('keeps root layout baseline without skip-link and noscript fallback', () => {
    const layout = readSource('src/app/layout.tsx');

    expect(layout).not.toContain('href="#main-content"');
    expect(layout).not.toContain('Skip to content');
    expect(layout).not.toContain('focus:bg-primary-700');
    expect(layout).not.toContain('<noscript>');
    expect(layout).not.toContain('JavaScript is required to use Gifta.');
  });

  it('provides main-content targets for critical and standalone routes', () => {
    const guestLayout = readSource('src/app/(guest)/layout.tsx');
    const hostLayout = readSource('src/app/(host)/layout.tsx');
    const adminLayout = readSource('src/app/(admin)/layout.tsx');
    const marketingLayout = readSource('src/app/(marketing)/layout.tsx');
    const signIn = readSource('src/app/sign-in/[[...sign-in]]/page.tsx');
    const signUp = readSource('src/app/sign-up/[[...sign-up]]/page.tsx');
    const demo = readSource('src/app/demo/payment-simulator/page.tsx');

    expect(guestLayout).toContain('id="main-content"');
    expect(hostLayout).toContain('id="main-content"');
    expect(adminLayout).toContain('id="main-content"');
    expect(marketingLayout).toContain('id="main-content"');
    expect(signIn).toContain('id="main-content"');
    expect(signUp).toContain('id="main-content"');
    expect(demo).toContain('id="main-content"');
  });

  it('sets required aria labels and alert roles', () => {
    const reminderModal = readSource('src/components/contribute/ReminderModal.tsx');
    const charityModal = readSource('src/components/admin/CharityFormModal.tsx');
    const landingNav = readSource('src/components/landing/LandingNav.tsx');
    const amountSelector = readSource('src/components/forms/AmountSelector.tsx');

    expect(reminderModal).toContain('<p role="alert" className="text-sm text-red-600">');
    expect(charityModal).toContain('<p role="alert" className="text-sm text-red-600">{error}</p>');
    expect(landingNav).toContain('role="dialog"');
    expect(landingNav).toContain('aria-modal="true"');
    expect(landingNav).not.toContain('aria-label="Navigation menu"');
    expect(amountSelector).toContain('aria-label="Custom amount"');
  });

  it('enforces touch target sizing updates', () => {
    const header = readSource('src/components/layout/Header.tsx');
    const landingNav = readSource('src/components/landing/LandingNav.tsx');
    const pagination = readSource('src/components/admin/AdminPagination.tsx');
    const contributionParts = readSource('src/components/forms/ContributionFormParts.tsx');
    const iconSizeClasses = buttonVariants({ size: 'icon' });

    expect(iconSizeClasses).toContain('h-11');
    expect(iconSizeClasses).toContain('w-11');
    expect(header).toContain('min-h-[44px]');
    expect(header).toContain('min-w-[44px]');
    expect(landingNav).not.toContain('min-h-[44px]');
    expect(landingNav).not.toContain('min-w-[44px]');
    expect(pagination).toContain('min-h-[44px]');
    expect(contributionParts).toContain('min-h-[44px]');
    expect(contributionParts).toContain('min-w-[44px]');
  });

  it('adds error, not-found, and loading fallback surfaces', () => {
    const rootError = readSource('src/app/error.tsx');
    const guestError = readSource('src/app/(guest)/error.tsx');
    const hostError = readSource('src/app/(host)/error.tsx');
    const adminError = readSource('src/app/(admin)/error.tsx');
    const notFound = readSource('src/app/not-found.tsx');
    const guestLoading = readSource('src/app/(guest)/[slug]/loading.tsx');
    const hostLoading = readSource('src/app/(host)/dashboard/loading.tsx');
    const adminLoading = readSource('src/app/(admin)/admin/loading.tsx');

    expect(rootError).toContain('console.error(error)');
    expect(rootError).toContain('id="main-content"');
    expect(guestError).toContain('ErrorFallback');
    expect(hostError).toContain('Go to dashboard');
    expect(adminError).toContain('Go to admin dashboard');
    expect(notFound).toContain('Page not found');
    expect(notFound).toContain('Go home');
    expect(notFound).toContain('id="main-content"');
    expect(guestLoading).toContain('animate-pulse');
    expect(hostLoading).toContain('animate-pulse');
    expect(adminLoading).toContain('animate-pulse');
  });
});
