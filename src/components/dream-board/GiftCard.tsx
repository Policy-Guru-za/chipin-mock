import type { GuestViewModel } from '@/lib/dream-boards/view-model';
import { extractIconIdFromPath, getGiftIconById } from '@/lib/icons/gift-icons';

import { ChatBubbleIcon } from '@/components/icons/dreamboard-icons';

type GiftCardProps = {
  view: GuestViewModel;
};

const categoryEmoji: Record<string, string> = {
  'active-outdoors': '⚽',
  'creative-arts': '🎨',
  'learning-discovery': '🚀',
  'imaginative-play': '🧸',
  'tech-gaming': '🎮',
  experiences: '🎉',
};

export function GiftCard({ view }: GiftCardProps) {
  const iconMeta = getGiftIconById(extractIconIdFromPath(view.giftImage ?? '') ?? '');
  const giftEmoji = iconMeta ? (categoryEmoji[iconMeta.category] ?? '🎁') : '🎁';

  return (
    <section className="overflow-hidden rounded-[28px] border border-border-soft bg-white shadow-card">
      <div className="flex min-h-[190px] items-center justify-center bg-gradient-to-br from-plum-soft via-plum-wash to-amber-glow px-6 py-8">
        <span aria-hidden="true" className="text-[4.75rem] leading-none">
          {giftEmoji}
        </span>
      </div>
      <div className="space-y-4 px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
        <p className="font-warmth-sans text-[11px] font-semibold uppercase tracking-[0.13em] text-amber">
          ✦ {view.childName.toUpperCase()}&apos;S ONE BIG WISH
        </p>
        <h2 className="font-warmth-serif text-[1.75rem] leading-tight text-ink [overflow-wrap:anywhere]">
          {view.giftTitle}
        </h2>
        {view.giftSubtitle ? (
          <p className="font-warmth-sans text-[0.95rem] text-ink-mid [overflow-wrap:anywhere]">
            {view.giftSubtitle}
          </p>
        ) : null}
        {view.message ? (
          <div className="rounded-[20px] border border-amber-glow bg-amber-light px-4 py-3.5">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-white text-amber">
                <ChatBubbleIcon className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="font-warmth-serif text-sm italic text-ink-soft">
                  A message from {view.childName}:
                </p>
                <p className="font-warmth-sans text-sm leading-relaxed text-ink [overflow-wrap:anywhere]">
                  {view.message}
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
