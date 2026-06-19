import "server-only";
import { createVisit as createVisitRepo } from "@/lib/repositories/visit.repository";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";

export async function initiateVisit(params: {
  touristId: string;
  attractionId: number;
  photoSpotId?: number | null;
  checkinCodeId?: number | null;
}): Promise<string> {
  const visitId = await createVisitRepo({
    touristId: params.touristId,
    attractionId: params.attractionId,
    photoSpotId: params.photoSpotId,
    checkinCodeId: params.checkinCodeId,
    completionStatus: "minimal_form_completed", // Marked as minimal form completed since they just submitted it
  });

  // Track the funnel event for completing the minimal form
  await recordFunnelEvent({
    eventName: "minimal_form_completed",
    checkinCodeId: params.checkinCodeId || undefined,
    attractionId: params.attractionId,
    touristId: params.touristId,
    visitId: visitId,
  });

  return visitId;
}
