/* eslint-disable max-lines -- Curated icon registry is intentionally data-heavy and reviewed as a single source of truth. */

/**
 * All icons share the same six categories. Gendered icons are grouped into
 * the category that best matches the subject.
 */
export type GiftIconCategory =
  | 'active-outdoors'
  | 'creative-arts'
  | 'learning-discovery'
  | 'imaginative-play'
  | 'tech-gaming'
  | 'experiences';

export type GiftIcon = {
  id: string;
  label: string;
  category: GiftIconCategory;
  src: string;
  bgColor: string;
  keywords: readonly string[];
  ageRange: readonly [number, number];
};

export type GiftIconCategoryMeta = {
  id: GiftIconCategory;
  label: string;
  bgColor: string;
};

export const GIFT_ICON_CATEGORIES = [
  { id: 'active-outdoors', label: 'Active & Outdoors', bgColor: '#E8F0E4' },
  { id: 'creative-arts', label: 'Creative & Performing Arts', bgColor: '#F8E8EE' },
  { id: 'learning-discovery', label: 'Learning & Discovery', bgColor: '#E8EAF6' },
  { id: 'imaginative-play', label: 'Imaginative Play', bgColor: '#FFF3E0' },
  { id: 'tech-gaming', label: 'Tech & Gaming', bgColor: '#E0F2F1' },
  { id: 'experiences', label: 'Experiences', bgColor: '#FFF9E6' },
] as const satisfies readonly GiftIconCategoryMeta[];

const CATEGORY_BG_BY_ID = new Map<GiftIconCategory, string>(
  GIFT_ICON_CATEGORIES.map((category) => [category.id, category.bgColor])
);

type IconSeed = {
  id: string;
  label: string;
  category: GiftIconCategory;
  keywords: readonly string[];
  ageRange: readonly [number, number];
};

const createIcon = (seed: IconSeed): GiftIcon => ({
  ...seed,
  src: `/icons/gifts/${seed.id}.png`,
  bgColor: CATEGORY_BG_BY_ID.get(seed.category) ?? '#F5F5F5',
});

