import type { PassportProvinceProgress } from "@/lib/services/passport.service";

export function ProvinceProgress({ progress }: { progress: PassportProvinceProgress[] }) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-card">
      <h2 className="text-xl font-black text-ink">ความคืบหน้าตามจังหวัด</h2>
      <div className="mt-4 space-y-4">
        {progress.map((item) => {
          const percent = item.totalCount > 0 ? Math.min(100, Math.round((item.earnedCount / item.totalCount) * 100)) : 0;
          return (
            <div key={item.provinceName}>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-ink">{item.provinceName}</span>
                <span className="font-semibold text-muted">
                  {item.earnedCount}
                  {item.totalCount ? ` / ${item.totalCount}` : ""} stamps
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-tealSoft">
                <div className="h-full rounded-full bg-gradient-to-r from-teal to-gold" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
