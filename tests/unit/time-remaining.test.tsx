/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { TimeRemaining } from '@/components/dream-board/TimeRemaining';

const mockMatchMedia = (matches: boolean) =>
  vi.fn().mockImplementation(() => ({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));

describe('TimeRemaining', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', mockMatchMedia(false));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders relaxed styling', () => {
    render(<TimeRemaining message="Plenty of time to make this birthday special! ⏰" urgency="relaxed" />);
    expect(screen.getByText(/Plenty of time/).parentElement).toHaveClass('text-[18px]');
  });

  it('renders moderate styling', () => {
    render(<TimeRemaining message="10 days left to chip in 🎁" urgency="moderate" />);
    expect(screen.getByText(/10 days left/).parentElement).toHaveClass('font-bold');
  });

  it('renders urgent styling', () => {
    render(<TimeRemaining message="Just 3 days left! 🎁" urgency="urgent" daysLeft={3} />);
    const wrapper = screen.getByText(/Just 3 days left/).parentElement;
    expect(wrapper).toHaveClass('text-[#C4785A]');
    expect(wrapper).toHaveClass('bg-orange-50');
  });

  it('renders critical styling with pulse animation', () => {
    render(<TimeRemaining message="Last day! 🎁 Don't miss out." urgency="critical" />);
    expect(screen.getByText(/Last day!/).parentElement).toHaveClass('animate-pulse');
  });

  it('renders expired styling as muted italic', () => {
    render(<TimeRemaining message="This Dream Board is closed to new contributions." urgency="expired" />);
    expect(screen.getByText(/closed to new contributions/).parentElement).toHaveClass('italic');
  });

  it('respects reduced motion for critical state', () => {
    vi.stubGlobal('matchMedia', mockMatchMedia(true));
    render(<TimeRemaining message="Last day! 🎁 Don't miss out." urgency="critical" />);
    expect(screen.getByText(/Last day!/).parentElement).not.toHaveClass('animate-pulse');
  });
});
