/**
 * Unit tests for content-entity export API routes.
 *
 * These tests verify the row mapping logic used by each export endpoint.
 * Since the routes use inline mapping functions within Next.js route handlers,
 * we test the mapping contract: given mock Supabase rows, the exported
 * flat CSV/XLSX rows have the correct field names, values, and no PII leaks.
 *
 * Routes tested:
 *   attractions, stories, routes, photo-spots, checkin-codes, media, badges,
 *   restaurants, audit
 */

import { describe, it, expect } from "vitest";
import { firstJoin, type SupabaseJoin } from "@/lib/utils/supabase-joins";

// ---------------------------------------------------------------------------
// Type helpers
// ---------------------------------------------------------------------------

function keysOf<T extends Record<string, unknown>>(obj: T): string[] {
  return Object.keys(obj);
}

type ExportRecord = Record<string, unknown>;

// ---------------------------------------------------------------------------
// Mock data factories
// ---------------------------------------------------------------------------

function mockAttractionRow(overrides: Record<string, unknown> = {}) {
  return {
    attraction_id: 1,
    name_th: "อุทยานแห่งชาติ",
    name_en: "National Park",
    slug: "national-park",
    provinces: { province_name_th: "ยะลา", province_name_en: "Yala" },
    districts: { district_name_th: "เมือง", district_name_en: "Mueang" },
    attraction_types: { type_name_th: "ธรรมชาติ", type_name_en: "Nature" },
    is_published: true,
    is_active: true,
    sustainability_category: "high",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-05-28T00:00:00Z",
    ...overrides,
  };
}

function mockStoryRow(overrides: Record<string, unknown> = {}) {
  return {
    story_id: 1,
    title: "A Wonderful Journey",
    slug: "wonderful-journey",
    excerpt: "A story about a wonderful journey...",
    category: "travel_story",
    provinces: { province_name_th: "ปัตตานี", province_name_en: "Pattani" },
    is_published: true,
    published_at: "2026-03-15T00:00:00Z",
    created_at: "2026-01-15T00:00:00Z",
    updated_at: "2026-03-15T00:00:00Z",
    ...overrides,
  };
}

