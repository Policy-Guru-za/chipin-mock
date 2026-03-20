import { LandingPage } from '@/components/landing/LandingPage';
import { getClerkConfigStatus } from '@/lib/auth/clerk-config';
import {
  HOMEPAGE_SEARCH_METADATA,
  HOMEPAGE_SEARCH_STRUCTURED_DATA,
  serializeStructuredData,
} from '@/lib/metadata/homepage-search';

export const metadata = HOMEPAGE_SEARCH_METADATA;

export default function MarketingPage() {
  const isClerkEnabled = getClerkConfigStatus().isEnabled;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeStructuredData(HOMEPAGE_SEARCH_STRUCTURED_DATA),
        }}
      />
      <LandingPage isClerkEnabled={isClerkEnabled} />
    </>
  );
}
