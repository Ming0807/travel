import { DeviceMobile, MapPin, ShieldCheck, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";

import { CheckinProgress } from "@/components/checkin/CheckinProgress";
import { PhotoUploadClient } from "@/components/checkin/PhotoUploadClient";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import {
  requireTouristVisitAccess,
  TouristAccessError,
} from "@/lib/auth/guards";

type VisitPhotoPageRow = {
  attractions?: {
    name_th?: string | null;
  } | null;
  photo_spots?: {
    spot_name_th?: string | null;
  } | null;
};

function VisitPhotoRecovery() {
  return (
    <main className="min-h-[72vh] bg-[var(--public-canvas)] py-10 sm:py-14">
      <PublicPageFrame variant="detail">
        <section className="grid overflow-hidden border border-black/10 bg-white md:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="p-6 sm:p-8">
            <DeviceMobile aria-hidden="true" className="text-[var(--public-coral)]" size={38} weight="fill" />
            <h1 className="mt-4 text-2xl font-black text-[var(--public-ink)] sm:text-3xl">
              เปิดขั้นตอนนี้จากเบราว์เซอร์เดิม
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-black/65">
              ข้อมูลการเข้าชมยังไม่ได้ถูกลบ แต่พาสปอร์ตแบบผู้เยี่ยมชมผูกกับเบราว์เซอร์ที่ใช้สแกน QR
              กรุณากลับไปเปิดจากแอปหรือเบราว์เซอร์เดิม เช่น LINE, Chrome หรือ Safari
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <PublicButton href="/checkin/try">กลับไปสแกน QR อีกครั้ง</PublicButton>
              <PublicButton href="/auth/login?next=%2Fprofile" variant="secondary">
                ค้นหาโปรไฟล์ที่เชื่อมบัญชีไว้
              </PublicButton>
            </div>
          </div>

          <aside className="border-t border-black/10 bg-[#f3f6f5] p-6 md:border-l md:border-t-0">
            <ShieldCheck aria-hidden="true" className="text-[var(--public-teal)]" size={28} weight="fill" />
            <h2 className="mt-4 text-base font-black text-[var(--public-ink)]">เหตุผลที่ไม่เปิดด้วยลิงก์เพียงอย่างเดียว</h2>
            <p className="mt-2 text-sm leading-6 text-black/65">
              ระบบตรวจว่าเป็นเจ้าของการเข้าชมก่อนแสดงรูปและใบประกาศ เพื่อไม่ให้ผู้อื่นที่ได้ลิงก์เข้าถึงข้อมูลของคุณ
            </p>
          </aside>
        </section>
      </PublicPageFrame>
    </main>
  );
}

function VisitPhotoLoadError({ visitId }: { visitId: string }) {
  return (
    <main className="min-h-[72vh] bg-[var(--public-canvas)] py-10 sm:py-14">
      <PublicPageFrame variant="detail">
        <section className="border border-black/10 bg-white p-6 sm:p-8">
          <WarningCircle aria-hidden="true" className="text-[var(--public-coral)]" size={38} weight="fill" />
          <h1 className="mt-4 text-2xl font-black text-[var(--public-ink)] sm:text-3xl">
            โหลดขั้นตอนอัปโหลดรูปไม่สำเร็จ
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-black/65">
            ระบบยังเปิดข้อมูลการเข้าชมไม่ได้ในขณะนี้ ข้อมูลที่กรอกไว้ไม่หาย กรุณารอสักครู่แล้วลองใหม่อีกครั้ง
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <PublicButton href={`/visit/${visitId}/photo`}>ลองโหลดหน้านี้อีกครั้ง</PublicButton>
            <PublicButton href="/profile" variant="secondary">
              ไปที่โปรไฟล์ของฉัน
            </PublicButton>
          </div>
        </section>
      </PublicPageFrame>
    </main>
  );
}

export default async function VisitPhotoPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  let access: Awaited<ReturnType<typeof requireTouristVisitAccess>>;
  try {
    access = await requireTouristVisitAccess(visitId);
  } catch (error) {
    if (error instanceof TouristAccessError) {
      if (error.code === "TOURIST_IDENTITY_NOT_FOUND" || error.code === "VISIT_ACCESS_DENIED") {
        return <VisitPhotoRecovery />;
      }
      if (error.code === "VISIT_NOT_FOUND") {
        notFound();
      }
    }
    return <VisitPhotoLoadError visitId={visitId} />;
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
