/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import PaymentFailedPage from '@/app/(guest)/[slug]/payment-failed/page';

const getCachedDreamBoardBySlugMock = vi.hoisted(() => vi.fn());
const getFailureDisplayMock = vi.hoisted(() => vi.fn());
const paymentFailedClientMock = vi.hoisted(() => vi.fn());

vi.mock('@/lib/dream-boards/cache', () => ({
  getCachedDreamBoardBySlug: getCachedDreamBoardBySlugMock,
}));

vi.mock('@/lib/payments/failure-display', () => ({
  getFailureDisplay: getFailureDisplayMock,
}));

vi.mock('@/app/(guest)/[slug]/payment-failed/PaymentFailedClient', () => ({
  PaymentFailedClient: (props: {
    slug: string;
    childName: string;
    display: { heading: string; message: string; explanations: string[] };
    isClosed: boolean;
  }) => {
    paymentFailedClientMock(props);
    return <div data-testid="payment-failed-client" />;
  },
}));

describe('PaymentFailedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFailureDisplayMock.mockReturnValue({
      heading: "Payment Didn't Go Through",
      message: 'Try again.',
      explanations: [],
    });
  });

  it('keeps funded boards retryable', async () => {
    getCachedDreamBoardBySlugMock.mockResolvedValue({
      slug: 'maya-birthday',
      childName: 'Maya',
      status: 'funded',
    });

    const page = await PaymentFailedPage({
      params: Promise.resolve({ slug: 'maya-birthday' }),
      searchParams: Promise.resolve({ reason: 'declined' }),
    });

    render(page);
    expect(screen.getByTestId('payment-failed-client')).toBeInTheDocument();

    const props = paymentFailedClientMock.mock.calls[0]?.[0];
    expect(props.isClosed).toBe(false);
  });
});
