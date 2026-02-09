import { describe, expect, it } from 'vitest';

import { suggestGiftIcon } from '@/lib/icons/suggest-icon';

describe('suggestGiftIcon', () => {
  it('matches direct keywords', () => {
    expect(
      suggestGiftIcon({ giftName: 'Ballet shoes', giftDescription: 'for dance class', childAge: 7 }).id
    ).toBe('ballet');

    expect(
      suggestGiftIcon({ giftName: 'Mountain bike', giftDescription: 'new wheels', childAge: 9 }).id
    ).toBe('bicycle');
  });

  it('handles gaming phrases', () => {
    expect(
      suggestGiftIcon({
        giftName: 'PlayStation controller',
        giftDescription: 'for video games',
        childAge: 12,
      }).id
    ).toBe('game-controller');
  });

  it('applies age-aware tie-breaking', () => {
    const younger = suggestGiftIcon({ giftName: 'music gift', giftDescription: '', childAge: 5 });
    const older = suggestGiftIcon({ giftName: 'music gift', giftDescription: '', childAge: 15 });

    expect(younger.id).toBe('microphone');
    expect(older.id).toBe('headphones');
  });

  it('uses age fallback when there are no keyword matches', () => {
    expect(suggestGiftIcon({ giftName: '', giftDescription: '', childAge: 3 }).id).toBe('teddy-bear');
    expect(suggestGiftIcon({ giftName: '', giftDescription: '', childAge: 15 }).id).toBe('headphones');
    expect(suggestGiftIcon({ giftName: '', giftDescription: '' }).id).toBe('teddy-bear');
  });
});
