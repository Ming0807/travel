import "server-only";
import { TouristAccessError, requireTouristVisitAccess } from "@/lib/auth/guards";
import { getCertificateByVisitId } from "@/lib/repositories/certificate.repository";
import { upsertVisitExpense } from "@/lib/repositories/expense.repository";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";
import { getSurveyOptions, getSatisfactionSurveyByVisitId, upsertSatisfactionSurvey } from "@/lib/repositories/survey.repository";
import { updateVisitStatus, updateVisitSurveyFields } from "@/lib/repositories/visit.repository";
import type { PostCertificateSurveyInput } from "@/lib/validation/survey";

export class SurveyFlowError extends Error {
  constructor(
    public readonly code:
      | "VISIT_NOT_FOUND"
      | "VISIT_ACCESS_DENIED"
      | "CERTIFICATE_REQUIRED"
      | "SURVEY_SAVE_FAILED",
    message: string
  ) {
    super(message);
    this.name = "SurveyFlowError";
  }
}

function mapAccessError(error: unknown): never {
  if (error instanceof TouristAccessError) {
    if (error.code === "VISIT_NOT_FOUND") {
      throw new SurveyFlowError("VISIT_NOT_FOUND", "ไม่พบข้อมูลการเข้าชมนี้");
    }
    throw new SurveyFlowError("VISIT_ACCESS_DENIED", "คุณไม่มีสิทธิ์เข้าถึงข้อมูลนี้");
  }

  throw error;
}

async function requireSurveyEligibleVisit(visitId: string) {
  try {
    const access = await requireTouristVisitAccess(visitId);
    const certificate = await getCertificateByVisitId(visitId);

    if (!certificate && access.visit.completion_status !== "certificate_generated" && access.visit.completion_status !== "survey_completed") {
      throw new SurveyFlowError("CERTIFICATE_REQUIRED", "กรุณาสร้างใบประกาศก่อนทำแบบสอบถาม");
    }

    return { ...access, certificate };
  } catch (error) {
    mapAccessError(error);
  }
}

export async function getPostCertificateSurveyPageData(visitId: string) {
  const access = await requireSurveyEligibleVisit(visitId);
  const [options, existingSurvey] = await Promise.all([
    getSurveyOptions(),
    getSatisfactionSurveyByVisitId(visitId)
  ]);

  await recordFunnelEvent({
    eventName: "survey_started",
    checkinCodeId: access.visit.checkin_code_id || undefined,
    attractionId: access.visit.attraction_id,
    touristId: access.touristId,
    visitId
  });

  return {
    visit: access.visit,
    options,
    existingSurvey
  };
}

export async function submitPostCertificateSurvey(input: PostCertificateSurveyInput) {
  const access = await requireSurveyEligibleVisit(input.visitId);

  try {
    await updateVisitSurveyFields(input.visitId, {
      travelCompanionId: input.travelCompanionId,
      groupSize: input.groupSize,
      transportModeId: input.transportModeId,
      travelPurposeId: input.travelPurposeId,
      overnightStatus: input.overnightStatus,
      nightsCount: input.nightsCount
    });

    await upsertVisitExpense({
      visitId: input.visitId,
      expenseCategoryId: input.expenseCategoryId,
      spendingRangeId: input.spendingRangeId
    });

    await upsertSatisfactionSurvey({
      visitId: input.visitId,
      touristId: access.touristId,
      attractionId: access.visit.attraction_id,
      overallScore: input.overallSatisfaction,
      safetyScore: input.safetyScore,
      cleanlinessScore: input.cleanlinessScore,
      accessibilityScore: input.accessibilityScore,
      informationScore: input.informationScore,
      valueScore: input.valueScore,
      revisitIntention: input.revisitIntention,
      recommendIntention: input.recommendIntention,
      comment: input.optionalComment
    });

    await updateVisitStatus(input.visitId, "survey_completed");
    await recordFunnelEvent({
      eventName: "survey_completed",
      checkinCodeId: access.visit.checkin_code_id || undefined,
      attractionId: access.visit.attraction_id,
      touristId: access.touristId,
      visitId: input.visitId
    });
  } catch (error) {
    console.error("Survey submit failed:", error);
    throw new SurveyFlowError("SURVEY_SAVE_FAILED", "เกิดข้อผิดพลาด กรุณาลองใหม่");
  }
}

export async function skipPostCertificateSurvey(visitId: string) {
  const access = await requireSurveyEligibleVisit(visitId);
  await recordFunnelEvent({
    eventName: "survey_skipped",
    checkinCodeId: access.visit.checkin_code_id || undefined,
    attractionId: access.visit.attraction_id,
    touristId: access.touristId,
    visitId
  });
}
