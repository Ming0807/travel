import type { DistributionItem } from "@/types/dashboard";

function fmt(n: number): string {
  return n.toLocaleString("th-TH");
}

function pct(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

type ExpenseDetailTableProps = {
  spendingRanges: DistributionItem[];
  expenseCategories: DistributionItem[];
  estimatedMin: number | null;
  estimatedMax: number | null;
  responseCount: number;
};

export function ExpenseDetailTable({
  spendingRanges,
  expenseCategories,
  estimatedMin,
  estimatedMax,
  responseCount,
}: ExpenseDetailTableProps) {
  const maxRange = Math.max(...spendingRanges.map((i) => i.value), 1);
  const maxCategory = Math.max(...expenseCategories.map((i) => i.value), 1);

  return (
    <section className="space-y-6">
      {/* Spending ranges table */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="mb-1 text-lg font-black text-slate-800">
          Spending range details
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Distribution of self-reported spending ranges from optional survey
          responses. {responseCount} total expense responses.
        </p>

        {spendingRanges.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No spending range data available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Spending range</th>
                  <th className="pb-3 pr-4 text-right">Responses</th>
                  <th className="pb-3 pr-4 text-right">% of total</th>
                  <th className="pb-3 w-40">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {spendingRanges.slice(0, 10).map((item) => {
                  const barWidth = maxRange > 0
                    ? (item.value / maxRange) * 100
                    : 0;
                  return (
                    <tr
                      key={item.label}
                      className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/80"
                    >
                      <td className="py-3 pr-4 font-semibold text-slate-800">
                        {item.label}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {fmt(item.value)}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-500">
                        {pct(item.percent)}
                      </td>
                      <td className="py-3">
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-violet-500/70 transition-all"
                            style={{ width: `${Math.min(barWidth, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {spendingRanges.length > 10 && (
                  <tr className="border-t border-slate-100 bg-slate-50/30">
                    <td
                      colSpan={4}
                      className="px-3 py-2 text-center text-xs text-slate-400"
                    >
                      +{spendingRanges.length - 10} more items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense categories table */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="mb-1 text-lg font-black text-slate-800">
          Expense category details
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Breakdown of expense categories selected by respondents.
        </p>

        {expenseCategories.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No expense category data available.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Category</th>
                  <th className="pb-3 pr-4 text-right">Responses</th>
                  <th className="pb-3 pr-4 text-right">% of total</th>
                  <th className="pb-3 w-40">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {expenseCategories.slice(0, 10).map((item) => {
                  const barWidth = maxCategory > 0
                    ? (item.value / maxCategory) * 100
                    : 0;
                  return (
                    <tr
                      key={item.label}
                      className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/80"
                    >
                      <td className="py-3 pr-4 font-semibold text-slate-800">
                        {item.label}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        {fmt(item.value)}
                      </td>
                      <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-500">
                        {pct(item.percent)}
                      </td>
                      <td className="py-3">
                        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-[#0A6B62]/70 transition-all"
                            style={{ width: `${Math.min(barWidth, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {expenseCategories.length > 10 && (
                  <tr className="border-t border-slate-100 bg-slate-50/30">
                    <td
                      colSpan={4}
                      className="px-3 py-2 text-center text-xs text-slate-400"
                    >
                      +{expenseCategories.length - 10} more items
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estimated spending summary */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="mb-1 text-lg font-black text-slate-800">
          Spending estimates
        </h2>
        <p className="mb-4 text-sm text-slate-500">
          Aggregate estimates derived from range-based self-reports.
        </p>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Estimated min
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800 tabular-nums">
              {estimatedMin !== null
                ? `${estimatedMin.toLocaleString("th-TH")} THB`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Estimated max
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800 tabular-nums">
              {estimatedMax !== null
                ? `${estimatedMax.toLocaleString("th-TH")} THB`
                : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total responses
            </p>
            <p className="mt-1 text-2xl font-black text-slate-800 tabular-nums">
              {fmt(responseCount)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
