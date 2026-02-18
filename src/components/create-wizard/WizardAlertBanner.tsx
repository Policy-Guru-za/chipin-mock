'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface WizardAlertBannerProps {
  variant: 'error' | 'warning' | 'info';
  children: ReactNode;
  onRetry?: () => void;
  compact?: boolean;
}

function isEmptyChildren(children: ReactNode): boolean {
  return (
    children === null ||
    children === undefined ||
    (typeof children === 'string' && children.trim().length === 0)
  );
}

export function WizardAlertBanner({
  variant,
  children,
  onRetry,
  compact = false,
}: WizardAlertBannerProps) {
  if (isEmptyChildren(children)) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        'border font-medium',
        compact ? 'mb-2 rounded-lg px-3 py-2 text-xs' : 'rounded-xl px-4 py-3 text-sm',
        variant === 'error' && 'border-[#FECACA] bg-[#FEE2E2] text-[#991B1B]',
        variant === 'warning' && 'border-amber-glow bg-amber-light text-amber',
        variant === 'info' && 'border-sage-wash bg-sage-light text-primary',
      )}
    >
      <span>{children}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 cursor-pointer border-0 bg-transparent p-0 text-xs font-semibold text-current underline underline-offset-2"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

