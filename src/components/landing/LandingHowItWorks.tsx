'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { howItWorksSteps, howItWorksSocialProof } from './content';

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

function GiftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-[26px] h-[26px]" style={{ strokeWidth: 1.8 }} aria-hidden="true">
      <rect x="3" y="8" width="18" height="13" rx="2" />
      <path d="M12 8V3" /><path d="M8 3c0 2.5 2 5 4 5" /><path d="M16 3c0 2.5-2 5-4 5" />
      <line x1="3" y1="13" x2="21" y2="13" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-[26px] h-[26px]" style={{ strokeWidth: 1.8 }} aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      <path d="m9 13 2 2 4-4" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className="w-[26px] h-[26px]" style={{ strokeWidth: 1.8 }} aria-hidden="true">
      <path d="M12 3l1.5 3.6 3.9.6-2.8 2.8.7 3.9L12 12l-3.3 1.9.7-3.9L6.6 7.2l3.9-.6z" />
      <path d="M5 19l1-1" /><path d="M19 19l-1-1" /><path d="M12 17v4" /><path d="M8 21h8" />
    </svg>
  );
}

const STEP_ICONS = [GiftIcon, ChatIcon, TrophyIcon];
const CARD_DELAYS = [0.05, 0.18, 0.31];

/* ------------------------------------------------------------------ */
/*  Animation helper                                                   */
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
/*  Scroll-reveal hook                                                 */
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
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StoryCard({ step, idx, show }: {
  step: (typeof howItWorksSteps)[number];
  idx: number;
  show: boolean;
}) {
  const Icon = STEP_ICONS[idx];
  const isLight = step.theme === 'light';

  return (
    <div className="rounded-[22px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-[rgba(0,0,0,0.03)]" style={fadeStyle(show, CARD_DELAYS[idx], 0.45)}>
      <div
        className="h-[110px] flex items-center gap-4 px-6 relative overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${step.gradientFrom} 0%, ${step.gradientTo} 100%)` }}
      >
        <div className="hiw-card-circle" />
        <div className={`w-[52px] h-[52px] rounded-2xl flex items-center justify-center flex-shrink-0 relative z-[2] ${isLight ? 'bg-white/[0.15]' : 'bg-black/[0.08]'}`}>
          <span className={isLight ? 'text-white' : 'text-[#1A2B22] opacity-70'}><Icon /></span>
        </div>
        <div className="relative z-[2]">
          <p className={`text-[10px] font-semibold tracking-[2px] uppercase mb-0.5 ${isLight ? 'text-white/50' : 'text-[#1A2B22]/50'}`}>
            {step.stepLabel}
          </p>
          <h3 className={`text-[20px] font-bold leading-[1.2] ${isLight ? 'text-white' : 'text-[#1A2B22]'}`} style={{ fontFamily: 'var(--font-dm-serif)' }}>
            {step.title}
          </h3>
        </div>
      </div>
      <div className="bg-white px-[22px] py-[18px]">
        <p className="text-[14px] leading-[1.6] text-[#4A5D53]">{step.description}</p>
      </div>
    </div>
  );
}

function SocialProof({ show }: { show: boolean }) {
  return (
    <div className="mt-7 px-5 py-4 bg-white rounded-2xl border-[1.5px] border-[rgba(107,158,136,0.12)] flex items-center gap-3.5" style={fadeStyle(show, 0.4)}>
      <div className="flex-shrink-0 text-center min-w-[56px]">
        <div className="text-[22px] font-bold leading-[1.1] text-[#6B9E88]" style={{ fontFamily: 'var(--font-dm-serif)' }}>
          {howItWorksSocialProof.stat}
        </div>
        <div className="text-[10px] font-semibold tracking-[1px] uppercase text-[#7A8D83]">{howItWorksSocialProof.unit}</div>
      </div>
      <div className="w-[1.5px] h-8 bg-[rgba(107,158,136,0.1)] flex-shrink-0" />
      <p className="text-[13px] leading-[1.45] text-[#4A5D53]">{howItWorksSocialProof.text}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export function LandingHowItWorks() {
  const prefersReducedMotion = useReducedMotion();
  const { ref: sectionRef, visible } = useScrollReveal(prefersReducedMotion);
  const show = visible || prefersReducedMotion;

  return (
    <section ref={sectionRef} id="how-it-works" className="scroll-mt-24 md:scroll-mt-28 px-6 pt-14 pb-10 md:px-10 md:pt-20 md:pb-14 relative z-[5] bg-[#FAF7F2]">
      <div className="max-w-[420px] md:max-w-[520px] mx-auto">
        <div className="text-center mb-9">
          <p className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#6B9E88] mb-2.5" style={fadeStyle(show, 0)}>
            How it works
          </p>
          <h2 className="text-[30px] md:text-[36px] font-bold leading-[1.2] text-[#2D2D2D]" style={{ fontFamily: 'var(--font-dm-serif)', ...fadeStyle(show, 0.08) }}>
            Gifting, <em className="not-italic italic font-normal text-[#C4785A]">together</em>
          </h2>
        </div>

        <div className="flex flex-col gap-4">
          {howItWorksSteps.map((step, idx) => (
            <StoryCard key={step.stepLabel} step={step} idx={idx} show={show} />
          ))}
        </div>

        <SocialProof show={show} />
      </div>
    </section>
  );
}
