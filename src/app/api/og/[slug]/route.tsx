import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

import { getCachedDreamBoardBySlug } from '@/lib/dream-boards/cache';
import { extractIconIdFromPath, getGiftIconById, toAbsoluteGiftImageUrl } from '@/lib/icons/gift-icons';

export const runtime = 'nodejs';

const WIDTH = 1200;
const HEIGHT = 630;

const toAbsoluteUrl = (value: string, baseUrl: string) => {
  try {
    return new URL(value).toString();
  } catch {
    return new URL(value, baseUrl).toString();
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const board = await getCachedDreamBoardBySlug(slug);

  if (!board) {
    return new Response('Not found', { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;
  const iconId = extractIconIdFromPath(board.giftImageUrl ?? '') ?? 'teddy-bear';
  const iconMeta = getGiftIconById(iconId) ?? getGiftIconById('teddy-bear');

  const iconUrl = toAbsoluteGiftImageUrl(iconMeta?.src ?? '/icons/gifts/teddy-bear.png', baseUrl);
  const childPhotoUrl = toAbsoluteUrl(board.childPhotoUrl, baseUrl);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: `${WIDTH}px`,
          height: `${HEIGHT}px`,
          background: 'linear-gradient(180deg, #E4F0E8 0%, #D5E8DC 100%)',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '56px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '999px',
              border: '6px solid #FFFFFF',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
              backgroundColor: '#FFFFFF',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={childPhotoUrl}
              alt={`${board.childName} photo`}
              width={180}
              height={180}
              style={{ width: '180px', height: '180px', objectFit: 'cover' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '620px' }}>
            <div style={{ fontSize: '56px', fontWeight: 700, color: '#1F2937', lineHeight: 1.05 }}>
              {board.childName}&apos;s Dreamboard
            </div>
            <div style={{ fontSize: '28px', color: '#374151', lineHeight: 1.2 }}>
              Help {board.childName} get {board.giftName}
            </div>
            <div style={{ fontSize: '24px', color: '#4B5563' }}>Chip in on Gifta</div>
          </div>
        </div>

        <div
          style={{
            width: '180px',
            height: '180px',
            borderRadius: '28px',
            overflow: 'hidden',
            backgroundColor: iconMeta?.bgColor ?? '#F5F5F5',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={iconUrl}
            alt={board.giftName}
            width={180}
            height={180}
            style={{ width: '180px', height: '180px', objectFit: 'contain', padding: '16px' }}
          />
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    }
  );
}
