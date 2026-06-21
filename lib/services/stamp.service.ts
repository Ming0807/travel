import "server-only";
import { awardTouristStamp, getTouristStampByAttraction } from "@/lib/repositories/stamp.repository";
import { getVisitById } from "@/lib/repositories/visit.repository";

export type StampAwardResult =
  | { success: true; status: "earned"; stampId: string }
  | { success: true; status: "already_earned"; stampId: string }
  | { success: true; status: "no_active_stamp_definition" }
  | { success: false; reason: "visit_not_found" | "stamp_award_failed" };

export async function assignStampForVisit(visitId: string): Promise<StampAwardResult> {
  const visit = await getVisitById(visitId);
  if (!visit) {
    return { success: false, reason: "visit_not_found" };
  }

  const visitContext = {
    touristId: String(visit.tourist_id),
    attractionId: Number(visit.attraction_id),
  };

  // Check if tourist already has a stamp for this attraction
  const existing = await getTouristStampByAttraction(visitContext.touristId, visitContext.attractionId);
  if (existing) {
    return { success: true, status: "already_earned", stampId: existing.stamp_id };
  }

  try {
    const stampId = await awardTouristStamp({
      touristId: visitContext.touristId,
      attractionId: visitContext.attractionId,
      visitId,
    });

    if (!stampId) {
      const afterConflict = await getTouristStampByAttraction(visitContext.touristId, visitContext.attractionId);
      if (afterConflict) {
        return { success: true, status: "already_earned", stampId: afterConflict.stamp_id };
      }

      return { success: true, status: "no_active_stamp_definition" };
    }

    return { success: true, status: "earned", stampId };
  } catch {
    return { success: false, reason: "stamp_award_failed" };
  }
}
