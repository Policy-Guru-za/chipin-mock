import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

export const HOMEPAGE_SOCIAL_IMAGE_ALT = 'Gifta social share preview';
export const HOMEPAGE_SOCIAL_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;
export const HOMEPAGE_SOCIAL_IMAGE_CONTENT_TYPE = 'image/png';

let emailLockupDataUriPromise: Promise<string> | null = null;

const getEmailLockupDataUri = () => {
  if (!emailLockupDataUriPromise) {
    emailLockupDataUriPromise = readFile(
      join(process.cwd(), 'public/Logos/Email.png'),
      'base64'
    ).then((data) => `data:image/png;base64,${data}`);
  }

  return emailLockupDataUriPromise;
};

function ValueChip({ label }: { label: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px 22px',
        borderRadius: '999px',
        backgroundColor: 'rgba(15,118,110,0.08)',
        border: '1px solid rgba(15,118,110,0.10)',
        fontSize: '22px',
        fontWeight: 700,
        color: '#153B36',
      }}
    >
      {label}
    </div>
  );
}

function EmailLockup({ emailLockupSrc }: { emailLockupSrc: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '34px',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '26px 34px',
          borderRadius: '30px',
          backgroundColor: '#F9FBFB',
          border: '1px solid rgba(15,118,110,0.08)',
          boxShadow: '0 22px 50px rgba(21,59,54,0.08)',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={emailLockupSrc}
          alt="Gifta"
          width={520}
          height={172}
          style={{ width: '520px', height: '172px', objectFit: 'contain' }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '18px',
          textAlign: 'center',
          maxWidth: '860px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: '72px',
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.05em',
            color: '#143B36',
          }}
        >
          Birthday gifting, simplified.
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: '30px',
            lineHeight: 1.24,
            color: '#285C55',
          }}
        >
          One meaningful gift. Friends and family chip in together.
        </div>
      </div>
    </div>
  );
}

export const createHomepageSocialImage = async () => {
  const emailLockupSrc = await getEmailLockupDataUri();

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #F7FBFA 0%, #EAF6F1 52%, #D6ECE7 100%)',
          padding: '40px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-40px',
            width: '420px',
            height: '420px',
            borderRadius: '999px',
            background: 'radial-gradient(circle, rgba(15,118,110,0.16) 0%, rgba(15,118,110,0) 72%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-60px',
            width: '360px',
            height: '360px',
            borderRadius: '999px',
            background: 'radial-gradient(circle, rgba(31,41,55,0.12) 0%, rgba(31,41,55,0) 75%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            padding: '26px 32px',
            borderRadius: '40px',
            backgroundColor: 'rgba(255,255,255,0.76)',
            border: '1px solid rgba(15,118,110,0.10)',
            boxShadow: '0 30px 90px rgba(21,59,54,0.10)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '22px',
                fontWeight: 600,
                color: '#285C55',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '10px',
                  height: '10px',
                  borderRadius: '999px',
                  backgroundColor: '#0F766E',
                }}
              />
              www.gifta.co.za
            </div>
          </div>

          <EmailLockup emailLockupSrc={emailLockupSrc} />

          <div style={{ display: 'flex', gap: '14px' }}>
            <ValueChip label="Dreamboards" />
            <ValueChip label="Share once" />
            <ValueChip label="Chip in together" />
          </div>
        </div>
      </div>
    ),
    HOMEPAGE_SOCIAL_IMAGE_SIZE
  );
};
