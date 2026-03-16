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

  it('keeps the hero grids mobile-safe at the 375px baseline', () => {
    const heroStyles = readSource('src/components/landing-exact/LandingHeroExact.module.css');

    expect(heroStyles).toMatch(/minmax\(min\(100%, 400px\), 1fr\)/g);
    expect(heroStyles.match(/minmax\(min\(100%, 400px\), 1fr\)/g)).toHaveLength(2);
    expect(heroStyles).not.toContain('minmax(400px, 1fr)');
  });
});
