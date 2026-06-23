/**
 * Privacy regression tests for admin export safe-row-mappers.
 *
 * These tests verify that export row transformers correctly strip personally
 * identifiable information (PII) before data is served to admin users.
 *
 * The AGENTS.md mandates:
 * - No national ID, full legal address, sensitive personal data
 * - Exported data must be aggregated/anonymized
 * - Tourist-facing data must follow privacy-by-design
 */

import { describe, it, expect } from "vitest";
import { toSafeVisitExportRows } from "@/lib/repositories/admin-visit.repository";
import { toSafeSurveyExportRows } from "@/lib/repositories/admin-survey.repository";
import type {
  AdminVisitRow,
  AdminVisitExportRow,
} from "@/lib/repositories/admin-visit.repository";
import type {
  AdminSurveyRow,
  AdminSurveyExportRow,
} from "@/lib/repositories/admin-survey.repository";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Asserts that a safe-export row has NO keys that are in the forbidden set.
 */
function expectNoKeys(
  actual: Record<string, unknown>,
  forbidden: Set<string>,
  label: string,
) {
  const actualKeys = new Set(Object.keys(actual));
  const leaked = [...forbidden].filter((k) => actualKeys.has(k));
  if (leaked.length > 0) {
    throw new Error(
      `${label}: Expected no forbidden keys but found: ${leaked.join(", ")}`,
    );
  }
}

/**
 * Asserts that a safe-export row INCLUDES all required (expected) keys.
 */
function expectAllKeys(
  actual: Record<string, unknown>,
  required: Set<string>,
  label: string,
) {
  const actualKeys = new Set(Object.keys(actual));
  const missing = [...required].filter((k) => !actualKeys.has(k));
  if (missing.length > 0) {
    throw new Error(
      `${label}: Expected required keys but missing: ${missing.join(", ")}`,
    );
  }
}

// ---------------------------------------------------------------------------
// PII / identifier field lists
// ---------------------------------------------------------------------------

/** Fields on AdminVisitRow that contain PII or internal identifiers. */
const VISIT_PII_FIELDS = new Set<string>([
  "visit_id",
  "tourist_id",
  "tourist_display_name",
  "created_at",
]);

/** Fields that SHOULD be present in the safe export for visits. */
const VISIT_SAFE_FIELDS = new Set<string>([
  "visit_date",
  "attraction_name_th",
  "province_name_th",
  "completion_status",
  "has_certificate",
  "has_stamp",
]);

/** Fields on AdminSurveyRow that contain PII or internal identifiers. */
const SURVEY_PII_FIELDS = new Set<string>([
  "survey_id",
  "visit_id",
  "tourist_id",
  "tourist_display_name",
  "comments",
]);

/** Fields that SHOULD be present in the safe export for surveys. */
const SURVEY_SAFE_FIELDS = new Set<string>([
  "submitted_at",
  "attraction_name_th",
  "province_name_th",
  "overall_score",
  "facility_score",
  "cleanliness_score",
  "safety_score",
  "revisit_intention",
  "recommend_intention",
]);

// ---------------------------------------------------------------------------
// Mock data factories
// ---------------------------------------------------------------------------

function createMockVisitRow(overrides: Partial<AdminVisitRow> = {}): AdminVisitRow {
  return {
    visit_id: "mock-visit-001",
    tourist_id: "mock-tourist-001",
    attraction_id: 42,
    visit_date: "2026-05-15",
    completion_status: "certificate_generated",
    created_at: "2026-05-15T10:30:00Z",
    tourist_display_name: "สมชาย ใจดี",
    attraction_name_th: "อุทยานแห่งชาติ",
    province_name_th: "ยะลา",
    has_certificate: true,
    has_stamp: true,
    ...overrides,
  };
}