function mockRouteRow(overrides: Record<string, unknown> = {}) {
  return {
    route_id: 1,
    name_th: "เส้นทางสายวัฒนธรรม",
    name_en: "Cultural Route",
    slug: "cultural-route",
    description_th: "เส้นทางที่พาคุณผ่านวัฒนธรรมท้องถิ่น",
    description_en: "A route through local culture",
    is_published: true,
    is_active: true,
    created_at: "2026-02-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

function mockPhotoSpotRow(overrides: Record<string, unknown> = {}) {
  return {
    photo_spot_id: 1,
    spot_name_th: "จุดชมวิวน้ำตก",
    spot_name_en: "Waterfall Viewpoint",
    description_th: "จุดชมวิวที่สวยงาม",
    description_en: "Beautiful viewpoint",
    attractions: { name_th: "อุทยานแห่งชาติ", name_en: "National Park" },
    latitude: 6.5414,
    longitude: 101.2813,
    display_order: 1,
    is_active: true,
    created_at: "2026-01-10T00:00:00Z",
    updated_at: "2026-04-20T00:00:00Z",
    ...overrides,
  };
}

function mockCheckinCodeRow(overrides: Record<string, unknown> = {}) {
  return {
    checkin_code_id: 1,
    code: "NP-WATERFALL-01",
    label: "Waterfall Entry",
    attractions: { name_th: "อุทยานแห่งชาติ", name_en: "National Park" },
    photo_spots: { spot_name_th: "จุดชมวิวน้ำตก" },
    is_active: true,
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2026-12-31T00:00:00Z",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

function mockMediaRow(overrides: Record<string, unknown> = {}) {
  return {
    media_id: 1,
    media_type: "image",
    storage_path: "/public/attractions/photo1.jpg",
    attraction_id: 1,
    restaurant_id: null,
    accommodation_id: null,
    story_id: null,
    route_id: null,
    alt_text_th: "ภาพอุทยานแห่งชาติ",
    alt_text_en: "National Park photo",
    caption_th: "ภาพถ่ายจากมุมสูง",
    caption_en: "Aerial view",
    is_cover: true,
    is_active: true,
    lifecycle_status: "active",
    display_order: 1,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

function mockBadgeRow(overrides: Record<string, unknown> = {}) {
  return {
    badge_id: 1,
    badge_key: "explorer_level_1",
    name_th: "นักสำรวจระดับ 1",
    name_en: "Explorer Level 1",
    description_th: "เยี่ยมชม 3 สถานที่",
    description_en: "Visit 3 attractions",
    category: "explorer",
    requirement_type: "visit_count",
    requirement_value: 3,
    icon_name: "compass",
    icon_color: "#FF6B35",
    display_order: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

function mockRestaurantRow(overrides: Record<string, unknown> = {}) {
  return {
    restaurant_id: 1,
    slug: "restaurant-1",
    name_th: "ร้านอาหารครัวคุณยาย",
    name_en: "Grandma's Kitchen",
    description_th: "ร้านอาหารไทยพื้นบ้าน",
    description_en: "Traditional Thai cuisine",
    food_type: "thai",
    provinces: { province_name_th: "ยะลา" },
    latitude: 6.5414,
    longitude: 101.2813,
    address_text: "123 ถนนสุขใจ ตำบลสะเตง",
    opening_hours: "08:00-20:00",
    contact_info: "012-345-6789",
    is_published: true,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-05-01T00:00:00Z",
    ...overrides,
  };
}

function mockAuditLogRow(overrides: Record<string, unknown> = {}) {
  return {
    log_id: "log-001",
    created_at: "2026-05-28T10:00:00Z",
    admin_users: { display_name: "Admin User", email: "admin@example.test" },
    action: "export.attractions.csv",
    entity_type: "attraction_export",
    entity_id: "1",
    new_data: null,
    old_data: null,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Row mapping functions (mirroring the inline logic from each route)
// ---------------------------------------------------------------------------

function mapAttractionRow(row: ExportRecord): Record<string, unknown> {
  const province = firstJoin(row.provinces as SupabaseJoin<ExportRecord>);
  const district = firstJoin(row.districts as SupabaseJoin<ExportRecord>);
  const type = firstJoin(row.attraction_types as SupabaseJoin<ExportRecord>);
  return {
    "ID": String(row.attraction_id),
    "Name (TH)": row.name_th || "",
    "Name (EN)": row.name_en || "",
    "Slug": row.slug || "",
    "Province (TH)": province?.province_name_th || "",
    "Province (EN)": province?.province_name_en || "",
    "District (TH)": district?.district_name_th || "",
    "District (EN)": district?.district_name_en || "",
    "Type (TH)": type?.type_name_th || "",
    "Type (EN)": type?.type_name_en || "",
    "Is Published": row.is_published ? "Yes" : "No",
    "Is Active": row.is_active ? "Yes" : "No",
    "Sustainability": row.sustainability_category || "",
    "Created At": row.created_at || "",
    "Updated At": row.updated_at || "",
  };
}

function mapStoryRow(row: ExportRecord): Record<string, unknown> {
  const province = firstJoin(row.provinces as SupabaseJoin<ExportRecord>);
  return {
    "ID": String(row.story_id),
    "Title": row.title || "",
    "Slug": row.slug || "",
    "Excerpt": row.excerpt || "",
    "Category": row.category || "",
    "Province (TH)": province?.province_name_th || "",
    "Province (EN)": province?.province_name_en || "",
    "Is Published": row.is_published ? "Yes" : "No",
    "Published At": row.published_at || "",
    "Created At": row.created_at || "",
    "Updated At": row.updated_at || "",
  };
}

function mapRouteRow(row: ExportRecord): Record<string, unknown> {
  return {
    "ID": String(row.route_id),
    "Name (TH)": row.name_th || "",
    "Name (EN)": row.name_en || "",
    "Slug": row.slug || "",
    "Description (TH)": row.description_th || "",
    "Description (EN)": row.description_en || "",
    "Is Published": row.is_published ? "Yes" : "No",
    "Is Active": row.is_active ? "Yes" : "No",
    "Created At": row.created_at || "",
    "Updated At": row.updated_at || "",
  };
}

function mapPhotoSpotRow(row: ExportRecord): Record<string, unknown> {
  const attraction = firstJoin(row.attractions as SupabaseJoin<ExportRecord>);
  return {
    "ID": String(row.photo_spot_id),
    "Name (TH)": row.spot_name_th || "",
    "Name (EN)": row.spot_name_en || "",
    "Description (TH)": row.description_th || "",
    "Description (EN)": row.description_en || "",
    "Attraction": attraction?.name_th || "",
    "Latitude": row.latitude !== null ? String(row.latitude) : "",
    "Longitude": row.longitude !== null ? String(row.longitude) : "",
    "Display Order": row.display_order !== null ? String(row.display_order) : "",
    "Is Active": row.is_active ? "Yes" : "No",
    "Created At": row.created_at || "",
    "Updated At": row.updated_at || "",
  };
}

function mapCheckinCodeRow(row: ExportRecord): Record<string, unknown> {
  const attraction = firstJoin(row.attractions as SupabaseJoin<ExportRecord>);
  const photoSpot = firstJoin(row.photo_spots as SupabaseJoin<ExportRecord>);
  return {
    "ID": String(row.checkin_code_id),
    "Code": row.code || "",
    "Label": row.label || "",
    "Attraction": attraction?.name_th || "",
    "Photo Spot": photoSpot?.spot_name_th || "",
    "Is Active": row.is_active ? "Yes" : "No",
    "Starts At": row.starts_at || "",
    "Ends At": row.ends_at || "",
    "Created At": row.created_at || "",
    "Updated At": row.updated_at || "",
  };
}

function mapMediaRow(row: ExportRecord): Record<string, unknown> {
  const entityTypeMap: Record<string, string> = {
    attraction_id: "attraction",
    restaurant_id: "restaurant",
    accommodation_id: "accommodation",
    story_id: "story",
    route_id: "route",
  };
  let entityType = "";
  let entityId = "";
  for (const [col, label] of Object.entries(entityTypeMap)) {
    if (row[col] !== null && row[col] !== undefined) {
      entityType = label;
      entityId = String(row[col]);
      break;
    }
  }
  return {
    "ID": String(row.media_id),
    "Media Type": row.media_type || "",
    "Storage Path": row.storage_path || "",
    "Entity Type": entityType,
    "Entity ID": entityId,
    "Alt Text (TH)": row.alt_text_th || "",
    "Alt Text (EN)": row.alt_text_en || "",
    "Caption (TH)": row.caption_th || "",
    "Caption (EN)": row.caption_en || "",
    "Is Cover": row.is_cover ? "Yes" : "No",
    "Is Active": row.is_active ? "Yes" : "No",
    "Lifecycle Status": row.lifecycle_status || "",
    "Display Order": row.display_order !== null ? String(row.display_order) : "",
    "Created At": row.created_at || "",
    "Updated At": row.updated_at || "",
  };
}

function mapBadgeRow(row: ExportRecord): Record<string, unknown> {
  return {
    "ID": String(row.badge_id),
    "Badge Key": row.badge_key || "",
    "Name (TH)": row.name_th || "",
    "Name (EN)": row.name_en || "",
    "Description (TH)": row.description_th || "",
    "Description (EN)": row.description_en || "",
    "Category": row.category || "",
    "Requirement Type": row.requirement_type || "",
    "Requirement Value": row.requirement_value !== null ? String(row.requirement_value) : "",
    "Icon Name": row.icon_name || "",
    "Icon Color": row.icon_color || "",
    "Display Order": String(row.display_order ?? 0),
    "Is Active": row.is_active ? "Yes" : "No",
    "Created At": row.created_at || "",
    "Updated At": row.updated_at || "",
  };
}

function mapRestaurantRow(row: ExportRecord): Record<string, unknown> {
  const province = firstJoin(row.provinces as SupabaseJoin<ExportRecord>);
  return {
    "ID": String(row.restaurant_id),
    "Slug": row.slug ?? "",
    "ชื่อภาษาไทย": row.name_th ?? "",
    "ชื่อภาษาอังกฤษ": row.name_en ?? "",
    "คำอธิบายภาษาไทย": row.description_th ?? "",
    "คำอธิบายภาษาอังกฤษ": row.description_en ?? "",
    "ประเภทอาหาร": row.food_type ?? "",
    "จังหวัด": province?.province_name_th ?? "",
    "ละติจูด": row.latitude !== null ? String(row.latitude) : "",
    "ลองจิจูด": row.longitude !== null ? String(row.longitude) : "",
    "ที่อยู่": row.address_text ?? "",
    "เวลาเปิด": row.opening_hours ?? "",
    "ช่องทางติดต่อ": row.contact_info ?? "",
    "สถานะ": row.is_published ? "Published" : "Draft",
    "Active": row.is_active ? "Yes" : "No",
    "สร้างเมื่อ": row.created_at ?? "",
    "อัปเดตล่าสุด": row.updated_at ?? "",
  };
}

function mapAuditLogRow(log: ExportRecord): Record<string, unknown> {
  const adminUser = firstJoin(log.admin_users as SupabaseJoin<ExportRecord>);
  const createdAt = log.created_at;
  const timestamp =
    createdAt instanceof Date || typeof createdAt === "string" || typeof createdAt === "number"
      ? new Date(createdAt).toISOString().replace("T", " ").slice(0, 19)
      : "";
  return {
    "Timestamp": timestamp,
    "Admin Name": adminUser?.display_name || "System",
    "Admin Email": adminUser?.email || "system@local",
    "Action": log.action,
    "Entity Type": log.entity_type,
    "Entity ID": log.entity_id || "",
  };
}

// ---------------------------------------------------------------------------
// Expected field counts
// ---------------------------------------------------------------------------

const EXPECTED_COLUMNS: Record<string, number> = {
  attractions: 15,
  stories: 11,
  routes: 10,
  "photo-spots": 12,
  "checkin-codes": 10,
  media: 15,
  badges: 15,
  restaurants: 17,
  audit: 6,
};

// ---------------------------------------------------------------------------
// Shared PII field patterns that should NEVER appear in export rows
// ---------------------------------------------------------------------------

const PII_FIELD_PATTERNS = [
  "tourist",
  "email",
  "phone",
  "national_id",
  "id_card",
  "passport",
  "guest_token",
  "device_token",
  "display_name",
  "full_name",
  "comments",
  "new_data",
  "old_data",
];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Attractions export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockAttractionRow();
    const mapped = mapAttractionRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS.attractions);
    expect(mapped["ID"]).toBe("1");
    expect(mapped["Name (TH)"]).toBe("อุทยานแห่งชาติ");
    expect(mapped["Slug"]).toBe("national-park");
    expect(mapped["Province (TH)"]).toBe("ยะลา");
    expect(mapped["Is Published"]).toBe("Yes");
    expect(mapped["Is Active"]).toBe("Yes");
    expect(mapped["Sustainability"]).toBe("high");
  });

  it("handles null joined relations", () => {
    const row = mockAttractionRow({ provinces: null, districts: null, attraction_types: null });
    const mapped = mapAttractionRow(row);
    expect(mapped["Province (TH)"]).toBe("");
    expect(mapped["District (TH)"]).toBe("");
    expect(mapped["Type (TH)"]).toBe("");
  });

  it("handles arrays of joined relations", () => {
    const row = mockAttractionRow({
      provinces: [{ province_name_th: "ยะลา", province_name_en: "Yala" }],
    });
    const mapped = mapAttractionRow(row);
    expect(mapped["Province (TH)"]).toBe("ยะลา");
  });

  it("renders boolean fields as Yes/No", () => {
    const draft = mockAttractionRow({ is_published: false, is_active: false });
    const mapped = mapAttractionRow(draft);
    expect(mapped["Is Published"]).toBe("No");
    expect(mapped["Is Active"]).toBe("No");
  });

  it("has no PII field patterns in column names", () => {
    const row = mockAttractionRow();
    const mapped = mapAttractionRow(row);
    const keys = keysOf(mapped).map((k) => k.toLowerCase());
    for (const pattern of PII_FIELD_PATTERNS) {
      const found = keys.filter((k) => k.includes(pattern));
      expect(found).toEqual([]);
    }
  });
});

describe("Stories export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockStoryRow();
    const mapped = mapStoryRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS.stories);
    expect(mapped["ID"]).toBe("1");
    expect(mapped["Title"]).toBe("A Wonderful Journey");
    expect(mapped["Category"]).toBe("travel_story");
    expect(mapped["Province (TH)"]).toBe("ปัตตานี");
    expect(mapped["Is Published"]).toBe("Yes");
  });

  it("handles null province relation", () => {
    const row = mockStoryRow({ provinces: null });
    const mapped = mapStoryRow(row);
    expect(mapped["Province (TH)"]).toBe("");
    expect(mapped["Province (EN)"]).toBe("");
  });

  it("handles unpublished story", () => {
    const row = mockStoryRow({ is_published: false });
    const mapped = mapStoryRow(row);
    expect(mapped["Is Published"]).toBe("No");
  });

  it("handles null excerpt", () => {
    const row = mockStoryRow({ excerpt: null });
    const mapped = mapStoryRow(row);
    expect(mapped["Excerpt"]).toBe("");
  });

  it("has no PII field patterns in column names", () => {
    const row = mockStoryRow();
    const mapped = mapStoryRow(row);
    const keys = keysOf(mapped).map((k) => k.toLowerCase());
    for (const pattern of PII_FIELD_PATTERNS) {
      const found = keys.filter((k) => k.includes(pattern));
      expect(found).toEqual([]);
    }
  });
});

describe("Routes export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockRouteRow();
    const mapped = mapRouteRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS.routes);
    expect(mapped["ID"]).toBe("1");
    expect(mapped["Name (TH)"]).toBe("เส้นทางสายวัฒนธรรม");
    expect(mapped["Slug"]).toBe("cultural-route");
    expect(mapped["Is Published"]).toBe("Yes");
  });

  it("handles null description", () => {
    const row = mockRouteRow({ description_th: null, description_en: null });
    const mapped = mapRouteRow(row);
    expect(mapped["Description (TH)"]).toBe("");
    expect(mapped["Description (EN)"]).toBe("");
  });

  it("handles inactive route", () => {
    const row = mockRouteRow({ is_active: false });
    const mapped = mapRouteRow(row);
    expect(mapped["Is Active"]).toBe("No");
  });

  it("has no PII field patterns in column names", () => {
    const row = mockRouteRow();
    const mapped = mapRouteRow(row);
    const keys = keysOf(mapped).map((k) => k.toLowerCase());
    for (const pattern of PII_FIELD_PATTERNS) {
      const found = keys.filter((k) => k.includes(pattern));
      expect(found).toEqual([]);
    }
  });
});

