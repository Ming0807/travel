import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SatisfactionDetailTable } from "@/components/dashboard/SatisfactionDetailTable";
import { ExportCsvButton } from "@/components/dashboard/ExportCsvButton";

function percentText(value: number | null) {
  return value === null ? "No data" : `${Math.round(value * 100)}%`;
}

export function SatisfactionSection({ data }: { data: DashboardViewModel }) {
  const hasDimensionData =
    data.satisfaction.safetyAverage !== null ||
    data.satisfaction.cleanlinessAverage !== null ||
    data.satisfaction.accessibilityAverage !== null ||
    data.satisfaction.informationAverage !== null ||
    data.satisfaction.valueAverage !== null ||
    data.satisfaction.facilityAverage !== null;

  const needsAttention =
    (data.satisfaction.safetyAverage !== null && data.satisfaction.safetyAverage < 3) ||
    (data.satisfaction.cleanlinessAverage !== null && data.satisfaction.cleanlinessAverage < 3) ||
    (data.satisfaction.accessibilityAverage !== null && data.satisfaction.accessibilityAverage < 3) ||
    (data.satisfaction.informationAverage !== null && data.satisfaction.informationAverage < 3) ||
    (data.satisfaction.valueAverage !== null && data.satisfaction.valueAverage < 3) ||
    (data.satisfaction.facilityAverage !== null && data.satisfaction.facilityAverage < 3);

  const hasByAttraction = data.satisfaction.byAttraction.length > 0;

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#073F37]">Satisfaction</h2>
          <p className="mt-1 text-sm text-slate-500">
            Optional survey responses only. Missing scores are excluded from
            averages. Dimension scores (safety, cleanliness, accessibility,
            information, and value) provide granular insight.
          </p>
        </div>
        <ExportCsvButton />
      </div>

      {/* Warning if dimension scores need attention */}
      {needsAttention && (
        <div className="rounded-2xl border border-amber-200/70 bg-amber-50 p-4 text-sm text-amber-800">
          <strong className="font-black">Dimension scores need attention:</strong>{" "}
          One or more dimension scores are below 3.0 / 5. Consider reviewing
          visitor experience at the affected areas.
        </div>
      )}

      {/* Core KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          metric={{
            key: "satisfaction_avg",
            label: "Average Satisfaction",
            value:
              data.satisfaction.averageOverall === null
                ? "No data"
                : `${data.satisfaction.averageOverall.toFixed(1)} / 5`,
            rawValue: data.satisfaction.averageOverall,
            valueType: "rating",
            definition:
              "Average overall satisfaction excludes null scores. No responses displays No data.",
            note: `${data.satisfaction.responseCount} responses`,
          }}
          index={0}
          sampleCount={data.satisfaction.responseCount}
          sampleLabel="satisfaction responses"
        />
        <KpiCard
          metric={{
            key: "revisit_rate",
            label: "Revisit Intention",
            value: percentText(data.satisfaction.revisitIntentionRate),
            rawValue: data.satisfaction.revisitIntentionRate,
            valueType: "percentage",
            definition:
              "Share of non-null revisit intention answers that are yes.",
          }}
          index={1}
          sampleCount={data.satisfaction.responseCount}
          sampleLabel="satisfaction responses"
        />
        <KpiCard
          metric={{
            key: "recommend_rate",
            label: "Recommendation Intention",
            value: percentText(data.satisfaction.recommendIntentionRate),
            rawValue: data.satisfaction.recommendIntentionRate,
            valueType: "percentage",
            definition:
              "Share of non-null recommendation intention answers that are yes.",
          }}
          index={2}
          sampleCount={data.satisfaction.responseCount}
          sampleLabel="satisfaction responses"
        />
      </div>

      {/* Dimension scores KPIs (if available) */}
      {hasDimensionData && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-slate-600 uppercase tracking-wider">
            Dimension scores
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              metric={{
                key: "safety_score",
                label: "Safety",
                value:
                  data.satisfaction.safetyAverage === null
                    ? "No data"
                    : `${data.satisfaction.safetyAverage.toFixed(1)} / 5`,
                rawValue: data.satisfaction.safetyAverage,
                valueType: "rating",
                definition: "Average safety score from optional survey responses.",
                note:
                  data.satisfaction.safetyAverage !== null
                    ? data.satisfaction.safetyAverage >= 4
                      ? "Good"
                      : data.satisfaction.safetyAverage >= 3
                        ? "Average"
                        : "Needs attention"
                    : undefined,
              }}
              index={3}
              sampleCount={data.satisfaction.responseCount}
              sampleLabel="satisfaction responses"
            />
            <KpiCard
              metric={{
                key: "cleanliness_score",
                label: "Cleanliness",
                value:
                  data.satisfaction.cleanlinessAverage === null
                    ? "No data"
                    : `${data.satisfaction.cleanlinessAverage.toFixed(1)} / 5`,
                rawValue: data.satisfaction.cleanlinessAverage,
                valueType: "rating",
                definition:
                  "Average cleanliness score from optional survey responses.",
                note:
                  data.satisfaction.cleanlinessAverage !== null
                    ? data.satisfaction.cleanlinessAverage >= 4
                      ? "Good"
                      : data.satisfaction.cleanlinessAverage >= 3
                        ? "Average"
                        : "Needs attention"
                    : undefined,
              }}
              index={4}
              sampleCount={data.satisfaction.responseCount}
              sampleLabel="satisfaction responses"
            />
            <KpiCard
              metric={{
                key: "accessibility_score",
                label: "Accessibility",
                value:
                  data.satisfaction.accessibilityAverage === null
                    ? "No data"
                    : `${data.satisfaction.accessibilityAverage.toFixed(1)} / 5`,
                rawValue: data.satisfaction.accessibilityAverage,
                valueType: "rating",
                definition:
                  "Average accessibility score from optional survey responses.",
                note:
                  data.satisfaction.accessibilityAverage !== null
                    ? data.satisfaction.accessibilityAverage >= 4
                      ? "Good"
                      : data.satisfaction.accessibilityAverage >= 3
                        ? "Average"
                        : "Needs attention"
                    : undefined,
              }}
              index={5}
              sampleCount={data.satisfaction.responseCount}
              sampleLabel="satisfaction responses"
            />
            <KpiCard
              metric={{
                key: "information_score",
                label: "Information",
                value:
                  data.satisfaction.informationAverage === null
                    ? "No data"
                    : `${data.satisfaction.informationAverage.toFixed(1)} / 5`,
                rawValue: data.satisfaction.informationAverage,
                valueType: "rating",
                definition:
                  "Average information and signage score from optional survey responses.",
                note:
                  data.satisfaction.informationAverage !== null
                    ? data.satisfaction.informationAverage >= 4
                      ? "Good"
                      : data.satisfaction.informationAverage >= 3
                        ? "Average"
                        : "Needs attention"
                    : undefined,
              }}
              index={6}
              sampleCount={data.satisfaction.responseCount}
              sampleLabel="satisfaction responses"
            />
            <KpiCard
              metric={{
                key: "value_score",
                label: "Value",
                value:
                  data.satisfaction.valueAverage === null
                    ? "No data"
                    : `${data.satisfaction.valueAverage.toFixed(1)} / 5`,
                rawValue: data.satisfaction.valueAverage,
                valueType: "rating",
                definition:
                  "Average value-for-money score from optional survey responses.",
                note:
                  data.satisfaction.valueAverage !== null
                    ? data.satisfaction.valueAverage >= 4
                      ? "Good"
                      : data.satisfaction.valueAverage >= 3
                        ? "Average"
                        : "Needs attention"
                    : undefined,
              }}
              index={7}
              sampleCount={data.satisfaction.responseCount}
              sampleLabel="satisfaction responses"
            />
            {data.satisfaction.facilityAverage !== null && (
              <KpiCard
                metric={{
                  key: "facility_score_legacy",
                  label: "Facility (legacy)",
                  value: `${data.satisfaction.facilityAverage.toFixed(1)} / 5`,
                  rawValue: data.satisfaction.facilityAverage,
                  valueType: "rating",
                  definition:
                    "Legacy facility score from early survey rows before accessibility/information/value dimensions were introduced.",
                  note:
                    data.satisfaction.facilityAverage >= 4
                      ? "Good"
                      : data.satisfaction.facilityAverage >= 3
                        ? "Average"
                        : "Needs attention",
                }}
                index={8}
                sampleCount={data.satisfaction.responseCount}
                sampleLabel="legacy satisfaction responses"
              />
            )}
          </div>
        </div>
      )}

      {/* Score distribution chart */}
      <BarChartCard
        data={data.satisfaction.distribution}
        definition="Overall satisfaction score distribution from non-null survey scores."
        emptyDescription="No satisfaction scores in selected filters."
        title="Satisfaction score distribution"
        sampleCount={data.satisfaction.responseCount}
        sampleLabel="satisfaction responses"
      />

      {/* Satisfaction by attraction table */}
      {hasByAttraction && (
        <SatisfactionDetailTable
          byAttraction={data.satisfaction.byAttraction}
          overallAverage={data.satisfaction.averageOverall}
          dimensionScores={{
            safetyAverage: data.satisfaction.safetyAverage,
            cleanlinessAverage: data.satisfaction.cleanlinessAverage,
            accessibilityAverage: data.satisfaction.accessibilityAverage,
            informationAverage: data.satisfaction.informationAverage,
            valueAverage: data.satisfaction.valueAverage,
            facilityAverage: data.satisfaction.facilityAverage,
          }}
        />
      )}
    </section>
  );
}
