/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const { mockUseActionState, scrollToMock } = vi.hoisted(() => ({
  mockUseActionState: vi.fn(),
  scrollToMock: vi.fn(),
}));

vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');

  return {
    ...actual,
    useActionState: mockUseActionState,
  };
});

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: {
    src: string;
    alt: string;
    fill?: boolean;
    priority?: boolean;
  }) =>
    createElement('img', { src, alt, ...props }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => createElement('a', { href, ...props }, children),
}));

vi.mock('@/components/effects/ConfettiTrigger', () => ({
  ConfettiTrigger: () => null,
}));

import { ReviewClient, type PublishState } from '@/app/(host)/create/review/ReviewClient';

const draft = {
  childName: 'Max',
  childAge: 8,
  childPhotoUrl: 'https://images.example/max-avatar.jpg',
  birthdayDate: '2026-02-26',
  partyDate: '2026-02-28',
  partyDateTime: '2026-02-28T11:00:00.000Z',
  campaignEndDate: '2026-02-28',
  giftName: 'PlayStation II',
  giftImageUrl: 'https://images.example/playstation.jpg',
  payoutMethod: 'karri_card' as const,
  payoutEmail: 'parent@example.com',
  hostWhatsAppNumber: '+27821234567',
  karriCardHolderName: 'Max Charter',
};

const setActionState = (state: PublishState) => {
  mockUseActionState.mockReturnValue([state, vi.fn(), false]);
};

beforeEach(() => {
  scrollToMock.mockReset();
  mockUseActionState.mockReset();
  vi.stubGlobal('scrollTo', scrollToMock);
  setActionState({ status: 'preview' });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('ReviewClient', () => {
  it('renders preview mode with Create Dreamboard CTA and payout edit link', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByRole('heading', { name: 'Review your Dreamboard' })).toBeInTheDocument();
    expect(scrollToMock).not.toHaveBeenCalled();
    expect(screen.getAllByRole('button', { name: 'Create Dreamboard' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('link', { name: 'Edit child details' })).toHaveAttribute(
      'href',
      '/create/child'
    );
    expect(screen.getByRole('link', { name: 'Edit gift details' })).toHaveAttribute(
      'href',
      '/create/gift'
    );
    expect(screen.getByRole('link', { name: 'Edit dates' })).toHaveAttribute(
      'href',
      '/create/dates'
    );
    expect(screen.getByRole('link', { name: 'Edit payout details' })).toHaveAttribute(
      'href',
      '/create/payout'
    );
  });

  it('renders stepper progress for the fifth step', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByRole('progressbar', { name: 'Step 5 of 5: Review' })).toBeInTheDocument();
  });

  it('renders the payout summary for the selected method', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByText('Karri Card payout for Max Charter')).toBeInTheDocument();
  });

  it('does not show a charity edit link in the default flow', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.queryByRole('link', { name: 'Edit charity settings' })).toBeNull();
  });

  it('hides birthday party summary when no party is planned', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });
    const noPartyDraft = {
      ...draft,
      partyDate: draft.birthdayDate,
      partyDateTime: null,
    };

    render(<ReviewClient draft={noPartyDraft} publishAction={publishAction} />);

    expect(screen.queryByText(/Birthday Party/i)).toBeNull();
  });

  it('resets scroll to the top and focuses the celebration state after publish success', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({
      status: 'published',
      shareUrl: 'https://www.gifta.co.za/max-dreamboard',
    });

    setActionState({
      status: 'published',
      shareUrl: 'https://www.gifta.co.za/max-dreamboard',
    });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    const heading = screen.getByRole('heading', { name: "Max's Dreamboard is ready!" });
    const focusTarget = heading.closest('div[tabindex="-1"]');

    expect(heading).toBeInTheDocument();
    expect(scrollToMock).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
    expect(focusTarget).toBe(document.activeElement);
  });
});
