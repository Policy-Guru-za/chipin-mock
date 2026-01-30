const DEFAULT_DEMO_ORIGIN = 'http://localhost:3000';

export const buildDemoAssetUrl = (path: string) => {
  const origin = (process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_DEMO_ORIGIN).replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${origin}${normalizedPath}`;
};
