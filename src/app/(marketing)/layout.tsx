import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { getClerkConfigStatus } from '@/lib/auth/clerk-config';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const isClerkEnabled = getClerkConfigStatus().isEnabled;

  return (
    <div className="flex min-h-screen flex-col">
      <Header isClerkEnabled={isClerkEnabled} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
