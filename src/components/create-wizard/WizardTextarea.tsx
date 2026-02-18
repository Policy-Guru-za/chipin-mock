import * as React from 'react';

import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

export const WizardTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <Textarea
    ref={ref}
    className={cn(
      'w-full rounded-xl border-[1.5px] border-border bg-bg-warmth px-[18px] py-3.5',
      'font-sans text-[15px] text-text shadow-input outline-none transition-all duration-[250ms]',
      'placeholder:font-light placeholder:text-ink-ghost',
      'hover:border-ink-ghost',
      'focus-visible:border-primary focus-visible:bg-white focus-visible:ring-0 focus-visible:shadow-[0_0_0_3px_var(--sage-light),var(--shadow-input)]',
      className,
    )}
    {...props}
  />
));

WizardTextarea.displayName = 'WizardTextarea';

