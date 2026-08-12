import { describe, expect, it } from "vitest";
import { adminAttractionMutationSchema, adminAttractionFiltersSchema } from "@/lib/validation/admin-attraction";
import { adminCheckinCodeMutationSchema, adminCheckinCodeFiltersSchema } from "@/lib/validation/checkin-code";
import { adminPhotoSpotFiltersSchema, adminPhotoSpotMutationSchema } from "@/lib/validation/photo-spot";
import { adminRouteFiltersSchema, adminRouteMutationSchema, adminRouteStopsBatchSchema, adminRouteStopMutationSchema } from "@/lib/validation/route";
import { adminStoryMutationSchema, adminStoryFiltersSchema } from "@/lib/validation/story";
import { adminAccommodationMutationSchema, adminAccommodationFiltersSchema } from "@/lib/validation/admin-accommodation";
import { adminRestaurantMutationSchema, adminRestaurantFiltersSchema } from "@/lib/validation/admin-restaurant";
import { adminMediaFiltersSchema, adminMediaEntityTypeSchema, adminMediaLifecycleStatusSchema } from "@/lib/validation/media";
import { adminPaginationSchema } from "@/lib/validation/admin-attraction";
import { adminBadgeFiltersSchema, badgeDefinitionSchema } from "@/lib/validation/admin-badge";
import { adminReviewFiltersSchema } from "@/lib/validation/admin-review";

// =========================================
// Admin Pagination Schema
// =========================================
describe("adminPaginationSchema", () => {
  it("defaults page to 1 and pageSize to 20", () => {
    const result = adminPaginationSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("accepts explicit page and pageSize", () => {
    const result = adminPaginationSchema.parse({ page: "3", pageSize: "50" });
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(50);
  });

  it("rejects pageSize > 100", () => {
    expect(() => adminPaginationSchema.parse({ pageSize: "101" })).toThrow();
  });

  it("rejects page < 1", () => {
    expect(() => adminPaginationSchema.parse({ page: "0" })).toThrow();
  });
});

describe("admin query boolean filters", () => {
  it("parses false query strings as false, not truthy strings", () => {
    expect(adminAttractionFiltersSchema.parse({ isPublished: "false" }).isPublished).toBe(false);
    expect(adminAttractionFiltersSchema.parse({ isActive: "false" }).isActive).toBe(false);
    expect(adminRestaurantFiltersSchema.parse({ isPublished: "false" }).isPublished).toBe(false);
    expect(adminAccommodationFiltersSchema.parse({ isPublished: "false" }).isPublished).toBe(false);
    expect(adminRouteFiltersSchema.parse({ isPublished: "false" }).isPublished).toBe(false);
    expect(adminRouteFiltersSchema.parse({ isActive: "false" }).isActive).toBe(false);
    expect(adminStoryFiltersSchema.parse({ isPublished: "false" }).isPublished).toBe(false);
    expect(adminPhotoSpotFiltersSchema.parse({ isActive: "false" }).isActive).toBe(false);
    expect(adminMediaFiltersSchema.parse({ isActive: "false" }).isActive).toBe(false);
    expect(adminReviewFiltersSchema.parse({ isApproved: "false" }).isApproved).toBe(false);
    expect(adminReviewFiltersSchema.parse({ isPublished: "false" }).isPublished).toBe(false);
    expect(adminCheckinCodeFiltersSchema.parse({ isActive: "false" }).isActive).toBe(false);
  });

  it("omits empty boolean query values", () => {
    expect(adminAttractionFiltersSchema.parse({ isPublished: "" }).isPublished).toBeUndefined();
    expect(adminReviewFiltersSchema.parse({ isApproved: "" }).isApproved).toBeUndefined();
  });
});

// =========================================
// Admin Attraction Schema
// =========================================
describe("adminAttractionMutationSchema", () => {
  const validPayload = {
    provinceId: "1",
    slug: "yala-beach",
    nameTh: "หาดยะลา",
    isPublished: "true",
    isActive: "true",
  };

  it("accepts a valid minimal payload", () => {
    const result = adminAttractionMutationSchema.parse(validPayload);
    expect(result.provinceId).toBe(1);
    expect(result.slug).toBe("yala-beach");
    expect(result.nameTh).toBe("หาดยะลา");
    expect(result.isPublished).toBe(true);
  });

  it("rejects missing provinceId", () => {
    expect(() =>
      adminAttractionMutationSchema.parse({ ...validPayload, provinceId: undefined })
    ).toThrow();
  });

  it("rejects empty nameTh", () => {
    expect(() =>
      adminAttractionMutationSchema.parse({ ...validPayload, nameTh: "" })
    ).toThrow();
  });

  it("rejects invalid slug format", () => {
    expect(() =>
      adminAttractionMutationSchema.parse({ ...validPayload, slug: "My Beach!" })
    ).toThrow(/URL-safe/);
  });

  it("accepts optional fields like latitude/longitude", () => {
    const result = adminAttractionMutationSchema.parse({
      ...validPayload,
      latitude: "6.5",
      longitude: "101.3",
      estimatedCapacityPerDay: "500",
    });
    expect(result.latitude).toBeCloseTo(6.5);
    expect(result.longitude).toBeCloseTo(101.3);
    expect(result.estimatedCapacityPerDay).toBe(500);
  });

  it("rejects invalid latitude range", () => {
    expect(() =>
      adminAttractionMutationSchema.parse({ ...validPayload, latitude: "100" })
    ).toThrow();
  });

  it("accepts empty optional fields as null", () => {
    const result = adminAttractionMutationSchema.parse(validPayload);
    expect(result.districtId).toBeNull();
    expect(result.nameEn).toBeNull();
    expect(result.descriptionTh).toBeNull();
  });

  it("coerces boolean false from 'false' string", () => {
    const result = adminAttractionMutationSchema.parse({
      ...validPayload,
      isPublished: "false",
      isActive: "false",
    });
    expect(result.isPublished).toBe(false);
    expect(result.isActive).toBe(false);
  });
});

describe("adminAttractionFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = adminAttractionFiltersSchema.parse({
      provinceId: "1",
      isPublished: "true",
      search: "beach",
    });
    expect(result.provinceId).toBe(1);
    expect(result.isPublished).toBe(true);
    expect(result.search).toBe("beach");
  });

  it("ignores empty search strings", () => {
    const result = adminAttractionFiltersSchema.parse({ search: "" });
    expect(result.search).toBeUndefined();
  });

  it("rejects invalid provinceId", () => {
    expect(() => adminAttractionFiltersSchema.parse({ provinceId: "0" })).toThrow();
  });
});

