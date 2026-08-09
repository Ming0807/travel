"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { AttractionFeedbackService } from "@/lib/services/attraction-feedback.service";
import {
  actionTransitionInputSchema,
  improvementActionInputSchema,
  issueReviewInputSchema,
} from "@/lib/validation/attraction-feedback";

function positiveInt(value: FormDataEntryValue | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function workspacePath(attractionId: number, result: string) {
  return `/admin/attractions/${attractionId}/improvements?result=${encodeURIComponent(result)}`;
}

export async function reviewAttractionFeedbackAction(formData: FormData) {
  const attractionId = positiveInt(formData.get("attractionId"));
  if (!attractionId) redirect("/admin/attractions");
  const service = new AttractionFeedbackService();
  let result = "issue_saved";
  try {
    const input = issueReviewInputSchema.parse({
      attractionId,
      dateStart: String(formData.get("dateStart") ?? ""),
      dateEnd: String(formData.get("dateEnd") ?? ""),
      comparisonStart: String(formData.get("comparisonStart") ?? "") || undefined,
      comparisonEnd: String(formData.get("comparisonEnd") ?? "") || undefined,
      issueDimension: String(formData.get("issueDimension") ?? "overall"),
      issueCategory: String(formData.get("issueCategory") ?? "other"),
      decision: String(formData.get("decision") ?? "accept"),
      reviewNote: String(formData.get("reviewNote") ?? ""),
    });
    await service.reviewCandidate(input);
  } catch {
    result = "issue_failed";
  }
  revalidatePath(`/admin/attractions/${attractionId}/improvements`);
  redirect(workspacePath(attractionId, result));
}

export async function createAttractionImprovementAction(formData: FormData) {
  const attractionId = positiveInt(formData.get("attractionId"));
  if (!attractionId) redirect("/admin/attractions");
  const service = new AttractionFeedbackService();
  let result = "action_created";
  try {
    const input = improvementActionInputSchema.parse({
      issueId: String(formData.get("issueId") ?? ""),
      title: String(formData.get("title") ?? ""),
      proposedAction: String(formData.get("proposedAction") ?? ""),
      ownerAdminId: String(formData.get("ownerAdminId") ?? ""),
      priority: String(formData.get("priority") ?? "medium"),
      dueDate: String(formData.get("dueDate") ?? ""),
      followUpMetric: String(formData.get("followUpMetric") ?? "overall_score"),
      followUpStart: String(formData.get("followUpStart") ?? ""),
      followUpEnd: String(formData.get("followUpEnd") ?? ""),
    });
    await service.createAction(input);
  } catch {
    result = "action_failed";
  }
  revalidatePath(`/admin/attractions/${attractionId}/improvements`);
  redirect(workspacePath(attractionId, result));
}

export async function transitionAttractionImprovementAction(formData: FormData) {
  const attractionId = positiveInt(formData.get("attractionId"));
  if (!attractionId) redirect("/admin/attractions");
  const service = new AttractionFeedbackService();
  let result = "action_updated";
  try {
    const input = actionTransitionInputSchema.parse({
      actionId: String(formData.get("actionId") ?? ""),
      toStatus: String(formData.get("toStatus") ?? ""),
      note: String(formData.get("note") ?? "") || undefined,
      completionEvidenceNote: String(formData.get("completionEvidenceNote") ?? "") || undefined,
    });
    await service.transitionAction(input);
  } catch {
    result = "action_transition_failed";
  }
  revalidatePath(`/admin/attractions/${attractionId}/improvements`);
  redirect(workspacePath(attractionId, result));
}

export async function closeAttractionFeedbackIssueAction(formData: FormData) {
  const attractionId = positiveInt(formData.get("attractionId"));
  if (!attractionId) redirect("/admin/attractions");
  const service = new AttractionFeedbackService();
  let result = "issue_closed";
  try {
    await service.closeIssue(
      String(formData.get("issueId") ?? ""),
      String(formData.get("note") ?? ""),
    );
  } catch {
    result = "issue_close_failed";
  }
  revalidatePath(`/admin/attractions/${attractionId}/improvements`);
  redirect(workspacePath(attractionId, result));
}
