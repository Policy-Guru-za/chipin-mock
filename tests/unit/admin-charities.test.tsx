/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

const mocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  createCharityAction: vi.fn(),
  generateCharityDraftFromUrlAction: vi.fn(),
  updateCharityAction: vi.fn(),
  toggleCharityStatusAction: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: mocks.refresh }),
  usePathname: () => '/admin/charities',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/app/(admin)/admin/charities/actions', () => ({
  createCharityAction: mocks.createCharityAction,
  generateCharityDraftFromUrlAction: mocks.generateCharityDraftFromUrlAction,
  updateCharityAction: mocks.updateCharityAction,
  toggleCharityStatusAction: mocks.toggleCharityStatusAction,
}));

import { CharitiesClient } from '@/app/(admin)/admin/charities/CharitiesClient';
import { CharityFormModal, type CharityFormSeed } from '@/components/admin/CharityFormModal';

const baseCharitySeed: CharityFormSeed = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Hope Fund',
  description: 'Education support',
  category: 'Education',
  logoUrl: 'https://example.com/logo.png',
  website: 'https://example.com',
  contactName: 'Dana',
  contactEmail: 'dana@example.com',
  bankDetailsEncrypted: '',
};

const baseCharityDataset = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Hope Fund',
  description: 'Education support',
  category: 'Education',
  logoUrl: 'https://example.com/logo.png',
  website: 'https://example.com',
  contactName: 'Dana',
  contactEmail: 'dana@example.com',
  isActive: true,
  createdAt: new Date('2026-02-01T00:00:00.000Z'),
  updatedAt: new Date('2026-02-02T00:00:00.000Z'),
  lifetimeTotals: {
    totalRaisedCents: 120000,
    totalBoards: 4,
    totalPayoutsCents: 85000,
  },
} as const;

describe('admin charities ui', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createCharityAction.mockResolvedValue({ success: true });
    mocks.generateCharityDraftFromUrlAction.mockResolvedValue({ success: true, draft: undefined });
    mocks.updateCharityAction.mockResolvedValue({ success: true });
    mocks.toggleCharityStatusAction.mockResolvedValue({ success: true });
  });

  afterEach(() => {
    cleanup();
  });

  it('shows masked placeholder for encrypted bank details in edit mode', () => {
    render(
      <CharityFormModal
        charity={baseCharitySeed}
        isOpen
        title="Edit charity"
        submitLabel="Save changes"
        onClose={() => undefined}
        onSubmit={async () => ({ success: true })}
        onSuccess={() => undefined}
      />,
    );

    const bankInput = screen.getByLabelText('Bank account details (JSON)');
    expect(bankInput).toHaveValue('');
    expect(bankInput).toHaveAttribute('placeholder', '••• encrypted •••');
    expect(
      screen.getByText('Leave blank to keep existing details. Enter JSON only when changing bank details.'),
    ).toBeInTheDocument();
  });

  it('hides operational fields in add mode', () => {
    render(
      <CharityFormModal
        isOpen
        title="Add charity"
        submitLabel="Create charity"
        onClose={() => undefined}
        onSubmit={async () => ({ success: true })}
        onSuccess={() => undefined}
      />,
    );

    expect(screen.queryByLabelText('Website')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Contact name')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Contact email')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Bank account details (JSON)')).not.toBeInTheDocument();
  });

  it('traps focus within the charity modal', () => {
    render(
      <CharityFormModal
        isOpen
        title="Add charity"
        submitLabel="Create charity"
        onClose={() => undefined}
        onSubmit={async () => ({ success: true })}
        onSuccess={() => undefined}
      />,
    );

    const closeButton = screen.getByRole('button', { name: /close charity form modal/i });
    closeButton.focus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });

    expect(screen.getByRole('button', { name: /create charity/i })).toHaveFocus();
  });

  it('omits bank details field on edit submit when unchanged', async () => {
    const onSubmit = vi.fn(async () => ({ success: false, error: 'mock' }));

    render(
      <CharityFormModal
        charity={baseCharitySeed}
        isOpen
        title="Edit charity"
        submitLabel="Save changes"
        onClose={() => undefined}
        onSubmit={onSubmit}
        onSuccess={() => undefined}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const formData = onSubmit.mock.calls[0][0] as FormData;
    expect(formData.get('bankDetailsEncrypted')).toBeNull();
  });

  it('submits add mode without operational fields', async () => {
    const onSubmit = vi.fn(async () => ({ success: false, error: 'mock' }));

    render(
      <CharityFormModal
        isOpen
        title="Add charity"
        submitLabel="Create charity"
        onClose={() => undefined}
        onSubmit={onSubmit}
        onSuccess={() => undefined}
      />,
    );

    await userEvent.type(screen.getByLabelText('Charity name'), 'Tree Trust');
    await userEvent.type(screen.getByLabelText('Description'), 'Community tree restoration support.');
    await userEvent.type(screen.getByLabelText('Logo URL'), 'https://example.com/logo.png');
    await userEvent.click(screen.getByRole('button', { name: /create charity/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    const formData = onSubmit.mock.calls[0][0] as FormData;
    expect(formData.get('website')).toBeNull();
    expect(formData.get('contactName')).toBeNull();
    expect(formData.get('contactEmail')).toBeNull();
    expect(formData.get('bankDetailsEncrypted')).toBeNull();
  });

  it('submits edit action from charities client and refreshes admin view', async () => {
    render(
      <CharitiesClient
        charities={[baseCharityDataset]}
        totalCount={1}
        nextCursor={null}
        currentPage={1}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }));
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(mocks.updateCharityAction).toHaveBeenCalledTimes(1));
    expect(mocks.updateCharityAction).toHaveBeenCalledWith(
      baseCharityDataset.id,
      expect.any(FormData),
    );

    const formData = mocks.updateCharityAction.mock.calls[0][1] as FormData;
    expect(formData.get('bankDetailsEncrypted')).toBeNull();
    expect(mocks.refresh).toHaveBeenCalled();
  });

  it('renders contact fallback when charity contact details are missing', () => {
    render(
      <CharitiesClient
        charities={[
          {
            ...baseCharityDataset,
            contactName: null,
            contactEmail: null,
          },
        ]}
        totalCount={1}
        nextCursor={null}
        currentPage={1}
      />,
    );

    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });
});
