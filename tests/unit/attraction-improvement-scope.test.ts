import { describe, expect, it } from "vitest";
import { buildAttractionImprovementHref } from "@/lib/dashboard/attraction-improvement-links";
import { parseAttractionImprovementScope } from "@/lib/dashboard/attraction-improvement-scope";

const defaults = {
  dateStart: "2026-09-01",
  dateEnd: "2026-09-30",
  comparisonStart: "2026-08-02",
  comparisonEnd: "2026-08-31",
};

describe("parseAttractionImprovementScope", () => {
  it("uses chart provenance filters and an equal-length prior window", () => {
    const href = buildAttractionImprovementHref({
      attractionId: 7,
      dateStart: "2026-01-01",
      dateEnd: "2026-01-31",
      evidenceScope: "pilot_only",
      entryChannel: "nfc",
      campaignId: 3,
      checkinCodeId: 9,
    }, { source: "low_score", dimension: "safety", metric: "safety_score", value: 2 });
    const query = Object.fromEntries(new URL(href, "https://example.test").searchParams);
    const parsed = parseAttractionImprovementScope(query, 7, defaults);
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect(parsed.data).toMatchObject({
      attractionId: 7,
      dateStart: "2026-01-01",
      dateEnd: "2026-01-31",
      comparisonStart: "2025-12-01",
      comparisonEnd: "2025-12-31",
      evidenceScope: "pilot_only",
      entryChannel: "nfc",
      campaignId: 3,
      checkinCodeId: 9,
    });
  });

  it("does not let unrelated normal filter keys override a chart draft", () => {
    const parsed = parseAttractionImprovementScope({
      draftSource: "low_score",
      evidenceScope: "all_records",
      draftEvidenceScope: "field_claim",
      entryChannel: "qr",
      draftEntryChannel: "nfc",
    }, 7, defaults);
    expect(parsed.success && parsed.data).toMatchObject({ evidenceScope: "field_claim", entryChannel: "nfc" });
  });

  it("uses ordinary GET filters when there is no draft and never infers field evidence for a legacy link", () => {
    const selected = parseAttractionImprovementScope({ evidenceScope: "simulated_only", entryChannel: "qr" }, 7, defaults);
    expect(selected.success && selected.data).toMatchObject({ evidenceScope: "simulated_only", entryChannel: "qr" });
    const legacy = parseAttractionImprovementScope({ draftSource: "low_score" }, 7, defaults);
    expect(legacy.success && legacy.data).toMatchObject({ evidenceScope: "all_records" });
  });

  it("rejects malformed scope rather than silently using default data", () => {
    expect(parseAttractionImprovementScope({ evidenceScope: "unverified_field" }, 7, defaults).success).toBe(false);
    expect(parseAttractionImprovementScope({ campaignId: "-1" }, 7, defaults).success).toBe(false);
  });
});
