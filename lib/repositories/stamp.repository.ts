import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function getTouristStampByAttraction(touristId: string, attractionId: number) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourist_stamps")
    .select("*")
    .eq("tourist_id", touristId)
    .eq("attraction_id", attractionId)
    .single();

  if (error && error.code !== "PGRST116") {
    throw new Error(`Failed to fetch stamp: ${error.message}`);
  }

  return data || null;
}

export async function awardTouristStamp(params: {
  touristId: string;
  attractionId: number;
  visitId: string;
}) {
  const supabase = createSupabaseServiceRoleClient();
  
  // 1. Get the first active stamp definition for this attraction
  const { data: stampDef } = await supabase
    .from("stamp_definitions")
    .select("stamp_definition_id")
    .eq("attraction_id", params.attractionId)
    .eq("is_active", true)
    .limit(1)
    .single();

  if (!stampDef) {
    return null;
  }

  // 2. Insert the stamp
  const { data, error } = await supabase
    .from("tourist_stamps")
    .insert({
      tourist_id: params.touristId,
      attraction_id: params.attractionId,
      visit_id: params.visitId,
      stamp_definition_id: stampDef.stamp_definition_id,
      status: "earned"
    })
    .select("stamp_id")
    .single();

  if (error) {
    // 23505 is unique violation in postgres
    if (error.code === '23505') {
      return null; // Already awarded
    }
    throw new Error(`Failed to award stamp: ${error.message}`);
  }

  return data.stamp_id;
}
