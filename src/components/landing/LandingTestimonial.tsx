'use client';

import { useState, useEffect } from 'react';
import { testimonials, TIMING } from './content';

export function LandingTestimonial() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, TIMING.TESTIMONIAL_ROTATION);
    return () => clearInterval(testimonialInterval);
  }, []);

  return (
    <div className="bg-white rounded-2xl md:rounded-[20px] p-5 md:p-7 shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-black/[0.04]">
      <div className="flex gap-4">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#F2E6DC] to-[#E6DCD2] flex items-center justify-center text-lg flex-shrink-0">
          💬
        </div>
        <div className="flex-1 min-w-0">
          <div
            key={activeTestimonial}
            className="animate-landing-testimonial-fade"
          >
            <p
              className="text-[15px] text-[#444] leading-[1.65] mb-3 italic"
              style={{ fontFamily: 'var(--font-dm-serif)' }}
            >
              &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
            </p>
            <p className="text-[13px] text-[#999]">
              <strong className="text-[#666]">
                {testimonials[activeTestimonial].author}
              </strong>
              {' · '}
              {testimonials[activeTestimonial].relation}
            </p>
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4 ml-[60px]">
        {testimonials.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: i === activeTestimonial ? '#5A8E78' : '#E8E0D8',
            }}
          />
        ))}
      </div>
    </div>
  );
}
