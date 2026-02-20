/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PayoutForm } from '@/app/(host)/create/payout/PayoutForm';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/create-wizard/PayoutPreview', () => ({
  PayoutPreview: (props: Record<string, unknown>) => (
    <div
      data-testid="payout-preview"
      data-method={String(props.payoutMethod)}
      data-has-method-details={String(props.hasMethodDetails)}
      data-has-email={String(props.hasEmail)}
      data-has-whatsapp={String(props.hasWhatsApp)}
    />
  ),
}));

const defaultProps = () => ({
  action: vi.fn(),
  defaultPayoutMethod: 'karri_card' as const,
  defaultEmail: '',
  defaultWhatsApp: '',
  defaultKarriCardHolderName: '',
  defaultBankName: undefined as string | undefined,
  defaultBankBranchCode: undefined as string | undefined,
  defaultBankAccountHolder: undefined as string | undefined,
  defaultBankAccountLast4: undefined as string | undefined,
  error: null as string | null,
});

afterEach(() => {
  cleanup();
});

describe('PayoutForm', () => {
  it('renders Karri Card fields by default', () => {
    const { container } = render(<PayoutForm {...defaultProps()} />);

    expect(container.querySelector('#karriCardNumber')).toBeInTheDocument();
    expect(container.querySelector('#karriCardHolderName')).toBeInTheDocument();
  });

  it('does not render bank fields when Karri Card is selected', () => {
    const { container } = render(<PayoutForm {...defaultProps()} />);

    expect(container.querySelector('#bankName')).toBeNull();
  });

  it('switches to bank fields when Bank Transfer tab is clicked', () => {
    const { container } = render(<PayoutForm {...defaultProps()} />);
    const bankRadio = container.querySelector<HTMLInputElement>(
      'input[name="payoutMethod"][value="bank"]',
    );

    expect(bankRadio).toBeInTheDocument();
    fireEvent.click(bankRadio!);

    expect(container.querySelector('#bankName')).toBeInTheDocument();
    expect(container.querySelector('#karriCardNumber')).toBeNull();
  });

  it('renders bank select with all SA bank options', () => {
    const { container } = render(<PayoutForm {...defaultProps()} />);
    const bankRadio = container.querySelector<HTMLInputElement>(
      'input[name="payoutMethod"][value="bank"]',
    );
    fireEvent.click(bankRadio!);

    const banks = [
      'ABSA',
      'Capitec',
      'Discovery Bank',
      'FNB',
      'Investec',
      'Nedbank',
      'Standard Bank',
      'TymeBank',
    ];

    for (const bank of banks) {
      expect(screen.getByRole('option', { name: bank })).toBeInTheDocument();
    }
  });

  it('renders contact email and WhatsApp fields', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getByLabelText('Payout email')).toBeInTheDocument();
    expect(screen.getByLabelText('WhatsApp number')).toBeInTheDocument();
  });

  it('renders security tip text', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getByText(/encrypted end-to-end/i)).toBeInTheDocument();
  });

  it('renders WizardCTA with back link to giving-back', () => {
    render(<PayoutForm {...defaultProps()} />);

    const backLinks = screen.getAllByRole('link', { name: /back/i });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks.some((link) => link.getAttribute('href') === '/create/giving-back')).toBe(true);
  });

  it('renders WizardCTA with Continue to review label', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getAllByRole('button', { name: /continue to review/i }).length).toBeGreaterThan(0);
  });

  it('passes error to WizardCTA', () => {
    render(<PayoutForm {...defaultProps()} error="Some error" />);

    expect(screen.getAllByText('Some error').length).toBeGreaterThan(0);
  });

  it('passes reactive props to PayoutPreview', () => {
    render(<PayoutForm {...defaultProps()} />);

    const previews = screen.getAllByTestId('payout-preview');
    expect(previews.length).toBeGreaterThan(0);
    const hasExpectedInitial = previews.some(
      (preview) =>
        preview.getAttribute('data-method') === 'karri_card' &&
        preview.getAttribute('data-has-method-details') === 'false' &&
        preview.getAttribute('data-has-email') === 'false' &&
        preview.getAttribute('data-has-whatsapp') === 'false',
    );
    expect(hasExpectedInitial).toBe(true);

    fireEvent.change(screen.getByLabelText('Payout email'), {
      target: { value: 'host@example.com' },
    });

    const updatedPreviews = screen.getAllByTestId('payout-preview');
    const hasUpdatedEmail = updatedPreviews.some(
      (preview) => preview.getAttribute('data-has-email') === 'true',
    );
    expect(hasUpdatedEmail).toBe(true);
  });

  it('renders hidden inputs for bank fields when karri is selected', () => {
    const { container } = render(<PayoutForm {...defaultProps()} />);

    expect(
      container.querySelector('input[type="hidden"][name="bankName"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[type="hidden"][name="bankAccountNumber"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[type="hidden"][name="bankBranchCode"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[type="hidden"][name="bankAccountHolder"]'),
    ).toBeInTheDocument();
  });

  it('shows existing account hint when defaultBankAccountLast4 is provided', () => {
    render(
      <PayoutForm
        {...defaultProps()}
        defaultPayoutMethod="bank"
        defaultBankAccountLast4="4567"
      />,
    );

    expect(screen.getByText(/•••• 4567/)).toBeInTheDocument();
  });

  it('shows Recommended badge when Karri Card is selected', () => {
    render(<PayoutForm {...defaultProps()} />);

    expect(screen.getByText('Recommended')).toBeInTheDocument();
  });

  it('hides Recommended badge when switching to bank transfer', () => {
    const { container } = render(<PayoutForm {...defaultProps()} />);
    const bankRadio = container.querySelector<HTMLInputElement>(
      'input[name="payoutMethod"][value="bank"]',
    );

    fireEvent.click(bankRadio!);

    expect(screen.queryByText('Recommended')).not.toBeInTheDocument();
  });
});
