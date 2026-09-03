import type { DashboardMetricComparison, DashboardKpi } from "@/types/dashboard";

const DAY_MS = 86_400_000;

function parseUtcDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getPreviousDashboardPeriod(dateFrom: string, dateTo: string) {
  const currentFrom = parseUtcDate(dateFrom);
  const currentTo = parseUtcDate(dateTo);
  if (!currentFrom || !currentTo || currentFrom > currentTo) return null;

  const inclusiveDays = Math.floor((currentTo.getTime() - currentFrom.getTime()) / DAY_MS) + 1;
  const previousTo = new Date(currentFrom.getTime() - DAY_MS);
  const previousFrom = new Date(previousTo.getTime() - ((inclusiveDays - 1) * DAY_MS));

  return { dateFrom: toDateInput(previousFrom), dateTo: toDateInput(previousTo) };
}

export function buildDashboardMetricComparison(
  currentValue: number | null,
  previousValue: number | null,
): DashboardMetricComparison {
  if (currentValue === null || previousValue === null) {
    return {
      currentValue,
      previousValue,
      absoluteChange: null,
      percentChange: null,
      direction: "unavailable",
    };
  }

  const absoluteChange = currentValue - previousValue;
  if (previousValue === 0) {
    return {
      currentValue,
      previousValue,
      absoluteChange,
      percentChange: null,
      direction: "unavailable",
    };
  }

  const percentChange = (absoluteChange / Math.abs(previousValue)) * 100;
  return {
    currentValue,
    previousValue,
    absoluteChange,
    percentChange,
    direction: absoluteChange > 0 ? "up" : absoluteChange < 0 ? "down" : "flat",
  };
}

export function compareDashboardKpis(
  current: DashboardKpi[],
  previous: Array<Pick<DashboardKpi, "key" | "rawValue">>,
) {
  const previousByKey = new Map(previous.map((metric) => [metric.key, metric.rawValue]));
  return Object.fromEntries(current.map((metric) => [
    metric.key,
    buildDashboardMetricComparison(metric.rawValue, previousByKey.get(metric.key) ?? null),
  ]));
}
