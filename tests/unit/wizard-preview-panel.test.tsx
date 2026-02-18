/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { WizardPreviewPanel } from '@/components/create-wizard/WizardPreviewPanel';

afterEach(() => cleanup());

describe('WizardPreviewPanel', () => {
  it('renders a details element for mobile mode', () => {
    const { container } = render(
      <WizardPreviewPanel title="Timeline Preview" summaryLabel="Preview timeline ▸">
        <p>Timeline content</p>
      </WizardPreviewPanel>,
    );

    expect(container.querySelector('details')).toBeInTheDocument();
  });

  it('renders summary label text', () => {
    render(
      <WizardPreviewPanel title="Timeline Preview" summaryLabel="Preview timeline ▸">
        <p>Timeline content</p>
      </WizardPreviewPanel>,
    );

    expect(screen.getByText('Preview timeline ▸')).toBeInTheDocument();
  });

  it('is collapsed by default', () => {
    const { container } = render(
      <WizardPreviewPanel title="Timeline Preview" summaryLabel="Preview timeline ▸">
        <p>Timeline content</p>
      </WizardPreviewPanel>,
    );

    const details = container.querySelector('details');
    expect(details).not.toHaveAttribute('open');
  });

  it('renders children content', () => {
    render(
      <WizardPreviewPanel title="Timeline Preview" summaryLabel="Preview timeline ▸">
        <p>Timeline content</p>
      </WizardPreviewPanel>,
    );

    expect(screen.getAllByText('Timeline content').length).toBeGreaterThanOrEqual(1);
  });

  it('renders eyebrow when provided', () => {
    render(
      <WizardPreviewPanel
        eyebrow="Preview"
        title="Timeline Preview"
        summaryLabel="Preview timeline ▸"
      >
        <p>Timeline content</p>
      </WizardPreviewPanel>,
    );

    expect(screen.getAllByText('Preview').length).toBeGreaterThanOrEqual(1);
  });

  it('renders title text', () => {
    render(
      <WizardPreviewPanel title="Timeline Preview" summaryLabel="Preview timeline ▸">
        <p>Timeline content</p>
      </WizardPreviewPanel>,
    );

    expect(screen.getAllByText('Timeline Preview').length).toBeGreaterThanOrEqual(1);
  });

  it('renders chevron icon inside summary', () => {
    const { container } = render(
      <WizardPreviewPanel title="Timeline Preview" summaryLabel="Preview timeline ▸">
        <p>Timeline content</p>
      </WizardPreviewPanel>,
    );

    expect(container.querySelector('summary .wizard-preview-chevron')).toBeInTheDocument();
  });

  it('renders desktop card variant in the DOM', () => {
    const { container } = render(
      <WizardPreviewPanel title="Timeline Preview" summaryLabel="Preview timeline ▸">
        <p>Timeline content</p>
      </WizardPreviewPanel>,
    );

    const desktopCard = Array.from(container.querySelectorAll('div')).find(
      (element) =>
        element.className.includes('hidden') && element.className.includes('min-[801px]:block'),
    );

    expect(desktopCard).toBeDefined();
  });
});

