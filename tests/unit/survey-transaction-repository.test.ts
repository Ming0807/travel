import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PostCertificateSurveyInput } from "@/lib/validation/survey";

const serviceRoleMocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ rpc: serviceRoleMocks.rpc }),
}));

import {
  savePostCertificateSurveyTransaction,
  SurveyReferenceError,
} from "@/lib/repositories/survey.repository";

const input: PostCertificateSurveyInput = {
  visitId: "550e8400-e29b-41d4-a716-446655440000",
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
  optionalComment: "Synthetic survey comment",
};

describe("survey transaction repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    serviceRoleMocks.rpc.mockResolvedValue({ data: { success: true }, error: null });
  });

  it("maps the complete survey to one submit_post_certificate_survey RPC call", async () => {
    await savePostCertificateSurveyTransaction({ touristId: "tourist-test", input });

    expect(serviceRoleMocks.rpc).toHaveBeenCalledTimes(1);
    expect(serviceRoleMocks.rpc).toHaveBeenCalledWith("submit_post_certificate_survey", {
      p_visit_id: input.visitId,
      p_tourist_id: "tourist-test",
      p_travel_companion_id: 1,
      p_group_size: 2,
      p_transport_mode_id: 3,
      p_travel_purpose_id: 4,
      p_overnight_status: "overnight",
      p_nights_count: 1,
      p_expense_category_id: 6,
      p_spending_range_id: 5,
      p_overall_score: 5,
      p_safety_score: 4,
      p_cleanliness_score: 5,
      p_accessibility_score: 4,
      p_information_score: 5,
      p_value_score: 4,
      p_revisit_intention: "yes",
      p_recommend_intention: "maybe",
      p_comment: "Synthetic survey comment",
    });
  });

  it("maps an inactive reference result to SurveyReferenceError", async () => {
    serviceRoleMocks.rpc.mockResolvedValueOnce({
      data: {
        success: false,
        error_code: "SURVEY_REFERENCE_INVALID",
        field: "transportModeId",
        table: "transport_modes",
      },
      error: null,
    });

    await expect(
      savePostCertificateSurveyTransaction({ touristId: "tourist-test", input })
    ).rejects.toBeInstanceOf(SurveyReferenceError);
  });

  it("does not expose a raw RPC error in its stable error code", async () => {
    serviceRoleMocks.rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "sensitive database detail" },
    });

    await expect(
      savePostCertificateSurveyTransaction({ touristId: "tourist-test", input })
    ).rejects.toThrow("SURVEY_TRANSACTION_FAILED");
  });
});
