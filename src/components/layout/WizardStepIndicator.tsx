import { CheckIcon } from '@/components/icons';

type WizardStepIndicatorProps = {
  currentStep: number;
  totalSteps: number;
};

export function WizardStepIndicator({ currentStep, totalSteps }: WizardStepIndicatorProps) {
  const stepNumbers = Array.from({ length: totalSteps }, (_, index) => index + 1);
  const percentage = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));

  return (
    <nav aria-label={`Step ${currentStep} of ${totalSteps}`} className="w-full">
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between text-xs font-medium text-text-secondary">
          <span>
            Step {currentStep} of {totalSteps}
          </span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-center sm:flex">
        {stepNumbers.map((stepNumber, index) => {
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLast = index === stepNumbers.length - 1;

          return (
            <li key={stepNumber} className="flex min-w-0 flex-1 items-center">
              <span
                className={[
                  'relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-200',
                  isCompleted ? 'border-primary bg-primary text-white' : '',
                  isCurrent ? 'border-primary bg-primary text-white ring-4 ring-primary/20' : '',
                  !isCompleted && !isCurrent ? 'border-border text-text-muted' : '',
                ].join(' ')}
                aria-current={isCurrent ? 'step' : undefined}
                aria-label={`Step ${stepNumber} of ${totalSteps}`}
              >
                {isCompleted ? <CheckIcon size="sm" /> : stepNumber}
              </span>
              {!isLast ? (
                <span
                  className={[
                    'mx-2 h-0.5 flex-1 rounded-full',
                    stepNumber < currentStep ? 'bg-primary' : 'bg-border',
                  ].join(' ')}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function WizardStepIndicatorCompact({ currentStep, totalSteps }: WizardStepIndicatorProps) {
  const percentage = Math.max(0, Math.min(100, (currentStep / totalSteps) * 100));

  return (
    <div className="w-full" aria-label={`Step ${currentStep} of ${totalSteps}`}>
      <div className="mb-2 flex items-center justify-between text-xs font-medium text-text-secondary">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-border" aria-hidden="true">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
