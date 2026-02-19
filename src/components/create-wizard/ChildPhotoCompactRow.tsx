'use client';

import Image from 'next/image';

import { CameraIcon } from './CameraIcon';

interface ChildPhotoCompactRowProps {
  existingPhotoUrl: string | null;
  previewObjectUrl: string | null;
  hasPreview: boolean;
  displayExistingPhoto: boolean;
  errorMessage: string | null;
  openFilePicker: () => void;
}

export function ChildPhotoCompactRow({
  existingPhotoUrl,
  previewObjectUrl,
  hasPreview,
  displayExistingPhoto,
  errorMessage,
  openFilePicker,
}: ChildPhotoCompactRowProps) {
  return (
    <div>
      <button
        type="button"
        onClick={openFilePicker}
        className={
          hasPreview
            ? 'wizard-interactive flex w-full items-center gap-3 rounded-xl border border-solid border-primary bg-sage-wash px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
            : 'wizard-interactive flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-border-soft px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
        }
      >
        {hasPreview ? (
          <>
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              {previewObjectUrl ? (
                <img
                  src={previewObjectUrl}
                  alt="Selected child photo preview"
                  className="h-full w-full object-cover"
                />
              ) : null}
              {displayExistingPhoto && existingPhotoUrl ? (
                <Image
                  src={existingPhotoUrl}
                  alt="Current child photo"
                  fill
                  sizes="48px"
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-sage-deep">Photo added ✓</p>
              <span className="text-[12px] font-medium text-primary">Change</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <CameraIcon />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-ink-mid">Add a photo</p>
              <p className="text-[11px] text-ink-ghost">Required · JPG, PNG or WebP</p>
            </div>
          </>
        )}
      </button>
      {errorMessage ? <p className="mt-1.5 text-[12px] text-red-600">{errorMessage}</p> : null}
    </div>
  );
}
