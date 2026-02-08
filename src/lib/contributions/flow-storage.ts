export interface ContributeFlowData {
  amountCents: number;
  contributorName: string;
  isAnonymous: boolean;
  message: string;
  slug: string;
  childName: string;
  dreamBoardId: string;
  timestamp: number;
}

const FLOW_TTL_MS = 30 * 60 * 1000;

export function getStorageKey(slug: string): string {
  return `gifta_contribute_${slug}`;
}

export function saveFlowData(data: ContributeFlowData): boolean {
  if (typeof window === 'undefined') return false;
  try {
    sessionStorage.setItem(getStorageKey(data.slug), JSON.stringify(data));
    return true;
  } catch {
    // sessionStorage may be unavailable.
    return false;
  }
}

export function getFlowData(slug: string): ContributeFlowData | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = sessionStorage.getItem(getStorageKey(slug));
    if (!raw) return null;
    const data = JSON.parse(raw) as ContributeFlowData;

    if (Date.now() - data.timestamp > FLOW_TTL_MS) {
      sessionStorage.removeItem(getStorageKey(slug));
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

export function clearFlowData(slug: string): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(getStorageKey(slug));
  } catch {
    // sessionStorage may be unavailable.
  }
}
