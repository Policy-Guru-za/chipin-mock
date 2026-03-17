export type LandingTestimonialItem = {
  quote: string;
  author: string;
  relation: string;
};

export const landingTestimonials: LandingTestimonialItem[] = [
  {
    quote:
      "My daughter still talks about 'the present everyone helped with.' It made her birthday feel so special.",
    author: 'Priya N.',
    relation: 'Mom of Anaya, 7',
  },
  {
    quote:
      'No more wandering toy aisles. Sophie got her telescope, and the look on her face said it all.',
    author: 'Rachel K.',
    relation: 'Mom of Sophie, 8',
  },
  {
    quote:
      'Finally, a birthday where the gift actually mattered. The other parents loved how easy it was to chip in.',
    author: 'James M.',
    relation: 'Dad of twins, 6',
  },
];

export const LANDING_TESTIMONIAL_ROTATION_MS = 8000;