describe("Photo Spots export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockPhotoSpotRow();
    const mapped = mapPhotoSpotRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS["photo-spots"]);
    expect(mapped["ID"]).toBe("1");
    expect(mapped["Name (TH)"]).toBe("จุดชมวิวน้ำตก");
    expect(mapped["Attraction"]).toBe("อุทยานแห่งชาติ");
    expect(mapped["Latitude"]).toBe("6.5414");
    expect(mapped["Longitude"]).toBe("101.2813");
  });

  it("handles null coordinates", () => {
    const row = mockPhotoSpotRow({ latitude: null, longitude: null });
    const mapped = mapPhotoSpotRow(row);
    expect(mapped["Latitude"]).toBe("");
    expect(mapped["Longitude"]).toBe("");
  });

  it("handles null display order", () => {
    const row = mockPhotoSpotRow({ display_order: null });
    const mapped = mapPhotoSpotRow(row);
    expect(mapped["Display Order"]).toBe("");
  });

  it("handles null attraction relation", () => {
    const row = mockPhotoSpotRow({ attractions: null });
    const mapped = mapPhotoSpotRow(row);
    expect(mapped["Attraction"]).toBe("");
  });

  it("has no PII field patterns in column names", () => {
    const row = mockPhotoSpotRow();
    const mapped = mapPhotoSpotRow(row);
    const keys = keysOf(mapped).map((k) => k.toLowerCase());
    for (const pattern of PII_FIELD_PATTERNS) {
      const found = keys.filter((k) => k.includes(pattern));
      expect(found).toEqual([]);
    }
  });
});

