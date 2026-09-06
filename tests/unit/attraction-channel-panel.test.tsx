import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttractionChannelPanel } from "@/components/dashboard/AttractionChannelPanel";
import { buildAttractionChannelAnalytics } from "@/lib/services/attraction-analytics.service";

const asOf = "2026-09-03T00:00:00Z";
const rows = [{ entry_session_id: "one", entry_channel: "nfc", evidence_scope: "unknown", created_at: asOf }];

describe("attraction channel panel quality gates", () => {
  it("does not present disabled tracking as a measured zero", () => {
    render(<AttractionChannelPanel data={buildAttractionChannelAnalytics([], [], "all_records", false, asOf)} />);
    expect(screen.getByText("ยังไม่เปิดเก็บช่องทาง QR / NFC")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "ผลสำเร็จ" })).not.toBeInTheDocument();
  });

  it("withholds low-cell charts and keeps a results table", () => {
    render(<AttractionChannelPanel data={buildAttractionChannelAnalytics(rows, [], "all_records", true, asOf)} />);
    expect(screen.getByText("ฐานข้อมูลบางกลุ่มต่ำกว่าเกณฑ์ จึงยังไม่แสดงกราฟมุมมองนี้")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("ตารางผลลัพธ์และตัวหาร")).toBeInTheDocument();
  });

  it("blocks charts when the bounded query is incomplete", () => {
    render(<AttractionChannelPanel incomplete data={buildAttractionChannelAnalytics([], [], "all_records", true, asOf)} />);
    expect(screen.getByText("ข้อมูลยังอ่านไม่ครบ กรุณาลดช่วงวันที่")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("does not infer field eligibility for unclassified sessions", () => {
    render(<AttractionChannelPanel data={buildAttractionChannelAnalytics(rows, [], "field_claim", true, asOf)} />);
    expect(screen.getByText("ข้อมูลช่องทางยังรอระบุขอบเขตการเก็บ")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
