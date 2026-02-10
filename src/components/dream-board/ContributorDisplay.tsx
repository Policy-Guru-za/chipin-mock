type ContributorItem = {
  name: string | null;
  isAnonymous: boolean;
};

type ContributorDisplayProps = {
  contributors: ContributorItem[];
  totalCount: number;
};

const DISPLAY_LIMIT = 6;

const getHeadingCopy = (count: number) => {
  const text = count === 1 ? '1 loved one has chipped in' : `${count} loved ones have chipped in`;

  if (count < 3) {
    return {
      emoji: '🎁',
      text,
    };
  }

  if (count <= 10) {
    return {
      emoji: '🎉',
      text: count >= 6 ? `${count} amazing people have chipped in` : text,
    };
  }

  return {
    emoji: '✨',
    text: `${count} amazing people have chipped in`,
  };
};

const formatContributorName = (contributor: ContributorItem) => {
  if (contributor.isAnonymous || !contributor.name) {
    return 'Anonymous';
  }

  const parts = contributor.name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'Anonymous';
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1]?.[0]?.toUpperCase() ?? '';
  return `${firstName} ${lastInitial}.`;
};

export function ContributorDisplay({ contributors, totalCount }: ContributorDisplayProps) {
  if (totalCount === 0) {
    return (
      <section className="rounded-2xl border border-border bg-white p-5">
        <p className="italic text-gray-400">Be the first to chip in... 🎁</p>
      </section>
    );
  }

  const headingCopy = getHeadingCopy(totalCount);
  const displayContributors = contributors.slice(0, DISPLAY_LIMIT);
  const overflowCount = Math.max(0, totalCount - DISPLAY_LIMIT);

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-white p-5">
      <h2 className="font-display text-xl text-gray-900">
        <span aria-hidden="true" className="mr-2">
          {headingCopy.emoji}
        </span>
        {headingCopy.text}
      </h2>

      <ul className="space-y-2">
        {displayContributors.map((contributor, index) => (
          <li key={`${contributor.name ?? 'anonymous'}-${index}`} className="text-sm text-gray-700">
            <span className="font-semibold">{formatContributorName(contributor)}</span> has chipped in!
          </li>
        ))}
      </ul>

      {overflowCount > 0 ? (
        <p className="text-sm italic text-gray-500">
          and {overflowCount} {overflowCount === 1 ? 'other' : 'others'}
        </p>
      ) : null}
    </section>
  );
}
