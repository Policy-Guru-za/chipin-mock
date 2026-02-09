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

const getAltText = (params: { giftSubtitle: string; title: string }) =>
  params.giftSubtitle || params.title;

export const buildDreamBoardMetadata = (
  board: DreamBoardMetadataSource,
  options: MetadataOptions
): Metadata => {
  const { giftTitle, giftSubtitle } = getGiftInfo({
    giftName: board.giftName ?? null,
    giftDescription: null,
    giftImageUrl: board.giftImageUrl ?? null,
  });

  const title = `${board.childName}'s Dream Board | Gifta`;
  const description = getMetadataDescription(board, giftTitle);
  const imageUrl = toAbsoluteUrl(`/api/og/${board.slug}`, options.baseUrl);
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
      images: [{ url: imageUrl, alt: altText, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
};
