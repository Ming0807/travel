import { PublicPageFrame } from "@/components/public/PublicPageFrame";

export default function StoryDetailLoading() {
  return (
    <PublicPageFrame variant="detail" className="animate-pulse pb-24 pt-10" aria-busy="true" aria-label="กำลังโหลดบทความ">
      <div className="h-4 w-40 bg-black/10" />
      <div className="mx-auto mt-10 max-w-5xl">
        <div className="h-12 max-w-3xl bg-black/10" />
        <div className="mt-4 h-6 max-w-2xl bg-black/10" />
        <div className="mt-8 aspect-[16/9] rounded-[var(--public-radius-panel)] bg-black/10" />
        <div className="mx-auto mt-12 max-w-[70ch] space-y-4">
          {Array.from({ length: 7 }, (_, index) => <div key={index} className="h-4 bg-black/10" />)}
        </div>
      </div>
    </PublicPageFrame>
  );
}
