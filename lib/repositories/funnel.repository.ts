import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function recordFunnelEvent(params: {
  eventName: string;
  checkinCodeId?: number;
  attractionId?: number;
  touristId?: string;
  visitId?: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  
  // Note: we let this fail silently if needed, or just swallow errors in the service layer, 
  // because funnel tracking should not block the main user flow.
  const { error } = await supabase
    .from("funnel_events")
    .insert({
      event_type: params.eventName,
      checkin_code_id: params.checkinCodeId || null,
      tourist_id: params.touristId || null,
      visit_id: params.visitId || null,
      metadata: params.attractionId ? { attraction_id: params.attractionId } : {},
    });

  if (error) {
    console.error("Failed to record funnel event:", error);
  }
}
