"use server";

import { redirect } from "next/navigation";
import { skipPostCertificateSurvey, submitPostCertificateSurvey } from "@/lib/services/survey.service";
import { postCertificateSurveySchema, surveyActionVisitSchema } from "@/lib/validation/survey";

export async function submitPostCertificateSurveyAction(formData: FormData) {
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
    revisitIntention: formData.get("revisitIntention"),
    recommendIntention: formData.get("recommendIntention"),
    optionalComment: formData.get("optionalComment")
  });

  if (!parsed.success) {
    const visitId = String(formData.get("visitId") || "");
    redirect(`/visit/${visitId}/survey?error=invalid`);
  }

  await submitPostCertificateSurvey(parsed.data);
  redirect(`/visit/${parsed.data.visitId}/survey/success`);
}

export async function skipPostCertificateSurveyAction(formData: FormData) {
  const parsed = surveyActionVisitSchema.safeParse({
    visitId: formData.get("visitId")
  });

  if (!parsed.success) {
    redirect("/passport");
  }

  await skipPostCertificateSurvey(parsed.data.visitId);
  redirect(`/visit/${parsed.data.visitId}/survey/success?skipped=1`);
}
