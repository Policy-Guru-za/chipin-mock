import type { ReactNode } from 'react';

export interface WizardFieldTipProps {
  icon?: ReactNode;
  children: ReactNode;
}

function DefaultTipIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mt-px h-4 w-4 shrink-0 text-amber"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export function WizardFieldTip({ icon, children }: WizardFieldTipProps) {
  return (
    <div className="mt-2.5 flex items-start gap-2 rounded-[10px] bg-amber-light p-[10px_14px]">
      {icon ?? <DefaultTipIcon />}
      <div className="text-xs leading-relaxed text-ink-mid">{children}</div>
    </div>
  );
}

