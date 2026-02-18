import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface WizardPanelTitleProps {
  children: ReactNode;
  variant?: 'form' | 'preview';
}

export function WizardPanelTitle({ children, variant = 'form' }: WizardPanelTitleProps) {
  return (
    <h2
      className={cn(
        'font-display text-text font-normal leading-[1.3]',
        variant === 'preview' ? 'text-[19px]' : 'text-[22px]',
      )}
    >
      {children}
    </h2>
  );
}

