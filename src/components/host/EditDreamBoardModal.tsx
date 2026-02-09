'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CheckIcon, XIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateOnly, parseDateOnly } from '@/lib/utils/date';

interface EditDreamBoardModalProps {
  board: {
    id: string;
    childName: string;
    childPhotoUrl: string | null;
    partyDate: Date | null;
    campaignEndDate: Date | null;
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

type FormErrors = {
  childName?: string;
  partyDate?: string;
  campaignEndDate?: string;
};

const toDateInput = (value: Date | null) => (value ? formatDateOnly(value) : '');

const maxDateValue = (a: string, b: string) => (a > b ? a : b);

const todayDateInput = () => formatDateOnly(new Date());

export function EditDreamBoardModal({
  board,
  isOpen,
  onClose,
  onSuccess,
  updateAction,
}: EditDreamBoardModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const handleCloseRef = useRef<() => void>(() => undefined);

  const initialPartyDate = toDateInput(board.partyDate);
  const initialCampaignEndDate = toDateInput(board.campaignEndDate);

  const [childName, setChildName] = useState(board.childName);
  const [partyDate, setPartyDate] = useState(initialPartyDate);
  const [campaignEndDate, setCampaignEndDate] = useState(initialCampaignEndDate);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(board.childPhotoUrl);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const minPartyDate = useMemo(
    () =>
      initialPartyDate ? maxDateValue(todayDateInput(), initialPartyDate) : todayDateInput(),
    [initialPartyDate]
  );

  const minCampaignEndDate = useMemo(
    () =>
      initialCampaignEndDate
        ? maxDateValue(todayDateInput(), initialCampaignEndDate)
        : todayDateInput(),
    [initialCampaignEndDate]
  );

  const hasChanges = useMemo(
    () =>
      childName.trim() !== board.childName ||
      partyDate !== initialPartyDate ||
      campaignEndDate !== initialCampaignEndDate ||
      photoFile !== null,
    [board.childName, campaignEndDate, childName, initialCampaignEndDate, initialPartyDate, partyDate, photoFile]
  );

  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const timeout = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    restoreFocusRef.current?.focus?.();
  }, [isOpen]);

  const resetState = useCallback(() => {
    setChildName(board.childName);
    setPartyDate(initialPartyDate);
    setCampaignEndDate(initialCampaignEndDate);
    setPhotoFile(null);
    setPhotoPreview(board.childPhotoUrl);
    setShowConfirm(false);
    setErrors({});
    setSubmitError(null);
    setSaving(false);
  }, [board.childName, board.childPhotoUrl, initialCampaignEndDate, initialPartyDate]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  handleCloseRef.current = handleClose;

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCloseRef.current();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusables = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [role="button"], [href], [role="link"], input, [role="textbox"], select, textarea, [contenteditable="true"], [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!photoFile) return;
    const previewUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [photoFile]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedName = childName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 30) {
      nextErrors.childName = 'Child name must be between 2 and 30 characters.';
    }

    const party = parseDateOnly(partyDate);
    if (!party || partyDate < minPartyDate) {
      nextErrors.partyDate = `Party date must be on or after ${minPartyDate}.`;
    }

