/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PayoutForm } from '@/app/(host)/create/payout/PayoutForm';

const defaultProps = () => ({
  action: vi.fn(),
  defaultPayoutMethod: 'bank' as const,
  defaultEmail: '',
  defaultWhatsApp: '',
  error: null as string | null,
});

afterEach(() => {
  cleanup();
});

describe('PayoutForm', () => {
  it('renders payout route selection and contact fields', () => {
    render(<PayoutForm {...defaultProps()} />);

    const bankRadios = screen.getAllByRole('radio', { name: /bank account/i });
    expect(bankRadios.some((radio) => (radio as HTMLInputElement).checked)).toBe(true);
    expect(screen.getAllByRole('radio', { name: /karri card/i }).length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Payout email')).toBeInTheDocument();
    expect(screen.getByLabelText('WhatsApp number')).toBeInTheDocument();
  });

  it('shows bank fields by default', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getByLabelText('Bank name')).toBeInTheDocument();
    expect(screen.getByLabelText('Account number')).toBeInTheDocument();
    expect(screen.getByLabelText('Branch code')).toBeInTheDocument();
    expect(screen.getByLabelText('Account holder name')).toBeInTheDocument();
  });

  it('switches to Karri fields when selected', () => {
    render(<PayoutForm {...defaultProps()} />);

    fireEvent.click(screen.getByRole('radio', { name: /karri card/i }));

    expect(screen.getByLabelText('Card number')).toBeInTheDocument();
    expect(screen.getByLabelText('Card holder name')).toBeInTheDocument();
    expect(screen.queryByLabelText('Bank name')).toBeNull();
  });

  it('keeps the payout back link and CTA label', () => {
    render(<PayoutForm {...defaultProps()} />);

    const backLinks = screen.getAllByRole('link', { name: /back/i });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks.some((link) => link.getAttribute('href') === '/create/dates')).toBe(true);

    expect(screen.getAllByRole('button', { name: /continue to review/i }).length).toBeGreaterThan(0);
  });

  it('passes errors through to the payout CTA', () => {
    render(<PayoutForm {...defaultProps()} error="Some error" />);

    expect(screen.getAllByText('Some error').length).toBeGreaterThan(0);
  });

  it('keeps the payout preview reactive', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getAllByText('Bank transfer').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Payout email added').length).toBeGreaterThan(0);
    expect(screen.getAllByText('WhatsApp updates enabled').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Payout email'), {
      target: { value: 'host@example.com' },
    });
    fireEvent.change(screen.getByLabelText('WhatsApp number'), {
      target: { value: '+27821234567' },
    });
    fireEvent.change(screen.getByLabelText('Bank name'), {
      target: { value: 'FNB' },
    });

    expect(screen.getByLabelText('Payout email')).toHaveValue('host@example.com');
    expect(screen.getByLabelText('WhatsApp number')).toHaveValue('+27821234567');
    expect(screen.getByLabelText('Bank name')).toHaveValue('FNB');
    expect(screen.getAllByText('Payout email added').length).toBeGreaterThan(0);
    expect(screen.getAllByText('WhatsApp updates enabled').length).toBeGreaterThan(0);
  });
});
