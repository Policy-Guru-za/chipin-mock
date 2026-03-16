import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from './LandingHeroExact.module.css';

const heroContributors = [
  { initial: 'C', color: '#F5C6AA' },
  { initial: 'M', color: '#A8D4E6' },
  { initial: 'N', color: '#B8E0B8' },
  { initial: 'T', color: '#E6B8B8' },
  { initial: 'J', color: '#F0E68C' },
  { initial: 'P', color: '#B8D4E0' },
  { initial: 'K', color: '#D8B8E8' },
];

const villageContributors = [
  {
    initial: 'C',
    color: '#F5C6AA',
    top: '10px',
    left: '20px',
    bubble: 'Happy birthday Mia! 🎉',
    tiltClassName: styles.scatterTilt1,
  },
  {
    initial: 'M',
    color: '#A8D4E6',
    top: '80px',
    left: '140px',
    bubble: "Can't wait to see her face!",
    tiltClassName: styles.scatterTilt2,
  },
  {
    initial: 'N',
    color: '#B8E0B8',
    top: '20px',
    left: '300px',
    bubble: 'From Nana with love 💕',
    tiltClassName: styles.scatterTilt3,
    faded: true,
  },
  {
    initial: 'T',
    color: '#E6B8B8',
    top: '140px',
    left: '60px',
    bubble: 'Great idea, so easy!',
    tiltClassName: styles.scatterTilt2,
    faded: true,
  },
  {
    initial: 'J',
    color: '#F0E68C',
    top: '160px',
    left: '260px',
    bubble: "She's going to love this 🩰",
    tiltClassName: styles.scatterTilt1,
  },
];

export function LandingHeroExact() {
  return (
    <>
      <section className={styles.heroDream}>
        <div className={styles.heroText}>
          <h1 className={styles.heroHeadline}>
            <span className={styles.heroHeadlineLine1}>One dream gift.</span>
            <em>Everyone chips in.</em>
          </h1>
          <p className={styles.heroTagline}>
            Friends and family each give a little. Your child gets the gift they&apos;ve been
            dreaming of.
          </p>
          <div className={styles.heroStatAnnotation}>
            <span>🎂</span>
            <span>
              <strong>3,400+</strong> gifts funded this year
            </span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.dreamboardCard}>
            <div className={styles.dreamboardHeader}>
              <div className={styles.dreamboardAvatar}>
                <Image
                  src="/images/homepage-exact/mia_avatar.jpg"
                  alt="Mia"
                  fill
                  priority
                  sizes="80px"
                  className={styles.dreamboardAvatarImage}
                />
              </div>
              <div className={styles.dreamboardName}>Mia&apos;s Dreamboard</div>
              <div className={styles.dreamboardMeta}>Turning 6 · March 28th</div>
            </div>

            <div className={styles.dreamboardBody}>
              <div className={styles.dreamboardWish}>
                <div className={styles.dreamboardWishLabel}>✨ MIA&apos;S ONE BIG WISH</div>
                <div className={styles.dreamboardWishRow}>
                  <div className={styles.dreamboardWishIcon}>🎀</div>
                  <div>
                    <div className={styles.dreamboardWishTitle}>Ballet Starter Kit</div>
                    <div className={styles.dreamboardWishDesc}>Shoes, tutu &amp; dance bag</div>
                  </div>
                </div>
              </div>

              <div className={styles.dreamboardStatus}>
                <div className={styles.dreamboardStatusEmoji}>🎁</div>
                <div className={styles.dreamboardStatusText}>Contributions are coming in!</div>
                <div className={styles.dreamboardStatusSub}>18 days left to contribute!</div>
              </div>

              <div className={styles.dreamboardContributors}>
                <div className={styles.dreamboardContributorsLabel}>🎉 7 people have chipped in</div>
                <div className={styles.avatarRow}>
                  {heroContributors.map((contributor, index) => {
                    const style = {
                      background: contributor.color,
                      marginLeft: index === 0 ? 0 : '-8px',
                      zIndex: heroContributors.length - index,
                    } satisfies CSSProperties;

                    return (
                      <div key={contributor.initial} className={styles.contributorAvatar} style={style}>
                        {contributor.initial}
                      </div>
                    );
                  })}
                  <div className={styles.contributorBadge}>+3 today!</div>
                </div>
              </div>

              <button className={styles.dreamboardCtaButton} disabled>
                <span>Chip in for Mia</span>
                <span>💝</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.heroVillage}>
        <div className={styles.villageTestimonial}>
          <blockquote className={styles.villageQuote}>
            &ldquo;My daughter still talks about &lsquo;the present everyone helped with.&rsquo;
            It made her birthday feel so special.&rdquo;
          </blockquote>
          <div className={styles.villageAttribution}>
            <div className={styles.villageAttrDot}>
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
            </div>
            <div>
              <div className={styles.villageAttrName}>Priya N.</div>
              <div className={styles.villageAttrRelation}>Mom of Anaya, 7</div>
            </div>
          </div>
        </div>

        <div className={styles.villageContributors}>
          <svg
            aria-hidden="true"
            className={styles.constellationLines}
            viewBox="0 0 500 260"
            preserveAspectRatio="none"
          >
            <line x1="44" y1="34" x2="164" y2="104" />
            <line x1="164" y1="104" x2="324" y2="44" />
            <line x1="44" y1="34" x2="84" y2="164" />
            <line x1="84" y1="164" x2="284" y2="184" />
            <line x1="324" y1="44" x2="284" y2="184" />
          </svg>

          {villageContributors.map((contributor) => {
            const style = {
              top: contributor.top,
              left: contributor.left,
            } satisfies CSSProperties;

            const avatarClassName = contributor.faded
              ? `${styles.scatterAvatar} ${styles.scatterFaded}`
              : styles.scatterAvatar;

            return (
              <div
                key={`${contributor.initial}-${contributor.top}-${contributor.left}`}
                className={`${styles.scatterPerson} ${contributor.tiltClassName}`}
                style={style}
              >
                <div className={avatarClassName} style={{ background: contributor.color }}>
                  {contributor.initial}
                </div>
                <div className={styles.scatterBubble}>{contributor.bubble}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.heroCtaSection}>
        <Link href="/create" prefetch={false} className={styles.heroCtaButton}>
          Create Your Free Dreamboard
        </Link>
      </section>
    </>
  );
}
