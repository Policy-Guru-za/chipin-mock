/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
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

  it('enforces a 500-char birthday message cap', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /add a birthday message/i }));
    const textarea = screen.getByLabelText('Birthday message');
    await userEvent.type(textarea, 'a'.repeat(520));
    expect(textarea).toHaveValue('a'.repeat(500));
    expect(screen.getByText(/^500\/500/)).toBeInTheDocument();
  });

  it('shows threshold styling text when approaching message limit', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /add a birthday message/i }));
    const textarea = screen.getByLabelText('Birthday message');

    await userEvent.type(textarea, 'a'.repeat(495));
    expect(screen.getByText(/You have 5 characters left/)).toBeInTheDocument();
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
    expect(pushMock).toHaveBeenCalledWith('/maya-board/contribute/payment');
  });

  it('shows an error and stays on details when flow data save fails', async () => {
    saveFlowDataMock.mockReturnValueOnce(false);
    renderPage();
    await userEvent.type(screen.getByPlaceholderText('The Mason Family'), 'Ava');
    await userEvent.click(screen.getByRole('button', { name: /Continue to payment/i }));

    expect(pushMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(/We could not save your details on this device\. Please enable browser storage and try again\./i)
    ).toBeInTheDocument();
  });
});
