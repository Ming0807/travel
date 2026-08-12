import { describe, expect, it } from "vitest";
import { restaurantCategoryMutationSchema } from "@/lib/validation/restaurant-category";
import {
  adminRestaurantMutationSchema,
  restaurantMutationFormValues,
} from "@/lib/validation/admin-restaurant";

describe("restaurant category validation", () => {
  it("normalizes a category slug and accepts controlled section fields", () => {
    expect(restaurantCategoryMutationSchema.parse({
      slug: "  Breakfast-Places ",
      nameTh: "อาหารเช้า",
      nameEn: "Breakfast",
      sectionKey: "meals",
      displayOrder: "20",
      isFeatured: "true",
      isActive: "true",
    })).toMatchObject({
      slug: "breakfast-places",
      sectionKey: "meals",
      displayOrder: 20,
      isFeatured: true,
      isActive: true,
    });
  });

  it("rejects invalid slug, section, and negative order", () => {
    expect(() => restaurantCategoryMutationSchema.parse({
      slug: "อาหาร เช้า",
      nameTh: "อาหารเช้า",
      sectionKey: "unknown",
      displayOrder: "-1",
    })).toThrow();
  });

  it("deduplicates restaurant category ids", () => {
    const result = adminRestaurantMutationSchema.parse({
      provinceId: "1",
      slug: "morning-kitchen",
      nameTh: "ครัวมื้อเช้า",
      categoryIds: ["2", "1", "2"],
      isPublished: "true",
      isActive: "true",
    });
    expect(result.categoryIds).toEqual([2, 1]);
  });

  it("preserves repeated category ids from FormData", () => {
    const formData = new FormData();
    formData.set("slug", "morning-kitchen");
    formData.append("categoryIds", "4");
    formData.append("categoryIds", "2");
    expect(restaurantMutationFormValues(formData)).toMatchObject({
      slug: "morning-kitchen",
      categoryIds: ["4", "2"],
    });
  });

  it("allows an uncategorized draft but rejects an uncategorized published restaurant", () => {
    const base = {
      provinceId: "1",
      slug: "draft-kitchen",
      nameTh: "ร้านฉบับร่าง",
      categoryIds: [],
      isActive: "true",
    };

    expect(adminRestaurantMutationSchema.parse({ ...base, isPublished: "false" }).categoryIds).toEqual([]);
    const published = adminRestaurantMutationSchema.safeParse({ ...base, isPublished: "true" });
    expect(published.success).toBe(false);
    if (!published.success) {
      expect(published.error.flatten().fieldErrors.categoryIds).toContain(
        "ร้านที่เผยแพร่ต้องมีอย่างน้อยหนึ่งหมวดหมู่",
      );
    }
  });
});
