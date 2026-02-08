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
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: '#F0F7F4',
        borderColor: 'rgba(11, 125, 100, 0.1)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#0D9488]">
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
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-gray-200 text-sm font-semibold text-gray-700">
            {getCharityInitial(charityName)}
          </div>
        )}
        <div className="space-y-1">
          <h2 className="font-display text-base font-bold text-gray-900">{charityName}</h2>
          <p className="text-sm text-gray-600">{allocationLabel}</p>
          {showDescription ? <p className="text-sm text-gray-600">{description}</p> : null}
        </div>
      </div>
    </section>
  );
}
