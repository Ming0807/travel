import { fireEvent, render, screen, within } from "@testing-library/react";
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
  it("omits stale place-dependent filters while preserving the other submitted scope", () => {
    render(<AttractionAnalyticsFilters
      attractions={[...attractions, { value: 5, label: "ถ้ำศิลป์" }]}
      checkinCodes={checkinCodes}
      defaults={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
      filters={{ attractionId: 4, dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "pilot_only", campaignId: 7, checkinCodeId: 10, entryChannel: "nfc" }}
    />);
    const form = screen.getByRole("button", { name: "วิเคราะห์ข้อมูล" }).closest("form")!;
    expect(new FormData(form).get("checkinCodeId")).toBe("10");
    fireEvent.change(screen.getByLabelText("สถานที่"), { target: { value: "5" } });
    const data = new FormData(form);
    expect(Object.fromEntries(data)).toEqual({ attractionId: "5", dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "pilot_only", entryChannel: "nfc" });
    expect(screen.getByLabelText("แคมเปญ")).toBeDisabled();
    expect(screen.getByLabelText("จุดเช็กอิน")).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("เปลี่ยนสถานที่แล้ว");
    fireEvent.change(screen.getByLabelText("สถานที่"), { target: { value: "4" } });
    expect(screen.getByLabelText("จุดเช็กอิน")).toBeEnabled();
    expect(new FormData(form).get("campaignId")).toBe("");
    expect(new FormData(form).get("checkinCodeId")).toBe("");
  });

  it("restores the server URL scope when navigation supplies another filter snapshot", () => {
    const base = { attractions: [...attractions, { value: 5, label: "ถ้ำศิลป์" }], checkinCodes, defaults: { dateFrom: "2026-08-01", dateTo: "2026-08-31" } };
    const first = { attractionId: 4, ...base.defaults, evidenceScope: "field_claim" as const, checkinCodeId: 10 };
    const { rerender } = render(<AttractionAnalyticsFilters {...base} filters={first} />);
    fireEvent.change(screen.getByLabelText("สถานที่"), { target: { value: "5" } });
    rerender(<AttractionAnalyticsFilters {...base} filters={{ ...first, attractionId: 5, checkinCodeId: undefined }} />);
    expect(screen.getByLabelText("สถานที่")).toHaveValue("5");
    rerender(<AttractionAnalyticsFilters {...base} filters={first} />);
    expect(screen.getByLabelText("สถานที่")).toHaveValue("4");
    expect(screen.getByLabelText("จุดเช็กอิน")).toHaveValue("10");
  });
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

  it("keeps check-in choices coherent with campaign changes", () => {
    render(
      <AttractionAnalyticsFilters
        attractions={attractions}
        checkinCodes={checkinCodes}
        defaults={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
        filters={{ attractionId: 4, dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "pilot_only", campaignId: 7, checkinCodeId: 10, entryChannel: "nfc" }}
      />,
    );

    const campaign = screen.getByLabelText("แคมเปญ") as HTMLSelectElement;
    const checkinCode = screen.getByLabelText("จุดเช็กอิน") as HTMLSelectElement;
    expect(within(checkinCode).getAllByRole("option").map((option) => (option as HTMLOptionElement).value)).toEqual(["", "10", "11"]);

    fireEvent.change(campaign, { target: { value: "9" } });
    expect(checkinCode).toHaveValue("");
    expect(within(checkinCode).getAllByRole("option").map((option) => (option as HTMLOptionElement).value)).toEqual(["", "12"]);

    fireEvent.change(checkinCode, { target: { value: "12" } });
    fireEvent.change(campaign, { target: { value: "" } });
    expect(checkinCode).toHaveValue("12");
    expect(within(checkinCode).getAllByRole("option").map((option) => (option as HTMLOptionElement).value)).toEqual(["", "10", "11", "12", "13"]);
  });

  it("keeps an invalid URL campaign and check-in pair explicit with a warning", () => {
    render(
      <AttractionAnalyticsFilters
        attractions={attractions}
        checkinCodes={checkinCodes}
        defaults={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
        filters={{ attractionId: 4, dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "field_claim", campaignId: 7, checkinCodeId: 12 }}
      />,
    );

    expect(screen.getByLabelText("แคมเปญ")).toHaveValue("7");
    expect(screen.getByLabelText("จุดเช็กอิน")).toHaveValue("12");
    expect(new FormData(screen.getByRole("button", { name: "วิเคราะห์ข้อมูล" }).closest("form")!).get("checkinCodeId")).toBe("12");
    expect(screen.getByRole("alert")).toHaveTextContent("ไม่อยู่ในแคมเปญที่เลือก");

    fireEvent.change(screen.getByLabelText("แคมเปญ"), { target: { value: "9" } });
    expect(screen.getByLabelText("จุดเช็กอิน")).toHaveValue("12");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("keeps an unavailable URL campaign explicit and lets the user clear it", () => {
    render(
      <AttractionAnalyticsFilters attractions={attractions} checkinCodes={[]}
        defaults={{ dateFrom: "2026-08-01", dateTo: "2026-08-31" }}
        filters={{ attractionId: 4, dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "field_claim", campaignId: 99 }} />,
    );
    expect(screen.getByLabelText("แคมเปญ")).toHaveValue("99");
    expect(screen.getByLabelText("แคมเปญ")).not.toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("แคมเปญที่เลือกไม่พร้อมใช้งาน");
    fireEvent.change(screen.getByLabelText("แคมเปญ"), { target: { value: "" } });
    expect(screen.getByLabelText("แคมเปญ")).toHaveValue("");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
