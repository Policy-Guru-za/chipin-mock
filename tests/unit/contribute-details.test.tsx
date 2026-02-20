/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { ContributeDetailsClient } from '@/app/(guest)/[slug]/contribute/ContributeDetailsClient';

const pushMock = vi.fn();
const saveFlowDataMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock('@/lib/contributions/flow-storage', () => ({
  saveFlowData: (...args: unknown[]) => saveFlowDataMock(...args),
}));

const setNavigatorIdentity = (userAgent: string, maxTouchPoints: number) => {
  const userAgentDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
  const maxTouchPointsDescriptor = Object.getOwnPropertyDescriptor(window.navigator, 'maxTouchPoints');

  Object.defineProperty(window.navigator, 'userAgent', {
    configurable: true,
    get: () => userAgent,
  });
  Object.defineProperty(window.navigator, 'maxTouchPoints', {
    configurable: true,
    get: () => maxTouchPoints,
  });

  return () => {
    if (userAgentDescriptor) {
      Object.defineProperty(window.navigator, 'userAgent', userAgentDescriptor);
    } else {
      Reflect.deleteProperty(window.navigator, 'userAgent');
    }
    if (maxTouchPointsDescriptor) {
      Object.defineProperty(window.navigator, 'maxTouchPoints', maxTouchPointsDescriptor);
    } else {
      Reflect.deleteProperty(window.navigator, 'maxTouchPoints');
    }
  };
};

describe('ContributeDetailsClient', () => {
  beforeEach(() => {
    pushMock.mockReset();
    saveFlowDataMock.mockReset();
    saveFlowDataMock.mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
  });

  const renderPage = () =>
    render(
      <ContributeDetailsClient
        slug="maya-board"
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        childName="Maya"
        hasAvailableProviders
        unavailableMessage="Payments unavailable"
      />
    );

  it('renders presets with R250 selected by default', () => {
    renderPage();

    expect(screen.getByRole('button', { name: /R\s*150/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /R\s*250/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /R\s*500/ })).toBeInTheDocument();
  });

  it('validates custom amounts within R20-R10,000', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: 'Other' }));
    const customInput = screen.getByPlaceholderText('Enter amount (R20 - R10,000)');

    await userEvent.type(customInput, '10');
    expect(screen.getByText(/between R20 and R10,000/i)).toBeInTheDocument();
  });

  it('hides name field when anonymous is checked and restores it when unchecked', async () => {
    renderPage();
    const nameInput = screen.getByPlaceholderText('The Mason Family');
    await userEvent.type(nameInput, 'Ava');

    await userEvent.click(screen.getByLabelText('Keep my name private'));
    expect(screen.queryByPlaceholderText('The Mason Family')).not.toBeInTheDocument();

    await userEvent.click(screen.getByLabelText('Keep my name private'));
    expect(screen.getByPlaceholderText('The Mason Family')).toHaveValue('Ava');
  });

  it('uses mobile-safe text size for contributor name input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('The Mason Family')).toHaveClass('text-base');
  });

  it('enforces a 500-char birthday message cap', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /message \(optional\)/i }));
    const textarea = screen.getByLabelText('Birthday message');
    await userEvent.type(textarea, 'a'.repeat(520));
    expect(textarea).toHaveValue('a'.repeat(500));
    expect(screen.getByText(/^500\/500/)).toBeInTheDocument();
  });

  it('shows threshold styling text when approaching message limit', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /message \(optional\)/i }));
    const textarea = screen.getByLabelText('Birthday message');

    await userEvent.type(textarea, 'a'.repeat(495));
    expect(screen.getByText(/You have 5 characters left/)).toBeInTheDocument();
  });

  it('uses mobile-safe text size for birthday message textarea', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /message \(optional\)/i }));
    expect(screen.getByLabelText('Birthday message')).toHaveClass('text-base');
  });

  it('keeps continue disabled until valid non-anonymous name is provided', async () => {
    renderPage();
    const continueButton = screen.getByRole('button', { name: /Continue to payment/i });
    expect(continueButton).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('The Mason Family'), 'A');
    expect(continueButton).toBeDisabled();

    await userEvent.type(screen.getByPlaceholderText('The Mason Family'), 'va');
    expect(continueButton).toBeEnabled();
  });

  it('renders social proof and back link', () => {
    renderPage();
    expect(screen.getByText('Most people chip in R250 💝')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /← Back/i })).toHaveAttribute('href', '/maya-board');
  });

  it('defers navigation for iPadOS desktop-mode UA', async () => {
    const restoreNavigator = setNavigatorIdentity(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15',
      5,
    );
    let rafCallback: FrameRequestCallback | null = null;
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback: FrameRequestCallback) => {
        rafCallback = callback;
        return 1;
      });

    try {
      renderPage();
      await userEvent.type(screen.getByPlaceholderText('The Mason Family'), 'Ava');
      await userEvent.click(screen.getByRole('button', { name: /Continue to payment/i }));

      expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
      expect(pushMock).not.toHaveBeenCalled();
      expect(rafCallback).not.toBeNull();

      rafCallback?.(16);
      expect(pushMock).toHaveBeenCalledWith('/maya-board/contribute/payment');
    } finally {
      requestAnimationFrameSpy.mockRestore();
      restoreNavigator();
    }
  });

  it('keeps synchronous navigation for non-touch Macintosh UA', async () => {
    const restoreNavigator = setNavigatorIdentity(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
      0,
    );
    const requestAnimationFrameSpy = vi.spyOn(window, 'requestAnimationFrame');

    try {
      renderPage();
      await userEvent.type(screen.getByPlaceholderText('The Mason Family'), 'Ava');
      await userEvent.click(screen.getByRole('button', { name: /Continue to payment/i }));

      expect(requestAnimationFrameSpy).not.toHaveBeenCalled();
      expect(pushMock).toHaveBeenCalledWith('/maya-board/contribute/payment');
    } finally {
      requestAnimationFrameSpy.mockRestore();
      restoreNavigator();
    }
  });

  it('saves flow data and navigates to payment when continue is pressed', async () => {
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('The Mason Family'), 'Ava');
    await userEvent.click(screen.getByRole('button', { name: /Continue to payment/i }));

    expect(saveFlowDataMock).toHaveBeenCalledTimes(1);
    expect(saveFlowDataMock.mock.calls[0][0]).toMatchObject({
      amountCents: 25000,
      contributorName: 'Ava',
      isAnonymous: false,
      slug: 'maya-board',
    });
    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/maya-board/contribute/payment');
    });
  });

  it('shows an error and stays on details when flow data save fails', async () => {
    saveFlowDataMock.mockReturnValueOnce(false);
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('The Mason Family'), 'Ava');
    await userEvent.click(screen.getByRole('button', { name: /Continue to payment/i }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(/We couldn't save your details\. Please try again or use a different browser\./i)
    ).toBeInTheDocument();
  });
});
