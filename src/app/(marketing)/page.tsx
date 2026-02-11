import { LandingPage } from '@/components/landing/LandingPage';
import { getClerkConfigStatus } from '@/lib/auth/clerk-config';

export default function MarketingPage() {
  const isClerkEnabled = getClerkConfigStatus().isEnabled;
  return <LandingPage isClerkEnabled={isClerkEnabled} />;
}
