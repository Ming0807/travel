"use server";

import { redirect } from "next/navigation";
import { skipPostCertificateSurvey, submitPostCertificateSurvey, SurveyFlowError } from "@/lib/services/survey.service";
import { postCertificateSurveySchema, surveyActionVisitSchema } from "@/lib/validation/survey";

export type SurveyFormState = {
  message?: string;
};

function redirectForSurveyFlowError(visitId: string, error: SurveyFlowError): never {
  if (error.code === "VISIT_NOT_FOUND" || error.code === "VISIT_ACCESS_DENIED") {
    redirect("/passport");
  }

  redirect(`/visit/${visitId}/survey?error=${encodeURIComponent(error.code.toLowerCase())}`);
}

export async function submitPostCertificateSurveyAction(
  _previousState: SurveyFormState,
  formData: FormData,
): Promise<SurveyFormState> {
  const parsed = postCertificateSurveySchema.safeParse({
    visitId: formData.get("visitId"),
    travelCompanionId: formData.get("travelCompanionId"),
    groupSize: formData.get("groupSize"),
    transportModeId: formData.get("transportModeId"),
    travelPurposeId: formData.get("travelPurposeId"),
    overnightStatus: formData.get("overnightStatus"),
    nightsCount: formData.get("nightsCount"),
    spendingRangeId: formData.get("spendingRangeId"),
    expenseCategoryId: formData.get("expenseCategoryId"),
    overallSatisfaction: formData.get("overallSatisfaction"),
    safetyScore: formData.get("safetyScore"),
    cleanlinessScore: formData.get("cleanlinessScore"),
    accessibilityScore: formData.get("accessibilityScore"),
    informationScore: formData.get("informationScore"),
    valueScore: formData.get("valueScore"),
    facilityScore: formData.get("facilityScore"),
    revisitIntention: formData.get("revisitIntention"),
    recommendIntention: formData.get("recommendIntention"),
    optionalComment: formData.get("optionalComment")
  });

  if (!parsed.success) {
    return { message: "กรุณาตอบอย่างน้อยหนึ่งข้อ หรือเลือกข้ามแบบสอบถาม" };
  }

  try {
    await submitPostCertificateSurvey(parsed.data);
  } catch (error) {
    if (error instanceof SurveyFlowError) {
      if (error.code === "VISIT_NOT_FOUND" || error.code === "VISIT_ACCESS_DENIED") {
        redirect("/passport");
      }
      return { message: error.message };
    }

    console.error("Survey action failed:", error instanceof Error ? error.message : "unknown error");
    return { message: "ยังบันทึกคำตอบไม่ได้ กรุณาลองใหม่อีกครั้ง" };
  }

  redirect(`/visit/${parsed.data.visitId}/survey/success`);
}

export async function skipPostCertificateSurveyAction(formData: FormData) {
  const parsed = surveyActionVisitSchema.safeParse({
    visitId: formData.get("visitId")
  });

  if (!parsed.success) {
    redirect("/passport");
  }

  try {
    await skipPostCertificateSurvey(parsed.data.visitId);
  } catch (error) {
    if (error instanceof SurveyFlowError) {
      redirectForSurveyFlowError(parsed.data.visitId, error);
    }

    console.error("Survey skip failed:", error instanceof Error ? error.message : "unknown error");
    redirect(`/visit/${parsed.data.visitId}/survey?error=save_failed`);
  }

  redirect(`/visit/${parsed.data.visitId}/survey/success?skipped=1`);
}