export const GIFT_ICONS = [
  // Active & Outdoors
  createIcon({
    id: 'bicycle',
    label: 'Bicycle',
    category: 'active-outdoors',
    keywords: ['bicycle', 'bike', 'cycle', 'cycling', 'pedal', 'bmx', 'balance bike', 'mountain bike'],
    ageRange: [4, 12],
  }),
  createIcon({
    id: 'scooter',
    label: 'Scooter',
    category: 'active-outdoors',
    keywords: ['scooter', 'kick scooter', 'ride', 'wheels', 'outdoor', 'glide', 'deck', 'handlebar'],
    ageRange: [3, 11],
  }),
  createIcon({
    id: 'soccer-ball',
    label: 'Soccer Ball',
    category: 'active-outdoors',
    keywords: ['soccer', 'football', 'ball', 'goal', 'boots', 'kick', 'training', 'sports'],
    ageRange: [4, 16],
  }),
  createIcon({
    id: 'skateboard',
    label: 'Skateboard',
    category: 'active-outdoors',
    keywords: ['skateboard', 'skate', 'deck', 'trick', 'wheels', 'ramp', 'street', 'board'],
    ageRange: [7, 17],
  }),
  createIcon({
    id: 'swimming',
    label: 'Swimming',
    category: 'active-outdoors',
    keywords: ['swimming', 'goggles', 'swim', 'pool', 'water', 'lessons', 'lane', 'diving'],
    ageRange: [4, 14],
  }),
  createIcon({
    id: 'dinosaur',
    label: 'Dinosaur',
    category: 'active-outdoors',
    keywords: ['dinosaur', 'dino', 'trex', 'jurassic', 'prehistoric', 'roar', 'fossil', 'monster'],
    ageRange: [2, 10],
  }),
  createIcon({
    id: 'race-car',
    label: 'Race Car',
    category: 'active-outdoors',
    keywords: ['race car', 'car', 'racing', 'speed', 'formula', 'wheels', 'driver', 'motor'],
    ageRange: [3, 12],
  }),
  createIcon({
    id: 'basketball',
    label: 'Basketball',
    category: 'active-outdoors',
    keywords: ['basketball', 'hoops', 'ball', 'court', 'dribble', 'nba', 'sports', 'net'],
    ageRange: [5, 17],
  }),
  createIcon({
    id: 'fishing',
    label: 'Fishing',
    category: 'active-outdoors',
    keywords: ['fishing', 'rod', 'reel', 'angler', 'bait', 'lake', 'river', 'outdoor'],
    ageRange: [6, 16],
  }),
  createIcon({
    id: 'cricket',
    label: 'Cricket',
    category: 'active-outdoors',
    keywords: ['cricket', 'bat', 'ball', 'wicket', 'innings', 'sports', 'match', 'field'],
    ageRange: [6, 17],
  }),
  createIcon({
    id: 'rugby',
    label: 'Rugby',
    category: 'active-outdoors',
    keywords: ['rugby', 'rugby ball', 'tackle', 'try', 'sports', 'field', 'match', 'team'],
    ageRange: [8, 18],
  }),
  createIcon({
    id: 'bow-and-arrow',
    label: 'Bow and Arrow',
    category: 'active-outdoors',
    keywords: ['bow', 'arrow', 'archery', 'target', 'aim', 'quiver', 'outdoor', 'sport'],
    ageRange: [7, 16],
  }),
  createIcon({
    id: 'martial-arts',
    label: 'Martial Arts',
    category: 'active-outdoors',
    keywords: ['martial arts', 'karate', 'judo', 'taekwondo', 'dojo', 'uniform', 'belt', 'training'],
    ageRange: [5, 16],
  }),
  createIcon({
    id: 'ice-skates',
    label: 'Ice Skates',
    category: 'active-outdoors',
    keywords: ['ice skate', 'skating', 'rink', 'ice', 'blades', 'winter', 'figure skate', 'sport'],
    ageRange: [6, 16],
  }),

  // Creative & Performing Arts
  createIcon({
    id: 'ballet',
    label: 'Ballet',
    category: 'creative-arts',
    keywords: ['ballet', 'dance', 'ballerina', 'tutu', 'pointe', 'shoes', 'studio', 'recital'],
    ageRange: [3, 13],
  }),
  createIcon({
    id: 'paint-palette',
    label: 'Paint Palette',
    category: 'creative-arts',
    keywords: ['paint', 'palette', 'art', 'brush', 'drawing', 'colour', 'artist', 'canvas'],
    ageRange: [3, 15],
  }),
  createIcon({
    id: 'guitar',
    label: 'Guitar',
    category: 'creative-arts',
    keywords: ['guitar', 'music', 'instrument', 'acoustic', 'strum', 'song', 'band', 'lessons'],
    ageRange: [6, 18],
  }),
  createIcon({
    id: 'microphone',
    label: 'Microphone',
    category: 'creative-arts',
    keywords: ['microphone', 'sing', 'karaoke', 'music', 'performance', 'stage', 'voice', 'show'],
    ageRange: [4, 17],
  }),
  createIcon({
    id: 'camera',
    label: 'Camera',
    category: 'creative-arts',
    keywords: ['camera', 'photo', 'photography', 'pictures', 'lens', 'video', 'creator', 'shoot'],
    ageRange: [7, 18],
  }),
  createIcon({
    id: 'nail-polish',
    label: 'Nail Polish',
    category: 'creative-arts',
    keywords: ['nail polish', 'nails', 'beauty', 'spa', 'manicure', 'colour', 'makeover', 'style'],
    ageRange: [6, 16],
  }),
  createIcon({
    id: 'butterfly',
    label: 'Butterfly',
    category: 'creative-arts',
    keywords: ['butterfly', 'wings', 'costume', 'dress up', 'sparkle', 'garden', 'fairy', 'creative'],
    ageRange: [3, 11],
  }),
  createIcon({
    id: 'ribbon',
    label: 'Ribbon',
    category: 'creative-arts',
    keywords: ['ribbon', 'hair bow', 'accessories', 'bow', 'style', 'craft', 'gift set', 'hair'],
    ageRange: [3, 12],
  }),
  createIcon({
    id: 'dress',
    label: 'Dress',
    category: 'creative-arts',
    keywords: ['dress', 'fashion', 'outfit', 'clothes', 'style', 'party dress', 'wardrobe', 'design'],
    ageRange: [4, 14],
  }),
  createIcon({
    id: 'lipstick',
    label: 'Lipstick',
    category: 'creative-arts',
    keywords: ['lipstick', 'makeup', 'beauty', 'cosmetics', 'dress up', 'style', 'play set', 'glam'],
    ageRange: [7, 17],
  }),

  // Learning & Discovery
  createIcon({
    id: 'books',
    label: 'Books',
    category: 'learning-discovery',
    keywords: ['books', 'reading', 'storybook', 'library', 'learn', 'novel', 'education', 'literacy'],
    ageRange: [3, 16],
  }),
  createIcon({
    id: 'telescope',
    label: 'Telescope',
    category: 'learning-discovery',
    keywords: ['telescope', 'space', 'stars', 'astronomy', 'moon', 'science', 'observe', 'planet'],
    ageRange: [6, 16],
  }),
  createIcon({
    id: 'microscope',
    label: 'Microscope',
    category: 'learning-discovery',
    keywords: ['microscope', 'science', 'lab', 'experiment', 'biology', 'discovery', 'stem', 'study'],
    ageRange: [7, 16],
  }),
  createIcon({
    id: 'building-blocks',
    label: 'Building Blocks',
    category: 'learning-discovery',
    keywords: ['blocks', 'building blocks', 'lego', 'bricks', 'stack', 'construct', 'builder', 'learning'],
    ageRange: [2, 9],
  }),
  createIcon({
    id: 'globe',
    label: 'Globe',
    category: 'learning-discovery',
    keywords: ['globe', 'world', 'geography', 'countries', 'map', 'earth', 'travel', 'learning'],
    ageRange: [5, 14],
  }),
  createIcon({
    id: 'rocket',
    label: 'Rocket',
    category: 'learning-discovery',
    keywords: ['rocket', 'space', 'astronaut', 'launch', 'planet', 'science', 'galaxy', 'ship'],
    ageRange: [4, 14],
  }),
  createIcon({
    id: 'toolbox',
    label: 'Toolbox',
    category: 'learning-discovery',
    keywords: ['toolbox', 'tools', 'build', 'repair', 'hammer', 'screwdriver', 'kit', 'maker'],
    ageRange: [6, 15],
  }),
  createIcon({
    id: 'mermaid',
    label: 'Mermaid',
    category: 'learning-discovery',
    keywords: ['mermaid', 'ocean', 'sea', 'underwater', 'tail', 'fantasy', 'costume', 'dress up'],
    ageRange: [4, 12],
  }),
  createIcon({
    id: 'crystal-ball',
    label: 'Crystal Ball',
    category: 'learning-discovery',
    keywords: ['crystal ball', 'magic', 'fortune', 'sparkle', 'mystic', 'fantasy', 'play set', 'jewelry'],
    ageRange: [7, 15],
  }),

  // Imaginative Play
  createIcon({
    id: 'teddy-bear',
    label: 'Teddy Bear',
    category: 'imaginative-play',
    keywords: ['teddy', 'bear', 'plush', 'soft toy', 'cuddly', 'stuffed animal', 'comfort', 'bedtime'],
    ageRange: [1, 8],
  }),
  createIcon({
    id: 'dollhouse',
    label: 'Dollhouse',
    category: 'imaginative-play',
    keywords: ['dollhouse', 'dolls', 'mini house', 'pretend play', 'play set', 'rooms', 'furniture', 'toy house'],
    ageRange: [3, 10],
  }),
  createIcon({
    id: 'superhero-cape',
    label: 'Superhero Cape',
    category: 'imaginative-play',
    keywords: ['superhero', 'cape', 'hero', 'costume', 'dress up', 'powers', 'adventure', 'pretend'],
    ageRange: [3, 11],
  }),
  createIcon({
    id: 'castle',
    label: 'Castle',
    category: 'imaginative-play',
    keywords: ['castle', 'kingdom', 'fort', 'knight', 'princess', 'toy castle', 'fantasy', 'play set'],
    ageRange: [3, 10],
  }),
  createIcon({
    id: 'pirate-ship',
    label: 'Pirate Ship',
    category: 'imaginative-play',
    keywords: ['pirate ship', 'pirate', 'ship', 'treasure', 'adventure', 'captain', 'sea', 'toy boat'],
    ageRange: [4, 11],
  }),
  createIcon({
    id: 'train',
    label: 'Train',
    category: 'imaginative-play',
    keywords: ['train', 'locomotive', 'railway', 'track', 'toy train', 'engine', 'station', 'carriages'],
    ageRange: [2, 10],
  }),
  createIcon({
    id: 'detective',
    label: 'Detective',
    category: 'imaginative-play',
    keywords: ['detective', 'spy', 'magnifier', 'mystery', 'agent', 'investigation', 'clues', 'pretend'],
    ageRange: [6, 13],
  }),
  createIcon({
    id: 'princess-crown',
    label: 'Princess Crown',
    category: 'imaginative-play',
    keywords: ['princess', 'crown', 'tiara', 'royal', 'dress up', 'kingdom', 'costume', 'fairytale'],
    ageRange: [3, 11],
  }),
  createIcon({
    id: 'unicorn',
    label: 'Unicorn',
    category: 'imaginative-play',
    keywords: ['unicorn', 'magic', 'rainbow', 'fantasy', 'pony', 'sparkle', 'mythical', 'toy'],
    ageRange: [3, 11],
  }),
  createIcon({
    id: 'fairy',
    label: 'Fairy',
    category: 'imaginative-play',
    keywords: ['fairy', 'wand', 'wings', 'magic', 'dress up', 'sparkle', 'costume', 'fantasy'],
    ageRange: [3, 11],
  }),
  createIcon({
    id: 'rainbow',
    label: 'Rainbow',
    category: 'imaginative-play',
    keywords: ['rainbow', 'colourful', 'magic', 'decor', 'playroom', 'happy', 'pastel', 'fantasy'],
    ageRange: [2, 9],
  }),

  // Tech & Gaming
  createIcon({
    id: 'tablet',
    label: 'Tablet',
    category: 'tech-gaming',
    keywords: ['tablet', 'ipad', 'device', 'screen', 'learning app', 'games', 'tech', 'laptop'],
    ageRange: [6, 18],
  }),
  createIcon({
    id: 'game-controller',
    label: 'Game Controller',
    category: 'tech-gaming',
    keywords: ['game controller', 'controller', 'playstation', 'xbox', 'gaming', 'console', 'video game', 'joystick'],
    ageRange: [7, 18],
  }),
  createIcon({
    id: 'headphones',
    label: 'Headphones',
    category: 'tech-gaming',
    keywords: ['headphones', 'music', 'audio', 'earphones', 'wireless', 'gaming headset', 'sound', 'listen'],
    ageRange: [9, 18],
  }),
  createIcon({
    id: 'robot',
    label: 'Robot',
    category: 'tech-gaming',
    keywords: ['robot', 'bot', 'coding', 'tech toy', 'stem', 'electronics', 'smart toy', 'automation'],
    ageRange: [5, 14],
  }),
  createIcon({
    id: 'drone',
    label: 'Drone',
    category: 'tech-gaming',
    keywords: ['drone', 'flying', 'remote control', 'rc', 'quadcopter', 'camera drone', 'tech', 'aerial'],
    ageRange: [9, 18],
  }),
  createIcon({
    id: 'joystick',
    label: 'Joystick',
    category: 'tech-gaming',
    keywords: ['joystick', 'arcade', 'gaming', 'retro game', 'controller', 'video game', 'console', 'play'],
    ageRange: [8, 18],
  }),

  // Experiences
  createIcon({
    id: 'amusement-park',
    label: 'Amusement Park',
    category: 'experiences',
    keywords: ['amusement park', 'theme park', 'ferris wheel', 'rides', 'tickets', 'funfair', 'experience', 'day out'],
    ageRange: [3, 16],
  }),
  createIcon({
    id: 'camping',
    label: 'Camping',
    category: 'experiences',
    keywords: ['camping', 'tent', 'outdoors', 'nature', 'camp', 'adventure', 'hiking', 'sleeping bag'],
    ageRange: [5, 16],
  }),
  createIcon({
    id: 'plane-ticket',
    label: 'Plane Ticket',
    category: 'experiences',
    keywords: ['plane', 'airplane', 'flight', 'travel', 'trip', 'holiday', 'ticket', 'vacation'],
    ageRange: [3, 18],
  }),
  createIcon({
    id: 'zoo',
    label: 'Zoo',
    category: 'experiences',
    keywords: ['zoo', 'animals', 'lion', 'safari', 'visit', 'tickets', 'day trip', 'wildlife'],
    ageRange: [2, 14],
  }),
  createIcon({
    id: 'movie',
    label: 'Movie',
    category: 'experiences',
    keywords: ['movie', 'cinema', 'film', 'tickets', 'popcorn', 'screening', 'clapperboard', 'theater'],
    ageRange: [5, 18],
  }),
  createIcon({
    id: 'trophy',
    label: 'Trophy',
    category: 'experiences',
    keywords: ['trophy', 'award', 'winner', 'prize', 'champion', 'sports day', 'competition', 'medal'],
    ageRange: [5, 18],
  }),
  createIcon({
    id: 'compass',
    label: 'Compass',
    category: 'experiences',
    keywords: ['compass', 'explorer', 'adventure', 'navigation', 'camp', 'hiking', 'scout', 'travel'],
    ageRange: [6, 16],
  }),
  createIcon({
    id: 'handbag',
    label: 'Handbag',
    category: 'experiences',
    keywords: ['handbag', 'bag', 'fashion', 'accessory', 'style', 'purse', 'outfit', 'dress up'],
    ageRange: [6, 16],
  }),
  createIcon({
    id: 'flower',
    label: 'Flower',
    category: 'experiences',
    keywords: ['flower', 'bouquet', 'garden', 'nature', 'plants', 'floral', 'grow', 'gift set'],
    ageRange: [3, 15],
  }),
  createIcon({
    id: 'cupcake',
    label: 'Cupcake',
    category: 'experiences',
    keywords: ['cupcake', 'baking', 'kitchen', 'treat', 'dessert', 'cake', 'cook', 'recipe'],
    ageRange: [4, 15],
  }),
] as const satisfies readonly GiftIcon[];

