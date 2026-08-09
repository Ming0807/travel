import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import { siteMediaImageUrl } from "@/lib/media/storage-paths";
import { listLiveDestinationProvinceIds } from "@/lib/repositories/destination-scope.repository";

type JoinedRecord = Record<string, unknown>;

function joinedOne(value: unknown): JoinedRecord | null {
  if (Array.isArray(value)) return (value[0] as JoinedRecord | undefined) ?? null;
  return value && typeof value === "object" ? (value as JoinedRecord) : null;
}

function joinedMany(value: unknown): JoinedRecord[] {
  return Array.isArray(value) ? (value as JoinedRecord[]) : [];
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function publicCoverUrl(mediaValue: unknown): string | null {
  const media = joinedMany(mediaValue).filter((item) => {
    const lifecycleStatus = text(item.lifecycle_status);
    return item.is_active !== false && (!lifecycleStatus || lifecycleStatus === "active");
  });
  const cover = media.find((item) => item.is_cover === true) ?? media[0];
  return siteMediaImageUrl(text(cover?.storage_path));
}

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
    cover_image_url: string | null;
    province: {
      province_name_th: string;
      is_active: boolean;
      destination_status: string;
    } | null;
  } | null;
  photo_spot: {
    photo_spot_id: number;
    spot_name_th: string;
    is_active: boolean;
    sample_image_url: string | null;
  } | null;
}

export async function listPublicDemoCheckinCodes(): Promise<string[]> {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("checkin_codes")
    .select("code")
    .eq("is_active", true)
    .ilike("label", "Demo QR:%")
    .order("checkin_code_id", { ascending: true })
    .limit(5);

  if (error) {
    throw new Error("DEMO_CHECKIN_LOOKUP_FAILED", { cause: error });
  }

  return (data ?? [])
    .map((row) => text(row.code))
    .filter((code): code is string => code !== null);
}

export async function getCheckinCodeByCode(code: string): Promise<CheckinCodeDetails | null> {
  const supabase = createSupabaseServiceRoleClient();
  const liveProvinceIds = new Set(await listLiveDestinationProvinceIds());
  
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
        content_media (
          storage_path,
          is_cover,
          is_active,
          lifecycle_status,
          display_order
        ),
        provinces (
          province_id,
          province_name_th,
          province_name_en,
          is_active,
          is_target_area
        )
      ),
      photo_spots (
        photo_spot_id,
        spot_name_th,
        is_active,
        sample_image_path
      )
    `)
    .eq("code", code)
    .single();

  if (error || !data) {
    return null;
  }

  const attractionData = joinedOne(data.attractions);
  const photoSpotData = joinedOne(data.photo_spots);
  const provinceData = joinedOne(attractionData?.provinces);
  
  return {
    checkin_code_id: data.checkin_code_id,
    code: data.code,
    is_active: data.is_active,
    starts_at: data.starts_at,
    ends_at: data.ends_at,
    attraction: attractionData ? {
      attraction_id: Number(attractionData.attraction_id),
      name_th: String(attractionData.name_th ?? ""),
      name_en: text(attractionData.name_en),
      short_description_th: text(attractionData.short_description_th),
      is_active: attractionData.is_active === true,
      is_published: attractionData.is_published === true,
      cover_image_url: publicCoverUrl(attractionData.content_media),
      province: provinceData ? {
        province_name_th: String(provinceData.province_name_th ?? ""),
        is_active: provinceData.is_active === true,
        destination_status: liveProvinceIds.has(
          Number(provinceData.province_id),
        )
          ? "live"
          : "hidden",
      } : null
    } : null,
    photo_spot: photoSpotData ? {
      photo_spot_id: Number(photoSpotData.photo_spot_id),
      spot_name_th: String(photoSpotData.spot_name_th ?? ""),
      is_active: photoSpotData.is_active === true,
      sample_image_url: siteMediaImageUrl(text(photoSpotData.sample_image_path))
    } : null,
  };
}
