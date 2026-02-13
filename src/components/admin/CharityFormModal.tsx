'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { CheckIcon, XIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface CharityFormSeed {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string;
  website: string;
  contactName: string;
  contactEmail: string;
  bankDetailsEncrypted: string;
}

export type CharityUrlDraft = Partial<Pick<
  CharityFormSeed,
  'name' | 'description' | 'category' | 'logoUrl' | 'website' | 'contactName' | 'contactEmail'
>>;

interface CharityFormModalProps {
  charity?: CharityFormSeed | null;
  isOpen: boolean;
  title: string;
  submitLabel: string;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  onGenerateFromUrl?: (url: string) => Promise<{
    success: boolean;
    error?: string;
    warnings?: Array<{ code: string; message: string }>;
    draft?: CharityUrlDraft;
  }>;
  onSuccess: () => void;
}

const categories = ['Education', 'Health', 'Environment', 'Community', 'Other'];

const emptyCharity: CharityFormSeed = {
  id: '',
  name: '',
  description: '',
  category: 'Education',
  logoUrl: '',
  website: '',
  contactName: '',
  contactEmail: '',
  bankDetailsEncrypted: '',
};

export function CharityFormModal({
  charity,
  isOpen,
  title,
  submitLabel,
  onClose,
  onSubmit,
  onGenerateFromUrl,
  onSuccess,
}: CharityFormModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const initial = useMemo(() => charity ?? emptyCharity, [charity]);
  const isEditMode = Boolean(charity?.id);
  const [values, setValues] = useState<CharityFormSeed>(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlGenerating, setUrlGenerating] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlWarnings, setUrlWarnings] = useState<Array<{ code: string; message: string }>>([]);
  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const handleCloseRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (!isOpen) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setValues(initial);
    setError(null);
    setUrlInput('');
    setUrlError(null);
    setUrlWarnings([]);
    const timeout = setTimeout(() => firstFieldRef.current?.focus(), 0);
    return () => clearTimeout(timeout);
  }, [initial, isOpen]);

  useEffect(() => {
    if (isOpen) return;
    restoreFocusRef.current?.focus?.();
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

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

  if (!isOpen) return null;

  const handleChange = (key: keyof CharityFormSeed, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const formData = new FormData();
    formData.set('name', values.name);
    formData.set('description', values.description);
    formData.set('category', values.category);
    formData.set('logoUrl', values.logoUrl);
    if (isEditMode) {
      formData.set('website', values.website);
      formData.set('contactName', values.contactName);
      formData.set('contactEmail', values.contactEmail);
      if (values.bankDetailsEncrypted.trim().length > 0) {
        formData.set('bankDetailsEncrypted', values.bankDetailsEncrypted);
      }
    }

    try {
      const result = await onSubmit(formData);
      if (!result.success) {
        setError(result.error ?? 'Could not save charity.');
        return;
      }
      onSuccess();
    } catch {
      setError('Could not save charity.');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateFromUrl = async () => {
    if (!onGenerateFromUrl || urlGenerating) return;
    setUrlGenerating(true);
    setUrlError(null);
    setUrlWarnings([]);
    setError(null);

    try {
      const result = await onGenerateFromUrl(urlInput);
      if (!result.success) {
        setUrlError(result.error ?? 'Could not generate charity draft from URL.');
        return;
      }
      setUrlWarnings(result.warnings ?? []);

      if (!result.draft) {
        setUrlError('No draft data was returned for this URL.');
        return;
      }
      const draft = result.draft;

      setValues((current) => ({
        ...current,
        ...(draft.name ? { name: draft.name } : {}),
        ...(draft.description ? { description: draft.description } : {}),
        ...(draft.category ? { category: draft.category } : {}),
        ...(draft.logoUrl ? { logoUrl: draft.logoUrl } : {}),
        ...(draft.website ? { website: draft.website } : {}),
        ...(draft.contactName ? { contactName: draft.contactName } : {}),
        ...(draft.contactEmail ? { contactEmail: draft.contactEmail } : {}),
      }));
    } catch {
      setUrlError('Could not generate charity draft from URL.');
    } finally {
      setUrlGenerating(false);
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
        aria-labelledby="charity-form-title"
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id="charity-form-title" className="font-display text-xl font-bold text-text">
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-muted hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <span className="sr-only">Close charity form modal</span>
            <XIcon />
          </button>
        </div>

        <div className="space-y-4">
          {!isEditMode ? (
            <div className="rounded-xl border border-border bg-subtle/40 p-4">
              <label htmlFor="charity-source-url" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                Charity website URL (optional AI draft)
              </label>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <Input
                  id="charity-source-url"
                  type="url"
                  value={urlInput}
                  onChange={(event) => setUrlInput(event.target.value)}
                  placeholder="https://example.org"
                  className="sm:flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  loading={urlGenerating}
                  onClick={() => void handleGenerateFromUrl()}
                  disabled={!onGenerateFromUrl || urlInput.trim().length === 0}
                >
                  Autofill from URL
                </Button>
              </div>
              {urlError ? <p role="alert" className="mt-2 text-xs text-red-600">{urlError}</p> : null}
              {urlWarnings.length > 0 ? (
                <div className="mt-2 space-y-1">
                  {urlWarnings.map((warning) => (
                    <p key={warning.code} className="text-xs text-amber-700">
                      {warning.message}
                    </p>
                  ))}
                </div>
              ) : null}
              <p className="mt-2 text-xs text-gray-500">
                Draft only. Review and edit before saving.
              </p>
            </div>
          ) : null}

          <div>
            <label htmlFor="charity-name" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
              Charity name
            </label>
            <Input
              ref={firstFieldRef}
              id="charity-name"
              value={values.name}
              onChange={(event) => handleChange('name', event.target.value)}
              maxLength={120}
              className="mt-2"
            />
          </div>

          <div>
            <label htmlFor="charity-description" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
              Description
            </label>
            <Textarea
              id="charity-description"
              value={values.description}
              onChange={(event) => handleChange('description', event.target.value)}
              maxLength={500}
              className="mt-2 min-h-[96px]"
            />
            <p className="mt-1 text-xs text-gray-500">{values.description.length}/500</p>
          </div>

          <div>
            <label htmlFor="charity-category" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
              Category
            </label>
            <select
              id="charity-category"
              value={values.category}
              onChange={(event) => handleChange('category', event.target.value)}
              className="mt-2 h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="charity-logo" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
              Logo URL
            </label>
            <Input
              id="charity-logo"
              type="url"
              value={values.logoUrl}
              onChange={(event) => handleChange('logoUrl', event.target.value)}
              placeholder="https://..."
              className="mt-2"
            />
          </div>

          {isEditMode ? (
            <section className="space-y-4 rounded-xl border border-border bg-subtle/30 p-4">
              <h3 className="text-sm font-semibold text-text">Operational details (optional)</h3>

              <div>
                <label htmlFor="charity-website" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                  Website
                </label>
                <Input
                  id="charity-website"
                  type="url"
                  value={values.website}
                  onChange={(event) => handleChange('website', event.target.value)}
                  placeholder="https://example.org"
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="charity-contact-name" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                    Contact name
                  </label>
                  <Input
                    id="charity-contact-name"
                    value={values.contactName}
                    onChange={(event) => handleChange('contactName', event.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <label htmlFor="charity-contact-email" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                    Contact email
                  </label>
                  <Input
                    id="charity-contact-email"
                    type="email"
                    value={values.contactEmail}
                    onChange={(event) => handleChange('contactEmail', event.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="charity-bank-details" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
                  Bank account details (JSON)
                </label>
                <Textarea
                  id="charity-bank-details"
                  value={values.bankDetailsEncrypted}
                  onChange={(event) => handleChange('bankDetailsEncrypted', event.target.value)}
                  placeholder="••• encrypted •••"
                  className="mt-2 min-h-[120px] font-mono text-xs"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Leave blank to keep existing details. Enter JSON only when changing bank details.
                </p>
              </div>
            </section>
          ) : null}

          {error ? <p role="alert" className="text-sm text-red-600">{error}</p> : null}

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={handleClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} loading={saving}>
              {submitLabel}
            </Button>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <CheckIcon size="sm" />
          Charity data changes are saved to the admin service layer.
        </p>
      </div>
    </div>
  );
}
