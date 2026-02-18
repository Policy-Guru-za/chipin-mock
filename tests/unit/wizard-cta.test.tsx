/**
 * @vitest-environment jsdom
 */
import type { ComponentProps, ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

import { WizardCTA } from '@/components/create-wizard/WizardCTA';

afterEach(() => cleanup());

function renderCTA(props: Partial<ComponentProps<typeof WizardCTA>> = {}) {
  return render(
    <form>
      <WizardCTA submitLabel="Continue" backHref="/create/child" backLabel="Back" {...props} />
    </form>,
  );
}

describe('WizardCTA', () => {
  it('renders submit buttons with type submit', () => {
    renderCTA();

    const submitButtons = screen.getAllByRole('button', { name: 'Continue' });
    expect(submitButtons.length).toBeGreaterThanOrEqual(1);

    for (const button of submitButtons) {
      expect(button).toHaveAttribute('type', 'submit');
    }
  });

  it('does not render submit buttons as type button', () => {
    renderCTA();

    const submitButtons = screen.getAllByRole('button', { name: 'Continue' });
    expect(submitButtons.some((button) => button.getAttribute('type') === 'button')).toBe(false);
  });

  it('renders back links with correct href when backHref is provided', () => {
    renderCTA();

    const backLinks = screen.getAllByRole('link', { name: /Back/i });
    expect(backLinks.length).toBeGreaterThanOrEqual(1);
    for (const link of backLinks) {
      expect(link).toHaveAttribute('href', '/create/child');
    }
  });

  it('does not render back links when backHref is omitted', () => {
    render(
      <form>
        <WizardCTA submitLabel="Continue" />
      </form>,
    );

    expect(screen.queryByRole('link', { name: /Back/i })).not.toBeInTheDocument();
  });

  it('shows submit label text', () => {
    renderCTA();
    expect(screen.getAllByText('Continue').length).toBeGreaterThanOrEqual(1);
  });

  it('applies pending state to submit buttons', () => {
    renderCTA({ pending: true, pendingLabel: 'Saving...' });

    const pendingButtons = screen.getAllByRole('button', { name: 'Saving...' });
    expect(pendingButtons.length).toBeGreaterThanOrEqual(1);

    for (const button of pendingButtons) {
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    }
  });

  it('shows pending label and spinner while pending', () => {
    const { container } = renderCTA({ pending: true, pendingLabel: 'Saving...' });

    expect(screen.getAllByText('Saving...').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Continue')).not.toBeInTheDocument();
    expect(container.querySelectorAll('.animate-wizard-spin').length).toBeGreaterThanOrEqual(1);
  });

  it('disables back links while pending', () => {
    renderCTA({ pending: true });

    const backLinks = screen.getAllByRole('link', { name: /Back/i });
    for (const link of backLinks) {
      expect(link.className).toContain('pointer-events-none');
    }
  });

  it('renders error banner when error is provided', () => {
    renderCTA({ error: 'Something went wrong' });

    expect(screen.getAllByRole('alert').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Something went wrong').length).toBeGreaterThanOrEqual(1);
  });

  it('does not render error banner when error is missing', () => {
    renderCTA();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('prevents immediate double submit clicks', () => {
    renderCTA();

    const submitButton = screen.getAllByRole('button', { name: 'Continue' })[0];
    const firstClick = fireEvent.click(submitButton);
    const secondClick = fireEvent.click(submitButton);

    expect(firstClick).toBe(true);
    expect(secondClick).toBe(false);
  });

  it('allows submitting again after pending transitions back to false', () => {
    const { rerender } = renderCTA();

    const firstButton = screen.getAllByRole('button', { name: 'Continue' })[0];
    expect(fireEvent.click(firstButton)).toBe(true);
    expect(fireEvent.click(firstButton)).toBe(false);

    rerender(
      <form>
        <WizardCTA submitLabel="Continue" backHref="/create/child" backLabel="Back" pending />
      </form>,
    );
    rerender(
      <form>
        <WizardCTA submitLabel="Continue" backHref="/create/child" backLabel="Back" pending={false} />
      </form>,
    );

    const resetButton = screen.getAllByRole('button', { name: 'Continue' })[0];
    expect(fireEvent.click(resetButton)).toBe(true);
  });
});
