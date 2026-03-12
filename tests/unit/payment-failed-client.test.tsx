/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { PaymentFailedClient } from '@/app/(guest)/[slug]/payment-failed/PaymentFailedClient';

vi.mock('@/lib/payments/recovery', () => ({
  getPaymentAttemptData: vi.fn(() => null),
}));

describe('PaymentFailedClient', () => {
  it('uses the current support email domain', () => {
    render(
      <PaymentFailedClient
        slug="maya-birthday"
        childName="Maya"
        display={{
          heading: "Payment Didn't Go Through",
          message: 'Try again.',
          explanations: [],
        }}
        isClosed={false}
      />
    );

    expect(screen.getByRole('link', { name: 'Need help? Contact us 💬' })).toHaveAttribute(
      'href',
      'mailto:support@gifta.co.za'
    );
  });
});
