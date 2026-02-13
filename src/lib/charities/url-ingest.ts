import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 4;
const MAX_HTML_BYTES = 2_000_000;

const CHARITY_USER_AGENT = 'GiftaCharityIngest/1.0 (+https://gifta.co.za)';

const PRIVATE_HOSTS = new Set(['localhost', '0.0.0.0', '127.0.0.1', '::1']);

const metaAttributeRegex = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

export type CharitySourcePage = {
  sourceUrl: string;
  finalUrl: string;
  domain: string;
  title: string | null;
  description: string | null;
  ogImageUrl: string | null;
  textSnippet: string;
  ingest: {
    bytesRead: number;
    truncated: boolean;
    contentType: string;
  };
};

export type CharityUrlIngestErrorCode =
  | 'invalid_url'
  | 'invalid_protocol'
  | 'forbidden_host'
  | 'fetch_failed'
  | 'content_too_large'
  | 'unsupported_content_type'
  | 'empty_content';

export class CharityUrlIngestError extends Error {
  code: CharityUrlIngestErrorCode;

  constructor(code: CharityUrlIngestErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const trimTo = (value: string, max: number) =>
  (value.length > max ? `${value.slice(0, max - 3).trim()}...` : value);

const parseMetaAttributes = (tag: string) => {
  const attributes = new Map<string, string>();
  metaAttributeRegex.lastIndex = 0;

  let match = metaAttributeRegex.exec(tag);
  while (match) {
    const [, name, dq, sq, bare] = match;
    if (name) {
      const rawValue = dq ?? sq ?? bare ?? '';
      attributes.set(name.toLowerCase(), decodeHtmlEntities(rawValue));
    }
    match = metaAttributeRegex.exec(tag);
  }

  return attributes;
};

const extractTitle = (html: string): string | null => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) return null;
  const value = decodeHtmlEntities(match[1].replace(/<[^>]+>/g, ''));
  return value.length > 0 ? trimTo(value, 160) : null;
};

const extractMetaContent = (html: string, selectors: Array<{ key: 'name' | 'property'; value: string }>) => {
  const tags = html.match(/<meta\s+[^>]*>/gi) ?? [];

  for (const tag of tags) {
    const attrs = parseMetaAttributes(tag);
    const content = attrs.get('content');
    if (!content) continue;

    for (const selector of selectors) {
      const attrValue = attrs.get(selector.key);
      if (attrValue && attrValue.toLowerCase() === selector.value.toLowerCase()) {
        return trimTo(content, selector.value === 'description' ? 320 : 500);
      }
    }
  }

  return null;
};

const dropTrailingIncompleteBlocks = (html: string) => {
  let current = html;

  for (const tag of ['script', 'style', 'noscript', 'template']) {
    const lower = current.toLowerCase();
    const openIndex = lower.lastIndexOf(`<${tag}`);
    if (openIndex === -1) continue;

    const closeIndex = lower.lastIndexOf(`</${tag}>`);
    if (closeIndex === -1 || openIndex > closeIndex) {
      current = current.slice(0, openIndex);
    }
  }

  return current;
};

const extractVisibleText = (html: string) => {
  const safeHtml = dropTrailingIncompleteBlocks(html);

  const withoutBlocks = safeHtml
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<template[\s\S]*?<\/template>/gi, ' ')
    .replace(/<!--([\s\S]*?)-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');

  const collapsed = decodeHtmlEntities(withoutBlocks);
  return trimTo(collapsed, 2_400);
};

const normalizeAndValidateHostname = (hostname: string) => {
  const normalized = hostname.trim().toLowerCase();

  if (!normalized || PRIVATE_HOSTS.has(normalized)) {
    throw new CharityUrlIngestError('forbidden_host', 'URL host is not allowed.');
  }

  if (
    normalized.endsWith('.localhost') ||
    normalized.endsWith('.local') ||
    normalized.endsWith('.internal')
  ) {
    throw new CharityUrlIngestError('forbidden_host', 'URL host is not allowed.');
  }

  return normalized;
};

const ipv4ToInt = (value: string): number | null => {
  const parts = value.split('.');
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => Number.parseInt(part, 10));
  if (octets.some((octet) => Number.isNaN(octet) || octet < 0 || octet > 255)) return null;

  return (
    ((octets[0] ?? 0) << 24) |
    ((octets[1] ?? 0) << 16) |
    ((octets[2] ?? 0) << 8) |
    (octets[3] ?? 0)
  ) >>> 0;
};

const inIpv4Range = (value: number, start: string, end: string) => {
  const startInt = ipv4ToInt(start);
  const endInt = ipv4ToInt(end);
  if (startInt === null || endInt === null) return false;
  return value >= startInt && value <= endInt;
};

