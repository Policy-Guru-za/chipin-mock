import { notFound } from 'next/navigation';

import { GiftIconPicker } from '@/components/gift/GiftIconPicker';

const isDevPreviewEnabled = process.env.DEV_PREVIEW === 'true';

export default function IconPickerDevPage() {
  if (!isDevPreviewEnabled) {
    notFound();
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <header className="space-y-2">
        <h1 className="font-display text-3xl text-text sm:text-4xl">Icon Picker Dev Preview</h1>
        <p className="text-sm text-text-muted">
          Public local-only preview for visual QA. Toggle gift name/description, click icons, and
          test keyboard navigation.
        </p>
      </header>

      <section className="rounded-3xl border border-border bg-white p-5 shadow-soft sm:p-8">
        <form className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="giftName" className="text-sm font-medium text-text">
              Gift name
            </label>
            <input
              id="giftName"
              className="w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-text"
              defaultValue="Ballet shoes"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="giftDescription" className="text-sm font-medium text-text">
              Gift description
            </label>
            <textarea
              id="giftDescription"
              className="min-h-24 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm text-text"
              defaultValue="For dance classes and recital practice."
            />
          </div>

          <GiftIconPicker
            selectedIconId="ballet"
            giftNameInputId="giftName"
            giftDescriptionInputId="giftDescription"
            defaultGiftName="Ballet shoes"
            defaultGiftDescription="For dance classes and recital practice."
            childAge={7}
          />
        </form>
      </section>
    </section>
  );
}
