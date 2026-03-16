'use client';

import dynamic from 'next/dynamic';

const Agentation = dynamic(() => import('agentation').then((mod) => mod.Agentation), {
  ssr: false,
  loading: () => null,
});

const isAgentationEnabled = (): boolean =>
  process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_AGENTATION === 'true';

export function AgentationHomepageOverlay() {
  if (!isAgentationEnabled()) {
    return null;
  }

  return <Agentation />;
}
