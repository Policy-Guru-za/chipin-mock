/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ReviewDetailRows } from '@/components/create-review/ReviewDetailRows';

afterEach(() => {
  cleanup();
});

const baseProps = {
  giftName: 'Electric Scooter',
  campaignCloseLabel: '28 February 2026',
  payoutSummary: 'Karri Card (Max Charter)',
  charitySummary: 'No charity split selected.',
};

const getRowForLabel = (label: string) => {
  const labelNode = screen.getByText(label);
  const row = labelNode.parentElement?.parentElement;
  if (!row) {
    throw new Error(`Could not resolve row for label: ${label}`);
  }
  return row as HTMLDivElement;
};

describe('ReviewDetailRows', () => {
  it('renders five rows in order when party date/time is present', () => {
    render(<ReviewDetailRows {...baseProps} partyDateTimeLabel="28 February 2026, 11:00" />);

    const labels = ['Dream gift', 'Birthday party', 'Campaign closes', 'Payout', 'Giving back'];
    const nodes = labels.map((label) => screen.getByText(label));

    for (let index = 1; index < nodes.length; index += 1) {
      expect(nodes[index - 1].compareDocumentPosition(nodes[index]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
  });

  it('renders four rows and omits birthday party row when party date/time is missing', () => {
    render(<ReviewDetailRows {...baseProps} partyDateTimeLabel={null} />);

    expect(screen.getByText('Dream gift')).toBeInTheDocument();
    expect(screen.getByText('Campaign closes')).toBeInTheDocument();
    expect(screen.getByText('Payout')).toBeInTheDocument();
    expect(screen.getByText('Giving back')).toBeInTheDocument();
    expect(screen.queryByText('Birthday party')).not.toBeInTheDocument();
  });

  it('applies row-level separator utility classes and has no wrapper border divs', () => {
    const { container } = render(
      <ReviewDetailRows {...baseProps} partyDateTimeLabel="28 February 2026, 11:00" />
    );

    const dreamGiftRow = getRowForLabel('Dream gift');
    expect(dreamGiftRow.className).toContain('[&:not(:last-child)]:border-b');
    expect(dreamGiftRow.className).toContain('[&:not(:last-child)]:border-border-soft');
    expect(dreamGiftRow.className).toContain('py-3');
    expect(dreamGiftRow.className).toContain('first:pt-0');
    expect(dreamGiftRow.className).toContain('last:pb-0');

    expect(container.querySelectorAll('div.border-b.border-border-soft')).toHaveLength(0);
  });
});
