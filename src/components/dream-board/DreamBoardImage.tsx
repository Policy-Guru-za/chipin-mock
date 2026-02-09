import Image from 'next/image';

import { extractIconIdFromPath, getGiftIconById } from '@/lib/icons/gift-icons';
import { cn } from '@/lib/utils';

type DreamBoardImageProps = {
  src: string;
  alt: string;
  fallbackSrc?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

const defaultFallback = '/images/child-placeholder.svg';

export function DreamBoardImage({
  src,
  alt,
  fallbackSrc = defaultFallback,
  sizes = '(max-width: 768px) 100vw, 112px',
  priority = false,
  className,
  imageClassName,
}: DreamBoardImageProps) {
  const resolvedSrc = src?.trim().length ? src : fallbackSrc;
  const iconMeta = getGiftIconById(extractIconIdFromPath(resolvedSrc) ?? '');

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-2xl bg-stone-100 aspect-square',
        className
      )}
      style={iconMeta ? { backgroundColor: iconMeta.bgColor } : undefined}
    >
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-contain p-2', imageClassName)}
      />
    </div>
  );
}
