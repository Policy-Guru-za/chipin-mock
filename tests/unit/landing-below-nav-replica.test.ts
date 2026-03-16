import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('below-nav homepage replica contract', () => {
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
    const timeline = readSource('src/components/landing-exact/LandingTimelineExact.tsx');
    const voucherBand = readSource('src/components/landing-exact/LandingVoucherBandExact.tsx');
    const footer = readSource('src/components/landing-exact/LandingFooterExact.tsx');

    expect(hero).toContain('/images/homepage-exact/mia_avatar.jpg');
    expect(hero).toContain('3,400+');
    expect(hero).toContain('the present everyone helped with.');
    expect(timeline).toContain('Family Group Chat');
    expect(timeline).toContain('/images/homepage-exact/takealot_logo.png');
    expect(timeline).toContain('3.4k+');
    expect(voucherBand).toContain('Official voucher partner');
    expect(voucherBand).toContain('Takealot');
    expect(footer).toContain('Voucher partner');
    expect(footer).toContain('Birthday gifting, simplified.');
  });

  it('restores the prototype display and editorial font-token split for the hero', () => {
    const globals = readSource('src/app/globals.css');
    const layout = readSource('src/app/layout.tsx');
    const tailwind = readSource('tailwind.config.ts');
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');
    const legacyHero = readSource('src/components/landing/LandingHero.tsx');

    expect(globals).toContain("--font-display: 'DM Serif Display', Georgia, serif;");
    expect(globals).toContain("--font-editorial: 'Fraunces', Georgia, serif;");
    expect(globals).toContain('--font-dm-serif: var(--font-display);');
    expect(layout).toContain("Fraunces({");
    expect(layout).toContain("DM_Serif_Display({");
    expect(layout).toContain("variable: '--font-editorial'");
    expect(layout).toContain("variable: '--font-display'");
    expect(layout).toContain("style: ['normal', 'italic']");
    expect(tailwind).toContain("editorial: ['var(--font-editorial)', 'Georgia', 'serif']");
    expect(heroStyles).toContain('font-family: var(--font-editorial);');
    expect(legacyHero).toContain("var(--font-editorial)");
    expect(legacyHero).not.toContain("var(--font-dm-serif)");
  });

  it('keeps the hero grids mobile-safe at the 375px baseline', () => {
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(heroStyles).toMatch(/minmax\(min\(100%, 400px\), 1fr\)/g);
    expect(heroStyles.match(/minmax\(min\(100%, 400px\), 1fr\)/g)).toHaveLength(1);
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

  it('keeps the preserved nav seam on one shared landing breakpoint contract', () => {
    const landingPage = readSource('src/components/landing/LandingPage.tsx');
    const landingNav = readSource('src/components/landing/LandingNav.tsx');
    const landingChrome = readSource('src/components/landing/LandingChrome.module.css');
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(landingPage).toContain("className={chromeStyles.page}");
    expect(landingPage).toContain("className={chromeStyles.navSpacer}");
    expect(landingPage).not.toContain('h-[73px] md:h-[97px] lg:h-[121px]');

    expect(landingChrome).toContain('--landing-nav-offset: 121px;');
    expect(landingChrome).toContain('@media (max-width: 1100px)');
    expect(landingChrome).toContain('--landing-nav-offset: 80px;');
    expect(landingChrome).toContain('@media (max-width: 480px)');
    expect(landingChrome).toContain('--landing-nav-offset: 72px;');

    expect(landingNav).toContain("paddingBlock: 'var(--landing-nav-padding-block)'");
    expect(landingNav).toContain("paddingInline: 'var(--landing-nav-padding-inline)'");
    expect(heroStyles).toContain('var(--landing-nav-offset, 121px)');
  });
});
