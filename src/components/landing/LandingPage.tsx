'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LandingNav,
  LandingHero,
  LandingDreamBoard,
  LandingStatsLine,
  LandingTestimonial,
  LandingCTA,
  LandingHowItWorks,
  LandingFooter,
} from './index';

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-[#FFFCF9] relative overflow-hidden"
      style={{ fontFamily: 'var(--font-dm-sans)' }}
    >
      {/* Warm ambient gradients */}
      <div className="absolute w-[300px] h-[300px] md:w-[450px] md:h-[450px] lg:w-[600px] lg:h-[600px] bg-[radial-gradient(circle,rgba(248,220,180,0.15)_0%,transparent_70%)] -top-[100px] md:-top-[150px] lg:-top-[200px] left-[10%] md:left-[20%] lg:left-[30%] pointer-events-none" />
      <div className="absolute w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] bg-[radial-gradient(circle,rgba(220,190,160,0.1)_0%,transparent_70%)] -bottom-[50px] lg:-bottom-[100px] -right-[30px] lg:-right-[50px] pointer-events-none" />

      <LandingNav mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Content - Hero Grid */}
      <div className="flex flex-col gap-8 md:gap-12 lg:gap-[100px] px-5 py-6 pb-[60px] md:px-10 md:py-[50px] md:pb-[70px] lg:px-20 lg:py-[70px] max-w-[1400px] mx-auto relative z-[5] lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        {/* Mobile & Tablet: use CSS order for reordering */}
        <div className="contents lg:flex lg:flex-col">
          {/* Hero Text - Order 1 */}
          <div className="order-1 lg:order-none">
            <LandingHero />
          </div>

          {/* Stats Line - Order 3 */}
          <div className="order-3 lg:order-none">
            <LandingStatsLine />
          </div>

          {/* Testimonial - Order 4 */}
          <div className="order-4 lg:order-none mt-6 lg:mt-7">
            <LandingTestimonial />
          </div>

          {/* CTA Section - Order 5 */}
          <div className="order-5 lg:order-none">
            <LandingCTA />
          </div>
        </div>

        {/* DreamBoard - Order 2 */}
        <div className="order-2 lg:order-none">
          <LandingDreamBoard />
        </div>
      </div>

      <LandingHowItWorks />

      <div className="flex justify-center px-5 pb-[60px] md:px-10 md:pb-20 relative z-[5]">
        <Link
          href="/create"
          className="bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-7 py-4 md:px-9 md:py-[18px] rounded-xl font-semibold text-[15px] md:text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(107,158,136,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,158,136,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(107,158,136,0.3)]"
        >
          Create your free Dream Board
        </Link>
      </div>

      <LandingFooter />
    </div>
  );
}
