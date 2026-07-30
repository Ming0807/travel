import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoryVisualEditor } from "@/components/admin/stories/visual-editor/StoryVisualEditor";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

vi.mock("@/components/admin/stories/visual-editor/SectionForms", () => ({
  HeaderForm: () => null,
  CoverForm: () => null,
  SettingsForm: () => null,
  ContentForm: ({
    onDirtyChange,
  }: {
    onDirtyChange?: (isDirty: boolean) => void;
  }) => (
    <button type="button" onClick={() => onDirtyChange?.(true)}>
      ทำให้เนื้อหามีการแก้ไข
    </button>
  ),
}));

const story: AdminStoryRow = {
  story_id: 42,
  title: "เรื่องราวทดสอบ",
  slug: "test-story",
  excerpt: "เกริ่นนำ",
  content: "<p>เนื้อหาเดิม</p>",
  province_id: 1,
  category: "วัฒนธรรม",
  is_published: false,
  published_at: null,
  created_at: "2026-07-01T00:00:00.000Z",
  updated_at: "2026-07-17T00:00:00.000Z",
  province_name_th: "ยะลา",
  author_type: "admin",
  tourist_id: null,
  status: "draft",
  tourist_name: null,
};

describe("StoryVisualEditor dirty drawer protection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("confirm", vi.fn());
  });

  it("keeps the content drawer open when the editor rejects discarding changes", async () => {
    vi.mocked(confirm).mockReturnValue(false);
    render(
      <StoryVisualEditor
        story={story}
        provinces={[]}
        coverMediaId={null}
        coverMediaUrl={null}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "แก้ไข เนื้อหาบทความ" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "ทำให้เนื้อหามีการแก้ไข" })
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: "Close เนื้อหาบทความ (Content)",
      })
    );

    expect(confirm).toHaveBeenCalledWith(
      "มีการแก้ไขเนื้อหาที่ยังไม่ได้บันทึก ต้องการปิดหน้าต่างแก้ไขหรือไม่"
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
