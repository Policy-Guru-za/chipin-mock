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
    expect(screen.getByText('Friends and family chipping in')).toBeInTheDocument();
    expect(screen.getByText('Be the first to contribute and start the celebration.')).toBeInTheDocument();
  });

  it('renders initials for contributors with first + last names', () => {
    render(
      <ContributorDisplay
        contributors={[makeContributor({ name: 'Katie Miller' })]}
        totalCount={1}
      />
    );

    expect(screen.getByText('KM')).toBeInTheDocument();
    expect(screen.getByText('1 loved one has chipped in.')).toBeInTheDocument();
  });

  it('renders a single initial for first-name-only entries', () => {
    render(
      <ContributorDisplay contributors={[makeContributor({ name: 'Thabo' })]} totalCount={1} />
    );

    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('renders AN initials for anonymous contributors', () => {
    render(
      <ContributorDisplay
        contributors={[
          makeContributor({ name: null, isAnonymous: true }),
          makeContributor({ name: '' }),
        ]}
        totalCount={2}
      />
    );

    expect(screen.getAllByText('AN')).toHaveLength(2);
    expect(screen.getByText('2 loved ones have chipped in.')).toBeInTheDocument();
  });

  it('shows max 6 contributors and overflow badge', () => {
    const contributors = Array.from({ length: 8 }, (_, index) =>
      makeContributor({ name: `Person ${index + 1}` })
    );

    render(<ContributorDisplay contributors={contributors} totalCount={8} />);

    expect(screen.getByText('P1')).toBeInTheDocument();
    expect(screen.getByText('P6')).toBeInTheDocument();
    expect(screen.queryByText('P7')).not.toBeInTheDocument();
    expect(screen.queryByText('P8')).not.toBeInTheDocument();
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  it('does not show overflow badge when total contributors are within limit', () => {
    const contributors = Array.from({ length: 3 }, (_, index) =>
      makeContributor({ name: `Person ${index + 1}` })
    );

    render(<ContributorDisplay contributors={contributors} totalCount={3} />);

    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });
});
