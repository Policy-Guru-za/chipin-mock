'use client';

import { useMemo, useState } from 'react';

import { GivingBackPreview } from '@/components/create-wizard/GivingBackPreview';
import {
  WizardCTA,
  WizardEyebrow,
  WizardFieldTip,
  WizardFieldWrapper,
  WizardFormCard,
  WizardPanelTitle,
  WizardPreviewPanel,
  WizardSplitLayout,
} from '@/components/create-wizard';
import { cn } from '@/lib/utils';

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
  error: string | null;
};

const charityInitialTones = ['bg-plum', 'bg-amber', 'bg-sage', 'bg-[#D97706]', 'bg-[#2563EB]'];

const numberInputClassName =
  'w-full rounded-xl border border-[var(--sage-200)] bg-white px-4 py-3 text-base text-[var(--ink-900)] placeholder:text-[var(--ink-400)] focus:border-[var(--sage-400)] focus:outline-none focus:ring-2 focus:ring-[var(--sage-200)] wizard-interactive';

const getCharityInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'CH';

export function GivingBackForm({
  action,
  charities,
  defaultCharityEnabled,
  defaultCharityId,
  defaultSplitType = 'percentage',
  defaultPercentage = 25,
  defaultThresholdAmount = 100,
  childName,
  error,
}: GivingBackFormProps) {
  const [charityEnabled, setCharityEnabled] = useState(defaultCharityEnabled ?? false);
  const [selectedCharityId, setSelectedCharityId] = useState(defaultCharityId ?? '');
  const [splitType, setSplitType] = useState<SplitType>(defaultSplitType);
  const [percentage, setPercentage] = useState(defaultPercentage);
  const [thresholdAmount, setThresholdAmount] = useState(defaultThresholdAmount);

  const selectedCharity = useMemo(
    () => charities.find((charity) => charity.id === selectedCharityId),
    [charities, selectedCharityId],
  );

  const splitPreview = useMemo(() => {
    if (!charityEnabled || !selectedCharityId) {
      return null;
    }

    if (splitType === 'percentage') {
      return `${percentage}% of each contribution supports ${selectedCharity?.name ?? 'your selected charity'}.`;
    }

    return `The first R${thresholdAmount.toLocaleString('en-ZA')} of contributions supports ${
      selectedCharity?.name ?? 'your selected charity'
    }.`;
  }, [
    charityEnabled,
    percentage,
    selectedCharity?.name,
    selectedCharityId,
    splitType,
    thresholdAmount,
  ]);

  const trimmedChildName = childName?.trim();

  return (
    <form action={action}>
      <WizardSplitLayout
        mobileOrder="right-first"
        left={
          <WizardFormCard>
            <WizardEyebrow>Step 4</WizardEyebrow>
            <WizardPanelTitle variant="form">Want to share the love?</WizardPanelTitle>
            <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
              Help a cause while celebrating {trimmedChildName || 'your child'}.
            </p>

            <div className="mb-8 flex items-center justify-between rounded-xl bg-border-soft px-4 py-4">
              <label htmlFor="charityEnabled" className="text-[13px] font-medium text-ink-mid">
                Enable giving back
              </label>
              <label htmlFor="charityEnabled" className="wizard-interactive relative cursor-pointer">
                <input
                  id="charityEnabled"
                  name="charityEnabled"
                  type="checkbox"
                  checked={charityEnabled}
                  onChange={(event) => setCharityEnabled(event.currentTarget.checked)}
                  className="peer sr-only"
                />
                <span
                  className="relative block h-6 w-11 rounded-full bg-border transition-colors duration-300 peer-checked:bg-primary
                    after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:duration-300 peer-checked:after:translate-x-5"
                />
              </label>
            </div>

            {charityEnabled ? (
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-[13px] font-medium text-ink-mid">Select a charity</label>
                  <div className="flex flex-col gap-3">
                    {charities.map((charity, index) => {
                      const selected = selectedCharityId === charity.id;
                      const tagline = charity.description.trim() || charity.category;

                      return (
                        <label
                          key={charity.id}
                          className={cn(
                            'wizard-interactive flex cursor-pointer items-center gap-3 rounded-xl border-[1.5px] px-[14px] py-3 transition-all duration-200',
                            selected
                              ? 'border-primary bg-sage-light'
                              : 'border-border bg-white hover:border-primary hover:bg-sage-wash',
                          )}
                        >
                          <input
                            className="sr-only"
                            type="radio"
                            name="charityId"
                            value={charity.id}
                            checked={selected}
                            onChange={() => setSelectedCharityId(charity.id)}
                          />
                          <span
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white',
                              charityInitialTones[index % charityInitialTones.length],
                            )}
                            aria-hidden="true"
                          >
                            {getCharityInitials(charity.name)}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[13px] font-medium text-text">{charity.name}</span>
                            <span className="mt-0.5 block text-[11px] text-ink-soft">{tagline}</span>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-medium text-ink-mid">How should we split?</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label
                      className={cn(
                        'wizard-interactive cursor-pointer rounded-[14px] border-[1.5px] px-4 py-3 text-center text-[13px] font-medium transition-colors duration-200',
                        splitType === 'percentage'
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-background text-ink-soft hover:border-primary',
                      )}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="charitySplitType"
                        value="percentage"
                        checked={splitType === 'percentage'}
                        onChange={() => setSplitType('percentage')}
                      />
                      Percentage
                    </label>

                    <label
                      className={cn(
                        'wizard-interactive cursor-pointer rounded-[14px] border-[1.5px] px-4 py-3 text-center text-[13px] font-medium transition-colors duration-200',
                        splitType === 'threshold'
                          ? 'border-primary bg-primary text-white'
                          : 'border-border bg-background text-ink-soft hover:border-primary',
                      )}
                    >
                      <input
                        className="sr-only"
                        type="radio"
                        name="charitySplitType"
                        value="threshold"
                        checked={splitType === 'threshold'}
                        onChange={() => setSplitType('threshold')}
                      />
                      Threshold
                    </label>
                  </div>
                </div>

                {splitType === 'percentage' ? (
                  <WizardFieldWrapper
                    label={`Percentage to share (${percentage}%)`}
                    htmlFor="charityPercentage"
                  >
                    <div className="rounded-[14px] border border-border bg-background px-4 py-4">
                      <input
                        id="charityPercentage"
                        name="charityPercentage"
                        type="range"
                        min={5}
                        max={50}
                        step={1}
                        value={percentage}
                        onChange={(event) => setPercentage(Number(event.currentTarget.value))}
                        className="wizard-interactive h-2 w-full cursor-pointer appearance-none rounded-full bg-border-soft accent-primary"
                      />
                      <div className="mt-2 flex items-center justify-between text-[11px] text-ink-ghost">
                        <span>5%</span>
                        <span>50%</span>
                      </div>
                    </div>
                  </WizardFieldWrapper>
                ) : (
                  <WizardFieldWrapper label="Amount to share" htmlFor="charityThresholdAmount">
                    <div className="relative">
                      <span className="pointer-events-none absolute top-1/2 left-[18px] -translate-y-1/2 text-[15px] font-medium text-ink-mid">
                        R
                      </span>
                      <input
                        id="charityThresholdAmount"
                        name="charityThresholdAmount"
                        type="number"
                        min={50}
                        max={500}
                        step={1}
                        value={thresholdAmount}
                        onChange={(event) => setThresholdAmount(Number(event.currentTarget.value))}
                        className={`${numberInputClassName} pl-8 text-center`}
                      />
                    </div>
                  </WizardFieldWrapper>
                )}

                {splitType === 'percentage' ? (
                  <input type="hidden" name="charityThresholdAmount" value="" />
                ) : (
                  <input type="hidden" name="charityPercentage" value="" />
                )}

                <WizardFieldTip>
                  Contributors will see that a portion goes to charity on the Dreamboard.
                </WizardFieldTip>
              </div>
            ) : (
              <>
                <input type="hidden" name="charityId" value="" />
                <input type="hidden" name="charitySplitType" value="" />
                <input type="hidden" name="charityPercentage" value="" />
                <input type="hidden" name="charityThresholdAmount" value="" />
              </>
            )}

            <WizardCTA
              backHref="/create/dates"
              submitLabel="Continue to payout setup"
              pending={false}
              error={error}
            />
          </WizardFormCard>
        }
        right={
          <WizardPreviewPanel
            eyebrow="Preview"
            title="Impact breakdown"
            summaryLabel="Impact preview -"
          >
            <div data-split-preview={splitPreview ?? ''}>
              <GivingBackPreview
                charityEnabled={charityEnabled}
                selectedCharity={selectedCharity ?? null}
                splitType={splitType}
                percentage={percentage}
                thresholdAmount={thresholdAmount}
                childName={childName}
              />
            </div>
          </WizardPreviewPanel>
        }
      />
    </form>
  );
}
