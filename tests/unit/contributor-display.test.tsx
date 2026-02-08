/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';

import { ContributorDisplay } from '@/components/dream-board/ContributorDisplay';

const makeContributors = (count: number, anonymousAt: number[] = []) =>
  Array.from({ length: count }, (_, index) => ({
    name: anonymousAt.includes(index) ? null : `Person ${index + 1}`,
    isAnonymous: anonymousAt.includes(index),
    avatarColorIndex: index,
  }));

describe('ContributorDisplay', () => {
  afterEach(() => {
    cleanup();
  });

  it('shows empty state when there are no contributors', () => {
    render(<ContributorDisplay contributors={[]} totalCount={0} />);
    expect(screen.getByText('Be the first to chip in... 🎁')).toBeInTheDocument();
  });

  it('shows all contributors when count is 1-5', () => {
    render(<ContributorDisplay contributors={makeContributors(3)} totalCount={3} />);

    expect(screen.getByText('3 loved ones have chipped in')).toBeInTheDocument();
    expect(screen.getByText('Person 1')).toBeInTheDocument();
    expect(screen.getByText('Person 2')).toBeInTheDocument();
    expect(screen.getByText('Person 3')).toBeInTheDocument();
    expect(screen.queryByText(/\+ .* others/)).not.toBeInTheDocument();
  });

  it('shows first 5 and +X others link for 6+ contributors', async () => {
    const user = userEvent.setup();
    render(<ContributorDisplay contributors={makeContributors(7)} totalCount={7} />);

    expect(screen.getByText('7 amazing people have chipped in')).toBeInTheDocument();
    expect(screen.getByText('+ 2 others ➜')).toBeInTheDocument();
    expect(screen.queryByText('Person 6')).not.toBeInTheDocument();

    await user.click(screen.getByText('+ 2 others ➜'));
    expect(screen.getByRole('dialog', { name: 'All contributors' })).toBeInTheDocument();
    expect(screen.getByText('Person 6')).toBeInTheDocument();
  });

  it('renders anonymous contributors with heart icon label', () => {
    render(<ContributorDisplay contributors={makeContributors(2, [1])} totalCount={2} />);
    expect(screen.getByText('💝 Anonymous contributor')).toBeInTheDocument();
  });

  it('applies avatar colors using provided color index', () => {
    const { container } = render(
      <ContributorDisplay contributors={makeContributors(2)} totalCount={2} />
    );

    const avatars = container.querySelectorAll('div[style]');
    expect(avatars[0]).toHaveStyle({ backgroundColor: '#F5C6AA' });
    expect(avatars[1]).toHaveStyle({ backgroundColor: '#A8D4E6' });
  });

  it('uses dynamic heading emoji tiers', () => {
    const { rerender } = render(<ContributorDisplay contributors={makeContributors(2)} totalCount={2} />);
    expect(screen.getByText('2 loved ones have chipped in')).toBeInTheDocument();

    rerender(<ContributorDisplay contributors={makeContributors(5)} totalCount={5} />);
    expect(screen.getByText('5 loved ones have chipped in')).toBeInTheDocument();

    rerender(<ContributorDisplay contributors={makeContributors(6)} totalCount={6} />);
    expect(screen.getByText('6 amazing people have chipped in')).toBeInTheDocument();

    rerender(<ContributorDisplay contributors={makeContributors(11)} totalCount={11} />);
    expect(screen.getByText('11 amazing people have chipped in')).toBeInTheDocument();
  });
});
