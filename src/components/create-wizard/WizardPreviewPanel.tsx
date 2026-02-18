import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { WizardEyebrow } from './WizardEyebrow';
import { WizardPanelTitle } from './WizardPanelTitle';

export interface WizardPreviewPanelProps {
  eyebrow?: string;
  title: string;
  summaryLabel: string;
  children: ReactNode;
}

interface PreviewPanelCardProps {
  eyebrow?: string;
  title: string;
  children: ReactNode;
  className?: string;
}

function PreviewPanelCard({ eyebrow, title, children, className }: PreviewPanelCardProps) {
  return (
    <div className={cn('overflow-hidden rounded-[28px] bg-white shadow-card', className)}>
      <div className="px-8 pb-0 pt-8">
        {eyebrow ? <WizardEyebrow>{eyebrow}</WizardEyebrow> : null}
        <WizardPanelTitle variant="preview">{title}</WizardPanelTitle>
      </div>
      <div className="m-8 rounded-[20px] border border-border-warmth bg-bg-warmth p-[32px_28px]">
        {children}
      </div>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="wizard-preview-chevron h-4 w-4 transition-transform duration-200 group-open:rotate-90"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function WizardPreviewPanel({
  eyebrow,
  title,
  summaryLabel,
  children,
}: WizardPreviewPanelProps) {
  return (
    <>
      <details className="group min-[801px]:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between rounded-[14px] bg-border-soft p-[12px_16px] text-[13px] font-medium text-ink-soft [&::-webkit-details-marker]:hidden">
          <span>{summaryLabel}</span>
          <ChevronIcon />
        </summary>
        <PreviewPanelCard className="mt-3" eyebrow={eyebrow} title={title}>
          {children}
        </PreviewPanelCard>
      </details>

      <PreviewPanelCard className="hidden min-[801px]:block" eyebrow={eyebrow} title={title}>
        {children}
      </PreviewPanelCard>
    </>
  );
}
