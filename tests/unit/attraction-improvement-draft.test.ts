import { describe, expect, it } from "vitest";

import { parseAttractionIssueDraft } from "@/lib/dashboard/attraction-improvement-draft";
import { buildAttractionImprovementHref, buildAttractionImprovementScopeHref, buildAttractionSatisfactionHref } from "@/lib/dashboard/attraction-improvement-links";
import { parseAttractionImprovementScope } from "@/lib/dashboard/attraction-improvement-scope";
import { parseDashboardFilters } from "@/lib/validation/dashboard-filters";

const scope = { dateStart: "2026-08-01", dateEnd: "2026-08-31" };

describe("parseAttractionIssueDraft", () => {
  it("translates the improvement scope into the shared satisfaction dashboard query", () => {
    const href = buildAttractionSatisfactionHref({
      attractionId: 4, ...scope, evidenceScope: "pilot_only", entryChannel: "nfc", campaignId: 7, checkinCodeId: 10,
    });
    expect(href).toBe("/admin/dashboard/satisfaction?attraction_id=4&date_from=2026-08-01&date_to=2026-08-31&evidence_scope=pilot_only");
    const parsed = parseDashboardFilters(Object.fromEntries(new URL(href, "https://example.test").searchParams));
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toMatchObject({ attractionId: 4, dateFrom: "2026-08-01", dateTo: "2026-08-31", evidenceScope: "pilot_only" });
  });
  it("preserves the full selected population in a plain improvement navigation link", () => {
    const href = buildAttractionImprovementScopeHref({
      attractionId: 4, ...scope, evidenceScope: "pilot_only", entryChannel: "nfc", campaignId: 7, checkinCodeId: 10,
    });
    const query = Object.fromEntries(new URL(href, "https://example.test").searchParams);
    const parsed = parseAttractionImprovementScope(query, 4, {
      dateStart: "2026-01-01", dateEnd: "2026-03-31", comparisonStart: "2025-10-01", comparisonEnd: "2025-12-31",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data).toMatchObject({
      dateStart: "2026-08-01", dateEnd: "2026-08-31", evidenceScope: "pilot_only", entryChannel: "nfc", campaignId: 7, checkinCodeId: 10,
    });
  });
  it("carries the source scope and channel through a chart link into the reviewed draft", () => {
    const href = buildAttractionImprovementHref({ attractionId: 4, ...scope, evidenceScope: "pilot_only", entryChannel: "nfc", campaignId: 7, checkinCodeId: 10 }, { source: "low_score", dimension: "safety", metric: "safety_score", value: 2.8 });
    const query = Object.fromEntries(new URL(href, "https://example.test").searchParams);
    const draft = parseAttractionIssueDraft(query, scope, "safety");
    expect(draft?.sourceContext).toContain("Pilot เท่านั้น");
    expect(draft?.sourceContext).toContain("ช่องทาง: nfc");
    expect(draft?.note).toContain("Pilot เท่านั้น");
    expect(draft?.note).toContain("ช่องทาง: nfc");
    expect(draft?.note).toContain("แคมเปญรหัส 7");
    expect(draft?.note).toContain("จุดเช็กอินรหัส 10");
    expect(draft?.note).toContain("ยังไม่ใช่หลักฐานที่ยืนยันแล้ว");
    expect(draft?.note).toContain("คำนวณใหม่ตามตัวกรองที่เลือก");
  });

  it("does not infer field evidence for legacy links", () => {
    const draft = parseAttractionIssueDraft({ draftSource: "low_score", draftMetric: "safety_score", draftValue: "2.8" }, scope, "safety");
    expect(draft?.note).toContain("ไม่ระบุ (ห้ามถือว่าเป็นภาคสนาม)");
  });

  it.each([
    { draftEvidenceScope: "approved_field" },
    { draftEntryChannel: "physical_tap_verified" },
    { draftCampaignId: "-1" },
    { draftCheckinCodeId: "invalid" },
  ])("rejects invalid provenance %o", (provenance) => {
    expect(parseAttractionIssueDraft({ draftSource: "low_score", draftMetric: "safety_score", draftValue: "2.8", ...provenance }, scope, "safety")).toBeUndefined();
  });
  it("accepts bounded aggregate values that match the selected dimension", () => {
    expect(parseAttractionIssueDraft({
      draftSource: "low_score",
      draftMetric: "safety_score",
      draftValue: "2.8",
    }, scope, "safety")).toMatchObject({ source: "low_score", category: "safety" });

    expect(parseAttractionIssueDraft({
      draftSource: "trend_point",
      draftMetric: "visits",
      draftValue: "18",
      draftDate: "2026-08-14",
    }, scope, "overall")).toMatchObject({ source: "trend_point", category: "service" });
  });

  it.each([
    [{ draftSource: "low_score", draftMetric: "safety_score", draftValue: "4.8" }, "safety"],
    [{ draftSource: "low_score", draftMetric: "safety_score", draftValue: "2.8" }, "cleanliness"],
    [{ draftSource: "funnel_dropoff", draftMetric: "photo", draftValue: "101" }, "overall"],
    [{ draftSource: "trend_point", draftMetric: "visits", draftValue: "2.5", draftDate: "2026-08-14" }, "overall"],
    [{ draftSource: "trend_point", draftMetric: "visits", draftValue: "18", draftDate: "2026-09-01" }, "overall"],
  ] as const)("rejects forged or out-of-scope draft query %o", (query, dimension) => {
    expect(parseAttractionIssueDraft(query, scope, dimension)).toBeUndefined();
  });
});
