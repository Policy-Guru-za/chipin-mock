import type { ReactNode } from 'react';

export interface WizardFormCardProps {
  children: ReactNode;
}

export function WizardFormCard({ children }: WizardFormCardProps) {
  return (
    <div className="rounded-[28px] bg-white p-[28px_24px_24px] shadow-card min-[801px]:p-[36px_32px_32px]">
      {children}
    </div>
  );
}

