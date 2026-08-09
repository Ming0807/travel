import { describe, expect, it } from "vitest";

import type { AdminResearchStudyDetail, ResearchAnalyticsRows } from "@/lib/repositories/admin-research.repository";
import { assertResearchStudyExportable, buildDeidentifiedResearchExportRows, ResearchExportError } from "@/lib/services/research-export.service";

const detail = {
  study: { studyCode: "yala-field-2026", protocolVersion: "p1", consentVersion: "c1", noticeVersion: "n1" },
  instruments: [], items: [], deployments: [], operatorTasks: [],
} as unknown as AdminResearchStudyDetail;

function rows(count = 10): ResearchAnalyticsRows {
  const sessions = Array.from({ length: count }, (_, index) => ({
    researchSessionId: `session-${index}`,
    participantCode: `participant-${index}`,
    participantType: "tourist" as const,
    collectionMode: "field_observation" as const,
    status: "completed",
    inclusionStatus: "included",
    consentedAt: "2026-09-01T00:00:00Z",
    startedAt: null,
    completedAt: "2026-09-01T00:05:00Z",
    withdrawnAt: null,
    createdAt: "2026-09-01T00:00:00Z",
    visitId: `visit-${index}`,
  }));
  return { sessions, instruments: [], items: [], responses: [], answers: [], funnelEvents: [], operatorTasks: [], operatorAttempts: [], tourismRows: [], truncated: false };
}

describe("research export privacy", () => {
  it("rejects participant-level exports below the fixed privacy threshold", () => {
    expect(() => buildDeidentifiedResearchExportRows({ detail, rows: rows(9), dataset: "participants", exportedAt: "2026-09-30T00:00:00Z" })).toThrowError(ResearchExportError);
  });

  it("rejects exports when any released participant subgroup is below the threshold", () => {
    const source = rows();
    source.sessions[9] = {
      ...source.sessions[9],
      participantType: "operator",
      collectionMode: "pilot_internal",
      visitId: null,
    };

    expect(() => buildDeidentifiedResearchExportRows({ detail, rows: source, dataset: "participants" })).toThrowError(ResearchExportError);
  });

  it("calculates subgroup privacy from sessions actually released by the dataset", () => {
    const source = rows(20);
    source.sessions = source.sessions.map((session, index) => ({
      ...session,
      participantType: index < 10 ? "tourist" as const : "operator" as const,
    }));
    source.instruments = [{ researchInstrumentId: "instrument-1", studyId: "study", instrumentKey: "evaluation", versionNumber: 1, audience: "tourist", status: "published", titleTh: "แบบประเมิน", titleEn: null, descriptionTh: null, descriptionEn: null, estimatedMinutes: 4, publishedAt: "2026-09-01T00:00:00Z", frozenAt: "2026-09-01T00:00:00Z", createdAt: "2026-08-01T00:00:00Z" }];
    source.responses = [0, 1, 2, 3, 4, 10, 11, 12, 13, 14].map((index) => ({ researchResponseId: `response-${index}`, researchSessionId: `session-${index}`, instrumentId: "instrument-1", status: "submitted", startedAt: "2026-09-01T00:00:00Z", submittedAt: "2026-09-01T00:01:00Z", durationSeconds: 60 }));

    expect(() => buildDeidentifiedResearchExportRows({ detail, rows: source, dataset: "responses" })).toThrowError(ResearchExportError);
  });

  it("rejects draft or unapproved study exports", () => {
    expect(() => assertResearchStudyExportable({
      ...detail,
      study: { ...detail.study, status: "draft", frozenAt: null },
    })).toThrowError(ResearchExportError);
  });

  it("exports only opaque participant codes and no internal identity or visit identifiers", () => {
    const exported = buildDeidentifiedResearchExportRows({ detail, rows: rows(), dataset: "participants", exportedAt: "2026-09-30T00:00:00Z" });
    const keys = Object.keys(exported[0]);
    expect(keys).toContain("participant_code");
    expect(keys).not.toEqual(expect.arrayContaining(["research_session_id", "tourist_id", "visit_id", "display_name", "provider_user_id", "photo", "storage_path"]));
    expect(JSON.stringify(exported)).not.toContain("visit-0");
    expect(JSON.stringify(exported)).not.toContain("session-0");
  });

  it("allows a versioned codebook without participant rows", () => {
    const source = rows(0);
    source.instruments = [{ researchInstrumentId: "instrument-1", studyId: "study", instrumentKey: "tourist_evaluation", versionNumber: 1, audience: "tourist", status: "published", titleTh: "แบบประเมิน", titleEn: null, descriptionTh: null, descriptionEn: null, estimatedMinutes: 4, publishedAt: "2026-09-01T00:00:00Z", frozenAt: "2026-09-01T00:00:00Z", createdAt: "2026-08-01T00:00:00Z" }];
    source.items = [{ researchItemId: "item-1", instrumentId: "instrument-1", itemCode: "SQ1", constructKey: "system_quality", promptTh: "ระบบรวดเร็ว", promptEn: null, answerType: "agreement_5", options: null, displayOrder: 1, isRequired: true, reverseScore: false }];
    const exported = buildDeidentifiedResearchExportRows({ detail, rows: source, dataset: "codebook", exportedAt: "2026-09-30T00:00:00Z" });
    expect(exported[0]).toMatchObject({ item_code: "SQ1", instrument_version: 1, protocol_version: "p1" });
  });

  it("omits raw free-text answers and flags them for restricted review", () => {
    const source = rows();
    source.instruments = [{ researchInstrumentId: "instrument-1", studyId: "study", instrumentKey: "tourist_evaluation", versionNumber: 1, audience: "tourist", status: "published", titleTh: "แบบประเมิน", titleEn: null, descriptionTh: null, descriptionEn: null, estimatedMinutes: 4, publishedAt: "2026-09-01T00:00:00Z", frozenAt: "2026-09-01T00:00:00Z", createdAt: "2026-08-01T00:00:00Z" }];
    source.items = [{ researchItemId: "item-1", instrumentId: "instrument-1", itemCode: "COMMENT", constructKey: "comment", promptTh: "ข้อเสนอแนะ", promptEn: null, answerType: "long_text", options: null, displayOrder: 1, isRequired: false, reverseScore: false }];
    source.responses = source.sessions.map((session, index) => ({ researchResponseId: `response-${index}`, researchSessionId: session.researchSessionId, instrumentId: "instrument-1", status: "submitted", startedAt: "2026-09-01T00:00:00Z", submittedAt: "2026-09-01T00:01:00Z", durationSeconds: 60 }));
    source.answers = source.responses.map((response) => ({ responseId: response.researchResponseId, itemId: "item-1", integerValue: null, booleanValue: null, textValue: "ติดต่อ me@example.com หรือ 081-234-5678" }));
    const exported = buildDeidentifiedResearchExportRows({ detail, rows: source, dataset: "answers", exportedAt: "2026-09-30T00:00:00Z" });
    expect(exported[0].text_value).toBeNull();
    expect(exported[0].text_response_present).toBe(true);
    expect(exported[0].free_text_review_required).toBe(true);
    expect(JSON.stringify(exported)).not.toContain("me@example.com");
  });
});
