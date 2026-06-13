import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CoverForm } from "@/components/admin/stories/visual-editor/SectionForms";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

// ── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/app/actions/admin-story-actions", () => ({
  updateStoryAction: vi.fn(),
}));

vi.mock("@/components/admin/forms/FormRichText", () => ({
  FormRichText: () => <div data-testid="richtext" />,
}));

vi.mock("@/components/admin/media/MediaPickerModal", () => ({
  MediaPickerModal: ({
    isOpen,
    onClose,
    onSelectAsset,
    title,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSelectAsset?: (asset: { id: number | string; url: string; storage_path: string }) => void;
    title: string;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        <button
          onClick={() => {
            onSelectAsset?.({
              id: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
              url: "/site-media/stories/test-cover.webp",
              storage_path: "stories/test-cover.webp",
            });
            onClose();
          }}
        >
          Pick Media Asset
        </button>
        <button onClick={onClose}>Close Picker</button>
      </div>
    ) : null,
}));

// ── Test Data ──────────────────────────────────────────────────────────────

const baseStory: AdminStoryRow = {
  story_id: 1,
  title: "Test Story",
  slug: "test-story",
  excerpt: "Test excerpt",
  content: "<p>Content</p>",
  status: "published",
  is_published: true,
  category: "วัฒนธรรม",
  province_id: 1,
  author_type: "admin",
  tourist_name: null,
  province_name_th: "ยะลา",
  published_at: "2026-01-01",
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  tourist_id: null,
};

// ── Tests ──────────────────────────────────────────────────────────────────

describe("CoverForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders Save and Cancel buttons", () => {
    render(
      <CoverForm story={baseStory} onClose={vi.fn()} />,
    );

    expect(screen.getByText("บันทึกรูปภาพ")).toBeInTheDocument();
    expect(screen.getByText("ยกเลิก")).toBeInTheDocument();
  });

  it("renders the Media Library picker button", () => {
    render(<CoverForm story={baseStory} onClose={vi.fn()} />);

    expect(
      screen.getByText("เลือกจาก Media Library"),
    ).toBeInTheDocument();
  });

  it("does NOT render the fake manual URL input", () => {
    render(<CoverForm story={baseStory} onClose={vi.fn()} />);

    // The old fake input had placeholder "https://..." and label "หรือป้อน URL โดยตรง"
    expect(
      screen.queryByPlaceholderText("https://..."),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("หรือป้อน URL โดยตรง"),
    ).not.toBeInTheDocument();
  });

  it("renders helper text about Media Library usage", () => {
    render(<CoverForm story={baseStory} onClose={vi.fn()} />);

    expect(
      screen.getByText(/ใช้ปุ่ม.*เลือกจาก Media Library/),
    ).toBeInTheDocument();
  });

  it("hidden coverMediaId input is empty string when no media selected", () => {
    render(<CoverForm story={baseStory} onClose={vi.fn()} />);

        const hiddenInput = document.querySelector(
      'input[name="coverMediaId"]',
    ) as HTMLInputElement;
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput.value).toBe("");
  });

  it("stores selected media asset storage path when media_assets id is a UUID", async () => {
    render(<CoverForm story={baseStory} onClose={vi.fn()} />);

    // Open the media picker
    await userEvent.click(screen.getByText("เลือกจาก Media Library"));

    // Click the mock "Pick Media Asset" button (uuid id, like media_assets.id)
    await userEvent.click(screen.getByText("Pick Media Asset"));

    // The legacy content_media id stays empty, but the storage path persists the selection.
        const hiddenInput = document.querySelector(
      'input[name="coverMediaId"]',
    ) as HTMLInputElement;
    const storagePathInput = document.querySelector(
      'input[name="coverStoragePath"]',
    ) as HTMLInputElement;
    expect(hiddenInput).not.toBeNull();
    expect(hiddenInput.value).toBe("");
    expect(storagePathInput).not.toBeNull();
    expect(storagePathInput.value).toBe("stories/test-cover.webp");
    // Must be a string, not NaN
    expect(hiddenInput.value).not.toBe("NaN");
    expect(typeof hiddenInput.value).toBe("string");
  });

  it("shows empty cover placeholder when no image selected", () => {
    render(<CoverForm story={baseStory} onClose={vi.fn()} />);

    expect(screen.getByText("ยังไม่ได้เลือกรูปภาพ")).toBeInTheDocument();
  });

  it('shows "เอาออก" button when an image is selected via picker', async () => {
    render(<CoverForm story={baseStory} onClose={vi.fn()} />);

    // Open and select an image
    await userEvent.click(screen.getByText("เลือกจาก Media Library"));
    await userEvent.click(screen.getByText("Pick Media Asset"));

    expect(screen.getByText("เอาออก")).toBeInTheDocument();
  });

  it('removes cover preview when "เอาออก" is clicked', async () => {
    const onCoverChange = vi.fn();
    render(
      <CoverForm
        story={baseStory}
        onClose={vi.fn()}
        coverMediaId={42}
        coverMediaUrl="/site-media/old-cover.webp"
        onCoverChange={onCoverChange}
      />,
    );

    // Should show the remove button since we have a cover URL
    await userEvent.click(screen.getByText("เอาออก"));

    // The public preview should not update until the server save succeeds.
    expect(onCoverChange).not.toHaveBeenCalled();
    const actionInput = document.querySelector(
      'input[name="coverMediaAction"]',
    ) as HTMLInputElement;
    expect(actionInput).not.toBeNull();
    expect(actionInput.value).toBe("clear");
    // Preview should show empty state
    expect(screen.getByText("ยังไม่ได้เลือกรูปภาพ")).toBeInTheDocument();
  });

  it("shows dirty state indicator when image is changed", async () => {
    render(
      <CoverForm
        story={baseStory}
        onClose={vi.fn()}
        coverMediaId={null}
        coverMediaUrl=""
      />,
    );

    // No dirty state initially
    expect(
      screen.queryByText("มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก"),
    ).not.toBeInTheDocument();

    // Select an image
    await userEvent.click(screen.getByText("เลือกจาก Media Library"));
    await userEvent.click(screen.getByText("Pick Media Asset"));

    // Dirty state should appear
    expect(
      screen.getByText("มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก"),
    ).toBeInTheDocument();
  });
});
