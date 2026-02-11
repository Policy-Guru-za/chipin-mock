import { PlusIcon, UserSilhouetteIcon } from '@/components/icons/dreamboard-icons';

type ContributorItem = {
  name: string | null;
  isAnonymous: boolean;
};

type ContributorDisplayProps = {
  contributors: ContributorItem[];
  totalCount: number;
};

const DISPLAY_LIMIT = 6;

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

const getInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export function ContributorDisplay({ contributors, totalCount }: ContributorDisplayProps) {
  if (totalCount === 0) {
    return (
      <section className="space-y-4 rounded-[20px] border border-border-soft bg-white p-5 shadow-card sm:p-6">
        <p className="font-warmth-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          Friends and family chipping in
        </p>
        <div className="flex items-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-sage-wash text-sage shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
            <UserSilhouetteIcon className="h-4 w-4" />
          </span>
          <span className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-sage-wash text-sage shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
            <UserSilhouetteIcon className="h-4 w-4" />
          </span>
          <span className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-plum-soft text-plum shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
            <PlusIcon className="h-4 w-4" />
          </span>
        </div>
        <p className="font-warmth-sans text-sm text-ink-soft">
          Be the first to contribute and start the celebration.
        </p>
        <p className="sr-only">No contributors yet.</p>
      </section>
    );
  }

  const displayContributors = contributors.slice(0, DISPLAY_LIMIT);
  const overflowCount = Math.max(0, totalCount - DISPLAY_LIMIT);
  const summaryText =
    totalCount === 1
      ? '1 loved one has chipped in.'
      : `${totalCount} loved ones have chipped in.`;

  return (
    <section className="space-y-4 rounded-[20px] border border-border-soft bg-white p-5 shadow-card sm:p-6">
      <p className="font-warmth-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
        Friends and family chipping in
      </p>
      <div className="flex items-center">
        {displayContributors.map((contributor, index) => {
          const formattedName = formatContributorName(contributor);
          const initials = formattedName === 'Anonymous' ? 'AN' : getInitials(formattedName);

          return (
            <span
              key={`${contributor.name ?? 'anonymous'}-${index}`}
              title={formattedName}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-sage text-xs font-semibold text-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)] ${index > 0 ? '-ml-2' : ''}`}
            >
              {initials}
            </span>
          );
        })}
        {overflowCount > 0 ? (
          <span className="-ml-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-amber text-xs font-semibold text-white shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
            +{overflowCount}
          </span>
        ) : null}
      </div>
      <p className="font-warmth-sans text-sm text-ink-soft">{summaryText}</p>
      <ul className="sr-only">
        {displayContributors.map((contributor, index) => (
          <li key={`${contributor.name ?? 'anonymous'}-sr-${index}`}>
            {formatContributorName(contributor)}
          </li>
        ))}
      </ul>
    </section>
  );
}
