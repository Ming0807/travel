import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResearchReadinessSummary } from "@/components/admin/research/ResearchReadinessSummary";

const pending = { key: "advisor", label: "หลักฐานอาจารย์", ready: false, blockingReason: "ยังไม่มีเอกสารอนุมัติ" };
const props = { items: [pending], status: "draft" as const, canManage: true, canActivate: false, sourcePilotStudyId: null };

describe("research readiness navigation", () => {
  it("shows the first blocker and links to the real approval form", () => {
    render(<ResearchReadinessSummary {...props} />);
    expect(screen.getByText("พร้อม 0/1 รายการ")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ตรวจหลักฐานอนุมัติ" })).toHaveAttribute("href", "#research-approval");
    expect(screen.getByRole("group")).not.toHaveAttribute("open");
  });
  it("never offers editing navigation to read-only staff", () => {
    render(<ResearchReadinessSummary {...props} canManage={false} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/ติดต่อผู้ดูแลโครงการ/)).toBeInTheDocument();
  });
  it("links a final study decision to its source Pilot, not its own evidence", () => {
    render(<ResearchReadinessSummary {...props} items={[{ ...pending, key: "pilot_decision" }]} sourcePilotStudyId="pilot-1" />);
    expect(screen.getByRole("link", { name: "ตรวจผล Pilot ต้นทาง" })).toHaveAttribute("href", "/admin/research/pilot-1#research-activation-control");
  });
  it("only offers the existing activation controls when the server permits activation", () => {
    const { rerender } = render(<ResearchReadinessSummary {...props} items={[{ ...pending, ready: true }]} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    rerender(<ResearchReadinessSummary {...props} items={[{ ...pending, ready: true }]} canActivate />);
    expect(screen.getByRole("link", { name: "ทบทวนก่อนเปิดเก็บข้อมูล" })).toHaveAttribute("href", "#research-study-controls");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
  it("does not offer draft editing after activation", () => {
    render(<ResearchReadinessSummary {...props} status="active" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
  it("does not claim readiness for an empty checklist", () => {
    render(<ResearchReadinessSummary {...props} items={[]} canActivate />);
    expect(screen.getByText("ยังไม่มีรายการตรวจความพร้อม")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
  it.each([
    ["active", "กำลังเปิดเก็บข้อมูล"],
    ["paused", "พักการเก็บข้อมูลอยู่"],
    ["closed", "ปิดการเก็บข้อมูลแล้ว"],
    ["archived", "จัดเก็บโครงการแล้ว"],
  ] as const)("gives appropriate guidance for a %s study", (status, message) => {
    render(<ResearchReadinessSummary {...props} status={status} items={[{ ...pending, ready: true }]} />);
    expect(screen.getByText(new RegExp(message))).toBeInTheDocument();
    expect(screen.queryByText(/การเปิดเก็บข้อมูลยังต้องยืนยัน/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
