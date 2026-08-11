import { PublicPageFrame } from "@/components/public/PublicPageFrame";

function Skeleton({ className }: { className: string }) {
  return <div className={`animate-pulse bg-black/10 ${className}`} />;
}

export function HospitalityDetailLoading({ label }: { label: string }) {
  return (
    <PublicPageFrame variant="detail" className="pb-16 pt-8 sm:pt-10">
      <span className="sr-only">กำลังโหลด{label}</span>
      <Skeleton className="h-4 w-48 rounded-[var(--public-radius-control)]" />
      <div className="mt-7 border-b border-black/10 pb-6">
        <Skeleton className="h-5 w-32 rounded-[var(--public-radius-control)]" />
        <Skeleton className="mt-3 h-12 w-full max-w-2xl rounded-[var(--public-radius-panel)]" />
      </div>
      <Skeleton className="mt-6 aspect-[4/3] w-full rounded-[var(--public-radius-panel)] sm:aspect-[2/1] lg:aspect-[16/7]" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <Skeleton className="h-8 w-52 rounded-[var(--public-radius-control)]" />
          <Skeleton className="mt-5 h-5 w-full rounded-[var(--public-radius-control)]" />
          <Skeleton className="mt-3 h-5 w-5/6 rounded-[var(--public-radius-control)]" />
        </div>
        <Skeleton className="h-72 rounded-[var(--public-radius-panel)]" />
      </div>
    </PublicPageFrame>
  );
}
