import Image from 'next/image';

import type { GuestViewModel } from '@/lib/dream-boards/view-model';

type HeroStripProps = {
  view: GuestViewModel;
  ageLine: string;
  partyDateTimeLine: string | null;
};

const getChildInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export function HeroStrip({ view, ageLine, partyDateTimeLine }: HeroStripProps) {
  return (
    <header className="rounded-[28px] border border-border-warmth bg-gradient-to-b from-sage-light to-sage-wash px-5 py-6 shadow-card sm:px-8 sm:py-7">
      <div className="mx-auto flex max-w-[1000px] items-center gap-4 sm:gap-5">
        <div className="relative h-[76px] w-[76px] flex-none overflow-hidden rounded-full border-4 border-white shadow-[0_10px_28px_rgba(74,126,102,0.2)]">
          {view.childPhotoUrl ? (
            <Image
              src={view.childPhotoUrl}
              alt={`${view.childName}'s photo`}
              fill
              sizes="76px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-sage-light text-2xl font-semibold text-sage-deep">
              {getChildInitials(view.childName)}
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="font-warmth-serif text-[1.75rem] leading-tight text-ink [overflow-wrap:anywhere] sm:text-[2.1rem]">
            <em className="text-sage not-italic">{view.childName}&apos;s</em> Dreamboard
          </h1>
          <p className="mt-1.5 font-warmth-sans text-[13.5px] text-ink-soft">{ageLine}</p>
          {partyDateTimeLine ? (
            <p className="mt-1 font-warmth-sans text-[13.5px] text-ink-soft">{partyDateTimeLine}</p>
          ) : null}
        </div>
      </div>
    </header>
  );
}