const isPrivateIpv4 = (address: string) => {
  const ipv4 = ipv4ToInt(address);
  if (ipv4 === null) return true;

  return (
    inIpv4Range(ipv4, '0.0.0.0', '0.255.255.255') ||
    inIpv4Range(ipv4, '10.0.0.0', '10.255.255.255') ||
    inIpv4Range(ipv4, '100.64.0.0', '100.127.255.255') ||
    inIpv4Range(ipv4, '127.0.0.0', '127.255.255.255') ||
    inIpv4Range(ipv4, '169.254.0.0', '169.254.255.255') ||
    inIpv4Range(ipv4, '172.16.0.0', '172.31.255.255') ||
    inIpv4Range(ipv4, '192.168.0.0', '192.168.255.255') ||
    inIpv4Range(ipv4, '198.18.0.0', '198.19.255.255') ||
    inIpv4Range(ipv4, '224.0.0.0', '255.255.255.255')
  );
};

const normalizeIpv6 = (address: string) => address.toLowerCase();

const isPrivateIpv6 = (address: string) => {
  const normalized = normalizeIpv6(address);
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) {
    return true;
  }
  if (normalized.startsWith('::ffff:')) {
    const mapped = normalized.slice('::ffff:'.length);
    return isPrivateIpv4(mapped);
  }
  return false;
};

const isPrivateIpAddress = (address: string) => {
  const version = isIP(address);
  if (version === 4) return isPrivateIpv4(address);
  if (version === 6) return isPrivateIpv6(address);
  return true;
};

const assertPublicHost = async (hostname: string) => {
  const normalizedHost = normalizeAndValidateHostname(hostname);

  if (isIP(normalizedHost) > 0) {
    if (isPrivateIpAddress(normalizedHost)) {
      throw new CharityUrlIngestError('forbidden_host', 'URL host is not publicly reachable.');
    }
    return;
  }

  let addresses: Awaited<ReturnType<typeof lookup>>[];
  try {
    addresses = await lookup(normalizedHost, { all: true });
  } catch {
    throw new CharityUrlIngestError('fetch_failed', 'Could not resolve URL host.');
  }

  if (!addresses.length) {
    throw new CharityUrlIngestError('fetch_failed', 'Could not resolve URL host.');
  }

  for (const address of addresses) {
    if (isPrivateIpAddress(address.address)) {
      throw new CharityUrlIngestError('forbidden_host', 'URL host is not publicly reachable.');
    }
  }
};

export const parseHttpsUrl = (rawUrl: string) => {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new CharityUrlIngestError('invalid_url', 'Please enter a valid charity URL.');
  }

  if (parsed.protocol !== 'https:') {
    throw new CharityUrlIngestError('invalid_protocol', 'Only HTTPS URLs are allowed.');
  }

  if (parsed.username || parsed.password) {
    throw new CharityUrlIngestError('invalid_url', 'URL credentials are not allowed.');
  }

  return parsed;
};

export const parseHttpOrHttpsUrl = (rawUrl: string) => {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new CharityUrlIngestError('invalid_url', 'Please enter a valid charity URL.');
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new CharityUrlIngestError('invalid_protocol', 'Only HTTP(S) URLs are allowed.');
  }

  if (parsed.username || parsed.password) {
    throw new CharityUrlIngestError('invalid_url', 'URL credentials are not allowed.');
  }

  return parsed;
};

export const assertSafePublicUrl = async (url: URL) => {
  await assertPublicHost(url.hostname);
};

