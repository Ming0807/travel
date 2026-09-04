import "server-only";

import type { CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import { findNfcTagByToken } from "@/lib/repositories/nfc-tag.repository";
import { isNfcAssignmentCurrent, nfcCheckinCodeSchema, nfcTokenSchema } from "@/lib/nfc/contract";
import { resolveAndValidateCheckinCode } from "@/lib/services/checkin.service";

export type NfcCheckinResolution =
  | { status: "valid"; tagId: string; entryChannel: "nfc"; details: CheckinCodeDetails }
  | { status: "not_found" | "inactive" | "revoked" | "reassigned" | "unavailable" };

export async function resolveNfcCheckin(code: string, token: string): Promise<NfcCheckinResolution> {
  if (!nfcCheckinCodeSchema.safeParse(code).success || !nfcTokenSchema.safeParse(token).success) {
    return { status: "not_found" };
  }
  try {
    const tag = await findNfcTagByToken(token);
    if (!tag || tag.assignment.code !== code) return { status: "not_found" };
    if (tag.status === "revoked") return { status: "revoked" };
    if (tag.status !== "active") return { status: "inactive" };
    if (!tag.currentAssignment || !isNfcAssignmentCurrent(tag.assignment, tag.currentAssignment)) {
      return { status: "reassigned" };
    }
    const context = await resolveAndValidateCheckinCode(code);
    if (context.status !== "valid" || !context.details) return { status: "unavailable" };
    const details = context.details;
    if (details.checkin_code_id !== tag.assignment.checkinCodeId
      || details.code !== code
      || details.attraction?.attraction_id !== tag.assignment.attractionId
      || (details.photo_spot?.photo_spot_id ?? null) !== tag.assignment.photoSpotId) {
      return { status: "reassigned" };
    }
    return { status: "valid", tagId: tag.tagId, entryChannel: "nfc", details };
  } catch {
    // A registry outage cannot turn a revoked/unknown tag into a QR success.
    return { status: "unavailable" };
  }
}
