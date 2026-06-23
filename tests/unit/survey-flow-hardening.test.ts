import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PostCertificateSurveyInput } from "@/lib/validation/survey";

const mocks = vi.hoisted(() => {
  class MockTouristAccessError extends Error {
    constructor(
      public readonly code: string,
      message: string
    ) {
      super(message);
      this.name = "TouristAccessError";
    }
  }

  class MockSurveyReferenceError extends Error {
    constructor(
      public readonly field: string,
      public readonly table: string
    ) {
      super("SURVEY_REFERENCE_INVALID");
      this.name = "SurveyReferenceError";
    }
  }

  return {
    TouristAccessError: MockTouristAccessError,
    SurveyReferenceError: MockSurveyReferenceError,
    requireTouristVisitAccess: vi.fn(),
    getCertificateByVisitId: vi.fn(),
    updateVisitSurveyFields: vi.fn(),
    updateVisitStatus: vi.fn(),
    upsertVisitExpense: vi.fn(),
    assertActiveSurveyReferences: vi.fn(),
    getSurveyOptions: vi.fn(),
    getSatisfactionSurveyByVisitId: vi.fn(),
    upsertSatisfactionSurvey: vi.fn(),
    recordFunnelEvent: vi.fn(),
  };
});

vi.mock("@/lib/auth/guards", () => ({
  TouristAccessError: mocks.TouristAccessError,
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
}));

vi.mock("@/lib/repositories/certificate.repository", () => ({
  getCertificateByVisitId: mocks.getCertificateByVisitId,
}));

vi.mock("@/lib/repositories/expense.repository", () => ({
  upsertVisitExpense: mocks.upsertVisitExpense,
}));

vi.mock("@/lib/repositories/funnel.repository", () => ({
  recordFunnelEvent: mocks.recordFunnelEvent,
}));

vi.mock("@/lib/repositories/survey.repository", () => ({
  SurveyReferenceError: mocks.SurveyReferenceError,
  assertActiveSurveyReferences: mocks.assertActiveSurveyReferences,
  getSurveyOptions: mocks.getSurveyOptions,
  getSatisfactionSurveyByVisitId: mocks.getSatisfactionSurveyByVisitId,
  upsertSatisfactionSurvey: mocks.upsertSatisfactionSurvey,
}));

vi.mock("@/lib/repositories/visit.repository", () => ({
  updateVisitStatus: mocks.updateVisitStatus,
  updateVisitSurveyFields: mocks.updateVisitSurveyFields,
}));

import {
  skipPostCertificateSurvey,
  submitPostCertificateSurvey,
} from "@/lib/services/survey.service";

const visitId = "550e8400-e29b-41d4-a716-446655440000";

const validSurveyInput: PostCertificateSurveyInput = {
  visitId,
  travelCompanionId: 1,
  groupSize: 2,
  transportModeId: 3,
  travelPurposeId: 4,
  overnightStatus: "overnight",
  nightsCount: 1,
  spendingRangeId: 5,
  expenseCategoryId: 6,
  overallSatisfaction: 5,
  safetyScore: 4,
  cleanlinessScore: 5,
  accessibilityScore: 4,
  informationScore: 5,
  valueScore: 4,
  revisitIntention: "yes",
  recommendIntention: "maybe",
  optionalComment: "Nice trip",
};