describe("Check-in Codes export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockCheckinCodeRow();
    const mapped = mapCheckinCodeRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS["checkin-codes"]);
    expect(mapped["ID"]).toBe("1");
    expect(mapped["Code"]).toBe("NP-WATERFALL-01");
    expect(mapped["Attraction"]).toBe("อุทยานแห่งชาติ");
    expect(mapped["Photo Spot"]).toBe("จุดชมวิวน้ำตก");
    expect(mapped["Is Active"]).toBe("Yes");
  });

  it("handles null photo spot", () => {
    const row = mockCheckinCodeRow({ photo_spots: null });
    const mapped = mapCheckinCodeRow(row);
    expect(mapped["Photo Spot"]).toBe("");
  });

  it("handles null label", () => {
    const row = mockCheckinCodeRow({ label: null });
    const mapped = mapCheckinCodeRow(row);
    expect(mapped["Label"]).toBe("");
  });

  it("handles inactive code", () => {
    const row = mockCheckinCodeRow({ is_active: false });
    const mapped = mapCheckinCodeRow(row);
    expect(mapped["Is Active"]).toBe("No");
  });

  it("has no PII field patterns in column names", () => {
    const row = mockCheckinCodeRow();
    const mapped = mapCheckinCodeRow(row);
    const keys = keysOf(mapped).map((k) => k.toLowerCase());
    for (const pattern of PII_FIELD_PATTERNS) {
      const found = keys.filter((k) => k.includes(pattern));
      expect(found).toEqual([]);
    }
  });
});

