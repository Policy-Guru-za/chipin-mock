import Image from 'next/image';

type CharitableGivingCardProps = {
  charityName: string;
  charityDescription: string | null;
  charityLogoUrl: string | null;
  allocationLabel: string;
  impactCopy?: string;
};

const getCharityInitial = (name: string) => {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed[0].toUpperCase() : 'C';
};

export function CharitableGivingCard({
  charityName,
  charityDescription,
  charityLogoUrl,
  allocationLabel,
  impactCopy,
}: CharitableGivingCardProps) {
  const description =
    impactCopy ??
    charityDescription ??
    'Supporting South African communities through shared giving.';
  const showDescription = description !== allocationLabel;

  return (
    <section
      className="rounded-[20px] border p-5 shadow-card"
      style={{
        backgroundColor: '#F1F7F4',
        borderColor: '#EDE7DE',
      }}
    >
      <p className="font-warmth-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-sage">
        💚 A GIFT THAT GIVES TWICE
      </p>
      <div className="mt-4 flex items-start gap-3">
        {charityLogoUrl ? (
          <Image
            src={charityLogoUrl}
            alt={`${charityName} logo`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-sage-light text-sm font-semibold text-sage-deep">
            {getCharityInitial(charityName)}
          </div>
        )}
        <div className="space-y-1">
          <h2 className="font-warmth-serif text-lg text-ink">{charityName}</h2>
          <p className="font-warmth-sans text-sm text-ink-mid">{allocationLabel}</p>
          {showDescription ? <p className="font-warmth-sans text-sm text-ink-mid">{description}</p> : null}
        </div>
      </div>
    </section>
  );
}
