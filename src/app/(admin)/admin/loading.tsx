export default function AdminDashboardLoading() {
  return (
    <section className="space-y-6">
      <p className="sr-only">Loading...</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="mt-4 h-6 w-24 rounded bg-gray-200" />
            <div className="mt-3 h-3 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="h-4 w-40 rounded bg-gray-200" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-10 rounded bg-gray-100" />
          ))}
        </div>
      </div>
    </section>
  );
}
