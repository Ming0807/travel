export default function AttractionsLoading() {
  return (
    <div className="bg-background min-h-screen text-ink pb-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 md:pt-20">
        {/* Breadcrumb */}
        <div className="flex gap-2 mb-6">
          <div className="h-3 w-12 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-3 w-3 rounded-full bg-slate-200 animate-pulse" />
          <div className="h-3 w-20 rounded-full bg-slate-200 animate-pulse" />
        </div>

        {/* Hero Section Skeleton */}
        <section className="flex flex-col lg:flex-row justify-between gap-12 lg:gap-8 items-start mb-20">
          <div className="lg:w-1/2 pt-4 space-y-6">
            <div className="h-12 w-3/4 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-12 w-1/2 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-4 w-2/3 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-4 w-1/2 rounded-full bg-slate-100 animate-pulse" />
            <div className="h-14 w-full max-w-xl rounded-full bg-slate-200 animate-pulse" />
            <div className="flex gap-3">
              <div className="h-10 w-28 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-10 w-28 rounded-full bg-slate-100 animate-pulse" />
              <div className="h-10 w-28 rounded-full bg-slate-100 animate-pulse" />
            </div>
          </div>
          <div className="lg:w-1/2 w-full">
            <div className="w-full h-[350px] rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        </section>

        {/* Popular Provinces Skeleton */}
        <section className="mb-20">
          <div className="h-8 w-64 rounded-2xl bg-slate-200 animate-pulse mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 md:h-48 rounded-xl bg-slate-200 animate-pulse" />
            ))}
          </div>
        </section>

        {/* Main Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          <div className="lg:col-span-8 space-y-16">
            <section>
              <div className="h-8 w-48 rounded-2xl bg-slate-200 animate-pulse mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <div className="h-56 w-full rounded-xl bg-slate-200 animate-pulse" />
                    <div className="h-5 w-3/4 rounded-full bg-slate-200 animate-pulse" />
                    <div className="h-3 w-1/3 rounded-full bg-slate-100 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
                      <div className="h-6 w-16 rounded-full bg-slate-100 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-4 space-y-8">
            <div className="h-64 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-48 rounded-2xl bg-slate-200 animate-pulse" />
            <div className="h-72 rounded-2xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
