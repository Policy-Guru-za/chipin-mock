/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { GiftCard } from '@/components/dream-board/GiftCard';
import type { GuestViewModel } from '@/lib/dream-boards/view-model';

afterEach(() => {
  cleanup();
});

const makeView = (overrides: Partial<GuestViewModel> = {}): GuestViewModel => ({
  hostId: 'host-1',
  childName: 'Maya',
  childPhotoUrl: 'https://example.com/maya.jpg',
  slug: 'maya-birthday',
  partyDateTime: null,
  giftTitle: 'Frozen Lego Set',
  giftSubtitle: 'Dream gift',
  giftImage: '/icons/gifts/gifta-logo.png',
  displayTitle: 'Frozen Lego Set',
  displaySubtitle: 'Dream gift',
  displayImage: '/icons/gifts/gifta-logo.png',
  charityEnabled: false,
  charityName: null,
  charityDescription: null,
  charityLogoUrl: null,
  charityAllocationLabel: null,
  timeRemainingMessage: '10 days left to chip in 🎁',
  timeRemainingUrgency: 'moderate',
  isActive: true,
  isFunded: false,
  isExpired: false,
  isClosed: false,
  daysLeft: 10,
  contributionCount: 3,
  message: null,
  ...overrides,
});

describe('GiftCard', () => {
  it('does not render the fallback dream gift subtitle', () => {
    render(<GiftCard view={makeView({ giftSubtitle: 'Dream gift' })} />);

    expect(screen.queryByText('Dream gift')).not.toBeInTheDocument();
    expect(screen.getByText('Frozen Lego Set')).toBeInTheDocument();
  });

  it('renders a non-default subtitle', () => {
    render(<GiftCard view={makeView({ giftSubtitle: 'Limited edition collector set' })} />);

    expect(screen.getByText('Limited edition collector set')).toBeInTheDocument();
  });

  it('keeps the child message visible when subtitle is hidden', () => {
    render(
      <GiftCard
        view={makeView({
          giftSubtitle: 'Dream gift',
          message: 'This is all I have wanted all year.',
        })}
      />
    );

    expect(screen.getByText('A message from Maya:')).toBeInTheDocument();
    expect(screen.getByText('This is all I have wanted all year.')).toBeInTheDocument();
  });
});
