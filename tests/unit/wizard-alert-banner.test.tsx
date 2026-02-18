/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { WizardAlertBanner } from '@/components/create-wizard/WizardAlertBanner';

afterEach(() => cleanup());

describe('WizardAlertBanner', () => {
  it('renders error variant styles', () => {
    render(<WizardAlertBanner variant="error">Something went wrong</WizardAlertBanner>);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveClass('bg-[#FEE2E2]');
    expect(alert).toHaveClass('text-[#991B1B]');
  });

  it('renders warning variant styles', () => {
    render(<WizardAlertBanner variant="warning">Check this warning</WizardAlertBanner>);
    expect(screen.getByRole('alert')).toHaveClass('bg-amber-light');
  });

  it('renders info variant styles', () => {
    render(<WizardAlertBanner variant="info">Helpful info</WizardAlertBanner>);
    expect(screen.getByRole('alert')).toHaveClass('bg-sage-light');
  });

  it('shows content text', () => {
    render(<WizardAlertBanner variant="error">Something went wrong</WizardAlertBanner>);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('returns null when children is null', () => {
    render(<WizardAlertBanner variant="error">{null}</WizardAlertBanner>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('returns null when children is an empty string', () => {
    render(<WizardAlertBanner variant="error">{''}</WizardAlertBanner>);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders retry button when onRetry is provided', () => {
    render(
      <WizardAlertBanner variant="error" onRetry={vi.fn()}>
        Retry needed
      </WizardAlertBanner>,
    );

    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('calls onRetry when clicking Try again', async () => {
    const handleRetry = vi.fn();
    render(
      <WizardAlertBanner variant="error" onRetry={handleRetry}>
        Retry needed
      </WizardAlertBanner>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});

