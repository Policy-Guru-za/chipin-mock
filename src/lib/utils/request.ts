import type { NextRequest } from 'next/server';

export const getClientIp = (request: NextRequest) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip');

type HeaderReader = {
  get(name: string): string | null;
};

type ParsedHost = {
  host: string;
  hostname: string;
};

type ParsedOrigin = ParsedHost & {
  origin: string;
};

type ResolveRuntimeBaseUrlOptions = {
  headers: HeaderReader;
  requestOrigin?: string | null;
  appUrl?: string | null;
};

const DEFAULT_APP_URL = 'http://localhost:3000';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '[::1]']);

const getFirstHeaderValue = (value: string | null) => value?.split(',')[0]?.trim() ?? null;

const parseHostCandidate = (value: string | null): ParsedHost | null => {
  const candidate = getFirstHeaderValue(value)?.toLowerCase();
  if (!candidate) return null;
  if (/[\/\\\s@?#]/.test(candidate)) return null;

  try {
    const parsed = new URL(`http://${candidate}`);
    return { host: parsed.host.toLowerCase(), hostname: parsed.hostname.toLowerCase() };
  } catch {
    return null;
  }
};

const parseOriginCandidate = (value: string | null | undefined): ParsedOrigin | null => {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return {
      origin: parsed.origin,
      host: parsed.host.toLowerCase(),
      hostname: parsed.hostname.toLowerCase(),
    };
  } catch {
    return null;
  }
};

const parseHostFromUrlLike = (value: string | null | undefined): ParsedHost | null => {
  if (!value) return null;
  const candidate = value.includes('://') ? value : `https://${value}`;
  try {
    const parsed = new URL(candidate);
    return { host: parsed.host.toLowerCase(), hostname: parsed.hostname.toLowerCase() };
  } catch {
    return null;
  }
};

const resolveProtocol = (forwardedProto: string | null, hostname: string) => {
  const candidate = getFirstHeaderValue(forwardedProto)?.toLowerCase();
  if (candidate === 'http' || candidate === 'https') {
    return candidate;
  }
  return LOCAL_HOSTNAMES.has(hostname) ? 'http' : 'https';
};

const buildTrustedHosts = (appUrl: string | null | undefined) => {
  const trustedHosts = new Set<string>();
  const trustedHostnames = new Set<string>();

  const addHost = (parsed: ParsedHost | null) => {
    if (!parsed) return;
    trustedHosts.add(parsed.host);
    trustedHostnames.add(parsed.hostname);
  };

  addHost(parseHostFromUrlLike(appUrl));
  addHost(parseHostFromUrlLike(process.env.VERCEL_URL));

  return { trustedHosts, trustedHostnames };
};

const isTrustedHost = (
  candidate: ParsedHost,
  trustedHosts: Set<string>,
  trustedHostnames: Set<string>
) => {
  if (LOCAL_HOSTNAMES.has(candidate.hostname)) return true;
  return trustedHosts.has(candidate.host) || trustedHostnames.has(candidate.hostname);
};

const resolveConfiguredAppUrl = (appUrl: string | null | undefined) => {
  const parsed = parseOriginCandidate(appUrl);
  return parsed?.origin ?? DEFAULT_APP_URL;
};

export const resolveRuntimeBaseUrl = ({
  headers,
  requestOrigin,
  appUrl = process.env.NEXT_PUBLIC_APP_URL,
}: ResolveRuntimeBaseUrlOptions) => {
  const configuredAppUrl = resolveConfiguredAppUrl(appUrl);
  const { trustedHosts, trustedHostnames } = buildTrustedHosts(appUrl);
  const forwardedProto = headers.get('x-forwarded-proto');

  const forwardedHost = parseHostCandidate(headers.get('x-forwarded-host'));
  if (forwardedHost && isTrustedHost(forwardedHost, trustedHosts, trustedHostnames)) {
    const protocol = resolveProtocol(forwardedProto, forwardedHost.hostname);
    return `${protocol}://${forwardedHost.host}`;
  }

  const hostHeader = parseHostCandidate(headers.get('host'));
  if (hostHeader && isTrustedHost(hostHeader, trustedHosts, trustedHostnames)) {
    const protocol = resolveProtocol(forwardedProto, hostHeader.hostname);
    return `${protocol}://${hostHeader.host}`;
  }

  const origin = parseOriginCandidate(requestOrigin);
  if (origin && isTrustedHost(origin, trustedHosts, trustedHostnames)) {
    return origin.origin;
  }

  return configuredAppUrl;
};