describe("Media export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockMediaRow();
    const mapped = mapMediaRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS.media);
    expect(mapped["ID"]).toBe("1");
    expect(mapped["Media Type"]).toBe("image");
    expect(mapped["Entity Type"]).toBe("attraction");
    expect(mapped["Entity ID"]).toBe("1");
    expect(mapped["Alt Text (TH)"]).toBe("ภาพอุทยานแห่งชาติ");
    expect(mapped["Is Cover"]).toBe("Yes");
  });

  it("detects entity type from the correct FK column", () => {
    const restaurant = mockMediaRow({
      attraction_id: null,
      restaurant_id: 5,
      story_id: null,
    });
    const mapped = mapMediaRow(restaurant);
    expect(mapped["Entity Type"]).toBe("restaurant");
    expect(mapped["Entity ID"]).toBe("5");

    const accommodation = mockMediaRow({
      attraction_id: null,
      restaurant_id: null,
      accommodation_id: 3,
      story_id: null,
    });
    const mapped2 = mapMediaRow(accommodation);
    expect(mapped2["Entity Type"]).toBe("accommodation");
    expect(mapped2["Entity ID"]).toBe("3");
  });

  it("handles no entity FK set", () => {
    const row = mockMediaRow({
      attraction_id: null,
      restaurant_id: null,
      accommodation_id: null,
      story_id: null,
      route_id: null,
    });
    const mapped = mapMediaRow(row);
    expect(mapped["Entity Type"]).toBe("");
    expect(mapped["Entity ID"]).toBe("");
  });

  it("handles null alt text and caption", () => {
    const row = mockMediaRow({ alt_text_th: null, alt_text_en: null, caption_th: null });
    const mapped = mapMediaRow(row);
    expect(mapped["Alt Text (TH)"]).toBe("");
    expect(mapped["Alt Text (EN)"]).toBe("");
    expect(mapped["Caption (TH)"]).toBe("");
  });

  it("handles null display order", () => {
    const row = mockMediaRow({ display_order: null });
    const mapped = mapMediaRow(row);
    expect(mapped["Display Order"]).toBe("");
  });

  it("has no PII field patterns in column names", () => {
    const row = mockMediaRow();
    const mapped = mapMediaRow(row);
    const keys = keysOf(mapped).map((k) => k.toLowerCase());
    for (const pattern of PII_FIELD_PATTERNS) {
      const found = keys.filter((k) => k.includes(pattern));
      expect(found).toEqual([]);
    }
  });
});

