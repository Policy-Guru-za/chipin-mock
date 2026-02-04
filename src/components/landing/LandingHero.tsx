export function LandingHero() {
  return (
    <div className="landing-hero-text animate-landing-fade-up">
      <h1
        className="text-[32px] md:text-[42px] lg:text-[54px] font-medium text-[#2D2D2D] leading-[1.15] mb-5 md:mb-7 tracking-[-0.5px]"
        style={{ fontFamily: 'var(--font-dm-serif)' }}
      >
        One dream gift.
        <br />
        <span className="text-[#C4785A]">Everyone chips in.</span>
      </h1>

      <p className="text-[16px] md:text-[17px] lg:text-[19px] text-[#666] leading-[1.8] mb-0 max-w-[500px] lg:mb-10">
        Friends and family each give a little. Your child gets the gift they&apos;ve been
        dreaming of.
      </p>
    </div>
  );
}
