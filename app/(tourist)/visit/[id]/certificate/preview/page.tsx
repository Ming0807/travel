import { notFound, redirect } from "next/navigation";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getPhotoByVisitId } from "@/lib/repositories/visit-photo.repository";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";

export default async function CertificatePreviewPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ photoId?: string; previewUrl?: string }>;
}) {
  const { id: rawVisitId } = await props.params;
  const { photoId: rawPhotoId, previewUrl: rawPreviewUrl } = await props.searchParams;

  const visitIdResult = uuidSchema.safeParse(rawVisitId);
  if (!visitIdResult.success) {
    notFound();
  }
  const visitId = visitIdResult.data;

  let access: Awaited<ReturnType<typeof requireTouristVisitAccess>>;
  try {
    access = await requireTouristVisitAccess(visitId);
  } catch {
    notFound();
  }
  const visit = access.visit;

  // Enforce idempotency: if already generated, redirect to success
  if (visit.completion_status === "certificate_generated" || visit.completion_status === "survey_completed") {
    redirect(`/visit/${visitId}/certificate/success`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = visit as any;
  const attraction = v.attractions;
  const tourist = v.tourists;

  // We rely on the search params passed from the client upload for immediate feedback,
  // but let's safely fall back to the DB record if it's missing.
  let photoId = rawPhotoId && uuidSchema.safeParse(rawPhotoId).success ? rawPhotoId : null;
  let previewUrl = rawPreviewUrl;

  if (!photoId || !previewUrl) {
    const photo = await getPhotoByVisitId(visitId);
    if (!photo) {
      // Must upload photo first
      redirect(`/visit/${visitId}/photo`);
    }
    photoId = photo.photo_id;
    previewUrl = await createPrivateFileSignedUrl("visit-photos", photo.storage_path);
  }

  const visitDateFormatted = new Date(v.visit_date).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <main className="bg-[#FAF8F5] min-h-screen text-ink px-4 py-12 flex flex-col items-center pb-24">
      <div className="w-full max-w-md mx-auto mb-8 text-center">
        <h1 className="text-2xl font-bold text-ink">ตัวอย่างใบประกาศ</h1>
        <p className="text-ink-light text-sm mt-1">รูปภาพและชื่อที่ปรากฏบนใบประกาศ</p>
      </div>

      <CertificatePreview
        visitId={visitId}
        photoId={photoId as string}
        previewUrl={previewUrl as string}
        touristName={tourist.display_name}
        attractionName={attraction.name_th}
        provinceName="Yala / Pattani / Narathiwat"
        visitDate={visitDateFormatted}
      />
    </main>
  );
}
