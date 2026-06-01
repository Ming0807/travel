import { describe, expect, it } from "vitest";
import { minimalProfileFormSchema } from "@/lib/validation/tourist-profile";
import { resolveCheckinCodeSchema } from "@/lib/validation/checkin";
import { postCertificateSurveySchema } from "@/lib/validation/survey";
import { passportVisitIdSchema } from "@/lib/validation/passport";
import { adminMediaMutationSchema, adminMediaFiltersSchema, adminMediaEntityTypeSchema, adminMediaLifecycleStatusSchema } from "@/lib/validation/media";
import { uuidSchema, localeSchema, checkinCodeSchema, displayNameSchema } from "@/lib/validation/common";
import { adminPhotoSpotMutationSchema, adminPhotoSpotFiltersSchema, adminPhotoSpotIdSchema } from "@/lib/validation/photo-spot";
import { adminAttractionMutationSchema, adminAttractionFiltersSchema, adminAttractionIdSchema } from "@/lib/validation/admin-attraction";
import { adminRestaurantMutationSchema, adminRestaurantFiltersSchema } from "@/lib/validation/admin-restaurant";
import { adminRouteMutationSchema, adminRouteFiltersSchema, adminRouteStopMutationSchema, adminRouteStopsBatchSchema } from "@/lib/validation/route";
import { adminStoryMutationSchema, adminStoryFiltersSchema, adminStoryIdSchema } from "@/lib/validation/story";
import { adminCheckinCodeMutationSchema, adminCheckinCodeFiltersSchema, adminCheckinCodeIdSchema } from "@/lib/validation/checkin-code";

