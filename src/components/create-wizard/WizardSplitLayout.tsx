import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface WizardSplitLayoutProps {
  left: ReactNode;
  right: ReactNode;
  mobileOrder?: 'left-first' | 'right-first';
}

export function WizardSplitLayout({
  left,
  right,
  mobileOrder = 'left-first',
}: WizardSplitLayoutProps) {
  return (
    <div className="mx-auto grid max-w-[940px] grid-cols-1 items-start gap-7 px-5 animate-wizard-fade-up-content min-[801px]:grid-cols-2 min-[801px]:px-12">
      <div>{left}</div>
      <div className={cn(mobileOrder === 'right-first' && 'order-[-1] min-[801px]:order-none')}>
        {right}
      </div>
    </div>
  );
}

