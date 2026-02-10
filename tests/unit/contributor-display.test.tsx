/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { afterEach } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ContributorDisplay } from '@/components/dream-board/ContributorDisplay';

const makeContributor = (params: {
  name: string | null;
  isAnonymous?: boolean;
}) => ({
  name: params.name,
  isAnonymous: params.isAnonymous ?? false,
});

afterEach(() => {
  cleanup();
});

describe('ContributorDisplay', () => {
  it('shows empty state when there are no contributors', () => {
    render(<ContributorDisplay contributors={[]} totalCount={0} />);
    expect(screen.getByText('Be the first to chip in... 🎁')).toBeInTheDocument();
  });

  it('formats contributor names as first + last initial', () => {
    render(
      <ContributorDisplay
        contributors={[makeContributor({ name: 'Katie Miller' })]}
        totalCount={1}
      />
    );

    expect(screen.getByText('Katie M.')).toBeInTheDocument();
    expect(screen.getByText(/has chipped in!/)).toBeInTheDocument();
  });

  it('keeps first-name-only entries as-is', () => {
    render(
      <ContributorDisplay contributors={[makeContributor({ name: 'Thabo' })]} totalCount={1} />
    );

    expect(screen.getByText('Thabo')).toBeInTheDocument();
  });

  it('renders anonymous for null or empty names', () => {
    render(
      <ContributorDisplay
        contributors={[
          makeContributor({ name: null, isAnonymous: true }),
          makeContributor({ name: '' }),
        ]}
        totalCount={2}
      />
    );

    expect(screen.getAllByText('Anonymous')).toHaveLength(2);
  });

  it('shows max 6 contributors and overflow copy', () => {
    const contributors = Array.from({ length: 8 }, (_, index) =>
      makeContributor({ name: `Person ${index + 1}` })
    );

    render(<ContributorDisplay contributors={contributors} totalCount={8} />);

    expect(screen.getByText('Person 1.')).toBeInTheDocument();
    expect(screen.getByText('Person 6.')).toBeInTheDocument();
    expect(screen.queryByText('Person 7.')).not.toBeInTheDocument();
    expect(screen.queryByText('Person 8.')).not.toBeInTheDocument();
    expect(screen.getByText('and 2 others')).toBeInTheDocument();
  });

  it('does not show overflow copy when total contributors are within limit', () => {
    const contributors = Array.from({ length: 3 }, (_, index) =>
      makeContributor({ name: `Person ${index + 1}` })
    );

    render(<ContributorDisplay contributors={contributors} totalCount={3} />);

    expect(screen.queryByText(/and \d+ others?/)).not.toBeInTheDocument();
  });
});