export const normalizeCharityUrlInput = (rawInput: string) => {
  const warnings: Array<{ code: string; message: string }> = [];
  const trimmed = rawInput.trim();

  if (!trimmed) {
    throw new CharityUrlIngestError('invalid_url', 'Please enter a valid charity URL.');
  }

  const stripWrappingPunctuation = (value: string) =>
    value
      .trim()
      .replace(/^[<([{'"`]+/g, '')
      .replace(/[)\]}>\"'`,;:.!?]+$/g, '')
      .trim();

  const findCandidate = (value: string) => {
    if (!/\s/.test(value)) return stripWrappingPunctuation(value);

    const httpMatch = value.match(/https?:\/\/\S+/i);
    if (httpMatch?.[0]) return stripWrappingPunctuation(httpMatch[0]);

    const tokens = value.split(/\s+/).map(stripWrappingPunctuation).filter(Boolean);
    const token = tokens.find((part) => part.includes('.') || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(part));
    return token ?? stripWrappingPunctuation(tokens[0] ?? value);
  };

  const candidate = findCandidate(trimmed);
  if (!candidate) {
    throw new CharityUrlIngestError('invalid_url', 'Please enter a valid charity URL.');
  }

  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(candidate);

  let parsed: URL | null = null;
  if (hasScheme) {
    try {
      parsed = new URL(candidate);
    } catch {
      parsed = null;
    }
  }

  if (!parsed) {
    try {
      parsed = new URL(`https://${candidate}`);
      warnings.push({
        code: 'missing_scheme_assumed_https',
        message: 'Assumed https:// for this URL.',
      });
    } catch {
      parsed = null;
    }
  }

  if (!parsed) {
    throw new CharityUrlIngestError('invalid_url', 'Please enter a valid charity URL.');
  }

  if (parsed.username || parsed.password) {
    parsed.username = '';
    parsed.password = '';
    warnings.push({
      code: 'stripped_credentials',
      message: 'Removed credentials from the URL.',
    });
  }

  if (parsed.protocol === 'http:') {
    const upgraded = new URL(parsed.toString());
    upgraded.protocol = 'https:';

    warnings.push({
      code: 'upgraded_to_https',
      message: 'Tried HTTPS first (recommended).',
    });

    return { primary: upgraded, fallback: parsed, warnings };
  }

  if (parsed.protocol === 'https:') {
    return { primary: parsed, warnings };
  }

  if (!parsed.hostname) {
    throw new CharityUrlIngestError('invalid_url', 'Please enter a valid charity URL.');
  }

  const assumed = new URL(`https://${parsed.hostname}${parsed.pathname || '/'}`);
  assumed.search = parsed.search;
  assumed.hash = parsed.hash;
  if (parsed.port) assumed.port = parsed.port;

  warnings.push({
    code: 'unsupported_scheme_assumed_https',
    message: 'Unsupported URL scheme; tried https:// instead.',
  });

  return { primary: assumed, warnings };
};

const fetchWithRedirectGuards = async (sourceUrl: URL) => {
  let currentUrl = sourceUrl;

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
          'user-agent': CHARITY_USER_AGENT,
          accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.1',
        },
      });

      const isRedirect = response.status >= 300 && response.status < 400;
      if (isRedirect) {
        const location = response.headers.get('location');
        if (!location) {
          throw new CharityUrlIngestError('fetch_failed', 'URL redirect target is missing.');
        }

        currentUrl = parseHttpOrHttpsUrl(new URL(location, currentUrl).toString());
        continue;
      }

      if (!response.ok) {
        throw new CharityUrlIngestError('fetch_failed', `Website request failed with status ${response.status}.`);
      }

      return { response, finalUrl: currentUrl.toString() };
    } catch (error) {
      if (error instanceof CharityUrlIngestError) {
        throw error;
      }

      throw new CharityUrlIngestError('fetch_failed', 'Could not fetch the charity website.');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new CharityUrlIngestError('fetch_failed', 'Too many redirects for this URL.');
};

const readTextUpTo = async (response: Response, maxBytes: number) => {
  if (!response.body) {
    throw new CharityUrlIngestError('empty_content', 'Charity page returned no content.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let received = 0;
  let text = '';
  let truncated = false;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    if (!value) continue;

    if (received + value.byteLength > maxBytes) {
      const remaining = maxBytes - received;
      if (remaining > 0) {
        const slice = value.subarray(0, remaining);
        received += slice.byteLength;
        text += decoder.decode(slice, { stream: true });
      }

      truncated = true;
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
      break;
    }

    received += value.byteLength;
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  if (!text.trim()) {
    throw new CharityUrlIngestError('empty_content', 'Charity page returned no content.');
  }

  return { text, bytesRead: received, truncated };
};

export const ingestCharityWebsite = async (rawUrl: string): Promise<CharitySourcePage> => {
  const sourceUrl = parseHttpOrHttpsUrl(rawUrl);
  const { response, finalUrl } = await fetchWithRedirectGuards(sourceUrl);

  const contentTypeRaw = response.headers.get('content-type') ?? '';
  const contentType = contentTypeRaw.toLowerCase();
  const mimeType = contentType.split(';')[0]?.trim() ?? '';
  const isText = mimeType.length === 0 || mimeType.startsWith('text/') || mimeType.includes('application/xhtml+xml');
  if (!isText) {
    throw new CharityUrlIngestError('unsupported_content_type', 'URL did not return an HTML page.');
  }

  const { text: html, bytesRead, truncated } = await readTextUpTo(response, MAX_HTML_BYTES);
  const title = extractTitle(html);
  const description = extractMetaContent(html, [
    { key: 'name', value: 'description' },
    { key: 'property', value: 'og:description' },
  ]);

  const ogImageRaw = extractMetaContent(html, [
    { key: 'property', value: 'og:image' },
    { key: 'name', value: 'og:image' },
    { key: 'name', value: 'twitter:image' },
  ]);

  let ogImageUrl: string | null = null;
  if (ogImageRaw) {
    try {
      ogImageUrl = new URL(ogImageRaw, finalUrl).toString();
    } catch {
      ogImageUrl = null;
    }
  }

  const textSnippet = extractVisibleText(html);

  const toSanitizedUrlString = (url: URL) => {
    const sanitized = new URL(url.toString());
    sanitized.username = '';
    sanitized.password = '';
    sanitized.search = '';
    sanitized.hash = '';
    return sanitized.toString();
  };

  const finalParsed = new URL(finalUrl);
  const sourceUrlSanitized = toSanitizedUrlString(sourceUrl);
  const finalUrlSanitized = toSanitizedUrlString(finalParsed);

  return {
    sourceUrl: sourceUrlSanitized,
    finalUrl: finalUrlSanitized,
    domain: finalParsed.hostname,
    title,
    description,
    ogImageUrl,
    textSnippet,
    ingest: {
      bytesRead,
      truncated,
      contentType: contentTypeRaw,
    },
  };
};
