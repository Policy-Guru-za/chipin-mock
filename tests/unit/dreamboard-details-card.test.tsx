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
    render(
      <DreamboardDetailsCard
        partyDateTimeLine="Birthday Party · Saturday, 8 March at 14:00"
        hasBirthdayParty
      />
    );

    expect(screen.getByText('Birthday Party')).toBeInTheDocument();
    expect(screen.getByText('Saturday, 8 March at 14:00')).toBeInTheDocument();
    expect(screen.queryByText('Birthday Party · Saturday, 8 March at 14:00')).not.toBeInTheDocument();
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
    expect(screen.queryByText('Shared after you chip in')).not.toBeInTheDocument();
  });

  it('does not render any details card when no party is planned', () => {
    const { container } = render(
      <DreamboardDetailsCard partyDateTimeLine={null} hasBirthdayParty={false} />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByText('Birthday Party')).not.toBeInTheDocument();
    expect(screen.queryByText('Location')).not.toBeInTheDocument();
  });
});
