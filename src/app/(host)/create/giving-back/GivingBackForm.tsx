'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Charity = {
  id: string;
  name: string;
  description: string;
  category: string;
  logoUrl: string | null;
};

type SplitType = 'percentage' | 'threshold';

type GivingBackFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  charities: Charity[];
  defaultCharityEnabled?: boolean;
  defaultCharityId?: string;
  defaultSplitType?: SplitType;
  defaultPercentage?: number;
  defaultThresholdAmount?: number;
  childName?: string;
};

export function GivingBackForm({
  action,
  charities,
  defaultCharityEnabled,
  defaultCharityId,
  defaultSplitType = 'percentage',
  defaultPercentage = 25,
  defaultThresholdAmount = 100,
  childName,
}: GivingBackFormProps) {
  const [charityEnabled, setCharityEnabled] = useState(defaultCharityEnabled ?? false);
  const [selectedCharityId, setSelectedCharityId] = useState(defaultCharityId ?? '');
  const [splitType, setSplitType] = useState<SplitType>(defaultSplitType);
  const [percentage, setPercentage] = useState(defaultPercentage);
  const [thresholdAmount, setThresholdAmount] = useState(defaultThresholdAmount);

  const selectedCharity = useMemo(
    () => charities.find((charity) => charity.id === selectedCharityId),
    [charities, selectedCharityId]
  );

  const splitPreview = useMemo(() => {
    if (!charityEnabled || !selectedCharityId) {
      return null;
    }

    if (splitType === 'percentage') {
      return `${percentage}% of each contribution supports ${selectedCharity?.name ?? 'your selected charity'}.`;
    }

    return `The first R${thresholdAmount.toLocaleString('en-ZA')} of contributions supports ${selectedCharity?.name ?? 'your selected charity'}.`;
  }, [charityEnabled, percentage, selectedCharity?.name, selectedCharityId, splitType, thresholdAmount]);

  return (
    <form action={action} className="space-y-6">
      <label className="flex items-center gap-2 text-sm font-medium text-text" htmlFor="charityEnabled">
        <input
          id="charityEnabled"
          name="charityEnabled"
          type="checkbox"
          checked={charityEnabled}
          onChange={(event) => setCharityEnabled(event.currentTarget.checked)}
        />
        Enable giving back (optional)
      </label>

      {charityEnabled ? (
        <div className="space-y-6">
          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-text">Choose a charity</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {charities.map((charity) => {
                const selected = selectedCharityId === charity.id;
                return (
                  <label
                    key={charity.id}
                    className={[
                      'card-interactive flex cursor-pointer flex-col gap-2 rounded-xl border p-4 transition-colors',
                      selected ? 'border-primary bg-primary/5' : 'border-border bg-white hover:border-primary/50',
                    ].join(' ')}
                  >
                    <input
                      className="sr-only"
                      type="radio"
                      name="charityId"
                      value={charity.id}
                      checked={selected}
                      onChange={() => setSelectedCharityId(charity.id)}
                    />
                    <p className="text-sm font-semibold text-text">{charity.name}</p>
                    <p className="text-xs text-text-muted">{charity.category}</p>
                    <p className="text-xs text-text-secondary">{charity.description}</p>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-text">How should we split contributions?</legend>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  name="charitySplitType"
                  value="percentage"
                  checked={splitType === 'percentage'}
                  onChange={() => setSplitType('percentage')}
                />
                Percentage of each contribution
              </label>
              <label className="flex items-center gap-2 text-sm text-text">
                <input
                  type="radio"
                  name="charitySplitType"
                  value="threshold"
                  checked={splitType === 'threshold'}
                  onChange={() => setSplitType('threshold')}
                />
                First fixed amount raised
              </label>
            </div>
          </fieldset>

          {splitType === 'percentage' ? (
            <div className="space-y-2">
              <label htmlFor="charityPercentage" className="text-sm font-medium text-text">
                Charity percentage ({percentage}%)
              </label>
              <Input
                id="charityPercentage"
                name="charityPercentage"
                type="range"
                min={5}
                max={50}
                step={1}
                value={percentage}
                onChange={(event) => setPercentage(Number(event.currentTarget.value))}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="charityThresholdAmount" className="text-sm font-medium text-text">
                Fixed amount (R50-R500)
              </label>
              <Input
                id="charityThresholdAmount"
                name="charityThresholdAmount"
                type="number"
                min={50}
                max={500}
                step={1}
                value={thresholdAmount}
                onChange={(event) => setThresholdAmount(Number(event.currentTarget.value))}
              />
            </div>
          )}

          {splitType === 'percentage' ? (
            <input type="hidden" name="charityThresholdAmount" value="" />
          ) : (
            <input type="hidden" name="charityPercentage" value="" />
          )}

          {splitPreview ? (
            <div
              aria-live="polite"
              className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-text-secondary"
            >
              {splitPreview} The rest goes to {(childName ?? 'your child') + "'s gift"}.
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <input type="hidden" name="charityId" value="" />
          <input type="hidden" name="charitySplitType" value="" />
          <input type="hidden" name="charityPercentage" value="" />
          <input type="hidden" name="charityThresholdAmount" value="" />
        </>
      )}

      <Button type="submit">Continue to payout setup</Button>
    </form>
  );
}
