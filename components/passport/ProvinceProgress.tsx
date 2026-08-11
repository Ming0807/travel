import type { PassportProvinceProgress } from "@/lib/services/passport.service";

export function ProvinceProgress({ progress }: { progress: PassportProvinceProgress[] }) {
  if (progress.length === 0) return null;

  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5 sm:p-6" aria-labelledby="province-progress-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-coral">ความคืบหน้า</p>
          <h2 id="province-progress-title" className="mt-1 text-xl font-black text-ink">
            ตราประทับตามจังหวัด
          </h2>
        </div>
        <p className="text-xs text-muted">นับเฉพาะจุดสะสมที่เปิดใช้งาน</p>
      </div>
      <div className="space-y-5">
        {progress.map((item) => {
          const percent = item.totalCount > 0 ? Math.min(100, Math.round((item.earnedCount / item.totalCount) * 100)) : 0;
          return (
            <div key={item.provinceName}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-bold text-ink">{item.provinceName}</span>
                <span className="text-xs font-semibold text-muted">
                  {item.totalCount > 0 ? `${item.earnedCount} จาก ${item.totalCount} ตรา` : "ยังไม่มีจุดสะสม"}
                </span>
              </div>
              <div
                className="h-2 overflow-hidden rounded-sm bg-ink/[0.08]"
                role="progressbar"
                aria-label={`ความคืบหน้าจังหวัด${item.provinceName}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div className="h-full bg-teal" style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
