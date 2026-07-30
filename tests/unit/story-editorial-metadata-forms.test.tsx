import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  HeaderForm,
  SettingsForm,
} from "@/components/admin/stories/visual-editor/SectionForms";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

const mocks = vi.hoisted(() => ({
  saveEditorialChange: vi.fn(),
}));

vi.mock("@/app/actions/admin-story-actions", () => ({
  saveStoryEditorialChangeAction: mocks.saveEditorialChange,
  updateStoryAction: vi.fn(),
}));

vi.mock("@/components/admin/forms/FormRichText", () => ({
  FormRichText: () => null,
}));

vi.mock("@/components/admin/media/MediaPickerModal", () => ({
  MediaPickerModal: () => null,
}));

const story: AdminStoryRow = {
  story_id: 42,
  title: "เรื่องเดิม",
  slug: "old-story",
  excerpt: "เกริ่นนำเดิม",
  content: "<p>เนื้อหาเดิม</p>",
  content_document: null,
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
  primary_language: "th",
  geographic_scope: "province",
  seo_title: null,
  seo_description: null,
  scheduled_at: null,
  topic_ids: [1],
};

describe("story editorial metadata forms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.saveEditorialChange.mockResolvedValue({
      success: true,
      data: {
        updatedAt: "2026-07-17T01:00:00.000Z",
        revisionNumber: 4,
      },
    });
  });

  it("saves only header fields through the atomic editorial action", async () => {
    const onEditorialSaved = vi.fn();
    render(
      <HeaderForm
        story={story}
        expectedUpdatedAt="2026-07-17T00:30:00.000Z"
        onClose={vi.fn()}
        onEditorialSaved={onEditorialSaved}
      />
    );

    const title = screen.getByLabelText("ชื่อบทความ *");
    await userEvent.clear(title);
    await userEvent.type(title, "เรื่องใหม่");
    await userEvent.click(screen.getByRole("button", { name: "บันทึกข้อมูลหลัก" }));

    await waitFor(() =>
      expect(mocks.saveEditorialChange).toHaveBeenCalledWith({
        storyId: 42,
        expectedUpdatedAt: "2026-07-17T00:30:00.000Z",
        change: {
          title: "เรื่องใหม่",
          slug: "old-story",
          excerpt: "เกริ่นนำเดิม",
          changeSummary: "แก้ไขข้อมูลหลักของบทความ",
        },
      })
    );
    expect(onEditorialSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        updatedAt: "2026-07-17T01:00:00.000Z",
        patch: expect.objectContaining({ title: "เรื่องใหม่" }),
      })
    );
  });

  it("saves geography, topics, language, SEO, and schedule without changing workflow status", async () => {
    render(
      <SettingsForm
        story={story}
        expectedUpdatedAt="2026-07-17T00:30:00.000Z"
        onClose={vi.fn()}
        provinces={[
          { province_id: 1, province_name_th: "ยะลา" },
          { province_id: 2, province_name_th: "ปัตตานี" },
        ]}
        topics={[
          { id: 1, key: "culture", nameTh: "วัฒนธรรม", nameEn: "Culture" },
          { id: 2, key: "nature", nameTh: "ธรรมชาติ", nameEn: "Nature" },
        ]}
      />
    );

    await userEvent.click(screen.getByRole("checkbox", { name: "ธรรมชาติ" }));
    await userEvent.selectOptions(screen.getByLabelText("จังหวัดหลัก"), "2");
    await userEvent.type(
      screen.getByLabelText("คำอธิบายสำหรับผลการค้นหา"),
      "เที่ยวปัตตานีผ่านเรื่องราวจากคนในพื้นที่"
    );
    await userEvent.click(screen.getByRole("button", { name: "บันทึกข้อมูลประกอบ" }));

    await waitFor(() => expect(mocks.saveEditorialChange).toHaveBeenCalledOnce());
    const payload = mocks.saveEditorialChange.mock.calls[0]?.[0];
    expect(payload).toEqual({
      storyId: 42,
      expectedUpdatedAt: "2026-07-17T00:30:00.000Z",
      change: expect.objectContaining({
        provinceId: 2,
        geographicScope: "province",
        topicIds: [1, 2],
        primaryLanguage: "th",
        seoDescription: "เที่ยวปัตตานีผ่านเรื่องราวจากคนในพื้นที่",
        changeSummary: "แก้ไขข้อมูลประกอบและ SEO",
      }),
    });
    expect(payload.change).not.toHaveProperty("targetStatus");
  });

  it("does not present an unsafe direct status dropdown", () => {
    render(
      <SettingsForm
        story={story}
        onClose={vi.fn()}
        provinces={[]}
        topics={[]}
      />
    );

    expect(screen.queryByLabelText("สถานะ *")).not.toBeInTheDocument();
    expect(screen.getByText("ฉบับร่าง")).toBeInTheDocument();
  });

  it("moves status through an allowed atomic workflow transition", async () => {
    const onEditorialSaved = vi.fn();
    render(
      <SettingsForm
        story={story}
        expectedUpdatedAt="2026-07-17T00:30:00.000Z"
        onClose={vi.fn()}
        onEditorialSaved={onEditorialSaved}
        provinces={[]}
        topics={[]}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "ส่งตรวจ" }));

    await waitFor(() =>
      expect(mocks.saveEditorialChange).toHaveBeenCalledWith({
        storyId: 42,
        expectedUpdatedAt: "2026-07-17T00:30:00.000Z",
        change: {
          targetStatus: "in_review",
          reviewNote: null,
          changeSummary: "เปลี่ยนสถานะเป็น กำลังตรวจ",
        },
      })
    );
    expect(onEditorialSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        patch: expect.objectContaining({
          status: "in_review",
          is_published: false,
        }),
      })
    );
  });

  it("requires a review note before requesting changes to tourist UGC", () => {
    render(
      <SettingsForm
        story={{
          ...story,
          author_type: "tourist",
          status: "in_review",
        }}
        onClose={vi.fn()}
        provinces={[]}
        topics={[]}
      />
    );

    expect(screen.getByLabelText("เหตุผลประกอบการตรวจ")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "ขอข้อมูลเพิ่ม" })
    ).toBeDisabled();
  });
});
