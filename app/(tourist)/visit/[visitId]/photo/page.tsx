import { MapPin } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";

import { CheckinProgress } from "@/components/checkin/CheckinProgress";
import { PhotoUploadClient } from "@/components/checkin/PhotoUploadClient";
import { requireTouristVisitAccess } from "@/lib/auth/guards";

type VisitPhotoPageRow = {
  attractions?: {
    name_th?: string | null;
  } | null;
  photo_spots?: {
    spot_name_th?: string | null;
  } | null;
};

export default async function VisitPhotoPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  let access: Awaited<ReturnType<typeof requireTouristVisitAccess>>;
  try {
    access = await requireTouristVisitAccess(visitId);
  } catch {
    notFound();
  }

  const visit = access.visit as VisitPhotoPageRow;
  const attractionName = visit.attractions?.name_th || "สถานที่ท่องเที่ยว";
  const photoSpotName = visit.photo_spots?.spot_name_th || null;

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-ink">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-lg px-4 py-4">
          <div className="inline-flex items-center gap-2 rounded-md border border-teal/20 bg-teal/5 px-3 py-2 text-xs font-bold text-teal">
            <MapPin aria-hidden="true" size={15} weight="fill" />
            {photoSpotName || attractionName}
          </div>
          {photoSpotName ? (
            <p className="mt-2 text-xs font-semibold text-slate-500">{attractionName}</p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-7 md:pt-10">
        <header className="mb-6">
          <p className="text-sm font-bold text-coral">ขั้นตอนที่ 2</p>
          <h1 className="mt-1 text-2xl font-black leading-tight md:text-3xl">
            เพิ่มรูปในใบประกาศ (ไม่บังคับ)
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            ถ่ายรูปใหม่หรือเลือกจากคลังรูป หากยังไม่สะดวกสามารถข้ามและสร้างใบประกาศต่อได้
          </p>
        </header>

        <div className="mb-6 bg-white px-4 py-1">
          <CheckinProgress currentStep={1} />
        </div>

        <section aria-label="เลือกรูปสำหรับใบประกาศ" className="rounded-lg border border-slate-200 bg-white p-5 md:p-7">
          <PhotoUploadClient visitId={visitId} />
        </section>
      </div>
    </main>
  );
}