describe("Badges export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockBadgeRow();
    const mapped = mapBadgeRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS.badges);
    expect(mapped["ID"]).toBe("1");
    expect(mapped["Badge Key"]).toBe("explorer_level_1");
    expect(mapped["Name (TH)"]).toBe("นักสำรวจระดับ 1");
    expect(mapped["Category"]).toBe("explorer");
    expect(mapped["Requirement Value"]).toBe("3");
    expect(mapped["Display Order"]).toBe("1");
  });

  it("handles null requirement value", () => {
    const row = mockBadgeRow({ requirement_value: null });
    const mapped = mapBadgeRow(row);
    expect(mapped["Requirement Value"]).toBe("");
  });

  it("handles null display order using default", () => {
    const row = mockBadgeRow({ display_order: undefined });
    const mapped = mapBadgeRow(row);
    expect(mapped["Display Order"]).toBe("0");
  });

  it("handles inactive badge", () => {
    const row = mockBadgeRow({ is_active: false });
    const mapped = mapBadgeRow(row);
    expect(mapped["Is Active"]).toBe("No");
  });

  it("has no PII field patterns in column names", () => {
    const row = mockBadgeRow();
    const mapped = mapBadgeRow(row);
    const keys = keysOf(mapped).map((k) => k.toLowerCase());
    for (const pattern of PII_FIELD_PATTERNS) {
      const found = keys.filter((k) => k.includes(pattern));
      expect(found).toEqual([]);
    }
  });
});

