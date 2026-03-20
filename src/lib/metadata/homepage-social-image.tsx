import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const HOMEPAGE_SOCIAL_IMAGE_ALT = 'Gifta social share preview';
export const HOMEPAGE_SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;
export const HOMEPAGE_SOCIAL_IMAGE_CONTENT_TYPE = 'image/png';

let shareImageDataUriPromise: Promise<string> | null = null;

const getShareImageDataUri = () => {
  if (!shareImageDataUriPromise) {
    shareImageDataUriPromise = readFile(
      join(process.cwd(), 'public/Logos/IMG_1209.PNG'),
      'base64'
    ).then((data) => `data:image/png;base64,${data}`);
  }

  return shareImageDataUriPromise;
};

export const createHomepageSocialImage = async () => {
  const shareImageSrc = await getShareImageDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundColor: '#F9F6F1',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={shareImageSrc}
          alt="Gifta"
          width={1200}
          height={630}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
      </div>
    ),
    HOMEPAGE_SOCIAL_IMAGE_SIZE
  );
};
