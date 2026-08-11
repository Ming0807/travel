import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { CertificateSuccessActions } from "@/components/certificate/CertificateSuccessActions";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getCertificateByVisitId } from "@/lib/repositories/certificate.repository";

export const metadata: Metadata = {
  title: "ใบประกาศพร้อมแล้ว | Southern Border Tourism",
};

type StampStatus = "earned" | "already_earned" | "no_active_stamp_definition" | "none";

export default async function CertificateSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ visitId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { visitId } = await params;
  const resolvedSearchParams = await searchParams;

  try {
    await requireTouristVisitAccess(visitId);
  } catch {
    notFound();
  }

  const rawStamp = Array.isArray(resolvedSearchParams?.stamp)
    ? resolvedSearchParams.stamp[0]
    : resolvedSearchParams?.stamp;
  const allowedStampStatuses: StampStatus[] = [
    "earned",
    "already_earned",
    "no_active_stamp_definition",
    "none",
  ];
  const stampStatus = allowedStampStatuses.includes(rawStamp as StampStatus)
    ? (rawStamp as StampStatus)
    : "none";

  const certificate = await getCertificateByVisitId(visitId);
  const previewUrl = certificate
    ? `/api/media/image?bucket=certificate-files&path=${encodeURIComponent(certificate.certificate_path)}`
    : "";
  const downloadUrl = certificate
    ? `/api/certificate/download?visitId=${encodeURIComponent(visitId)}`
    : "";

  return (
    <main className="min-h-screen bg-[#F7F8F6] px-4 pb-24 pt-10 md:pt-16">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-[#0A6B62] text-white shadow-[0_8px_22px_rgba(10,107,98,0.18)]">
            <CheckCircle size={38} weight="fill" aria-hidden="true" />
          </div>
          <p className="text-xs font-black uppercase text-[#C8553A]">
            Southern Border Digital Passport
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">
            {certificate ? "ใบประกาศพร้อมแล้ว" : "ยังไม่พบใบประกาศ"}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-muted">
            {certificate
              ? "ตรวจสอบผลงาน แล้วบันทึกหรือแชร์ไฟล์ภาพได้ทันที"
              : "ยังไม่พบไฟล์ที่สร้างเสร็จ คุณสามารถกลับไปสร้างใหม่ได้โดยข้อมูลการเข้าชมไม่หาย"}
          </p>
        </header>

        {certificate ? (
          <figure className="mb-5 border border-ink/10 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            {/* The source is an ownership-guarded same-origin media endpoint. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="ใบประกาศการท่องเที่ยวของคุณ"
              className="h-auto w-full bg-slate-100 object-contain"
            />
            <figcaption className="px-2 py-3 text-center text-xs font-semibold text-muted">
              ไฟล์นี้เป็นข้อมูลส่วนตัว ระบบจะไม่เผยแพร่สู่สาธารณะโดยอัตโนมัติ
            </figcaption>
          </figure>
        ) : null}

        {certificate && stampStatus === "earned" ? (
          <div className="mb-5 flex items-center justify-center gap-2 border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">
            <Sparkle weight="fill" size={19} aria-hidden="true" />
            ได้รับตราประทับใหม่ในพาสปอร์ตแล้ว
          </div>
        ) : null}

        <CertificateSuccessActions
          visitId={visitId}
          certUrl={downloadUrl}
          stampStatus={stampStatus}
        />
      </div>
    </main>
  );
}
