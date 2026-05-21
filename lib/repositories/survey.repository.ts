import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

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

  const existing = await getSatisfactionSurveyByVisitId(params.visitId);
  const query = existing
    ? supabase.from("satisfaction_surveys").update(payload).eq("visit_id", params.visitId)
    : supabase.from("satisfaction_surveys").insert(payload);

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to save survey: ${error.message}`);
  }
}
