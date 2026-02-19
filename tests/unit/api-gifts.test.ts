import { describe, expect, it } from 'vitest';

import { serializeGiftData } from '@/lib/api/gifts';

describe('serializeGiftData', () => {
  it('serializes icon metadata and absolute url', () => {
    const payload = serializeGiftData({
      giftName: 'Ballet shoes',
      giftImageUrl: '/icons/gifts/ballet.png',
      giftImagePrompt: null,
      baseUrl: 'https://gifta.co',
    });

    expect(payload).toEqual({
      gift_name: 'Ballet shoes',
      gift_icon_id: 'ballet',
      gift_image_url: 'https://gifta.co/icons/gifts/ballet.png',
      gift_image_prompt: null,
    });
  });

  it('serializes system icon identities', () => {
    const payload = serializeGiftData({
      giftName: 'Gifta dream gift',
      giftImageUrl: '/icons/gifts/gifta-logo.png',
      giftImagePrompt: null,
      baseUrl: 'https://gifta.co',
    });

    expect(payload).toEqual({
      gift_name: 'Gifta dream gift',
      gift_icon_id: 'gifta-logo',
      gift_image_url: 'https://gifta.co/icons/gifts/gifta-logo.png',
      gift_image_prompt: null,
    });
  });

  it('returns null when required fields are missing', () => {
    expect(
      serializeGiftData({
        giftName: null,
        giftImageUrl: '/icons/gifts/ballet.png',
        giftImagePrompt: null,
        baseUrl: 'https://gifta.co',
      })
    ).toBeNull();
  });
});
