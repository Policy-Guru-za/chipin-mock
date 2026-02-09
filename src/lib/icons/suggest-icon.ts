import { GIFT_ICONS, getGiftIconById, type GiftIcon } from '@/lib/icons/gift-icons';

type SuggestGiftIconParams = {
  giftName: string;
  giftDescription?: string;
  childAge?: number;
};

type ParsedText = {
  tokenSet: Set<string>;
  normalizedText: string;
};

const EMPTY = '';
const TIE_EPSILON = 0.0001;

const normalizeText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const parseText = (value: string): ParsedText => {
  const normalized = normalizeText(value);
  const tokens = normalized.length ? normalized.split(' ') : [];
  return {
    tokenSet: new Set(tokens),
    normalizedText: ` ${normalized} `,
  };
};

const getKeywordScore = (icon: GiftIcon, parsed: ParsedText) => {
  let score = 0;

  for (const keyword of icon.keywords) {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) {
      continue;
    }

    const isPhrase = normalizedKeyword.includes(' ');
    if (isPhrase) {
      if (parsed.normalizedText.includes(` ${normalizedKeyword} `)) {
        score += 1.25;
      }
      continue;
    }

    if (parsed.tokenSet.has(normalizedKeyword)) {
      score += 1;
      continue;
    }

    if (normalizedKeyword.length >= 4 && parsed.normalizedText.includes(` ${normalizedKeyword}`)) {
      score += 0.35;
    }
  }

  return score;
};

const getAgeBonus = (icon: GiftIcon, childAge?: number) => {
  if (!childAge || !Number.isFinite(childAge)) {
    return 0;
  }

  const [minAge, maxAge] = icon.ageRange;
  if (childAge >= minAge && childAge <= maxAge) {
    return 0.5;
  }

  if (childAge < minAge - 3 || childAge > maxAge + 3) {
    return -0.3;
  }

  return 0;
};

const getAgeDistance = (icon: GiftIcon, childAge: number) => {
  const midpoint = (icon.ageRange[0] + icon.ageRange[1]) / 2;
  return Math.abs(midpoint - childAge);
};

const getFallbackIcon = (childAge?: number): GiftIcon => {
  if (typeof childAge === 'number') {
    if (childAge <= 4) return getGiftIconById('teddy-bear') ?? GIFT_ICONS[0];
    if (childAge <= 8) return getGiftIconById('building-blocks') ?? GIFT_ICONS[0];
    if (childAge <= 12) return getGiftIconById('game-controller') ?? GIFT_ICONS[0];
    if (childAge <= 18) return getGiftIconById('headphones') ?? GIFT_ICONS[0];
  }

  return getGiftIconById('teddy-bear') ?? GIFT_ICONS[0];
};

export function suggestGiftIcon(params: SuggestGiftIconParams): GiftIcon {
  const source = `${params.giftName ?? EMPTY} ${params.giftDescription ?? EMPTY}`.trim();
  const parsed = parseText(source);

  let bestIcon: GiftIcon | null = null;
  let bestScore = 0;

  for (const icon of GIFT_ICONS) {
    const keywordScore = getKeywordScore(icon, parsed);
    const ageScore = getAgeBonus(icon, params.childAge);
    const totalScore = keywordScore + ageScore;

    if (!bestIcon || totalScore > bestScore + TIE_EPSILON) {
      bestIcon = icon;
      bestScore = totalScore;
      continue;
    }

    if (Math.abs(totalScore - bestScore) <= TIE_EPSILON && params.childAge !== undefined && bestIcon) {
      const currentDistance = getAgeDistance(icon, params.childAge);
      const bestDistance = getAgeDistance(bestIcon, params.childAge);
      if (currentDistance < bestDistance) {
        bestIcon = icon;
      }
    }
  }

  if (!bestIcon || bestScore <= 0) {
    return getFallbackIcon(params.childAge);
  }

  return bestIcon;
}
