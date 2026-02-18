'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

import { WizardAlertBanner } from './WizardAlertBanner';

export interface WizardCTAProps {
  backLabel?: string;
  backHref?: string;
  submitLabel: string;
  pendingLabel?: string;
  submitIcon?: 'arrow' | 'star';
  pending?: boolean;
  error?: string | null;
  onRetryError?: () => void;
}

function BackIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

function ForwardIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-4 shrink-0 animate-wizard-spin rounded-full border-2 border-sage-light border-t-primary"
    />
  );
}

export function WizardCTA({
  backLabel = 'Back',
  backHref,
  submitLabel,
  pendingLabel = 'Saving...',
  submitIcon = 'arrow',
  pending = false,
  error,
  onRetryError,
}: WizardCTAProps) {
  const submittedRef = useRef(false);
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!pending) {
      submittedRef.current = false;
      if (unlockTimeoutRef.current !== null) {
        clearTimeout(unlockTimeoutRef.current);
        unlockTimeoutRef.current = null;
      }
    }
  }, [pending]);

  useEffect(
    () => () => {
      if (unlockTimeoutRef.current !== null) {
        clearTimeout(unlockTimeoutRef.current);
      }
    },
    [],
  );

  const handleSubmitClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (submittedRef.current) {
      event.preventDefault();
      return;
    }

    const form = event.currentTarget.form;
    if (form && !form.checkValidity()) {
      return;
    }

    submittedRef.current = true;

    unlockTimeoutRef.current = setTimeout(() => {
      submittedRef.current = false;
      unlockTimeoutRef.current = null;
    }, 1500);
  };

  const baseButtonClasses =
    'wizard-interactive flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-[14px] px-5 py-3.5 font-sans text-sm font-semibold transition-all duration-[250ms]';

  const backButtonClasses = cn(
    baseButtonClasses,
    'border-[1.5px] border-border bg-transparent text-text hover:bg-border-soft',
    pending && 'pointer-events-none opacity-50',
  );

  const submitButtonClasses = cn(
    baseButtonClasses,
    'group bg-primary text-white shadow-[0_1px_3px_rgba(74,126,102,0.12),0_4px_12px_rgba(74,126,102,0.1)]',
    'hover:-translate-y-px hover:bg-sage-deep hover:shadow-[0_2px_6px_rgba(74,126,102,0.15),0_8px_20px_rgba(74,126,102,0.12)]',
    pending && 'pointer-events-none opacity-70',
  );

  const submitIconNode = submitIcon === 'star' ? <StarIcon /> : <ForwardIcon />;
  const trimmedError = error?.trim();

  return (
    <>
      {trimmedError ? (
        <div className="mt-6 hidden min-[801px]:block">
          <WizardAlertBanner variant="error" onRetry={onRetryError}>
            {trimmedError}
          </WizardAlertBanner>
        </div>
      ) : null}

      <div className="mt-8 hidden gap-3 min-[801px]:flex">
        {backHref ? (
          <Link href={backHref} className={backButtonClasses}>
            <BackIcon />
            <span>{backLabel}</span>
          </Link>
        ) : null}

        <button
          type="submit"
          onClick={handleSubmitClick}
          className={submitButtonClasses}
          disabled={pending}
          aria-disabled={pending || undefined}
        >
          {pending ? (
            <>
              <Spinner />
              <span>{pendingLabel}</span>
            </>
          ) : (
            <>
              <span>{submitLabel}</span>
              {submitIconNode}
            </>
          )}
        </button>
      </div>

      <div className="sticky bottom-0 z-10 flex flex-col border-t border-border bg-white px-5 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-2px_8px_rgba(0,0,0,0.04)] min-[801px]:hidden">
        {trimmedError ? (
          <WizardAlertBanner variant="error" compact onRetry={onRetryError}>
            {trimmedError}
          </WizardAlertBanner>
        ) : null}

        <div className="flex flex-col-reverse gap-2">
          <button
            type="submit"
            onClick={handleSubmitClick}
            className={submitButtonClasses}
            disabled={pending}
            aria-disabled={pending || undefined}
          >
            {pending ? (
              <>
                <Spinner />
                <span>{pendingLabel}</span>
              </>
            ) : (
              <>
                <span>{submitLabel}</span>
                {submitIconNode}
              </>
            )}
          </button>

          {backHref ? (
            <Link href={backHref} className={backButtonClasses}>
              <BackIcon />
              <span>{backLabel}</span>
            </Link>
          ) : null}
        </div>
      </div>
    </>
  );
}
