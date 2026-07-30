import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StoryVisualEditor } from "@/components/admin/stories/visual-editor/StoryVisualEditor";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

vi.mock("@/components/admin/stories/visual-editor/SectionForms", () => ({
  HeaderForm: ({
    onEditorialSaved,
  }: {
    onEditorialSaved?: (value: {
      updatedAt: string;
      revisionNumber: number;
      patch: { title: string };
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onEditorialSaved?.({
          updatedAt: "2026-07-17T02:00:00.000Z",
          revisionNumber: 5,
          patch: { title: "ชื่อที่แก้แล้ว" },
        })
      }
    >
      จำลองบันทึกข้อมูลหลัก
    </button>
  ),
  CoverForm: () => null,
  SettingsForm: () => null,
  ContentForm: ({
    onDirtyChange,
    expectedUpdatedAt,
  }: {
    onDirtyChange?: (isDirty: boolean) => void;
    expectedUpdatedAt?: string;
  }) => (
    <>
      <span>เวอร์ชัน {expectedUpdatedAt}</span>
      <button type="button" onClick={() => onDirtyChange?.(true)}>
        ทำให้เนื้อหามีการแก้ไข
      </button>
    </>
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
        name: "Close เนื้อหาบทความ",
      })
    );

    expect(confirm).toHaveBeenCalledWith(
      "มีการแก้ไขเนื้อหาที่ยังไม่ได้บันทึก ต้องการปิดหน้าต่างแก้ไขหรือไม่"
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("passes the newest shared optimistic version to the next drawer", async () => {
    render(
      <StoryVisualEditor
        story={story}
        provinces={[]}
        coverMediaId={null}
        coverMediaUrl={null}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "แก้ไข ข้อมูลหลัก" }));
    await userEvent.click(screen.getByRole("button", { name: "จำลองบันทึกข้อมูลหลัก" }));
    await userEvent.click(screen.getByRole("button", { name: "แก้ไข เนื้อหาบทความ" }));

    expect(
      screen.getByText("เวอร์ชัน 2026-07-17T02:00:00.000Z")
    ).toBeInTheDocument();
  });

  it("shows Thai publishing readiness and revision history in the editor", () => {
    render(
      <StoryVisualEditor
        story={story}
        provinces={[]}
        revisions={[
          {
            revisionId: "rev-1",
            revisionNumber: 2,
            sourceAction: "save",
            changeSummary: "แก้ไขข้อมูลหลัก",
            createdAt: "2026-07-17T02:00:00.000Z",
          },
        ]}
        coverMediaId={null}
        coverMediaUrl={null}
      />
    );

    expect(screen.getByText("ความพร้อมก่อนเผยแพร่")).toBeInTheDocument();
    expect(screen.getByText("ประวัติการแก้ไข")).toBeInTheDocument();
    expect(screen.getByText("แก้ไขข้อมูลหลัก")).toBeInTheDocument();
  });
});
