import "server-only";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";

export async function getVisitExpenseByVisitId(visitId: string) {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("visit_expenses")
    .select("*")
    .eq("visit_id", visitId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch visit expense: ${error.message}`);
  }

  return data || null;
}

export async function upsertVisitExpense(params: {
  visitId: string;
  expenseCategoryId: number | null;
  spendingRangeId: number | null;
}) {
  const supabase = createSupabaseServiceRoleClient();

  if (!params.expenseCategoryId && !params.spendingRangeId) {
    const { error } = await supabase
      .from("visit_expenses")
      .delete()
      .eq("visit_id", params.visitId);

    if (error) {
      throw new Error(`Failed to clear visit expense: ${error.message}`);
    }
    return;
  }

  const payload = {
    visit_id: params.visitId,
    expense_category_id: params.expenseCategoryId,
    spending_range_id: params.spendingRangeId,
    estimated_amount: null
  };

  const { error } = await supabase
    .from("visit_expenses")
    .upsert(payload, { onConflict: "visit_id" });

  if (error) {
    throw new Error(`Failed to save visit expense: ${error.message}`);
  }
}
