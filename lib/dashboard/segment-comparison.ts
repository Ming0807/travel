import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";

const SMALL_CELL_THRESHOLD = 10;

export type SegmentComparison = {
  status: "ready" | "insufficient" | "unavailable";
  groups: Array<{
    label: string;
    sampleSize: number;
    mean: number | null;
    suppressed: boolean;
  }>;
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function buildTwoGroupMeanComparison(
  entries: Array<{ segment: string | null; value: number | null }>,
): SegmentComparison {
  const grouped = new Map<string, number[]>();
  entries.forEach((entry) => {
    if (!entry.segment || entry.value === null || !Number.isFinite(entry.value)) return;
    grouped.set(entry.segment, [...(grouped.get(entry.segment) ?? []), entry.value]);
  });

  const selected = [...grouped.entries()]
    .sort((left, right) => right[1].length - left[1].length || left[0].localeCompare(right[0], "th"))
    .slice(0, 2)
    .map(([label, values]) => {
      const suppressed = values.length < SMALL_CELL_THRESHOLD;
      const decisionReady = values.length >= DASHBOARD_MIN_SAMPLE_SIZE;
      return {
        label,
        sampleSize: values.length,
        mean: decisionReady ? round(values.reduce((sum, value) => sum + value, 0) / values.length) : null,
        suppressed,
      };
    });

  if (selected.length < 2) return { status: "unavailable", groups: selected };
  return {
    status: selected.every((group) => group.sampleSize >= DASHBOARD_MIN_SAMPLE_SIZE) ? "ready" : "insufficient",
    groups: selected,
  };
}
