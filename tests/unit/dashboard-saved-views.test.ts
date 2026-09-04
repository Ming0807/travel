import { describe, expect, it } from "vitest";

import {
  createDashboardSavedView,
  parseDashboardSavedViews,
  sanitizeDashboardQuery,
} from "@/lib/dashboard/dashboard-saved-views";

describe("dashboard saved views", () => {
  it("accepts controlled legacy ages but rejects arbitrary values in known fields", () => {
    expect(sanitizeDashboardQuery(new URLSearchParams({ age_group: "65+", satisfaction_min: "3.5" })))
      .toEqual({ age_group: "65+", satisfaction_min: "3.5" });
    expect(sanitizeDashboardQuery(new URLSearchParams({ age_group: "private_person", date_from: "2026-02-31" }))).toEqual({});
    expect(sanitizeDashboardQuery(new URLSearchParams({ age_group: "constructor" }))).toEqual({});
  });
  it("keeps only aggregate dashboard filters and canonicalizes aliases", () => {
    const query = sanitizeDashboardQuery(new URLSearchParams({
      dateFrom: "2026-08-01",
      date_to: "2026-08-31",
      evidenceScope: "pilot_only",
      attraction_id: "4",
      compare: "previous_period",
      email: "person@example.com",
      tourist_id: "secret-tourist-id",
      token: "secret-token",
      unknown: "discard-me",
    }));

    expect(query).toEqual({
      attraction_id: "4",
      compare: "previous_period",
      date_from: "2026-08-01",
      date_to: "2026-08-31",
      evidence_scope: "pilot_only",
    });
    expect(JSON.stringify(query)).not.toContain("person@example.com");
    expect(JSON.stringify(query)).not.toContain("secret");
  });

  it("creates a bounded aggregate view without metric values", () => {
    const view = createDashboardSavedView({
      id: "view-1",
      name: "Pilot เดือนสิงหาคม",
      pathname: "/admin/dashboard/satisfaction",
      searchParams: new URLSearchParams("date_from=2026-08-01&date_to=2026-08-31&evidence_scope=pilot_only"),
      createdAt: "2026-09-04T00:00:00.000Z",
    });

    expect(view).toEqual({
      id: "view-1",
      name: "Pilot เดือนสิงหาคม",
      pathname: "/admin/dashboard/satisfaction",
      query: "date_from=2026-08-01&date_to=2026-08-31&evidence_scope=pilot_only",
      createdAt: "2026-09-04T00:00:00.000Z",
    });
    expect(view).not.toHaveProperty("data");
    expect(view).not.toHaveProperty("metrics");
  });

  it("drops malformed and unsafe persisted views", () => {
    const parsed = parseDashboardSavedViews(JSON.stringify([
      {
        id: "safe",
        name: "ภาคสนาม",
        pathname: "/admin/dashboard",
        query: "date_from=2026-08-01&date_to=2026-08-31&evidence_scope=field_claim",
        createdAt: "2026-09-04T00:00:00.000Z",
      },
      {
        id: "unsafe",
        name: "Leak",
        pathname: "/profile",
        query: "email=person@example.com",
        createdAt: "2026-09-04T00:00:00.000Z",
      },
    ]));

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.id).toBe("safe");
  });

  it("isolates malformed records and rejects duplicate IDs and invalid filter values", () => {
    const safe = { id: "safe", name: "Field", pathname: "/admin/dashboard", query: "date_from=2026-08-01", createdAt: "2026-09-04T00:00:00.000Z" };
    expect(parseDashboardSavedViews(JSON.stringify([
      { ...safe, id: "bad", pathname: "https://example.com" },
      safe,
      safe,
      { ...safe, id: "invalid", query: "date_from=2026-02-31" },
    ]))).toEqual([safe]);
  });
});
