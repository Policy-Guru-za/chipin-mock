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
  getDreamBoardDraft: vi.fn(),
  buildCreateFlowViewModel: vi.fn(),
  savePayoutAction: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => ({
  requireHostAuth: mocks.requireHostAuth,
}));

vi.mock('@/lib/dream-boards/draft', () => ({
  getDreamBoardDraft: mocks.getDreamBoardDraft,
}));

vi.mock('@/lib/host/create-view-model', () => ({
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
  WizardFormCard: (props: Record<string, unknown>) => (
    <div data-testid="wizard-form-card">{props.children as ReactNode}</div>
  ),
  WizardEyebrow: (props: Record<string, unknown>) => <span>{props.children as ReactNode}</span>,
  WizardPanelTitle: (props: Record<string, unknown>) => <h2>{props.children as ReactNode}</h2>,
  WizardFieldWrapper: (props: Record<string, unknown>) => (
    <div data-testid={`wizard-field-${String(props.htmlFor ?? '')}`}>{props.children as ReactNode}</div>
  ),
  WizardTextInput: (props: Record<string, unknown>) => <input data-testid={String(props.id ?? '')} />,
  WizardSelect: (props: Record<string, unknown>) => (
    <select data-testid={String(props.id ?? '')}>{props.children as ReactNode}</select>
  ),
  WizardFieldTip: (props: Record<string, unknown>) => <div>{props.children as ReactNode}</div>,
  WizardCTA: (props: Record<string, unknown>) => (
    <div data-testid="wizard-cta" data-error={String(props.error ?? '')} />
  ),
  WizardSplitLayout: (props: Record<string, unknown>) => (
    <div data-testid="wizard-split-layout">
      {props.left as ReactNode}
      {props.right as ReactNode}
    </div>
  ),
  WizardPreviewPanel: (props: Record<string, unknown>) => (
    <div data-testid="wizard-preview-panel">{props.children as ReactNode}</div>
  ),
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
    />
  ),
}));

const makeDraft = (overrides: Record<string, unknown> = {}) => ({
  payoutMethod: 'karri_card',
  payoutEmail: 'test@example.com',
  hostWhatsAppNumber: '+27821234567',
  karriCardHolderName: 'Test User',
  bankName: undefined,
  bankBranchCode: undefined,
  bankAccountHolder: undefined,
  bankAccountLast4: undefined,
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
    stepLabel: 'Payout setup',
    title: 'Payout',
    subtitle: 'Set up payout',
  });
  mocks.getDreamBoardDraft.mockResolvedValue(makeDraft());
});

async function renderPage(sp: Record<string, string> = {}) {
  const Page = (await import('@/app/(host)/create/payout/page')).default;
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(sp) }));
}

describe('Create Payout Page', () => {
  it('renders WizardStepper at step 5', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="wizard-stepper"');
    expect(html).toContain('data-step="5"');
  });

  it('renders PayoutForm with default karri_card method', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="payout-form"');
    expect(html).toContain('data-method="karri_card"');
  });

  it('renders PayoutForm with bank method when draft has bank', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue(
      makeDraft({
        payoutMethod: 'bank',
      }),
    );

    const html = await renderPage();
    expect(html).toContain('data-method="bank"');
  });

  it('passes resolved error to PayoutForm', async () => {
    const html = await renderPage({ error: 'karri' });
    expect(html).toContain('data-error="Resolved: karri"');
  });

  it('passes null error when no searchParams error', async () => {
    const html = await renderPage();
    expect(html).toContain('data-error=""');
  });

  it('redirects when view.redirectTo is set', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mocks.buildCreateFlowViewModel.mockReturnValue({
      redirectTo: '/create/child',
      stepLabel: 'Payout setup',
      title: 'Payout',
      subtitle: 'Set up payout',
    });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/child');
  });

  it('redirects to /create/child when no draft', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mocks.getDreamBoardDraft.mockResolvedValue(null);
    mocks.buildCreateFlowViewModel.mockReturnValue({
      redirectTo: null,
      stepLabel: 'Payout setup',
      title: 'Payout',
      subtitle: 'Set up payout',
    });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/child');
  });

  it('passes draft payout fields to PayoutForm', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue(
      makeDraft({
        payoutEmail: 'host@example.com',
        hostWhatsAppNumber: '+27835554444',
        karriCardHolderName: 'Host Name',
      }),
    );

    const html = await renderPage();

    expect(html).toContain('data-email="host@example.com"');
    expect(html).toContain('data-whatsapp="+27835554444"');
    expect(html).toContain('data-karri-holder="Host Name"');
  });
});
