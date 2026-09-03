import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AttractionPeerComparison } from "@/components/dashboard/AttractionPeerComparison";

function summary(attractionId: number, nameTh: string) {
  return {
    attractionId,
    nameTh,
    visits: 40,
    surveyResponses: 20,
    surveyCoverage: 50,
    overallSatisfaction: { value: 4.2, sampleSize: 20, suppressed: false },
    satisfaction: [{ key: "safety_score", label: "ความปลอดภัย", value: 4.3, sampleSize: 20, suppressed: false }],
    revisitRate: { value: 80, sampleSize: 20, suppressed: false },
    recommendRate: { value: null, sampleSize: 6, suppressed: true },
    photoCompletion: 90,
    certificateCompletion: 75,
    stampCompletion: 70,
    surveyCompletion: 50,
    researchCompletion: 30,
    topExpenseRange: { label: "501-1,000 บาท", sampleSize: 15, suppressed: false },
    topExpenseCategory: { label: "อาหาร", sampleSize: 15, suppressed: false },
  };
}

describe("attraction peer comparison", () => {
  it("shows eligibility, rank denominator, aligned dates, and suppressed cells", () => {
    render(
      <AttractionPeerComparison
        attractionTypeName="วัฒนธรรม"
        comparison={{
          status: "ready",
          unavailableReason: null,
          eligibilityNote: "จังหวัดเดียวกัน ประเภทหลักเดียวกัน และมีอย่างน้อย 10 Visits",
          dateFrom: "2026-08-01",
          dateTo: "2026-08-31",
          dateAligned: true,
          eligiblePeerCount: 2,
          rankDenominator: 3,
          selectedRank: 2,
          selected: summary(1, "สถานที่หลัก"),
          peers: [summary(2, "เพื่อน A"), summary(3, "เพื่อน B")],
        }}
      />,
    );

    expect(screen.getByRole("heading", { name: "เปรียบเทียบกลุ่มสถานที่ที่เข้าเกณฑ์" })).toBeInTheDocument();
    expect(screen.getByText("อันดับ 2 จาก 3 สถานที่")).toBeInTheDocument();
    expect(screen.getByText("1 ส.ค. 2569 - 31 ส.ค. 2569")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "ข้อมูลเปรียบเทียบสถานที่" })).toBeInTheDocument();
    expect(screen.getAllByText("ปกปิด (n=6)").length).toBeGreaterThan(0);
    expect(screen.getByText(/ไม่ใช่รายได้ธุรกิจ/)).toBeInTheDocument();
  });

  it("shows why comparison is unavailable without rendering zero values", () => {
    render(
      <AttractionPeerComparison
        attractionTypeName={null}
        comparison={{
          status: "unavailable",
          unavailableReason: "สถานที่นี้ยังไม่มีประเภทหลักสำหรับกำหนดกลุ่มเทียบ",
          eligibilityNote: "เปรียบเทียบเฉพาะสถานที่ประเภทเดียวกัน",
          dateFrom: "2026-08-01",
          dateTo: "2026-08-31",
          dateAligned: true,
          eligiblePeerCount: 0,
          rankDenominator: 0,
          selectedRank: null,
          selected: null,
          peers: [],
        }}
      />,
    );

    expect(screen.getByText("ยังเปรียบเทียบไม่ได้")).toBeInTheDocument();
    expect(screen.getByText(/ยังไม่มีประเภทหลัก/)).toBeInTheDocument();
    expect(screen.queryByText("0%")).not.toBeInTheDocument();
  });
});
