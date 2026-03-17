'use client';

import { useEffect, useState } from 'react';

import { useReducedMotion } from '@/hooks/useReducedMotion';

import {
  LANDING_TESTIMONIAL_ROTATION_MS,
  type LandingTestimonialItem,
  landingTestimonials,
} from '../landing/testimonials';

import styles from './LandingHeroExact.module.css';

type LandingHeroTestimonialRotatorProps = {
  className?: string;
};

type TestimonialTransitionState = 'idle' | 'transitioning';

type TestimonialPaneProps = {
  testimonial: LandingTestimonialItem;
  className?: string;
  testId?: string;
  ariaHidden?: boolean;
};

export const LANDING_TESTIMONIAL_TRANSITION_MS = 320;

const whatsappIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
  </svg>
);

function TestimonialPane({ testimonial, className, testId, ariaHidden = false }: TestimonialPaneProps) {
  const paneClassName = [styles.testimonialPane, className].filter(Boolean).join(' ');

  return (
    <div aria-hidden={ariaHidden} className={paneClassName} data-testid={testId}>
      <blockquote className={`${styles.villageQuote} ${styles.rotatingTestimonialQuote}`}>
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      <div className={`${styles.villageAttribution} ${styles.rotatingTestimonialAttribution}`}>
        <div className={styles.villageAttrDot}>{whatsappIcon}</div>
        <div>
          <div className={styles.villageAttrName}>{testimonial.author}</div>
          <div className={styles.villageAttrRelation}>{testimonial.relation}</div>
        </div>
      </div>
    </div>
  );
}

export function LandingHeroTestimonialRotator({ className }: LandingHeroTestimonialRotatorProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [incomingTestimonial, setIncomingTestimonial] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [transitionState, setTransitionState] = useState<TestimonialTransitionState>('idle');

  const isTransitioning = transitionState === 'transitioning' && incomingTestimonial !== null;

  useEffect(() => {
    if (
      prefersReducedMotion ||
      isPaused ||
      landingTestimonials.length <= 1 ||
      transitionState !== 'idle'
    ) {
      return;
    }

    const testimonialTimer = window.setTimeout(() => {
      setIncomingTestimonial((activeTestimonial + 1) % landingTestimonials.length);
      setTransitionState('transitioning');
    }, LANDING_TESTIMONIAL_ROTATION_MS);

    return () => window.clearTimeout(testimonialTimer);
  }, [activeTestimonial, isPaused, prefersReducedMotion, transitionState]);

  useEffect(() => {
    if (!isTransitioning || incomingTestimonial === null) {
      return;
    }

    const transitionDuration = prefersReducedMotion ? 0 : LANDING_TESTIMONIAL_TRANSITION_MS;

    const transitionTimer = window.setTimeout(() => {
      setActiveTestimonial(incomingTestimonial);
      setIncomingTestimonial(null);
      setTransitionState('idle');
    }, transitionDuration);

    return () => window.clearTimeout(transitionTimer);
  }, [incomingTestimonial, isTransitioning, prefersReducedMotion]);

  const testimonial = landingTestimonials[activeTestimonial];
  const nextTestimonial = incomingTestimonial === null ? null : landingTestimonials[incomingTestimonial];
  const testimonialClassName = [styles.villageTestimonial, className].filter(Boolean).join(' ');

  return (
    <div
      className={testimonialClassName}
      data-testid="landing-hero-testimonial"
      data-transition-state={transitionState}
      tabIndex={-1}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className={styles.testimonialStage}>
        <TestimonialPane
          testimonial={testimonial}
          className={isTransitioning ? styles.testimonialPaneOutgoing : styles.testimonialPaneCurrent}
          testId={isTransitioning ? 'landing-hero-testimonial-outgoing' : 'landing-hero-testimonial-current'}
          ariaHidden={isTransitioning}
        />
        {isTransitioning && nextTestimonial ? (
          <TestimonialPane
            testimonial={nextTestimonial}
            className={styles.testimonialPaneIncoming}
            testId="landing-hero-testimonial-incoming"
          />
        ) : null}
      </div>
    </div>
  );
}
