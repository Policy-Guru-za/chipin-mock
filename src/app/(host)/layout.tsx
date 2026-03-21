import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { GoogleAnalyticsTag } from '@/components/analytics/GoogleAnalyticsTag';
import { getClerkConfigStatus } from '@/lib/auth/clerk-config';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const isClerkEnabled = getClerkConfigStatus().isEnabled;

  return (
    <div className="flex min-h-screen flex-col bg-subtle">
      <GoogleAnalyticsTag />
      <Header isClerkEnabled={isClerkEnabled} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
