import { describe, expect, it } from "vitest";
import { parseAdminAttractionSectionFormData } from "@/lib/validation/admin-attraction";

describe("attraction editor field ownership", () => {
  it("drops fields owned by another workspace instead of writing stale hidden values", () => {
    const form = new FormData();
    form.set("descriptionTh", "<p>เนื้อหาปัจจุบัน</p>");
    form.set("nameTh", "ชื่อเก่าที่ไม่ควรถูกส่งกลับ");
    form.set("provinceId", "999");
    form.set("isPublished", "true");

    const parsed = parseAdminAttractionSectionFormData("content", form);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data).toEqual(expect.objectContaining({
      section: "content",
      values: expect.objectContaining({ descriptionTh: "<p>เนื้อหาปัจจุบัน</p>" }),
    }));
    expect(parsed.data.values).not.toHaveProperty("nameTh");
    expect(parsed.data.values).not.toHaveProperty("provinceId");
    expect(parsed.data.values).not.toHaveProperty("isPublished");
  });

  it("keeps category, geography, sustainability, and publication in one settings owner", () => {
    const form = new FormData();
    form.set("provinceId", "1");
    form.set("districtId", "2");
    form.append("attractionTypeIds", "4");
    form.append("attractionTypeIds", "4");
    form.append("attractionTypeIds", "5");
    form.set("primaryAttractionTypeId", "4");
    form.set("sustainabilityCategory", "heritage");
    form.set("estimatedCapacityPerDay", "500");
    form.set("isActive", "true");
    form.set("isPublished", "true");
    form.set("slug", "stale-slug");

    const parsed = parseAdminAttractionSectionFormData("settings", form);

    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data.values).toEqual({
      provinceId: 1,
      districtId: 2,
      attractionTypeIds: [4, 5],
      primaryAttractionTypeId: 4,
      sustainabilityCategory: "heritage",
      estimatedCapacityPerDay: 500,
      isActive: true,
      isPublished: true,
    });
    expect(parsed.data.values).not.toHaveProperty("slug");
  });
});
