import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) =>
    createElement('img', { src, alt, ...props }),
}));

import { CharitableGivingCard } from '@/components/dream-board/CharitableGivingCard';

describe('CharitableGivingCard', () => {
  it('renders charity name, logo, and allocation label', () => {
    const html = renderToStaticMarkup(
      <CharitableGivingCard
        charityName="Ikamva Youth"
        charityDescription="Education support"
        charityLogoUrl="https://example.com/logo.png"
        allocationLabel="25% of contributions support Ikamva Youth"
      />
    );

    expect(html).toContain('Ikamva Youth');
    expect(html).toContain('https://example.com/logo.png');
    expect(html).toContain('25% of contributions support Ikamva Youth');
  });

  it('handles null description gracefully', () => {
    const html = renderToStaticMarkup(
      <CharitableGivingCard
        charityName="Ikamva Youth"
        charityDescription={null}
        charityLogoUrl="https://example.com/logo.png"
        allocationLabel="25% of contributions support Ikamva Youth"
      />
    );

    expect(html).toContain('Supporting South African communities');
  });

  it('handles null logo with fallback display', () => {
    const html = renderToStaticMarkup(
      <CharitableGivingCard
        charityName="Ikamva Youth"
        charityDescription={null}
        charityLogoUrl={null}
        allocationLabel="25% of contributions support Ikamva Youth"
      />
    );

    expect(html).not.toContain('<img');
    expect(html).toContain('I');
  });
});
