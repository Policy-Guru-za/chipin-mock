import { extractIconIdFromPath, toAbsoluteGiftImageUrl } from '@/lib/icons/gift-icons';

export const serializeGiftData = (params: {
  giftName?: string | null;
  giftImageUrl?: string | null;
  giftImagePrompt?: string | null;
  baseUrl: string;
}) => {
  if (!params.giftName || !params.giftImageUrl) return null;

  const giftIconId = extractIconIdFromPath(params.giftImageUrl) ?? null;

  return {
    gift_name: params.giftName,
    gift_image_url: toAbsoluteGiftImageUrl(params.giftImageUrl, params.baseUrl),
    gift_icon_id: giftIconId,
    gift_image_prompt: params.giftImagePrompt ?? null,
  };
};
