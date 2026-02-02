export type TakealotGiftData = {
  productName?: string;
  productImage?: string;
};

export type PhilanthropyGiftData = {
  causeName?: string;
  causeImage?: string;
  impactDescription?: string;
};

type GiftInfoParams = {
  giftType: 'takealot_product' | 'philanthropy' | null; // v2.0: nullable during migration
  giftData: unknown;
  takealotSubtitle?: string;
  // v2.0 fields
  giftName?: string | null;
  giftImageUrl?: string | null;
};

const resolveTakealotGift = (params: GiftInfoParams) =>
  params.giftType === 'takealot_product' ? (params.giftData as TakealotGiftData) : null;

const resolvePhilanthropyGift = (params: GiftInfoParams) =>
  params.giftType === 'philanthropy' ? (params.giftData as PhilanthropyGiftData) : null;

const resolveGiftTitle = (
  takealotGift: TakealotGiftData | null,
  philanthropyGift: PhilanthropyGiftData | null
) => takealotGift?.productName ?? philanthropyGift?.causeName ?? '';

const resolveGiftSubtitle = (
  takealotGift: TakealotGiftData | null,
  philanthropyGift: PhilanthropyGiftData | null,
  takealotSubtitle?: string
) =>
  takealotGift ? (takealotSubtitle ?? 'Dream gift') : (philanthropyGift?.impactDescription ?? '');

const resolveGiftImage = (
  takealotGift: TakealotGiftData | null,
  philanthropyGift: PhilanthropyGiftData | null
) => takealotGift?.productImage ?? philanthropyGift?.causeImage ?? '';

export const getGiftInfo = (params: GiftInfoParams) => {
  // v2.0: If giftName is available, use the new simplified model
  if (params.giftName) {
    return {
      takealotGift: null,
      philanthropyGift: null,
      giftTitle: params.giftName,
      giftSubtitle: 'Dream gift',
      giftImage: params.giftImageUrl ?? '',
    };
  }

  // Legacy: Use old giftType-based logic
  const takealotGift = resolveTakealotGift(params);
  const philanthropyGift = resolvePhilanthropyGift(params);

  const giftTitle = resolveGiftTitle(takealotGift, philanthropyGift);
  const giftSubtitle = resolveGiftSubtitle(takealotGift, philanthropyGift, params.takealotSubtitle);
  const giftImage = resolveGiftImage(takealotGift, philanthropyGift);

  return {
    takealotGift,
    philanthropyGift,
    giftTitle,
    giftSubtitle,
    giftImage,
  };
};
