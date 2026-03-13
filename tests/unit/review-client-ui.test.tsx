/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

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
  payoutMethod: 'takealot_voucher' as const,
  payoutEmail: 'parent@example.com',
  hostWhatsAppNumber: '+27821234567',
};

afterEach(() => {
  cleanup();
});

describe('ReviewClient', () => {
  it('renders preview mode with Create Dreamboard CTA and voucher edit link', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByRole('heading', { name: 'Review your Dreamboard' })).toBeInTheDocument();
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
    expect(screen.getByRole('link', { name: 'Edit voucher details' })).toHaveAttribute(
      'href',
      '/create/voucher'
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

  it('renders the voucher placeholder summary for the default flow', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(
      screen.getByText(
        'Takealot Voucher placeholder via parent@example.com and +27821234567'
      )
    ).toBeInTheDocument();
  });

  it('still renders legacy summary copy for Karri Card drafts', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });
    const karriDraft = {
      ...draft,
      payoutMethod: 'karri_card' as const,
      karriCardHolderName: 'Max Charter',
    };

    render(<ReviewClient draft={karriDraft} publishAction={publishAction} />);

    expect(screen.getByText('Legacy Karri Card (Max Charter)')).toBeInTheDocument();
  });

  it('still renders fallback summary copy for bank drafts', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });
    const bankDraft = {
      ...draft,
      payoutMethod: 'bank' as const,
      bankName: 'FNB',
      bankAccountLast4: '4567',
    };

    render(<ReviewClient draft={bankDraft} publishAction={publishAction} />);

    expect(screen.getByText(/Bank transfer \(FNB\)/)).toBeInTheDocument();
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
});
