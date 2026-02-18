/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { afterEach } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
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
  payoutMethod: 'karri_card' as const,
  payoutEmail: 'parent@example.com',
  hostWhatsAppNumber: '+27821234567',
  karriCardHolderName: 'Max Charter',
  charityEnabled: false,
};

afterEach(() => {
  cleanup();
});

describe('ReviewClient', () => {
  it('renders preview mode with Create Dreamboard CTA and edit links', () => {
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
    expect(screen.getByRole('link', { name: 'Edit dates' })).toHaveAttribute('href', '/create/dates');
    expect(screen.getByRole('link', { name: 'Edit payout details' })).toHaveAttribute(
      'href',
      '/create/payout'
    );
  });

  it('renders step 6 eyebrow text', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByText('Step 6')).toBeInTheDocument();
  });

  it('renders the review heading', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByRole('heading', { name: 'Review your Dreamboard' })).toBeInTheDocument();
  });

  it('renders ReviewPreviewCard with child name', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByText('Max turns 8!')).toBeInTheDocument();
  });

  it('renders ReviewPreviewCard with gift name', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getAllByText('PlayStation II').length).toBeGreaterThan(0);
  });

  it('renders payout summary for Karri Card', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByText('Karri Card (Max Charter)')).toBeInTheDocument();
  });

  it('renders payout summary for bank transfer', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });
    const bankDraft = {
      ...draft,
      payoutMethod: 'bank' as const,
      bankName: 'FNB',
      bankAccountLast4: '4567',
      karriCardHolderName: undefined,
    };

    render(<ReviewClient draft={bankDraft} publishAction={publishAction} />);

    expect(screen.getByText(/Bank transfer \(FNB\)/)).toBeInTheDocument();
  });

  it('renders charity summary when disabled', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.getByText('No charity split selected.')).toBeInTheDocument();
  });

  it('renders charity summary with percentage split', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });
    const charityDraft = {
      ...draft,
      charityEnabled: true,
      charitySplitType: 'percentage' as const,
      charityPercentageBps: 2500,
    };

    render(<ReviewClient draft={charityDraft} publishAction={publishAction} />);

    expect(screen.getByText('Charity split: 25% of contributions.')).toBeInTheDocument();
  });

  it('shows edit charity link when charity is enabled', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });
    const charityDraft = {
      ...draft,
      charityEnabled: true,
      charitySplitType: 'percentage' as const,
      charityPercentageBps: 2500,
    };

    render(<ReviewClient draft={charityDraft} publishAction={publishAction} />);

    expect(screen.getByRole('link', { name: 'Edit charity settings' })).toHaveAttribute(
      'href',
      '/create/giving-back'
    );
  });

  it('hides edit charity link when charity is disabled', () => {
    const publishAction = async (
      _state: PublishState,
      _formData: FormData
    ): Promise<PublishState> => ({ status: 'preview' });

    render(<ReviewClient draft={draft} publishAction={publishAction} />);

    expect(screen.queryByRole('link', { name: 'Edit charity settings' })).toBeNull();
  });
});
