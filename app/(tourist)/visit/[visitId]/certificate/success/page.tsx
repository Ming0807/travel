import type { Metadata } from "next";
import { CertificateSuccessActions } from "@/components/certificate/CertificateSuccessActions";
import { getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { getVisitById } from "@/lib/repositories/visit.repository";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";
import { notFound } from "next/navigation";
import { CheckCircle, Sparkle } from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "ใบประกาศพร้อมแล้ว | Southern Border Tourism",
};

export default async function CertificateSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ visitId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { visitId } = await params;
  const resolvedSearchParams = await searchParams;

  // Track passport_saved funnel event (fire-and-forget)
  try {
    const visit = await getVisitById(visitId);
    if (visit) {
      const v = visit as any;
      await recordFunnelEvent({
        eventName: "passport_saved",
        checkinCodeId: v.checkin_code_id || undefined,
        attractionId: v.attraction_id,
        touristId: v.tourist_id,
        visitId,
      });
    }
  } catch {
    // Funnel tracking is non-critical
  }
  const rawCertId = Array.isArray(resolvedSearchParams?.certId)
    ? resolvedSearchParams?.certId[0]
    : resolvedSearchParams?.certId;
  const rawStamp = Array.isArray(resolvedSearchParams?.stamp)
    ? resolvedSearchParams?.stamp[0]
    : resolvedSearchParams?.stamp;
  const rawCertUrl = Array.isArray(resolvedSearchParams?.certUrl)
    ? resolvedSearchParams.certUrl[0]
    : (resolvedSearchParams?.certUrl as string | undefined) ?? null;

  // Get certificate URL: prefer from searchParams, fallback to DB lookup
  let certUrl = rawCertUrl || "";
  if (!certUrl) {
    const cert = await getCertificateByVisitId(visitId);
    if (cert) {
      certUrl = `/api/media/image?path=${encodeURIComponent(cert.certificate_path)}`;
    }
  }

  const stampStatus = (rawStamp as "earned" | "already_earned" | "no_active_stamp_definition" | "none" | undefined) || "earned";

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-12 md:pt-20 pb-24">
        {/* Success Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-teal to-emerald text-white shadow-lg shadow-teal/20 rotate-6 hover:rotate-0 transition-transform duration-500">
            <CheckCircle size={48} weight="fill" />
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tight">ใบประกาศพร้อมแล้ว!</h1>
          <p className="text-muted text-sm font-medium mt-3 max-w-sm mx-auto">
            บันทึกหรือแชร์ใบประกาศดิจิทัลของคุณได้เลย
          </p>
        </div>

        {/* Stamp Notification */}
        {stampStatus === "earned" && (
          <div className="mb-6 animate-scale-in">
            <div className="rounded-[1.75rem] bg-gradient-to-br from-amber-50 to-amber-100/80 border border-amber-200 p-5 text-center shadow-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkle weight="fill" className="text-amber-600" size={20} />
                <span className="text-sm font-black text-amber-700 uppercase tracking-wider">ได้รับตราประทับใหม่!</span>
              </div>
              <p className="text-xs font-medium text-amber-700/70">
                ตราประทับนี้ถูกบันทึกในพาสปอร์ตของคุณแล้ว
              </p>
            </div>
          </div>
        )}

        {/* Success Actions */}
        <div className="animate-fade-in-up delay-200">
          <CertificateSuccessActions
            visitId={visitId}
            certUrl={certUrl}
            stampStatus={stampStatus}
          />
        </div>
      </div>
    </main>
  );
}
