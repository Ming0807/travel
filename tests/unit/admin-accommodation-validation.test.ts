import { describe, expect, it } from "vitest";
import { adminAccommodationMutationSchema } from "@/lib/validation/admin-accommodation";

const validPayload = {
  provinceId: "1",
  slug: "sample-stay",
  nameTh: "ที่พักตัวอย่าง",
  isPublished: "false",
  isActive: "true",
};

describe("admin accommodation coordinates", () => {
  it("rejects a latitude without a longitude", () => {
    const result = adminAccommodationMutationSchema.safeParse({ ...validPayload, latitude: "6.5" });

    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.flatten().fieldErrors.longitude).toBeDefined();
  });

  it("accepts both coordinates or neither", () => {
    expect(adminAccommodationMutationSchema.safeParse(validPayload).success).toBe(true);
    expect(adminAccommodationMutationSchema.safeParse({
      ...validPayload,
      latitude: "6.5",
      longitude: "101.3",
    }).success).toBe(true);
  });

  it("rejects a non-numeric media library ID", () => {
    const result = adminAccommodationMutationSchema.safeParse({
      ...validPayload,
      coverMediaId: "not-a-media-id",
    });

    expect(result.success).toBe(false);
  });
});