describe("survey flow hardening", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireTouristVisitAccess.mockResolvedValue({
      touristId: "tourist-1",
      visit: {
        visit_id: visitId,
        tourist_id: "tourist-1",
        attraction_id: 12,
        checkin_code_id: 34,
        completion_status: "certificate_generated",
      },
    });
    mocks.getCertificateByVisitId.mockResolvedValue({
      certificate_id: "certificate-1",
      certificate_path: "certificates/test.png",
    });
    mocks.assertActiveSurveyReferences.mockResolvedValue(undefined);
    mocks.updateVisitSurveyFields.mockResolvedValue(undefined);
    mocks.upsertVisitExpense.mockResolvedValue(undefined);
    mocks.upsertSatisfactionSurvey.mockResolvedValue(undefined);
    mocks.updateVisitStatus.mockResolvedValue(undefined);
    mocks.recordFunnelEvent.mockResolvedValue(undefined);
  });

  it("validates active reference IDs before writing survey data", async () => {
    await submitPostCertificateSurvey(validSurveyInput);

    expect(mocks.assertActiveSurveyReferences).toHaveBeenCalledWith({
      travelCompanionId: 1,
      transportModeId: 3,
      travelPurposeId: 4,
      expenseCategoryId: 6,
      spendingRangeId: 5,
    });
    expect(mocks.updateVisitSurveyFields).toHaveBeenCalledWith(visitId, expect.objectContaining({
      travelCompanionId: 1,
      groupSize: 2,
      transportModeId: 3,
    }));
    expect(mocks.upsertVisitExpense).toHaveBeenCalledWith({
      visitId,
      expenseCategoryId: 6,
      spendingRangeId: 5,
    });
    expect(mocks.upsertSatisfactionSurvey).toHaveBeenCalledWith(expect.objectContaining({
      visitId,
      touristId: "tourist-1",
      attractionId: 12,
      overallScore: 5,
      comment: "Nice trip",
    }));
    expect(mocks.updateVisitStatus).toHaveBeenCalledWith(visitId, "survey_completed");
    expect(mocks.recordFunnelEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventName: "survey_completed",
      touristId: "tourist-1",
      attractionId: 12,
      checkinCodeId: 34,
      visitId,
    }));

    const referenceOrder = mocks.assertActiveSurveyReferences.mock.invocationCallOrder[0];
    const writeOrder = mocks.updateVisitSurveyFields.mock.invocationCallOrder[0];
    expect(referenceOrder).toBeLessThan(writeOrder);
  });

  it("blocks inactive or missing option IDs before any write", async () => {
    mocks.assertActiveSurveyReferences.mockRejectedValueOnce(
      new mocks.SurveyReferenceError("transportModeId", "transport_modes")
    );

    await expect(submitPostCertificateSurvey(validSurveyInput)).rejects.toMatchObject({
      code: "SURVEY_REFERENCE_INVALID",
    });
    expect(mocks.updateVisitSurveyFields).not.toHaveBeenCalled();
    expect(mocks.upsertVisitExpense).not.toHaveBeenCalled();
    expect(mocks.upsertSatisfactionSurvey).not.toHaveBeenCalled();
    expect(mocks.updateVisitStatus).not.toHaveBeenCalled();
  });

  it("requires a generated certificate before accepting survey data", async () => {
    mocks.getCertificateByVisitId.mockResolvedValueOnce(null);
    mocks.requireTouristVisitAccess.mockResolvedValueOnce({
      touristId: "tourist-1",
      visit: {
        visit_id: visitId,
        tourist_id: "tourist-1",
        attraction_id: 12,
        completion_status: "photo_uploaded",
      },
    });

    await expect(submitPostCertificateSurvey(validSurveyInput)).rejects.toMatchObject({
      code: "CERTIFICATE_REQUIRED",
    });
    expect(mocks.assertActiveSurveyReferences).not.toHaveBeenCalled();
    expect(mocks.updateVisitSurveyFields).not.toHaveBeenCalled();
  });

  it("maps visit ownership failures to a survey flow error", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValueOnce(
      new mocks.TouristAccessError("VISIT_ACCESS_DENIED", "denied")
    );

    await expect(submitPostCertificateSurvey(validSurveyInput)).rejects.toMatchObject({
      code: "VISIT_ACCESS_DENIED",
    });
    expect(mocks.assertActiveSurveyReferences).not.toHaveBeenCalled();
  });

  it("records survey skip without changing visit status", async () => {
    await skipPostCertificateSurvey(visitId);

    expect(mocks.recordFunnelEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventName: "survey_skipped",
      touristId: "tourist-1",
      attractionId: 12,
      checkinCodeId: 34,
      visitId,
    }));
    expect(mocks.updateVisitStatus).not.toHaveBeenCalled();
  });
});
