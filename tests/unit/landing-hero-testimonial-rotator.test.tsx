/**
 * @vitest-environment jsdom
 */
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  useReducedMotion: vi.fn(() => false),
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: mocks.useReducedMotion,
}));

import {
  LANDING_TESTIMONIAL_TRANSITION_MS,
  LandingHeroTestimonialRotator,
} from '@/components/landing-exact/LandingHeroTestimonialRotator';
import { LANDING_TESTIMONIAL_ROTATION_MS } from '@/components/landing/testimonials';

describe('LandingHeroTestimonialRotator', () => {
  beforeEach(() => {
    mocks.useReducedMotion.mockReturnValue(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the current Priya quote first', () => {
    render(<LandingHeroTestimonialRotator />);

    expect(screen.getByText(/the present everyone helped with/i)).toBeInTheDocument();
    expect(screen.getByText('Priya N.')).toBeInTheDocument();
  });

  it('stays on Priya until the rotation boundary', () => {
    render(<LandingHeroTestimonialRotator />);
    const testimonial = screen.getByTestId('landing-hero-testimonial');

    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS - 1);
    });

    expect(testimonial).toHaveAttribute('data-transition-state', 'idle');
    expect(screen.getByText('Priya N.')).toBeInTheDocument();
    expect(screen.queryByText('Rachel K.')).not.toBeInTheDocument();
  });

  it('enters transition at the boundary and settles on Rachel after the crossfade', () => {
    render(<LandingHeroTestimonialRotator />);
    const testimonial = screen.getByTestId('landing-hero-testimonial');

    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS);
    });

    expect(testimonial).toHaveAttribute('data-transition-state', 'transitioning');
    expect(screen.getByTestId('landing-hero-testimonial-outgoing')).toBeInTheDocument();
    expect(screen.getByTestId('landing-hero-testimonial-incoming')).toBeInTheDocument();
    expect(screen.getByText('Priya N.')).toBeInTheDocument();
    expect(screen.getByText('Rachel K.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_TRANSITION_MS);
    });

    expect(testimonial).toHaveAttribute('data-transition-state', 'idle');
    expect(screen.getByTestId('landing-hero-testimonial-current')).toBeInTheDocument();
    expect(screen.queryByText('Priya N.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('landing-hero-testimonial-outgoing')).toBeNull();
    expect(screen.queryByTestId('landing-hero-testimonial-incoming')).toBeNull();
  });

  it('pauses rotation on hover and resumes on mouse leave', () => {
    render(<LandingHeroTestimonialRotator />);
    const testimonial = screen.getByTestId('landing-hero-testimonial');

    fireEvent.mouseEnter(testimonial);
    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS + LANDING_TESTIMONIAL_TRANSITION_MS);
    });
    expect(testimonial).toHaveAttribute('data-transition-state', 'idle');
    expect(screen.getByText('Priya N.')).toBeInTheDocument();

    fireEvent.mouseLeave(testimonial);
    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS);
    });

    expect(testimonial).toHaveAttribute('data-transition-state', 'transitioning');
    expect(screen.getByText('Rachel K.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_TRANSITION_MS);
    });

    expect(screen.getByText('Rachel K.')).toBeInTheDocument();
    expect(testimonial).toHaveAttribute('data-transition-state', 'idle');
  });

  it('pauses rotation while focused and resumes on blur', () => {
    render(<LandingHeroTestimonialRotator />);
    const testimonial = screen.getByTestId('landing-hero-testimonial');

    fireEvent.focus(testimonial);
    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS + LANDING_TESTIMONIAL_TRANSITION_MS);
    });
    expect(testimonial).toHaveAttribute('data-transition-state', 'idle');
    expect(screen.getByText('Priya N.')).toBeInTheDocument();

    fireEvent.blur(testimonial);
    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS);
    });

    expect(testimonial).toHaveAttribute('data-transition-state', 'transitioning');
    expect(screen.getByText('Rachel K.')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_TRANSITION_MS);
    });

    expect(screen.getByText('Rachel K.')).toBeInTheDocument();
    expect(testimonial).toHaveAttribute('data-transition-state', 'idle');
  });

  it('stays static and skips the fade class when reduced motion is preferred', () => {
    mocks.useReducedMotion.mockReturnValue(true);
    render(<LandingHeroTestimonialRotator />);
    const testimonial = screen.getByTestId('landing-hero-testimonial');

    act(() => {
      vi.advanceTimersByTime(
        LANDING_TESTIMONIAL_ROTATION_MS + LANDING_TESTIMONIAL_TRANSITION_MS * 2
      );
    });

    expect(testimonial).toHaveAttribute('data-transition-state', 'idle');
    expect(screen.getByText('Priya N.')).toBeInTheDocument();
    expect(screen.queryByText('Rachel K.')).not.toBeInTheDocument();
    expect(screen.queryByTestId('landing-hero-testimonial-incoming')).toBeNull();
    expect(screen.queryByTestId('landing-hero-testimonial-outgoing')).toBeNull();
  });
});
