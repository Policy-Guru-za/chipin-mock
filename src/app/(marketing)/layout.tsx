import { GoogleAnalyticsTag } from '@/components/analytics/GoogleAnalyticsTag';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <GoogleAnalyticsTag />
      <main id="main-content">{children}</main>
    </>
  );
}
