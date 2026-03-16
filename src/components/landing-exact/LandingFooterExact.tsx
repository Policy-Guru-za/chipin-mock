import Image from 'next/image';
import Link from 'next/link';

import styles from './LandingFooterExact.module.css';

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/gifta_za',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/gifta_za',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/gifta_za',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com/@gifta_za',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
  },
];

export function LandingFooterExact() {
  return (
    <footer className={styles.footer}>
      <div>
        <div className={styles.footerLogo}>
          <span className={styles.footerLogoEmoji}>🎁</span>
          <span className={styles.footerLogoText}>Gifta</span>
        </div>
        <div className={styles.footerTagline}>Birthday gifting, simplified.</div>
      </div>

      <div className={styles.footerPartner}>
        <div className={styles.footerPartnerLabel}>Voucher partner</div>
        <Image
          src="/images/homepage-exact/takealot_logo.png"
          alt="Takealot"
          width={512}
          height={512}
          className={styles.footerPartnerLogo}
        />
      </div>

      <div className={styles.footerSocials}>
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.footerSocial}
            aria-label={social.name}
          >
            {social.icon}
          </a>
        ))}
      </div>

      <div className={styles.footerLinks}>
        <Link href="/privacy">Privacy Policy</Link>
        <span className={styles.footerDot}>·</span>
        <Link href="/terms">Terms of Service</Link>
        <span className={styles.footerDot}>·</span>
        <Link href="/popia">POPIA Notice</Link>
        <span className={styles.footerDot}>·</span>
        <Link href="/contact">Contact Us</Link>
      </div>

      <p className={styles.footerCopyright}>© 2026 Gifta (Pty) Ltd. All rights reserved.</p>
    </footer>
  );
}
