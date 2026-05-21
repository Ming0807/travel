import "server-only";
import { updateVisitStatus } from "@/lib/repositories/visit.repository";
import { createVisitPhoto } from "@/lib/repositories/visit-photo.repository";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";
import { requireTouristVisitAccess } from "@/lib/auth/guards";

export async function verifyVisitOwnershipForUpload(visitId: string) {
  try {
    const { visit } = await requireTouristVisitAccess(visitId);
    return { status: "valid" as const, visit };
  } catch {
    return { status: "not_found" as const };
  }
}

export async function handlePhotoUploadMetadata(params: {
  visitId: string;
  storagePath: string;
  originalFilename?: string;
  mimeType: string;
  fileSizeBytes: number;
}) {
  // 1. Verify ownership/visit
  const verification = await verifyVisitOwnershipForUpload(params.visitId);
  if (verification.status !== "valid") {
    throw new Error("Invalid visit for photo upload.");
  }

  // 2. Check if already uploaded (maybe replace or ignore)
  // const existingPhoto = await getPhotoByVisitId(params.visitId);

  // 3. Create photo record
  const photoId = await createVisitPhoto({
    visitId: params.visitId,
    storagePath: params.storagePath,
    originalFilename: params.originalFilename,
    mimeType: params.mimeType,
    fileSizeBytes: params.fileSizeBytes,
    approvalStatus: "approved", // MVP rule
  });

  // 4. Update visit status
  await updateVisitStatus(params.visitId, "photo_uploaded");

  // 5. Funnel event
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = verification.visit as any;
  await recordFunnelEvent({
    eventName: "photo_uploaded",
    checkinCodeId: v.checkin_code_id,
    attractionId: v.attraction_id,
    touristId: v.tourist_id,
    visitId: String(params.visitId)
  });

  return photoId;
}
