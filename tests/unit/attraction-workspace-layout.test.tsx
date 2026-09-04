import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AttractionAnalyticsWorkspace } from "@/components/dashboard/AttractionAnalyticsWorkspace";
import { attractionFixture } from "../visual/dashboard/attraction-fixture";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("@/components/admin/ExportButton", () => ({
  ExportButton: () => <button type="button">ส่งออกสรุป</button>,
}));

vi.mock("@/components/dashboard/AttractionPeerComparison", () => ({
  AttractionPeerComparison: () => <section aria-label="peer comparison mock" />,
}));

vi.mock("@/components/dashboard/AttractionFunnelChart", () => ({
  AttractionFunnelChart: () => <section aria-label="funnel mock" />,
}));

vi.mock("@/components/dashboard/AttractionScoreChart", () => ({
  AttractionScoreChart: () => <section aria-label="score mock" />,
}));

vi.mock("@/components/dashboard/AttractionDistributionChart", () => ({
  AttractionDistributionChart: ({ title }: { title: string }) => <section aria-label={title} />,
}));

vi.mock("@/components/dashboard/TrendChart", () => ({
  TrendChart: () => <section aria-labelledby="trend-mock-heading"><h2 id="trend-mock-heading">แนวโน้มรายการเข้าชม</h2></section>,
}));

const data = attractionFixture(null);

function follows(first: HTMLElement, second: HTMLElement) {
  return Boolean(first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function getDetailGroup(group: string) {
  const detail = document.querySelector<HTMLElement>(`details[data-detail-group="${group}"]`);
  if (!detail) throw new Error(`Missing detail group: ${group}`);
  return detail;
}

describe("AttractionAnalyticsWorkspace layout", () => {
  it("reads summary, trend, evidence, and action sections in that order", () => {
    render(<AttractionAnalyticsWorkspace data={data} />);

    const summary = screen.getByRole("region", { name: "สรุปผลสถานที่" });
    const trend = screen.getByRole("heading", { name: "แนวโน้มรายการเข้าชม" });
    const evidence = screen.getByRole("region", { name: "หลักฐานและบริบทการตัดสินใจ" });
    const insights = screen.getByRole("region", { name: "ข้อค้นพบเพื่อการตัดสินใจ" });
    const actions = screen.getByRole("region", { name: "จากหลักฐานไปสู่การปรับปรุง" });
    const funnel = screen.getByRole("region", { name: "funnel mock" });
    const audience = getDetailGroup("audience");
    const experience = getDetailGroup("experience");
    const expenses = getDetailGroup("expenses");

    expect(follows(summary, trend)).toBe(true);
    expect(follows(trend, evidence)).toBe(true);
    expect(follows(evidence, insights)).toBe(true);
    expect(follows(insights, actions)).toBe(true);
    expect(follows(evidence, actions)).toBe(true);
    expect(follows(actions, funnel)).toBe(true);
    expect(follows(funnel, audience)).toBe(true);
    expect(follows(audience, experience)).toBe(true);
    expect(follows(experience, expenses)).toBe(true);
  });

  it("keeps mobile detail summaries native and groups content for the wide layout", () => {
    render(<AttractionAnalyticsWorkspace data={data} />);

    for (const [group, label] of [
      ["audience", "ใครมา และเดินทางอย่างไร"],
      ["experience", "คุณภาพประสบการณ์และความตั้งใจ"],
      ["expenses", "ช่วงค่าใช้จ่ายและหมวดค่าใช้จ่าย"],
    ]) {
      const detail = getDetailGroup(group);
      const summary = detail.querySelector("summary");
      const content = detail.querySelector<HTMLElement>("[data-detail-content]");
      if (!summary || !content) throw new Error(`Incomplete detail group: ${group}`);

      expect(summary.tagName).toBe("SUMMARY");
      expect(summary).toHaveTextContent(label);
      expect(summary).toHaveClass("sm:hidden");
      expect(content).toHaveClass("sm:block");
      expect(detail).not.toHaveAttribute("open");
      expect(content).toBeEmptyDOMElement();
    }

    const audience = getDetailGroup("audience");
    audience.setAttribute("open", "");
    fireEvent(audience, new Event("toggle"));

    expect(audience).toHaveAttribute("open");
    expect(within(audience).getByRole("region", { name: "จังหวัดต้นทาง" })).toBeInTheDocument();
  });

  it("keeps four headline KPIs, moves secondary metrics into a flat evidence strip, and avoids nested KPI cards", () => {
    render(<AttractionAnalyticsWorkspace data={data} />);

    const summary = screen.getByRole("region", { name: "สรุปผลสถานที่" });
    const evidence = screen.getByRole("region", { name: "หลักฐานและบริบทการตัดสินใจ" });
    const actions = screen.getByRole("region", { name: "จากหลักฐานไปสู่การปรับปรุง" });

    expect(summary.querySelectorAll('[data-kpi-level="headline"]')).toHaveLength(4);
    expect(within(evidence).getByText("แบบสำรวจท่องเที่ยว")).toBeInTheDocument();
    expect(within(evidence).getByText("แบบประเมินงานวิจัย")).toBeInTheDocument();
    expect(within(evidence).getByText("การเข้าชมซ้ำ")).toBeInTheDocument();
    expect(actions.querySelectorAll('[data-kpi-level]')).toHaveLength(0);
    expect(within(actions).getByText("เลยกำหนด")).toBeInTheDocument();
  });

  it("preserves the export permission and truncation gates", () => {
    const { rerender } = render(<AttractionAnalyticsWorkspace data={data} />);

    expect(screen.getByRole("button", { name: "ส่งออกสรุป" })).toBeInTheDocument();

    rerender(<AttractionAnalyticsWorkspace data={{ ...data, viewer: { ...data.viewer, permissions: ["dashboard.read"] } }} />);
    expect(screen.queryByRole("button", { name: "ส่งออกสรุป" })).not.toBeInTheDocument();

    rerender(<AttractionAnalyticsWorkspace data={{ ...data, quality: { ...data.quality, truncated: true } }} />);
    expect(screen.queryByRole("button", { name: "ส่งออกสรุป" })).not.toBeInTheDocument();
  });
});
