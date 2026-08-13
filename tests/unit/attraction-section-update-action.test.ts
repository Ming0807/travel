import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn().mockResolvedValue({ actor: { adminId: "admin-1" } }),
  logAdminMutation: vi.fn().mockResolvedValue(undefined),
  revalidatePath: vi.fn(),
  findAttractionBySlug: vi.fn().mockResolvedValue(null),
  getAdminAttractionById: vi.fn().mockResolvedValue({ attraction_id: 99, slug: "old-slug" }),
  updateAdminAttractionSection: vi.fn().mockResolvedValue({ attraction_id: 99 }),
  syncAttractionTypeAssignments: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("@/lib/auth/guards", () => ({
  AdminAuthError: class AdminAuthError extends Error {},
  requirePermission: mocks.requirePermission,
}));
vi.mock("@/lib/services/audit-log.service", () => ({
  logAdminMutation: mocks.logAdminMutation,
}));
vi.mock("@/lib/repositories/attraction-category.repository", () => ({
  syncAttractionTypeAssignments: mocks.syncAttractionTypeAssignments,
}));
vi.mock("@/lib/repositories/admin-attraction.repository", () => ({
  createAdminAttraction: vi.fn(),
  updateAdminAttraction: vi.fn(),
  updateAdminAttractionSection: mocks.updateAdminAttractionSection,
  updateAdminAttractionStatus: vi.fn(),
  findAttractionBySlug: mocks.findAttractionBySlug,
  getAdminAttractionById: mocks.getAdminAttractionById,
  updateAdminAttractionField: vi.fn(),
  getInlineFieldColumn: vi.fn(),
  updateAdminAttractionRelatedContentV2: vi.fn(),
  searchAdminAttractionRelatedContent: vi.fn(),
}));

import { updateAttractionSectionAction } from "@/app/actions/admin-attraction-actions";

describe("updateAttractionSectionAction field ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates only content-owned fields without stale hidden metadata", async () => {
    const form = new FormData();
    form.set("shortDescriptionTh", "สรุปใหม่");
    form.set("descriptionTh", "<p>เนื้อหาใหม่</p>");

    const result = await updateAttractionSectionAction(99, "content", { success: false }, form);

    expect(result).toEqual({ success: true, data: { id: 99 } });
    expect(mocks.updateAdminAttractionSection).toHaveBeenCalledWith(99, {
      section: "content",
      values: {
        shortDescriptionTh: "สรุปใหม่",
        shortDescriptionEn: null,
        descriptionTh: "<p>เนื้อหาใหม่</p>",
        descriptionEn: null,
        historyTh: null,
        historyEn: null,
        travelTipsTh: null,
        travelTipsEn: null,
        howToGetThereTh: null,
        howToGetThereEn: null,
      },
    });
    expect(mocks.findAttractionBySlug).not.toHaveBeenCalled();
    expect(mocks.syncAttractionTypeAssignments).not.toHaveBeenCalled();
  });

  it("keeps category synchronization inside the settings owner", async () => {
    const form = new FormData();
    form.set("provinceId", "1");
    form.append("attractionTypeIds", "3");
    form.append("attractionTypeIds", "4");
    form.set("primaryAttractionTypeId", "3");
    form.set("isActive", "true");
    form.set("isPublished", "true");

    const result = await updateAttractionSectionAction(99, "settings", { success: false }, form);

    expect(result.success).toBe(true);
    expect(mocks.updateAdminAttractionSection).toHaveBeenCalledWith(99, expect.objectContaining({
      section: "settings",
      values: expect.objectContaining({
        provinceId: 1,
        attractionTypeIds: [3, 4],
        primaryAttractionTypeId: 3,
        isActive: true,
        isPublished: true,
      }),
    }));
    expect(mocks.syncAttractionTypeAssignments).toHaveBeenCalledWith({
      attractionId: 99,
      attractionTypeIds: [3, 4],
      primaryAttractionTypeId: 3,
      isPublished: true,
    });
  });

  it("checks slug uniqueness only for the header owner", async () => {
    mocks.findAttractionBySlug.mockResolvedValueOnce(77);
    const form = new FormData();
    form.set("nameTh", "ชื่อใหม่");
    form.set("nameEn", "New name");
    form.set("slug", "new-name");

    const result = await updateAttractionSectionAction(99, "header", { success: false }, form);

    expect(result.success).toBe(false);
    expect(result.fieldErrors?.slug).toBeDefined();
    expect(mocks.updateAdminAttractionSection).not.toHaveBeenCalled();
  });
});
