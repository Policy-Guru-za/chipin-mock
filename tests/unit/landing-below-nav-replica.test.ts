import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('below-nav homepage replica shell contract', () => {
  it('mounts the exact homepage body under the preserved landing nav seam', () => {
    const landingPage = readSource('src/components/landing/LandingPage.tsx');

    expect(landingPage).toContain('<LandingNav');
    expect(landingPage).toContain('<LandingBodyExact />');
    expect(landingPage).not.toContain('<LandingHero />');
    expect(landingPage).not.toContain('<LandingHowItWorks />');
    expect(landingPage).not.toContain('<LandingFooter />');
  });

  it('keeps Agentation as a homepage-only dev overlay with manual copy flow', () => {
    const marketingPage = readSource('src/app/(marketing)/page.tsx');
    const landingPage = readSource('src/components/landing/LandingPage.tsx');
    const homepageOverlay = readSource('src/components/dev/AgentationHomepageOverlay.tsx');
    const rootLayout = readSource('src/app/layout.tsx');

    expect(marketingPage).toContain('<LandingPage');
    expect(landingPage).toContain(
      "import { AgentationHomepageOverlay } from '@/components/dev/AgentationHomepageOverlay';"
    );
    expect(landingPage).toContain('<AgentationHomepageOverlay />');
    expect(rootLayout).not.toContain('AgentationHomepageOverlay');

    expect(homepageOverlay).toContain("import dynamic from 'next/dynamic';");
    expect(homepageOverlay).toContain("import('agentation').then((mod) => mod.Agentation)");
    expect(homepageOverlay).toContain("process.env.NODE_ENV === 'development'");
    expect(homepageOverlay).toContain("process.env.NEXT_PUBLIC_ENABLE_AGENTATION === 'true'");
    expect(homepageOverlay).not.toContain('endpoint=');
    expect(homepageOverlay).not.toContain('sessionId=');
    expect(homepageOverlay).not.toContain('webhookUrl=');
  });

  it('uses the reviewed assets and exact below-nav copy anchors', () => {
    const hero = readSource('src/components/landing-exact/LandingHeroExact.tsx');
    const heroRotator = readSource('src/components/landing-exact/LandingHeroTestimonialRotator.tsx');
    const sharedTestimonials = readSource('src/components/landing/testimonials.ts');
    const timeline = readSource('src/components/landing-exact/LandingTimelineExact.tsx');
    const voucherBand = readSource('src/components/landing-exact/LandingVoucherBandExact.tsx');
    const footer = readSource('src/components/landing-exact/LandingFooterExact.tsx');

    expect(hero).toContain('/images/homepage-exact/mia_avatar.jpg');
    expect(hero).toContain('3,400+');
    expect(hero).toContain('<LandingHeroTestimonialRotator />');
    expect(heroRotator).toContain("data-transition-state={transitionState}");
    expect(heroRotator).not.toContain('animate-landing-testimonial-fade');
    expect(sharedTestimonials).toContain('the present everyone helped with.');
    expect(sharedTestimonials).toContain('Rachel K.');
    expect(sharedTestimonials).toContain('James M.');
    expect(timeline).toContain('Family Group Chat');
    expect(timeline).toContain('/images/homepage-exact/takealot_logo.png');
    expect(timeline).toContain('3.4k+');
    expect(voucherBand).toContain('Official voucher partner');
    expect(voucherBand).toContain('Takealot');
    expect(footer).toContain('Birthday gifting, simplified.');
  });

  it('removes the footer voucher-partner pill and tightens the remaining footer rhythm', () => {
    const footer = readSource('src/components/landing-exact/LandingFooterExact.tsx');
    const footerStyles = readSource('src/components/landing-exact/LandingFooterExact.module.css');

    expect(footer).not.toContain("import Image from 'next/image';");
    expect(footer).not.toContain('Voucher partner');
    expect(footer).not.toContain('styles.footerPartner');
    expect(footer).not.toContain('takealot_logo.png');

    expect(footerStyles).toContain('.footer {');
    expect(footerStyles).toContain('padding: 44px 20px;');
    expect(footerStyles).toContain('gap: 20px;');
    expect(footerStyles).toContain('@media (max-width: 480px)');
    expect(footerStyles).toContain('gap: 18px;');
    expect(footerStyles).toContain('padding: 32px 16px;');
    expect(footerStyles).not.toContain('.footerPartner');
    expect(footerStyles).not.toContain('.footerPartnerLabel');
    expect(footerStyles).not.toContain('.footerPartnerLogo');
  });
});

