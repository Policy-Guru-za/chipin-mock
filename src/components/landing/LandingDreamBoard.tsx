'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { contributors, TIMING, DEMO_DATA } from './content';

export function LandingDreamBoard() {
  const [progress, setProgress] = useState(0);
  const [contributorPulse, setContributorPulse] = useState(-1);

  useEffect(() => {
    const timeout = setTimeout(
      () => setProgress(DEMO_DATA.PROGRESS_TARGET),
      TIMING.PROGRESS_DELAY
    );
    const pulseInterval = setInterval(() => {
      setContributorPulse((prev) => (prev + 1) % contributors.length);
    }, TIMING.CONTRIBUTOR_PULSE);
    return () => {
      clearTimeout(timeout);
      clearInterval(pulseInterval);
    };
  }, []);

  return (
    <div className="relative animate-landing-fade-up [animation-delay:150ms]">
      <div className="bg-white rounded-3xl shadow-[0_16px_48px_rgba(0,0,0,0.08)] overflow-hidden md:max-w-[420px] md:mx-auto lg:max-w-none lg:rounded-[28px] lg:shadow-[0_32px_80px_rgba(0,0,0,0.08)] lg:animate-landing-float">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#E4F0E8] to-[#D5E8DC] px-5 py-6 text-center relative">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <Image
              src="/images/demo-child.png"
              alt="Mia"
              fill
              className="rounded-full object-cover object-[center_20%] border-[3px] border-white shadow-[0_8px_24px_rgba(252,182,159,0.3)]"
              priority
            />
          </div>
          <h3
            className="text-[22px] font-medium text-[#2D2D2D] mb-1"
            style={{ fontFamily: 'var(--font-dm-serif)' }}
          >
            Mia&apos;s Dreamboard
          </h3>
          <p className="text-[#999] text-[13px]">Turning 6 • March 28th</p>
        </div>

        {/* Body */}
        <div className="p-5">
          {/* Dream Gift */}
          <div className="bg-gradient-to-br from-[#FFFBF7] to-[#FFF8F2] rounded-2xl p-5 mb-6 border border-[rgba(200,160,100,0.1)]">
            <div className="text-[11px] font-semibold text-[#5A8E78] tracking-[1.2px] mb-3.5">
              ✨ MIA&apos;S ONE BIG WISH
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-[14px] bg-gradient-to-br from-[#FFF0F5] to-[#FFE4EC] flex items-center justify-center text-[32px]">
                🎀
              </div>
              <div>
                <h4
                  className="text-[18px] text-[#2D2D2D] font-medium mb-0.5"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Ballet Starter Kit
                </h4>
                <p className="text-[#999] text-[13px]">Shoes, tutu & dance bag</p>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="mb-7">
            <div className="flex justify-between mb-2.5">
              <div>
                <span
                  className="text-[28px] font-semibold text-[#2D2D2D]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {progress}%
                </span>
                <span className="text-[#999] text-sm ml-2">funded</span>
              </div>
              <span className="text-[#999] text-sm self-end">18 days left</span>
            </div>
            <div className="h-2.5 bg-[#F5EFE8] rounded-[10px] overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#6B9E88] to-[#5A8E78] rounded-[10px] transition-[width] duration-[1.5s] ease-out relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-landing-progress-shine" />
              </div>
            </div>
          </div>

          {/* Contributors */}
          <div className="bg-[#FDFBF9] rounded-[14px] p-4 mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-semibold text-[#666]">
                🎉 7 people have chipped in
              </span>
            </div>
            <div className="flex items-center flex-wrap">
              {contributors.map((c, i) => (
                <div
                  key={c.name}
                  className="w-9 h-9 md:w-[42px] md:h-[42px] rounded-full flex items-center justify-center font-semibold text-[#6B5B4F] text-xs md:text-[13px] border-2 border-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                  style={{
                    backgroundColor: c.color,
                    marginLeft: i > 0 ? -8 : 0,
                    zIndex: contributors.length - i,
                    animation:
                      contributorPulse === i ? 'landing-soft-pulse 0.6s ease-out' : 'none',
                  }}
                >
                  {c.name[0]}
                </div>
              ))}
              <div className="ml-2.5 px-2.5 py-1.5 bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] rounded-[20px] text-[11px] font-semibold text-[#4CAF50]">
                +3 today!
              </div>
            </div>
          </div>

          {/* CTA */}
          <button className="w-full bg-transparent text-[#5A8E78] border-2 border-[#5A8E78] px-3.5 py-3.5 rounded-xl font-semibold text-[15px] cursor-default flex items-center justify-center gap-2 min-h-[44px] opacity-80">
            <span>Chip in for Mia</span>
            <span className="text-base">💝</span>
          </button>
        </div>
      </div>
    </div>
  );
}
