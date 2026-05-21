import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export interface CheckinCodeDetails {
  checkin_code_id: number;
  code: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  attraction: {
    attraction_id: number;
    name_th: string;
    name_en: string | null;
    short_description_th: string | null;
    is_active: boolean;
    is_published: boolean;
    province: {
      province_name_th: string;
    } | null;
  } | null;
  photo_spot: {
    photo_spot_id: number;
    spot_name_th: string;
    is_active: boolean;
  } | null;
}

export async function getCheckinCodeByCode(code: string): Promise<CheckinCodeDetails | null> {
  const supabase = createSupabaseServiceRoleClient();
  
  const { data, error } = await supabase
    .from("checkin_codes")
    .select(`
      checkin_code_id,
      code,
      is_active,
      starts_at,
      ends_at,
      attractions (
        attraction_id,
        name_th,
        name_en,
        short_description_th,
        is_active,
        is_published,
        provinces (
          province_name_th
        )
      ),
      photo_spots (
        photo_spot_id,
        spot_name_th,
        is_active
      )
    `)
    .eq("code", code)
    .single();

  if (error || !data) {
    return null;
  }

  // Map the nested join objects since PostgREST returns them as arrays or objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attractionData = data.attractions as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photoSpotData = data.photo_spots as any;
  
  return {
    checkin_code_id: data.checkin_code_id,
    code: data.code,
    is_active: data.is_active,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    attraction: attractionData ? {
      attraction_id: attractionData.attraction_id,
      name_th: attractionData.name_th,
      name_en: attractionData.name_en,
      short_description_th: attractionData.short_description_th,
      is_active: attractionData.is_active,
      is_published: attractionData.is_published,
      province: attractionData.provinces ? {
        province_name_th: attractionData.provinces.province_name_th
      } : null
    } : null,
    photo_spot: photoSpotData ? {
      photo_spot_id: photoSpotData.photo_spot_id,
      spot_name_th: photoSpotData.spot_name_th,
      is_active: photoSpotData.is_active
    } : null,
  };
}
