import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ExpenseDetailTable } from "@/components/dashboard/ExpenseDetailTable";
import { formatEstimatedSpending } from "@/lib/services/dashboard-math";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";
import { Info, WarningCircle } from "@phosphor-icons/react/dist/ssr";

export function ExpenseSection({ data }: { data: DashboardViewModel }) {
  const hasSpendingData = data.expense.responseCount > 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#073F37]">
            Expense and estimated spending
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Self-reported range-based estimates only. This section must never be
            read as revenue. Data comes from optional survey responses.
          </p>
        </div>
        <ExportCsvButton />
      </div>

      {/* Methodology info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-violet-200/70 bg-violet-50 p-4 text-sm leading-6 text-violet-800">
        <Info size={20} weight="fill" className="mt-0.5 shrink-0 text-violet-500" />
        <div>
          <strong className="font-black">Data methodology:</strong>{" "}
          {data.expense.methodologyNote}
        </div>
      </div>

      {/* Low sample warning */}
      {hasSpendingData && data.expense.responseCount < 10 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200/70 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          <WarningCircle size={20} weight="fill" className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <strong className="font-black">Small sample:</strong> Only{" "}
            {data.expense.responseCount} expense responses recorded.
            Estimates may not be representative.
          </div>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          metric={{
            key: "expense_estimate",
            label: "Estimated Spending",
            value: formatEstimatedSpending(
              data.expense.estimatedMin,
              data.expense.estimatedMax,
              data.expense.hasOpenEndedRange
            ),
            rawValue: data.expense.estimatedMin,
            valueType: "currency_range",
            definition:
              "Estimated spending uses min/max values from selected spending ranges. It is not verified revenue.",
            note: `${data.expense.responseCount} survey expense responses`,
          }}
          index={0}
          sampleCount={data.expense.responseCount}
          sampleLabel="expense responses"
        />
        <KpiCard
          metric={{
            key: "expense_min",
            label: "Min estimate (sum of mins)",
            value:
              data.expense.estimatedMin === null
                ? "No data"
                : `${data.expense.estimatedMin.toLocaleString("th-TH")} THB`,
            rawValue: data.expense.estimatedMin,
            valueType: "currency_range",
            definition:
              "Sum of minimum values of all selected spending ranges. Lower bound of estimated spending.",
          }}
          index={1}
          sampleCount={data.expense.responseCount}
          sampleLabel="expense responses"
        />
        <KpiCard
          metric={{
            key: "expense_max",
            label: "Max estimate (sum of maxs)",
            value:
              data.expense.estimatedMax === null
                ? data.expense.hasOpenEndedRange
                  ? "Open-ended range"
                  : "No data"
                : `${data.expense.estimatedMax.toLocaleString("th-TH")} THB`,
            rawValue: data.expense.estimatedMax,
            valueType: "currency_range",
            definition:
              "Sum of maximum values of selected spending ranges. May be open-ended if range has no upper limit.",
          }}
          index={2}
          sampleCount={data.expense.responseCount}
          sampleLabel="expense responses"
        />
      </div>

      {/* Charts grid */}
      <div className="grid gap-5 xl:grid-cols-2">
        <BarChartCard
          data={data.expense.spendingRanges}
          definition={data.expense.methodologyNote}
          emptyDescription="No spending range responses in selected filters."
          title="Spending range distribution"
          sampleCount={data.expense.responseCount}
          sampleLabel="expense responses"
        />
        <BarChartCard
          data={data.expense.expenseCategories}
          definition="Expense category distribution if respondents selected a category."
          emptyDescription="No expense category responses in selected filters."
          title="Expense categories"
          sampleCount={data.expense.responseCount}
          sampleLabel="expense responses"
        />
      </div>

      {/* Detail table */}
      {hasSpendingData && (
        <ExpenseDetailTable
          spendingRanges={data.expense.spendingRanges}
          expenseCategories={data.expense.expenseCategories}
          estimatedMin={data.expense.estimatedMin}
          estimatedMax={data.expense.estimatedMax}
          responseCount={data.expense.responseCount}
        />
      )}
    </section>
  );
}
