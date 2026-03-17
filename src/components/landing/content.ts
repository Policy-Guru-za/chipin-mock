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
  { icon: '🏦', text: 'Voucher-ready fulfilment' },
  { icon: '🔒', text: 'Secure payments' },
  { icon: '📱', text: 'Share via WhatsApp' },
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
      "Pick the dream gift, set your goal — you're live and sharing in under a minute. No app download needed.",
    gradientFrom: '#6B9E88',
    gradientTo: '#5A8E78',
    theme: 'light' as const,
  },
  {
    stepLabel: 'Step two',
    title: 'Share via WhatsApp',
    description:
      'Drop it in the group chat. Friends and family chip in any amount — no awkward "who\'s paying?" conversations.',
    gradientFrom: '#E8D5BD',
    gradientTo: '#D4B896',
    theme: 'dark' as const,
  },
  {
    stepLabel: 'Step three',
    title: 'Gift funded!',
    description:
      'Voucher details stay on file, so the host is ready when the Dreamboard closes.',
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
