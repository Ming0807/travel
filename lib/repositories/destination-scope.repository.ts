import "server-only";

import { cache } from "react";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  isLiveDestinationProvince,
  type DestinationProvinceOption,
} from "@/lib/destinations/launch-scope";

export interface LiveDestinationProvince {
  provinceId: number;
  nameTh: string;
  nameEn: string;
  displayOrder: number | null;
}

export const listLiveDestinationProvinces = cache(
  async (): Promise<LiveDestinationProvince[]> => {
    const supabase = createSupabaseServiceRoleClient();
    const primary = await supabase
      .from("provinces")
      .select(`
        province_id,
        province_name_th,
        province_name_en,
        is_active,
        destination_status,
        destination_display_order
      `)
      .eq("is_active", true)
      .eq("destination_status", "live")
      .order("destination_display_order", { ascending: true, nullsFirst: false })
      .order("province_name_th", { ascending: true });

    let data = primary.data;
    if (
      primary.error
      && ["42703", "PGRST204"].includes(primary.error.code ?? "")
    ) {
      const compatibility = await supabase
        .from("provinces")
        .select("province_id, province_name_th, province_name_en, is_active")
        .eq("is_active", true)
        .eq("province_name_en", "Yala")
        .limit(1);

      if (compatibility.error) {
        throw new Error("Unable to load the destination launch scope");
      }

      data = (compatibility.data ?? []).map((province) => ({
        ...province,
        destination_status: "live",
        destination_display_order: 1,
      }));
    } else if (primary.error) {
      throw new Error("Unable to load the destination launch scope");
    }

    return ((data ?? []) as DestinationProvinceOption[])
      .filter(isLiveDestinationProvince)
      .map((province) => ({
        provinceId: Number(province.province_id),
        nameTh: String(province.province_name_th ?? ""),
        nameEn: String(province.province_name_en ?? ""),
        displayOrder:
          province.destination_display_order == null
            ? null
            : Number(province.destination_display_order),
      }))
      .filter(
        (province) =>
          Number.isSafeInteger(province.provinceId)
          && province.provinceId > 0
          && province.nameTh.length > 0
          && province.nameEn.length > 0,
      );
  },
);

export async function listLiveDestinationProvinceIds(): Promise<number[]> {
  const provinces = await listLiveDestinationProvinces();
  return provinces.map((province) => province.provinceId);
}

export async function assertLiveDestinationProvinceId(
  provinceId: number | null,
): Promise<void> {
  if (!Number.isSafeInteger(provinceId) || Number(provinceId) <= 0) {
    throw new Error("DESTINATION_PROVINCE_NOT_AVAILABLE");
  }

  const liveProvinceIds = await listLiveDestinationProvinceIds();
  if (!liveProvinceIds.includes(Number(provinceId))) {
    throw new Error("DESTINATION_PROVINCE_NOT_AVAILABLE");
  }
}
