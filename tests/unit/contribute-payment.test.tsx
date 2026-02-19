/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { PaymentClient } from '@/app/(guest)/[slug]/contribute/payment/PaymentClient';

const replaceMock = vi.fn();
const clearFlowDataMock = vi.fn();
const savePaymentAttemptDataMock = vi.fn();
const trackPaymentRedirectStartedMock = vi.fn();
const getFlowDataMock = vi.fn();
const fetchMock = vi.fn();
const assignMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

vi.mock('@/lib/contributions/flow-storage', () => ({
  getFlowData: (...args: unknown[]) => getFlowDataMock(...args),
  clearFlowData: (...args: unknown[]) => clearFlowDataMock(...args),
}));

vi.mock('@/lib/payments/recovery', () => ({
  savePaymentAttemptData: (...args: unknown[]) => savePaymentAttemptDataMock(...args),
}));

vi.mock('@/lib/analytics/metrics', () => ({
  trackPaymentRedirectStarted: (...args: unknown[]) => trackPaymentRedirectStartedMock(...args),
}));

describe('PaymentClient', () => {
  beforeEach(() => {
    replaceMock.mockReset();
    clearFlowDataMock.mockReset();
    savePaymentAttemptDataMock.mockReset();
    trackPaymentRedirectStartedMock.mockReset();
    getFlowDataMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('matchMedia', () => ({
      matches: false,
      media: '(prefers-reduced-motion: reduce)',
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    }));
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign: assignMock },
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const renderPage = (overrides?: { isAnonymous?: boolean; message?: string; amountCents?: number }) => {
    getFlowDataMock.mockReturnValue({
      amountCents: overrides?.amountCents ?? 25000,
      contributorName: 'Ava',
      isAnonymous: overrides?.isAnonymous ?? false,
      message: overrides?.message ?? 'Happy birthday',
      slug: 'maya-board',
      childName: 'Maya',
      dreamBoardId: '00000000-0000-4000-8000-000000000001',
      timestamp: Date.now(),
    });

    return render(
      <PaymentClient
        slug="maya-board"
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        childName="Maya"
        availableProviders={['payfast', 'snapscan']}
      />
    );
  };

  it('redirects back to details when flow data is missing', async () => {
    getFlowDataMock.mockReturnValue(null);
    render(
      <PaymentClient
        slug="maya-board"
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        childName="Maya"
        availableProviders={['payfast']}
      />
    );

    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith('/maya-board/contribute'));
  });

  it('renders contribution summary from flow data', () => {
    renderPage({ amountCents: 35000 });
    expect(screen.getByText(/Contributing/)).toHaveTextContent(
      /Contributing R\s*350 to Maya's Dreamboard/
    );
  });

  it('renders payment method cards and preselects card', () => {
    renderPage();
    expect(screen.getByRole('radio', { name: /Credit or Debit Card/i })).toHaveAttribute(
      'aria-checked',
      'true'
    );
    expect(screen.getByRole('radio', { name: /SnapScan/i })).toBeInTheDocument();
  });

  it('shows total amount including fee and Gifta fee label', () => {
    renderPage({ amountCents: 25000 });
    expect(screen.getByText('Gifta fee (3%)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pay R\s*257(?:[,.]50)/i })).toBeInTheDocument();
  });

  it('submits create payload and truncates message to 280 chars', async () => {
    const longMessage = 'x'.repeat(500);
    renderPage({ message: longMessage });

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ mode: 'redirect', redirectUrl: 'https://pay.example/redirect' }),
    });

    await userEvent.click(screen.getByRole('button', { name: /Pay R\s*257(?:[,.]50)/i }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.message).toHaveLength(280);
    expect(body.contributionCents).toBe(25000);
  });

  it('omits contributor name when anonymous', async () => {
    renderPage({ isAnonymous: true });
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ mode: 'redirect', redirectUrl: 'https://pay.example/redirect' }),
    });

    await userEvent.click(screen.getByRole('button', { name: /Pay R\s*257(?:[,.]50)/i }));
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.contributorName).toBeUndefined();
  });

  it('saves payment attempt and clears flow data before redirect', async () => {
    renderPage();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ mode: 'redirect', redirectUrl: 'https://pay.example/redirect' }),
    });

    await userEvent.click(screen.getByRole('button', { name: /Pay R\s*257(?:[,.]50)/i }));

    expect(savePaymentAttemptDataMock).toHaveBeenCalledWith(
      'maya-board',
      expect.objectContaining({ amountCents: 25000, paymentProvider: 'payfast' })
    );
    expect(clearFlowDataMock).toHaveBeenCalledWith('maya-board');
    expect(trackPaymentRedirectStartedMock).toHaveBeenCalledWith('payfast');
    expect(assignMock).toHaveBeenCalledWith('https://pay.example/redirect');
  });

  it('keeps back link to details page', () => {
    renderPage();
    expect(screen.getByRole('link', { name: /Back to details/i })).toHaveAttribute(
      'href',
      '/maya-board/contribute'
    );
  });
});
