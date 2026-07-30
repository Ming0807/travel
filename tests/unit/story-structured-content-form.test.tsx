import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ContentForm } from "@/components/admin/stories/visual-editor/SectionForms";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";
import type { StoryDocument } from "@/lib/content/story-document";

const mocks = vi.hoisted(() => ({
  saveEditorialChange: vi.fn(),
}));

vi.mock("@/app/actions/admin-story-actions", () => ({
  saveStoryEditorialChangeAction: mocks.saveEditorialChange,
  updateStoryAction: vi.fn(),
}));

const initialDocument: StoryDocument = {
  type: "doc",
  version: 1,
  content: [
    {
      type: "paragraph",
      content: [{ type: "text", text: "เนื้อหาเดิม" }],
    },
  ],
};

const updatedDocument: StoryDocument = {
  type: "doc",
  version: 1,
  content: [
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "หัวข้อใหม่" }],
    },
  ],
};

vi.mock("@/components/admin/forms/FormRichText", () => ({
  FormRichText: ({
    onValueChange,
  }: {
    onValueChange?: (value: {
      html: string;
      document: StoryDocument | null;
    }) => void;
  }) => (
    <button
      type="button"
      onClick={() =>
        onValueChange?.({
          html: "<h2>หัวข้อใหม่</h2>",
          document: updatedDocument,
        })
      }
    >
      จำลองการแก้ไขเนื้อหา
    </button>
  ),
}));

const story: AdminStoryRow = {
  story_id: 42,
  title: "เรื่องราวทดสอบ",
  slug: "test-story",
  excerpt: "เกริ่นนำ",
  content: "<p>เนื้อหาเดิม</p>",
  content_document: initialDocument,
  content_schema_version: 1,
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

describe("structured story content form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const storage = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      key: (index: number) => [...storage.keys()][index] ?? null,
      get length() {
        return storage.size;
      },
    });
  });

  it("reports dirty state and saves HTML with canonical structured JSON atomically", async () => {
    mocks.saveEditorialChange.mockResolvedValueOnce({
      success: true,
      data: {
        updatedAt: "2026-07-17T01:00:00.000Z",
        revisionNumber: 3,
      },
    });
    const onClose = vi.fn();
    const onContentSaved = vi.fn();
    const onDirtyChange = vi.fn();

    render(
      <ContentForm
        story={story}
        onClose={onClose}
        onContentSaved={onContentSaved}
        onDirtyChange={onDirtyChange}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "จำลองการแก้ไขเนื้อหา" })
    );
    await waitFor(() => expect(onDirtyChange).toHaveBeenLastCalledWith(true));

    await userEvent.click(
      screen.getByRole("button", { name: "บันทึกเนื้อหา" })
    );

    await waitFor(() =>
      expect(mocks.saveEditorialChange).toHaveBeenCalledWith({
        storyId: 42,
        expectedUpdatedAt: "2026-07-17T00:00:00.000Z",
        change: expect.objectContaining({
          legacyContent: "<h2>หัวข้อใหม่</h2>",
          contentDocument: updatedDocument,
          contentSchemaVersion: 1,
          changeSummary: "แก้ไขเนื้อหาบทความ",
        }),
      })
    );
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
    expect(onContentSaved).toHaveBeenCalledWith(
      "<h2>หัวข้อใหม่</h2>",
      updatedDocument
    );
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("warns before browser navigation while content is dirty", async () => {
    render(
      <ContentForm
        story={story}
        onClose={vi.fn()}
        onDirtyChange={vi.fn()}
      />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "จำลองการแก้ไขเนื้อหา" })
    );

    const event = new Event("beforeunload", { cancelable: true });
    fireEvent(window, event);

    expect(event.defaultPrevented).toBe(true);
  });
});
