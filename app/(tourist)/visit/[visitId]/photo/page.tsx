import { getVisitById } from "@/lib/repositories/visit.repository";
import { PhotoUploadClient } from "@/components/checkin/PhotoUploadClient";
import { Camera, MapPin } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";

export default async function VisitPhotoPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  const visit = await getVisitById(visitId);

  if (!visit) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = visit as any;
  const attractionName = v.attractions?.name_th || "สถานที่ท่องเที่ยว";
  const photoSpotName = v.photo_spots?.spot_name_th || null;

  return (
    <main className="min-h-screen bg-slate-50 relative pb-24 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-full h-[400px] -translate-x-1/2 -translate-y-1/2 bg-[url('/noise.png')] opacity-20 mix-blend-overlay -z-10 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-8 md:pt-16">
        {/* Back Link */}
        <a
          href={`/visit/${visitId}/certificate/preview`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-coral transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5m7-7-7 7 7 7"/>
          </svg>
          ข้าม (ไม่ต้องอัปโหลดรูป)
        </a>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur shadow-sm text-coral px-4 py-1.5 rounded-full text-xs font-bold mb-4 border border-white">
            <MapPin weight="fill" size={14} />
            <span>{photoSpotName || attractionName}</span>
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tight">เพิ่มรูปถ่ายของคุณ</h1>
          <p className="text-muted text-sm font-medium mt-2 max-w-xs mx-auto">
            อัปโหลดรูปถ่ายเพื่อนำไปแสดงบนใบประกาศดิจิทัล
          </p>
        </div>

        {/* Photo Upload Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 animate-scale-in">
          <PhotoUploadClient visitId={visitId} />
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <div className="w-2.5 h-2.5 rounded-full bg-teal" />
          <div className="w-2.5 h-2.5 rounded-full bg-teal" />
          <div className="w-2.5 h-2.5 rounded-full bg-ink/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-ink/10" />
          <p className="ml-2 text-xs font-bold text-muted">ขั้นตอนที่ 2/3</p>
        </div>
      </div>
    </main>
  );
}
