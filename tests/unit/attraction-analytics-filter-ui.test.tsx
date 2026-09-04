import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AttractionAnalyticsFilters } from "@/components/dashboard/AttractionAnalyticsFilters";

const attractions = [{ value: 4, label: "วัดคูหาภิมุข" }];
const checkinCodes = [
  { checkinCodeId: 10, code: "YALA-A", label: "ทางเข้าหลัก", campaignId: 7 },
  { checkinCodeId: 11, code: "YALA-B", label: "จุดถ่ายภาพ", campaignId: 7 },
  { checkinCodeId: 12, code: "YALA-C", label: "ทางเข้าสำรอง", campaignId: 9 },
  { checkinCodeId: 13, code: "YALA-D", label: "ไม่ผูกแคมเปญ", campaignId: null },
];

describe("AttractionAnalyticsFilters", () => {
  it("keeps primary scope concise and moves channel controls into an advanced disclosure", () => {
    render(
      <AttractionAnalyticsFilters
        attractions={attractions}
        checkinCodes={checkinCodes}
        defaults={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
        filters={null}
      />,
    );

    expect(screen.getByLabelText("สถานที่")).toBeInTheDocument();
    expect(screen.getByLabelText("เริ่มวันที่")).toBeInTheDocument();
    expect(screen.getByLabelText("สิ้นสุดวันที่")).toBeInTheDocument();
    expect(screen.getByLabelText("ขอบเขตหลักฐาน")).toBeInTheDocument();
    expect(screen.getByText("ตัวกรองเฉพาะช่องทางและจุดเช็กอิน").closest("details")).not.toHaveAttribute("open");
  });

  it("uses controlled campaign options derived from real check-in codes", () => {
    render(
      <AttractionAnalyticsFilters
        attractions={attractions}
        checkinCodes={checkinCodes}
        defaults={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
        filters={{ attractionId: 4, dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "field_claim", campaignId: 7, entryChannel: "nfc" }}
      />,
    );

    const campaign = screen.getByLabelText("แคมเปญ") as HTMLSelectElement;
    const options = within(campaign).getAllByRole("option");
    expect(options.map((option) => option.textContent)).toEqual([
      "ทุกแคมเปญ",
      "แคมเปญ 7 · 2 จุดเช็กอิน",
      "แคมเปญ 9 · 1 จุดเช็กอิน",
    ]);
    expect(campaign.value).toBe("7");
    expect(screen.queryByRole("spinbutton", { name: /Campaign ID/i })).not.toBeInTheDocument();
    expect(screen.getByText("ตัวกรองเฉพาะช่องทางและจุดเช็กอิน").closest("details")).toHaveAttribute("open");
    expect(screen.getByLabelText("ช่องทางเข้า")).toHaveValue("nfc");
    expect(screen.getByRole("button", { name: "ใช้ตัวกรองเพิ่มเติม" })).toBeInTheDocument();
  });
});
