export const contributors = [
  { name: 'Claire', color: '#F5C6AA' },
  { name: 'Mark', color: '#A8D4E6' },
  { name: 'Nana', color: '#B8E0B8' },
  { name: 'Tom', color: '#E6B8B8' },
  { name: 'Jess', color: '#F0E68C' },
  { name: 'Paul', color: '#B8D4E0' },
  { name: 'Kate', color: '#D8B8E8' },
];

export const testimonials = [
  {
    quote:
      "No more wandering toy aisles wondering if they already have it. Sophie got her telescope and the look on her face was everything.",
    author: 'Rachel K.',
    relation: 'Mom of Sophie, 8',
  },
  {
    quote:
      "Finally, a birthday where the gift actually mattered. The other parents loved how easy it was to chip in.",
    author: 'James M.',
    relation: 'Dad of twins, 6',
  },
  {
    quote:
      "My daughter still talks about 'the birthday everyone helped with.' It made the gift feel so special.",
    author: 'Priya N.',
    relation: 'Mom of Anaya, 7',
  },
];

export const trustItems = [
  { icon: '🏦', text: 'Payouts via Karri Card' },
  { icon: '🔒', text: 'Secure payments' },
  { icon: '📱', text: 'Share via WhatsApp' },
];

export const navLinks = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Trust & safety', href: '#trust' },
];

export const TIMING = {
  TESTIMONIAL_ROTATION: 5000,
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
      'Funds land straight on your Karri Card. Go buy the dream gift — magic made together.',
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

export const howItWorksCTA = {
  label: 'Start a Dreamboard',
  subtitle: 'Free to create · No app needed',
  href: '/create',
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
