import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { listLiveDestinationProvinceIds } from "@/lib/repositories/destination-scope.repository";

export async function listPassportStamps(touristId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("tourist_stamps")
    .select(`
      stamp_id,
      earned_at,
      status,
      stamp_definitions (
        stamp_name_th,
        stamp_name_en,
        stamp_image_path
      ),
      attractions (
        slug,
        name_th,
        name_en,
        provinces (
          province_name_th,
          province_name_en
        )
      )
    `)
    .eq("tourist_id", touristId)
    .eq("status", "earned")
    .order("earned_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch passport stamps: ${error.message}`);
  }

  return data || [];
}

export async function listPublishedAttractionStampTargets() {
  const supabase = createSupabaseServiceRoleClient();
  const liveProvinceIds = await listLiveDestinationProvinceIds();
  if (liveProvinceIds.length === 0) return [];
  const { data, error } = await supabase
    .from("attractions")
    .select(`
      slug,
      name_th,
      name_en,
      provinces (
        province_name_th,
        province_name_en
      ),
      stamp_definitions!inner (
        stamp_definition_id,
        is_active
      )
    `)
    .eq("is_active", true)
    .eq("is_published", true)
    .in("province_id", liveProvinceIds)
    .eq("stamp_definitions.is_active", true);

  if (error) {
    throw new Error(`Failed to fetch stamp targets: ${error.message}`);
  }

  return data || [];
}
