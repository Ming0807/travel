import { notFound, redirect } from "next/navigation";
import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { CertificateSuccessActions } from "@/components/certificate/CertificateSuccessActions";
import { AccountLinkingTeaser } from "@/components/passport/AccountLinkingTeaser";
import { createPrivateFileSignedUrl } from "@/lib/storage/private-files";
import { uuidSchema } from "@/lib/validation/common";

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
    // If not generated, redirect back
    redirect(`/visit/${visitId}/certificate/preview`);
  }
  
  console.log(`[Success Page] Certificate found: ${certificate.certificate_id}`);

  const certUrl = await createPrivateFileSignedUrl("certificate-files", certificate.certificate_path);
  const stampStatus =
    stampParam === "earned" ||
    stampParam === "already_earned" ||
    stampParam === "no_active_stamp_definition"
      ? stampParam
      : "none";

  return (
    <main className="bg-[#FAF8F5] min-h-screen text-ink px-4 py-12 flex flex-col items-center pb-24">
      <div className="w-full max-w-md mx-auto mb-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-[#FAF3EE] text-[#E18868] flex items-center justify-center mb-4">
          <CheckCircle size={36} weight="fill" />
        </div>
        <h1 className="text-3xl font-black text-ink">สร้างใบประกาศสำเร็จ!</h1>
        <p className="text-muted text-sm mt-2">ขอบคุณที่ร่วมเป็นส่วนหนึ่งของการท่องเที่ยว</p>
      </div>

      <div className="w-full max-w-md mx-auto relative mb-8">
        <div className="relative w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={certUrl}
            alt="Travel Memory Certificate"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="w-full max-w-md mx-auto">
        <CertificateSuccessActions
          visitId={visitId}
          certUrl={certUrl}
          stampStatus={stampStatus}
        />
        
        <div className="mt-8">
          <AccountLinkingTeaser />
        </div>
      </div>
    </main>
  );
}
