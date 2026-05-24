import { notFound, redirect } from "next/navigation";
import { CheckCircle, ShareNetwork } from "@phosphor-icons/react/dist/ssr";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { CertificateSuccessActions } from "@/components/certificate/CertificateSuccessActions";
import { AccountLinkingTeaser } from "@/components/passport/AccountLinkingTeaser";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";
import { ConfettiEffect } from "@/components/ui/ConfettiEffect";

export default async function CertificateSuccessPage(props: {
  params: Promise<{ visitId: string }>;
  searchParams: Promise<{ stamp?: string }>;
}) {
  const { visitId: rawVisitId } = await props.params;
  const { stamp: stampParam } = await props.searchParams;

  const visitIdResult = uuidSchema.safeParse(rawVisitId);
  if (!visitIdResult.success) {
    notFound();
  }
  const visitId = visitIdResult.data;

  try {
    await requireTouristVisitAccess(visitId);
  } catch {
    notFound();
  }

  const certificate = await getCertificateByVisitId(visitId);
  if (!certificate) {
    console.error(`[Success Page] Certificate not found for visitId: ${visitId}. Redirecting back to preview.`);
    redirect(`/visit/${visitId}/certificate/preview`);
  }

  const certUrl = await createPrivateFileSignedUrl("certificate-files", certificate.certificate_path);
  const stampStatus =
    stampParam === "earned" ||
    stampParam === "already_earned" ||
    stampParam === "no_active_stamp_definition"
      ? stampParam
      : "none";

  return (
    <main className="bg-[#FAF8F5] min-h-screen text-ink px-4 py-12 flex flex-col items-center pb-24 relative overflow-hidden">
      <ConfettiEffect />
      
      {/* Background glow */}
      <div className="absolute top-0 w-[500px] h-[500px] bg-coral/10 rounded-full blur-[100px] pointer-events-none -mt-40"></div>

      <div className="w-full max-w-md mx-auto mb-10 text-center relative z-10">
        <div className="mx-auto w-20 h-20 rounded-full bg-cream text-coral flex items-center justify-center mb-6 shadow-inner ring-8 ring-white">
          <CheckCircle size={44} weight="fill" />
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-ink tracking-tight">สร้างใบประกาศสำเร็จ!</h1>
        <p className="text-muted text-sm md:text-base mt-3 max-w-sm mx-auto leading-relaxed">
          ขอบคุณที่ร่วมเป็นส่วนหนึ่งของการเดินทาง ความทรงจำของคุณถูกบันทึกเรียบร้อยแล้ว
        </p>
      </div>

      <div className="w-full max-w-md mx-auto relative mb-12 z-10 group">
        <div className="absolute -inset-1 bg-gradient-to-r from-coral/40 to-coral/20 rounded-[2.2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certUrl}
            alt="Travel Memory Certificate"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      </div>

      <div className="w-full max-w-md mx-auto relative z-10">
        <CertificateSuccessActions
          visitId={visitId}
          certUrl={certUrl}
          stampStatus={stampStatus}
        />
        
        <div className="mt-6 flex justify-center">
          <button className="flex items-center gap-2 text-xs font-bold text-muted hover:text-coral transition-colors py-2 px-4 rounded-full bg-white border border-ink/5 shadow-sm">
            <ShareNetwork weight="bold" size={16} /> แชร์ใบประกาศนี้
          </button>
        </div>
        
        <div className="mt-10 pt-8 border-t border-ink/5">
          <AccountLinkingTeaser isGuest={true} />
        </div>
      </div>
    </main>
  );
}
