import type { PassportProvinceProgress } from "@/lib/services/passport.service";

export function ProvinceProgress({ progress }: { progress: PassportProvinceProgress[] }) {
  return (
    <section className="rounded-[1.5rem] bg-white p-6 shadow-sm border border-ink/5">
      <h2 className="text-xl font-black text-ink mb-6">ความคืบหน้าตามจังหวัด</h2>
      <div className="space-y-5">
        {progress.map((item) => {
          const percent = item.totalCount > 0 ? Math.min(100, Math.round((item.earnedCount / item.totalCount) * 100)) : 0;
          return (
            <div key={item.provinceName}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-ink">{item.provinceName}</span>
                <span className="font-semibold text-muted text-xs">
                  {item.earnedCount}
                  {item.totalCount ? ` / ${item.totalCount}` : ""} stamps
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-[#FAF3EE]">
                <div className="h-full rounded-full bg-[#E18868] transition-all duration-1000" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
