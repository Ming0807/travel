export type PublicRouteCoordinate = {
  latitude: number | null;
  longitude: number | null;
};

export type PublicRouteStop = PublicRouteCoordinate & {
  attractionId: number;
  dayNumber: number;
  sequence: number;
  attractionName: string;
  attractionSlug: string;
  attractionImage: string | null;
  attractionImageAlt: string;
};

function isValidCoordinate(stop: PublicRouteCoordinate) {
  return typeof stop.latitude === "number"
    && Number.isFinite(stop.latitude)
    && stop.latitude >= -90
    && stop.latitude <= 90
    && typeof stop.longitude === "number"
    && Number.isFinite(stop.longitude)
    && stop.longitude >= -180
    && stop.longitude <= 180;
}

function coordinateText(stop: PublicRouteCoordinate) {
  return `${stop.latitude},${stop.longitude}`;
}

export function buildRouteDirectionsUrl(stops: PublicRouteCoordinate[]): string | null {
  if (stops.length < 2 || !stops.every(isValidCoordinate)) return null;

  const params = new URLSearchParams({
    api: "1",
    origin: coordinateText(stops[0]),
    destination: coordinateText(stops[stops.length - 1]),
    travelmode: "driving",
  });
  const waypoints = stops.slice(1, -1);
  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.map(coordinateText).join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function safeExternalTourUrl(value: string | null | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}
