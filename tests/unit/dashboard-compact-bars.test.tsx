import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CompactBarList } from "@/components/dashboard/CompactBarList";
import { formatChartAxisLabel } from "@/components/dashboard/dashboard-chart-theme";

describe("compact dashboard bars", () => {
  it("shortens axis labels without separating Thai combining marks", () => {
    expect(formatChartAxisLabel("ก้".repeat(13))).toBe(`${"ก้".repeat(12)}…`);
    expect(formatChartAxisLabel("ยะลา")).toBe("ยะลา");
  });
  it("preserves full labels, exact values and keyboard-operable detail buttons", () => {
    const onSelect = vi.fn();
    const label = "เดินทางเพื่อพักผ่อนและเรียนรู้วัฒนธรรมท้องถิ่น";
    render(<CompactBarList items={[{ key: "culture", label, value: 1280, displayValue: "1,280 (64%)", color: "#D94717" }]} onSelect={onSelect} />);
    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.getByText("1,280 (64%)")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: `เลือกดู ${label}` }));
    expect(onSelect).toHaveBeenCalledWith("culture");
  });

  it("renders zero without division errors and respects fixed score scales", () => {
    const { container } = render(<CompactBarList maximum={5} items={[
      { key: "zero", label: "Zero", value: 0, displayValue: "0 / 5", color: "#D94717" },
      { key: "score", label: "Score", value: 4, displayValue: "4 / 5", color: "#0A6B62" },
    ]} />);
    expect(container.querySelector('[style*="width: 0%"]')).toBeInTheDocument();
    expect(container.querySelector('[style*="width: 80%"]')).toBeInTheDocument();
    expect(container.innerHTML).not.toContain("NaN");
  });
});
