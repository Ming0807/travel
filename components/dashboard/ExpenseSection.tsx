import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { formatEstimatedSpending } from "@/lib/services/dashboard-math";

export function ExpenseSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-[#073F37]">Expense and estimated spending</h2>
        <p className="mt-1 text-sm text-slate-500">Self-reported range-based estimates only. This section must never be read as revenue.</p>
      </div>
      <KpiCard
        metric={{
          key: "expense_estimate",
          label: "Estimated Spending",
          value: formatEstimatedSpending(data.expense.estimatedMin, data.expense.estimatedMax, data.expense.hasOpenEndedRange),
          rawValue: data.expense.estimatedMin,
          valueType: "currency_range",
          definition: "Estimated spending uses min/max values from selected spending ranges. It is not verified revenue.",
          note: `${data.expense.responseCount} survey expense responses`
        }}
      />
      <div className="grid gap-5 xl:grid-cols-2">
        <BarChartCard data={data.expense.spendingRanges} definition={data.expense.methodologyNote} emptyDescription="No spending range responses in selected filters." title="Spending range distribution" />
        <BarChartCard data={data.expense.expenseCategories} definition="Expense category distribution if respondents selected a category." emptyDescription="No expense category responses in selected filters." title="Expense categories" />
      </div>
    </section>
  );
}
