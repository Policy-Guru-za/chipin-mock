/**
 * @vitest-environment jsdom
 */
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
  getHostCreateDreamBoardDraft: vi.fn(),
  buildCreateFlowViewModel: vi.fn(),
  savePayoutAction: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => ({
  requireHostAuth: mocks.requireHostAuth,
}));

vi.mock('@/lib/dream-boards/draft', () => ({
  getHostCreateDreamBoardDraft: mocks.getHostCreateDreamBoardDraft,
}));

vi.mock('@/lib/host/create-view-model', () => ({
  CREATE_FLOW_TOTAL_STEPS: 5,
  buildCreateFlowViewModel: mocks.buildCreateFlowViewModel,
}));

vi.mock('@/app/(host)/create/payout/actions', () => ({
  savePayoutAction: mocks.savePayoutAction,
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('@/components/create-wizard', () => ({
  WizardStepper: (props: Record<string, unknown>) => (
    <div data-testid="wizard-stepper" data-step={String(props.currentStep)} />
  ),
  WizardSkeletonLoader: () => <div data-testid="wizard-skeleton-loader" />,
  resolveWizardError: (code: string | undefined) => (code ? `Resolved: ${code}` : null),
}));

vi.mock('@/app/(host)/create/payout/PayoutForm', () => ({
  PayoutForm: (props: Record<string, unknown>) => (
    <div
      data-testid="payout-form"
      data-error={String(props.error ?? '')}
      data-method={String(props.defaultPayoutMethod ?? '')}
      data-email={String(props.defaultEmail ?? '')}
      data-whatsapp={String(props.defaultWhatsApp ?? '')}
      data-karri-holder={String(props.defaultKarriCardHolderName ?? '')}
      data-has-karri-card={String(Boolean(props.defaultHasKarriCard))}
      data-bank-name={String(props.defaultBankName ?? '')}
      data-bank-last4={String(props.defaultBankAccountLast4 ?? '')}
    >
      {props.children as ReactNode}
    </div>
  ),
}));

const makeDraft = (overrides: Record<string, unknown> = {}) => ({
  payoutMethod: 'bank',
  payoutEmail: 'test@example.com',
  hostWhatsAppNumber: '+27821234567',
  karriCardHolderName: 'Test User',
  karriCardNumberEncrypted: 'encrypted',
  bankName: 'Standard Bank',
  bankBranchCode: '051001',
  bankAccountHolder: 'Test User',
  bankAccountLast4: '1234',
  ...overrides,
});

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1' });
  mocks.buildCreateFlowViewModel.mockReturnValue({
    redirectTo: null,
    stepLabel: 'Payout details',
    title: 'Payout',
    subtitle: 'Set up payout',
  });
  mocks.getHostCreateDreamBoardDraft.mockResolvedValue(makeDraft());
});

async function renderPage(sp: Record<string, string> = {}) {
  const Page = (await import('@/app/(host)/create/payout/page')).default;
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(sp) }));
}

describe('Create Payout Page', () => {
  it('renders WizardStepper at step 4', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="wizard-stepper"');
    expect(html).toContain('data-step="4"');
  });

  it('renders PayoutForm with default bank method', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="payout-form"');
    expect(html).toContain('data-method="bank"');
  });

  it('renders PayoutForm with Karri method when draft has Karri details', async () => {
    mocks.getHostCreateDreamBoardDraft.mockResolvedValue(
      makeDraft({
        payoutMethod: 'karri_card',
        bankName: undefined,
        bankBranchCode: undefined,
        bankAccountHolder: undefined,
        bankAccountLast4: undefined,
      }),
    );

    const html = await renderPage();
    expect(html).toContain('data-method="karri_card"');
  });

  it('passes resolved error to PayoutForm', async () => {
    const html = await renderPage({ error: 'karri' });
    expect(html).toContain('data-error="Resolved: karri"');
  });

  it('redirects when the flow view model requires an earlier step', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mocks.buildCreateFlowViewModel.mockReturnValue({
      redirectTo: '/create/dates',
      stepLabel: 'Payout details',
      title: 'Payout',
      subtitle: 'Set up payout',
    });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/dates');
  });

  it('redirects to /create/dates when no draft exists', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mocks.getHostCreateDreamBoardDraft.mockResolvedValue(null);
    mocks.buildCreateFlowViewModel.mockReturnValue({
      redirectTo: null,
      stepLabel: 'Payout details',
      title: 'Payout',
      subtitle: 'Set up payout',
    });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/dates');
  });

  it('passes draft payout fields to PayoutForm', async () => {
    const html = await renderPage();

    expect(html).toContain('data-email="test@example.com"');
    expect(html).toContain('data-whatsapp="+27821234567"');
    expect(html).toContain('data-karri-holder="Test User"');
    expect(html).toContain('data-has-karri-card="true"');
    expect(html).toContain('data-bank-name="Standard Bank"');
    expect(html).toContain('data-bank-last4="1234"');
  });
});
