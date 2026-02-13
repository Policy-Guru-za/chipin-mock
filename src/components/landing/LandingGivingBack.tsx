'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { givingBackMetrics, givingBackCharities } from './content';

/* ------------------------------------------------------------------ */
/*  Animation helper (matches LandingHowItWorks pattern)               */
/* ------------------------------------------------------------------ */

const EASING = 'cubic-bezier(0.23, 1, 0.32, 1)';

function fadeStyle(visible: boolean, delay: number, duration = 0.4) {
  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(16px)',
    transition: `opacity ${duration}s ${EASING} ${delay}s, transform ${duration}s ${EASING} ${delay}s`,
  } as const;
}

/* ------------------------------------------------------------------ */
/*  Scroll-reveal hook (matches LandingHowItWorks pattern)             */
/* ------------------------------------------------------------------ */

function useScrollReveal(prefersReducedMotion: boolean) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  Wavy underline style (one-off decorative element)                  */
/* ------------------------------------------------------------------ */

const wavyUnderlineStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: -6,
  left: 0,
  right: 0,
  height: 4,
  background:
    'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 4"><path d="M 0 2 Q 5 0, 10 2 T 20 2 T 30 2 T 40 2 T 50 2 T 60 2 T 70 2 T 80 2 T 90 2 T 100 2 T 110 2 T 120 2 T 130 2 T 140 2 T 150 2 T 160 2 T 170 2 T 180 2 T 190 2 T 200 2 T 210 2 T 220 2 T 230 2 T 240 2 T 250 2 T 260 2 T 270 2 T 280 2 T 290 2 T 300 2" stroke="%237E6B9B" stroke-width="2.5" fill="none" opacity="0.25"/></svg>\') repeat-x',
  backgroundSize: '30px 4px',
};

/* ------------------------------------------------------------------ */
/*  Section background gradient                                        */
/* ------------------------------------------------------------------ */

const sectionBackground =
  'linear-gradient(180deg, #FAF7F2 0%, #F7F3FA 15%, #F1EDF7 45%, #F5F1F9 75%, #FAF7F2 100%)';

/* ------------------------------------------------------------------ */
/*  Stagger delay constants                                            */
/* ------------------------------------------------------------------ */

const DELAYS = {
  eyebrow: 0,
  headline: 0.06,
  subheading: 0.12,
  cards: [0.18, 0.26, 0.34],
  charityStrip: 0.4,
  closing: 0.46,
} as const;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LandingGivingBack() {
  const prefersReducedMotion = useReducedMotion();
  const { ref: sectionRef, visible } = useScrollReveal(prefersReducedMotion);
  const show = visible || prefersReducedMotion;

  return (
    <section
      ref={sectionRef}
      id="giving-back"
      className="px-6 py-14 md:px-10 md:py-20 lg:py-24 relative z-[5]"
      style={{ background: sectionBackground }}
    >
      <div className="max-w-[760px] mx-auto">
        {/* Eyebrow */}
        <p
          className="text-[11px] font-semibold tracking-[2.5px] uppercase text-plum text-center mb-4"
          style={fadeStyle(show, DELAYS.eyebrow)}
        >
          Giving Back
        </p>

        {/* Headline */}
        <h2
          className="text-[30px] md:text-[36px] font-bold leading-[1.2] text-[#2D2D2D] text-center mb-3"
          style={{ fontFamily: 'var(--font-dm-serif)', ...fadeStyle(show, DELAYS.headline) }}
        >
          Celebrate a birthday.
          <br />
          <span className="relative inline-block">
            <span>Change a life.</span>
            <span style={wavyUnderlineStyle} aria-hidden="true" />
          </span>
        </h2>

        {/* Subheading */}
        <p
          className="text-[14px] md:text-[15px] text-[#4A5D53] text-center max-w-[520px] mx-auto mb-12 leading-[1.6]"
          style={fadeStyle(show, DELAYS.subheading)}
        >
          Every Dreamboard can support a cause. Hosts choose a charity, set a
          split — and every contribution does double duty.
        </p>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mb-8">
          {givingBackMetrics.map((metric, idx) => (
            <div
              key={metric.value}
              className="bg-white rounded-[18px] px-6 py-7 shadow-[0_4px_12px_rgba(45,45,45,0.06)] border border-black/[0.04] text-center"
              style={{
                borderLeft: '3px solid rgba(126, 107, 155, 0.3)',
                ...fadeStyle(show, DELAYS.cards[idx]),
              }}
            >
              <span className="text-2xl mb-3 block">{metric.emoji}</span>
              <div
                className="text-[28px] font-bold text-plum mb-1"
                style={{ fontFamily: 'var(--font-dm-serif)' }}
              >
                {metric.value}
              </div>
              {metric.sublabel && (
                <div className="text-[13px] text-[#7A8D83] mb-0.5">
                  {metric.sublabel}
                </div>
              )}
              <div className="text-[13px] text-[#7A8D83]">{metric.label}</div>
            </div>
          ))}
        </div>

        {/* Charity Strip */}
        <div
          className="flex gap-4 overflow-x-auto pb-2 mb-7 snap-x snap-mandatory scrollbar-hide"
          style={fadeStyle(show, DELAYS.charityStrip)}
        >
          {givingBackCharities.map((charity) => (
            <div
              key={charity.initials}
              className="flex items-center gap-3 bg-white rounded-[14px] px-5 py-4 border border-black/[0.04] min-w-[200px] snap-start transition-all duration-300 hover:shadow-[0_8px_20px_rgba(45,45,45,0.1)] hover:-translate-y-0.5"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: charity.color }}
              >
                {charity.initials}
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[13px] font-medium text-[#2D2D2D]">
                  {charity.name}
                </span>
                <span className="text-[11px] text-[#999]">{charity.tag}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Closing Line */}
        <p
          className="text-[14px] text-[#7A8D83] text-center italic"
          style={{
            fontFamily: 'var(--font-dm-serif)',
            ...fadeStyle(show, DELAYS.closing),
          }}
        >
          It&apos;s optional. It&apos;s transparent. And it makes every gift
          mean more.
        </p>
      </div>
    </section>
  );
}
