import { beforeEach, describe, expect, it, vi } from "vitest";

const queryMocks = vi.hoisted(() => ({
  from: vi.fn(),
  upsert: vi.fn(),
  delete: vi.fn(),
  eq: vi.fn(),
}));

vi.mock("@/lib/supabase/service-role", () => ({
  createSupabaseServiceRoleClient: () => ({ from: queryMocks.from }),
}));

import { upsertVisitExpense } from "@/lib/repositories/expense.repository";

describe("visit expense repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryMocks.from.mockReturnValue({
      upsert: queryMocks.upsert,
      delete: queryMocks.delete,
    });
    queryMocks.upsert.mockResolvedValue({ error: null });
    queryMocks.delete.mockReturnValue({ eq: queryMocks.eq });
    queryMocks.eq.mockResolvedValue({ error: null });
  });

  it("uses the visit_id unique key for an idempotent database upsert", async () => {
    await upsertVisitExpense({
      visitId: "visit-test",
      expenseCategoryId: 3,
      spendingRangeId: 4,
    });

    expect(queryMocks.from).toHaveBeenCalledWith("visit_expenses");
    expect(queryMocks.upsert).toHaveBeenCalledWith(
      {
        visit_id: "visit-test",
        expense_category_id: 3,
        spending_range_id: 4,
        estimated_amount: null,
      },
      { onConflict: "visit_id" }
    );
  });

  it("removes an existing optional expense answer when both values are cleared", async () => {
    await upsertVisitExpense({
      visitId: "visit-test",
      expenseCategoryId: null,
      spendingRangeId: null,
    });

    expect(queryMocks.delete).toHaveBeenCalledTimes(1);
    expect(queryMocks.eq).toHaveBeenCalledWith("visit_id", "visit-test");
    expect(queryMocks.upsert).not.toHaveBeenCalled();
  });
});
