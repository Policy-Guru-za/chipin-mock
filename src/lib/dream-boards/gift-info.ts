type GiftInfoParams = {
  giftName: string | null;
  giftDescription?: string | null;
  giftImageUrl: string | null;
};

export const getGiftInfo = (params: GiftInfoParams) => ({
  giftTitle: params.giftName ?? '',
  giftSubtitle: params.giftDescription ?? 'Dream gift',
  giftImage: params.giftImageUrl ?? '',
});
