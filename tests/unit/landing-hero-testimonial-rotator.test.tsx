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

import { LandingHeroTestimonialRotator } from '@/components/landing-exact/LandingHeroTestimonialRotator';
import { LANDING_TESTIMONIAL_ROTATION_MS } from '@/components/landing/testimonials';

describe('LandingHeroTestimonialRotator', () => {
  beforeEach(() => {
    mocks.useReducedMotion.mockReturnValue(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('renders the current Priya quote first', () => {
    render(<LandingHeroTestimonialRotator />);

    expect(screen.getByText(/the present everyone helped with/i)).toBeInTheDocument();
    expect(screen.getByText('Priya N.')).toBeInTheDocument();
  });

  it('rotates to the next testimonial after the slower interval', () => {
    render(<LandingHeroTestimonialRotator />);

    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS);
    });

    expect(screen.getByText(/No more wandering toy aisles\./i)).toBeInTheDocument();
    expect(screen.getByText('Rachel K.')).toBeInTheDocument();
  });

  it('pauses rotation on hover and resumes on mouse leave', () => {
    render(<LandingHeroTestimonialRotator />);
    const testimonial = screen.getByTestId('landing-hero-testimonial');

    fireEvent.mouseEnter(testimonial);
    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS);
    });
    expect(screen.getByText('Priya N.')).toBeInTheDocument();

    fireEvent.mouseLeave(testimonial);
    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS);
    });
    expect(screen.getByText('Rachel K.')).toBeInTheDocument();
  });

  it('pauses rotation while focused and resumes on blur', () => {
    render(<LandingHeroTestimonialRotator />);
    const testimonial = screen.getByTestId('landing-hero-testimonial');

    fireEvent.focus(testimonial);
    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS);
    });
    expect(screen.getByText('Priya N.')).toBeInTheDocument();

    fireEvent.blur(testimonial);
    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS);
    });
    expect(screen.getByText('Rachel K.')).toBeInTheDocument();
  });

  it('stays static and skips the fade class when reduced motion is preferred', () => {
    mocks.useReducedMotion.mockReturnValue(true);
    const { container } = render(<LandingHeroTestimonialRotator />);

    act(() => {
      vi.advanceTimersByTime(LANDING_TESTIMONIAL_ROTATION_MS * 2);
    });

    expect(screen.getByText('Priya N.')).toBeInTheDocument();
    expect(screen.queryByText('Rachel K.')).not.toBeInTheDocument();
    expect(container.querySelector('.animate-landing-testimonial-fade')).toBeNull();
  });
});
