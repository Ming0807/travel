import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function recordFunnelEvent(params: {
  eventName: string;
  checkinCodeId?: number;
  attractionId?: number;
  touristId?: string;
  visitId?: string;
  sessionId?: string | null;
}) {
  const supabase = createSupabaseServiceRoleClient();

  if (params.sessionId && params.checkinCodeId) {
    const { data: existing } = await supabase
      .from("funnel_events")
      .select("event_id")
      .eq("event_type", params.eventName)
      .eq("checkin_code_id", params.checkinCodeId)
      .contains("metadata", { session_id: params.sessionId })
      .limit(1)
      .maybeSingle();

    if (existing) return;
  }

  const { error } = await supabase
    .from("funnel_events")
    .insert({
      event_type: params.eventName,
      checkin_code_id: params.checkinCodeId || null,
      tourist_id: params.touristId || null,
      visit_id: params.visitId || null,
      metadata: {
        ...(params.attractionId ? { attraction_id: params.attractionId } : {}),
        ...(params.sessionId ? { session_id: params.sessionId } : {}),
      },
    });

  if (error) {
    console.error("Failed to record funnel event:", error);
  }
}
