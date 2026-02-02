import type { Metadata } from 'next';

import { getGiftInfo } from './gift-info';

export type DreamBoardMetadataSource = {
  slug: string;
  childName: string;
  childPhotoUrl: string;
  goalCents: number;
  raisedCents: number;
  giftName: string | null;
  giftImageUrl: string | null;
};

type MetadataOptions = {
  baseUrl: string;
  path?: string;
};

const toAbsoluteUrl = (url: string, baseUrl: string) => {
  try {
    return new URL(url).toString();
  } catch {
    return new URL(url, baseUrl).toString();
  }
};

const getMetadataDescription = (board: DreamBoardMetadataSource, giftTitle: string) =>
  `Chip in for ${board.childName}'s ${giftTitle}.`;

const getMetadataImage = (params: { giftImage: string; fallbackImage: string }) =>
  params.giftImage || params.fallbackImage;

const getAltText = (params: { giftSubtitle: string; title: string }) =>
  params.giftSubtitle || params.title;

export const buildDreamBoardMetadata = (
  board: DreamBoardMetadataSource,
  options: MetadataOptions
): Metadata => {
  const { giftTitle, giftSubtitle, giftImage } = getGiftInfo({
    giftName: board.giftName ?? null,
    giftDescription: null,
    giftImageUrl: board.giftImageUrl ?? null,
  });

  const title = `${board.childName}'s Dream Board | ChipIn`;
  const description = getMetadataDescription(board, giftTitle);
  const imageCandidate = getMetadataImage({
    giftImage,
    fallbackImage: board.childPhotoUrl,
  });
  const imageUrl = imageCandidate ? toAbsoluteUrl(imageCandidate, options.baseUrl) : undefined;
  const altText = getAltText({ giftSubtitle, title });
  const urlPath = options.path ?? `/${board.slug}`;
  const url = toAbsoluteUrl(urlPath, options.baseUrl);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: imageUrl ? [{ url: imageUrl, alt: altText }] : undefined,
    },
    twitter: {
      card: imageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
};
