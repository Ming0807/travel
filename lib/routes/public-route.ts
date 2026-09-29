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
  stopNote?: string | null;
};

export type RouteDirectionsSegment = {
  startIndex: number;
  endIndex: number;
  url: string;
};

const MAX_STOPS_PER_MAPS_URL = 5;

export function orderPublicRouteStops(stops: PublicRouteStop[]): PublicRouteStop[] {
  return stops.slice().sort((left, right) => left.dayNumber - right.dayNumber || left.sequence - right.sequence);
}

export function hasValidRouteCoordinate(stop: PublicRouteCoordinate) {
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
  if (stops.length < 2 || stops.length > MAX_STOPS_PER_MAPS_URL || !stops.every(hasValidRouteCoordinate)) return null;

  const params = new URLSearchParams({
    api: "1",
    origin: coordinateText(stops[0]),
    destination: coordinateText(stops[stops.length - 1]),
  });
  const waypoints = stops.slice(1, -1);
  if (waypoints.length > 0) {
    params.set("waypoints", waypoints.map(coordinateText).join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function buildRouteDirectionsSegments(stops: PublicRouteCoordinate[]): RouteDirectionsSegment[] {
  if (stops.length < 2 || !stops.every(hasValidRouteCoordinate)) return [];

  const segments: RouteDirectionsSegment[] = [];
  for (let startIndex = 0; startIndex < stops.length - 1; startIndex += MAX_STOPS_PER_MAPS_URL - 1) {
    const endIndex = Math.min(startIndex + MAX_STOPS_PER_MAPS_URL - 1, stops.length - 1);
    const url = buildRouteDirectionsUrl(stops.slice(startIndex, endIndex + 1));
    if (!url) return [];
    segments.push({ startIndex, endIndex, url });
  }
  return segments;
}

export function buildRouteStopMapUrl(stop: PublicRouteCoordinate): string | null {
  if (!hasValidRouteCoordinate(stop)) return null;
  const params = new URLSearchParams({ api: "1", query: coordinateText(stop) });
  return `https://www.google.com/maps/search/?${params.toString()}`;
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
