export const serializeGiftData = (params: {
  giftName?: string | null;
  giftImageUrl?: string | null;
  giftImagePrompt?: string | null;
}) => {
  if (!params.giftName || !params.giftImageUrl) return null;
  return {
    gift_name: params.giftName,
    gift_image_url: params.giftImageUrl,
    gift_image_prompt: params.giftImagePrompt ?? null,
  };
};
