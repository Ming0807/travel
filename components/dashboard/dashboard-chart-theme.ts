export const DASHBOARD_CHART_TOKENS = {
  accent: "#D94717",
  accentMuted: "#E78A6D",
  teal: "#0A6B62",
  tealMuted: "#4F8E88",
  green: "#3E7A4F",
  amber: "#D6A13D",
  amberStrong: "#A97B22",
  rose: "#BE123C",
  blue: "#2563EB",
  slate: "#64748B",
  grid: "#E2E8F0",
  axis: "#64748B",
  label: "#334155",
  value: "#0F172A",
  reference: "#94A3B8",
  surface: "#FFFFFF",
  cursor: "#F8FAFC",
  track: "#E9EFED",
} as const;

export const DASHBOARD_CHART_COLORS = [
  DASHBOARD_CHART_TOKENS.accent,
  DASHBOARD_CHART_TOKENS.teal,
  DASHBOARD_CHART_TOKENS.amber,
  DASHBOARD_CHART_TOKENS.green,
  DASHBOARD_CHART_TOKENS.slate,
  DASHBOARD_CHART_TOKENS.accentMuted,
  DASHBOARD_CHART_TOKENS.tealMuted,
  DASHBOARD_CHART_TOKENS.amberStrong,
  DASHBOARD_CHART_TOKENS.blue,
] as const;

export const DASHBOARD_FUNNEL_COLORS = [
  DASHBOARD_CHART_TOKENS.accent,
  "#E05B2B",
  "#E87945",
  DASHBOARD_CHART_TOKENS.amber,
  DASHBOARD_CHART_TOKENS.green,
  DASHBOARD_CHART_TOKENS.teal,
  "#247C74",
  DASHBOARD_CHART_TOKENS.tealMuted,
  DASHBOARD_CHART_TOKENS.slate,
] as const;

export const DASHBOARD_CHART_AXIS_TICK = {
  fill: DASHBOARD_CHART_TOKENS.axis,
  fontSize: 11,
  fontWeight: 600,
} as const;

export const DASHBOARD_CHART_CATEGORY_TICK = {
  fill: DASHBOARD_CHART_TOKENS.label,
  fontSize: 11,
  fontWeight: 700,
} as const;

export const DASHBOARD_CHART_TOOLTIP = {
  background: DASHBOARD_CHART_TOKENS.surface,
  color: "#17212B",
  border: `1px solid ${DASHBOARD_CHART_TOKENS.reference}`,
  borderRadius: 5, boxShadow: "0 4px 8px rgba(15,23,42,0.10)", fontSize: 12,
} as const;

const graphemes = new Intl.Segmenter("th", { granularity: "grapheme" });

export function formatChartAxisLabel(label: string) {
  const parts = Array.from(graphemes.segment(label), ({ segment }) => segment);
  return parts.length > 12 ? `${parts.slice(0, 12).join("")}…` : label;
}
