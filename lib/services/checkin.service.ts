import "server-only";
import { getCheckinSessionId } from "@/lib/auth/checkin-session";
import { getCheckinCodeByCode, CheckinCodeDetails } from "@/lib/repositories/checkin.repository";
import { recordFunnelEvent } from "@/lib/repositories/funnel.repository";

export interface ResolvedCheckinContext {
  status: "valid" | "not_found" | "inactive" | "expired" | "unavailable";
  details?: CheckinCodeDetails;
}

export async function resolveAndValidateCheckinCode(code: string): Promise<ResolvedCheckinContext> {
  const details = await getCheckinCodeByCode(code);
  
  if (!details) {
    return { status: "not_found" };
  }

  if (!details.is_active) {
    return { status: "inactive", details };
  }

  const now = new Date();
  if (details.starts_at && new Date(details.starts_at) > now) {
    return { status: "inactive", details };
  }
  if (details.ends_at && new Date(details.ends_at) < now) {
    return { status: "expired", details };
  }

  if (!details.attraction || !details.attraction.is_active || !details.attraction.is_published) {
    return { status: "unavailable", details };
  }

  if (details.photo_spot && !details.photo_spot.is_active) {
    return { status: "unavailable", details };
  }

  return { status: "valid", details };
}

export type FunnelEventName = 
  | "qr_scanned"
  | "landing_viewed"
  | "certificate_started"
  | "minimal_form_completed"
  | "photo_uploaded"
  | "certificate_generated"
  | "survey_started"
  | "survey_completed"
  | "passport_saved";

export async function trackCheckinFunnelEvent(
  eventName: FunnelEventName, 
  codeDetails: CheckinCodeDetails,
  extra?: { touristId?: string; visitId?: string }
) {
  const sessionId = await getCheckinSessionId();
  await recordFunnelEvent({
    eventName,
    checkinCodeId: codeDetails.checkin_code_id,
    attractionId: codeDetails.attraction?.attraction_id,
    touristId: extra?.touristId,
    visitId: extra?.visitId,
    sessionId,
  });
}