// =========================================
// Common Schemas
// =========================================
describe("common validation schemas", () => {
  describe("uuidSchema", () => {
    it("accepts a valid UUID", () => {
      expect(uuidSchema.parse("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("rejects invalid UUID", () => {
      expect(() => uuidSchema.parse("not-a-uuid")).toThrow();
    });

    it("rejects empty string as UUID", () => {
      expect(() => uuidSchema.parse("")).toThrow();
    });
  });

  describe("localeSchema", () => {
    it("defaults to th", () => {
      expect(localeSchema.parse(undefined)).toBe("th");
    });

    it("accepts th", () => {
      expect(localeSchema.parse("th")).toBe("th");
    });

    it("accepts en", () => {
      expect(localeSchema.parse("en")).toBe("en");
    });

    it("rejects invalid locale", () => {
      expect(() => localeSchema.parse("fr")).toThrow();
    });
  });

  describe("checkinCodeSchema", () => {
    it("accepts valid URL-safe code", () => {
      expect(checkinCodeSchema.parse("yala-beach-2026")).toBe("yala-beach-2026");
    });

    it("accepts alphanumeric with underscore", () => {
      expect(checkinCodeSchema.parse("test_code_01")).toBe("test_code_01");
    });

    it("rejects code with spaces", () => {
      expect(() => checkinCodeSchema.parse("invalid code")).toThrow();
    });

    it("rejects code with special characters", () => {
      expect(() => checkinCodeSchema.parse("code@#$")).toThrow();
    });

    it("trims whitespace", () => {
      expect(checkinCodeSchema.parse("  my-code  ")).toBe("my-code");
    });

    it("rejects code shorter than 3 chars", () => {
      expect(() => checkinCodeSchema.parse("ab")).toThrow();
    });

    it("rejects code longer than 64 chars", () => {
      expect(() => checkinCodeSchema.parse("a".repeat(65))).toThrow();
    });
  });

  describe("displayNameSchema", () => {
    it("accepts valid name", () => {
      expect(displayNameSchema.parse("สมชาย")).toBe("สมชาย");
    });

    it("trims whitespace from name", () => {
      expect(displayNameSchema.parse("  John  ")).toBe("John");
    });

    it("rejects empty name", () => {
      expect(() => displayNameSchema.parse("")).toThrow();
    });

    it("rejects overly long name", () => {
      expect(() => displayNameSchema.parse("a".repeat(151))).toThrow();
    });
  });
});

// =========================================
// Tourist Profile Schema
// =========================================
describe("tourist profile validation", () => {
  it("accepts minimal valid profile with country", () => {
    const result = minimalProfileFormSchema.parse({
      displayName: "สมชาย",
      ageGroup: "25_34",
      originCountryId: 1,
      hasConsented: true,
    });
    expect(result.displayName).toBe("สมชาย");
    expect(result.ageGroup).toBe("25_34");
  });

  it("accepts profile with province instead of country", () => {
    const result = minimalProfileFormSchema.parse({
      displayName: "สมหญิง",
      ageGroup: "35_44",
      originProvinceId: 10,
      hasConsented: true,
    });
    expect(result.originProvinceId).toBe(10);
  });

  it("accepts profile with both country and province", () => {
    const result = minimalProfileFormSchema.parse({
      displayName: "John",
      ageGroup: "18_24",
      originCountryId: 2,
      originProvinceId: 5,
      hasConsented: true,
    });
    expect(result.originCountryId).toBe(2);
    expect(result.originProvinceId).toBe(5);
  });

  it("rejects empty display name", () => {
    expect(() =>
      minimalProfileFormSchema.parse({
        displayName: "",
        ageGroup: "25_34",
        originCountryId: 1,
        hasConsented: true,
      })
    ).toThrow();
  });

  it("rejects missing consent", () => {
    expect(() =>
      minimalProfileFormSchema.parse({
        displayName: "สมชาย",
        ageGroup: "25_34",
        originCountryId: 1,
        hasConsented: false,
      })
    ).toThrow();
  });

  it("rejects missing both country and province", () => {
    expect(() =>
      minimalProfileFormSchema.parse({
        displayName: "สมชาย",
        ageGroup: "25_34",
        hasConsented: true,
      })
    ).toThrow();
  });

  it("accepts 'prefer not to answer' age group", () => {
    const result = minimalProfileFormSchema.parse({
      displayName: "สมชาย",
      ageGroup: "prefer_not_to_answer",
      originCountryId: 1,
      hasConsented: true,
    });
    expect(result.ageGroup).toBe("prefer_not_to_answer");
  });

  it("rejects invalid age group value", () => {
    expect(() =>
      minimalProfileFormSchema.parse({
        displayName: "สมชาย",
        ageGroup: "invalid_age",
        originCountryId: 1,
        hasConsented: true,
      })
    ).toThrow();
  });
});

// =========================================
// Check-in Schema
// =========================================
describe("check-in code resolution validation", () => {
  it("accepts valid check-in code", () => {
    const result = resolveCheckinCodeSchema.parse({ code: "abc123" });
    expect(result.code).toBe("abc123");
  });

  it("rejects empty code", () => {
    expect(() => resolveCheckinCodeSchema.parse({ code: "" })).toThrow();
  });

  it("rejects code that is too long", () => {
    expect(() => resolveCheckinCodeSchema.parse({ code: "x".repeat(101) })).toThrow();
  });
});

// =========================================
// Survey Schema
// =========================================
describe("survey validation", () => {
  const validVisitId = "550e8400-e29b-41d4-a716-446655440000";

  it("accepts a complete valid survey", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      travelCompanionId: 1,
      groupSize: 2,
      transportModeId: 3,
      travelPurposeId: 5,
      overnightStatus: "same_day",
      spendingRangeId: 2,
      expenseCategoryId: 4,
      overallSatisfaction: 4,
      safetyScore: 5,
      cleanlinessScore: 3,
      accessibilityScore: 4,
      informationScore: 3,
      valueScore: 4,
      revisitIntention: "yes",
      recommendIntention: "yes",
      optionalComment: "",
    });
    expect(result.visitId).toBe(validVisitId);
    expect(result.overallSatisfaction).toBe(4);
    expect(result.safetyScore).toBe(5);
  });

  it("accepts survey with only satisfaction scores (minimal)", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overallSatisfaction: 5,
    });
    expect(result.overallSatisfaction).toBe(5);
  });

  it("accepts survey with only travel companion", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      travelCompanionId: 2,
    });
    expect(result.travelCompanionId).toBe(2);
  });

  it("accepts survey with only comment", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      optionalComment: "Great place!",
    });
    expect(result.optionalComment).toBe("Great place!");
  });

  it("rejects empty survey (no fields filled)", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
      })
    ).toThrow("กรุณาตอบอย่างน้อยหนึ่งข้อ");
  });

  it("rejects survey with invalid satisfaction score (0)", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
        overallSatisfaction: 0,
      })
    ).toThrow();
  });

  it("rejects survey with invalid satisfaction score (6)", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
        overallSatisfaction: 6,
      })
    ).toThrow();
  });

  it("rejects survey with too long comment", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
        optionalComment: "x".repeat(1001),
      })
    ).toThrow();
  });

  it("sets nightsCount to 0 when overnightStatus is same_day", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "same_day",
      nightsCount: 3,
    });
    // Transform: same_day overrides nightsCount to 0
    expect(result.nightsCount).toBe(0);
  });

  it("accepts overnight with valid nightsCount", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "overnight",
      nightsCount: 2,
    });
    expect(result.nightsCount).toBe(2);
  });

  it("rejects negative group size", () => {
    expect(() =>
      postCertificateSurveySchema.parse({
        visitId: validVisitId,
        groupSize: -1,
      })
    ).toThrow();
  });

  it("accepts all optional intention values", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      revisitIntention: "maybe",
      recommendIntention: "no",
    });
    expect(result.revisitIntention).toBe("maybe");
    expect(result.recommendIntention).toBe("no");
  });

  it("accepts overnight status 'unknown'", () => {
    const result = postCertificateSurveySchema.parse({
      visitId: validVisitId,
      overnightStatus: "unknown",
    });
    expect(result.overnightStatus).toBe("unknown");
  });
});

