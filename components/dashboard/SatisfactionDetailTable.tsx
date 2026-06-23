import type { RankedAttraction } from "@/types/dashboard";

function fmt(n: number): string {
  return n.toLocaleString("th-TH");
}

function rating(value: number | null): string {
  if (value === null) return "—";
  return value.toFixed(1);
}

type SatisfactionDetailTableProps = {
  byAttraction: RankedAttraction[];
  overallAverage: number | null;
  dimensionScores: {
    safetyAverage: number | null;
    cleanlinessAverage: number | null;
    accessibilityAverage: number | null;
    informationAverage: number | null;
    valueAverage: number | null;
    facilityAverage: number | null;
  };
};

export function SatisfactionDetailTable({
  byAttraction,
  overallAverage,
  dimensionScores,
}: SatisfactionDetailTableProps) {
  return (
    <section className="space-y-6">
      {/* Dimension scores table */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="mb-1 text-lg font-black text-slate-800">
          Dimension scores
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Average scores across satisfaction survey dimensions. Only non-null
          responses are included in averages.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4">Dimension</th>
                <th className="pb-3 pr-4 text-right">Score</th>
                <th className="pb-3 pr-4 text-right">Rating</th>
                <th className="pb-3 text-xs font-normal text-slate-400">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50 transition-colors hover:bg-slate-50/80">
                <td className="py-3 pr-4 font-semibold text-slate-800">
                  Overall
                </td>
                <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                  {rating(overallAverage)}
                </td>
                <td className="py-3 pr-4 text-right">
                  {overallAverage !== null ? (
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        overallAverage >= 4
                          ? "bg-emerald-50 text-emerald-700"
                          : overallAverage >= 3
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {overallAverage >= 4
                        ? "Good"
                        : overallAverage >= 3
                          ? "Average"
                          : "Needs attention"}
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="py-3 text-xs text-slate-400">
                  Average of all non-null overall satisfaction scores
                </td>
              </tr>
              {[
                { key: "safety", label: "Safety", value: dimensionScores.safetyAverage },
                { key: "cleanliness", label: "Cleanliness", value: dimensionScores.cleanlinessAverage },
                { key: "accessibility", label: "Accessibility", value: dimensionScores.accessibilityAverage },
                { key: "information", label: "Information", value: dimensionScores.informationAverage },
                { key: "value", label: "Value", value: dimensionScores.valueAverage },
                { key: "facility", label: "Facility (legacy)", value: dimensionScores.facilityAverage },
              ].map((dim) => (
                <tr
                  key={dim.key}
                  className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/80"
                >
                  <td className="py-3 pr-4 font-semibold text-slate-800">
                    {dim.label}
                  </td>
                  <td className="py-3 pr-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {rating(dim.value)}
                  </td>
                  <td className="py-3 pr-4 text-right">
                    {dim.value !== null ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          dim.value >= 4
                            ? "bg-emerald-50 text-emerald-700"
                            : dim.value >= 3
                              ? "bg-amber-50 text-amber-700"
                              : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {dim.value >= 4
                          ? "Good"
                          : dim.value >= 3
                            ? "Average"
                            : "Needs attention"}
                      </span>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="py-3 text-xs text-slate-400">
                    Average of non-null {dim.label.toLowerCase()} scores
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* By attraction table */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <h2 className="mb-1 text-lg font-black text-slate-800">
          Satisfaction by attraction
        </h2>
        <p className="mb-5 text-sm text-slate-500">
          Average satisfaction scores for attractions with at least one survey
          response. Visits without surveys are excluded.
        </p>

        {byAttraction.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            No satisfaction responses linked to specific attractions.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="pb-3 pr-4">Rank</th>
                  <th className="pb-3 pr-4">Attraction</th>
                  <th className="pb-3 pr-4">Province</th>
                  <th className="pb-3 pr-4 text-right">Avg score</th>
                  <th className="pb-3 pr-4 text-right">Responses</th>
                  <th className="pb-3 pr-4 text-right">Visits</th>
                  <th className="pb-3 text-right">Certificates</th>
                </tr>
              </thead>
              <tbody>
                {byAttraction.map((attr) => (
                  <tr
                    key={attr.attractionName}
                    className="border-b border-slate-50 last:border-0 transition-colors hover:bg-slate-50/80"
                  >
                    <td className="py-3 pr-4">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#073F37]/10 text-[11px] font-black text-[#073F37]">
                        {attr.rank}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-800">
                      {attr.attractionName}
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-500">
                      {attr.provinceName}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono font-bold tabular-nums">
                      {attr.averageSatisfaction !== null ? (
                        <span
                          className={
                            attr.averageSatisfaction >= 4
                              ? "text-emerald-600"
                              : attr.averageSatisfaction >= 3
                                ? "text-amber-600"
                                : "text-rose-600"
                          }
                        >
                          {attr.averageSatisfaction.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-500">
                      {fmt(attr.surveyResponseCount)}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-500">
                      {fmt(attr.visitCount)}
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-slate-500">
                      {fmt(attr.certificateCount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
