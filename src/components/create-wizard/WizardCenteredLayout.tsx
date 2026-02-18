import type { ReactNode } from 'react';

export interface WizardCenteredLayoutProps {
  children: ReactNode;
}

export function WizardCenteredLayout({ children }: WizardCenteredLayoutProps) {
  return (
    <div className="mx-auto max-w-[940px] px-5 animate-wizard-fade-up-content min-[801px]:px-12">
      <div className="mx-auto max-w-[600px] rounded-[28px] bg-white p-[28px_24px_24px] shadow-card min-[801px]:p-[40px_36px_36px]">
        {children}
      </div>
    </div>
  );
}

