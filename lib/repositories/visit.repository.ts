import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function createVisit(params: {
  touristId: string;
  attractionId: number;
  photoSpotId?: number | null;
  checkinCodeId?: number | null;
  completionStatus: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  
  // Enforce the rule: "visit_date should not be far in the future, visit_date can be in the past"
  // For the MVP check-in flow, the visit date is recorded as today in the timezone of the server/DB.
  
  const { data, error } = await supabase
    .from("visits")
    .insert({
      tourist_id: params.touristId,
      attraction_id: params.attractionId,
      photo_spot_id: params.photoSpotId || null,
      checkin_code_id: params.checkinCodeId || null,
      completion_status: params.completionStatus,
    })
    .select("visit_id")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create visit record: ${error?.message}`);
  }

  return data.visit_id;
}

export async function getVisitById(visitId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("visits")
    .select(`
      *,
      tourists (*),
      attractions (
        *,
        provinces (*)
      )
    `)
    .eq("visit_id", visitId)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export async function updateVisitStatus(visitId: string, status: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("visits")
    .update({ completion_status: status })
    .eq("visit_id", visitId);

  if (error) {
    throw new Error(`Failed to update visit status: ${error.message}`);
  }
}

export async function updateVisitSurveyFields(
  visitId: string,
  params: {
    travelCompanionId: number | null;
    groupSize: number | null;
    transportModeId: number | null;
    travelPurposeId: number | null;
    overnightStatus: "same_day" | "overnight" | "unknown" | null;
    nightsCount: number | null;
  }
) {
  const supabase = createSupabaseServiceRoleClient();
  const { error } = await supabase
    .from("visits")
    .update({
      travel_companion_id: params.travelCompanionId,
      group_size: params.groupSize,
      transport_mode_id: params.transportModeId,
      travel_purpose_id: params.travelPurposeId,
      overnight_status: params.overnightStatus,
      nights: params.nightsCount
    })
    .eq("visit_id", visitId);

  if (error) {
    throw new Error(`Failed to update survey visit fields: ${error.message}`);
  }
}
