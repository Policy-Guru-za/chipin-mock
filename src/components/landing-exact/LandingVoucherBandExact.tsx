import Image from 'next/image';
import Link from 'next/link';

import styles from './LandingVoucherBandExact.module.css';

export function LandingVoucherBandExact() {
  return (
    <>
      <section id="trust" className={styles.voucherBand}>
        <div className={styles.voucherBandInner}>
          <div className={styles.voucherText}>
            <h2>
              Everyone chipped in — now it&apos;s a <em>digital voucher</em>, ready to spend.
            </h2>
            <p className={styles.voucherDetails}>
              Once the Dreamboard closes, the full amount raised becomes a{' '}
              <strong>digital voucher</strong> — redeemable across Takealot&apos;s entire
              catalogue, so the birthday child gets exactly what they wished for. The
              voucher is sent at just the right moment, and details are kept securely on file
              until then.
            </p>
          </div>

          <div className={styles.voucherVisual}>
            <div>
              <div className={styles.voucherCard}>
                <div className={styles.voucherCardHeader}>
                  <div className={styles.voucherCardBrand}>
                    <span className={styles.voucherCardEmoji}>🎁</span>
                    <span className={styles.voucherCardBrandText}>Gifta</span>
                  </div>
                </div>

                <div className={styles.voucherCardBody}>
                  <div className={styles.voucherCardLabel}>Gift voucher for</div>
                  <div className={styles.voucherCardGift}>Ballet Starter Kit</div>
                  <div className={styles.voucherCardFor}>Mia&apos;s 6th Birthday 🩰</div>
                  <div className={styles.voucherCardAmountRow}>
                    <div>
                      <div className={styles.voucherCardAmountLabel}>Amount raised</div>
                      <div className={styles.voucherCardAmountValue}>R1,850</div>
                    </div>
                    <div className={styles.voucherCardStatus}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      Ready
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.voucherCoBrand}>
                <Image
                  src="/images/homepage-exact/takealot_logo.png"
                  alt="Takealot"
                  width={512}
                  height={512}
                  className={styles.voucherCoBrandLogo}
                />
                <div className={styles.voucherCoBrandDivider} />
                <div className={styles.voucherCoBrandLabel}>Official voucher partner</div>
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
