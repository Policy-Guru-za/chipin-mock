'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  AdminDataTable,
  AdminPagination,
  StatusBadge,
  type AdminDataColumn,
} from '@/components/admin';
import { CharityFormModal, type CharityFormSeed } from '@/components/admin/CharityFormModal';
import { Button } from '@/components/ui/button';
import type { AdminCharityDataset } from '@/lib/admin';
import { formatZar } from '@/lib/utils/money';

import {
  createCharityAction,
  generateCharityDraftFromUrlAction,
  toggleCharityStatusAction,
  updateCharityAction,
} from './actions';
import { formatAdminDate } from '../_lib/format';

interface CharitiesClientProps {
  charities: AdminCharityDataset[];
  totalCount: number;
  nextCursor: string | null;
  currentPage: number;
}

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; charity: AdminCharityDataset }
  | null;

export function CharitiesClient({
  charities,
  totalCount,
  nextCursor,
  currentPage,
}: CharitiesClientProps) {
  const router = useRouter();
  const [modalState, setModalState] = useState<ModalState>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [statusPendingId, setStatusPendingId] = useState<string | null>(null);

  const editSeed: CharityFormSeed | null =
    modalState && modalState.mode === 'edit'
      ? {
          id: modalState.charity.id,
          name: modalState.charity.name,
          description: modalState.charity.description,
          category: modalState.charity.category,
          logoUrl: modalState.charity.logoUrl,
          website: modalState.charity.website ?? '',
          contactName: modalState.charity.contactName ?? '',
          contactEmail: modalState.charity.contactEmail ?? '',
          bankDetailsEncrypted: '',
        }
      : null;

  const closeModal = () => setModalState(null);
  const onSaveSuccess = () => {
    closeModal();
    router.refresh();
  };

  const toggleStatus = async (charity: AdminCharityDataset) => {
    setStatusError(null);
    setStatusPendingId(charity.id);
    try {
      const result = await toggleCharityStatusAction(charity.id, !charity.isActive);
      if (!result.success) {
        setStatusError(result.error ?? 'Could not update charity status.');
        return;
      }
      router.refresh();
    } finally {
      setStatusPendingId(null);
    }
  };

  const columns: AdminDataColumn<AdminCharityDataset>[] = [
    {
      key: 'name',
      header: 'Charity',
      render: (item) => (
        <div>
          <p className="font-semibold text-text">{item.name}</p>
          <p className="text-xs text-gray-500">{item.category}</p>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (item) => (
        <div className="text-sm">
          <p>{item.contactName ?? '—'}</p>
          <p className="text-xs text-gray-500">{item.contactEmail ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'raised',
      header: 'Raised',
      render: (item) => <span>{formatZar(item.lifetimeTotals.totalRaisedCents)}</span>,
    },
    {
      key: 'boards',
      header: 'Boards',
      render: (item) => <span>{item.lifetimeTotals.totalBoards}</span>,
      className: 'text-right',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} />,
    },
    {
      key: 'updated',
      header: 'Updated',
      render: (item) => <span>{formatAdminDate(item.updatedAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item) => (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setModalState({ mode: 'edit', charity: item })}
          >
            Edit
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            loading={statusPendingId === item.id}
            onClick={() => void toggleStatus(item)}
          >
            {item.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-500">Manage onboarding and status for platform charities.</p>
        <Button type="button" size="sm" onClick={() => setModalState({ mode: 'create' })}>
          Add charity
        </Button>
      </div>

      {statusError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {statusError}
        </p>
      ) : null}

      <AdminDataTable
        columns={columns}
        data={charities}
        keyExtractor={(item) => item.id}
        caption="Charities admin table"
        emptyMessage="No charities match the current filters."
      />

      <AdminPagination
        basePath="/admin/charities"
        hasMore={Boolean(nextCursor)}
        nextCursor={nextCursor}
        totalCount={totalCount}
        currentPage={currentPage}
      />

      <CharityFormModal
        isOpen={modalState?.mode === 'create'}
        title="Add charity"
        submitLabel="Create charity"
        onClose={closeModal}
        onSubmit={createCharityAction}
        onGenerateFromUrl={generateCharityDraftFromUrlAction}
        onSuccess={onSaveSuccess}
      />

      <CharityFormModal
        charity={editSeed}
        isOpen={modalState?.mode === 'edit'}
        title="Edit charity"
        submitLabel="Save changes"
        onClose={closeModal}
        onSubmit={(formData) => {
          if (!modalState || modalState.mode !== 'edit') {
            return Promise.resolve({ success: false, error: 'No charity selected.' });
          }
          return updateCharityAction(modalState.charity.id, formData);
        }}
        onSuccess={onSaveSuccess}
      />
    </div>
  );
}
