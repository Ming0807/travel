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
  if (!params.expenseCategoryId && !params.spendingRangeId) {
    return;
  }

  const supabase = createSupabaseServiceRoleClient();
  const payload = {
    visit_id: params.visitId,
    expense_category_id: params.expenseCategoryId,
    spending_range_id: params.spendingRangeId,
    estimated_amount: null
  };

  const existing = await getVisitExpenseByVisitId(params.visitId);
  const query = existing
    ? supabase.from("visit_expenses").update(payload).eq("expense_id", existing.expense_id)
    : supabase.from("visit_expenses").insert(payload);

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to save visit expense: ${error.message}`);
  }
}
