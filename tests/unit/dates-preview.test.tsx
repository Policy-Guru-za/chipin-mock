/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';

import { DatesPreview } from '@/components/create-wizard/DatesPreview';

afterEach(() => {
  cleanup();
});

const defaultProps = () => ({
  childName: 'Maya',
  childAge: 7,
  birthdayDate: '2026-06-15',
  partyDate: '2026-06-15',
  partyDateTimeDate: '',
  partyDateTimeTime: '',
  campaignEndDate: '2026-06-15',
  campaignDays: 30,
});

describe('DatesPreview', () => {
  it('displays child name and age', () => {
    render(<DatesPreview {...defaultProps()} />);
    expect(screen.getByText('Maya turns 7!')).toBeInTheDocument();
  });

  it('displays formatted birthday date', () => {
    render(<DatesPreview {...defaultProps()} />);
    expect(screen.getByText('15 June 2026')).toBeInTheDocument();
  });

  it('shows countdown badge with plural days', () => {
    render(<DatesPreview {...defaultProps()} campaignDays={30} />);
    expect(screen.getByText('Campaign closes in 30 days')).toBeInTheDocument();
  });

  it('shows singular day in countdown', () => {
    render(<DatesPreview {...defaultProps()} campaignDays={1} />);
    expect(screen.getByText('Campaign closes in 1 day')).toBeInTheDocument();
  });

  it('shows closes today for zero days', () => {
    render(<DatesPreview {...defaultProps()} campaignDays={0} />);
    expect(screen.getByText('Campaign closes today')).toBeInTheDocument();
  });

  it('hides party line when partyDateTimeDate is empty', () => {
    render(<DatesPreview {...defaultProps()} partyDateTimeDate="" />);
    expect(screen.queryByText(/Party day/i)).toBeNull();
  });

  it('shows party line when partyDateTimeDate is set', () => {
    render(
      <DatesPreview
        {...defaultProps()}
        partyDateTimeDate="2026-06-15"
        partyDateTimeTime="14:00"
      />,
    );
    expect(screen.getByText(/Party day/i)).toBeInTheDocument();
    expect(screen.getByText(/2:00 PM/)).toBeInTheDocument();
  });

  it('renders timeline markers for Today, Birthday, and Closes', () => {
    render(<DatesPreview {...defaultProps()} />);
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('Birthday')).toBeInTheDocument();
    expect(screen.getByText('Closes')).toBeInTheDocument();
  });

  it('displays fallback name when childName is empty', () => {
    render(<DatesPreview {...defaultProps()} childName="" />);
    expect(screen.getByText('Your child turns 7!')).toBeInTheDocument();
  });

  it('displays ? when childAge is 0', () => {
    render(<DatesPreview {...defaultProps()} childAge={0} />);
    expect(screen.getByText(/turns \?!/)).toBeInTheDocument();
  });
});
