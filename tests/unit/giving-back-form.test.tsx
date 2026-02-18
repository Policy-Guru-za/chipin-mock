/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GivingBackForm } from '@/app/(host)/create/giving-back/GivingBackForm';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/create-wizard/GivingBackPreview', () => ({
  GivingBackPreview: (props: Record<string, unknown>) => (
    <div
      data-testid="giving-back-preview"
      data-enabled={String(props.charityEnabled)}
      data-split-type={String(props.splitType)}
      data-percentage={String(props.percentage)}
      data-threshold={String(props.thresholdAmount)}
    />
  ),
}));

const makeCharities = () => [
  {
    id: 'c1',
    name: 'Reach for a Dream',
    description: 'Supporting children',
    category: 'Children',
    logoUrl: null,
  },
  {
    id: 'c2',
    name: 'CHOC',
    description: 'Cancer research',
    category: 'Health',
    logoUrl: null,
  },
];

const defaultProps = () => ({
  action: vi.fn(),
  charities: makeCharities(),
  defaultCharityEnabled: false,
  defaultCharityId: undefined,
  defaultSplitType: 'percentage' as const,
  defaultPercentage: 25,
  defaultThresholdAmount: 100,
  childName: 'Maya',
  error: null as string | null,
});

afterEach(() => {
  cleanup();
});

describe('GivingBackForm', () => {
  it('renders enable toggle in unchecked state by default', () => {
    const { container } = render(
      <GivingBackForm {...defaultProps()} defaultCharityEnabled={false} />,
    );
    const toggle = container.querySelector<HTMLInputElement>('#charityEnabled');
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
  });

  it('hides charity fields when toggle is off', () => {
    const { container } = render(
      <GivingBackForm {...defaultProps()} defaultCharityEnabled={false} />,
    );

    expect(container.querySelectorAll('input[name="charityId"][type="radio"]').length).toBe(0);
    expect(container.querySelector('input[name="charityId"][type="hidden"]')).toBeInTheDocument();
    expect(
      container.querySelector('input[name="charitySplitType"][type="hidden"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[name="charityPercentage"][type="hidden"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[name="charityThresholdAmount"][type="hidden"]'),
    ).toBeInTheDocument();
  });

  it('shows charity fields when toggle is on', () => {
    const { container } = render(
      <GivingBackForm {...defaultProps()} defaultCharityEnabled />,
    );

    expect(container.querySelectorAll('input[name="charityId"][type="radio"]').length).toBe(2);
    expect(container.querySelectorAll('input[name="charitySplitType"][type="radio"]').length).toBe(2);
  });

  it('toggling enable checkbox shows charity fields', () => {
    const { container } = render(
      <GivingBackForm {...defaultProps()} defaultCharityEnabled={false} />,
    );
    const toggle = container.querySelector<HTMLInputElement>('#charityEnabled');
    expect(toggle).toBeInTheDocument();
    expect(container.querySelectorAll('input[name="charityId"][type="radio"]').length).toBe(0);

    fireEvent.click(toggle!);

    expect(container.querySelectorAll('input[name="charityId"][type="radio"]').length).toBe(2);
  });

  it('renders charity cards for each charity', () => {
    const { container } = render(
      <GivingBackForm {...defaultProps()} defaultCharityEnabled />,
    );
    expect(
      container.querySelector('input[name="charityId"][type="radio"][value="c1"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('input[name="charityId"][type="radio"][value="c2"]'),
    ).toBeInTheDocument();
  });

  it('selecting a charity updates radio state', () => {
    const { container } = render(
      <GivingBackForm {...defaultProps()} defaultCharityEnabled />,
    );
    const secondRadio = container.querySelector<HTMLInputElement>(
      'input[name="charityId"][type="radio"][value="c2"]',
    );
    expect(secondRadio).toBeInTheDocument();

    fireEvent.click(secondRadio!);

    expect(secondRadio).toBeChecked();
  });

  it('switching split type shows the correct input', () => {
    const { container } = render(
      <GivingBackForm
        {...defaultProps()}
        defaultCharityEnabled
        defaultSplitType="percentage"
      />,
    );
    expect(container.querySelector('#charityPercentage')).toBeInTheDocument();

    const thresholdRadio = container.querySelector<HTMLInputElement>(
      'input[name="charitySplitType"][type="radio"][value="threshold"]',
    );
    expect(thresholdRadio).toBeInTheDocument();
    fireEvent.click(thresholdRadio!);

    expect(container.querySelector('#charityThresholdAmount')).toBeInTheDocument();
  });

  it('passes state to GivingBackPreview', () => {
    render(
      <GivingBackForm
        {...defaultProps()}
        defaultCharityEnabled
        defaultPercentage={30}
      />,
    );

    const previews = screen.getAllByTestId('giving-back-preview');
    expect(previews.length).toBeGreaterThan(0);

    const hasExpectedPreview = previews.some(
      (preview) =>
        preview.getAttribute('data-enabled') === 'true' &&
        preview.getAttribute('data-percentage') === '30',
    );
    expect(hasExpectedPreview).toBe(true);
  });

  it('error is displayed via WizardCTA, not per-field', () => {
    const { container } = render(
      <GivingBackForm {...defaultProps()} error="Please select a charity." />,
    );

    expect(screen.getAllByText('Please select a charity.').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[role="alert"]').length).toBe(2);
  });

  it('renders back link to dates step', () => {
    render(<GivingBackForm {...defaultProps()} />);
    const backLinks = screen.getAllByRole('link', { name: /back/i });
    expect(backLinks.length).toBeGreaterThan(0);
    expect(backLinks.some((link) => link.getAttribute('href') === '/create/dates')).toBe(true);
  });
});
