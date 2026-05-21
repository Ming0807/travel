import { FUNNEL_STAGE_DEFINITIONS } from "@/constants/dashboard-metrics";
import type { DistributionItem, FunnelStage } from "@/types/dashboard";

export function safeRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return numerator / denominator;
}

export function averageNullable(values: Array<number | null | undefined>): number | null {
  const validValues = values.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (validValues.length === 0) return null;
  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

export function percentage(part: number, total: number): number | null {
  return safeRate(part, total);
}

export function formatCount(value: number | null): string {
  return value === null ? "No data" : new Intl.NumberFormat("th-TH").format(value);
}

export function formatRating(value: number | null): string {
  return value === null ? "No data" : `${value.toFixed(1)} / 5`;
}

export function formatPercentage(value: number | null): string {
  return value === null ? "No data" : `${Math.round(value * 100)}%`;
}

export function formatEstimatedSpending(min: number | null, max: number | null, hasOpenEndedRange: boolean): string {
  if (min === null && max === null) return "No data";

  const formatter = new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0
  });

  if (hasOpenEndedRange || max === null) {
    return `Estimated ${formatter.format(min ?? 0)}+`;
  }

  return `Estimated ${formatter.format(min ?? 0)} - ${formatter.format(max)}`;
}

export function buildDistribution(entries: Map<string, number>, totalOverride?: number): DistributionItem[] {
  const total = totalOverride ?? Array.from(entries.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(entries.entries())
    .map(([label, value]) => ({
      label,
      value,
      percent: percentage(value, total)
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
}

export function buildFunnelStages(eventCounts: Map<string, number>): FunnelStage[] {
  let previousCount: number | null = null;

  return FUNNEL_STAGE_DEFINITIONS.map((stage) => {
    const count = eventCounts.get(stage.key) ?? 0;
    const conversionFromPrevious = previousCount === null ? null : safeRate(count, previousCount);
    const dropOffFromPrevious = conversionFromPrevious === null ? null : 1 - conversionFromPrevious;
    previousCount = count;

    return {
      key: stage.key,
      label: stage.label,
      count,
      conversionFromPrevious,
      dropOffFromPrevious,
      definition: stage.definition
    };
  });
}
