import {
  buildEvidenceSnapshot,
  sanitizeEvidenceSnapshot,
  toPrivacySafeEvidence,
  type CandidateMetrics,
  type FeedbackScope,
  type RawEvidenceRow,
} from "@/lib/services/attraction-feedback.service";
import { describe, expect, it } from "vitest";

const scope: FeedbackScope = {
  attractionId: 7,
  dateStart: "2026-01-01",
  dateEnd: "2026-01-31",
  comparisonStart: "2025-12-01",
  comparisonEnd: "2025-12-31",
};

const candidateMetrics: CandidateMetrics = {
  attractionId: 7,
  scope,
  sourceTypes: ["satisfaction_surveys", "visits"],
  validResponseCount: 30,
  visitCount: 120,
  currentScore: 2.8,
  comparisonScore: 3.2,
  structuredLowScoreRecurrence: 5,
  isTruncated: false,
  issueDimension: "overall",
};

describe("attraction feedback evidence privacy", () => {
  it("builds a server-side snapshot with metrics, thresholds, source types, scopes, and denominators", () => {
    const snapshot = buildEvidenceSnapshot(candidateMetrics);

    expect(snapshot).toMatchObject({
      schemaVersion: 1,
      ruleVersion: "feedback-rules-v1",
      sourceTypes: ["satisfaction_surveys", "visits"],
      dateScope: scope,
      denominators: {
        validResponses: 30,
        visits: 120,
      },
      thresholds: {
        minimumValidResponses: 30,
        minimumVisits: 30,
        lowScoreThreshold: 3,
        structuredLowScoreThreshold: 2,
        comparableDeclineThreshold: 0.25,
        minimumStructuredRecurrence: 3,
      },
    });
    expect(JSON.stringify(snapshot)).not.toMatch(/tourist|visit_id|name|photo|storage|comment/i);
  });

  it.each(["touristId", "visitId", "displayName", "name", "photoPath", "storagePath", "privatePath", "comment"]) (
    "rejects forbidden evidence key %s",
    (key: string) => {
      try {
        sanitizeEvidenceSnapshot({
          ...buildEvidenceSnapshot(candidateMetrics),
          [key]: "forbidden",
        });
        throw new Error("Expected evidence snapshot validation to fail.");
      } catch (error) {
        expect(error).toMatchObject({ code: "EVIDENCE_SNAPSHOT_FORBIDDEN_FIELD" });
      }
    },
  );

  it("suppresses evidence drilldown below the privacy threshold and strips identity/PII fields", () => {
    const rows: RawEvidenceRow[] = [{
      sourceType: "approved_review",
      score: 2,
      occurredAt: "2026-01-04T10:00:00.000Z",
      comment: "Call me at +66 81 234 5678 or test@example.com https://example.com",
      tourist_id: "tourist-secret",
      visit_id: "visit-secret",
      display_name: "Visitor Name",
    }];

    expect(toPrivacySafeEvidence(rows, 29, true)).toEqual([]);

    const safe = toPrivacySafeEvidence(rows, 30, true);
    expect(safe).toHaveLength(1);
    expect(safe[0]).not.toHaveProperty("tourist_id");
    expect(safe[0]).not.toHaveProperty("visit_id");
    expect(safe[0]).not.toHaveProperty("display_name");
    expect(safe[0]?.excerpt).not.toMatch(/\+66|test@example|https:\/\//);
  });

  it("does not return comment text when comment access is not granted", () => {
    const safe = toPrivacySafeEvidence([
      { sourceType: "satisfaction_survey", score: 2, occurredAt: "2026-01-04", comment: "Private comment" },
    ], 30, false);

    expect(safe[0]).toEqual({ sourceType: "satisfaction_survey", score: 2, period: "2026-01" });
  });
});
