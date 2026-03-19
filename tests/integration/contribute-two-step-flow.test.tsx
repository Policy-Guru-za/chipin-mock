/**
 * @vitest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ContributeDetailsClient } from '@/app/(guest)/[slug]/contribute/ContributeDetailsClient';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('contribute placeholder integration', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders a Stitch-coming-soon placeholder instead of a live payment form', () => {
    render(<ContributeDetailsClient slug="maya-board" childName="Maya" />);

    expect(screen.getByText(/Stitch payments coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Online payments are not available yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Dreamboard/i })).toHaveAttribute(
      'href',
      '/maya-board'
    );
    expect(screen.queryByRole('button', { name: /Continue to payment/i })).not.toBeInTheDocument();
  });

  it('keeps closed or expired boards guarded on the public contribute route', () => {
    const detailsPage = readSource('src/app/(guest)/[slug]/contribute/page.tsx');

    expect(detailsPage).toContain('view.isClosed || view.isExpired');
  });

  it('keeps payment and failure routes redirecting back to the placeholder page', () => {
    const paymentPage = readSource('src/app/(guest)/[slug]/contribute/payment/page.tsx');
    const failedPage = readSource('src/app/(guest)/[slug]/payment-failed/page.tsx');

    expect(paymentPage).toContain('redirect(`/${slug}/contribute`)');
    expect(failedPage).toContain('redirect(`/${slug}/contribute`)');
  });
});
