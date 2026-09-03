import { describe, expect, it } from "vitest";

import { parseAttractionIssueDraft } from "@/lib/dashboard/attraction-improvement-draft";

const scope = { dateStart: "2026-08-01", dateEnd: "2026-08-31" };

describe("parseAttractionIssueDraft", () => {
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
