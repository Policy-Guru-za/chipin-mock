import * as React from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export const WizardTextInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <Input
    ref={ref}
    className={cn(
      'h-auto w-full rounded-xl border-[1.5px] border-border bg-bg-warmth px-[18px] py-3.5',
      'font-sans text-[15px] text-text shadow-input outline-none transition-all duration-[250ms]',
      'placeholder:font-light placeholder:text-ink-ghost',
      'hover:border-ink-ghost',
      'focus-visible:border-primary focus-visible:bg-white focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_var(--sage-light),var(--shadow-input)]',
      className,
    )}
    {...props}
  />
));

WizardTextInput.displayName = 'WizardTextInput';

