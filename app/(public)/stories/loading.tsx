import { PublicPageFrame } from "@/components/public/PublicPageFrame";

export default function StoriesLoading() {
  return (
    <PublicPageFrame variant="listing" className="animate-pulse pb-20 pt-10" aria-busy="true" aria-label="กำลังโหลดเรื่องราว">
      <div className="h-4 w-36 bg-black/10" />
      <div className="mt-8 h-14 max-w-2xl bg-black/10" />
      <div className="mt-4 h-6 max-w-xl bg-black/10" />
      <div className="mt-10 h-32 rounded-[var(--public-radius-panel)] border border-black/10 bg-white" />
      <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="space-y-4 border-b border-black/10 pb-7">
            <div className="aspect-[4/3] rounded-[var(--public-radius-panel)] bg-black/10" />
            <div className="h-6 bg-black/10" />
            <div className="h-4 w-3/4 bg-black/10" />
          </div>
        ))}
      </div>
    </PublicPageFrame>
  );
}