// =========================================
// Passport Schema
// =========================================
describe("passport validation", () => {
  it("accepts a valid UUID visit ID", () => {
    expect(passportVisitIdSchema.parse("550e8400-e29b-41d4-a716-446655440000")).toBe("550e8400-e29b-41d4-a716-446655440000");
  });

  it("rejects invalid visit ID", () => {
    expect(() => passportVisitIdSchema.parse("not-a-valid-id")).toThrow();
  });
});

// =========================================
// Admin Media Schema
// =========================================
describe("admin media validation", () => {
  it("accepts camelCase form payload", () => {
    const result = adminMediaMutationSchema.parse({
      entityId: "10",
      entityType: "attraction",
      mediaType: "image",
      storagePath: "content-media/attraction/2026/05/10/example.webp",
      altTextTh: "ภาพสถานที่",
      displayOrder: "",
      isCover: "on",
      isActive: "on",
    });

    expect(result.mediaType).toBe("image");
    expect(result.storagePath).toContain("content-media");
    expect(result.displayOrder).toBeUndefined();
    expect(result.isCover).toBe(true);
  });

  it("accepts legacy snake_case form payload", () => {
    const result = adminMediaMutationSchema.parse({
      entity_id: "10",
      entity_type: "story",
      media_type: "external_url",
      storage_path: "https://example.com/image.webp",
      is_cover: "false",
      is_active: "true",
    });

    expect(result.entityType).toBe("story");
    expect(result.mediaType).toBe("external_url");
    expect(result.isCover).toBe(false);
    expect(result.isActive).toBe(true);
  });

  it("accepts accommodation as a content media owner", () => {
    const result = adminMediaMutationSchema.parse({
      entityId: "12",
      entityType: "accommodation",
      mediaType: "image",
      storagePath: "content-media/accommodation/2026/05/12/example.webp",
      isCover: "true",
      isActive: "true",
    });

    expect(result.entityType).toBe("accommodation");
    expect(result.entityId).toBe(12);
  });

  it("rejects missing storage path with a useful field error", () => {
    const result = adminMediaMutationSchema.safeParse({
      entityId: "10",
      entityType: "attraction",
      mediaType: "image",
      isCover: "false",
      isActive: "true",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.storagePath?.[0]).toContain("Upload a file or add a URL");
    }
  });

  it("rejects unsupported media entity type", () => {
    const result = adminMediaMutationSchema.safeParse({
      entityId: "10",
      entityType: "user",
      mediaType: "image",
      storagePath: "content-media/user/10/example.webp",
      isCover: "false",
      isActive: "true",
    });
    expect(result.success).toBe(false);
  });

  it("accepts all valid media types", () => {
    for (const mediaType of ["image", "panorama", "video360", "embed", "external_url"]) {
      const result = adminMediaMutationSchema.safeParse({
        entityId: "10",
        entityType: "attraction",
        mediaType,
        storagePath: mediaType === "external_url" ? "https://example.com/video" : "content-media/attraction/2026/05/10/example.webp",
        isCover: "false",
        isActive: "true",
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects unsupported media type", () => {
    const result = adminMediaMutationSchema.safeParse({
      entityId: "10",
      entityType: "attraction",
      mediaType: "pdf",
      storagePath: "content-media/attraction/2026/05/10/example.pdf",
      isCover: "false",
      isActive: "true",
    });
    expect(result.success).toBe(false);
  });

  it("defaults lifecycleStatus to active", () => {
    const result = adminMediaMutationSchema.parse({
      entityId: "10",
      entityType: "attraction",
      mediaType: "image",
      storagePath: "content-media/attraction/2026/05/10/example.webp",
      isCover: "false",
      isActive: "true",
    });
    expect(result.lifecycleStatus).toBe("active");
  });

  it("accepts archive lifecycle status", () => {
    const result = adminMediaMutationSchema.parse({
      entityId: "10",
      entityType: "attraction",
      mediaType: "image",
      storagePath: "content-media/attraction/2026/05/10/example.webp",
      lifecycleStatus: "archived",
      isCover: "false",
      isActive: "true",
    });
    expect(result.lifecycleStatus).toBe("archived");
  });

  it("rejects invalid lifecycle status", () => {
    const result = adminMediaMutationSchema.safeParse({
      entityId: "10",
      entityType: "attraction",
      mediaType: "image",
      storagePath: "content-media/attraction/2026/05/10/example.webp",
      lifecycleStatus: "deleted",
      isCover: "false",
      isActive: "true",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL format for sourceUrl", () => {
    const result = adminMediaMutationSchema.safeParse({
      entityId: "10",
      entityType: "attraction",
      mediaType: "image",
      storagePath: "content-media/attraction/2026/05/10/example.webp",
      sourceUrl: "not-a-valid-url",
      isCover: "false",
      isActive: "true",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.sourceUrl?.[0]).toContain("valid URL");
    }
  });
});

describe("admin media entity type schema", () => {
  it("accepts valid entity types", () => {
    for (const entityType of ["attraction", "restaurant", "accommodation", "story", "route"]) {
      expect(adminMediaEntityTypeSchema.parse(entityType)).toBe(entityType);
    }
  });

  it("rejects invalid entity type", () => {
    expect(() => adminMediaEntityTypeSchema.parse("user")).toThrow();
  });
});

describe("admin media lifecycle status schema", () => {
  it("accepts valid statuses", () => {
    for (const status of ["draft", "active", "archived"]) {
      expect(adminMediaLifecycleStatusSchema.parse(status)).toBe(status);
    }
  });

  it("rejects invalid status", () => {
    expect(() => adminMediaLifecycleStatusSchema.parse("deleted")).toThrow();
  });
});

describe("admin media filters schema", () => {
  it("applies defaults for empty filters", () => {
    const result = adminMediaFiltersSchema.parse({});
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("accepts entityType filter", () => {
    const result = adminMediaFiltersSchema.parse({ entityType: "attraction" });
    expect(result.entityType).toBe("attraction");
  });

  it("rejects invalid entityType filter", () => {
    const result = adminMediaFiltersSchema.safeParse({ entityType: "bogus" });
    expect(result.success).toBe(false);
  });

  it("accepts lifecycleStatus filter", () => {
    const result = adminMediaFiltersSchema.parse({ lifecycleStatus: "archived" });
    expect(result.lifecycleStatus).toBe("archived");
  });

  it("rejects invalid lifecycleStatus filter", () => {
    const result = adminMediaFiltersSchema.safeParse({ lifecycleStatus: "bogus" });
    expect(result.success).toBe(false);
  });
});

// =========================================
// Admin Photo Spot Schema
// =========================================
describe("admin photo spot validation", () => {
  describe("adminPhotoSpotMutationSchema", () => {
    const validPayload = {
      attractionId: "1",
      spotNameTh: "จุดถ่ายภาพชายหาด",
      isActive: "true",
    };

    it("accepts minimal valid payload", () => {
      const result = adminPhotoSpotMutationSchema.parse(validPayload);
      expect(result.attractionId).toBe(1);
      expect(result.spotNameTh).toBe("จุดถ่ายภาพชายหาด");
      expect(result.isActive).toBe(true);
    });

    it("accepts full payload with coordinates", () => {
      const result = adminPhotoSpotMutationSchema.parse({
        ...validPayload,
        spotNameEn: "Beach Photo Spot",
        descriptionTh: "จุดถ่ายภาพที่สวยงาม",
        descriptionEn: "Beautiful photo spot",
        sampleImagePath: "https://example.com/sample.jpg",
        latitude: "6.5",
        longitude: "101.2",
        displayOrder: "1",
      });
      expect(result.latitude).toBe(6.5);
      expect(result.longitude).toBe(101.2);
      expect(result.displayOrder).toBe(1);
    });

    it("rejects missing attractionId", () => {
      const { attractionId: _, ...noAttraction } = validPayload;
      expect(() => adminPhotoSpotMutationSchema.parse(noAttraction)).toThrow();
    });

    it("rejects empty spotNameTh", () => {
      expect(() =>
        adminPhotoSpotMutationSchema.parse({ ...validPayload, spotNameTh: "" })
      ).toThrow("Thai photo spot name is required.");
    });

    it("rejects invalid latitude", () => {
      expect(() =>
        adminPhotoSpotMutationSchema.parse({ ...validPayload, latitude: "100" })
      ).toThrow();
    });

    it("rejects invalid longitude", () => {
      expect(() =>
        adminPhotoSpotMutationSchema.parse({ ...validPayload, longitude: "200" })
      ).toThrow();
    });

    it("rejects negative displayOrder", () => {
      expect(() =>
        adminPhotoSpotMutationSchema.parse({ ...validPayload, displayOrder: "-1" })
      ).toThrow();
    });

    it("converts empty displayOrder to null", () => {
      const result = adminPhotoSpotMutationSchema.parse({ ...validPayload, displayOrder: "" });
      expect(result.displayOrder).toBeNull();
    });
  });

  describe("adminPhotoSpotIdSchema", () => {
    it("accepts valid photo spot ID", () => {
      expect(adminPhotoSpotIdSchema.parse({ photoSpotId: "5" }).photoSpotId).toBe(5);
    });

    it("rejects zero photo spot ID", () => {
      expect(() => adminPhotoSpotIdSchema.parse({ photoSpotId: "0" })).toThrow();
    });

    it("rejects negative photo spot ID", () => {
      expect(() => adminPhotoSpotIdSchema.parse({ photoSpotId: "-1" })).toThrow();
    });
  });

  describe("adminPhotoSpotFiltersSchema", () => {
    it("applies defaults for empty filters", () => {
      const result = adminPhotoSpotFiltersSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it("accepts attractionId filter", () => {
      const result = adminPhotoSpotFiltersSchema.parse({ attractionId: "3" });
      expect(result.attractionId).toBe(3);
    });

    it("accepts isActive boolean filter", () => {
      const result = adminPhotoSpotFiltersSchema.parse({ isActive: "true" });
      expect(result.isActive).toBe(true);
    });
  });
});

// =========================================
// Admin Attraction Schema
// =========================================
describe("admin attraction validation", () => {
  describe("adminAttractionMutationSchema", () => {
    const validPayload = {
      provinceId: "1",
      slug: "yala-beach",
      nameTh: "หาดยะลา",
      isPublished: "true",
      isActive: "true",
    };

    it("accepts minimal valid payload", () => {
      const result = adminAttractionMutationSchema.parse(validPayload);
      expect(result.provinceId).toBe(1);
      expect(result.slug).toBe("yala-beach");
      expect(result.nameTh).toBe("หาดยะลา");
    });

    it("accepts full payload with all optional fields", () => {
      const result = adminAttractionMutationSchema.parse({
        ...validPayload,
        nameEn: "Yala Beach",
        shortDescriptionTh: "ชายหาดที่สวยงาม",
        descriptionTh: "รายละเอียดยาว",
        historyTh: "ประวัติ",
        latitude: "6.5",
        longitude: "101.2",
        addressText: "123 ถนนสายหนึ่ง",
        openingHours: "08:00-18:00",
        contactInfo: "089-xxx-xxxx",
        sustainabilityCategory: "eco",
        estimatedCapacityPerDay: "500",
      });
      expect(result.nameEn).toBe("Yala Beach");
      expect(result.latitude).toBe(6.5);
      expect(result.longitude).toBe(101.2);
      expect(result.estimatedCapacityPerDay).toBe(500);
    });

    it("rejects invalid slug format", () => {
      expect(() =>
        adminAttractionMutationSchema.parse({ ...validPayload, slug: "Invalid Slug!" })
      ).toThrow("Slug must be lowercase, URL-safe, and hyphen-separated.");
    });

    it("rejects uppercase slug", () => {
      expect(() =>
        adminAttractionMutationSchema.parse({ ...validPayload, slug: "Yala-Beach" })
      ).toThrow();
    });

    it("rejects slug with spaces", () => {
      expect(() =>
        adminAttractionMutationSchema.parse({ ...validPayload, slug: "yala beach" })
      ).toThrow();
    });

    it("rejects empty nameTh", () => {
      expect(() =>
        adminAttractionMutationSchema.parse({ ...validPayload, nameTh: "" })
      ).toThrow("Thai attraction name is required.");
    });

    it("rejects missing provinceId", () => {
      const { provinceId: _, ...noProvince } = validPayload;
      expect(() => adminAttractionMutationSchema.parse(noProvince)).toThrow();
    });

    it("rejects invalid latitude range", () => {
      expect(() =>
        adminAttractionMutationSchema.parse({ ...validPayload, latitude: "91" })
      ).toThrow();
    });

    it("converts empty optional fields to null", () => {
      const result = adminAttractionMutationSchema.parse({
        ...validPayload,
        nameEn: "",
        addressText: "",
      });
      expect(result.nameEn).toBeNull();
      expect(result.addressText).toBeNull();
    });

    it("rejects negative estimated capacity", () => {
      expect(() =>
        adminAttractionMutationSchema.parse({ ...validPayload, estimatedCapacityPerDay: "-1" })
      ).toThrow();
    });

    it("rejects overly large capacity", () => {
      expect(() =>
        adminAttractionMutationSchema.parse({ ...validPayload, estimatedCapacityPerDay: "9999999" })
      ).toThrow();
    });
  });

  describe("adminAttractionFiltersSchema", () => {
    it("applies defaults for empty filters", () => {
      const result = adminAttractionFiltersSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it("accepts search query", () => {
      const result = adminAttractionFiltersSchema.parse({ search: "หาด" });
      expect(result.search).toBe("หาด");
    });

    it("accepts province and district filters", () => {
      const result = adminAttractionFiltersSchema.parse({
        provinceId: "2",
        districtId: "5",
        attractionTypeId: "3",
      });
      expect(result.provinceId).toBe(2);
      expect(result.districtId).toBe(5);
      expect(result.attractionTypeId).toBe(3);
    });

    it("trims search whitespace", () => {
      const result = adminAttractionFiltersSchema.parse({ search: "  หาด  " });
      expect(result.search).toBe("หาด");
    });
  });

  describe("adminAttractionIdSchema", () => {
    it("accepts valid attraction ID", () => {
      expect(adminAttractionIdSchema.parse({ attractionId: "1" }).attractionId).toBe(1);
    });

    it("rejects zero ID", () => {
      expect(() => adminAttractionIdSchema.parse({ attractionId: "0" })).toThrow();
    });
  });
});

// =========================================
// Admin Restaurant Schema
// =========================================
describe("admin restaurant validation", () => {
  describe("adminRestaurantMutationSchema", () => {
    const validPayload = {
      provinceId: "1",
      slug: "krua-thai",
      nameTh: "ครัวไทย",
      isPublished: "true",
      isActive: "true",
    };

    it("accepts minimal valid payload", () => {
      const result = adminRestaurantMutationSchema.parse(validPayload);
      expect(result.provinceId).toBe(1);
      expect(result.slug).toBe("krua-thai");
      expect(result.nameTh).toBe("ครัวไทย");
    });

    it("accepts full payload with all optional fields", () => {
      const result = adminRestaurantMutationSchema.parse({
        ...validPayload,
        nameEn: "Thai Kitchen",
        descriptionTh: "ร้านอาหารไทยแท้",
        foodType: "seafood",
        latitude: "6.5",
        longitude: "101.2",
        addressText: "456 ถนนอาหาร",
        openingHours: "10:00-22:00",
        contactInfo: "099-xxx-xxxx",
        coverMediaId: "1",
      });
      expect(result.foodType).toBe("seafood");
      expect(result.coverMediaId).toBe(1);
    });

    it("rejects invalid restaurant slug", () => {
      expect(() =>
        adminRestaurantMutationSchema.parse({ ...validPayload, slug: "Bad Slug!" })
      ).toThrow();
    });

    it("rejects empty nameTh", () => {
      expect(() =>
        adminRestaurantMutationSchema.parse({ ...validPayload, nameTh: "" })
      ).toThrow("Thai restaurant name is required.");
    });

    it("converts empty optional short text to null", () => {
      const result = adminRestaurantMutationSchema.parse({
        ...validPayload,
        nameEn: "",
        descriptionTh: "",
      });
      expect(result.nameEn).toBeNull();
      expect(result.descriptionTh).toBeNull();
    });
  });

  describe("adminRestaurantFiltersSchema", () => {
    it("applies defaults for empty filters", () => {
      const result = adminRestaurantFiltersSchema.parse({});
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(20);
    });

    it("accepts foodType filter", () => {
      const result = adminRestaurantFiltersSchema.parse({ foodType: "seafood" });
      expect(result.foodType).toBe("seafood");
    });

    it("accepts isPublished filter", () => {
      const result = adminRestaurantFiltersSchema.parse({ isPublished: "true" });
      expect(result.isPublished).toBe(true);
    });
  });
});

// =========================================
// Admin Route Schema
// =========================================
describe("admin route validation", () => {
  describe("adminRouteMutationSchema", () => {
    const validPayload = {
      nameTh: "เส้นทางท่องเที่ยวยะลา",
      slug: "yala-tour-route",
      isPublished: "true",
      isActive: "true",
    };

    it("accepts minimal valid payload", () => {
      const result = adminRouteMutationSchema.parse(validPayload);
      expect(result.nameTh).toBe("เส้นทางท่องเที่ยวยะลา");
      expect(result.slug).toBe("yala-tour-route");
    });

    it("accepts payload with all optional fields", () => {
      const result = adminRouteMutationSchema.parse({
        ...validPayload,
        nameEn: "Yala Tour Route",
        descriptionTh: "เส้นทางแนะนำ",
        coverMediaId: "5",
      });
      expect(result.nameEn).toBe("Yala Tour Route");
      expect(result.coverMediaId).toBe(5);
    });

    it("rejects invalid route slug", () => {
      expect(() =>
        adminRouteMutationSchema.parse({ ...validPayload, slug: "bad slug" })
      ).toThrow();
    });

    it("rejects empty nameTh", () => {
      expect(() =>
        adminRouteMutationSchema.parse({ ...validPayload, nameTh: "" })
      ).toThrow("Thai name is required.");
    });

    it("rejects slug shorter than 3 chars", () => {
      expect(() =>
        adminRouteMutationSchema.parse({ ...validPayload, slug: "ab" })
      ).toThrow();
    });
  });

  describe("adminRouteStopMutationSchema", () => {
    it("accepts valid stop with note", () => {
      const result = adminRouteStopMutationSchema.parse({
        attractionId: "1",
        dayNumber: "1",
        displayOrder: "1",
        stopNoteTh: "แวะชมชายหาด",
      });
      expect(result.attractionId).toBe(1);
      expect(result.dayNumber).toBe(1);
      expect(result.displayOrder).toBe(1);
    });

    it("rejects missing attractionId", () => {
      expect(() =>
        adminRouteStopMutationSchema.parse({
          dayNumber: "1",
          displayOrder: "1",
        })
      ).toThrow();
    });

    it("rejects zero dayNumber", () => {
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
    it("accepts batch of stops", () => {
      const result = adminRouteStopsBatchSchema.parse({
        routeId: "1",
        stops: [
          { attractionId: "1", dayNumber: "1", displayOrder: "1" },
          { attractionId: "2", dayNumber: "1", displayOrder: "2" },
          { attractionId: "3", dayNumber: "2", displayOrder: "1" },
        ],
      });
      expect(result.stops).toHaveLength(3);
    });

    it("accepts empty stops array", () => {
      const result = adminRouteStopsBatchSchema.safeParse({
        routeId: "1",
        stops: [],
      });
      expect(result.success).toBe(true);
      expect(result.data?.stops).toHaveLength(0);
    });

    it("rejects missing stops", () => {
      expect(() =>
        adminRouteStopsBatchSchema.parse({
          routeId: "1",
        })
      ).toThrow();
    });
  });

  describe("adminRouteFiltersSchema", () => {
    it("applies defaults", () => {
      const result = adminRouteFiltersSchema.parse({});
      expect(result.page).toBe(1);
    });

    it("accepts isPublished filter", () => {
      const result = adminRouteFiltersSchema.parse({ isPublished: "true" });
      expect(result.isPublished).toBe(true);
    });
  });
});

// =========================================
// Admin Story Schema
// =========================================
describe("admin story validation", () => {
  describe("adminStoryMutationSchema", () => {
    const validPayload = {
      title: "เรื่องราวของยะลา",
      slug: "story-of-yala",
      isPublished: "true",
    };

    it("accepts minimal valid payload", () => {
      const result = adminStoryMutationSchema.parse(validPayload);
      expect(result.title).toBe("เรื่องราวของยะลา");
      expect(result.slug).toBe("story-of-yala");
    });

    it("accepts payload with all optional fields", () => {
      const result = adminStoryMutationSchema.parse({
        ...validPayload,
        excerpt: "เรื่องราวสั้นๆ",
        content: "เนื้อหาเรื่องราวแบบยาว",
        provinceId: "1",
        category: "culture",
        coverMediaId: "3",
      });
      expect(result.provinceId).toBe(1);
      expect(result.category).toBe("culture");
      expect(result.coverMediaId).toBe(3);
    });

    it("rejects empty title", () => {
      expect(() =>
        adminStoryMutationSchema.parse({ ...validPayload, title: "" })
      ).toThrow("Title is required.");
    });

    it("rejects invalid story slug", () => {
      expect(() =>
        adminStoryMutationSchema.parse({ ...validPayload, slug: "MY Story!" })
      ).toThrow();
    });

    it("converts empty optional fields to null", () => {
      const result = adminStoryMutationSchema.parse({
        ...validPayload,
        excerpt: "",
        content: "",
        provinceId: "",
      });
      expect(result.excerpt).toBeNull();
      expect(result.content).toBeNull();
      expect(result.provinceId).toBeNull();
    });
  });

  describe("adminStoryIdSchema", () => {
    it("accepts valid story ID", () => {
      expect(adminStoryIdSchema.parse({ storyId: "3" }).storyId).toBe(3);
    });

    it("rejects zero story ID", () => {
      expect(() => adminStoryIdSchema.parse({ storyId: "0" })).toThrow();
    });
  });

  describe("adminStoryFiltersSchema", () => {
    it("applies defaults", () => {
      const result = adminStoryFiltersSchema.parse({});
      expect(result.page).toBe(1);
    });

    it("accepts provinceId filter", () => {
      const result = adminStoryFiltersSchema.parse({ provinceId: "2" });
      expect(result.provinceId).toBe(2);
    });
  });
});

// =========================================
// Admin Check-in Code Schema
// =========================================
describe("admin check-in code validation", () => {
  describe("adminCheckinCodeMutationSchema", () => {
    const validPayload = {
      code: "yala-beach-2026",
      attractionId: "1",
      isActive: "true",
    };

    it("accepts minimal valid payload", () => {
      const result = adminCheckinCodeMutationSchema.parse(validPayload);
      expect(result.code).toBe("yala-beach-2026");
      expect(result.attractionId).toBe(1);
    });

    it("accepts payload with photoSpot and schedule", () => {
      const result = adminCheckinCodeMutationSchema.parse({
        ...validPayload,
        photoSpotId: "2",
        label: "High season 2026",
        startsAt: "2026-06-01T00:00:00Z",
        endsAt: "2026-09-30T23:59:59Z",
      });
      expect(result.photoSpotId).toBe(2);
      expect(result.startsAt).toBeTruthy();
      expect(result.endsAt).toBeTruthy();
    });

    it("rejects invalid check-in code characters", () => {
      expect(() =>
        adminCheckinCodeMutationSchema.parse({ ...validPayload, code: "invalid code!" })
      ).toThrow("Check-in code must be URL-safe.");
    });

    it("rejects code shorter than 3 chars", () => {
      expect(() =>
        adminCheckinCodeMutationSchema.parse({ ...validPayload, code: "ab" })
      ).toThrow("Check-in code is required.");
    });

    it("rejects code over 100 chars", () => {
      expect(() =>
        adminCheckinCodeMutationSchema.parse({ ...validPayload, code: "x".repeat(101) })
      ).toThrow();
    });

    it("rejects startsAt after endsAt", () => {
      const result = adminCheckinCodeMutationSchema.safeParse({
        ...validPayload,
        startsAt: "2026-12-31T00:00:00Z",
        endsAt: "2026-01-01T00:00:00Z",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.endsAt?.[0]).toContain("Start date must be before end date.");
      }
    });

    it("accepts startsAt without endsAt", () => {
      const result = adminCheckinCodeMutationSchema.parse({
        ...validPayload,
        startsAt: "2026-06-01T00:00:00Z",
      });
      expect(result.startsAt).toBeTruthy();
      expect(result.endsAt).toBeNull();
    });

    it("accepts endsAt without startsAt", () => {
      const result = adminCheckinCodeMutationSchema.parse({
        ...validPayload,
        endsAt: "2026-12-31T00:00:00Z",
      });
      expect(result.endsAt).toBeTruthy();
      expect(result.startsAt).toBeNull();
    });

    it("trims code whitespace", () => {
      const result = adminCheckinCodeMutationSchema.parse({
        ...validPayload,
        code: "  my-code  ",
      });
      expect(result.code).toBe("my-code");
    });
  });

  describe("adminCheckinCodeFiltersSchema", () => {
    it("applies defaults", () => {
      const result = adminCheckinCodeFiltersSchema.parse({});
      expect(result.page).toBe(1);
    });

    it("accepts attractionId and photoSpotId filters", () => {
      const result = adminCheckinCodeFiltersSchema.parse({
        attractionId: "1",
        photoSpotId: "2",
      });
      expect(result.attractionId).toBe(1);
      expect(result.photoSpotId).toBe(2);
    });
  });

  describe("adminCheckinCodeIdSchema", () => {
    it("accepts valid check-in code ID", () => {
      expect(adminCheckinCodeIdSchema.parse({ checkinCodeId: "99" }).checkinCodeId).toBe(99);
    });

    it("rejects zero ID", () => {
      expect(() => adminCheckinCodeIdSchema.parse({ checkinCodeId: "0" })).toThrow();
    });
  });
});
