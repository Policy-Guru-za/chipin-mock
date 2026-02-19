'use client';

import { useMemo, useState } from 'react';

import { DatesPreview } from '@/components/create-wizard/DatesPreview';
import {
  WizardCTA,
  WizardFieldTip,
  WizardFieldWrapper,
  WizardFormCard,
  WizardPanelTitle,
  WizardPreviewPanel,
  WizardSplitLayout,
} from '@/components/create-wizard';

type DatesFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultBirthdayDate: string;
  defaultPartyDate: string;
  defaultCampaignEndDate: string;
  defaultPartyDateTimeDate: string;
  defaultPartyDateTimeTime: string;
  defaultPartyDateEnabled: boolean;
  childName: string;
  childAge: number;
  error: string | null;
};

const dateInputClassName =
  'w-full rounded-xl border border-[var(--sage-200)] bg-white px-4 py-3 text-base text-[var(--ink-900)] placeholder:text-[var(--ink-400)] focus:border-[var(--sage-400)] focus:outline-none focus:ring-2 focus:ring-[var(--sage-200)] wizard-interactive';

const getDaysUntil = (dateString: string) => {
  const today = new Date();
  const target = new Date(dateString);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetMidnight = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const diff = targetMidnight.getTime() - todayMidnight.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
};

