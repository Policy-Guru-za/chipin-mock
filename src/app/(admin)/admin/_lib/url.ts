export type RouteSearchParams = Record<string, string | string[] | undefined>;

export const toUrlSearchParams = (source?: RouteSearchParams) => {
  const params = new URLSearchParams();
  if (!source) return params;

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item) params.append(key, item);
      }
      continue;
    }

    if (value) {
      params.set(key, value);
    }
  }

  return params;
};

export const pickFilterValues = (params: URLSearchParams, keys: string[]) =>
  Object.fromEntries(keys.map((key) => [key, params.get(key) ?? ''])) as Record<string, string>;

export const buildHref = (path: string, params: URLSearchParams) => {
  const query = params.toString();
  return query ? `${path}?${query}` : path;
};

export const toPageNumber = (params: URLSearchParams) => {
  const value = Number.parseInt(params.get('page') ?? '1', 10);
  if (Number.isNaN(value) || value < 1) return 1;
  return value;
};
