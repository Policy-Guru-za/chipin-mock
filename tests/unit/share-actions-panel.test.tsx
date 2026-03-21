/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { afterEach } from 'vitest';
import { describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  trackGoogleAnalyticsEvent: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    [key: string]: unknown;
  }) => createElement('a', { href, ...props }, children),
}));

vi.mock('@/lib/analytics/google', () => ({
  trackGoogleAnalyticsEvent: mocks.trackGoogleAnalyticsEvent,
}));

import { ShareActionsPanel } from '@/components/create-review/ShareActionsPanel';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('ShareActionsPanel', () => {
  it('renders all required share actions with stable targets', () => {
    render(
      <ShareActionsPanel
        whatsappHref="https://wa.me/?text=hello"
        emailHref="mailto:?subject=Hi&body=Hello"
        copied={false}
        onCopyLink={() => undefined}
      />
    );

    expect(screen.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute(
      'href',
      'https://wa.me/?text=hello'
    );
    expect(screen.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:?subject=Hi&body=Hello'
    );
    expect(screen.getByRole('button', { name: /Copy Link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to Dashboard/i })).toHaveAttribute(
      'href',
      '/dashboard'
    );
  });

  it('calls copy handler when copy button is clicked', async () => {
    const user = userEvent.setup();
    const onCopyLink = vi.fn();

    render(
      <ShareActionsPanel
        whatsappHref="https://wa.me/?text=hello"
        emailHref="mailto:?subject=Hi&body=Hello"
        copied={false}
        onCopyLink={onCopyLink}
      />
    );

    await user.click(screen.getByRole('button', { name: /Copy Link/i }));
    expect(onCopyLink).toHaveBeenCalledTimes(1);
    expect(mocks.trackGoogleAnalyticsEvent).toHaveBeenCalledWith('share_link_clicked', {
      channel: 'copy_link',
    });
  });

  it('tracks WhatsApp and email share clicks with safe channel labels', async () => {
    const user = userEvent.setup();

    render(
      <ShareActionsPanel
        whatsappHref="https://wa.me/?text=hello"
        emailHref="mailto:?subject=Hi&body=Hello"
        copied={false}
        onCopyLink={() => undefined}
      />
    );

    await user.click(screen.getByRole('link', { name: 'WhatsApp' }));
    await user.click(screen.getByRole('link', { name: 'Email' }));

    expect(mocks.trackGoogleAnalyticsEvent).toHaveBeenCalledWith('share_link_clicked', {
      channel: 'whatsapp',
    });
    expect(mocks.trackGoogleAnalyticsEvent).toHaveBeenCalledWith('share_link_clicked', {
      channel: 'email',
    });
  });

  it('shows copied feedback label when copied is true', () => {
    render(
      <ShareActionsPanel
        whatsappHref="https://wa.me/?text=hello"
        emailHref="mailto:?subject=Hi&body=Hello"
        copied
        onCopyLink={() => undefined}
      />
    );

    expect(screen.getByRole('button', { name: /Copied! ✓/i })).toBeInTheDocument();
  });
});
