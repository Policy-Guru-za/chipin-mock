import Link from 'next/link';

export function LandingCTA() {
  return (
    <div className="flex flex-col gap-4 mb-8 animate-landing-fade-up md:flex-row md:items-center md:justify-center md:gap-6 lg:mt-8 lg:mb-12 lg:justify-start">
      <Link
        href="/create"
        className="bg-gradient-to-br from-primary-700 to-primary-800 text-white border-none px-7 py-4 md:px-9 md:py-[18px] rounded-xl font-semibold text-[15px] md:text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(15,118,110,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(15,118,110,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(15,118,110,0.3)]"
      >
        Create your free Dream Board
      </Link>
    </div>
  );
}
