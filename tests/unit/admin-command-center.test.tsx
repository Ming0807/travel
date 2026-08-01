import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OperationsCommandCenter } from "@/components/admin/operations/OperationsCommandCenter";
import type { AdminOperationsViewModel } from "@/types/admin-operations";

function viewModel(
  overrides: Partial<AdminOperationsViewModel> = {},
): AdminOperationsViewModel {
  return {
    generatedAt: "2026-08-01T03:00:00.000Z",
    actionRequiredCount: 3,
    unavailableCount: 0,
    summaryMetrics: [
      { id: "action-required", label: "งานต้องจัดการ", value: 3, href: "#priority-queue", description: "งานที่ต้องติดตาม" },
      { id: "pending-stories", label: "เรื่องรออนุมัติ", value: 2, href: "/admin/stories/submissions", description: "เรื่องที่รอตรวจ" },
    ],
    todayMetrics: [
      { id: "visits-today", label: "การเข้าชมวันนี้", value: 20, href: "/admin/visits", description: "รายการเช็กอิน" },
    ],
    priorityQueue: [
      { id: "pending-stories", label: "เรื่องรอการตรวจ", description: "เรื่องจากนักท่องเที่ยว", count: 2, href: "/admin/stories/submissions", actionLabel: "เริ่มตรวจเรื่อง", severity: "attention" },
    ],
    contentReadiness: [
      { id: "attractions", label: "สถานที่ท่องเที่ยว", description: "เผยแพร่และเปิดใช้งาน", total: 10, ready: 7, href: "/admin/attractions" },
    ],
    recentActivity: [
      { id: "audit-1", actionLabel: "เผยแพร่เนื้อหา", entityLabel: "เรื่องราว", actorName: "ผู้ดูแลทดสอบ", createdAt: "2026-08-01T02:00:00.000Z", href: "/admin/audit" },
    ],
    quickActions: [
      { id: "new-story", label: "เขียนเรื่องใหม่", description: "สร้างเรื่องจากทีม", href: "/admin/stories/new", icon: "story" },
    ],
    modules: [
      { id: "content", label: "เนื้อหาและสถานที่", items: [
        { id: "stories", label: "เรื่องราว", description: "งานบรรณาธิการ", href: "/admin/stories", icon: "stories" },
      ] },
    ],
    ...overrides,
  };
}

describe("OperationsCommandCenter", () => {
  it("presents the daily operational hierarchy with real drill-down links", () => {
    render(<OperationsCommandCenter adminName="ผู้ดูแลทดสอบ" data={viewModel()} />);

    expect(screen.getByRole("heading", { name: "สวัสดี ผู้ดูแลทดสอบ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "งานที่ต้องจัดการ" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "การดำเนินงานวันนี้" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ความพร้อมของเนื้อหา" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "กิจกรรมล่าสุด" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "ทางลัด" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "โมดูลทั้งหมด" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /เริ่มตรวจเรื่อง/ })).toHaveAttribute(
      "href",
      "/admin/stories/submissions",
    );
    expect(screen.getByRole("progressbar", { name: "ความพร้อม สถานที่ท่องเที่ยว" })).toHaveAttribute(
      "aria-valuenow",
      "70",
    );
  });

  it("shows a clear degraded-data notice without hiding available operations", () => {
    render(<OperationsCommandCenter adminName="Admin" data={viewModel({ unavailableCount: 2 })} />);

    expect(screen.getByRole("status")).toHaveTextContent("ข้อมูลบางส่วนยังตรวจสอบไม่ได้");
    expect(screen.getByRole("heading", { name: "งานที่ต้องจัดการ" })).toBeInTheDocument();
  });

  it("uses an actionable empty state and omits sections the actor cannot access", () => {
    render(<OperationsCommandCenter adminName="Admin" data={viewModel({
      actionRequiredCount: 0,
      priorityQueue: [],
      todayMetrics: [],
      contentReadiness: [],
      recentActivity: [],
      quickActions: [],
    })} />);

    expect(screen.getByText("ยังไม่มีงานค้างที่ต้องจัดการ" )).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "การดำเนินงานวันนี้" })).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "กิจกรรมล่าสุด" })).not.toBeInTheDocument();
  });
});
