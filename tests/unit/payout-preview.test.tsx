/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';

import { PayoutPreview } from '@/components/create-wizard/PayoutPreview';

const defaultProps = () => ({
  payoutMethod: 'karri_card' as const,
  hasMethodDetails: false,
  hasEmail: false,
  hasWhatsApp: false,
});

afterEach(() => {
  cleanup();
});

describe('PayoutPreview', () => {
  it('shows Karri Card method name and description', () => {
    render(<PayoutPreview {...defaultProps()} payoutMethod="karri_card" />);

    expect(screen.getByText('Karri Card')).toBeInTheDocument();
    expect(screen.getByText('Instant payout to your card')).toBeInTheDocument();
  });

  it('shows Bank Transfer method name and description', () => {
    render(<PayoutPreview {...defaultProps()} payoutMethod="bank" />);

    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
    expect(screen.getByText('Transfer to your bank account')).toBeInTheDocument();
  });

  it('shows Card details entered label for karri_card method', () => {
    render(<PayoutPreview {...defaultProps()} payoutMethod="karri_card" />);

    expect(screen.getByText('Card details entered')).toBeInTheDocument();
  });

  it('shows Bank details entered label for bank method', () => {
    render(<PayoutPreview {...defaultProps()} payoutMethod="bank" />);

    expect(screen.getByText('Bank details entered')).toBeInTheDocument();
  });

  it('Payout method selected is always shown as done', () => {
    render(<PayoutPreview {...defaultProps()} />);

    expect(screen.getByText('Payout method selected')).toBeInTheDocument();
  });

  it('shows security badge with 256-bit encrypted', () => {
    render(<PayoutPreview {...defaultProps()} />);

    expect(screen.getByText('256-bit encrypted')).toBeInTheDocument();
  });

  it('checklist reflects all-done state', () => {
    render(
      <PayoutPreview
        {...defaultProps()}
        hasMethodDetails
        hasEmail
        hasWhatsApp
      />,
    );

    expect(screen.getByText('Payout method selected')).toBeInTheDocument();
    expect(screen.getByText(/details entered/i)).toBeInTheDocument();
    expect(screen.getByText('Contact email provided')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp number added')).toBeInTheDocument();
  });

  it('checklist reflects all-pending state', () => {
    render(
      <PayoutPreview
        {...defaultProps()}
        hasMethodDetails={false}
        hasEmail={false}
        hasWhatsApp={false}
      />,
    );

    expect(screen.getByText('Payout method selected')).toBeInTheDocument();
    expect(screen.getByText(/details entered/i)).toBeInTheDocument();
    expect(screen.getByText('Contact email provided')).toBeInTheDocument();
    expect(screen.getByText('WhatsApp number added')).toBeInTheDocument();
  });
});
