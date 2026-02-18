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
  saveDatesAction: vi.fn(),
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

vi.mock('@/app/(host)/create/dates/actions', () => ({
  saveDatesAction: mocks.saveDatesAction,
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

vi.mock('@/components/create-wizard', () => ({
  WizardStepper: (props: Record<string, unknown>) => (
    <div data-testid="wizard-stepper" data-step={props.currentStep} />
  ),
  WizardSkeletonLoader: () => <div data-testid="wizard-skeleton-loader" />,
  resolveWizardError: (code: string | undefined) => (code ? `Resolved: ${code}` : null),
}));

vi.mock('@/app/(host)/create/dates/DatesForm', () => ({
  DatesForm: (props: Record<string, unknown>) => (
    <div
      data-testid="dates-form"
      data-birthday={String(props.defaultBirthdayDate ?? '')}
      data-party={String(props.defaultPartyDate ?? '')}
      data-campaign-end={String(props.defaultCampaignEndDate ?? '')}
      data-party-dt-date={String(props.defaultPartyDateTimeDate ?? '')}
      data-party-dt-time={String(props.defaultPartyDateTimeTime ?? '')}
      data-party-enabled={String(props.defaultPartyDateEnabled)}
      data-child-name={String(props.childName ?? '')}
      data-child-age={String(props.childAge ?? '')}
      data-error={String(props.error ?? '')}
    />
  ),
}));

afterEach(() => {
  cleanup();
});

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHostAuth.mockResolvedValue({ hostId: 'host-1' });
  mocks.buildCreateFlowViewModel.mockReturnValue({
    redirectTo: null,
    stepLabel: 'The dates',
    title: 'Dates',
  });
  mocks.getDreamBoardDraft.mockResolvedValue({
    childName: 'Maya',
    childAge: 7,
    birthdayDate: '2026-06-15',
    partyDate: '2026-06-15',
    campaignEndDate: '2026-06-15',
    partyDateTime: null,
  });
});

async function renderPage(sp: Record<string, string> = {}) {
  const Page = (await import('@/app/(host)/create/dates/page')).default;
  return renderToStaticMarkup(await Page({ searchParams: Promise.resolve(sp) }));
}

describe('Create Dates Page', () => {
  it('renders stepper at step 3 of 6', async () => {
    const html = await renderPage();
    expect(html).toContain('data-testid="wizard-stepper"');
    expect(html).toContain('data-step="3"');
  });

  it('passes draft birthday date to DatesForm', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      birthdayDate: '2026-06-15',
      partyDate: '2026-06-15',
      campaignEndDate: '2026-06-15',
      partyDateTime: null,
    });

    const html = await renderPage();
    expect(html).toContain('data-birthday="2026-06-15"');
  });

  it('passes childName and childAge to DatesForm', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      birthdayDate: '2026-06-15',
      partyDate: '2026-06-15',
      campaignEndDate: '2026-06-15',
      partyDateTime: null,
    });

    const html = await renderPage();
    expect(html).toContain('data-child-name="Maya"');
    expect(html).toContain('data-child-age="7"');
  });

  it('passes error message to DatesForm when error searchParam is present', async () => {
    const html = await renderPage({ error: 'birthday_date' });
    expect(html).toContain('data-testid="dates-form"');
    expect(html).toContain('data-error="Resolved: birthday_date"');
  });

  it('passes empty error when no searchParam error', async () => {
    const html = await renderPage();
    expect(html).toContain('data-error=""');
  });

  it('computes defaultPartyDateEnabled correctly when dates differ', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      birthdayDate: '2026-06-15',
      partyDate: '2026-06-16',
      campaignEndDate: '2026-06-16',
      partyDateTime: null,
    });

    const html = await renderPage();
    expect(html).toContain('data-party-enabled="true"');
  });

  it('computes defaultPartyDateEnabled as false when all dates match', async () => {
    mocks.getDreamBoardDraft.mockResolvedValue({
      childName: 'Maya',
      childAge: 7,
      birthdayDate: '2026-06-15',
      partyDate: '2026-06-15',
      campaignEndDate: '2026-06-15',
      partyDateTime: null,
    });

    const html = await renderPage();
    expect(html).toContain('data-party-enabled="false"');
  });
});
