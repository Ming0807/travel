"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  assessAdminResearchOperatorAttempt,
  activateAdminResearchStudy,
  createAdminResearchInstrument,
  createAdminResearchItem,
  createAdminResearchOperatorTask,
  createAdminResearchStudy,
  publishAdminResearchInstrument,
  publishAdminResearchOperatorTask,
  recordAdminResearchApproval,
  saveAdminResearchDeployment,
  transitionAdminResearchStudy,
} from "@/lib/services/admin-research.service";
import type { ResearchStudyStatus } from "@/lib/repositories/admin-research.repository";

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function positiveInt(formData: FormData, key: string) {
  const value = Number(formData.get(key));
  return Number.isInteger(value) && value > 0 ? value : 0;
}

function dayToIso(value: string, end = false): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  return `${value}T${end ? "23:59:59" : "00:00:00"}+07:00`;
}

function detailPath(studyId: string, result: string) {
  return `/admin/research/${encodeURIComponent(studyId)}?result=${encodeURIComponent(result)}`;
}

export async function createResearchStudyAction(formData: FormData) {
  let studyId: string | null = null;
  try {
    const study = await createAdminResearchStudy({
      studyCode: text(formData, "studyCode"),
      titleTh: text(formData, "titleTh"),
      titleEn: text(formData, "titleEn") || undefined,
      protocolVersion: text(formData, "protocolVersion"),
      consentVersion: text(formData, "consentVersion"),
      noticeVersion: text(formData, "noticeVersion"),
      purposeTh: text(formData, "purposeTh"),
      participationTh: text(formData, "participationTh"),
      privacyTh: text(formData, "privacyTh"),
      withdrawalTh: text(formData, "withdrawalTh"),
      contactEmail: text(formData, "contactEmail"),
      scopeCode: text(formData, "scopeCode"),
      status: "draft",
      startsAt: dayToIso(text(formData, "startsAt")),
      endsAt: dayToIso(text(formData, "endsAt"), true),
      retentionUntil: dayToIso(text(formData, "retentionUntil"), true),
    });
    studyId = study.researchStudyId;
  } catch {
    redirect("/admin/research?result=study_failed");
  }
  redirect(detailPath(studyId, "study_created"));
}

