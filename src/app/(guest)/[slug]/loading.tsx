export default function DreamBoardLoading() {
  return (
    <section className="mx-auto w-full max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <p className="sr-only">Loading...</p>
      <div className="animate-pulse rounded-3xl bg-muted p-6 sm:p-8">
        <div className="mx-auto h-24 w-24 rounded-full bg-gray-200 sm:h-28 sm:w-28" />
        <div className="mx-auto mt-5 h-8 w-56 rounded bg-gray-200" />
        <div className="mx-auto mt-3 h-5 w-44 rounded bg-gray-200" />
      </div>
      <div className="animate-pulse rounded-2xl bg-white p-6 shadow-soft">
        <div className="h-5 w-40 rounded bg-gray-200" />
        <div className="mt-4 h-20 rounded-xl bg-gray-100" />
      </div>
      <div className="animate-pulse rounded-2xl bg-white p-6 shadow-soft">
        <div className="h-4 w-28 rounded bg-gray-200" />
        <div className="mt-4 h-3 rounded bg-gray-200" />
        <div className="mt-3 h-3 w-5/6 rounded bg-gray-200" />
        <div className="mt-4 h-16 rounded-xl bg-gray-100" />
      </div>
    </section>
  );
}
