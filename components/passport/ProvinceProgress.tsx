import type { PassportProvinceProgress } from "@/lib/services/passport.service";

export function ProvinceProgress({ progress }: { progress: PassportProvinceProgress[] }) {
  if (progress.length === 0) return null;

  return (
    <section className="passport-provinces" aria-labelledby="province-progress-title">
      <h2 id="province-progress-title">ตราประทับตามจังหวัด</h2>
      <p>นับเฉพาะจุดสะสมที่เปิดใช้งาน</p>
      <div>
        {progress.map((item) => {
          const percent = item.totalCount > 0 ? Math.min(100, Math.round((item.earnedCount / item.totalCount) * 100)) : 0;
          return (
            <div key={item.provinceName} className="passport-province">
              <div>
                <span>{item.provinceName}</span>
                <span>
                  {item.totalCount > 0 ? `${item.earnedCount} จาก ${item.totalCount} ตรา` : "ยังไม่มีจุดสะสม"}
                </span>
              </div>
              <div
                className="passport-province-track"
                role="progressbar"
                aria-label={`ความคืบหน้าจังหวัด${item.provinceName}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
              >
                <div style={{ width: `${percent}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
