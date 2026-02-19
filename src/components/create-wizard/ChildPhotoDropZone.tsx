'use client';

import { useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { CameraIcon } from './CameraIcon';
import { WizardEyebrow } from './WizardEyebrow';
import { WizardInlineError } from './WizardInlineError';

export interface ChildPhotoDropZoneProps {
  existingPhotoUrl: string | null;
  previewObjectUrl: string | null;
  hasPreview: boolean;
  displayExistingPhoto: boolean;
  errorMessage: string | null;
  handleDrop: (event: React.DragEvent<HTMLElement>) => void;
  openFilePicker: () => void;
}

function hasDraggedFiles(event: React.DragEvent<HTMLElement>): boolean {
  return Array.from(event.dataTransfer?.types ?? []).includes('Files');
}

export function ChildPhotoDropZone({
  existingPhotoUrl,
  previewObjectUrl,
  hasPreview,
  displayExistingPhoto,
  errorMessage,
  handleDrop,
  openFilePicker,
}: ChildPhotoDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

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
          'group relative mx-6 mt-5 mb-6 flex min-h-[180px] cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-[20px] border-2 border-dashed border-border bg-border-soft p-12 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 min-[801px]:mx-8 min-[801px]:mt-7 min-[801px]:mb-8 min-[801px]:min-h-[240px] min-[801px]:px-8 min-[801px]:py-12 min-[801px]:hover:border-primary min-[801px]:hover:bg-sage-wash',
          isDragOver && 'border-solid border-primary bg-sage-light',
          hasPreview && 'border-solid border-primary p-0',
        )}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openFilePicker();
          }
        }}
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
        onDrop={(event) => {
          event.preventDefault();
          setIsDragOver(false);
          if (!hasDraggedFiles(event)) {
            return;
          }
          handleDrop(event);
        }}
      >
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
