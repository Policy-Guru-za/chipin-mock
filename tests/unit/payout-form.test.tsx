/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PayoutForm } from '@/app/(host)/create/payout/PayoutForm';

const defaultProps = () => ({
  action: vi.fn(),
  defaultEmail: '',
  defaultWhatsApp: '',
  error: null as string | null,
});

afterEach(() => {
  cleanup();
});

describe('PayoutForm', () => {
  it('renders the voucher compatibility fields', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getByLabelText('Payout email')).toBeInTheDocument();
    expect(screen.getByLabelText('WhatsApp number')).toBeInTheDocument();
  });

  it('does not expose legacy karri or bank controls', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.queryByText('Karri Card')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Bank name')).not.toBeInTheDocument();
    expect(
      screen.getByText(/no bank account or card details are needed in the default Dreamboard flow/i)
    ).toBeInTheDocument();
  });

  it('keeps the voucher back link', () => {
    render(<PayoutForm {...defaultProps()} />);

    const backLinks = screen.getAllByRole('link', { name: /back/i });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks.some((link) => link.getAttribute('href') === '/create/dates')).toBe(true);
  });

  it('renders the voucher CTA label', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getAllByRole('button', { name: /continue to review/i }).length).toBeGreaterThan(0);
  });

  it('passes errors through to the voucher CTA', () => {
    render(<PayoutForm {...defaultProps()} error="Some error" />);

    expect(screen.getAllByText('Some error').length).toBeGreaterThan(0);
  });

  it('keeps the voucher preview reactive', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getAllByText('Payout email provided').length).toBeGreaterThan(0);
    expect(screen.getAllByText('WhatsApp number added').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Takealot voucher').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Payout email'), {
      target: { value: 'host@example.com' },
    });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), {
      target: { value: '+27821234567' },
    });

    expect(screen.getByLabelText('Payout email')).toHaveValue('host@example.com');
    expect(screen.getByLabelText('WhatsApp number')).toHaveValue('+27821234567');
    expect(screen.getAllByText('Payout email provided').length).toBeGreaterThan(0);
    expect(screen.getAllByText('WhatsApp number added').length).toBeGreaterThan(0);
  });
});
