import { put } from '@vercel/blob';

import { assertSafePublicUrl, parseHttpsUrl } from './url-ingest';

const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 4;

const LOGO_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg',
  'image/x-icon': 'ico',
  'image/vnd.microsoft.icon': 'ico',
};

const sanitizePathToken = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

const readBufferWithLimit = async (response: Response, maxBytes: number) => {
  if (!response.body) {
    throw new Error('Logo response body was empty.');
  }

  const contentLengthRaw = response.headers.get('content-length');
  if (contentLengthRaw) {
    const contentLength = Number.parseInt(contentLengthRaw, 10);
    if (Number.isFinite(contentLength) && contentLength > maxBytes) {
      throw new Error('Logo file is too large.');
    }
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    if (!value) continue;

    total += value.byteLength;
    if (total > maxBytes) {
      throw new Error('Logo file is too large.');
    }

    chunks.push(value);
  }

  if (total === 0) {
    throw new Error('Logo file is empty.');
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return Buffer.from(combined);
};

const fetchLogoWithRedirectGuards = async (logoUrl: string) => {
  let currentUrl = parseHttpsUrl(logoUrl);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertSafePublicUrl(currentUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(currentUrl.toString(), {
        method: 'GET',
        redirect: 'manual',
        signal: controller.signal,
        headers: {
          accept: 'image/*,*/*;q=0.1',
          'user-agent': 'GiftaCharityLogoMirror/1.0 (+https://gifta.co.za)',
        },
      });

      const isRedirect = response.status >= 300 && response.status < 400;
      if (isRedirect) {
        const location = response.headers.get('location');
        if (!location) {
          throw new Error('Logo redirect location is missing.');
        }

        currentUrl = parseHttpsUrl(new URL(location, currentUrl).toString());
        continue;
      }

      if (!response.ok) {
        throw new Error(`Logo fetch failed with status ${response.status}.`);
      }

      const mimeType = (response.headers.get('content-type') ?? '').split(';')[0]?.trim().toLowerCase() ?? '';
      const extension = LOGO_EXTENSIONS[mimeType];
      if (!extension) {
        throw new Error('Logo content type is not supported.');
      }

      const fileBuffer = await readBufferWithLimit(response, MAX_LOGO_BYTES);
      return { fileBuffer, mimeType, extension };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error('Too many redirects while fetching logo.');
};

export const maybeMirrorCharityLogoToBlob = async (params: {
  logoUrl: string | null;
  charityName: string;
}) => {
  if (!params.logoUrl) return null;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return params.logoUrl;

  try {
    const { fileBuffer, mimeType, extension } = await fetchLogoWithRedirectGuards(params.logoUrl);
    const charityToken = sanitizePathToken(params.charityName) || 'charity';
    const blobPath = `charities/logos/${charityToken}-${Date.now()}.${extension}`;

    const { url } = await put(blobPath, fileBuffer, {
      access: 'public',
      contentType: mimeType,
    });

    return url;
  } catch {
    return params.logoUrl;
  }
};
