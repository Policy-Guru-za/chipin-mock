/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { ContributeDetailsClient } from '@/app/(guest)/[slug]/contribute/ContributeDetailsClient';

describe('ContributeDetailsClient', () => {
  afterEach(() => {
    cleanup();
  });

  const renderPage = () =>
    render(
      <ContributeDetailsClient slug="maya-board" childName="Maya" />
    );

  it('renders the Stitch-coming-soon badge and title', () => {
    renderPage();

    expect(screen.getByText(/Stitch payments coming soon/i)).toBeInTheDocument();
    expect(screen.getByText(/Contributions are not live yet/i)).toBeInTheDocument();
  });

  it('explains that online payments are not available yet', () => {
    renderPage();

    expect(
      screen.getByText(/We'?re getting Stitch-powered contributions ready for Maya's Dreamboard\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Online payments are not available yet\./i)).toBeInTheDocument();
  });

  it('keeps a back-to-dreamboard path visible', () => {
    renderPage();

    expect(screen.getByRole('link', { name: /Back to Dreamboard/i })).toHaveAttribute(
      'href',
      '/maya-board'
    );
    expect(screen.getByRole('link', { name: /Return to Dreamboard/i })).toHaveAttribute(
      'href',
      '/maya-board'
    );
  });

  it('does not render a live contribution form anymore', () => {
    renderPage();
    expect(screen.queryByRole('button', { name: /Continue to payment/i })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText('The Mason Family')).not.toBeInTheDocument();
  });
});
