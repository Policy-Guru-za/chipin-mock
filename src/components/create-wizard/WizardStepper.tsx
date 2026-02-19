import type { ReactNode } from 'react';

export interface WizardStepperProps {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StepDot({ children, className }: { children: ReactNode; className: string }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function WizardStepper({ currentStep, totalSteps, stepLabel }: WizardStepperProps) {
  const safeTotalSteps = totalSteps > 0 ? totalSteps : 1;
  const safeCurrentStep = Math.min(Math.max(currentStep, 1), safeTotalSteps);
  const progressPercent = (safeCurrentStep / safeTotalSteps) * 100;

  return (
    <div
      role="progressbar"
      aria-valuenow={safeCurrentStep}
      aria-valuemin={1}
      aria-valuemax={safeTotalSteps}
      aria-label={`Step ${safeCurrentStep} of ${safeTotalSteps}: ${stepLabel}`}
    >
      <div className="mx-auto mt-8 mb-9 hidden max-w-[940px] px-12 animate-wizard-fade-up min-[801px]:flex">
        <div className="flex w-full items-center">
          {Array.from({ length: safeTotalSteps }).flatMap((_, index) => {
            const stepNumber = index + 1;
            const isDone = stepNumber < safeCurrentStep;
            const isActive = stepNumber === safeCurrentStep;
            const dot = isDone ? (
              <StepDot key={`dot-${stepNumber}`} className="bg-primary text-white">
                <CheckIcon />
              </StepDot>
            ) : isActive ? (
              <StepDot
                key={`dot-${stepNumber}`}
                className="bg-primary text-white shadow-[0_0_0_3px_var(--sage-light)]"
              >
                {stepNumber}
              </StepDot>
            ) : (
              <StepDot key={`dot-${stepNumber}`} className="bg-border-soft text-ink-ghost">
                {stepNumber}
              </StepDot>
            );

            if (stepNumber < safeTotalSteps) {
              return [
                dot,
                <span
                  key={`line-${stepNumber}`}
                  className={`mx-1 h-[2px] flex-1 ${stepNumber < safeCurrentStep ? 'bg-primary' : 'bg-border-soft'}`}
                />,
              ];
            }

            return [dot];
          })}
        </div>
      </div>

      <div className="mt-5 mb-5 flex flex-col gap-2 px-5 min-[801px]:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-amber">
          Step {safeCurrentStep} of {safeTotalSteps} - {stepLabel}
        </p>
        <div className="h-1 overflow-hidden rounded-sm bg-border-soft">
          <div
            className="h-full rounded-sm bg-primary transition-[width] duration-300 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
