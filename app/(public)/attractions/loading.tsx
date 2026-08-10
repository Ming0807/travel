import { PublicPageFrame } from "@/components/public/PublicPageFrame";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-black/10 ${className}`} />;
}

export default function AttractionsLoading() {
  return (
    <PublicPageFrame variant="listing" className="pb-16 pt-8 sm:pt-10" >
      <span className="sr-only">กำลังโหลดสถานที่ท่องเที่ยว</span>
      <Skeleton className="h-4 w-36 rounded-[var(--public-radius-control)]" />
      <div className="mt-7 border-b border-black/10 pb-7">
        <Skeleton className="h-11 w-full max-w-2xl rounded-[var(--public-radius-panel)]" />
        <Skeleton className="mt-4 h-5 w-full max-w-xl rounded-[var(--public-radius-control)]" />
      </div>
      <div className="mt-7 rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(220px,0.75fr)_auto] md:items-end">
          <Skeleton className="h-16 rounded-[var(--public-radius-control)]" />
          <Skeleton className="h-16 rounded-[var(--public-radius-control)]" />
          <Skeleton className="h-11 w-36 rounded-[var(--public-radius-control)]" />
        </div>
      </div>
      <div className="mt-10 border-b border-black/10 pb-4">
        <Skeleton className="h-8 w-48 rounded-[var(--public-radius-control)]" />
        <Skeleton className="mt-2 h-4 w-40 rounded-[var(--public-radius-control)]" />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="rounded-[var(--public-radius-panel)] border border-black/10 bg-white p-2">
            <Skeleton className="aspect-[4/3] rounded-[var(--public-radius-panel)]" />
            <div className="px-3 pb-4 pt-4">
              <Skeleton className="h-4 w-2/5 rounded-[var(--public-radius-control)]" />
              <Skeleton className="mt-3 h-7 w-4/5 rounded-[var(--public-radius-control)]" />
              <Skeleton className="mt-3 h-4 w-full rounded-[var(--public-radius-control)]" />
              <Skeleton className="mt-2 h-4 w-3/4 rounded-[var(--public-radius-control)]" />
            </div>
          </div>
        ))}
      </div>
    </PublicPageFrame>
  );
}
