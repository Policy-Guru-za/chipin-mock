/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { DreamboardDetailsCard } from '@/components/dream-board/DreamboardDetailsCard';

afterEach(() => {
  cleanup();
});

describe('DreamboardDetailsCard', () => {
  it('renders provided birthday party date/time line', () => {
    render(<DreamboardDetailsCard partyDateTimeLine="Birthday Party · Saturday, 8 March at 14:00" />);

    expect(screen.getByText('Birthday Party')).toBeInTheDocument();
    expect(screen.getByText('Birthday Party · Saturday, 8 March at 14:00')).toBeInTheDocument();
  });

  it('renders fallback copy when party date/time is missing', () => {
    render(<DreamboardDetailsCard partyDateTimeLine={null} />);

    expect(screen.getByText('Date and time to be confirmed')).toBeInTheDocument();
  });

  it('always renders fixed location copy', () => {
    render(<DreamboardDetailsCard partyDateTimeLine={null} />);

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Shared after you chip in')).toBeInTheDocument();
  });
});
