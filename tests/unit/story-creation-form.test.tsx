import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { StoryForm } from "@/components/admin/stories/StoryForm";
import type { AdminStoryRow } from "@/lib/repositories/admin-story.repository";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/app/actions/admin-story-actions", () => ({ createStoryAction: vi.fn(), updateStoryAction: vi.fn() }));
vi.mock("@/components/admin/forms/FormRichText", () => ({ FormRichText: () => null }));

describe("story creation link", () => {
  it("generates a Thai or English URL from the title while allowing a manual override", async () => {
    render(<StoryForm provinces={[]} />);
    await userEvent.type(screen.getByLabelText("ชื่อบทความ*"), "เที่ยว Yala เมืองเก่า");
    const slug = screen.getByLabelText(/^ลิงก์ของเรื่อง\*/);
    expect(slug).toHaveValue("เที่ยว-yala-เมืองเก่า");
    await userEvent.clear(slug);
    await userEvent.type(slug, "custom-story");
    await userEvent.type(screen.getByLabelText("ชื่อบทความ*"), " เพิ่มเติม");
    expect(slug).toHaveValue("custom-story");
    await userEvent.click(screen.getByRole("button", { name: "สร้างลิงก์จากชื่อเรื่อง" }));
    expect(slug).toHaveValue("เที่ยว-yala-เมืองเก่า-เพิ่มเติม");
  });

  it("keeps the existing public URL when editing a story title", async () => {
    const initialData: AdminStoryRow = { story_id: 1, title: "เรื่องเดิม", slug: "existing-public-url", excerpt: "เกริ่นนำ", content: "<p>เนื้อหา</p>", province_id: null, category: null, is_published: true, published_at: null, created_at: "2026-09-30", updated_at: "2026-09-30", province_name_th: null, author_type: "admin", tourist_id: null, tourist_name: null, status: "published" };
    render(<StoryForm initialData={initialData} provinces={[]} />);
    await userEvent.type(screen.getByLabelText("ชื่อบทความ*"), " แก้ไข");
    expect(screen.getByLabelText(/^ลิงก์ของเรื่อง\*/)).toHaveValue("existing-public-url");
  });
});
