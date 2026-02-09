import { describe, expect, it } from 'vitest';

import {
  GIFT_ICONS,
  GIFT_ICON_CATEGORIES,
  extractIconIdFromPath,
  getGiftIconById,
  getIconsByCategory,
  isValidGiftIconId,
  toAbsoluteGiftImageUrl,
} from '@/lib/icons/gift-icons';

describe('gift icon registry', () => {
  it('contains all 60 curated icons', () => {
    expect(GIFT_ICONS).toHaveLength(60);

    const uniqueIds = new Set(GIFT_ICONS.map((icon) => icon.id));
    expect(uniqueIds.size).toBe(60);

    for (const icon of GIFT_ICONS) {
      expect(icon.src).toBe(`/icons/gifts/${icon.id}.png`);
      expect(icon.bgColor).toMatch(/^#[0-9A-F]{6}$/i);
      expect(icon.keywords.length).toBeGreaterThanOrEqual(8);
      expect(icon.ageRange[0]).toBeLessThanOrEqual(icon.ageRange[1]);
    }
  });

  it('provides category lookups', () => {
    expect(GIFT_ICON_CATEGORIES).toHaveLength(6);

    const activeIcons = getIconsByCategory('active-outdoors');
    expect(activeIcons.length).toBeGreaterThan(0);
    expect(activeIcons.every((icon) => icon.category === 'active-outdoors')).toBe(true);
  });

  it('resolves icon id helpers', () => {
    expect(getGiftIconById('ballet')?.label).toBe('Ballet');
    expect(getGiftIconById('missing-id')).toBeUndefined();

    expect(isValidGiftIconId('teddy-bear')).toBe(true);
    expect(isValidGiftIconId('not-real')).toBe(false);
  });

  it('extracts icon ids from relative and absolute paths', () => {
    expect(extractIconIdFromPath('/icons/gifts/ballet.png')).toBe('ballet');
    expect(extractIconIdFromPath('https://gifta.co/icons/gifts/game-controller.png')).toBe(
      'game-controller'
    );
    expect(extractIconIdFromPath('https://images.example/photo.jpg')).toBeUndefined();
  });

  it('returns absolute image urls for icon paths', () => {
    expect(toAbsoluteGiftImageUrl('/icons/gifts/ballet.png', 'https://gifta.co')).toBe(
      'https://gifta.co/icons/gifts/ballet.png'
    );
    expect(
      toAbsoluteGiftImageUrl('https://cdn.example.com/path/custom.png', 'https://gifta.co')
    ).toBe('https://cdn.example.com/path/custom.png');
  });
});