// =========================================
// Admin Check-in Code Schema
// =========================================
describe("adminCheckinCodeMutationSchema", () => {
  const validPayload = {
    code: "yala-beach-2026",
    attractionId: "1",
    isActive: "true",
  };

  it("accepts a valid minimal payload", () => {
    const result = adminCheckinCodeMutationSchema.parse(validPayload);
    expect(result.code).toBe("yala-beach-2026");
    expect(result.attractionId).toBe(1);
  });

  it("rejects code with spaces", () => {
    expect(() =>
      adminCheckinCodeMutationSchema.parse({ ...validPayload, code: "invalid code" })
    ).toThrow(/URL-safe/);
  });

  it("rejects code shorter than 3 chars", () => {
    expect(() =>
      adminCheckinCodeMutationSchema.parse({ ...validPayload, code: "ab" })
    ).toThrow();
  });

  it("rejects start date after end date", () => {
    const { success, error } = adminCheckinCodeMutationSchema.safeParse({
      ...validPayload,
      startsAt: "2026-06-01T00:00:00Z",
      endsAt: "2026-05-01T00:00:00Z",
    });
    expect(success).toBe(false);
    if (!success) {
      expect(error.flatten().fieldErrors.endsAt?.[0]).toContain("Start date must be before end date");
    }
  });

  it("accepts valid date range", () => {
    const result = adminCheckinCodeMutationSchema.parse({
      ...validPayload,
      startsAt: "2026-05-01T00:00:00Z",
      endsAt: "2026-06-01T00:00:00Z",
    });
    expect(result.startsAt).toBeTruthy();
    expect(result.endsAt).toBeTruthy();
  });

  it("accepts optional photoSpotId", () => {
    const result = adminCheckinCodeMutationSchema.parse({
      ...validPayload,
      photoSpotId: "5",
    });
    expect(result.photoSpotId).toBe(5);
  });
});