export async function recordResearchApprovalAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "approval_recorded";
  try {
    if (formData.get("confirmRecordedEvidence") !== "true") throw new Error("CONFIRM_REQUIRED");
    const ethicsReviewStatus = text(formData, "ethicsReviewStatus") === "approved" ? "approved" as const : "not_required" as const;
    await recordAdminResearchApproval({
      studyId,
      advisorApprovedAt: dayToIso(text(formData, "advisorApprovedAt")) ?? "",
      ethicsReviewStatus,
      ethicsApprovedAt: ethicsReviewStatus === "approved" ? dayToIso(text(formData, "ethicsApprovedAt")) : undefined,
      approvalReference: text(formData, "approvalReference"),
      confirmRecordedEvidence: true,
    });
  } catch {
    result = "approval_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}

export async function createResearchInstrumentAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "instrument_created";
  try {
    const audienceValue = text(formData, "audience");
    const audience = audienceValue === "operator" || audienceValue === "attraction_manager" ? audienceValue : "tourist";
    await createAdminResearchInstrument({
      studyId,
      instrumentKey: text(formData, "instrumentKey"),
      versionNumber: positiveInt(formData, "versionNumber"),
      audience,
      status: "draft",
      titleTh: text(formData, "titleTh"),
      titleEn: text(formData, "titleEn") || undefined,
      descriptionTh: text(formData, "descriptionTh") || undefined,
      descriptionEn: text(formData, "descriptionEn") || undefined,
      estimatedMinutes: positiveInt(formData, "estimatedMinutes") || undefined,
    });
  } catch {
    result = "instrument_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}

export async function createResearchItemAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "item_created";
  try {
    const answerTypeValue = text(formData, "answerType");
    const answerType = ["agreement_5", "rating_5", "boolean", "integer", "single_choice", "short_text", "long_text"].includes(answerTypeValue)
      ? answerTypeValue as "agreement_5" | "rating_5" | "boolean" | "integer" | "single_choice" | "short_text" | "long_text"
      : "agreement_5";
    const base = {
      instrumentId: text(formData, "instrumentId"),
      itemCode: text(formData, "itemCode"),
      constructKey: text(formData, "constructKey"),
      promptTh: text(formData, "promptTh"),
      promptEn: text(formData, "promptEn") || undefined,
      displayOrder: positiveInt(formData, "displayOrder"),
      isRequired: formData.get("isRequired") === "true",
      reverseScore: formData.get("reverseScore") === "true",
    };
    if (answerType === "single_choice") {
      await createAdminResearchItem({ ...base, answerType, options: text(formData, "options").split(/\r?\n/).map((option) => option.trim()).filter(Boolean) });
    } else {
      await createAdminResearchItem({ ...base, answerType });
    }
  } catch {
    result = "item_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}

export async function publishResearchInstrumentAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "instrument_published";
  try {
    if (formData.get("confirmFreeze") !== "true") throw new Error("CONFIRM_REQUIRED");
    await publishAdminResearchInstrument(text(formData, "instrumentId"));
  } catch {
    result = "instrument_publish_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}

export async function saveResearchDeploymentAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "deployment_saved";
  try {
    const rawMode = text(formData, "collectionMode");
    const collectionMode = rawMode === "simulated_usability" || rawMode === "pilot_internal" ? rawMode : "field_observation";
    await saveAdminResearchDeployment({
      studyId,
      checkinCodeId: positiveInt(formData, "checkinCodeId"),
      collectionMode,
      isActive: formData.get("isActive") === "true",
      startsAt: dayToIso(text(formData, "startsAt")),
      endsAt: dayToIso(text(formData, "endsAt"), true),
    });
  } catch {
    result = "deployment_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}

export async function createResearchOperatorTaskAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "operator_task_created";
  try {
    const audience = text(formData, "audience") === "attraction_manager" ? "attraction_manager" as const : "operator" as const;
    const requiredEvidence = text(formData, "requiredEvidence").split(/\r?\n|,/).map((value) => value.trim()).filter(Boolean);
    await createAdminResearchOperatorTask({
      studyId,
      taskCode: text(formData, "taskCode"),
      versionNumber: positiveInt(formData, "versionNumber"),
      audience,
      status: "draft",
      titleTh: text(formData, "titleTh"),
      titleEn: text(formData, "titleEn") || undefined,
      instructionTh: text(formData, "instructionTh"),
      instructionEn: text(formData, "instructionEn") || undefined,
      expectedEvidence: text(formData, "expectedEvidence"),
      scoringRule: { required_evidence: requiredEvidence, pass_rule: text(formData, "passRule") },
      displayOrder: positiveInt(formData, "displayOrder"),
      maximumMinutes: positiveInt(formData, "maximumMinutes") || undefined,
    });
  } catch {
    result = "operator_task_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}

export async function publishResearchOperatorTaskAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "operator_task_published";
  try {
    if (formData.get("confirmFreeze") !== "true") throw new Error("CONFIRM_REQUIRED");
    await publishAdminResearchOperatorTask({ studyId, taskId: text(formData, "taskId"), confirmFreeze: true });
  } catch {
    result = "operator_task_publish_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}

export async function assessResearchOperatorAttemptAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "operator_assessment_saved";
  try {
    await assessAdminResearchOperatorAttempt({
      studyId,
      attemptId: text(formData, "attemptId"),
      outcome: text(formData, "outcome") as "passed" | "partial" | "failed",
      evidenceQuality: Number(formData.get("evidenceQuality")),
      reviewNote: text(formData, "reviewNote") || undefined,
    });
  } catch {
    result = "operator_assessment_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(`/admin/research/${studyId}?result=${result}`);
}

export async function activateResearchStudyAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "study_activated";
  try {
    if (formData.get("confirmFreeze") !== "true") throw new Error("CONFIRM_REQUIRED");
    await activateAdminResearchStudy({ studyId, confirmFreeze: true });
  } catch {
    result = "activation_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}

export async function transitionResearchStudyAction(formData: FormData) {
  const studyId = text(formData, "studyId");
  let result = "study_status_updated";
  try {
    await transitionAdminResearchStudy({
      studyId,
      fromStatus: text(formData, "fromStatus") as ResearchStudyStatus,
      toStatus: text(formData, "toStatus") as ResearchStudyStatus,
    });
  } catch {
    result = "study_status_failed";
  }
  revalidatePath(`/admin/research/${studyId}`);
  redirect(detailPath(studyId, result));
}
