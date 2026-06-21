import "server-only";
import { requireTouristVisitAccess } from "@/lib/auth/guards";
import { updateVisitStatus } from "@/lib/repositories/visit.repository";
import { createCertificate, getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";
import { getPhotoById } from "@/lib/repositories/visit-photo.repository";

type VisitForCertificate = {
  checkin_code_id?: number | null;
  attraction_id?: number | null;
  tourist_id?: string | null;
};

export async function processCertificateGeneration(params: {
  visitId: string;
  templateId: number;
  photoId?: string;
  certificatePath: string;
}) {
  const { visit } = await requireTouristVisitAccess(params.visitId);

  if (params.photoId) {
    const photo = await getPhotoById(params.photoId);
    if (!photo || photo.visit_id !== params.visitId) {
      throw new Error("PHOTO_NOT_FOUND_FOR_VISIT");
    }
  }

  // 1. Idempotency Check
  const existingCert = await getCertificateByVisitId(params.visitId);
  if (existingCert) {
    // If it already exists, just return it
    return existingCert.certificate_id;
  }

  // 2. Create Certificate
  const certId = await createCertificate({
    visitId: params.visitId,
    templateId: params.templateId,
    photoId: params.photoId,
    certificatePath: params.certificatePath
  });

  // 3. Update visit status
  await updateVisitStatus(params.visitId, "certificate_generated");

  // 4. Record event
  const v = visit as VisitForCertificate;
  await recordFunnelEvent({
    eventName: "certificate_generated",
    checkinCodeId: v.checkin_code_id ?? undefined,
    attractionId: v.attraction_id ?? undefined,
    touristId: v.tourist_id ?? undefined,
    visitId: String(params.visitId)
  });

  return certId;
}