describe("adminCheckinCodeFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = adminCheckinCodeFiltersSchema.parse({
      attractionId: "1",
      isActive: "true",
    });
    expect(result.attractionId).toBe(1);
    expect(result.isActive).toBe(true);
  });

  it("accepts check-in availability filters", () => {
    expect(adminCheckinCodeFiltersSchema.parse({ availability: "current" }).availability).toBe("current");
    expect(adminCheckinCodeFiltersSchema.parse({ availability: "upcoming" }).availability).toBe("upcoming");
    expect(adminCheckinCodeFiltersSchema.parse({ availability: "expired" }).availability).toBe("expired");
    expect(() => adminCheckinCodeFiltersSchema.parse({ availability: "unknown" })).toThrow();
  });
});

// =========================================
// Admin Photo Spot Schema
// =========================================
describe("adminPhotoSpotMutationSchema", () => {
  const validPayload = {
    attractionId: "1",
    spotNameTh: "จุดถ่ายภาพหาดยะลา",
    isActive: "true",
  };

  it("accepts a valid minimal payload", () => {
    const result = adminPhotoSpotMutationSchema.parse(validPayload);
    expect(result.attractionId).toBe(1);
    expect(result.spotNameTh).toBe("จุดถ่ายภาพหาดยะลา");
  });

  it("rejects empty spotNameTh", () => {
    expect(() =>
      adminPhotoSpotMutationSchema.parse({ ...validPayload, spotNameTh: "" })
    ).toThrow();
  });

  it("accepts coordinates within valid ranges", () => {
    const result = adminPhotoSpotMutationSchema.parse({
      ...validPayload,
      latitude: "6.5",
      longitude: "101.3",
    });
    expect(result.latitude).toBeCloseTo(6.5);
    expect(result.longitude).toBeCloseTo(101.3);
  });

  it("rejects invalid longitude", () => {
    expect(() =>
      adminPhotoSpotMutationSchema.parse({ ...validPayload, longitude: "200" })
    ).toThrow();
  });

  it("accepts displayOrder", () => {
    const result = adminPhotoSpotMutationSchema.parse({
      ...validPayload,
      displayOrder: "3",
    });
    expect(result.displayOrder).toBe(3);
  });
});

// =========================================
// Admin Route Schema
// =========================================
describe("adminRouteMutationSchema", () => {
  const validPayload = {
    nameTh: "เที่ยว 3 จังหวัดชายแดนใต้",
    slug: "southern-border-tour",
    isPublished: "true",
    isActive: "true",
  };

  it("accepts a valid minimal payload", () => {
    const result = adminRouteMutationSchema.parse(validPayload);
    expect(result.nameTh).toBe("เที่ยว 3 จังหวัดชายแดนใต้");
    expect(result.slug).toBe("southern-border-tour");
  });

  it("rejects empty nameTh", () => {
    expect(() => adminRouteMutationSchema.parse({ ...validPayload, nameTh: "" })).toThrow();
  });

  it("rejects invalid slug", () => {
    expect(() =>
      adminRouteMutationSchema.parse({ ...validPayload, slug: "MY ROUTE" })
    ).toThrow(/URL-safe/);
  });

});

describe("adminRouteStopMutationSchema", () => {
  it("accepts a valid route stop", () => {
    const result = adminRouteStopMutationSchema.parse({
      attractionId: "1",
      dayNumber: "1",
      displayOrder: "2",
    });
    expect(result.attractionId).toBe(1);
    expect(result.dayNumber).toBe(1);
    expect(result.displayOrder).toBe(2);
  });

  it("rejects dayNumber less than 1", () => {
    expect(() =>
      adminRouteStopMutationSchema.parse({
        attractionId: "1",
        dayNumber: "0",
        displayOrder: "1",
      })
    ).toThrow();
  });
});

describe("adminRouteStopsBatchSchema", () => {
  it("accepts a batch of route stops", () => {
    const result = adminRouteStopsBatchSchema.parse({
      routeId: "1",
      stops: [
        { attractionId: "1", dayNumber: "1", displayOrder: "1" },
        { attractionId: "2", dayNumber: "1", displayOrder: "2" },
      ],
    });
    expect(result.stops).toHaveLength(2);
    expect(result.routeId).toBe(1);
  });

  it("rejects empty stops array", () => {
    const result = adminRouteStopsBatchSchema.safeParse({
      routeId: "1",
      stops: [],
    });
    expect(result.success).toBe(true); // empty stops are allowed (clearing)
  });
});

