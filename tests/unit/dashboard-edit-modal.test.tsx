/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { EditDreamBoardModal } from '@/components/host/EditDreamBoardModal';

const makeProps = (overrides?: Partial<Parameters<typeof EditDreamBoardModal>[0]>) => ({
  board: {
    id: 'board-1',
    childName: 'Maya',
    childPhotoUrl: 'https://example.com/child.jpg',
    partyDate: new Date('2099-06-12T00:00:00.000Z'),
    campaignEndDate: new Date('2099-06-10T00:00:00.000Z'),
  },
  isOpen: true,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
  updateAction: vi.fn(async () => ({ success: true })),
  ...overrides,
});

beforeEach(() => {
  cleanup();
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('EditDreamBoardModal', () => {
  it('keeps review button disabled when there are no changes', () => {
    render(<EditDreamBoardModal {...makeProps()} />);
    expect(screen.getByRole('button', { name: /review changes/i })).toBeDisabled();
  });

  it('resets local state when closed via Escape and reopened', async () => {
    const onClose = vi.fn();
    const props = makeProps({ onClose });
    const { rerender } = render(<EditDreamBoardModal {...props} />);

    const input = screen.getByLabelText(/child's name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Maya Updated');
    expect(screen.getByDisplayValue('Maya Updated')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<EditDreamBoardModal {...props} isOpen={false} />);
    rerender(<EditDreamBoardModal {...props} isOpen />);

    expect(screen.getByDisplayValue('Maya')).toBeInTheDocument();
  });

  it('blocks backward party date updates', async () => {
    render(<EditDreamBoardModal {...makeProps()} />);

    const partyDateInput = screen.getByLabelText(/party date/i);
    await userEvent.clear(partyDateInput);
    await userEvent.type(partyDateInput, '2099-06-11');

    await userEvent.click(screen.getByRole('button', { name: /review changes/i }));
    expect(screen.getByText(/Party date must be on or after 2099-06-12./)).toBeInTheDocument();
  });

  it('blocks campaign end date after party date', async () => {
    render(<EditDreamBoardModal {...makeProps()} />);

    const campaignEndInput = screen.getByLabelText(/campaign end date/i);
    await userEvent.clear(campaignEndInput);
    await userEvent.type(campaignEndInput, '2099-06-13');

    await userEvent.click(screen.getByRole('button', { name: /review changes/i }));
    expect(
      screen.getByText(/Campaign end date must be on or before the party date./)
    ).toBeInTheDocument();
  });

  it('submits changed fields from confirmation step', async () => {
    const updateAction = vi.fn(async () => ({ success: true }));
    const onSuccess = vi.fn();
    render(<EditDreamBoardModal {...makeProps({ updateAction, onSuccess })} />);

    const input = screen.getByLabelText(/child's name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Maya S');

    await userEvent.click(screen.getByRole('button', { name: /review changes/i }));
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(updateAction).toHaveBeenCalledTimes(1);
    const payload = updateAction.mock.calls[0]?.[0] as FormData;
    expect(payload.get('childName')).toBe('Maya S');
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('includes uploaded photo in save payload', async () => {
    const updateAction = vi.fn(async () => ({ success: true }));
    render(<EditDreamBoardModal {...makeProps({ updateAction })} />);

    const file = new File(['image-bytes'], 'child.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
    expect(fileInput).toBeTruthy();
    if (!fileInput) return;
    await userEvent.upload(fileInput, file);

    await userEvent.click(screen.getByRole('button', { name: /review changes/i }));
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    const payload = updateAction.mock.calls[0]?.[0] as FormData;
    expect(payload.get('photo')).toBeInstanceOf(File);
    expect((payload.get('photo') as File).name).toBe('child.png');
  });
});
