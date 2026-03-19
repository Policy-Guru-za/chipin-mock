export const contributors = [
  { name: 'Claire', color: '#F5C6AA' },
  { name: 'Mark', color: '#A8D4E6' },
  { name: 'Nana', color: '#B8E0B8' },
  { name: 'Tom', color: '#E6B8B8' },
  { name: 'Jess', color: '#F0E68C' },
  { name: 'Paul', color: '#B8D4E0' },
  { name: 'Kate', color: '#D8B8E8' },
];

export const trustItems = [
  { icon: '🏦', text: 'Direct bank payouts' },
  { icon: '💳', text: 'Karri Card option' },
  { icon: '⚡', text: 'Superpowered by Stitch' },
];

export const navLinks: Array<{ label: string; href: string }> = [];

export const TIMING = {
  CONTRIBUTOR_PULSE: 800,
  PROGRESS_DELAY: 1000,
};

export const DEMO_DATA = {
  PROGRESS_TARGET: 82,
};

export const howItWorksSteps = [
  {
    stepLabel: 'Step one',
    title: 'Create a Dreamboard',
    description:
      "Let everyone know what you're raising for — share your Dreamboard and start collecting contributions.",
    gradientFrom: '#6B9E88',
    gradientTo: '#5A8E78',
    theme: 'light' as const,
  },
  {
    stepLabel: 'Step two',
    title: 'Share via WhatsApp',
    description:
      'Drop it in the group chat. Friends and family chip in any amount — turning little contributions into one big gift.',
    gradientFrom: '#E8D5BD',
    gradientTo: '#D4B896',
    theme: 'dark' as const,
  },
  {
    stepLabel: 'Step three',
    title: 'Funds paid out securely',
    description:
      'Funds are paid directly to the host parent’s bank account, or to the birthday child’s Karri Card when available.',
    gradientFrom: '#C4785A',
    gradientTo: '#B06A4A',
    theme: 'light' as const,
  },
];

export const howItWorksSocialProof = {
  stat: '2.4k+',
  unit: 'Gifts',
  text: 'Families across South Africa are already making gift-giving magic together',
};

export const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/gifta_za',
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/gifta_za',
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/gifta_za',
  },
  {
    name: 'TikTok',
    url: 'https://tiktok.com/@gifta_za',
  },
];