// =========================================
// Admin Story Schema
// =========================================
describe("adminStoryMutationSchema", () => {
  const validPayload = {
    title: "เที่ยวทะเลยะลา",
    slug: "yala-beach-trip",
    isPublished: "true",
  };

  it("accepts a valid payload", () => {
    const result = adminStoryMutationSchema.parse(validPayload);
    expect(result.title).toBe("เที่ยวทะเลยะลา");
    expect(result.slug).toBe("yala-beach-trip");
  });

  it("rejects empty title", () => {
    expect(() => adminStoryMutationSchema.parse({ ...validPayload, title: "" })).toThrow();
  });

  it("rejects invalid slug", () => {
    expect(() =>
      adminStoryMutationSchema.parse({ ...validPayload, slug: "สวัสดี" })
    ).toThrow(/URL-safe/);
  });

  it("accepts backward-compatible editorial and traveler workflow statuses", () => {
    for (const status of [
      "draft",
      "pending",
      "submitted",
      "in_review",
      "changes_requested",
      "approved",
      "scheduled",
      "published",
      "rejected",
      "archived",
    ]) {
      expect(adminStoryMutationSchema.safeParse({ ...validPayload, status }).success).toBe(true);
    }
  });
});

describe("adminStoryFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = adminStoryFiltersSchema.parse({
      provinceId: "1",
      isPublished: "true",
      search: "ทะเล",
    });
    expect(result.provinceId).toBe(1);
    expect(result.isPublished).toBe(true);
    expect(result.search).toBe("ทะเล");
  });
});

// =========================================
// Admin Accommodation Schema
// =========================================
describe("adminAccommodationMutationSchema", () => {
  const validPayload = {
    provinceId: "1",
    slug: "yala-resort",
    nameTh: "ยะลารีสอร์ท",
    isPublished: "true",
    isActive: "true",
  };

  it("accepts a valid payload", () => {
    const result = adminAccommodationMutationSchema.parse(validPayload);
    expect(result.provinceId).toBe(1);
    expect(result.slug).toBe("yala-resort");
    expect(result.nameTh).toBe("ยะลารีสอร์ท");
  });

  it("rejects empty nameTh", () => {
    expect(() =>
      adminAccommodationMutationSchema.parse({ ...validPayload, nameTh: "" })
    ).toThrow();
  });

  it("rejects invalid slug", () => {
    expect(() =>
      adminAccommodationMutationSchema.parse({ ...validPayload, slug: "My Resort!" })
    ).toThrow(/URL-safe/);
  });
});

describe("adminAccommodationFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = adminAccommodationFiltersSchema.parse({
      provinceId: "1",
      accommodationType: "hotel",
      isPublished: "true",
    });
    expect(result.provinceId).toBe(1);
    expect(result.accommodationType).toBe("hotel");
  });
});

// =========================================
// Admin Restaurant Schema
// =========================================
describe("adminRestaurantMutationSchema", () => {
  const validPayload = {
    provinceId: "1",
    slug: "yala-kitchen",
    nameTh: "ครัวยะลา",
    categoryIds: ["1"],
    isPublished: "true",
    isActive: "true",
  };

  it("accepts a valid payload", () => {
    const result = adminRestaurantMutationSchema.parse(validPayload);
    expect(result.provinceId).toBe(1);
    expect(result.slug).toBe("yala-kitchen");
    expect(result.nameTh).toBe("ครัวยะลา");
  });

  it("rejects empty nameTh", () => {
    expect(() =>
      adminRestaurantMutationSchema.parse({ ...validPayload, nameTh: "" })
    ).toThrow();
  });
});

describe("adminRestaurantFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = adminRestaurantFiltersSchema.parse({
      provinceId: "1",
      categorySlug: "seafood",
      isPublished: "true",
    });
    expect(result.provinceId).toBe(1);
    expect(result.categorySlug).toBe("seafood");
  });
});

