import {
  createHomepageSocialImage,
  HOMEPAGE_SOCIAL_IMAGE_ALT,
  HOMEPAGE_SOCIAL_IMAGE_CONTENT_TYPE,
  HOMEPAGE_SOCIAL_IMAGE_SIZE,
} from '@/lib/metadata/homepage-social-image';

export const runtime = 'nodejs';
export const alt = HOMEPAGE_SOCIAL_IMAGE_ALT;
export const size = HOMEPAGE_SOCIAL_IMAGE_SIZE;
export const contentType = HOMEPAGE_SOCIAL_IMAGE_CONTENT_TYPE;

export default async function Image() {
  return createHomepageSocialImage();
}
