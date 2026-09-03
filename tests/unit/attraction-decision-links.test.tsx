import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AttractionFunnelChart } from "@/components/dashboard/AttractionFunnelChart";
import { AttractionScoreChart } from "@/components/dashboard/AttractionScoreChart";
import { TrendChart } from "@/components/dashboard/TrendChart";

const improvementContext = {
  attractionId: 7,
  dateStart: "2026-08-01",
  dateEnd: "2026-08-31",
};

function query(link: HTMLElement) {
  const href = link.getAttribute("href");
  expect(href).toBeTruthy();
  return new URL(href ?? "", "https://example.test").searchParams;
}

describe("attraction analytics decision links", () => {
  it("opens a low-score reviewed draft with aggregate metric context", () => {
    render(
      <AttractionScoreChart
        improvementContext={improvementContext}
        metrics={[
          { key: "safety_score", label: "ความปลอดภัย", value: 2.8, sampleSize: 34, suppressed: false },
          { key: "cleanliness_score", label: "ความสะอาด", value: 4.4, sampleSize: 34, suppressed: false },
        ]}
      />,
    );

    const params = query(screen.getByRole("link", { name: "เปิดร่างประเด็น ความปลอดภัย" }));
    expect(params.get("dimension")).toBe("safety");
    expect(params.get("draftSource")).toBe("low_score");
    expect(params.get("draftMetric")).toBe("safety_score");
    expect(params.get("draftValue")).toBe("2.8");
    expect(params.toString()).not.toMatch(/comment|tourist|visitId/i);
    expect(screen.queryByRole("link", { name: "เปิดร่างประเด็น ความสะอาด" })).not.toBeInTheDocument();
  });

  it("opens a funnel drop-off reviewed draft without private records", () => {
    render(
      <AttractionFunnelChart
        improvementContext={improvementContext}
        stages={[
          { key: "visit", label: "กรอกข้อมูลพื้นฐาน", count: 100, available: true, conversionFromPrevious: null, dropOffFromPrevious: null },
          { key: "photo", label: "อัปโหลดรูป", count: 55, available: true, conversionFromPrevious: 55, dropOffFromPrevious: 45 },
        ]}
      />,
    );

    const params = query(screen.getByRole("link", { name: "เปิดร่างประเด็นจากขั้น อัปโหลดรูป" }));
    expect(params.get("dimension")).toBe("overall");
    expect(params.get("draftSource")).toBe("funnel_dropoff");
    expect(params.get("draftMetric")).toBe("photo");
    expect(params.get("draftValue")).toBe("45");
    expect(params.toString()).not.toMatch(/comment|tourist|visitId/i);
  });

  it("opens a trend-point reviewed draft from the accessible data table", () => {
    render(
      <TrendChart
        improvementContext={improvementContext}
        points={[{ label: "2026-08-14", value: 18 }]}
      />,
    );

    const params = query(screen.getByRole("link", { name: "เปิดร่างประเด็นจากข้อมูล 14 ส.ค. 2569" }));
    expect(params.get("dimension")).toBe("overall");
    expect(params.get("draftSource")).toBe("trend_point");
    expect(params.get("draftMetric")).toBe("visits");
    expect(params.get("draftDate")).toBe("2026-08-14");
    expect(params.get("draftValue")).toBe("18");
  });
});
