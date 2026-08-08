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

  class MockSurveyValidationError extends Error {
    constructor(public readonly field: string) {
      super("SURVEY_VALIDATION_FAILED");
      this.name = "SurveyValidationError";
    }
  }

  return {
    TouristAccessError: MockTouristAccessError,
    SurveyReferenceError: MockSurveyReferenceError,
    SurveyValidationError: MockSurveyValidationError,
    requireTouristVisitAccess: vi.fn(),
    getCertificateByVisitId: vi.fn(),
    savePostCertificateSurveyTransaction: vi.fn(),
    getSurveyOptions: vi.fn(),
    getSatisfactionSurveyByVisitId: vi.fn(),
    recordFunnelEvent: vi.fn(),
    getCheckinSessionId: vi.fn(),
  };
});

vi.mock("@/lib/auth/checkin-session", () => ({
  getCheckinSessionId: mocks.getCheckinSessionId,
}));

vi.mock("@/lib/auth/guards", () => ({
  TouristAccessError: mocks.TouristAccessError,
  requireTouristVisitAccess: mocks.requireTouristVisitAccess,
}));

vi.mock("@/lib/repositories/certificate.repository", () => ({
  getCertificateByVisitId: mocks.getCertificateByVisitId,
}));

vi.mock("@/lib/repositories/funnel.repository", () => ({
  recordFunnelEvent: mocks.recordFunnelEvent,
}));

vi.mock("@/lib/repositories/survey.repository", () => ({
  SurveyReferenceError: mocks.SurveyReferenceError,
  SurveyValidationError: mocks.SurveyValidationError,
  getSurveyOptions: mocks.getSurveyOptions,
  getSatisfactionSurveyByVisitId: mocks.getSatisfactionSurveyByVisitId,
  savePostCertificateSurveyTransaction: mocks.savePostCertificateSurveyTransaction,
}));

import {
  getPostCertificateSurveyPageData,
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
  facilityScore: 3,
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
    mocks.savePostCertificateSurveyTransaction.mockResolvedValue(undefined);
    mocks.recordFunnelEvent.mockResolvedValue(undefined);
    mocks.getCheckinSessionId.mockResolvedValue("survey-session-1");
    mocks.getSurveyOptions.mockResolvedValue({
      travelCompanions: [],
      transportModes: [],
      travelPurposes: [],
      expenseCategories: [],
      spendingRanges: [],
    });
    mocks.getSatisfactionSurveyByVisitId.mockResolvedValue(null);
  });

  it("deduplicates survey starts with the current check-in session", async () => {
    await getPostCertificateSurveyPageData(visitId);

    expect(mocks.recordFunnelEvent).toHaveBeenCalledWith(expect.objectContaining({
      eventName: "survey_started",
      sessionId: "survey-session-1",
      visitId,
    }));
  });

  it("does not record another survey start after this visit already has a response", async () => {
    mocks.getSatisfactionSurveyByVisitId.mockResolvedValueOnce({ survey_id: "survey-1" });

    await getPostCertificateSurveyPageData(visitId);

    expect(mocks.recordFunnelEvent).not.toHaveBeenCalled();
  });

  it("saves all survey data through one atomic database transaction", async () => {
    await submitPostCertificateSurvey(validSurveyInput);

    expect(mocks.savePostCertificateSurveyTransaction).toHaveBeenCalledTimes(1);
    expect(mocks.savePostCertificateSurveyTransaction).toHaveBeenCalledWith({
      touristId: "tourist-1",
      input: validSurveyInput,
    });
    expect(mocks.recordFunnelEvent).not.toHaveBeenCalledWith(
      expect.objectContaining({ eventName: "survey_completed" })
    );
  });

  it("blocks inactive or missing option IDs before any write", async () => {
    mocks.savePostCertificateSurveyTransaction.mockRejectedValueOnce(
      new mocks.SurveyReferenceError("transportModeId", "transport_modes")
    );

    await expect(submitPostCertificateSurvey(validSurveyInput)).rejects.toMatchObject({
      code: "SURVEY_REFERENCE_INVALID",
    });
    expect(mocks.savePostCertificateSurveyTransaction).toHaveBeenCalledTimes(1);
  });

  it("maps transaction validation failures to a stable survey validation error", async () => {
    mocks.savePostCertificateSurveyTransaction.mockRejectedValueOnce(
      new mocks.SurveyValidationError("facilityScore"),
    );

    await expect(submitPostCertificateSurvey(validSurveyInput)).rejects.toMatchObject({
      code: "SURVEY_VALIDATION_FAILED",
    });
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
    expect(mocks.savePostCertificateSurveyTransaction).not.toHaveBeenCalled();
  });

  it("maps visit ownership failures to a survey flow error", async () => {
    mocks.requireTouristVisitAccess.mockRejectedValueOnce(
      new mocks.TouristAccessError("VISIT_ACCESS_DENIED", "denied")
    );

    await expect(submitPostCertificateSurvey(validSurveyInput)).rejects.toMatchObject({
      code: "VISIT_ACCESS_DENIED",
    });
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
    expect(mocks.savePostCertificateSurveyTransaction).not.toHaveBeenCalled();
  });
});
