/**
 * @vitest-environment jsdom
 */
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DatesForm } from '@/app/(host)/create/dates/DatesForm';

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

vi.mock('@/components/create-wizard/DatesPreview', () => ({
  DatesPreview: (props: Record<string, unknown>) => (
    <div
      data-testid="dates-preview"
      data-child-name={String(props.childName ?? '')}
      data-birthday={String(props.birthdayDate ?? '')}
      data-campaign-days={String(props.campaignDays ?? '')}
    />
  ),
}));

afterEach(() => {
  cleanup();
});

const defaultProps = () => ({
  action: vi.fn(),
  defaultBirthdayDate: '2026-06-15',
  defaultPartyDate: '2026-06-15',
  defaultCampaignEndDate: '2026-06-15',
  defaultPartyDateTimeDate: '',
  defaultPartyDateTimeTime: '',
  defaultPartyDateEnabled: false,
  childName: 'Maya',
  childAge: 7,
  error: null as string | null,
});

describe('DatesForm', () => {
  it('renders birthday date input with default value', () => {
    const { container } = render(<DatesForm {...defaultProps()} />);
    const birthdayInput = container.querySelector<HTMLInputElement>('#birthdayDate');
    expect(birthdayInput).not.toBeNull();
    expect(birthdayInput?.value).toBe('2026-06-15');
  });

  it('hides party/campaign fields when partyDateEnabled is false', () => {
    const { container } = render(<DatesForm {...defaultProps()} defaultPartyDateEnabled={false} />);
    expect(container.querySelector('input#partyDate[type="date"]')).toBeNull();
    expect(container.querySelector('input#campaignEndDate[type="date"]')).toBeNull();

    const hiddenPartyDate = container.querySelector<HTMLInputElement>('input[name="partyDate"][type="hidden"]');
    const hiddenCampaignEndDate = container.querySelector<HTMLInputElement>(
      'input[name="campaignEndDate"][type="hidden"]',
    );
    expect(hiddenPartyDate?.value).toBe('2026-06-15');
    expect(hiddenCampaignEndDate?.value).toBe('2026-06-15');
  });

  it('shows party/campaign fields when partyDateEnabled is true', () => {
    const { container } = render(
      <DatesForm
        {...defaultProps()}
        defaultPartyDateEnabled
        defaultPartyDate="2026-06-16"
        defaultCampaignEndDate="2026-06-16"
      />,
    );

    expect(container.querySelector('input#partyDate[type="date"]')).toBeInTheDocument();
    expect(container.querySelector('input#campaignEndDate[type="date"]')).toBeInTheDocument();
  });

  it('toggling checkbox shows/hides party fields', () => {
    const { container } = render(<DatesForm {...defaultProps()} defaultPartyDateEnabled={false} />);
    const checkbox = container.querySelector<HTMLInputElement>('#partyDateEnabled');
    expect(checkbox).not.toBeNull();
    expect(container.querySelector('input#partyDate[type="date"]')).toBeNull();

    fireEvent.click(checkbox!);

    expect(container.querySelector('input#partyDate[type="date"]')).toBeInTheDocument();
    expect(container.querySelector('input#campaignEndDate[type="date"]')).toBeInTheDocument();
  });

  it('changing birthday cascades to party/campaign when checkbox is off', () => {
    const { container } = render(<DatesForm {...defaultProps()} defaultPartyDateEnabled={false} />);
    const birthdayInput = container.querySelector<HTMLInputElement>('#birthdayDate');
    expect(birthdayInput).not.toBeNull();

    fireEvent.change(birthdayInput!, { target: { value: '2026-07-01' } });

    const hiddenPartyDate = container.querySelector<HTMLInputElement>('input[name="partyDate"][type="hidden"]');
    const hiddenCampaignEndDate = container.querySelector<HTMLInputElement>(
      'input[name="campaignEndDate"][type="hidden"]',
    );
    expect(hiddenPartyDate?.value).toBe('2026-07-01');
    expect(hiddenCampaignEndDate?.value).toBe('2026-07-01');
  });

  it('passes childName and birthdayDate to DatesPreview', () => {
    render(<DatesForm {...defaultProps()} />);
    const previews = screen.getAllByTestId('dates-preview');
    expect(previews.length).toBeGreaterThan(0);

    for (const preview of previews) {
      expect(preview).toHaveAttribute('data-child-name', 'Maya');
      expect(preview).toHaveAttribute('data-birthday', '2026-06-15');
    }
  });

  it('passes error to WizardCTA, not to field wrappers', () => {
    const { container } = render(
      <DatesForm {...defaultProps()} error="Birthday date must be in the future." />,
    );
    expect(screen.getAllByText('Birthday date must be in the future.').length).toBeGreaterThan(0);
    expect(container.querySelectorAll('[data-error-id]').length).toBe(0);
  });

  it('party time input is disabled when partyDateTimeDate is empty', () => {
    const { container } = render(<DatesForm {...defaultProps()} defaultPartyDateTimeDate="" />);
    const partyTimeInput = container.querySelector<HTMLInputElement>('#partyDateTimeTime');
    expect(partyTimeInput).toBeDisabled();
  });
});
