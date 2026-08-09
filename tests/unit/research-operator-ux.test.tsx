import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const refresh = vi.fn();
const saveAttempt = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/app/actions/research-actions", () => ({
  saveResearchOperatorAttemptAction: (...args: unknown[]) => saveAttempt(...args),
}));

import { ResearchOperatorTaskWorkspace } from "@/components/research/ResearchOperatorTaskWorkspace";

const task = {
  taskId: "task-1",
  taskCode: "segment_choice",
  titleTh: "เลือกกลุ่มลูกค้าเป้าหมาย",
  instructionTh: "อ่านกราฟนักท่องเที่ยวแล้วเลือกกลุ่มหลัก",
  maximumMinutes: 5,
  attempt: null,
};

describe("research operator task UX", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    saveAttempt.mockResolvedValue({ success: true, status: "completed" });
  });

  it("shows progress without revealing reviewer evidence and keeps evaluation locked until all tasks finish", () => {
    render(<ResearchOperatorTaskWorkspace tasks={[task]} completedTasks={0} />);
    expect(screen.getByText("ความคืบหน้า 0/1 งาน")).toBeInTheDocument();
    expect(screen.queryByText(/หลักฐานคำตอบที่คาดหวัง/)).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ไปทำแบบประเมิน/ })).not.toBeInTheDocument();
  });

  it("submits rationale and confidence without personal identifiers", async () => {
    render(<ResearchOperatorTaskWorkspace tasks={[{ ...task, attempt: { status: "in_progress" as const, confidence: null, rationale: null } }]} completedTasks={0} />);
    fireEvent.change(screen.getByPlaceholderText(/ไม่ใส่ชื่อ/), { target: { value: "เลือกจากกลุ่มอายุและแนวโน้ม" } });
    fireEvent.click(screen.getByRole("radio", { name: "4" }));
    fireEvent.click(screen.getByRole("button", { name: /บันทึกว่างานเสร็จ/ }));
    await waitFor(() => expect(saveAttempt).toHaveBeenCalledWith({
      taskCode: "segment_choice",
      status: "completed",
      confidence: 4,
      rationale: "เลือกจากกลุ่มอายุและแนวโน้ม",
    }));
    expect(refresh).toHaveBeenCalled();
  });

  it("records the task start before showing the evidence form", async () => {
    render(<ResearchOperatorTaskWorkspace tasks={[task]} completedTasks={0} />);
    expect(screen.queryByPlaceholderText(/ไม่ใส่ชื่อ/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /เริ่มงานและจับเวลา/ }));
    await waitFor(() => expect(saveAttempt).toHaveBeenCalledWith({
      taskCode: "segment_choice",
      status: "in_progress",
      confidence: null,
      rationale: undefined,
    }));
  });

  it("offers evaluation only when every task is terminal", () => {
    render(<ResearchOperatorTaskWorkspace tasks={[{ ...task, attempt: { status: "completed" as const, confidence: 4, rationale: "เหตุผล" } }]} completedTasks={1} />);
    expect(screen.getByRole("link", { name: /ไปทำแบบประเมิน/ })).toHaveAttribute("href", "/research/operator/evaluation");
  });
});
