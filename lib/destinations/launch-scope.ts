export const PUBLIC_DESTINATION_STATUS = "live" as const;

type JoinedRecord = Record<string, unknown>;

export interface DestinationProvinceRecord {
  is_active?: unknown;
  destination_status?: unknown;
}

export interface DestinationProvinceOption {
  province_id?: unknown;
  province_name_th?: unknown;
  province_name_en?: unknown;
  destination_status?: unknown;
  destination_display_order?: unknown;
  is_active?: unknown;
}

function joinedOne(value: unknown): JoinedRecord | null {
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === "object" ? (first as JoinedRecord) : null;
  }
  return value && typeof value === "object" ? (value as JoinedRecord) : null;
}

export function isLiveDestinationProvince(
  province: DestinationProvinceRecord | null | undefined,
): boolean {
  return (
    province?.is_active === true
    && province.destination_status === PUBLIC_DESTINATION_STATUS
  );
}

export function routeStopsArePublicForLaunch(
  stopsValue: unknown,
  liveProvinceIds?: ReadonlySet<number>,
): boolean {
  if (!Array.isArray(stopsValue) || stopsValue.length === 0) return false;

  return stopsValue.every((stopValue) => {
    const stop = joinedOne(stopValue);
    const attraction = joinedOne(stop?.attractions);
    const province = joinedOne(attraction?.provinces);

    return (
      attraction?.is_active === true
      && attraction.is_published === true
      && (
        liveProvinceIds
          ? province?.is_active === true
            && liveProvinceIds.has(Number(province.province_id))
          : isLiveDestinationProvince(province)
      )
    );
  });
}

export function sanitizeDestinationProvinceFilter(
  requestedProvince: string | undefined,
  liveProvinces: Array<Pick<DestinationProvinceOption, "province_name_en">>,
): string | undefined {
  const normalized = requestedProvince?.trim();
  if (!normalized) return undefined;

  return liveProvinces.some(
    (province) => province.province_name_en === normalized,
  )
    ? normalized
    : undefined;
}
