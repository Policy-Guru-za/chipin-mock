/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { WizardStepper } from '@/components/create-wizard/WizardStepper';

afterEach(() => cleanup());

function getDots(container: HTMLElement): HTMLSpanElement[] {
  return Array.from(container.querySelectorAll('span')).filter(
    (element): element is HTMLSpanElement =>
      element.className.includes('h-8') &&
      element.className.includes('w-8') &&
      element.className.includes('rounded-full'),
  );
}

function getConnectorLines(container: HTMLElement): HTMLSpanElement[] {
  return Array.from(container.querySelectorAll('span')).filter(
    (element): element is HTMLSpanElement =>
      element.className.includes('h-[2px]') && element.className.includes('flex-1'),
  );
}

describe('WizardStepper', () => {
  it('renders the correct number of dots for desktop mode', () => {
    const { container } = render(
      <WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />,
    );

    expect(getDots(container)).toHaveLength(6);
  });

  it('marks the active step with active styling', () => {
    const { container } = render(
      <WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />,
    );

    const activeDot = getDots(container).find((dot) =>
      dot.className.includes('shadow-[0_0_0_3px_var(--sage-light)]'),
    );

    expect(activeDot).toBeDefined();
    expect(activeDot).toHaveTextContent('3');
    expect(activeDot).toHaveClass('bg-primary');
  });

  it('renders completed steps with checkmark icons', () => {
    const { container } = render(
      <WizardStepper currentStep={4} totalSteps={6} stepLabel="The dates" />,
    );

    const doneDots = getDots(container).filter(
      (dot) =>
        dot.className.includes('bg-primary') &&
        !dot.className.includes('shadow-[0_0_0_3px_var(--sage-light)]'),
    );

    expect(doneDots).toHaveLength(3);

    for (const dot of doneDots) {
      expect(dot.querySelector('polyline[points="20 6 9 17 4 12"]')).toBeInTheDocument();
    }
  });

  it('renders upcoming steps with numbers and muted styling', () => {
    const { container } = render(
      <WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />,
    );

    const upcomingDots = getDots(container).filter((dot) =>
      dot.className.includes('bg-border-soft'),
    );

    expect(upcomingDots).toHaveLength(3);
    expect(upcomingDots[0]).toHaveTextContent('4');
    expect(upcomingDots[1]).toHaveTextContent('5');
    expect(upcomingDots[2]).toHaveTextContent('6');
  });

  it('renders connector lines between dots with done and upcoming styles', () => {
    const { container } = render(
      <WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />,
    );

    const lines = getConnectorLines(container);
    expect(lines).toHaveLength(5);
    expect(lines.filter((line) => line.className.includes('bg-primary'))).toHaveLength(2);
    expect(lines.filter((line) => line.className.includes('bg-border-soft'))).toHaveLength(3);
  });

  it('sets progressbar accessibility attributes', () => {
    render(<WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    expect(progressbar).toHaveAttribute('aria-valuemin', '1');
    expect(progressbar).toHaveAttribute('aria-valuemax', '6');
  });

  it('renders mobile label with step info and step label', () => {
    render(<WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />);

    expect(screen.getByText(/Step 3 of 6/i)).toBeInTheDocument();
    expect(screen.getByText(/The dates/i)).toBeInTheDocument();
  });

  it('includes step label in aria-label', () => {
    render(<WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Step 3 of 6: The dates',
    );
  });

  it('computes progress width correctly for currentStep 3 of 6', () => {
    const { container } = render(
      <WizardStepper currentStep={3} totalSteps={6} stepLabel="The dates" />,
    );

    const fill = container.querySelector('div.transition-\\[width\\]');
    expect(fill).toHaveStyle({ width: '50%' });
  });

  it('handles first-step state correctly', () => {
    const { container } = render(
      <WizardStepper currentStep={1} totalSteps={6} stepLabel="The child" />,
    );

    const dots = getDots(container);
    const doneDots = dots.filter(
      (dot) =>
        dot.className.includes('bg-primary') &&
        !dot.className.includes('shadow-[0_0_0_3px_var(--sage-light)]'),
    );
    const activeDots = dots.filter((dot) =>
      dot.className.includes('shadow-[0_0_0_3px_var(--sage-light)]'),
    );
    const upcomingDots = dots.filter((dot) => dot.className.includes('bg-border-soft'));

    expect(doneDots).toHaveLength(0);
    expect(activeDots).toHaveLength(1);
    expect(upcomingDots).toHaveLength(5);
  });

  it('handles last-step state correctly', () => {
    const { container } = render(
      <WizardStepper currentStep={6} totalSteps={6} stepLabel="Review" />,
    );

    const dots = getDots(container);
    const doneDots = dots.filter(
      (dot) =>
        dot.className.includes('bg-primary') &&
        !dot.className.includes('shadow-[0_0_0_3px_var(--sage-light)]'),
    );
    const activeDots = dots.filter((dot) =>
      dot.className.includes('shadow-[0_0_0_3px_var(--sage-light)]'),
    );
    const upcomingDots = dots.filter((dot) => dot.className.includes('bg-border-soft'));

    expect(doneDots).toHaveLength(5);
    expect(activeDots).toHaveLength(1);
    expect(upcomingDots).toHaveLength(0);
  });

  it('shows full progress for single-step flow', () => {
    const { container } = render(
      <WizardStepper currentStep={1} totalSteps={1} stepLabel="Only step" />,
    );

    const fill = container.querySelector('div.transition-\\[width\\]');
    expect(fill).toHaveStyle({ width: '100%' });
  });

  it('keeps stepLabel in aria-label for other values', () => {
    render(<WizardStepper currentStep={2} totalSteps={6} stepLabel="Giving back" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Step 2 of 6: Giving back',
    );
  });
});

