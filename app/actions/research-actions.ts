"use server";

import { redirect } from "next/navigation";

import {
  acceptFacilitatedResearchOperator,
  acceptResearchInvitation,
  saveCurrentResearchResponse,
  saveCurrentResearchOperatorAttempt,
  withdrawResearchSession,
} from "@/lib/services/research.service";
import { researchOperatorAttemptSchema, researchResponseInputSchema } from "@/lib/validation/research";

function safeReturnPath(value: FormDataEntryValue | null, fallback: string) {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return fallback;
  return value;
}

export async function acceptResearchInvitationAction(formData: FormData) {
  const studyCode = String(formData.get("studyCode") ?? "");
  const checkinCode = String(formData.get("checkinCode") ?? "");
  const returnTo = safeReturnPath(formData.get("returnTo"), `/checkin/${encodeURIComponent(checkinCode)}/start`);
  const invitePath = `/research/${encodeURIComponent(studyCode)}/invite?checkinCode=${encodeURIComponent(checkinCode)}&returnTo=${encodeURIComponent(returnTo)}`;

  if (formData.get("hasConsented") !== "true") {
    redirect(`${invitePath}&error=consent_required`);
  }

  try {
    const returnUrl = new URL(returnTo, "https://research.invalid");
    const flowValues = returnUrl.searchParams.getAll("flow");
    if (flowValues.length > 1) throw new Error("RESEARCH_ENTRY_INVALID");
    if (flowValues.length && returnUrl.pathname !== `/checkin/${encodeURIComponent(checkinCode)}/start`) {
      throw new Error("RESEARCH_ENTRY_INVALID");
    }
    await acceptResearchInvitation({
      studyCode,
      checkinCode,
      hasConsented: true,
      ...(flowValues.length ? { entrySessionId: flowValues[0] } : {}),
      language: formData.get("language") === "en" || formData.get("language") === "ms" ? String(formData.get("language")) as "en" | "ms" : "th",
    });
  } catch {
    redirect(`${invitePath}&error=unavailable`);
  }

  redirect(`${returnTo}${returnTo.includes("?") ? "&" : "?"}research=accepted`);
}

export async function saveResearchEvaluationAction(input: unknown) {
  const parsed = researchResponseInputSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "ข้อมูลคำตอบไม่ถูกต้อง" };
  }

  try {
    const result = await saveCurrentResearchResponse(parsed.data);
    return { success: true as const, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "ยังบันทึกคำตอบไม่ได้ กรุณาลองใหม่";
    return { success: false as const, error: message };
  }
}

export async function acceptResearchOperatorInvitationAction(formData: FormData) {
  const studyId = String(formData.get("studyId") ?? "");
  const studyCode = String(formData.get("studyCode") ?? "");
  const idempotencyKey = String(formData.get("idempotencyKey") ?? "");
  const participantType = formData.get("participantType") === "attraction_manager"
    ? "attraction_manager" as const
    : "operator" as const;
  const collectionModeValue = String(formData.get("collectionMode") ?? "field_observation");
  const collectionMode = collectionModeValue === "simulated_usability" || collectionModeValue === "pilot_internal"
    ? collectionModeValue
    : "field_observation" as const;
  const returnPath = `/admin/research/${encodeURIComponent(studyId)}/operator/start?participantType=${participantType}`;

  if (formData.get("hasConsented") !== "true") {
    redirect(`${returnPath}&error=consent_required`);
  }

  try {
    await acceptFacilitatedResearchOperator({
      studyId,
      studyCode,
      idempotencyKey,
      participantType,
      collectionMode,
      language: "th",
      hasConsented: true,
    });
  } catch {
    redirect(`${returnPath}&error=unavailable`);
  }
  redirect("/research/operator/tasks");
}

export async function saveResearchOperatorAttemptAction(input: unknown) {
  const parsed = researchOperatorAttemptSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "ข้อมูลการตัดสินใจไม่ถูกต้อง" };
  }
  try {
    const result = await saveCurrentResearchOperatorAttempt(parsed.data);
    return { success: true as const, ...result };
  } catch (error) {
    return { success: false as const, error: error instanceof Error ? error.message : "ยังบันทึกงานไม่ได้ กรุณาลองใหม่" };
  }
}

export async function withdrawResearchSessionAction(formData: FormData) {
  const reason = String(formData.get("reason") ?? "").trim();
  const visitId = formData.get("visitId");
  const visitQuery = typeof visitId === "string" ? `visitId=${encodeURIComponent(visitId)}&` : "";
  try {
    await withdrawResearchSession({
      ...(typeof visitId === "string" ? { visitId } : {}),
      reason: reason || undefined,
      source: "tourist_withdrawal_page",
    });
  } catch {
    redirect(`/research/withdraw/current?${visitQuery}error=withdrawal_failed`);
  }
  redirect("/research/withdraw/current?success=1");
}
