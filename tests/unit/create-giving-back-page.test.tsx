/**
 * @vitest-environment jsdom
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  requireHostAuth: vi.fn(),
  getDreamBoardDraft: vi.fn(),
  buildCreateFlowViewModel: vi.fn(),
  listActiveCharities: vi.fn(),
  saveGivingBackAction: vi.fn(),
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

vi.mock('@/lib/charities', () => ({
  listActiveCharities: mocks.listActiveCharities,
}));

vi.mock('@/app/(host)/create/giving-back/actions', () => ({
  saveGivingBackAction: mocks.saveGivingBackAction,
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('@/components/create-wizard', () => ({
  WizardStepper: (props: Record<string, unknown>) => (
    <div data-testid="wizard-stepper" data-step={String(props.currentStep)} />
  ),
  WizardSkeletonLoader: () => <div data-testid="wizard-skeleton-loader" />,
  WizardFormCard: (props: Record<string, unknown>) => (
    <div data-testid="wizard-form-card">{props.children as React.ReactNode}</div>
  ),
  WizardEyebrow: (props: Record<string, unknown>) => <span>{props.children as React.ReactNode}</span>,
  WizardPanelTitle: (props: Record<string, unknown>) => <h2>{props.children as React.ReactNode}</h2>,
  WizardAlertBanner: (props: Record<string, unknown>) => (
    <div data-testid="wizard-alert-banner">{props.children as React.ReactNode}</div>
  ),
  WizardCTA: (props: Record<string, unknown>) => (
    <div data-testid="wizard-cta" data-error={String(props.error ?? '')} />
  ),
  resolveWizardError: (code: string | undefined) => (code ? `Resolved: ${code}` : null),
}));

vi.mock('@/app/(host)/create/giving-back/GivingBackForm', () => ({
  GivingBackForm: (props: Record<string, unknown>) => (
    <div
      data-testid="giving-back-form"
      data-charity-enabled={String(props.defaultCharityEnabled)}
      data-charity-id={String(props.defaultCharityId ?? '')}
      data-split-type={String(props.defaultSplitType ?? '')}
      data-percentage={String(props.defaultPercentage)}
      data-threshold={String(props.defaultThresholdAmount)}
      data-child-name={String(props.childName ?? '')}
      data-error={String(props.error ?? '')}
      data-charity-count={String((props.charities as unknown[])?.length ?? 0)}
    />
  ),
}));

const makeDraft = (overrides: Record<string, unknown> = {}) => ({
  childName: 'Maya',
  charityEnabled: true,
  charityId: 'c1',
  charitySplitType: 'percentage',
  charityPercentageBps: 2500,
  charityThresholdCents: 10000,
  ...overrides,
});

const makeCharities = () => [
  {
    id: 'c1',
    name: 'Reach for a Dream',
    description: 'Supporting children',
    category: 'Children',
    logoUrl: null,
  },
  {
    id: 'c2',
    name: 'CHOC',
    description: 'Cancer support',
    category: 'Health',
    logoUrl: null,
  },
  {
    id: 'c3',
    name: 'Cotlands',
    description: 'Early childhood development',
    category: 'Education',
    logoUrl: null,
  },
];

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1' });
  mocks.buildCreateFlowViewModel.mockReturnValue({
    redirectTo: null,
    stepLabel: 'Giving back',
    title: 'Giving back',
  });
  mocks.getDreamBoardDraft.mockResolvedValue(makeDraft());
  mocks.listActiveCharities.mockResolvedValue(makeCharities());
});

async function renderPage(sp: Record<string, string> = {}) {
  const Page = (await import('@/app/(host)/create/giving-back/page')).default;
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(sp) }));
}

describe('Create Giving Back Page', () => {
  it('renders stepper at step 4 of 6', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="wizard-stepper"');
    expect(html).toContain('data-step="4"');
  });

  it('renders GivingBackForm when charities exist', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="giving-back-form"');
  });

  it('renders warning banner and skip CTA when no charities', async () => {
    mocks.listActiveCharities.mockResolvedValue([]);
    const html = await renderPage();
    expect(html).not.toContain('data-testid="giving-back-form"');
    expect(html).toContain(
      'No active charities are configured. You can continue without giving back for now.',
    );
  });

  it('passes charity list to GivingBackForm', async () => {
    mocks.listActiveCharities.mockResolvedValue(makeCharities());
    const html = await renderPage();
    expect(html).toContain('data-charity-count="3"');
  });

  it('passes error message to GivingBackForm when error searchParam is present', async () => {
    const html = await renderPage({ error: 'charity_required' });
    expect(html).toContain('data-error="Resolved: charity_required"');
  });

  it('passes empty error when no searchParam error', async () => {
    const html = await renderPage();
    expect(html).toContain('data-error=""');
  });

  it('converts draft charityPercentageBps to percentage for form', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue(
      makeDraft({
        charitySplitType: 'percentage',
        charityPercentageBps: 1500,
      }),
    );
    const html = await renderPage();
    expect(html).toContain('data-percentage="15"');
  });

  it('converts draft charityThresholdCents to amount for form', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue(
      makeDraft({
        charitySplitType: 'threshold',
        charityThresholdCents: 20000,
      }),
    );
    const html = await renderPage();
    expect(html).toContain('data-threshold="200"');
  });
});
