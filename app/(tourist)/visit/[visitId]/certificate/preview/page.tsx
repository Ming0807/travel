import type { Metadata } from "next";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { getPhotoById } from "@/lib/repositories/visit-photo.repository";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "ใบประกาศดิจิทัล | Southern Border Tourism",
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
  const rawPreviewUrl = Array.isArray(resolvedSearchParams?.previewUrl)
    ? resolvedSearchParams?.previewUrl[0]
    : resolvedSearchParams?.previewUrl;

  const visit = await getVisitById(visitId);
  if (!visit) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = visit as any;
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
  let previewUrl = rawPreviewUrl || "";

  // If previewUrl is missing OR if it's an old broken public URL, we generate a fresh signed URL
  if (rawPhotoId && (!rawPreviewUrl || rawPreviewUrl.includes("/object/public/visit-photos/"))) {
    const photo = await getPhotoById(rawPhotoId as string);
    if (photo && photo.storage_path) {
      // The bucket is private, so we need a signed URL
      const { createSupabaseServiceRoleClient } = await import("@/lib/supabase/service-role");
      const supabase = createSupabaseServiceRoleClient();
      const { data } = await supabase.storage
        .from("visit-photos")
        .createSignedUrl(photo.storage_path, 60 * 60);
      
      previewUrl = data?.signedUrl || "";
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
