type CelebrationHeaderProps = {
  childName: string;
};

export function CelebrationHeader({ childName }: CelebrationHeaderProps) {
  return (
    <header className="relative overflow-hidden rounded-[28px] border border-border-soft bg-white/70 px-6 py-10 text-center shadow-card sm:px-10 sm:py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_3px_at_12%_20%,#E9F3ED_100%,transparent_100%),radial-gradient(circle_2px_at_28%_45%,#F7EFE2_100%,transparent_100%),radial-gradient(circle_3px_at_45%_16%,#F1EDF7_100%,transparent_100%),radial-gradient(circle_2px_at_62%_38%,#E9F3ED_100%,transparent_100%),radial-gradient(circle_3px_at_78%_22%,#F7EFE2_100%,transparent_100%),radial-gradient(circle_2px_at_88%_42%,#F1EDF7_100%,transparent_100%),radial-gradient(circle_2px_at_35%_55%,#EBDCC8_100%,transparent_100%),radial-gradient(circle_3px_at_70%_52%,#E9F3ED_100%,transparent_100%)]"
      />

      <div className="relative flex flex-col items-center gap-3">
        <div className="text-4xl animate-bounce-subtle sm:text-5xl">🎉</div>
        <h1 className="font-warmth-serif text-4xl leading-tight text-ink sm:text-5xl">
          <em className="not-italic text-sage">{childName}&apos;s</em> Dreamboard is ready!
        </h1>
        <p className="max-w-xl text-sm font-light text-ink-soft sm:text-base">
          Everything looks great. Share it with friends and family to start collecting.
        </p>
      </div>
    </header>
  );
}
