import { describe, expect, it } from "vitest";
import {
  DASHBOARD_CHART_AXIS_TICK,
  DASHBOARD_CHART_CATEGORY_TICK,
  DASHBOARD_CHART_COLORS,
  DASHBOARD_CHART_TOKENS,
  DASHBOARD_CHART_TOOLTIP,
  DASHBOARD_FUNNEL_COLORS,
} from "@/components/dashboard/dashboard-chart-theme";

describe("shared dashboard chart presentation", () => {
  it("keeps category and ordered-stage palettes distinct", () => {
    expect(DASHBOARD_CHART_COLORS[0]).toBe(DASHBOARD_CHART_TOKENS.accent);
    expect(DASHBOARD_CHART_COLORS[1]).toBe(DASHBOARD_CHART_TOKENS.teal);
    expect(new Set(DASHBOARD_CHART_COLORS).size).toBe(DASHBOARD_CHART_COLORS.length);
    expect(DASHBOARD_FUNNEL_COLORS).toHaveLength(9);
    for (const color of [...DASHBOARD_CHART_COLORS, ...DASHBOARD_FUNNEL_COLORS]) {
      expect(color).toMatch(/^#[0-9A-F]{6}$/);
    }
  });

  it("shares readable axis typography and compact tooltip surfaces", () => {
    expect(DASHBOARD_CHART_AXIS_TICK.fill).toBe(DASHBOARD_CHART_TOKENS.axis);
    expect(DASHBOARD_CHART_CATEGORY_TICK.fill).toBe(DASHBOARD_CHART_TOKENS.label);
    expect(DASHBOARD_CHART_CATEGORY_TICK.fontWeight).toBeGreaterThanOrEqual(600);
    expect(DASHBOARD_CHART_TOOLTIP.background).toBe(DASHBOARD_CHART_TOKENS.surface);
    expect(DASHBOARD_CHART_TOOLTIP.borderRadius).toBeLessThanOrEqual(8);
  });
});
