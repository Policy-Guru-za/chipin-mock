import shellStyles from './LandingBodyExactShell.module.css';
import { LandingFooterExact } from './LandingFooterExact';
import { LandingHeroExact } from './LandingHeroExact';
import { LandingTimelineExact } from './LandingTimelineExact';
import { LandingVoucherBandExact } from './LandingVoucherBandExact';

export function LandingBodyExact() {
  return (
    <div className={shellStyles.shell}>
      <div className={shellStyles.pageWrapper}>
        <div aria-hidden="true" className={shellStyles.ambientShape} />
        <LandingHeroExact />
        <LandingTimelineExact />
        <LandingVoucherBandExact />
        <LandingFooterExact />
      </div>
    </div>
  );
}