describe("Restaurants export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockRestaurantRow();
    const mapped = mapRestaurantRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS.restaurants);
    expect(mapped["ID"]).toBe("1");
    expect(mapped["ชื่อภาษาไทย"]).toBe("ร้านอาหารครัวคุณยาย");
    expect(mapped["ประเภทอาหาร"]).toBe("thai");
    expect(mapped["จังหวัด"]).toBe("ยะลา");
    expect(mapped["สถานะ"]).toBe("Published");
  });

  it("handles null province relation", () => {
    const row = mockRestaurantRow({ provinces: null });
    const mapped = mapRestaurantRow(row);
    expect(mapped["จังหวัด"]).toBe("");
  });

  it("handles null coordinates", () => {
    const row = mockRestaurantRow({ latitude: null, longitude: null });
    const mapped = mapRestaurantRow(row);
    expect(mapped["ละติจูด"]).toBe("");
    expect(mapped["ลองจิจูด"]).toBe("");
  });

  it("renders draft status correctly", () => {
    const row = mockRestaurantRow({ is_published: false });
    const mapped = mapRestaurantRow(row);
    expect(mapped["สถานะ"]).toBe("Draft");
  });

  it("handles null address and contact fields", () => {
    const row = mockRestaurantRow({
      address_text: null,
      opening_hours: null,
      contact_info: null,
    });
    const mapped = mapRestaurantRow(row);
    expect(mapped["ที่อยู่"]).toBe("");
    expect(mapped["เวลาเปิด"]).toBe("");
    expect(mapped["ช่องทางติดต่อ"]).toBe("");
  });

  it("has no PII field patterns in column names", () => {
    const row = mockRestaurantRow();
    const mapped = mapRestaurantRow(row);
    const keys = keysOf(mapped).map((k) => k.toLowerCase());
    for (const pattern of PII_FIELD_PATTERNS) {
      const found = keys.filter((k) => k.includes(pattern));
      expect(found).toEqual([]);
    }
  });
});

