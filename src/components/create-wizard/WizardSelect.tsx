import * as React from 'react';

import { cn } from '@/lib/utils';

export const WizardSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'w-full appearance-none rounded-xl border-[1.5px] border-border bg-bg-warmth px-[18px] py-3.5 pr-10',
      'bg-[right_18px_center] bg-[length:16px_16px] bg-no-repeat',
      "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%238A827A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")]",
      'font-sans text-[15px] text-text shadow-input outline-none transition-all duration-[250ms]',
      'hover:border-ink-ghost',
      'focus-visible:border-primary focus-visible:bg-white focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_var(--sage-light),var(--shadow-input)]',
      className,
    )}
    {...props}
  >
    {children}
  </select>
));

WizardSelect.displayName = 'WizardSelect';

