import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) =>
    createElement('img', { src, alt, ...props }),
}));

import { DreamBoardImage } from '@/components/dream-board/DreamBoardImage';

describe('DreamBoardImage', () => {
  it('uses fallback when src is empty', () => {
    const html = renderToStaticMarkup(
      <DreamBoardImage src="" alt="Child" fallbackSrc="/images/child-placeholder.svg" />
    );

    expect(html).toContain('/images/child-placeholder.svg');
  });

  it('uses provided src when available', () => {
    const html = renderToStaticMarkup(
      <DreamBoardImage src="/icons/gifts/ballet.png" alt="Child" />
    );

    expect(html).toContain('/icons/gifts/ballet.png');
    expect(html).toContain('aspect-square');
    expect(html).toContain('object-contain');
  });
});
