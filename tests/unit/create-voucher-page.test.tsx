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
  saveVoucherAction: vi.fn(),
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

vi.mock('@/app/(host)/create/voucher/actions', () => ({
  saveVoucherAction: mocks.saveVoucherAction,
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

vi.mock('@/app/(host)/create/voucher/VoucherForm', () => ({
  VoucherForm: (props: Record<string, unknown>) => (
    <div
      data-testid="voucher-form"
      data-error={String(props.error ?? '')}
      data-email={String(props.defaultEmail ?? '')}
      data-whatsapp={String(props.defaultWhatsApp ?? '')}
    >
      {props.children as ReactNode}
    </div>
  ),
}));

const makeDraft = (overrides: Record<string, unknown> = {}) => ({
  payoutMethod: 'takealot_voucher',
  payoutEmail: 'test@example.com',
  hostWhatsAppNumber: '+27821234567',
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
    stepLabel: 'Voucher details',
    title: 'Voucher',
    subtitle: 'Set up voucher contact details',
  });
  mocks.getHostCreateDreamBoardDraft.mockResolvedValue(makeDraft());
});

async function renderPage(sp: Record<string, string> = {}) {
  const Page = (await import('@/app/(host)/create/voucher/page')).default;
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(sp) }));
}

describe('Create Voucher Page', () => {
  it('renders WizardStepper at step 4', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="wizard-stepper"');
    expect(html).toContain('data-step="4"');
  });

  it('renders VoucherForm with draft contact details', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="voucher-form"');
    expect(html).toContain('data-email="test@example.com"');
    expect(html).toContain('data-whatsapp="+27821234567"');
  });

  it('passes resolved errors to VoucherForm', async () => {
    const html = await renderPage({ error: 'whatsapp' });
    expect(html).toContain('data-error="Resolved: whatsapp"');
  });

  it('redirects when the flow view model requires an earlier step', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mocks.buildCreateFlowViewModel.mockReturnValue({
      redirectTo: '/create/dates',
      stepLabel: 'Voucher details',
      title: 'Voucher',
      subtitle: 'Set up voucher contact details',
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
      stepLabel: 'Voucher details',
      title: 'Voucher',
      subtitle: 'Set up voucher contact details',
    });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/dates');
  });
});
