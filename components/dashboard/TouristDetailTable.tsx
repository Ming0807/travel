import type { DistributionItem } from "@/types/dashboard";

function fmt(n: number): string {
  return n.toLocaleString("th-TH");
}

function pct(value: number | null): string {
  if (value === null) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

function DetailSection({
  title,
  items,
  emptyMessage,
  colorBar = true,
}: {
  title: string;
  items: DistributionItem[];
  emptyMessage: string;
  colorBar?: boolean;
}) {
  if (items.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        <p className="text-xs text-slate-400 italic">{emptyMessage}</p>
      </div>
    );
  }

  const maxCount = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-bold text-slate-700">
        {title}
        <span className="ml-2 text-xs font-normal text-slate-400">
          ({items.length} unique)
        </span>
      </h3>
      <div className="overflow-hidden rounded-lg border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50 bg-slate-50/50 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-3 py-2">Label</th>
              <th className="px-3 py-2 text-right">Count</th>
              <th className="px-3 py-2 text-right">% of total</th>
              {colorBar && <th className="px-3 py-2 w-24 sr-only">Bar</th>}
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 15).map((item, i) => {
              const barWidth = maxCount > 0 ? (item.value / maxCount) * 100 : 0;
              return (
                <tr
                  key={item.label}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {item.label}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-900">
                    {fmt(item.value)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-500">
                    {pct(item.percent)}
                  </td>
                  {colorBar && (
                    <td className="px-3 py-2 w-24">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#0A6B62]/70 transition-all"
                          style={{ width: `${Math.min(barWidth, 100)}%` }}
                        />
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
            {items.length > 15 && (
              <tr className="border-t border-slate-100 bg-slate-50/30">
                <td
                  colSpan={colorBar ? 4 : 3}
                  className="px-3 py-2 text-center text-xs text-slate-400"
                >
                  +{items.length - 15} more items (showing top 15)
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

type TouristDetailTableProps = {
  originCountries: DistributionItem[];
  originProvinces: DistributionItem[];
  ageGroups: DistributionItem[];
  preferredLanguages: DistributionItem[];
  identityProviders: DistributionItem[];
};

export function TouristDetailTable({
  originCountries,
  originProvinces,
  ageGroups,
  preferredLanguages,
  identityProviders,
}: TouristDetailTableProps) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="mb-1 text-lg font-black text-slate-800">
        Demographic breakdown
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Full distribution details across all tracked demographic dimensions.
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        <DetailSection
          title="Origin Country"
          items={originCountries}
          emptyMessage="No origin country data."
        />
        <DetailSection
          title="Thai Origin Province"
          items={originProvinces}
          emptyMessage="No Thai origin province data."
        />
        <DetailSection
          title="Age Group"
          items={ageGroups}
          emptyMessage="No age group data."
        />
        <DetailSection
          title="Preferred Language"
          items={preferredLanguages}
          emptyMessage="No language data."
        />
        <div className="md:col-span-2">
          <DetailSection
            title="Identity Provider"
            items={identityProviders}
            emptyMessage="No identity provider data."
          />
        </div>
      </div>
    </section>
  );
}
