/**
 * @vitest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { ContributeDetailsClient } from '@/app/(guest)/[slug]/contribute/ContributeDetailsClient';
import { PaymentClient } from '@/app/(guest)/[slug]/contribute/payment/PaymentClient';
import { getStorageKey } from '@/lib/contributions/flow-storage';

const pushMock = vi.fn();
const replaceMock = vi.fn();
const fetchMock = vi.fn();
const savePaymentAttemptDataMock = vi.fn();
const clearFlowDataMock = vi.fn();
const assignMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: replaceMock }),
}));

vi.mock('@/lib/payments/recovery', () => ({
  savePaymentAttemptData: (...args: unknown[]) => savePaymentAttemptDataMock(...args),
}));

vi.mock('@/lib/contributions/flow-storage', async () => {
  const actual = await vi.importActual<typeof import('@/lib/contributions/flow-storage')>(
    '@/lib/contributions/flow-storage'
  );
  return {
    ...actual,
    clearFlowData: (...args: unknown[]) => clearFlowDataMock(...args),
  };
});

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('contribute two-step flow integration', () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    fetchMock.mockReset();
    savePaymentAttemptDataMock.mockReset();
    clearFlowDataMock.mockReset();
    sessionStorage.clear();
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

  it('persists step-1 details and navigates to payment step', async () => {
    render(
      <ContributeDetailsClient
        slug="maya-board"
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        childName="Maya"
        hasAvailableProviders
        unavailableMessage="Payments unavailable"
      />
    );

    await userEvent.type(screen.getByPlaceholderText('The Mason Family'), 'Ava');
    await userEvent.click(screen.getByRole('button', { name: /Continue to payment/i }));

    const raw = sessionStorage.getItem(getStorageKey('maya-board'));
    expect(raw).toContain('"amountCents":25000');
    expect(raw).toContain('"contributorName":"Ava"');
    expect(pushMock).toHaveBeenCalledWith('/maya-board/contribute/payment');
  });

  it('reads persisted flow data in payment step and submits create payload', async () => {
    sessionStorage.setItem(
      getStorageKey('maya-board'),
      JSON.stringify({
        amountCents: 25000,
        contributorName: 'Ava',
        isAnonymous: false,
        message: 'Happy birthday',
        slug: 'maya-board',
        childName: 'Maya',
        dreamBoardId: '00000000-0000-4000-8000-000000000001',
        timestamp: Date.now(),
      })
    );
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ mode: 'redirect', redirectUrl: 'https://pay.example/redirect' }),
    });

    render(
      <PaymentClient
        slug="maya-board"
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        childName="Maya"
        availableProviders={['payfast', 'snapscan']}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Pay R\s*257(?:[,.]50)/i }));
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/internal/contributions/create',
      expect.objectContaining({ method: 'POST' })
    );
    expect(savePaymentAttemptDataMock).toHaveBeenCalledWith(
      'maya-board',
      expect.objectContaining({ amountCents: 25000, paymentProvider: 'payfast' })
    );
    expect(clearFlowDataMock).toHaveBeenCalledWith('maya-board');
  });

  it('redirects back to details when flow data is expired or missing', async () => {
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

  it('omits contributor name in payload for anonymous contributions', async () => {
    sessionStorage.setItem(
      getStorageKey('maya-board'),
      JSON.stringify({
        amountCents: 25000,
        contributorName: '',
        isAnonymous: true,
        message: 'Happy birthday',
        slug: 'maya-board',
        childName: 'Maya',
        dreamBoardId: '00000000-0000-4000-8000-000000000001',
        timestamp: Date.now(),
      })
    );
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ mode: 'redirect', redirectUrl: 'https://pay.example/redirect' }),
    });

    render(
      <PaymentClient
        slug="maya-board"
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        childName="Maya"
        availableProviders={['payfast']}
      />
    );

    await userEvent.click(screen.getByRole('button', { name: /Pay R\s*257(?:[,.]50)/i }));
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(payload.contributorName).toBeUndefined();
  });

  it('guards closed/expired state checks in both contribute route pages', () => {
    const detailsPage = readSource('src/app/(guest)/[slug]/contribute/page.tsx');
    const paymentPage = readSource('src/app/(guest)/[slug]/contribute/payment/page.tsx');

    expect(detailsPage).toContain('view.isClosed || view.isExpired');
    expect(paymentPage).toContain('view.isClosed || view.isExpired');
  });
});
