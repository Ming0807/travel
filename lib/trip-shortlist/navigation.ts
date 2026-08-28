const PUBLIC_ATTRACTION_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface TripMapStop {
  name: string;
  latitude?: number | null;
  longitude?: number | null;
}

export function normalizeTripPlanSlugs(values: readonly string[], limit = 20) {
  return Array.from(
    new Set(
      values
        .map((value) => value.trim().toLowerCase())
        .filter((value) => PUBLIC_ATTRACTION_SLUG.test(value)),
    ),
  ).slice(0, limit);
}

export function parseTripPlanSelection(value?: string | null) {
  return normalizeTripPlanSlugs(value?.split(",") ?? []);
}

export function createTripPlanHref(slugs: readonly string[]) {
  const selected = normalizeTripPlanSlugs(slugs);
  return selected.length > 0
    ? `/routes?selected=${selected.map(encodeURIComponent).join(",")}`
    : "/routes";
}

function mapQuery(stop: TripMapStop) {
  if (
    typeof stop.latitude === "number"
    && Number.isFinite(stop.latitude)
    && typeof stop.longitude === "number"
    && Number.isFinite(stop.longitude)
  ) {
    return `${stop.latitude},${stop.longitude}`;
  }

  return `${stop.name}, ยะลา`;
}

export function createGoogleMapsTripHref(stops: readonly TripMapStop[]) {
  const usableStops = stops.filter((stop) => stop.name.trim()).slice(0, 10);
  if (usableStops.length === 0) return null;

  if (usableStops.length === 1) {
    const params = new URLSearchParams({ api: "1", query: mapQuery(usableStops[0]) });
    return `https://www.google.com/maps/search/?${params.toString()}`;
  }

  const params = new URLSearchParams({
    api: "1",
    origin: mapQuery(usableStops[0]),
    destination: mapQuery(usableStops.at(-1)!),
    travelmode: "driving",
  });
  const waypoints = usableStops.slice(1, -1).map(mapQuery);
  if (waypoints.length > 0) params.set("waypoints", waypoints.join("|"));

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
