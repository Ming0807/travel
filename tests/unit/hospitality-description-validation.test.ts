import { describe, expect, it } from "vitest";
import { adminRestaurantMutationSchema } from "@/lib/validation/admin-restaurant";
import { adminAccommodationMutationSchema } from "@/lib/validation/admin-accommodation";
import { sanitizeAdminDescription } from "@/lib/content/admin-rich-html";

const base = {
  provinceId: 1,
  slug: "na-tham-place",
  nameTh: "ที่หน้าถ้ำ",
  isPublished: false,
  isActive: true,
};

describe("hospitality long-form content", () => {
  it("accepts more than 5,000 characters in restaurant and accommodation descriptions", () => {
    const description = `<p>${"ก".repeat(6000)}</p>`;
    const restaurant = adminRestaurantMutationSchema.safeParse({ ...base, descriptionTh: description });
    const accommodation = adminAccommodationMutationSchema.safeParse({ ...base, descriptionTh: description });
    expect(restaurant.success).toBe(true);
    expect(accommodation.success).toBe(true);
  });

  it("rejects unbounded description input", () => {
    const description = "ก".repeat(30001);
    expect(adminRestaurantMutationSchema.safeParse({ ...base, descriptionTh: description }).success).toBe(false);
    expect(adminAccommodationMutationSchema.safeParse({ ...base, descriptionTh: description }).success).toBe(false);
  });

  it("preserves plain text while sanitizing rich HTML", () => {
    expect(sanitizeAdminDescription("ร้าน A & B")).toBe("ร้าน A & B");
    const sanitized = sanitizeAdminDescription('<p>มื้อเช้า</p><script>alert(1)</script>');
    expect(sanitized).toContain("มื้อเช้า");
    expect(sanitized).not.toContain("<script>");
  });
});
