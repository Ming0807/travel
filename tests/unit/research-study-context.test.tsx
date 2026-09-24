import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ResearchStudyContext } from "@/components/admin/research/ResearchStudyContext";

const study = {
  approvedTitleTh: null,
  approvedGeographicBoundary: null,
  approvalReference: null,
  studyCode: "pilot-yala",
  scopeCode: "natham",
  studyKind: "pilot" as const,
  protocolVersion: "2",
  consentVersion: "3",
  noticeVersion: "4",
};

describe("research study context", () => {
  it("does not describe a draft scope as approved", () => {
    render(<ResearchStudyContext study={study} approvalReady={false} />);

    expect(screen.getByText("ยังไม่ได้บันทึกขอบเขตที่อนุมัติ")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่ผ่านรายการตรวจหลักฐานอนุมัติ")).toBeInTheDocument();
    expect(screen.getByText(/Protocol v2 · Consent v3 · Notice v4/)).toBeInTheDocument();
    expect(screen.getByText(/Study: pilot-yala/).closest("details")).not.toHaveAttribute("open");
  });

  it("shows the recorded approved scope and keeps technical references in details", () => {
    render(<ResearchStudyContext approvalReady study={{
      ...study,
      approvedTitleTh: "การท่องเที่ยวตำบลหน้าถ้ำ",
      approvedGeographicBoundary: "ตำบลหน้าถ้ำ อำเภอเมืองยะลา",
      approvalReference: "APPROVAL-2026-01",
    }} />);

    expect(screen.getByText("การท่องเที่ยวตำบลหน้าถ้ำ")).toBeInTheDocument();
    expect(screen.getByText("ตำบลหน้าถ้ำ อำเภอเมืองยะลา")).toBeInTheDocument();
    expect(screen.getByText("หลักฐานอนุมัติครบตามรายการตรวจ")).toBeInTheDocument();
    expect(screen.getByText(/APPROVAL-2026-01/)).toBeInTheDocument();
    expect(screen.queryByText("ยังไม่ได้บันทึกขอบเขตที่อนุมัติ")).not.toBeInTheDocument();
  });

  it("keeps a partial scope visible without calling it approved", () => {
    render(<ResearchStudyContext study={{ ...study, approvedTitleTh: "ฉบับที่กำลังตรวจ" }} approvalReady={false} />);
    expect(screen.getByText("ฉบับที่กำลังตรวจ")).toBeInTheDocument();
    expect(screen.getByText("ยังไม่ผ่านรายการตรวจหลักฐานอนุมัติ")).toBeInTheDocument();
  });
});
