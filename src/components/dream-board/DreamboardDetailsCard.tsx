import { CalendarIcon, MapPinIcon } from '@/components/icons/dreamboard-icons';

type DreamboardDetailsCardProps = {
  partyDateTimeLine: string | null;
};

export function DreamboardDetailsCard({ partyDateTimeLine }: DreamboardDetailsCardProps) {
  return (
    <section className="rounded-[20px] border border-border-soft bg-white shadow-card">
      <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
        <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sage-wash text-sage">
          <CalendarIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-warmth-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Birthday Party
          </p>
          <p className="mt-1 font-warmth-sans text-sm text-ink">
            {partyDateTimeLine ?? 'Date and time to be confirmed'}
          </p>
        </div>
      </div>
      <div className="border-t border-border-soft" />
      <div className="flex items-start gap-3 px-5 py-4 sm:px-6">
        <span className="mt-0.5 inline-flex h-8 w-8 flex-none items-center justify-center rounded-full bg-sage-wash text-sage">
          <MapPinIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="font-warmth-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
            Location
          </p>
          <p className="mt-1 font-warmth-sans text-sm text-ink">Shared after you chip in</p>
        </div>
      </div>
    </section>
  );
}
