import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const mocks = vi.hoisted(() => ({
  requirePermission: vi.fn().mockResolvedValue({ actor: { adminId: "admin-1" } }),
  logAdminMutation: vi.fn().mockResolvedValue(undefined),
  revalidatePath: vi.fn(),
  findAttractionBySlug: vi.fn().mockResolvedValue(null),
  getAdminAttractionById: vi.fn().mockResolvedValue({ attraction_id: 99 }),
  updateAdminAttraction: vi.fn().mockResolvedValue({ attraction_id: 99 }),
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
  updateAdminAttraction: mocks.updateAdminAttraction,
  updateAdminAttractionStatus: vi.fn(),
  findAttractionBySlug: mocks.findAttractionBySlug,
  getAdminAttractionById: mocks.getAdminAttractionById,
  updateAdminAttractionField: vi.fn(),
  getInlineFieldColumn: vi.fn(),
  updateAdminAttractionRelatedContent: vi.fn(),
}));

import { updateAttractionAction } from "@/app/actions/admin-attraction-actions";

function validUpdateForm() {
  const form = new FormData();
  form.set("provinceId", "1");
  form.set("attractionTypeId", "3");
  form.set("slug", "wat-khuha-phimuk");
  form.set("nameTh", "วัดคูหาภิมุข");
  form.set("descriptionTh", "เนื้อหาที่แก้ไข");
  form.set("isActive", "true");
  form.set("isPublished", "false");
  return form;
}

describe("updateAttractionAction category ownership", () => {
  beforeEach(() => vi.clearAllMocks());

  it("preserves secondary categories when a content section submits only the legacy hidden primary", async () => {
    const result = await updateAttractionAction(
      99,
      { success: false },
      validUpdateForm(),
    );

    expect(result.success).toBe(true);
    expect(mocks.updateAdminAttraction).toHaveBeenCalledOnce();
    expect(mocks.syncAttractionTypeAssignments).not.toHaveBeenCalled();
  });

  it("synchronizes all categories when the category editor submits an explicit selection", async () => {
    const form = validUpdateForm();
    form.append("attractionTypeIds", "3");
    form.append("attractionTypeIds", "4");
    form.set("primaryAttractionTypeId", "3");

    const result = await updateAttractionAction(99, { success: false }, form);

    expect(result.success).toBe(true);
    expect(mocks.syncAttractionTypeAssignments).toHaveBeenCalledWith({
      attractionId: 99,
      attractionTypeIds: [3, 4],
      primaryAttractionTypeId: 3,
      isPublished: false,
    });
  });
});
