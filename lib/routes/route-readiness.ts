export type RouteStopForReadiness = {
  attractionId: number;
  dayNumber: number;
  displayOrder: number;
};

export type RouteReadinessIssue =
  | "too_few_stops"
  | "duplicate_attraction"
  | "ineligible_attraction"
  | "day_gap"
  | "order_gap";

export function evaluateRouteReadiness(
  stops: RouteStopForReadiness[],
  eligibleAttractionIds: ReadonlySet<number>,
): RouteReadinessIssue[] {
  const issues: RouteReadinessIssue[] = [];
  if (stops.length < 2) issues.push("too_few_stops");

  const attractionIds = stops.map((stop) => stop.attractionId);
  if (new Set(attractionIds).size !== attractionIds.length) issues.push("duplicate_attraction");
  if (stops.some((stop) => !eligibleAttractionIds.has(stop.attractionId))) issues.push("ineligible_attraction");

  const days = [...new Set(stops.map((stop) => stop.dayNumber))].sort((a, b) => a - b);
  if (days.some((day, index) => day !== index + 1)) issues.push("day_gap");

  for (const day of days) {
    const orders = stops
      .filter((stop) => stop.dayNumber === day)
      .map((stop) => stop.displayOrder)
      .sort((a, b) => a - b);
    if (orders.some((order, index) => order !== index + 1)) {
      issues.push("order_gap");
      break;
    }
  }

  return issues;
}
