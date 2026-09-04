export const DASHBOARD_CHART_COLORS = ["#D94717", "#0A6B62", "#D6A13D", "#3E7A4F", "#64748B", "#E78A6D", "#4F8E88", "#A97B22"];

export const DASHBOARD_CHART_TOOLTIP = {
  background: "#FFFFFF", color: "#17212B", border: "1px solid #CBD5E1",
  borderRadius: 5, boxShadow: "0 4px 8px rgba(15,23,42,0.10)", fontSize: 12,
};

const graphemes = new Intl.Segmenter("th", { granularity: "grapheme" });

export function formatChartAxisLabel(label: string) {
  const parts = Array.from(graphemes.segment(label), ({ segment }) => segment);
  return parts.length > 12 ? `${parts.slice(0, 12).join("")}…` : label;
}
