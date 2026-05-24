import "server-only";
import { awardXP, evaluateBadges } from "./xp.service";
import type { XPSource } from "./xp.service";

/**
 * Award XP for a QR check-in and evaluate badges.
 * Call this after a successful check-in flow.
 */
export async function awardCheckinXP(
  touristId: string,
  visitId: string
): Promise<{ xpAmount: number; newBadges: number }> {
  const { amount } = await awardXP(touristId, "qr_checkin", { visit_id: visitId }, visitId);

  // Award bonus photo XP if photo was uploaded (check metadata)
  // Photo XP is handled separately in the photo upload flow

  const newBadges = await evaluateBadges(touristId);
  return { xpAmount: amount, newBadges: newBadges.length };
}

/**
 * Award XP for completing a survey and evaluate badges.
 * Call this after a successful survey submission.
 */
export async function awardSurveyXP(
  touristId: string,
  surveyId: string
): Promise<{ xpAmount: number; newBadges: number }> {
  const { amount } = await awardXP(touristId, "survey_completed", { survey_id: surveyId });
  const newBadges = await evaluateBadges(touristId);
  return { xpAmount: amount, newBadges: newBadges.length };
}

/**
 * Award XP for submitting a review and evaluate badges.
 * Call this after a successful review submission.
 */
export async function awardReviewXP(
  touristId: string,
  reviewId: string | number
): Promise<{ xpAmount: number; newBadges: number }> {
  const { amount } = await awardXP(touristId, "review_submitted", { review_id: String(reviewId) });
  const newBadges = await evaluateBadges(touristId);
  return { xpAmount: amount, newBadges: newBadges.length };
}

/**
 * Award XP for earning a stamp and evaluate badges.
 * Call this after a stamp is earned.
 */
export async function awardStampXP(
  touristId: string,
  visitId: string
): Promise<{ xpAmount: number; newBadges: number }> {
  const { amount } = await awardXP(touristId, "stamp_earned", { visit_id: visitId }, visitId);
  const newBadges = await evaluateBadges(touristId);
  return { xpAmount: amount, newBadges: newBadges.length };
}

/**
 * Award XP for a certificate generation and evaluate badges.
 * Call this after a certificate is generated.
 */
export async function awardCertificateXP(
  touristId: string,
  visitId: string
): Promise<{ xpAmount: number; newBadges: number }> {
  const { amount } = await awardXP(touristId, "certificate_generated", { visit_id: visitId }, visitId);
  const newBadges = await evaluateBadges(touristId);
  return { xpAmount: amount, newBadges: newBadges.length };
}

/**
 * Award XP for a restaurant visit.
 */
export async function awardRestaurantVisitXP(
  touristId: string,
  visitId: string
): Promise<{ xpAmount: number; newBadges: number }> {
  const { amount } = await awardXP(touristId, "restaurant_visit", { visit_id: visitId }, visitId);
  const newBadges = await evaluateBadges(touristId);
  return { xpAmount: amount, newBadges: newBadges.length };
}
