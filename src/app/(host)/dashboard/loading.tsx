export default function HostDashboardLoading() {
  return (
    <section className="mx-auto w-full max-w-6xl space-y-6 px-6 py-12">
      <p className="sr-only">Loading...</p>
      <div className="flex animate-pulse flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="h-8 w-56 rounded bg-gray-200" />
        <div className="h-11 w-56 rounded-xl bg-gray-200" />
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="animate-pulse rounded-xl border border-border bg-white p-5 shadow-soft">
            <div className="h-6 w-2/3 rounded bg-gray-200" />
            <div className="mt-4 h-3 rounded bg-gray-200" />
            <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />
            <div className="mt-8 h-4 w-24 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
