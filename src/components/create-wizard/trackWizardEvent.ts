export type WizardEvent =
  | { name: 'wizard_step_viewed'; step: number; draftId?: string }
  | { name: 'wizard_step_completed'; step: number; draftId?: string; durationMs: number }
  | { name: 'wizard_step_error'; step: number; errorType: string }
  | {
      name: 'wizard_abandoned';
      step: number;
      draftId?: string;
      durationMs: number;
      formDirty: boolean;
    }
  | { name: 'wizard_published'; draftId: string; totalDurationMs: number };

export function trackWizardEvent(event: WizardEvent): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[wizard-analytics]', event);
  }
  // Production: no-op until analytics provider wiring is finalized.
}