const GIFT_ICON_BY_ID = new Map<string, GiftIcon>(GIFT_ICONS.map((icon) => [icon.id, icon]));

const ICON_PATH_PATTERN = /^\/icons\/gifts\/([a-z0-9-]+)\.png$/;
const ABSOLUTE_HTTP_PATTERN = /^https?:\/\//i;

export const getGiftIconById = (id: string): GiftIcon | undefined => GIFT_ICON_BY_ID.get(id);

export const getIconsByCategory = (category: GiftIconCategory): GiftIcon[] =>
  GIFT_ICONS.filter((icon) => icon.category === category);

export const isValidGiftIconId = (id: string): boolean => GIFT_ICON_BY_ID.has(id);

export const extractIconIdFromPath = (value: string): string | undefined => {
  if (!value) return undefined;

  let path = value;
  try {
    path = new URL(value).pathname;
  } catch {
    path = value;
  }

  const match = path.match(ICON_PATH_PATTERN);
  return match?.[1];
};

const ensureAbsoluteUrl = (value: string, baseUrl: string) => {
  if (!value) return value;

  if (ABSOLUTE_HTTP_PATTERN.test(value)) {
    return value;
  }

  const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const normalizedPath = value.startsWith('/') ? value.slice(1) : value;
  return new URL(normalizedPath, normalizedBase).toString();
};

export const toAbsoluteGiftImageUrl = (value: string, baseUrl: string): string => {
  if (!value) return value;

  const iconId = extractIconIdFromPath(value);
  if (iconId) {
    const icon = getGiftIconById(iconId);
    const iconPath = icon?.src ?? value;
    return ensureAbsoluteUrl(iconPath, baseUrl);
  }

  return ensureAbsoluteUrl(value, baseUrl);
};
