import Link from 'next/link';
import { trustItems, socialLinks } from './content';

function InstagramIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

const socialIcons: Record<string, React.ReactNode> = {
  Instagram: <InstagramIcon />,
  Facebook: <FacebookIcon />,
  LinkedIn: <LinkedInIcon />,
  TikTok: <TikTokIcon />,
};

export function LandingFooter() {
  return (
    <footer
      id="trust"
      className="relative px-5 py-10 md:px-10 md:py-12 bg-gradient-to-b from-transparent to-[rgba(255,252,249,0.95)] flex flex-col items-center gap-6"
    >
      <div className="text-center">
        <div
          className="text-[22px] font-bold text-[#3D3D3D] flex items-center justify-center gap-2 mb-1.5"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <span className="text-xl">🎁</span>
          <span>Gifta</span>
        </div>
        <p className="text-[13px] text-[#999] font-medium">
          Birthday gifting, simplified.
        </p>
      </div>

      <div className="flex items-center gap-4">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-full text-[#888] bg-black/[0.03] transition-all hover:text-[#5A8E78] hover:bg-[rgba(107,158,136,0.1)] hover:-translate-y-0.5"
            aria-label={social.name}
          >
            {socialIcons[social.name]}
          </a>
        ))}
      </div>

      <div className="flex flex-wrap justify-center gap-4 md:gap-8">
        {trustItems.map((item) => (
          <span key={item.text} className="text-[#AAA] text-xs md:text-[13px] whitespace-nowrap">
            {item.icon} {item.text}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap justify-center items-center gap-2 text-[13px]">
        <Link href="/privacy" className="text-[#999] no-underline transition-colors hover:text-[#5A8E78]">
          Privacy Policy
        </Link>
        <span className="text-[#CCC]">·</span>
        <Link href="/terms" className="text-[#999] no-underline transition-colors hover:text-[#5A8E78]">
          Terms of Service
        </Link>
        <span className="text-[#CCC]">·</span>
        <Link href="/popia" className="text-[#999] no-underline transition-colors hover:text-[#5A8E78]">
          POPIA Notice
        </Link>
        <span className="text-[#CCC]">·</span>
        <Link href="/contact" className="text-[#999] no-underline transition-colors hover:text-[#5A8E78]">
          Contact Us
        </Link>
      </div>

      <p className="text-xs text-[#BBB] text-center">
        © {new Date().getFullYear()} Gifta (Pty) Ltd. All rights reserved.
      </p>
    </footer>
  );
}
