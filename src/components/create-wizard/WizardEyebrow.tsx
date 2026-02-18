import type { ReactNode } from 'react';

export interface WizardEyebrowProps {
  children: ReactNode;
}

export function WizardEyebrow({ children }: WizardEyebrowProps) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-amber">
      {children}
    </p>
  );
}

