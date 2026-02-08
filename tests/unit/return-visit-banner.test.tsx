/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ReturnVisitBanner } from '@/components/dream-board/ReturnVisitBanner';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('ReturnVisitBanner', () => {
  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('ignores malformed stored contribution payloads', () => {
    localStorage.setItem(
      'gifta_contributed_maya-birthday',
      JSON.stringify({ name: { value: 'Ava' }, timestamp: 'not-a-number' })
    );

    render(
      <ReturnVisitBanner
        slug="maya-birthday"
        childName="Maya"
        href="/maya-birthday/contribute?source=dream-board"
        isExpired={false}
      />
    );

    expect(screen.getByRole('button', { name: /Chip in for Maya/i })).toBeInTheDocument();
    expect(screen.queryByText(/Thanks for chipping in/i)).not.toBeInTheDocument();
  });

  it('renders returning contributor state for valid stored payloads', () => {
    localStorage.setItem(
      'gifta_contributed_maya-birthday',
      JSON.stringify({ name: 'Ava', timestamp: Date.now() })
    );

    render(
      <ReturnVisitBanner
        slug="maya-birthday"
        childName="Maya"
        href="/maya-birthday/contribute?source=dream-board"
        isExpired={false}
      />
    );

    expect(screen.getByText('Thanks for chipping in, Ava! 💝')).toBeInTheDocument();
  });
});
