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
  defaultNoPartyPlanned: boolean;
  childName: string;
  childAge: number;
  error: string | null;
};

const dateInputClassName =
  'wizard-interactive w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-text shadow-input transition-colors duration-200 placeholder:text-ink-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-sage-light [appearance:none] [-webkit-appearance:none] [color-scheme:light]';

const dateTimePickerClassName =
  '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-date-and-time-value]:min-h-[1.2rem]';

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
  defaultNoPartyPlanned,
  childName,
  childAge,
  error,
}: DatesFormProps) {
  const [noPartyPlanned, setNoPartyPlanned] = useState(defaultNoPartyPlanned);
  const [birthdayDate, setBirthdayDate] = useState(defaultBirthdayDate);
  const [partyDate, setPartyDate] = useState(defaultPartyDate || defaultBirthdayDate);
  const [campaignEndDate, setCampaignEndDate] = useState(
    defaultCampaignEndDate || defaultPartyDate || defaultBirthdayDate
  );
  const [partyDateTimeTime, setPartyDateTimeTime] = useState(
    defaultNoPartyPlanned || !defaultPartyDateTimeDate ? '' : defaultPartyDateTimeTime
  );

  const effectivePartyDate = noPartyPlanned ? birthdayDate : partyDate;
  const effectiveCampaignEndDate = noPartyPlanned ? birthdayDate : campaignEndDate;
  const previewPartyDateTimeDate = !noPartyPlanned && partyDateTimeTime ? effectivePartyDate : '';
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
                  if (noPartyPlanned) {
                    setPartyDate(nextBirthday);
                    setCampaignEndDate(nextBirthday);
                  }
                }}
                className={`${dateInputClassName} ${dateTimePickerClassName}`}
              />
            </WizardFieldWrapper>

            <div className="mb-6">
              <label
                htmlFor="noPartyPlanned"
                className="wizard-interactive flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-5 py-4"
              >
                <input
                  id="noPartyPlanned"
                  name="noPartyPlanned"
                  type="checkbox"
                  checked={noPartyPlanned}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setNoPartyPlanned(checked);
                    if (checked) {
                      setPartyDate(birthdayDate);
                      setCampaignEndDate(birthdayDate);
                      setPartyDateTimeTime('');
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
                <span className="text-[13px] font-medium text-ink-mid">
                  We are not planning a birthday party
                </span>
              </label>
            </div>

            {noPartyPlanned ? (
              <>
                <input type="hidden" name="partyDate" value={birthdayDate} />
                <input type="hidden" name="campaignEndDate" value={birthdayDate} />
                <input type="hidden" name="partyDateTimeDate" value="" />
                <input type="hidden" name="partyDateTimeTime" value="" />
              </>
            ) : (
              <div className="mb-6 rounded-[20px] border border-border bg-background p-5">
                <p className="mb-3 text-sm font-medium text-text">Birthday party schedule</p>

                <div className="grid gap-4 md:grid-cols-2">
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
                      className={`${dateInputClassName} ${dateTimePickerClassName}`}
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
                      className={`${dateInputClassName} ${dateTimePickerClassName}`}
                    />
                  </WizardFieldWrapper>
                </div>

                <WizardFieldWrapper label="Party time (optional)" htmlFor="partyDateTimeTime">
                  <input
                    id="partyDateTimeTime"
                    name="partyDateTimeTime"
                    type="time"
                    enterKeyHint="done"
                    value={partyDateTimeTime}
                    onChange={(event) => setPartyDateTimeTime(event.currentTarget.value)}
                    className={`${dateInputClassName} ${dateTimePickerClassName}`}
                  />
                </WizardFieldWrapper>
                <input type="hidden" name="partyDateTimeDate" value={partyDateTimeTime ? partyDate : ''} />
              </div>
            )}

            <WizardFieldTip>
              If you&apos;re not planning a birthday party, the campaign closes on the birthday.
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
              partyDateTimeDate={previewPartyDateTimeDate}
              partyDateTimeTime={!noPartyPlanned ? partyDateTimeTime : ''}
              campaignEndDate={effectiveCampaignEndDate}
              campaignDays={campaignDays}
            />
          </WizardPreviewPanel>
        }
      />
    </form>
  );
}
