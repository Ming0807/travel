import "server-only";
import { getVisitById, updateVisitStatus } from "@/lib/repositories/visit.repository";
import { createCertificate, getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";

export async function processCertificateGeneration(params: {
  visitId: string;
  templateId: number;
  photoId?: string;
  certificatePath: string;
}) {
  const visit = await getVisitById(params.visitId);
  if (!visit) {
    throw new Error("Visit not found");
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = visit as any;
  await recordFunnelEvent({
    eventName: "certificate_generated",
    checkinCodeId: v.checkin_code_id,
    attractionId: v.attraction_id,
    touristId: v.tourist_id,
    visitId: String(params.visitId)
  });

  return certId;
}
