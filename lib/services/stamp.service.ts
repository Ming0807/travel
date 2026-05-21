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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = visit as any;

  // Check if tourist already has a stamp for this attraction
  const existing = await getTouristStampByAttraction(v.tourist_id, v.attraction_id);
  if (existing) {
    return { success: true, status: "already_earned", stampId: existing.stamp_id };
  }

  try {
    const stampId = await awardTouristStamp({
      touristId: v.tourist_id,
      attractionId: v.attraction_id,
      visitId,
    });

    if (!stampId) {
      const afterConflict = await getTouristStampByAttraction(v.tourist_id, v.attraction_id);
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
