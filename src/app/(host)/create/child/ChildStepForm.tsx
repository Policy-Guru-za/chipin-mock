'use client';

import { useEffect } from 'react';

import {
  WizardCTA,
  WizardFieldTip,
  WizardFieldWrapper,
  WizardFormCard,
  WizardPanelTitle,
  WizardSplitLayout,
  WizardTextInput,
} from '@/components/create-wizard';
import { ChildPhotoCompactRow } from '@/components/create-wizard/ChildPhotoCompactRow';
import { ChildPhotoDropZone } from '@/components/create-wizard/ChildPhotoDropZone';
import { useChildPhoto } from '@/components/create-wizard/useChildPhoto';

type ChildStepFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  existingPhotoUrl: string | null;
  defaultChildName: string;
  defaultChildAge: string;
  error: string | null;
};

export function ChildStepForm({
  action,
  existingPhotoUrl,
  defaultChildName,
  defaultChildAge,
  error,
}: ChildStepFormProps) {
  const {
    inputRef,
    previewObjectUrl,
    errorMessage,
    hasPreview,
    displayExistingPhoto,
    handleInputChange,
    handleDrop,
    openFilePicker,
  } = useChildPhoto(existingPhotoUrl);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (typeof window.matchMedia !== 'function') {
      return;
    }

    const isMobile = window.matchMedia('(max-width: 800px)').matches;
    if (!isMobile || window.scrollY <= 0) {
      return;
    }

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    });
  }, []);

  return (
    <form action={action} encType="multipart/form-data">
      <input
        ref={inputRef}
        type="file"
        id="photo"
        name="photo"
        accept="image/png,image/jpeg,image/webp"
        required={!hasPreview}
        tabIndex={-1}
        className="sr-only"
        onChange={handleInputChange}
        aria-label="Upload child photo"
      />

      <WizardSplitLayout
        mobileOrder="right-first"
        left={
          <div className="hidden min-[801px]:block">
            <ChildPhotoDropZone
              existingPhotoUrl={existingPhotoUrl}
              previewObjectUrl={previewObjectUrl}
              hasPreview={hasPreview}
              displayExistingPhoto={displayExistingPhoto}
              errorMessage={errorMessage}
              handleDrop={handleDrop}
              openFilePicker={openFilePicker}
            />
          </div>
        }
        right={
          <WizardFormCard>
            <WizardPanelTitle variant="form">About the birthday star</WizardPanelTitle>
            <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
              A few details to personalise their Dreamboard
            </p>

            <WizardFieldWrapper label="First name" htmlFor="childName">
              <WizardTextInput
                id="childName"
                name="childName"
                placeholder="e.g. Maya"
                required
                defaultValue={defaultChildName}
                autoCapitalize="words"
                enterKeyHint="next"
                autoComplete="given-name"
              />
            </WizardFieldWrapper>

            <WizardFieldWrapper
              label="Age they're turning"
              htmlFor="childAge"
              tip={
                <WizardFieldTip>
                  {`Displayed as "${defaultChildName || 'Child'} turns ${defaultChildAge || '?'}!" on the Dreamboard.`}
                </WizardFieldTip>
              }
            >
              <WizardTextInput
                id="childAge"
                name="childAge"
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                max={18}
                step={1}
                placeholder="e.g. 7"
                required
                defaultValue={defaultChildAge}
                enterKeyHint="done"
              />
            </WizardFieldWrapper>

            <div className="mb-6 min-[801px]:hidden">
              <ChildPhotoCompactRow
                existingPhotoUrl={existingPhotoUrl}
                previewObjectUrl={previewObjectUrl}
                hasPreview={hasPreview}
                displayExistingPhoto={displayExistingPhoto}
                errorMessage={errorMessage}
                openFilePicker={openFilePicker}
              />
            </div>

            <WizardCTA submitLabel="Continue to gift" pending={false} error={error} />
          </WizardFormCard>
        }
      />
    </form>
  );
}
