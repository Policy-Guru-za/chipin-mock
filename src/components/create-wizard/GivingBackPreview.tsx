'use client';

type SplitType = 'percentage' | 'threshold';

type PreviewCharity = {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string | null;
};

export interface GivingBackPreviewProps {
  charityEnabled: boolean;
  selectedCharity: PreviewCharity | null;
  splitType: SplitType;
  percentage: number;
  thresholdAmount: number;
  childName?: string;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatRands = (amount: number) => `R${Math.round(amount).toLocaleString('en-ZA')}`;

export function GivingBackPreview({
  charityEnabled,
  selectedCharity,
  splitType,
  percentage,
  thresholdAmount,
  childName,
}: GivingBackPreviewProps) {
  const charityPortion = charityEnabled
    ? splitType === 'percentage'
      ? clamp(Math.round(percentage), 0, 100)
      : clamp(Math.round(thresholdAmount), 0, 100)
    : 0;

  const giftPortion = clamp(100 - charityPortion, 0, 100);
  const charityPerHundred = charityPortion;
  const giftPerHundred = giftPortion;

  const giftLabel = childName?.trim() ? `${childName.trim()}'s dream gift` : "your child's dream gift";
  const charityLabel = selectedCharity?.name ?? 'the selected charity';

  return (
    <div className="flex w-full flex-col items-center gap-4 rounded-[20px] border border-[var(--border)] bg-[var(--bg)] p-7 text-center">
      <div className="w-full">
        <div className="mb-3 h-3 w-full overflow-hidden rounded-md bg-border">
          <div className="flex h-full w-full">
            <div
              className="flex h-full items-center justify-end bg-sage pr-2 text-[10px] font-semibold text-white"
              style={{ width: `${giftPortion}%` }}
            >
              {giftPortion > 15 ? 'Gift' : null}
            </div>
            <div
              className="flex h-full items-center justify-start bg-plum pl-2 text-[10px] font-semibold text-white"
              style={{ width: `${charityPortion}%` }}
            >
              {charityPortion > 15 ? 'Charity' : null}
            </div>
          </div>
        </div>

        <div className="space-y-2 text-left">
          <div className="flex items-center gap-3 text-[13px] text-ink">
            <span className="h-2 w-2 shrink-0 rounded-full bg-sage" />
            <span>Gift portion: {giftPortion}%</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-ink">
            <span className="h-2 w-2 shrink-0 rounded-full bg-plum" />
            <span>Charity portion: {charityPortion}%</span>
          </div>
        </div>
      </div>

      <div className="h-px w-full bg-border" />

      {charityEnabled ? (
        selectedCharity ? (
          <div className="w-full rounded-xl border border-plum-soft bg-plum-wash p-4 text-left">
            <p className="text-[13px] font-semibold text-plum">{selectedCharity.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-soft">{selectedCharity.description}</p>
          </div>
        ) : (
          <div className="w-full rounded-xl border border-plum-soft bg-plum-wash p-4 text-left text-xs text-ink-soft">
            Select a charity to preview where the impact will go.
          </div>
        )
      ) : (
        <p className="w-full rounded-xl border border-sage-light bg-sage-wash px-4 py-3 text-left text-sm text-sage-deep">
          All contributions go to the dream gift.
        </p>
      )}

      <div className="w-full rounded-xl border border-sage-light bg-sage-wash p-4 text-left">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-ink-soft">
          For every R100 contributed:
        </p>
        <div className="space-y-1.5 text-[13px] font-medium text-ink">
          <p>
            <span>{formatRands(giftPerHundred)}</span>
            <span className="mx-1.5 text-ink-soft">-&gt;</span>
            <span>{giftLabel}</span>
          </p>
          <p>
            <span>{formatRands(charityPerHundred)}</span>
            <span className="mx-1.5 text-ink-soft">-&gt;</span>
            <span>{charityLabel}</span>
          </p>
        </div>
        {charityEnabled && splitType === 'threshold' ? (
          <p className="mt-2 text-[11px] text-plum">
            First {formatRands(thresholdAmount)} goes to charity.
          </p>
        ) : null}
      </div>
    </div>
  );
}
