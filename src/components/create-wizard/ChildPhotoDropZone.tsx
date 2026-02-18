'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { WizardEyebrow } from './WizardEyebrow';
import { WizardInlineError } from './WizardInlineError';

export interface ChildPhotoDropZoneProps {
  existingPhotoUrl: string | null;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function CameraIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-ink-ghost transition-colors duration-300 min-[801px]:group-hover:text-primary"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function hasDraggedFiles(event: React.DragEvent<HTMLElement>): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}

export function ChildPhotoDropZone({ existingPhotoUrl }: ChildPhotoDropZoneProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewObjectUrl, setPreviewObjectUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updatePreviewObjectUrl = useCallback((nextUrl: string | null) => {
    setPreviewObjectUrl((currentUrl) => {
      if (currentUrl && currentUrl !== nextUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return nextUrl;
    });
  }, []);

  useEffect(
    () => () => {
      if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
      }
    },
    [previewObjectUrl],
  );

  const assignFileToInput = useCallback((file: File) => {
    if (!inputRef.current) {
      return;
    }

    try {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      inputRef.current.files = dataTransfer.files;
    } catch {
      inputRef.current.value = '';
    }
  }, []);

  const applyFile = useCallback(
    (file: File | null, shouldSyncInput: boolean) => {
      if (!file) {
        if (shouldSyncInput && inputRef.current) {
          inputRef.current.value = '';
        }
        setErrorMessage(null);
        updatePreviewObjectUrl(null);
        return;
      }

      if (!ACCEPTED_MIME_TYPES.has(file.type)) {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        setErrorMessage('Photos must be JPG, PNG, or WebP.');
        updatePreviewObjectUrl(null);
        return;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        if (inputRef.current) {
          inputRef.current.value = '';
        }
        setErrorMessage('Photo must be under 5MB');
        updatePreviewObjectUrl(null);
        return;
      }

      if (shouldSyncInput) {
        assignFileToInput(file);
      }

      setErrorMessage(null);
      updatePreviewObjectUrl(URL.createObjectURL(file));
    },
    [assignFileToInput, updatePreviewObjectUrl],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      applyFile(event.currentTarget.files?.[0] ?? null, false);
    },
    [applyFile],
  );

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      setIsDragOver(false);
      if (!hasDraggedFiles(event)) {
        return;
      }

      const droppedFile = event.dataTransfer.files?.[0] ?? null;
      applyFile(droppedFile, true);
    },
    [applyFile],
  );

  const displayExistingPhoto = !previewObjectUrl && Boolean(existingPhotoUrl);
  const hasPreview = Boolean(previewObjectUrl || existingPhotoUrl);

  return (
    <div className="flex flex-col overflow-hidden rounded-[28px] bg-white shadow-card">
      <div className="px-6 pt-6 pb-0 min-[801px]:px-8 min-[801px]:pt-8">
        <WizardEyebrow>Step 1 of 6 - The child</WizardEyebrow>
        <h1 className="font-display text-[22px] font-normal leading-[1.3] text-text">
          Who&apos;s the birthday star?
        </h1>
        <p className="mt-1 text-[13.5px] font-light leading-relaxed text-ink-soft">
          This photo will be the face of the Dreamboard.
        </p>
      </div>

      <label
        htmlFor="photo"
        className={cn(
          'group relative mx-6 mt-5 mb-6 flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border-2 border-dashed border-border bg-border-soft p-12 transition-all duration-300 min-[801px]:mx-8 min-[801px]:mt-7 min-[801px]:mb-8 min-[801px]:min-h-[240px] min-[801px]:px-8 min-[801px]:py-12 min-[801px]:hover:border-primary min-[801px]:hover:bg-sage-wash',
          isDragOver && 'border-solid border-primary bg-sage-light',
          hasPreview && 'border-solid border-primary p-0',
        )}
        onDragEnter={(event) => {
          event.preventDefault();
          if (hasDraggedFiles(event)) {
            setIsDragOver(true);
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (hasDraggedFiles(event)) {
            setIsDragOver(true);
          }
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragOver(false);
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id="photo"
          name="photo"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required={!existingPhotoUrl}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          onChange={handleInputChange}
        />

        {displayExistingPhoto ? (
          <Image
            src={existingPhotoUrl!}
            alt="Current child photo"
            fill
            sizes="(max-width: 800px) calc(100vw - 40px), 430px"
            className="absolute inset-0 h-full w-full rounded-[18px] object-cover"
          />
        ) : null}

        {previewObjectUrl ? (
          <img
            src={previewObjectUrl}
            alt="Selected child photo preview"
            className="absolute inset-0 h-full w-full rounded-[18px] object-cover"
          />
        ) : null}

        {hasPreview ? (
          <div className="pointer-events-none absolute inset-0 hidden items-center justify-center rounded-[18px] bg-[rgba(44,37,32,0.4)] opacity-0 transition-opacity duration-200 min-[801px]:flex min-[801px]:group-hover:opacity-100">
            <span className="rounded-[10px] bg-white px-[18px] py-2 text-[13px] font-medium text-text">
              Change photo
            </span>
          </div>
        ) : (
          <>
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_1px_4px_rgba(44,37,32,0.06)] transition-colors duration-300 min-[801px]:group-hover:bg-sage-light">
              <CameraIcon />
            </div>
            <p className="hidden text-center text-sm text-ink-soft min-[801px]:block">
              Drag a photo here, or <strong className="font-medium text-primary">browse</strong>
            </p>
            <p className="text-center text-sm text-ink-soft min-[801px]:hidden">
              Tap to choose a photo
            </p>
            <span className="text-[11.5px] text-ink-ghost">JPG, PNG or WebP - Max 5 MB</span>
          </>
        )}
      </label>

      {errorMessage ? (
        <div className="mx-6 mt-[-12px] mb-6 min-[801px]:mx-8 min-[801px]:mb-8">
          <WizardInlineError message={errorMessage} idScope="photo" />
        </div>
      ) : null}
    </div>
  );
}
