import { useId } from 'react';

export interface WizardInlineErrorProps {
  message: string | null;
  idScope?: string;
}

const ERROR_ID_PREFIX = 'wizard-inline-error';

function normalizeIdPart(value: string, maxLength: number): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLength);
}

export function getWizardInlineErrorId(message: string, idScope?: string): string {
  const normalizedMessage = normalizeIdPart(message, 48);
  const normalizedScope = idScope ? normalizeIdPart(idScope, 24) : '';
  const messagePart = normalizedMessage.length > 0 ? normalizedMessage : 'message';

  return normalizedScope.length > 0
    ? `${ERROR_ID_PREFIX}-${normalizedScope}-${messagePart}`
    : `${ERROR_ID_PREFIX}-${messagePart}`;
}

export function WizardInlineError({ message, idScope }: WizardInlineErrorProps) {
  const generatedScope = useId();
  const trimmedMessage = message?.trim();

  if (!trimmedMessage) {
    return null;
  }

  return (
    <div
      id={getWizardInlineErrorId(trimmedMessage, idScope ?? generatedScope)}
      role="alert"
      aria-live="polite"
      className="wizard-inline-error mt-1.5 flex items-center gap-1"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-3 w-3 shrink-0 text-[#B91C1C]"
        aria-hidden="true"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span className="text-xs font-normal text-[#B91C1C]">{trimmedMessage}</span>
    </div>
  );
}