    if (campaignEndDate) {
      const campaign = parseDateOnly(campaignEndDate);
      if (!campaign || campaignEndDate < minCampaignEndDate) {
        nextErrors.campaignEndDate = `Campaign end date must be on or after ${minCampaignEndDate}.`;
      } else if (partyDate && campaignEndDate > partyDate) {
        nextErrors.campaignEndDate = 'Campaign end date must be on or before the party date.';
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const changes = [
    childName.trim() !== board.childName
      ? { label: "Child's Name", from: board.childName, to: childName.trim() }
      : null,
    partyDate !== initialPartyDate
      ? { label: 'Party Date', from: initialPartyDate || '—', to: partyDate || '—' }
      : null,
    campaignEndDate !== initialCampaignEndDate
      ? {
          label: 'Campaign End Date',
          from: initialCampaignEndDate || '—',
          to: campaignEndDate || '—',
        }
      : null,
    photoFile ? { label: 'Photo', from: 'Current', to: 'Updated' } : null,
  ].filter(Boolean) as Array<{ label: string; from: string; to: string }>;

  const handleContinueToConfirm = () => {
    setSubmitError(null);
    if (!validate()) return;
    setShowConfirm(true);
  };

  const handleSubmit = async () => {
    if (!hasChanges) return;
    setSaving(true);
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.set('boardId', board.id);
      if (childName.trim() !== board.childName) {
        formData.set('childName', childName.trim());
      }
      if (partyDate !== initialPartyDate) {
        formData.set('partyDate', partyDate);
      }
      if (campaignEndDate !== initialCampaignEndDate) {
        formData.set('campaignEndDate', campaignEndDate);
      }
      if (photoFile) {
        formData.set('photo', photoFile);
      }

      const result = await updateAction(formData);
      if (!result.success) {
        setSubmitError(result.error ?? 'Could not save changes.');
        return;
      }
      onSuccess();
      resetState();
    } catch {
      setSubmitError('Could not save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-modal-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="edit-modal-title" className="font-display text-xl font-bold text-text">
            Edit Dream Board
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-muted hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="sr-only">Close edit modal</span>
            <XIcon />
          </button>
        </div>

        <div className="mb-5 rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4 text-sm text-blue-800">
          Gift details and charity settings cannot be changed after creation to protect contributor trust.
        </div>

        {!showConfirm ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="childName" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                Child&apos;s Name
              </label>
              <Input
                ref={firstFieldRef}
                id="childName"
                value={childName}
                onChange={(event) => setChildName(event.target.value.slice(0, 30))}
                maxLength={30}
                className="mt-2"
              />
              <p className="mt-1 text-xs text-gray-500">{childName.length}/30</p>
              {errors.childName ? <p className="mt-1 text-sm text-red-600">{errors.childName}</p> : null}
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Child&apos;s Photo</p>
              {photoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoPreview} alt={`${board.childName} current photo`} className="mt-2 h-20 w-20 rounded-full object-cover" />
              ) : null}
              <Input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="mt-2"
                onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
              />
              <p className="mt-1 text-xs text-gray-500">PNG/JPG/WebP, max 5MB.</p>
            </div>

            <div>
              <label htmlFor="partyDate" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                Party Date
              </label>
              <Input
                id="partyDate"
                type="date"
                min={minPartyDate}
                value={partyDate}
                onChange={(event) => setPartyDate(event.target.value)}
                className="mt-2"
              />
              {errors.partyDate ? <p className="mt-1 text-sm text-red-600">{errors.partyDate}</p> : null}
            </div>

            <div>
              <label
                htmlFor="campaignEndDate"
                className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500"
              >
                Campaign End Date
              </label>
              <Input
                id="campaignEndDate"
                type="date"
                min={minCampaignEndDate}
                value={campaignEndDate}
                onChange={(event) => setCampaignEndDate(event.target.value)}
                className="mt-2"
              />
              {errors.campaignEndDate ? (
                <p className="mt-1 text-sm text-red-600">{errors.campaignEndDate}</p>
              ) : null}
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="button" onClick={handleContinueToConfirm} disabled={!hasChanges}>
                Review Changes
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-display text-lg font-bold text-text">Confirm Changes</h3>
            {changes.length === 0 ? (
              <p className="text-sm text-gray-500">No fields changed.</p>
            ) : (
              <ul className="space-y-2">
                {changes.map((change) => (
                  <li key={change.label} className="rounded-lg border border-gray-100 px-3 py-2 text-sm">
                    <span className="font-semibold">{change.label}:</span> {change.from} → {change.to}
                  </li>
                ))}
              </ul>
            )}
            {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setShowConfirm(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={!hasChanges || saving} loading={saving}>
                Save Changes
              </Button>
            </div>
          </div>
        )}

        <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <CheckIcon size="sm" />
          Forward-only date updates are enforced.
        </p>
      </div>
    </div>
  );
}
