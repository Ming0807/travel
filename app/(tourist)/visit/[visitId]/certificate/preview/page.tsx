import type { Metadata } from "next";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getPhotoById } from "@/lib/repositories/visit-photo.repository";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "ใบประกาศดิจิทัล | Southern Border Tourism",
};

type CertificateVisitRow = {
  visit_date?: string | null;
  tourists?: {
    display_name?: string | null;
  } | null;
  attractions?: {
    name_th?: string | null;
    provinces?: {
      province_name_th?: string | null;
    } | null;
  } | null;
};

export default async function CertificatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ visitId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { visitId } = await params;
  const resolvedSearchParams = await searchParams;
  const rawPhotoId = Array.isArray(resolvedSearchParams?.photoId)
    ? resolvedSearchParams?.photoId[0]
    : resolvedSearchParams?.photoId;

  let access: Awaited<ReturnType<typeof requireTouristVisitAccess>>;
  try {
    access = await requireTouristVisitAccess(visitId);
  } catch {
    notFound();
  }

  const v = access.visit as CertificateVisitRow;
  const touristName = v.tourists?.display_name || "ผู้เยี่ยมชม";
  const attractionName = v.attractions?.name_th || "สถานที่ท่องเที่ยว";
  const provinceName = v.attractions?.provinces?.province_name_th || "";
  const visitDate = v.visit_date
    ? new Date(v.visit_date).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  // Get photo info
  let photoId = rawPhotoId || "";
  let previewUrl = "";

  if (rawPhotoId) {
    const photo = await getPhotoById(rawPhotoId as string);
    if (photo?.storage_path && photo.visit_id === visitId) {
      previewUrl = await createPrivateFileSignedUrl("visit-photos", photo.storage_path, 60 * 60);
    } else {
      photoId = "";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 relative pb-24 flex flex-col items-center overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 w-full max-w-lg px-4 pt-8 md:pt-16">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2.5 h-2.5 rounded-full bg-teal" />
          <div className="w-2.5 h-2.5 rounded-full bg-teal" />
          <div className="w-2.5 h-2.5 rounded-full bg-teal" />
          <div className="w-2.5 h-2.5 rounded-full bg-ink/20" />
          <p className="ml-2 text-xs font-bold text-muted">ขั้นตอนที่ 3/3</p>
        </div>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-black text-ink tracking-tight">ใบประกาศดิจิทัล</h1>
          <p className="text-muted text-sm font-medium mt-2 max-w-xs mx-auto">
            ตรวจสอบใบประกาศและกดสร้างเพื่อบันทึก
          </p>
        </div>

        {/* Certificate Preview */}
        <CertificatePreview
          visitId={visitId}
          photoId={photoId}
          previewUrl={previewUrl}
          touristName={touristName}
          attractionName={attractionName}
          provinceName={provinceName}
          visitDate={visitDate}
        />
      </div>
    </main>
  );
}
