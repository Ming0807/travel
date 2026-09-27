import { describe, expect, it } from "vitest";

import { evaluateRouteReadiness } from "@/lib/routes/route-readiness";
import { buildRouteDirectionsSegments, buildRouteDirectionsUrl } from "@/lib/routes/public-route";

const stops = [
  { attractionId: 1, dayNumber: 1, displayOrder: 1 },
  { attractionId: 2, dayNumber: 1, displayOrder: 2 },
];

describe("route publication readiness", () => {
  it("accepts two ordered, eligible, distinct stops", () => {
    expect(evaluateRouteReadiness(stops, new Set([1, 2]))).toEqual([]);
  });

  it("rejects empty, single-stop, duplicate, and ineligible routes", () => {
    expect(evaluateRouteReadiness([], new Set())).toContain("too_few_stops");
    expect(evaluateRouteReadiness([stops[0]], new Set([1]))).toContain("too_few_stops");
    expect(evaluateRouteReadiness([stops[0], { ...stops[1], attractionId: 1 }], new Set([1])))
      .toContain("duplicate_attraction");
    expect(evaluateRouteReadiness(stops, new Set([1]))).toContain("ineligible_attraction");
  });

  it("requires contiguous days and sequence numbers", () => {
    expect(evaluateRouteReadiness([
      stops[0],
      { ...stops[1], dayNumber: 3, displayOrder: 1 },
    ], new Set([1, 2]))).toContain("day_gap");
    expect(evaluateRouteReadiness([
      stops[0],
      { ...stops[1], displayOrder: 3 },
    ], new Set([1, 2]))).toContain("order_gap");
  });
});

describe("mobile-safe Google Maps directions", () => {
  const locations = Array.from({ length: 12 }, (_, index) => ({
    latitude: 6.5 + index / 100,
    longitude: 101.2 + index / 100,
  }));

  it("never puts more than five stops into one Maps URL", () => {
    expect(buildRouteDirectionsUrl(locations)).toBeNull();
    const segments = buildRouteDirectionsSegments(locations);
    expect(segments.map((segment) => [segment.startIndex, segment.endIndex])).toEqual([
      [0, 4], [4, 8], [8, 11],
    ]);
    expect(segments.every((segment) => {
      const url = new URL(segment.url);
      const waypoints = url.searchParams.get("waypoints")?.split("|") ?? [];
      return waypoints.length <= 3 && segment.endIndex - segment.startIndex <= 4;
    })).toBe(true);
  });

  it("does not silently skip stops with missing coordinates", () => {
    const incomplete = [...locations.slice(0, 5), { latitude: null, longitude: 101.9 }];
    expect(buildRouteDirectionsSegments(incomplete)).toEqual([]);
  });
});
