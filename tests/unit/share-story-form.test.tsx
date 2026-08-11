import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShareStoryForm } from "@/components/stories/ShareStoryForm";

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/app/actions/tourist-story-actions", () => ({
  submitTouristStoryAction: mocks.submit,
}));

describe("ShareStoryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("explains the text-only moderation flow and requires content-rights confirmation", () => {
    render(<ShareStoryForm provinces={[{ id: 1, name: "ยะลา" }]} />);

    expect(screen.getByText(/ส่งได้เฉพาะข้อความ/)).toBeInTheDocument();
    expect(screen.getByText(/ทีมงานจะตรวจสอบก่อนเผยแพร่/)).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /ฉันเป็นเจ้าของหรือได้รับอนุญาต/ })).toBeRequired();
    expect(screen.getByRole("button", { name: "ส่งให้ทีมตรวจสอบ" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /เพิ่มรูปภาพ/ })).not.toBeInTheDocument();
  });

  it("shows a truthful submitted state without promising publication", async () => {
    mocks.submit.mockResolvedValue({ success: true, storyId: "trip-123", status: "submitted" });
    render(<ShareStoryForm provinces={[{ id: 1, name: "ยะลา" }]} />);

    fireEvent.change(screen.getByLabelText(/หัวข้อเรื่องราว/), { target: { value: "เช้ายะลา" } });
    fireEvent.change(screen.getByLabelText(/จังหวัดของเรื่องราว/), { target: { value: "1" } });
    fireEvent.change(screen.getByLabelText(/เรื่องราวของคุณ/), { target: { value: "บันทึกการเดินทางในยะลา" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /ฉันเป็นเจ้าของหรือได้รับอนุญาต/ }));
    fireEvent.submit(screen.getByRole("button", { name: "ส่งให้ทีมตรวจสอบ" }).closest("form")!);

    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("ส่งให้ทีมตรวจสอบแล้ว"));
    expect(screen.getByRole("status")).toHaveTextContent("ยังไม่เผยแพร่ทันที");
    expect(screen.queryByText(/จะได้รับการเผยแพร่เร็วๆ นี้/)).not.toBeInTheDocument();
  });
});
