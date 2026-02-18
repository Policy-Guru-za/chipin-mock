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
  safeParse: vi.fn(),
  buildCreateFlowViewModel: vi.fn(),
  publishDreamBoardAction: vi.fn(),
  redirect: vi.fn(),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => ({
  requireHostAuth: mocks.requireHostAuth,
}));

vi.mock('@/lib/dream-boards/draft', () => ({
  getDreamBoardDraft: mocks.getDreamBoardDraft,
}));

vi.mock('@/lib/dream-boards/schema', () => ({
  dreamBoardDraftSchema: {
    safeParse: mocks.safeParse,
  },
}));

vi.mock('@/lib/host/create-view-model', () => ({
  buildCreateFlowViewModel: mocks.buildCreateFlowViewModel,
}));

vi.mock('@/app/(host)/create/review/actions', () => ({
  publishDreamBoardAction: mocks.publishDreamBoardAction,
}));

vi.mock('next/navigation', () => ({
  redirect: mocks.redirect,
}));

vi.mock('@/components/create-wizard', () => ({
  WizardSkeletonLoader: () => <div data-testid="wizard-skeleton-loader" />,
  WizardStepper: (props: Record<string, unknown>) => (
    <div data-testid="wizard-stepper" data-step={String(props.currentStep)} />
  ),
  WizardCTA: (props: Record<string, unknown>) => (
    <div data-testid="wizard-cta">{String(props.submitLabel ?? '')}</div>
  ),
  WizardCenteredLayout: (props: Record<string, unknown>) => (
    <div data-testid="wizard-centered-layout">{props.children as React.ReactNode}</div>
  ),
  WizardEyebrow: (props: Record<string, unknown>) => <p>{props.children as React.ReactNode}</p>,
  WizardPanelTitle: (props: Record<string, unknown>) => <h2>{props.children as React.ReactNode}</h2>,
}));

vi.mock('@/app/(host)/create/review/ReviewClient', () => ({
  ReviewClient: (props: Record<string, unknown>) => (
    <div
      data-testid="review-client"
      data-child-name={String((props.draft as Record<string, unknown>).childName)}
      data-payout-method={String((props.draft as Record<string, unknown>).payoutMethod)}
    />
  ),
}));

vi.mock('@/components/create-review/CelebrationHeader', () => ({
  CelebrationHeader: () => <div data-testid="celebration-header" />,
}));

vi.mock('@/components/create-review/ReviewPreviewCard', () => ({
  ReviewPreviewCard: () => <div data-testid="review-preview-card" />,
}));

vi.mock('@/components/create-review/ShareActionsPanel', () => ({
  ShareActionsPanel: () => <div data-testid="share-actions-panel" />,
}));

vi.mock('@/components/effects/ConfettiTrigger', () => ({
  ConfettiTrigger: () => <div data-testid="confetti-trigger" />,
}));

vi.mock('@/lib/dream-boards/party-date-time', () => ({
  formatPartyDateTime: () => null,
}));

vi.mock('@/lib/utils/date', () => ({
  parseDateOnly: () => null,
}));

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const validDraft = {
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  birthdayDate: '2026-06-10',
  partyDate: '2026-06-12',
  partyDateTime: null,
  campaignEndDate: '2026-06-12',
  giftName: 'Scooter',
  giftImageUrl: '/icons/gifts/scooter.png',
  payoutMethod: 'karri_card' as const,
  payoutEmail: 'parent@example.com',
  hostWhatsAppNumber: '+27821234567',
  karriCardHolderName: 'Maya Parent',
  charityEnabled: false,
};

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1' });
  mocks.buildCreateFlowViewModel.mockReturnValue({
    stepLabel: 'Review',
    title: 'Review',
    subtitle: 'Review',
  });
  mocks.getDreamBoardDraft.mockResolvedValue(validDraft);
  mocks.safeParse.mockReturnValue({ success: true, data: validDraft });
});

async function renderPage() {
  const Page = (await import('@/app/(host)/create/review/page')).default;
  return renderToStaticMarkup(await Page());
}

describe('Create Review Page', () => {
  it('renders ReviewClient with draft data', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="review-client"');
    expect(html).toContain('data-child-name="Maya"');
  });

  it('passes karri_card payout method from draft', async () => {
    const html = await renderPage();
    expect(html).toContain('data-payout-method="karri_card"');
  });

  it('passes bank payout method when draft has bank', async () => {
    const bankDraft = {
      ...validDraft,
      payoutMethod: 'bank' as const,
    };
    mocks.getDreamBoardDraft.mockResolvedValue(bankDraft);
    mocks.safeParse.mockReturnValue({ success: true, data: bankDraft });

    const html = await renderPage();
    expect(html).toContain('data-payout-method="bank"');
  });

  it('redirects when view.redirectTo is set', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mocks.buildCreateFlowViewModel.mockReturnValue({
      redirectTo: '/create/child',
      stepLabel: 'Review',
      title: 'Review',
      subtitle: 'Review',
    });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/create/child');
  });

  it('redirects to /create when schema validation fails', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mocks.safeParse.mockReturnValue({ success: false, error: { issues: [] } });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/create');
  });

  it('redirects to /create when no draft is found', async () => {
    mocks.redirect.mockImplementation(() => {
      throw new Error('NEXT_REDIRECT');
    });
    mocks.getDreamBoardDraft.mockResolvedValue(null);
    mocks.safeParse.mockReturnValue({ success: false, error: { issues: [] } });

    await expect(renderPage()).rejects.toThrow('NEXT_REDIRECT');
    expect(mocks.redirect).toHaveBeenCalledWith('/create');
  });
});
