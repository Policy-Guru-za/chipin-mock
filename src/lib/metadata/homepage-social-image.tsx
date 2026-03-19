import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const HOMEPAGE_SOCIAL_IMAGE_ALT = 'Gifta social share preview';
export const HOMEPAGE_SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;
export const HOMEPAGE_SOCIAL_IMAGE_CONTENT_TYPE = 'image/png';

let logoDataUriPromise: Promise<string> | null = null;

const getLogoDataUri = () => {
  if (!logoDataUriPromise) {
    logoDataUriPromise = readFile(
      join(process.cwd(), 'public/Logos/Gifta-logo-white.png'),
      'base64'
    ).then((data) => `data:image/png;base64,${data}`);
  }

  return logoDataUriPromise;
};

function LeftPanel({ logoSrc }: { logoSrc: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '640px',
        height: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div
          style={{
            display: 'flex',
            width: '178px',
            height: '48px',
            padding: '10px 18px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255,255,255,0.14)',
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Gifta
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Gifta"
          width={280}
          height={84}
          style={{ width: '280px', height: '84px', objectFit: 'contain' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              fontSize: '72px',
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: '-0.05em',
              maxWidth: '620px',
            }}
          >
            Birthday gifting, simplified.
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '31px',
              lineHeight: 1.22,
              color: 'rgba(255,255,255,0.86)',
              maxWidth: '600px',
            }}
          >
            Create a Dreamboard and let friends and family chip in for one meaningful gift.
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
          fontSize: '24px',
          color: 'rgba(255,255,255,0.78)',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '12px',
            height: '12px',
            borderRadius: '999px',
            backgroundColor: '#F9D66E',
          }}
        />
        www.gifta.co.za
      </div>
    </div>
  );
}

function ProductMockCard() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '320px',
        height: '430px',
        padding: '28px',
        borderRadius: '34px',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(234,246,241,0.98) 100%)',
        boxShadow: '0 24px 70px rgba(0,0,0,0.22)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div
          style={{
            display: 'flex',
            width: '132px',
            padding: '10px 16px',
            borderRadius: '999px',
            backgroundColor: '#E4F0E8',
            fontSize: '18px',
            fontWeight: 700,
            color: '#0F766E',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Dreamboard
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: '#1F2937' }}>
          <div style={{ display: 'flex', fontSize: '36px', fontWeight: 700, lineHeight: 1.05 }}>
            One gift everyone actually wants to give.
          </div>
          <div style={{ display: 'flex', fontSize: '22px', lineHeight: 1.25, color: '#4B5563' }}>
            Share once. Chip in together. Celebrate better.
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            padding: '18px',
            borderRadius: '24px',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', fontSize: '18px', color: '#6B7280' }}>Progress</div>
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '16px',
              borderRadius: '999px',
              backgroundColor: '#D1D5DB',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '72%',
                height: '100%',
                background: 'linear-gradient(90deg, #0F766E 0%, #6B9E88 100%)',
              }}
            />
          </div>
          <div style={{ display: 'flex', fontSize: '20px', fontWeight: 700, color: '#153B36' }}>
            Everyone chips in together.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {['Share', 'Chip in', 'Celebrate'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                flex: 1,
                padding: '14px 10px',
                borderRadius: '18px',
                backgroundColor: '#E4F0E8',
                color: '#153B36',
                fontSize: '18px',
                fontWeight: 700,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RightPanel() {
  return (
    <div
      style={{
        display: 'flex',
        width: '392px',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'flex',
          position: 'absolute',
          top: '66px',
          right: '14px',
          bottom: '90px',
          left: '74px',
          borderRadius: '42px',
          backgroundColor: 'rgba(255,255,255,0.10)',
          transform: 'rotate(-9deg)',
        }}
      />
      <ProductMockCard />
    </div>
  );
}

export const createHomepageSocialImage = async () => {
  const logoSrc = await getLogoDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #0F766E 0%, #153B36 52%, #1F2937 100%)',
          padding: '56px',
          color: '#FFFFFF',
          alignItems: 'stretch',
          justifyContent: 'space-between',
        }}
      >
        <LeftPanel logoSrc={logoSrc} />
        <RightPanel />
      </div>
    ),
    HOMEPAGE_SOCIAL_IMAGE_SIZE
  );
};
