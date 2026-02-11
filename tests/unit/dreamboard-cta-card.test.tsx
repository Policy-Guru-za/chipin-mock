/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import {
  buildDreamboardCtaStateMessage,
  DreamboardCtaCard,
} from '@/components/dream-board/DreamboardCtaCard';

afterEach(() => {
  cleanup();
});

describe('DreamboardCtaCard', () => {
  it('builds invitation copy for active boards without contributors', () => {
    const message = buildDreamboardCtaStateMessage({
      contributionCount: 0,
      isFunded: false,
      isExpired: false,
      isClosed: false,
      timeRemainingMessage: '10 days left to chip in 🎁',
    });

    expect(message).toBe('Be the first to contribute and start the celebration.');
  });

  it('builds social proof + time copy for active boards with contributors', () => {
    const message = buildDreamboardCtaStateMessage({
      contributionCount: 2,
      isFunded: false,
      isExpired: false,
      isClosed: false,
      timeRemainingMessage: '10 days left to chip in 🎁',
    });

    expect(message).toContain('2 people have chipped in.');
    expect(message).toContain('10 days left to chip in 🎁');
  });

  it('builds funded copy for funded boards', () => {
    const message = buildDreamboardCtaStateMessage({
      contributionCount: 3,
      isFunded: true,
      isExpired: false,
      isClosed: false,
      timeRemainingMessage: 'irrelevant',
    });

    expect(message).toBe('Gift funded - thank you, everyone! 🎉');
  });

  it('builds closed copy for expired boards', () => {
    const message = buildDreamboardCtaStateMessage({
      contributionCount: 3,
      isFunded: false,
      isExpired: true,
      isClosed: false,
      timeRemainingMessage: 'irrelevant',
    });

    expect(message).toBe('This Dreamboard is closed to new contributions.');
  });

  it('renders enabled CTA button with contribute link', () => {
    render(
      <DreamboardCtaCard
        slug="maya-birthday"
        childName="Maya"
        stateMessage="2 people have chipped in."
        disabled={false}
      />
    );

    const link = screen.getByRole('link', { name: 'Chip in for Maya 💝' });
    expect(link).toHaveAttribute('href', '/maya-birthday/contribute?source=dream-board');
  });

  it('renders closed state without CTA link when disabled', () => {
    render(
      <DreamboardCtaCard
        slug="maya-birthday"
        childName="Maya"
        stateMessage="This Dreamboard is closed to new contributions."
        disabled
      />
    );

    expect(screen.getByText('This Dreamboard is closed')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Chip in for/ })).not.toBeInTheDocument();
  });
});
