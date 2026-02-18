import { Fragment } from 'react';

export interface WizardSkeletonLoaderProps {
  variant: 'split' | 'centered';
}

const skeletonShimmerStyle = {
  background:
    'linear-gradient(90deg, var(--border-soft, var(--color-border-soft)) 25%, var(--bg, var(--color-bg)) 50%, var(--border-soft, var(--color-border-soft)) 75%)',
  backgroundSize: '200% 100%',
};

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      className={`bg-[var(--color-border-soft)] animate-shimmer [animation-duration:1.5s] [animation-timing-function:ease-in-out] motion-reduce:animate-none ${className}`}
      style={skeletonShimmerStyle}
      aria-hidden="true"
    />
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-[28px] bg-white p-8 shadow-card max-[800px]:p-6">
      <SkeletonBlock className="h-6 w-[200px] rounded-[8px]" />
      <div className="mt-7 space-y-6">
        <SkeletonBlock className="h-12 w-full rounded-xl" />
        <SkeletonBlock className="h-12 w-full rounded-xl" />
        <SkeletonBlock className="h-12 w-full rounded-xl" />
      </div>
      <div className="mt-8">
        <SkeletonBlock className="h-12 w-full rounded-[14px]" />
      </div>
    </div>
  );
}

function StepperSkeleton() {
  return (
    <div className="mx-auto mb-9 mt-8 w-full max-w-[940px] px-12 max-[800px]:mb-7 max-[800px]:mt-6 max-[800px]:px-5">
      <div className="min-[801px]:hidden">
        <SkeletonBlock className="h-1 w-3/5 rounded-full" />
      </div>

      <div className="hidden items-center min-[801px]:flex">
        {Array.from({ length: 6 }).map((_, index) => (
          <Fragment key={index}>
            <SkeletonBlock className="h-8 w-8 rounded-full" />
            {index < 5 ? <SkeletonBlock className="mx-1 h-0.5 flex-1 rounded-full" /> : null}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

export function WizardSkeletonLoader({ variant }: WizardSkeletonLoaderProps) {
  return (
    <section aria-label="Loading step content" className="w-full">
      <StepperSkeleton />

      {variant === 'split' ? (
        <div className="mx-auto grid w-full max-w-[940px] grid-cols-2 gap-7 px-12 max-[800px]:grid-cols-1 max-[800px]:px-5">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[600px] px-12 max-[800px]:px-5">
          <SkeletonCard />
        </div>
      )}
    </section>
  );
}
