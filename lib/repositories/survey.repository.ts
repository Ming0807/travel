import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export class SurveyReferenceError extends Error {
  constructor(
    public readonly field: string,
    public readonly table: string
  ) {
    super("SURVEY_REFERENCE_INVALID");
    this.name = "SurveyReferenceError";
  }
}

type SurveyReferenceInput = {
  travelCompanionId: number | null;
  transportModeId: number | null;
  travelPurposeId: number | null;
  expenseCategoryId: number | null;
  spendingRangeId: number | null;
};

type SurveyReferenceCheck = {
  field: keyof SurveyReferenceInput;
  table:
    | "travel_companions"
    | "transport_modes"
    | "travel_purposes"
    | "expense_categories"
    | "spending_ranges";
  idColumn:
    | "travel_companion_id"
    | "transport_mode_id"
    | "travel_purpose_id"
    | "expense_category_id"
    | "spending_range_id";
  value: number | null;
};

const SURVEY_REFERENCE_CHECKS: Omit<SurveyReferenceCheck, "value">[] = [
  { field: "travelCompanionId", table: "travel_companions", idColumn: "travel_companion_id" },
  { field: "transportModeId", table: "transport_modes", idColumn: "transport_mode_id" },
  { field: "travelPurposeId", table: "travel_purposes", idColumn: "travel_purpose_id" },
  { field: "expenseCategoryId", table: "expense_categories", idColumn: "expense_category_id" },
  { field: "spendingRangeId", table: "spending_ranges", idColumn: "spending_range_id" }
];

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

export async function assertActiveSurveyReferences(input: SurveyReferenceInput) {
  const supabase = createSupabaseServiceRoleClient();
  const checks = SURVEY_REFERENCE_CHECKS
    .map((check) => ({ ...check, value: input[check.field] }))
    .filter((check): check is SurveyReferenceCheck => check.value !== null);

  await Promise.all(
    checks.map(async (check) => {
      const { data, error } = await supabase
        .from(check.table)
        .select(check.idColumn)
        .eq(check.idColumn, check.value)
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to validate survey reference ${check.field}: ${error.message}`);
      }

      if (!data) {
        throw new SurveyReferenceError(check.field, check.table);
      }
    })
  );
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

export async function upsertSatisfactionSurvey(params: {
  visitId: string;
  touristId: string;
  attractionId: number;
  overallScore: number | null;
  safetyScore: number | null;
  cleanlinessScore: number | null;
  accessibilityScore: number | null;
  informationScore: number | null;
  valueScore: number | null;
  revisitIntention: "yes" | "maybe" | "no" | null;
  recommendIntention: "yes" | "maybe" | "no" | null;
  comment: string | null;
}) {
  const supabase = createSupabaseServiceRoleClient();
  const payload = {
    visit_id: params.visitId,
    tourist_id: params.touristId,
    attraction_id: params.attractionId,
    overall_score: params.overallScore,
    safety_score: params.safetyScore,
    cleanliness_score: params.cleanlinessScore,
    accessibility_score: params.accessibilityScore,
    information_score: params.informationScore,
    value_score: params.valueScore,
    revisit_intention: params.revisitIntention,
    recommend_intention: params.recommendIntention,
    comments: params.comment,
    completed_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from("satisfaction_surveys")
    .upsert(payload, { onConflict: "visit_id" });

  if (error) {
    throw new Error(`Failed to save survey: ${error.message}`);
  }
}