describe("Audit log export row mapper", () => {
  it("maps all expected fields from a full record", () => {
    const row = mockAuditLogRow();
    const mapped = mapAuditLogRow(row);
    expect(keysOf(mapped)).toHaveLength(EXPECTED_COLUMNS.audit);
    expect(mapped["Timestamp"]).toBe("2026-05-28 10:00:00");
    expect(mapped["Admin Name"]).toBe("Admin User");
    expect(mapped["Admin Email"]).toBe("admin@example.test");
    expect(mapped["Action"]).toBe("export.attractions.csv");
    expect(mapped["Entity Type"]).toBe("attraction_export");
  });

  it("handles system action without admin user", () => {
    const row = mockAuditLogRow({ admin_users: null });
    const mapped = mapAuditLogRow(row);
    expect(mapped["Admin Name"]).toBe("System");
    expect(mapped["Admin Email"]).toBe("system@local");
  });

  it("handles missing entity_id", () => {
    const row = mockAuditLogRow({ entity_id: null });
    const mapped = mapAuditLogRow(row);
    expect(mapped["Entity ID"]).toBe("");
  });

  it("handles null created_at", () => {
    const row = mockAuditLogRow({ created_at: null });
    const mapped = mapAuditLogRow(row);
    expect(mapped["Timestamp"]).toBe("");
  });
});

describe("Content-entity export consistency", () => {
  it("every entity produces the correct number of columns", () => {
    expect(keysOf(mapAttractionRow(mockAttractionRow()))).toHaveLength(EXPECTED_COLUMNS.attractions);
    expect(keysOf(mapStoryRow(mockStoryRow()))).toHaveLength(EXPECTED_COLUMNS.stories);
    expect(keysOf(mapRouteRow(mockRouteRow()))).toHaveLength(EXPECTED_COLUMNS.routes);
    expect(keysOf(mapPhotoSpotRow(mockPhotoSpotRow()))).toHaveLength(EXPECTED_COLUMNS["photo-spots"]);
    expect(keysOf(mapCheckinCodeRow(mockCheckinCodeRow()))).toHaveLength(EXPECTED_COLUMNS["checkin-codes"]);
    expect(keysOf(mapMediaRow(mockMediaRow()))).toHaveLength(EXPECTED_COLUMNS.media);
    expect(keysOf(mapBadgeRow(mockBadgeRow()))).toHaveLength(EXPECTED_COLUMNS.badges);
    expect(keysOf(mapRestaurantRow(mockRestaurantRow()))).toHaveLength(EXPECTED_COLUMNS.restaurants);
    expect(keysOf(mapAuditLogRow(mockAuditLogRow()))).toHaveLength(EXPECTED_COLUMNS.audit);
  });

  it("each entity has a unique ID column", () => {
    expect(mapAttractionRow(mockAttractionRow())["ID"]).toBe("1");
    expect(mapStoryRow(mockStoryRow())["ID"]).toBe("1");
    expect(mapRouteRow(mockRouteRow())["ID"]).toBe("1");
    expect(mapPhotoSpotRow(mockPhotoSpotRow())["ID"]).toBe("1");
    expect(mapCheckinCodeRow(mockCheckinCodeRow())["ID"]).toBe("1");
    expect(mapMediaRow(mockMediaRow())["ID"]).toBe("1");
    expect(mapBadgeRow(mockBadgeRow())["ID"]).toBe("1");
    expect(mapRestaurantRow(mockRestaurantRow())["ID"]).toBe("1");
    // Audit log export uses "Timestamp" as its primary column, not "ID"
    expect(keysOf(mapAuditLogRow(mockAuditLogRow()))).toContain("Timestamp");
  });

  it("empty data produces zero rows", () => {
    const emptyAttractions: ExportRecord[] = [];
    expect(emptyAttractions.map(mapAttractionRow)).toEqual([]);

    const emptyStories: ExportRecord[] = [];
    expect(emptyStories.map(mapStoryRow)).toEqual([]);

    const emptyRoutes: ExportRecord[] = [];
    expect(emptyRoutes.map(mapRouteRow)).toEqual([]);
  });

  it("multiple rows are processed correctly", () => {
    const attractions = [mockAttractionRow({ attraction_id: 1 }), mockAttractionRow({ attraction_id: 2 })];
    const mapped = attractions.map(mapAttractionRow);
    expect(mapped).toHaveLength(2);
    expect(mapped[0]["ID"]).toBe("1");
    expect(mapped[1]["ID"]).toBe("2");
  });
});
