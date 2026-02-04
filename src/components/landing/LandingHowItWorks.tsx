import { howItWorksSteps } from './content';

export function LandingHowItWorks() {
  return (
    <section
      id="how-it-works"
      className="px-5 py-12 md:px-10 md:py-[60px] max-w-[1000px] mx-auto relative z-[5] bg-gradient-to-b from-[rgba(228,240,232,0.3)] to-transparent border-t border-[rgba(107,158,136,0.1)]"
    >
      <h2
        className="text-[28px] md:text-[36px] font-medium text-[#2D2D2D] text-center mb-10 md:mb-14"
        style={{ fontFamily: 'var(--font-dm-serif)' }}
      >
        How it works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {howItWorksSteps.map((step) => (
          <div
            key={step.number}
            className="bg-white rounded-[20px] px-6 py-7 text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-black/[0.04] relative"
          >
            <div className="text-[36px] mb-4">{step.icon}</div>
            <div className="absolute top-4 left-4 w-7 h-7 bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white rounded-full text-sm font-semibold flex items-center justify-center">
              {step.number}
            </div>
            <h3
              className="text-lg font-medium text-[#2D2D2D] mb-2"
              style={{ fontFamily: 'var(--font-dm-serif)' }}
            >
              {step.title}
            </h3>
            <p className="text-sm text-[#666] leading-[1.6]">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
