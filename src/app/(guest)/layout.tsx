import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { getClerkConfigStatus } from '@/lib/auth/clerk-config';

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  const isClerkEnabled = getClerkConfigStatus().isEnabled;

  return (
    <div className="flex min-h-screen flex-col bg-subtle">
      <Header isClerkEnabled={isClerkEnabled} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
