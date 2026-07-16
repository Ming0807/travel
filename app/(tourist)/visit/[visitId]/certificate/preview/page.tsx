import type { Metadata } from "next";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getPhotoById } from "@/lib/repositories/visit-photo.repository";
import { CertificatePreview } from "@/components/certificate/CertificatePreview";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  CertificateTemplateResolutionError,
  resolveCertificateTemplate,
} from "@/lib/services/certificate-template.service";

export const metadata: Metadata = {
  title: "ใบประกาศดิจิทัล | Southern Border Tourism",
};

type CertificateVisitRow = {
  attraction_id?: number | null;
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

function CertificateTemplateUnavailable({ visitId }: { visitId: string }) {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-lg border border-amber-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">ยังไม่สามารถสร้างใบประกาศได้</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          ยังไม่มีเทมเพลตที่พร้อมใช้งานสำหรับสถานที่นี้ กรุณาลองใหม่ภายหลัง
          หรือติดต่อเจ้าหน้าที่ประจำจุดท่องเที่ยว
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/visit/${visitId}/photo`}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            กลับไปหน้ารูปภาพ
          </Link>
          <Link
            href="/passport"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#0A6B62] px-4 py-2 text-sm font-semibold text-white hover:bg-[#075049]"
          >
            ดูพาสปอร์ตของฉัน
          </Link>
        </div>
      </section>
    </main>
  );
}

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
  if (!Number.isInteger(v.attraction_id) || Number(v.attraction_id) <= 0) {
    return <CertificateTemplateUnavailable visitId={visitId} />;
  }

  const language = resolvedSearchParams?.lang === "en" ? "en" : "th";
  let template: Awaited<ReturnType<typeof resolveCertificateTemplate>>;
  let templateBackgroundUrl = "";
  try {
    template = await resolveCertificateTemplate({
      attractionId: Number(v.attraction_id),
      language,
    });
    if (template.backgroundPath) {
      templateBackgroundUrl = `/api/certificate/template-image?visitId=${encodeURIComponent(
        visitId
      )}&templateId=${template.templateId}`;
    }
  } catch (error) {
    if (!(error instanceof CertificateTemplateResolutionError)) {
      console.error(
        "Certificate template preview failed:",
        error instanceof Error ? error.message : "unknown error"
      );
    }
    return <CertificateTemplateUnavailable visitId={visitId} />;
  }

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
    <main className="min-h-screen bg-slate-50 pb-24 flex flex-col items-center overflow-hidden">
      <div className="relative z-10 w-full max-w-2xl px-4 pt-8 md:pt-16">
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
          templateId={template.templateId}
          templateName={template.templateName}
          templateBackgroundUrl={templateBackgroundUrl}
          language={language}
          orientation={template.orientation}
        />
      </div>
    </main>
  );
}
