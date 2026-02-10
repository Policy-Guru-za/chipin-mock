'use client';

import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type DatesFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultBirthdayDate: string;
  defaultPartyDate: string;
  defaultCampaignEndDate: string;
  defaultPartyDateTimeDate: string;
  defaultPartyDateTimeTime: string;
  defaultPartyDateEnabled: boolean;
};

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
}: DatesFormProps) {
  const [partyDateEnabled, setPartyDateEnabled] = useState(defaultPartyDateEnabled);
  const [birthdayDate, setBirthdayDate] = useState(defaultBirthdayDate);
  const [partyDate, setPartyDate] = useState(defaultPartyDate || defaultBirthdayDate);
  const [campaignEndDate, setCampaignEndDate] = useState(defaultCampaignEndDate || defaultPartyDate);
  const [partyDateTimeDate, setPartyDateTimeDate] = useState(defaultPartyDateTimeDate);
  const [partyDateTimeTime, setPartyDateTimeTime] = useState(defaultPartyDateTimeTime);

  const effectivePartyDate = partyDateEnabled ? partyDate : birthdayDate;
  const effectiveCampaignEndDate = partyDateEnabled ? campaignEndDate : birthdayDate;
  const campaignDays = useMemo(
    () => getDaysUntil(effectiveCampaignEndDate),
    [effectiveCampaignEndDate]
  );

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="birthdayDate" className="text-sm font-medium text-text">
          Birthday date
        </label>
        <Input
          id="birthdayDate"
          name="birthdayDate"
          type="date"
          required
          value={birthdayDate}
          onChange={(event) => {
            const nextBirthday = event.currentTarget.value;
            setBirthdayDate(nextBirthday);
            if (!partyDateEnabled) {
              setPartyDate(nextBirthday);
              setCampaignEndDate(nextBirthday);
            }
          }}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-text" htmlFor="partyDateEnabled">
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
        />
        Party is on a different day
      </label>

      {partyDateEnabled ? (
        <div className="space-y-5 rounded-2xl border border-border p-4">
          <div className="space-y-2">
            <label htmlFor="partyDate" className="text-sm font-medium text-text">
              Party date
            </label>
            <Input
              id="partyDate"
              name="partyDate"
              type="date"
              required
              value={partyDate}
              onChange={(event) => {
                const nextPartyDate = event.currentTarget.value;
                setPartyDate(nextPartyDate);
                if (!campaignEndDate || campaignEndDate < nextPartyDate) {
                  setCampaignEndDate(nextPartyDate);
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="campaignEndDate" className="text-sm font-medium text-text">
              Contribution deadline
            </label>
            <Input
              id="campaignEndDate"
              name="campaignEndDate"
              type="date"
              required
              value={campaignEndDate}
              onChange={(event) => setCampaignEndDate(event.currentTarget.value)}
            />
          </div>
        </div>
      ) : (
        <>
          <input type="hidden" name="partyDate" value={birthdayDate} />
          <input type="hidden" name="campaignEndDate" value={birthdayDate} />
        </>
      )}

      <div className="space-y-3 rounded-2xl border border-border p-4">
        <div className="space-y-1">
          <p className="text-sm font-medium text-text">Birthday party date &amp; time (optional)</p>
          <p className="text-xs text-text-muted">
            If set, this will show on the public Dreamboard as the party event time.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="partyDateTimeDate" className="text-sm font-medium text-text">
              Party date
            </label>
            <Input
              id="partyDateTimeDate"
              name="partyDateTimeDate"
              type="date"
              value={partyDateTimeDate}
              onChange={(event) => {
                const value = event.currentTarget.value;
                setPartyDateTimeDate(value);
                if (!value) {
                  setPartyDateTimeTime('');
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="partyDateTimeTime" className="text-sm font-medium text-text">
              Party time
            </label>
            <Input
              id="partyDateTimeTime"
              name="partyDateTimeTime"
              type="time"
              value={partyDateTimeTime}
              disabled={!partyDateTimeDate}
              onChange={(event) => setPartyDateTimeTime(event.currentTarget.value)}
            />
          </div>
        </div>
      </div>

      <div
        aria-live="polite"
        className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-text-secondary"
      >
        Time until campaign closes: {campaignDays} day{campaignDays === 1 ? '' : 's'} from today
      </div>

      <Button type="submit">Continue to giving back</Button>
    </form>
  );
}
