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
      <div aria-hidden="true" className="h-[73px] md:h-[97px] lg:h-[121px]" />

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

      {/* Closing CTA — contract: copy-matrix-compliance + colour-contrast */}
      <section className="px-6 py-14 md:px-10 md:py-20">
        <div className="max-w-[760px] mx-auto rounded-[28px] border border-[rgba(107,158,136,0.14)] bg-[linear-gradient(180deg,rgba(250,247,242,0.96)_0%,rgba(255,252,249,0.96)_100%)] shadow-[0_8px_28px_rgba(90,142,120,0.08)] px-6 py-10 md:px-10 md:py-14 text-center">
          <h2
            className="text-[24px] md:text-[32px] font-bold leading-[1.2] text-[#2D2D2D] mb-2"
            style={{ fontFamily: 'var(--font-dm-serif)' }}
          >
            Ready to make gift-giving magic?
          </h2>
          <p className="text-[14px] md:text-[15px] text-[#7A8D83] mb-8">
            It takes less than a minute. No app needed.
          </p>
          <Link
            href="/create"
            className="bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-9 py-[18px] rounded-xl font-semibold text-base lg:text-[17px] text-center shadow-[0_4px_16px_rgba(107,158,136,0.3)] transition-all min-h-[44px] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,158,136,0.4)] active:translate-y-0 active:shadow-[0_2px_12px_rgba(107,158,136,0.3)] inline-block"
          >
            Create Your Free Dreamboard
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
