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

/* ------------------------------------------------------------------ */
/*  Giving Back — v6 redesign data                                     */
/* ------------------------------------------------------------------ */

export const givingBackCharities = [
  {
    name: 'Reach for a Dream',
    tag: 'Children with chronic illnesses',
    logoUrl:
      'https://reachforadream.org.za/wp-content/uploads/2025/03/reach-for-a-dream-logo.svg',
    logoBg: '#f3eef9',
  },
  {
    name: 'CHOC',
    tag: 'Cancer research & support',
    logoUrl:
      'https://choc.org.za/wp-content/uploads/2019/07/choc-logo-200px.png',
    logoBg: '#e8f1f9',
  },
  {
    name: 'Cotlands',
    tag: 'Early childhood development',
    logoUrl:
      'https://cdn.brandfetch.io/idsAaqKEre/w/400/h/400/theme/dark/icon.jpeg',
    logoBg: '#fef4e8',
  },
  {
    name: 'Ladles of Love',
    tag: 'Feeding the hungry daily',
    logoUrl:
      'https://ladlesoflove.org.za/wp-content/uploads/2022/03/LadlesOfLove-logofullcolour.png',
    logoBg: '#fdedef',
  },
  {
    name: 'Afrika Tikkun',
    tag: 'Youth development & education',
    logoUrl:
      'https://afrikatikkun.com/wp-content/uploads/2024/01/Mian-Logo.png',
    logoBg: '#e8ecf9',
  },
  {
    name: 'DARG',
    tag: 'Domestic animal rescue',
    logoUrl:
      'https://cdn.brandfetch.io/idgm5KhPzP/w/117/h/118/theme/dark/logo.png',
    logoBg: '#e8eff9',
  },
  {
    name: 'Cape SPCA',
    tag: 'Animal welfare & protection',
    logoUrl:
      'https://capespca.co.za/wp-content/uploads/2024/06/Flat-design-logo.png',
    logoBg: '#e8f6f7',
  },
];

export const givingBackDemo = {
  childName: 'Mia',
  childAge: 'Turning 6',
  childDate: 'March 28th',
  setupStep: 'Setting up · Step 4 of 5',
  giftName: 'Ballet Starter Kit',
  giftDescription: 'Shoes, tutu & dance bag',
  giftEmoji: '🎀',
  selectedCharity: 'Reach for a Dream',
  selectedCharityTag: 'Children with chronic illnesses',
  selectedCharityLogo:
    'https://reachforadream.org.za/wp-content/uploads/2025/03/reach-for-a-dream-logo.svg',
  percentageOptions: [5, 10, 15, 20],
  activePercentage: 20,
  exampleContribution: 200,
};

export const givingBackHowItWorks = [
  {
    emoji: '💜',
    title: 'Host decides',
    description:
      'Pick a charity and choose what % of each contribution to share',
    bgClass: 'bg-[rgba(126,107,155,0.1)]',
  },
  {
    emoji: '🤝',
    title: 'Guests see it all',
    description:
      'Full transparency — every rand accounted for before they chip in',
    bgClass: 'bg-[rgba(107,158,136,0.1)]',
  },
  {
    emoji: '🎉',
    title: 'Double the joy',
    description:
      'A birthday gift and a good deed, all in one contribution',
    bgClass: 'bg-[rgba(196,120,90,0.08)]',
  },
];