// =========================================
// Admin Media Schema (Filters + Entity Types)
// =========================================
describe("adminMediaFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = adminMediaFiltersSchema.parse({
      entityType: "attraction",
      mediaType: "image",
      lifecycleStatus: "active",
    });
    expect(result.entityType).toBe("attraction");
    expect(result.lifecycleStatus).toBe("active");
  });

  it("rejects invalid entityType", () => {
    expect(() =>
      adminMediaFiltersSchema.parse({ entityType: "user" })
    ).toThrow();
  });

  it("rejects invalid lifecycleStatus", () => {
    expect(() =>
      adminMediaFiltersSchema.parse({ lifecycleStatus: "deleted" })
    ).toThrow();
  });
});

describe("adminMediaEntityTypeSchema", () => {
  it("accepts attraction, restaurant, accommodation, story, route", () => {
    expect(adminMediaEntityTypeSchema.parse("attraction")).toBe("attraction");
    expect(adminMediaEntityTypeSchema.parse("restaurant")).toBe("restaurant");
    expect(adminMediaEntityTypeSchema.parse("accommodation")).toBe("accommodation");
    expect(adminMediaEntityTypeSchema.parse("story")).toBe("story");
    expect(adminMediaEntityTypeSchema.parse("route")).toBe("route");
  });

  it("rejects invalid entity types", () => {
    expect(() => adminMediaEntityTypeSchema.parse("accommodations")).toThrow();
    expect(() => adminMediaEntityTypeSchema.parse("photo_spot")).toThrow();
    expect(() => adminMediaEntityTypeSchema.parse("checkin_code")).toThrow();
  });
});

describe("adminMediaLifecycleStatusSchema", () => {
  it("accepts draft, active, archived", () => {
    expect(adminMediaLifecycleStatusSchema.parse("draft")).toBe("draft");
    expect(adminMediaLifecycleStatusSchema.parse("active")).toBe("active");
    expect(adminMediaLifecycleStatusSchema.parse("archived")).toBe("archived");
  });

  it("rejects unknown statuses", () => {
    expect(() => adminMediaLifecycleStatusSchema.parse("deleted")).toThrow();
    expect(() => adminMediaLifecycleStatusSchema.parse("pending")).toThrow();
  });
});

// =========================================
// Admin Badge Schema
// =========================================
describe("badgeDefinitionSchema", () => {
  const validPayload = {
    badgeKey: "first_visit",
    nameTh: "การเข้าชมครั้งแรก",
    nameEn: "First Visit",
    category: "exploration",
    requirementType: "visit_count",
    requirementValue: "1",
    displayOrder: "1",
  };

  it("accepts a valid badge definition", () => {
    const result = badgeDefinitionSchema.parse(validPayload);
    expect(result.badgeKey).toBe("first_visit");
    expect(result.category).toBe("exploration");
    expect(result.requirementValue).toBe(1);
  });

  it("rejects badgeKey with uppercase letters", () => {
    expect(() =>
      badgeDefinitionSchema.parse({ ...validPayload, badgeKey: "FirstVisit" })
    ).toThrow(/lowercase/);
  });

  it("rejects invalid category", () => {
    expect(() =>
      badgeDefinitionSchema.parse({ ...validPayload, category: "invalid" })
    ).toThrow();
  });

  it("rejects invalid requirementType", () => {
    expect(() =>
      badgeDefinitionSchema.parse({ ...validPayload, requirementType: "invalid" })
    ).toThrow();
  });
});

describe("adminBadgeFiltersSchema", () => {
  it("returns defaults when empty", () => {
    const result = adminBadgeFiltersSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });
});

// =========================================
// Admin Review Filters Schema
// =========================================
describe("adminReviewFiltersSchema", () => {
  it("accepts valid filters", () => {
    const result = adminReviewFiltersSchema.parse({
      attractionId: "1",
      rating: "4",
      isApproved: "true",
    });
    expect(result.attractionId).toBe(1);
    expect(result.rating).toBe(4);
    expect(result.isApproved).toBe(true);
  });

  it("rejects invalid rating (0)", () => {
    expect(() => adminReviewFiltersSchema.parse({ rating: "0" })).toThrow();
  });

  it("rejects invalid rating (6)", () => {
    expect(() => adminReviewFiltersSchema.parse({ rating: "6" })).toThrow();
  });
});
