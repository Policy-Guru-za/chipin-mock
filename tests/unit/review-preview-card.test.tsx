import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

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

import { ReviewPreviewCard } from '@/components/create-review/ReviewPreviewCard';

const baseProps = {
  childName: 'Max',
  childAge: 8,
  childPhotoUrl: 'https://images.example/max-avatar.jpg',
  birthdayLabel: '26 February 2026',
  giftName: 'PlayStation II',
  giftImageUrl: 'https://images.example/playstation.jpg',
  partyDateTimeLabel: '28 February 2026, 11:00',
  campaignCloseLabel: '28 February 2026',
  payoutSummary: 'Karri Card (Max Charter)',
  charitySummary: 'No charity split selected.',
};

afterEach(() => {
  cleanup();
});

describe('ReviewPreviewCard', () => {
  it('renders dynamic identity, images, and detail rows', () => {
    const html = renderToStaticMarkup(<ReviewPreviewCard {...baseProps} />);

    expect(html).toContain('Max turns 8!');
    expect(html).toContain('Birthday: 26 February 2026');
    expect(html).toContain('PlayStation II');
    expect(html).toContain('Birthday party');
    expect(html).toContain('Campaign closes');
    expect(html).toContain('Payout');
    expect(html).toContain('No charity split selected.');
    expect(html).toContain('https://images.example/max-avatar.jpg');
    expect(html).toContain('https://images.example/playstation.jpg');
    expect(html).not.toContain('/public/images/kid-tank-top.png');
  });

  it('shows share row when shareUrl is provided', () => {
    const html = renderToStaticMarkup(
      <ReviewPreviewCard
        {...baseProps}
        shareUrl="https://chipin-mock.vercel.app/max-birthday-ymukga"
        onCopyShareUrl={() => undefined}
        copied={false}
      />
    );

    expect(html).toContain('Shareable link');
    expect(html).toContain('https://chipin-mock.vercel.app/max-birthday-ymukga');
    expect(html).toContain('Copy');
  });

  it('hides share row when shareUrl is missing', () => {
    const html = renderToStaticMarkup(<ReviewPreviewCard {...baseProps} />);

    expect(html).not.toContain('Shareable link');
  });
});
