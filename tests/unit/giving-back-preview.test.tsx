/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';

import { GivingBackPreview } from '@/components/create-wizard/GivingBackPreview';

const defaultProps = () => ({
  charityEnabled: true,
  selectedCharity: {
    id: 'c1',
    name: 'Reach for a Dream',
    description: 'Supporting children',
    category: 'Children',
    logoUrl: null,
  },
  splitType: 'percentage' as const,
  percentage: 25,
  thresholdAmount: 100,
  childName: 'Maya',
});

afterEach(() => {
  cleanup();
});

describe('GivingBackPreview', () => {
  it('shows 100% gift message when charity is disabled', () => {
    render(<GivingBackPreview {...defaultProps()} charityEnabled={false} />);

    expect(screen.getByText('All contributions go to the dream gift.')).toBeInTheDocument();
    expect(screen.queryByText('Supporting children')).toBeNull();
  });

  it('shows gift and charity percentages in percentage mode', () => {
    render(<GivingBackPreview {...defaultProps()} charityEnabled percentage={25} />);

    expect(screen.getByText('Gift portion: 75%')).toBeInTheDocument();
    expect(screen.getByText('Charity portion: 25%')).toBeInTheDocument();
  });

  it('shows selected charity name and description', () => {
    render(<GivingBackPreview {...defaultProps()} />);

    expect(screen.getAllByText('Reach for a Dream').length).toBeGreaterThan(0);
    expect(screen.getByText('Supporting children')).toBeInTheDocument();
  });

  it('shows per-R100 breakdown in percentage mode', () => {
    render(<GivingBackPreview {...defaultProps()} percentage={25} />);

    expect(screen.getByText(/R75/)).toBeInTheDocument();
    expect(screen.getByText(/R25/)).toBeInTheDocument();
  });

  it('shows threshold amount in threshold mode', () => {
    render(<GivingBackPreview {...defaultProps()} splitType="threshold" thresholdAmount={200} />);

    expect(screen.getByText('First R200 goes to charity.')).toBeInTheDocument();
  });

  it('uses child name in breakdown', () => {
    render(<GivingBackPreview {...defaultProps()} childName="Maya" />);

    expect(screen.getByText(/Maya's dream gift/)).toBeInTheDocument();
  });

  it('handles null selectedCharity gracefully', () => {
    render(<GivingBackPreview {...defaultProps()} selectedCharity={null} />);

    expect(screen.getByText('Select a charity to preview where the impact will go.')).toBeInTheDocument();
  });

  it('impact bar widths reflect percentage split', () => {
    render(<GivingBackPreview {...defaultProps()} percentage={30} />);

    const giftBar = screen.getByText('Gift');
    const charityBar = screen.getByText('Charity');
    expect(giftBar).toHaveStyle({ width: '70%' });
    expect(charityBar).toHaveStyle({ width: '30%' });
  });
});