describe('below-nav homepage replica hero contract', () => {
  it('removes only the timeline eyebrow and tightens the section top rhythm', () => {
    const timeline = readSource('src/components/landing-exact/LandingTimelineExact.tsx');
    const timelineStyles = readSource('src/components/landing-exact/LandingTimelineExact.module.css');

    expect(timeline).toContain('className={styles.timelineHeader}');
    expect(timeline).toContain('Gifting, <em>together</em>');
    expect(timeline).not.toContain('timelineHeaderEyebrow');
    expect(timeline).not.toContain('How it works</div>');
    expect(timelineStyles).toContain('padding: 72px 0 80px;');
    expect(timelineStyles).toContain('scroll-margin-top: calc(var(--landing-nav-offset, 121px) + 24px);');
    expect(timelineStyles).toContain('.timelineHeader {');
    expect(timelineStyles).toContain('margin: 0 auto 56px;');
    expect(timelineStyles).toContain('@media (max-width: 768px)');
    expect(timelineStyles).toContain('padding: 56px 0 56px;');
    expect(timelineStyles).toContain('margin-bottom: 48px;');
    expect(timelineStyles).toContain('@media (max-width: 480px)');
    expect(timelineStyles).toContain('padding: 44px 0 40px;');
    expect(timelineStyles).toContain('margin-bottom: 40px;');
    expect(timelineStyles).not.toContain('.timelineHeaderEyebrow');
  });

  it('restores the prototype display and editorial font-token split for the hero', () => {
    const globals = readSource('src/app/globals.css');
    const layout = readSource('src/app/layout.tsx');
    const tailwind = readSource('tailwind.config.ts');
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');
    const legacyHero = readSource('src/components/landing/LandingHero.tsx');

    expect(globals).toContain("--font-display: 'DM Serif Display', Georgia, serif;");
    expect(globals).toContain("--font-editorial: 'Fraunces', Georgia, serif;");
    expect(globals).toContain("--font-libre-baskerville: 'Libre Baskerville', Georgia, serif;");
    expect(globals).toContain('--font-dm-serif: var(--font-display);');
    expect(layout).toContain("Fraunces({");
    expect(layout).toContain("DM_Serif_Display({");
    expect(layout).toContain("Libre_Baskerville({");
    expect(layout).toContain("variable: '--font-editorial'");
    expect(layout).toContain("variable: '--font-display'");
    expect(layout).toContain("variable: '--font-libre-baskerville'");
    expect(layout).toContain("style: ['normal', 'italic']");
    expect(tailwind).toContain("editorial: ['var(--font-editorial)', 'Georgia', 'serif']");
    expect(heroStyles).toContain('font-family: var(--font-editorial);');
    expect(legacyHero).toContain("var(--font-editorial)");
    expect(legacyHero).not.toContain("var(--font-dm-serif)");
  });

  it('scopes Libre Baskerville to the active hero headline only', () => {
    const layout = readSource('src/app/layout.tsx');
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(layout).toMatch(
      /const libreBaskerville = Libre_Baskerville\(\{[\s\S]*weight: \['400', '700'\],[\s\S]*style: \['normal', 'italic'\],[\s\S]*variable: '--font-libre-baskerville'/
    );
    expect(heroStyles).toMatch(
      /\.heroHeadline \{[\s\S]*font-family: var\(--font-libre-baskerville\);[\s\S]*font-weight: 700;/
    );
    expect(heroStyles).toMatch(/\.heroHeadline em \{[\s\S]*font-weight: 400;/);
    expect(heroStyles).toMatch(
      /\.villageTestimonial::before \{[\s\S]*font-family: var\(--font-editorial\);/
    );
  });

  it('keeps the hero grids mobile-safe at the 375px baseline', () => {
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(heroStyles).toContain('@media (max-width: 920px)');
    expect(heroStyles).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(heroStyles).toContain('display: contents;');
    expect(heroStyles).toContain('@media (max-width: 375px)');
    expect(heroStyles).toContain('padding: calc(var(--landing-nav-offset, 72px) + var(--landing-hero-top-inset, 12px)) 12px 40px;');
    expect(heroStyles).not.toContain('minmax(400px, 1fr)');
  });

  it('locks the desktop hero headline to a wider no-wrap contract', () => {
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(heroStyles).toContain('grid-template-columns: minmax(0, 1.28fr) minmax(320px, 0.82fr);');
    expect(heroStyles).toContain('font-size: clamp(2.75rem, 4.8vw, 5.25rem);');
    expect(heroStyles).toContain('@media (min-width: 921px)');
    expect(heroStyles).toContain('white-space: nowrap;');
    expect(heroStyles).toContain('@media (max-width: 920px)');
    expect(heroStyles).toContain('grid-template-columns: minmax(0, 1fr);');
  });

  it('locks the hero to one semantic rail composition without duplicated desktop/mobile copies', () => {
    const hero = readSource('src/components/landing-exact/LandingHeroExact.tsx');
    const heroRotator = readSource('src/components/landing-exact/LandingHeroTestimonialRotator.tsx');
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(hero).toContain('<div className={styles.heroLeftRail}>');
    expect(hero).toContain('<div className={styles.heroRightRail}>');
    expect(hero).toContain('<LandingHeroTestimonialRotator />');
    expect(hero).toContain('<HeroCreateCta />');
    expect(hero).toContain('<VillageContributors />');
    expect(hero.match(/<LandingHeroTestimonialRotator/g)).toHaveLength(1);
    expect(hero.match(/<HeroCreateCta/g)).toHaveLength(1);
    expect(hero.match(/<VillageContributors/g)).toHaveLength(1);
    expect(hero).not.toContain('desktopNarrative');
    expect(hero).not.toContain('heroVisualRail');
    expect(hero).not.toContain('desktopVisualContributors');
    expect(hero).not.toContain('mobileVillage');
    expect(hero).not.toContain('mobileCtaSection');
    expect(heroRotator).toContain('useReducedMotion');
    expect(heroRotator).toContain('LANDING_TESTIMONIAL_TRANSITION_MS');
    expect(heroRotator).toContain('onMouseEnter');
    expect(heroRotator).toContain('onFocusCapture');
    expect(heroRotator).toContain('setTransitionState');
    expect(heroRotator).not.toContain("key={prefersReducedMotion ? 'static' : activeTestimonial}");
    expect(heroRotator).not.toContain('w-2 h-2');

    expect(heroStyles).toContain('.heroLeftRail');
    expect(heroStyles).toContain('.heroRightRail');
    expect(heroStyles).toContain('.heroCtaSection');
    expect(heroStyles).toContain('@media (max-width: 920px)');
    expect(heroStyles).toContain('display: contents;');
    expect(heroStyles).not.toContain('.desktopNarrative');
    expect(heroStyles).not.toContain('.heroVisualRail');
    expect(heroStyles).not.toContain('.desktopVisualContributors');
    expect(heroStyles).not.toContain('.heroVillage');
    expect(heroStyles).not.toContain('.mobileVillage');
    expect(heroStyles).not.toContain('.mobileCtaSection');
  });
});

describe('below-nav homepage replica layout contract', () => {
  it('keeps the external contributor constellation desktop-only below the true desktop breakpoint', () => {
    const hero = readSource('src/components/landing-exact/LandingHeroExact.tsx');
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(hero.match(/<VillageContributors/g)).toHaveLength(1);
    expect(heroStyles).toContain('@media (max-width: 1100px)');
    expect(heroStyles).toMatch(
      /@media \(max-width: 1100px\) \{[\s\S]*\.heroDream \{\s*gap: clamp\(32px, 3\.5vw, 44px\);\s*padding-bottom: 72px;\s*\}/
    );
    expect(heroStyles).toMatch(
      /@media \(max-width: 1100px\) \{[\s\S]*\.heroRightRail \{\s*gap: 0;\s*\}/
    );
    expect(heroStyles).toMatch(
      /@media \(max-width: 1100px\) \{[\s\S]*\.villageContributors \{\s*display: none;\s*\}/
    );
    expect(heroStyles).not.toMatch(
      /@media \(max-width: 1100px\) \{[\s\S]*\.scatterPerson \{\s*position: relative;/
    );
    expect(heroStyles).not.toMatch(
      /@media \(max-width: 1100px\) \{[\s\S]*\.scatterBubble \{\s*display: none;/
    );
  });

  it('keeps the preserved nav seam on one shared landing breakpoint contract', () => {
    const landingPage = readSource('src/components/landing/LandingPage.tsx');
    const landingNav = readSource('src/components/landing/LandingNav.tsx');
    const landingChrome = readSource('src/components/landing/LandingChrome.module.css');
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(landingPage).toContain("className={chromeStyles.page}");
    expect(landingPage).not.toContain('chromeStyles.navSpacer');
    expect(landingPage).not.toContain('h-[73px] md:h-[97px] lg:h-[121px]');

    expect(landingChrome).toContain('--landing-nav-offset: 121px;');
    expect(landingChrome).not.toContain('.navSpacer');
    expect(landingChrome).toContain('--landing-hero-top-inset: 28px;');
    expect(landingChrome).toContain('@media (max-width: 1100px)');
    expect(landingChrome).toContain('--landing-nav-offset: 80px;');
    expect(landingChrome).toContain('--landing-hero-top-inset: 20px;');
    expect(landingChrome).toContain('@media (max-width: 480px)');
    expect(landingChrome).toContain('--landing-nav-offset: 72px;');
    expect(landingChrome).toContain('--landing-hero-top-inset: 14px;');

    expect(landingNav).toContain("paddingBlock: 'var(--landing-nav-padding-block)'");
    expect(landingNav).toContain("paddingInline: 'var(--landing-nav-padding-inline)'");
    expect(heroStyles).toContain(
      'padding: calc(var(--landing-nav-offset, 121px) + var(--landing-hero-top-inset, 28px)) 80px 120px;'
    );
    expect(heroStyles).toContain('align-items: start;');
    expect(heroStyles).toContain('min-height: calc(100vh - 80px - var(--landing-hero-top-inset, 28px));');
  });
});
