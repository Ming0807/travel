import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { PostCertificateSurveyInput } from "@/lib/validation/survey";

export class SurveyReferenceError extends Error {
  constructor(
    public readonly field: string,
    public readonly table: string
  ) {
    super("SURVEY_REFERENCE_INVALID");
    this.name = "SurveyReferenceError";
  }
}

export async function getSurveyOptions() {
  const supabase = createSupabaseServiceRoleClient();
  const [companions, transportModes, travelPurposes, expenseCategories, spendingRanges] = await Promise.all([
    supabase.from("travel_companions").select("*").eq("is_active", true).order("display_order"),
    supabase.from("transport_modes").select("*").eq("is_active", true).order("display_order"),
    supabase.from("travel_purposes").select("*").eq("is_active", true).order("display_order"),
    supabase.from("expense_categories").select("*").eq("is_active", true).order("display_order"),
    supabase.from("spending_ranges").select("*").eq("is_active", true).order("display_order")
  ]);

  for (const result of [companions, transportModes, travelPurposes, expenseCategories, spendingRanges]) {
    if (result.error) {
      throw new Error(`Failed to fetch survey options: ${result.error.message}`);
    }
  }

  return {
    travelCompanions: companions.data || [],
    transportModes: transportModes.data || [],
    travelPurposes: travelPurposes.data || [],
    expenseCategories: expenseCategories.data || [],
    spendingRanges: spendingRanges.data || []
  };
}

type SurveyTransactionResult = {
  success: boolean;
  error_code?: string;
  field?: string;
  table?: string;
};

function asSurveyTransactionResult(value: unknown): SurveyTransactionResult | null {
  if (!value || typeof value !== "object" || !("success" in value)) return null;
  return value as SurveyTransactionResult;
}

export async function savePostCertificateSurveyTransaction(params: {
  touristId: string;
  input: PostCertificateSurveyInput;
}) {
  const { input } = params;
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase.rpc("submit_post_certificate_survey", {
    p_visit_id: input.visitId,
    p_tourist_id: params.touristId,
    p_travel_companion_id: input.travelCompanionId,
    p_group_size: input.groupSize,
    p_transport_mode_id: input.transportModeId,
    p_travel_purpose_id: input.travelPurposeId,
    p_overnight_status: input.overnightStatus,
    p_nights_count: input.nightsCount,
    p_expense_category_id: input.expenseCategoryId,
    p_spending_range_id: input.spendingRangeId,
    p_overall_score: input.overallSatisfaction,
    p_safety_score: input.safetyScore,
    p_cleanliness_score: input.cleanlinessScore,
    p_accessibility_score: input.accessibilityScore,
    p_information_score: input.informationScore,
    p_value_score: input.valueScore,
    p_revisit_intention: input.revisitIntention,
    p_recommend_intention: input.recommendIntention,
    p_comment: input.optionalComment,
  });

  if (error) {
    throw new Error("SURVEY_TRANSACTION_FAILED");
  }

  const result = asSurveyTransactionResult(data);
  if (result?.success) return;

  if (result?.error_code === "SURVEY_REFERENCE_INVALID") {
    throw new SurveyReferenceError(result.field ?? "unknown", result.table ?? "unknown");
  }

  throw new Error(result?.error_code ?? "SURVEY_TRANSACTION_FAILED");
}

export async function getSatisfactionSurveyByVisitId(visitId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("satisfaction_surveys")
    .select("*")
    .eq("visit_id", visitId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch survey: ${error.message}`);
  }

  return data || null;
}
