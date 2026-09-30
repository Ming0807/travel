import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import "./attraction-experience.css";

function Skeleton({ className }: { className: string }) {
  return <div aria-hidden="true" className={`attraction-skeleton rounded-lg ${className}`} />;
}

export function AttractionDetailLoading() {
  return (
    <PublicPageFrame variant="detail" className="py-6 sm:py-10" aria-busy="true">
      <p role="status" className="sr-only">กำลังโหลดรายละเอียดสถานที่</p>
      <Skeleton className="mb-5 h-5 w-48" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-4 h-12 w-full max-w-2xl" />
      <Skeleton className="mb-6 mt-4 h-5 w-36 sm:mb-8" />
      <Skeleton className="mb-10 aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[16/7]" />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="order-2 space-y-5 lg:order-1">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
        <Skeleton className="order-1 h-60 lg:order-2" />
      </div>
    </PublicPageFrame>
  );
}

export function AttractionDirectoryLoading() {
  return (
    <div className="min-h-screen bg-[#FAF7F2]" aria-busy="true">
      <p role="status" className="sr-only">กำลังโหลดสถานที่ท่องเที่ยว</p>
      <div aria-hidden="true" className="min-h-[390px] bg-white px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="mt-10 h-12 w-full max-w-xl" />
          <Skeleton className="h-12 w-3/4 max-w-md" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>
      </div>
      <PublicPageFrame variant="directory">
        <div aria-hidden="true" className="relative -mt-16 mb-10 rounded-2xl bg-white p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1.4fr)_auto]">
            <Skeleton className="h-12" />
            <Skeleton className="hidden h-12 sm:block" />
            <Skeleton className="h-12 min-w-36" />
          </div>
          <Skeleton className="mt-4 h-11 w-full max-w-md" />
        </div>
        <Skeleton className="h-8 w-60" />
        <Skeleton className="mb-6 mt-3 h-4 w-40" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] xl:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} aria-hidden="true" className="overflow-hidden rounded-xl bg-white">
                <Skeleton className="aspect-[16/10] !rounded-none" />
                <div className="space-y-3 p-4">
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-4 h-11 w-full" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="hidden h-80 lg:block" />
        </div>
      </PublicPageFrame>
    </div>
  );
}
