import Image from 'next/image';
import Link from 'next/link';

import styles from './LandingVoucherBandExact.module.css';

export function LandingVoucherBandExact() {
  return (
    <>
      <section id="trust" className={styles.payoutBand}>
        <div className={styles.payoutBandInner}>
          <div className={styles.payoutText}>
            <h2>
              Everyone chipped in — now the payout <em>lands securely</em>.
            </h2>
            <p className={styles.payoutDetails}>
              When the Dreamboard closes, Gifta sends the funds directly to your chosen
              bank account, or to your child&apos;s Karri Card if this option has been selected.
              No voucher codes, no retailer restrictions — just simple, secure payout
              delivery.
            </p>
          </div>

          <div className={styles.payoutVisual}>
            <div>
              <div className={styles.payoutCard}>
                <div className={styles.payoutCardHeader}>
                  <div className={styles.payoutCardBrand}>
                    <span className={styles.payoutCardEmoji}>🏦</span>
                    <div>
                      <div className={styles.payoutCardBrandText}>Gifta payout</div>
                      <div className={styles.payoutCardBrandSub}>Paid out when the Dreamboard closes</div>
                    </div>
                  </div>
                  <div className={styles.payoutCardStatus}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Ready to send
                  </div>
                </div>

                <div className={styles.payoutCardBody}>
                  <div className={styles.payoutCardSection}>
                    <div className={styles.payoutCardLabel}>Primary destination</div>
                    <div className={styles.payoutCardValue}>Your chosen bank account</div>
                    <div className={styles.payoutCardMeta}>
                      Secure bank payout details stay on file for delivery at close.
                    </div>
                  </div>
                  <div className={styles.payoutCardSection}>
                    <div className={styles.payoutCardLabel}>Optional child destination</div>
                    <div className={styles.payoutCardValue}>Your child&apos;s Karri Card</div>
                    <div className={styles.payoutCardMeta}>
                      Used when selected, if your child already has a Karri Card available
                      for direct payout.
                    </div>
                  </div>
                  <div className={styles.payoutCardAmountRow}>
                    <div>
                      <div className={styles.payoutCardAmountLabel}>Amount raised</div>
                      <div className={styles.payoutCardAmountValue}>R1,850</div>
                    </div>
                    <div className={styles.payoutCardAmountHint}>
                      Direct payout when your Dreamboard closes
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.partnerRail}>
                <div className={styles.partnerLockup}>
                  <Image
                    src="/images/homepage-exact/stitch_logo.svg"
                    alt="Stitch"
                    width={108}
                    height={21}
                    className={styles.partnerRailLogo}
                  />
                  <div className={styles.partnerLockupTitle}>Superpowered by Stitch.</div>
                </div>
                <div className={styles.partnerRailDivider} />
                <div className={styles.partnerLockup}>
                  <Image
                    src="/images/homepage-exact/karri_logo.png"
                    alt="Karri"
                    width={124}
                    height={28}
                    className={styles.partnerRailLogo}
                  />
                  <div className={styles.partnerLockupTitle}>Karri Card payout option</div>
                  <div className={styles.partnerLockupCopy}>
                    For children who already have a Karri Card
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.closingCta}>
        <h2>Ready to make gift-giving magic?</h2>
        <p>It takes less than a minute. No app needed.</p>
        <Link href="/create" prefetch={false} className={styles.closingCtaButton}>
          Create Your Free Dreamboard
        </Link>
      </section>
    </>
  );
}
