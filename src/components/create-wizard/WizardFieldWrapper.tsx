import type { ReactNode } from 'react';

import { WizardInlineError, getWizardInlineErrorId } from './WizardInlineError';

export interface WizardFieldWrapperProps {
  label: string;
  htmlFor: string;
  tip?: ReactNode;
  error?: string | null;
  children: ReactNode;
}

export function WizardFieldWrapper({
  label,
  htmlFor,
  tip,
  error,
  children,
}: WizardFieldWrapperProps) {
  const trimmedError = error?.trim() ?? '';
  const describedById = trimmedError ? getWizardInlineErrorId(trimmedError, htmlFor) : undefined;

  return (
    <div className="mb-6" data-error-id={describedById}>
      <label htmlFor={htmlFor} className="mb-2 block text-[13px] font-medium text-ink-mid">
        {label}
      </label>

      {children}

      {trimmedError ? <WizardInlineError message={trimmedError} idScope={htmlFor} /> : null}

      {tip}
    </div>
  );
}