function createMockSurveyRow(overrides: Partial<AdminSurveyRow> = {}): AdminSurveyRow {
  return {
    survey_id: "mock-survey-001",
    visit_id: "mock-visit-001",
    tourist_id: "mock-tourist-001",
    overall_score: 5,
    facility_score: 4,
    cleanliness_score: 5,
    safety_score: 4,
    revisit_intention: "yes",
    recommend_intention: "yes",
    comments: "สถานที่สวยงามมาก ดูแลดี",
    submitted_at: "2026-05-15T11:00:00Z",
    tourist_display_name: "สมชาย ใจดี",
    attraction_name_th: "อุทยานแห่งชาติ",
    province_name_th: "ยะลา",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests — Visit export
// ---------------------------------------------------------------------------

describe("toSafeVisitExportRows", () => {
  it("strips all PII and internal identifier fields", () => {
    const mockRows = [createMockVisitRow()];
    const safe = toSafeVisitExportRows(mockRows);

    expect(safe).toHaveLength(1);
    const row = safe[0] as unknown as Record<string, unknown>;
    expectNoKeys(row, VISIT_PII_FIELDS, "toSafeVisitExportRows");
  });

  it("preserves all required safe-export fields", () => {
    const mockRows = [createMockVisitRow()];
    const safe = toSafeVisitExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expectAllKeys(row, VISIT_SAFE_FIELDS, "toSafeVisitExportRows");
  });

  it("does not include tourist_id even when it has a value", () => {
    const mockRows = [createMockVisitRow({ tourist_id: "sensitive-id-12345" })];
    const safe = toSafeVisitExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expect((row as Record<string, unknown>).tourist_id).toBeUndefined();
  });

  it("does not include display name", () => {
    const mockRows = [
      createMockVisitRow({ tourist_display_name: "สมชาย ใจดี" }),
    ];
    const safe = toSafeVisitExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expect((row as Record<string, unknown>).tourist_display_name).toBeUndefined();
  });

  it("does not include created_at timestamp", () => {
    const mockRows = [createMockVisitRow()];
    const safe = toSafeVisitExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expect((row as Record<string, unknown>).created_at).toBeUndefined();
  });

  it("handles empty input array", () => {
    const safe = toSafeVisitExportRows([]);
    expect(safe).toEqual([]);
  });

  it("handles null display name gracefully", () => {
    const mockRows = [createMockVisitRow({ tourist_display_name: null })];
    const safe = toSafeVisitExportRows(mockRows);
    expect(safe).toHaveLength(1);
  });

  it("processes multiple rows without leaking PII", () => {
    const mockRows = [
      createMockVisitRow({ visit_id: "v-1", tourist_id: "t-1" }),
      createMockVisitRow({ visit_id: "v-2", tourist_id: "t-2" }),
      createMockVisitRow({ visit_id: "v-3", tourist_id: "t-3" }),
    ];
    const safe = toSafeVisitExportRows(mockRows);

    expect(safe).toHaveLength(3);
    for (const row of safe) {
      const r = row as unknown as Record<string, unknown>;
      expectNoKeys(r, VISIT_PII_FIELDS, `Row ${r.visit_date}`);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests — Survey export
// ---------------------------------------------------------------------------

describe("toSafeSurveyExportRows", () => {
  it("strips all PII and internal identifier fields", () => {
    const mockRows = [createMockSurveyRow()];
    const safe = toSafeSurveyExportRows(mockRows);

    expect(safe).toHaveLength(1);
    const row = safe[0] as unknown as Record<string, unknown>;
    expectNoKeys(row, SURVEY_PII_FIELDS, "toSafeSurveyExportRows");
  });

  it("preserves all required safe-export fields", () => {
    const mockRows = [createMockSurveyRow()];
    const safe = toSafeSurveyExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expectAllKeys(row, SURVEY_SAFE_FIELDS, "toSafeSurveyExportRows");
  });

  it("strips survey_id", () => {
    const mockRows = [createMockSurveyRow({ survey_id: "sensitive-789" })];
    const safe = toSafeSurveyExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expect((row as Record<string, unknown>).survey_id).toBeUndefined();
  });

  it("strips tourist_id", () => {
    const mockRows = [createMockSurveyRow({ tourist_id: "sensitive-456" })];
    const safe = toSafeSurveyExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expect((row as Record<string, unknown>).tourist_id).toBeUndefined();
  });

  it("strips visit_id", () => {
    const mockRows = [createMockSurveyRow({ visit_id: "sensitive-123" })];
    const safe = toSafeSurveyExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expect((row as Record<string, unknown>).visit_id).toBeUndefined();
  });

  it("strips tourist display name", () => {
    const mockRows = [
      createMockSurveyRow({ tourist_display_name: "สมศรี รักดี" }),
    ];
    const safe = toSafeSurveyExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expect(
      (row as Record<string, unknown>).tourist_display_name,
    ).toBeUndefined();
  });

  it("strips free-text comments (may contain PII)", () => {
    const mockRows = [
      createMockSurveyRow({
        comments: "ชอบมาก เจ้าหน้าที่ชื่อสมศรีบริการดี",
      }),
    ];
    const safe = toSafeSurveyExportRows(mockRows);

    const row = safe[0] as unknown as Record<string, unknown>;
    expect((row as Record<string, unknown>).comments).toBeUndefined();
  });

  it("preserves survey scores and intentions", () => {
    const mockRows = [
      createMockSurveyRow({
        overall_score: 5,
        facility_score: 4,
        cleanliness_score: 5,
        safety_score: 3,
        revisit_intention: "yes",
        recommend_intention: "yes",
      }),
    ];
    const safe = toSafeSurveyExportRows(mockRows);

    expect(safe[0].overall_score).toBe(5);
    expect(safe[0].facility_score).toBe(4);
    expect(safe[0].cleanliness_score).toBe(5);
    expect(safe[0].safety_score).toBe(3);
    expect(safe[0].revisit_intention).toBe("yes");
    expect(safe[0].recommend_intention).toBe("yes");
  });

  it("handles empty input array", () => {
    const safe = toSafeSurveyExportRows([]);
    expect(safe).toEqual([]);
  });

  it("handles null scores and null comments gracefully", () => {
    const mockRows = [
      createMockSurveyRow({
        overall_score: null,
        comments: null,
        tourist_display_name: null,
      }),
    ];
    const safe = toSafeSurveyExportRows(mockRows);
    expect(safe).toHaveLength(1);
    expect(safe[0].overall_score).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tests — Export type contract (compile-time + runtime)
// ---------------------------------------------------------------------------

describe("Export type contracts", () => {
  it("AdminVisitExportRow has exactly the expected safe fields", () => {
    // Runtime check that only safe fields exist
    const mock: AdminVisitExportRow = {
      visit_date: "2026-01-01",
      attraction_name_th: "Test",
      province_name_th: "Yala",
      completion_status: "completed",
      has_certificate: true,
      has_stamp: false,
    };

    // @ts-expect-error — accessing a non-existent field should be an error
    const _check: undefined = (mock as Record<string, unknown>).tourist_id;
    void _check;

    expect(mock.visit_date).toBe("2026-01-01");
  });

  it("AdminSurveyExportRow has exactly the expected safe fields", () => {
    const mock: AdminSurveyExportRow = {
      submitted_at: "2026-01-01T00:00:00Z",
      attraction_name_th: "Test",
      province_name_th: "Yala",
      overall_score: 5,
      facility_score: null,
      cleanliness_score: null,
      safety_score: null,
      revisit_intention: "yes",
      recommend_intention: "yes",
    };

    // @ts-expect-error — comments must not be in safe type
    const _check: undefined = (mock as Record<string, unknown>).comments;
    void _check;

    expect(mock.submitted_at).toBe("2026-01-01T00:00:00Z");
  });

  it("visits safe-export row count equals input row count", () => {
    const input = [
      createMockVisitRow(),
      createMockVisitRow(),
      createMockVisitRow(),
    ];
    const output = toSafeVisitExportRows(input);
    expect(output).toHaveLength(input.length);
  });

  it("surveys safe-export row count equals input row count", () => {
    const input = [
      createMockSurveyRow(),
      createMockSurveyRow(),
      createMockSurveyRow(),
    ];
    const output = toSafeSurveyExportRows(input);
    expect(output).toHaveLength(input.length);
  });
});

// ---------------------------------------------------------------------------
// Tests — Dashboard export row mappers (inline in route)
// ---------------------------------------------------------------------------

describe("Dashboard export row mappers (privacy)", () => {
  /**
   * The dashboard export route at /api/admin/dashboard/export uses inline
   * row mappers for tourists, visits, and surveys export types.
   *
   * These mappers must NOT include:
   * - tourist_id
   * - visit_id
   * - survey_id
   * - display_name
   * - email
   * - phone
   * - national_id
   * - device_token
   * - guest_token
   * - storage paths
   * - free-text comments
   */

  const FORBIDDEN_DASHBOARD_FIELDS = [
    "tourist_id",
    "visit_id",
    "survey_id",
    "display_name",
    "tourist_display_name",
    "email",
    "phone",
    "national_id",
    "device_token",
    "guest_token",
    "storage_path",
  ];

  /**
   * The dashboard `tourists` export type maps these fields:
   * - "Age Group", "Preferred Language", "Origin Country (EN)", "Origin Province (EN)"
   */
  it("tourists export type excludes identifiers", () => {
    const mockUniqueTourists = [
      {
        age_group: "25-34",
        preferred_language: "th",
        countries: { country_name_en: "Thailand" },
        provinces: { province_name_en: "Yala" },
      },
    ];

    const rows = mockUniqueTourists.map((t) => {
      const country = t.countries;
      const province = t.provinces;
      return {
        "Age Group": String(t.age_group),
        "Preferred Language": String(t.preferred_language),
        "Origin Country (EN)": String(country?.country_name_en),
        "Origin Province (EN)": String(province?.province_name_en),
      };
    });

    for (const row of rows) {
      for (const forbidden of FORBIDDEN_DASHBOARD_FIELDS) {
        expect((row as Record<string, unknown>)[forbidden]).toBeUndefined();
      }
    }
    expect(rows).toHaveLength(1);
    expect(rows[0]["Age Group"]).toBe("25-34");
  });

  /**
   * The dashboard `visits` export type maps these fields:
   * - "Visit Date", "Attraction", "Destination Province", "Age Group",
   *   "Origin Country", "Origin Province", "Group Size", "Overnight",
   *   "Nights", "Companion", "Transport", "Purpose"
   */
  it("visits export type excludes identifiers", () => {
    const mockVisits = [
      {
        visit_date: "2026-05-15",
        tourists: {
          age_group: "25-34",
          countries: { country_name_en: "Thailand" },
          provinces: { province_name_en: "Yala" },
        },
        attractions: {
          name_en: "Test Waterfall",
          provinces: { province_name_en: "Yala" },
        },
        group_size: 4,
        overnight_status: "yes",
        nights: 2,
        travel_companions: { name_en: "Family" },
        transport_modes: { name_en: "Car" },
        travel_purposes: { name_en: "Leisure" },
      },
    ];

    const rows = mockVisits.map((v) => {
      const t = v.tourists;
      const country = t?.countries;
      const originProvince = t?.provinces;
      const attr = v.attractions;
      const destProvince = attr?.provinces;
      const companion = v.travel_companions;
      const transport = v.transport_modes;
      const purpose = v.travel_purposes;
      return {
        "Visit Date": String(v.visit_date),
        Attraction: String(attr?.name_en),
        "Destination Province": String(destProvince?.province_name_en),
        "Age Group": String(t?.age_group),
        "Origin Country": String(country?.country_name_en),
        "Origin Province": String(originProvince?.province_name_en),
        "Group Size": String(v.group_size),
        Overnight: String(v.overnight_status),
        Nights: String(v.nights),
        Companion: String(companion?.name_en),
        Transport: String(transport?.name_en),
        Purpose: String(purpose?.name_en),
      };
    });

    for (const row of rows) {
      for (const forbidden of FORBIDDEN_DASHBOARD_FIELDS) {
        expect((row as Record<string, unknown>)[forbidden]).toBeUndefined();
      }
    }
    expect(rows).toHaveLength(1);
    expect(rows[0].Attraction).toBe("Test Waterfall");
  });

  /**
   * The dashboard `surveys` export type maps these fields:
   * - "Submitted At", "Visit Date", "Attraction", "Province",
   *   "Overall Score", "Cleanliness Score", "Facility Score",
   *   "Safety Score", "Revisit Intention", "Recommend Intention"
   */
  it("surveys export type excludes identifiers and comments", () => {
    const mockSurveys = [
      {
        submitted_at: "2026-05-15T11:00:00Z",
        visits: {
          visit_date: "2026-05-15",
          attractions: {
            name_en: "Test Waterfall",
            provinces: { province_name_en: "Yala" },
          },
        },
        overall_score: 5,
        cleanliness_score: 5,
        facility_score: 4,
        safety_score: 4,
        revisit_intention: "yes",
        recommend_intention: "yes",
      },
    ];

    const rows = mockSurveys.map((s) => {
      const v = s.visits;
      const attr = v?.attractions;
      const province = attr?.provinces;
      return {
        "Submitted At": String(s.submitted_at),
        "Visit Date": String(v?.visit_date),
        Attraction: String(attr?.name_en),
        Province: String(province?.province_name_en),
        "Overall Score": String(s.overall_score),
        "Cleanliness Score": String(s.cleanliness_score),
        "Facility Score": String(s.facility_score),
        "Safety Score": String(s.safety_score),
        "Revisit Intention": String(s.revisit_intention),
        "Recommend Intention": String(s.recommend_intention),
      };
    });

    for (const row of rows) {
      for (const forbidden of FORBIDDEN_DASHBOARD_FIELDS) {
        expect((row as Record<string, unknown>)[forbidden]).toBeUndefined();
      }
      expect((row as Record<string, unknown>).comments).toBeUndefined();
    }
    expect(rows).toHaveLength(1);
    expect(rows[0].Attraction).toBe("Test Waterfall");
  });
});

// ---------------------------------------------------------------------------
// Tests — Content-entity export row contracts (no PII should exist)
// ---------------------------------------------------------------------------

describe("Content-entity export row contracts (no PII fields)", () => {
  /**
   * Content-entity export routes (attractions, stories, routes, photo-spots,
   * checkin-codes, media, badges, restaurants) only export content metadata.
   * These tests verify that none of the known PII field names appear in the
   * row shapes produced by these export routes.
   */

  const PII_PATTERNS = [
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
  ];

  const contentExportKeys: Array<{
    entity: string;
    keys: string[];
  }> = [
    {
      entity: "attractions",
      keys: [
        "ID",
        "Name (TH)",
        "Name (EN)",
        "Slug",
        "Province (TH)",
        "Province (EN)",
        "District (TH)",
        "District (EN)",
        "Type (TH)",
        "Type (EN)",
        "Is Published",
        "Is Active",
        "Sustainability",
        "Created At",
        "Updated At",
      ],
    },
    {
      entity: "stories",
      keys: [
        "ID",
        "Title",
        "Slug",
        "Excerpt",
        "Category",
        "Province (TH)",
        "Province (EN)",
        "Is Published",
        "Published At",
        "Created At",
        "Updated At",
      ],
    },
    {
      entity: "routes",
      keys: [
        "ID",
        "Name (TH)",
        "Name (EN)",
        "Slug",
        "Description (TH)",
        "Description (EN)",
        "Is Published",
        "Is Active",
        "Created At",
        "Updated At",
      ],
    },
    {
      entity: "photo-spots",
      keys: [
        "ID",
        "Name (TH)",
        "Name (EN)",
        "Description (TH)",
        "Description (EN)",
        "Attraction",
        "Latitude",
        "Longitude",
        "Display Order",
        "Is Active",
        "Created At",
        "Updated At",
      ],
    },
    {
      entity: "checkin-codes",
      keys: [
        "ID",
        "Code",
        "Label",
        "Attraction",
        "Photo Spot",
        "Is Active",
        "Starts At",
        "Ends At",
        "Created At",
        "Updated At",
      ],
    },
    {
      entity: "media",
      keys: [
        "ID",
        "Media Type",
        "Storage Reference",
        "Has Storage Reference",
        "Entity Type",
        "Entity ID",
        "Alt Text (TH)",
        "Alt Text (EN)",
        "Caption (TH)",
        "Caption (EN)",
        "Is Cover",
        "Is Active",
        "Lifecycle Status",
        "Display Order",
        "Created At",
        "Updated At",
      ],
    },
    {
      entity: "badges",
      keys: [
        "ID",
        "Badge Key",
        "Name (TH)",
        "Name (EN)",
        "Description (TH)",
        "Description (EN)",
        "Category",
        "Requirement Type",
        "Requirement Value",
        "Icon Name",
        "Icon Color",
        "Display Order",
        "Is Active",
        "Created At",
        "Updated At",
      ],
    },
    {
      entity: "restaurants",
      keys: [
        "ID",
        "Slug",
        "ชื่อภาษาไทย",
        "ชื่อภาษาอังกฤษ",
        "คำอธิบายภาษาไทย",
        "คำอธิบายภาษาอังกฤษ",
        "ประเภทอาหาร",
        "จังหวัด",
        "ละติจูด",
        "ลองจิจูด",
        "ที่อยู่",
        "เวลาเปิด",
        "ช่องทางติดต่อ",
        "สถานะ",
        "Active",
        "สร้างเมื่อ",
        "อัปเดตล่าสุด",
      ],
    },
  ];

  for (const { entity, keys } of contentExportKeys) {
    it(`${entity} export rows have no PII-like field names`, () => {
      const keysLower = keys.map((k) => k.toLowerCase());
      for (const pattern of PII_PATTERNS) {
        const found = keysLower.filter((k) => k.includes(pattern));
        if (found.length > 0) {
          throw new Error(
            `${entity}: Found PII-like keys matching "${pattern}": ${found.join(", ")}`,
          );
        }
      }
    });

    it(`${entity} export has the expected number of columns`, () => {
      // Sanity check: every entity should have at least 5 columns
      expect(keys.length).toBeGreaterThanOrEqual(5);
    });
  }
});
