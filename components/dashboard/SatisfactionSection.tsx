import type { DashboardViewModel } from "@/types/dashboard";
import { BarChartCard } from "@/components/dashboard/BarChartCard";
import { KpiCard } from "@/components/dashboard/KpiCard";

function percentText(value: number | null) {
  return value === null ? "No data" : `${Math.round(value * 100)}%`;
}

export function SatisfactionSection({ data }: { data: DashboardViewModel }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-black text-[#073F37]">Satisfaction</h2>
        <p className="mt-1 text-sm text-slate-500">Optional survey responses only. Missing scores are excluded from averages.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard
          metric={{
            key: "satisfaction_avg",
            label: "Average Satisfaction",
            value: data.satisfaction.averageOverall === null ? "No data" : `${data.satisfaction.averageOverall.toFixed(1)} / 5`,
            rawValue: data.satisfaction.averageOverall,
            valueType: "rating",
            definition: "Average overall satisfaction excludes null scores. No responses displays No data.",
            note: `${data.satisfaction.responseCount} responses`
          }}
        />
        <KpiCard
          metric={{
            key: "revisit_rate",
            label: "Revisit Intention",
            value: percentText(data.satisfaction.revisitIntentionRate),
            rawValue: data.satisfaction.revisitIntentionRate,
            valueType: "percentage",
            definition: "Share of non-null revisit intention answers that are yes."
          }}
        />
        <KpiCard
          metric={{
            key: "recommend_rate",
            label: "Recommendation Intention",
            value: percentText(data.satisfaction.recommendIntentionRate),
            rawValue: data.satisfaction.recommendIntentionRate,
            valueType: "percentage",
            definition: "Share of non-null recommendation intention answers that are yes."
          }}
        />
      </div>
      <BarChartCard data={data.satisfaction.distribution} definition="Overall satisfaction score distribution from non-null survey scores." emptyDescription="No satisfaction scores in selected filters." title="Satisfaction score distribution" />
    </section>
  );
}