export function DatesForm({
  action,
  defaultBirthdayDate,
  defaultPartyDate,
  defaultCampaignEndDate,
  defaultPartyDateTimeDate,
  defaultPartyDateTimeTime,
  defaultPartyDateEnabled,
  childName,
  childAge,
  error,
}: DatesFormProps) {
  const [partyDateEnabled, setPartyDateEnabled] = useState(defaultPartyDateEnabled);
  const [birthdayDate, setBirthdayDate] = useState(defaultBirthdayDate);
  const [partyDate, setPartyDate] = useState(defaultPartyDate || defaultBirthdayDate);
  const [campaignEndDate, setCampaignEndDate] = useState(defaultCampaignEndDate || defaultPartyDate);
  const [partyDateTimeDate, setPartyDateTimeDate] = useState(defaultPartyDateTimeDate);
  const [partyDateTimeTime, setPartyDateTimeTime] = useState(defaultPartyDateTimeTime);

  const effectivePartyDate = partyDateEnabled ? partyDate : birthdayDate;
  const effectiveCampaignEndDate = partyDateEnabled ? campaignEndDate : birthdayDate;
  const campaignDays = useMemo(() => getDaysUntil(effectiveCampaignEndDate), [effectiveCampaignEndDate]);

  return (
    <form action={action}>
      <WizardSplitLayout
        mobileOrder="right-first"
        left={
          <WizardFormCard>
            <WizardPanelTitle variant="form">When&apos;s the big day?</WizardPanelTitle>
            <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
              Set the dates that shape the campaign timeline.
            </p>

            <WizardFieldWrapper label="Birthday date" htmlFor="birthdayDate">
              <input
                id="birthdayDate"
                name="birthdayDate"
                type="date"
                required
                enterKeyHint="next"
                value={birthdayDate}
                onChange={(event) => {
                  const nextBirthday = event.currentTarget.value;
                  setBirthdayDate(nextBirthday);
                  if (!partyDateEnabled) {
                    setPartyDate(nextBirthday);
                    setCampaignEndDate(nextBirthday);
                  }
                }}
                className={dateInputClassName}
              />
            </WizardFieldWrapper>

            <div className="mb-6">
              <label
                htmlFor="partyDateEnabled"
                className="wizard-interactive flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3"
              >
                <input
                  id="partyDateEnabled"
                  name="partyDateEnabled"
                  type="checkbox"
                  checked={partyDateEnabled}
                  onChange={(event) => {
                    const enabled = event.currentTarget.checked;
                    setPartyDateEnabled(enabled);
                    if (!enabled) {
                      setPartyDate(birthdayDate);
                      setCampaignEndDate(birthdayDate);
                    } else if (!partyDate) {
                      setPartyDate(birthdayDate);
                      setCampaignEndDate(birthdayDate);
                    }
                  }}
                  className="peer sr-only"
                />
                <span className="flex h-5 w-5 items-center justify-center rounded-md border border-border bg-white transition-all duration-200 peer-checked:border-primary peer-checked:bg-primary">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 text-white opacity-0 transition-opacity duration-200 peer-checked:opacity-100"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <span className="text-[13px] font-medium text-ink-mid">Party is on a different day</span>
              </label>
            </div>

            {partyDateEnabled ? (
              <div className="grid gap-3 md:grid-cols-2">
                <WizardFieldWrapper label="Party date" htmlFor="partyDate">
                  <input
                    id="partyDate"
                    name="partyDate"
                    type="date"
                    required
                    enterKeyHint="next"
                    value={partyDate}
                    onChange={(event) => {
                      const nextPartyDate = event.currentTarget.value;
                      setPartyDate(nextPartyDate);
                      if (!campaignEndDate || campaignEndDate < nextPartyDate) {
                        setCampaignEndDate(nextPartyDate);
                      }
                    }}
                    className={dateInputClassName}
                  />
                </WizardFieldWrapper>

                <WizardFieldWrapper label="Campaign close date" htmlFor="campaignEndDate">
                  <input
                    id="campaignEndDate"
                    name="campaignEndDate"
                    type="date"
                    required
                    enterKeyHint="next"
                    value={campaignEndDate}
                    onChange={(event) => setCampaignEndDate(event.currentTarget.value)}
                    className={dateInputClassName}
                  />
                </WizardFieldWrapper>
              </div>
            ) : (
              <>
                <input type="hidden" name="partyDate" value={birthdayDate} />
                <input type="hidden" name="campaignEndDate" value={birthdayDate} />
              </>
            )}

            <div className="mb-6 rounded-[20px] border border-border bg-background p-4">
              <p className="mb-3 text-sm font-medium text-text">Birthday party date &amp; time (optional)</p>
              <div className="grid gap-3 md:grid-cols-2">
                <WizardFieldWrapper label="Party date" htmlFor="partyDateTimeDate">
                  <input
                    id="partyDateTimeDate"
                    name="partyDateTimeDate"
                    type="date"
                    enterKeyHint="next"
                    value={partyDateTimeDate}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setPartyDateTimeDate(value);
                      if (!value) {
                        setPartyDateTimeTime('');
                      }
                    }}
                    className={dateInputClassName}
                  />
                </WizardFieldWrapper>

                <WizardFieldWrapper label="Party time" htmlFor="partyDateTimeTime">
                  <input
                    id="partyDateTimeTime"
                    name="partyDateTimeTime"
                    type="time"
                    enterKeyHint="done"
                    value={partyDateTimeTime}
                    disabled={!partyDateTimeDate}
                    onChange={(event) => setPartyDateTimeTime(event.currentTarget.value)}
                    className={`${dateInputClassName} disabled:cursor-not-allowed disabled:opacity-60`}
                  />
                </WizardFieldWrapper>
              </div>
            </div>

            <WizardFieldTip>
              The campaign closes on the birthday. Contributors can chip in until then.
            </WizardFieldTip>

            <WizardCTA
              backHref="/create/gift"
              submitLabel="Continue to giving back"
              pending={false}
              error={error}
            />
          </WizardFormCard>
        }
        right={
          <WizardPreviewPanel
            eyebrow="Preview"
            title="How it'll look"
            summaryLabel="Preview timeline -"
          >
            <DatesPreview
              childName={childName}
              childAge={childAge}
              birthdayDate={birthdayDate}
              partyDate={effectivePartyDate}
              partyDateTimeDate={partyDateTimeDate}
              partyDateTimeTime={partyDateTimeTime}
              campaignEndDate={effectiveCampaignEndDate}
              campaignDays={campaignDays}
            />
          </WizardPreviewPanel>
        }
      />
    </form>
  );
}
