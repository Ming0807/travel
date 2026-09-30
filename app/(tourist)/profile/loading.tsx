import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import "@/components/profile/tourist-profile.css";

export default function ProfileLoading() {
  return <div className="tourist-profile tourist-profile-loading py-8 sm:py-12" aria-busy="true">
    <PublicPageFrame variant="listing">
      <p role="status" className="sr-only">กำลังโหลดโปรไฟล์นักเดินทาง</p>
      <div aria-hidden="true">
        <div className="tourist-profile-skeleton h-9 w-56 max-w-full" />
        <div className="tourist-profile-skeleton mt-3 h-5 w-80 max-w-full" />
        <div className="tourist-profile-identity min-h-40"><div className="tourist-profile-skeleton h-16 w-16 shrink-0 rounded-full" /><div className="tourist-profile-skeleton h-10 w-64 max-w-full" /></div>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]"><div className="tourist-profile-skeleton h-72" /><div className="tourist-profile-skeleton h-56" /></div>
      </div>
    </PublicPageFrame>
  </div>;
}
