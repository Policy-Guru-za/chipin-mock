/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { ReminderModal } from '@/components/contribute/ReminderModal';

const onCloseMock = vi.fn();
const onSuccessMock = vi.fn();
const fetchMock = vi.fn();

describe('ReminderModal', () => {
  beforeEach(() => {
    onCloseMock.mockReset();
    onSuccessMock.mockReset();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  const renderOpen = () =>
    render(
      <ReminderModal
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        isOpen
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
      />
    );

  it('renders modal content when open', () => {
    renderOpen();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Get a reminder 🔔')).toBeInTheDocument();
  });

  it('validates email before submitting', async () => {
    renderOpen();
    await userEvent.type(screen.getByLabelText('Email'), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: /Send Reminder/i }));
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('submits reminder API payload', async () => {
    fetchMock.mockResolvedValue({ status: 201 });
    renderOpen();

    await userEvent.type(screen.getByLabelText('Email'), 'ava@example.com');
    await userEvent.click(screen.getByRole('button', { name: /Send Reminder/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe('/api/internal/contributions/reminders');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toMatchObject({
      dreamBoardId: '00000000-0000-4000-8000-000000000001',
      email: 'ava@example.com',
      remindInDays: 3,
    });
  });

  it('calls success and closes on successful response', async () => {
    fetchMock.mockResolvedValue({ status: 200 });
    renderOpen();

    await userEvent.type(screen.getByLabelText('Email'), 'ava@example.com');
    await userEvent.click(screen.getByRole('button', { name: /Send Reminder/i }));

    await waitFor(() => expect(onSuccessMock).toHaveBeenCalledWith('Reminder set! Check your email.'));
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('shows inline error on failed request', async () => {
    fetchMock.mockResolvedValue({ status: 500 });
    renderOpen();

    await userEvent.type(screen.getByLabelText('Email'), 'ava@example.com');
    await userEvent.click(screen.getByRole('button', { name: /Send Reminder/i }));

    await waitFor(() =>
      expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument()
    );
  });

  it('closes on Escape key', async () => {
    renderOpen();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(onCloseMock).toHaveBeenCalled());
  });

  it('clears local state when closed with Escape', async () => {
    const { rerender } = renderOpen();
    await userEvent.type(screen.getByLabelText('Email'), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: /Send Reminder/i }));
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(onCloseMock).toHaveBeenCalled());

    rerender(
      <ReminderModal
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        isOpen={false}
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
      />
    );
    rerender(
      <ReminderModal
        dreamBoardId="00000000-0000-4000-8000-000000000001"
        isOpen
        onClose={onCloseMock}
        onSuccess={onSuccessMock}
      />
    );

    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument();
  });

  it('closes when backdrop is clicked', async () => {
    renderOpen();
    const backdrop = screen.getByRole('dialog').parentElement as HTMLElement;
    await userEvent.click(backdrop);
    expect(onCloseMock).toHaveBeenCalled();
  });

  it('keeps tab focus trapped within modal controls', async () => {
    renderOpen();
    const firstButton = screen.getByRole('button', { name: /Close reminder modal/i });
    firstButton.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(screen.getByRole('button', { name: /Send Reminder/i })).toHaveFocus();
  });
});
