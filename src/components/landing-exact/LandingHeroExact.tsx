import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { LandingHeroTestimonialRotator } from './LandingHeroTestimonialRotator';
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

interface LandingHeroExactBlockProps {
  className?: string;
}

function VillageContributors({ className }: LandingHeroExactBlockProps) {
  const contributorsClassName = [styles.villageContributors, className].filter(Boolean).join(' ');

  return (
    <div className={contributorsClassName}>
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
  );
}

function HeroCreateCta({ className }: LandingHeroExactBlockProps) {
  const ctaSectionClassName = [styles.heroCtaSection, className].filter(Boolean).join(' ');

  return (
    <div className={ctaSectionClassName}>
      <Link href="/create" prefetch={false} className={styles.heroCtaButton}>
        Create Your Free Dreamboard
      </Link>
    </div>
  );
}

export function LandingHeroExact() {
  return (
    <section className={styles.heroDream}>
      <div className={styles.heroLeftRail}>
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
        <LandingHeroTestimonialRotator />
        <HeroCreateCta />
      </div>

      <div className={styles.heroRightRail}>
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
        <VillageContributors />
      </div>
    </section>
  );
}
