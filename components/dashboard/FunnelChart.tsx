import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { NoDataState } from "@/components/dashboard/NoDataState";
import type { FunnelStage } from "@/types/dashboard";

function percentage(value: number | null): string {
  return value === null ? "ยังคำนวณไม่ได้" : `${Math.round(value * 100)}%`;
}

const STAGE_LABELS: Record<string, string> = {
  qr_scanned: "สแกน QR",
  landing_viewed: "เปิดหน้าเช็กอิน",
  certificate_started: "เริ่มรับใบประกาศ",
  minimal_form_completed: "ส่งข้อมูลขั้นต่ำ",
  photo_uploaded: "อัปโหลดรูปสำเร็จ",
  certificate_generated: "สร้างใบประกาศสำเร็จ",
  survey_started: "เปิดแบบสำรวจ",
  survey_completed: "ส่งแบบสำรวจสำเร็จ",
  passport_saved: "บันทึกพาสปอร์ต",
};

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const firstCount = stages[0]?.count ?? 0;

  return (
    <section className="min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">เส้นทางจาก QR ถึงแบบสำรวจ</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">เป็นจำนวนเหตุการณ์ในแต่ละขั้น ไม่ใช่จำนวนบุคคลหรือรายการเข้าชม</p>
        </div>
        <MetricTooltip definition="อัตราผ่านขั้นตอนคำนวณจากจำนวนเหตุการณ์ของขั้นปัจจุบันเทียบกับขั้นก่อนหน้า หากฐานเป็นศูนย์จะแสดงว่ายังคำนวณไม่ได้" />
      </div>

      {stages.length === 0 || firstCount === 0 ? (
        <div className="mt-4"><NoDataState description="ยังไม่มีเหตุการณ์เพียงพอสำหรับแสดงเส้นทางการใช้งาน" /></div>
      ) : (
        <ol className="mt-5 space-y-3">
          {stages.map((stage, index) => {
            const width = firstCount > 0 ? Math.max((stage.count / firstCount) * 100, stage.count > 0 ? 2 : 0) : 0;
            return (
              <li key={stage.key} className="grid gap-2 sm:grid-cols-[minmax(150px,220px)_1fr] sm:items-center">
                <div className="flex items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FFF0EA] text-xs font-bold text-[#B94727]">{index + 1}</span>
                  <div className="min-w-0"><p className="break-words text-sm font-semibold text-slate-800">{STAGE_LABELS[stage.key] ?? stage.label}</p><p className="text-xs text-slate-500">{stage.count.toLocaleString("th-TH")} เหตุการณ์</p></div>
                </div>
                <div>
                  <div className="h-8 overflow-hidden rounded-md bg-slate-100"><div className="flex h-full min-w-0 items-center justify-end bg-[#B94727] px-2 text-xs font-bold text-white" style={{ width: `${width}%` }}>{Math.round(width)}%</div></div>
                  {index > 0 ? <p className="mt-1 text-xs text-slate-500">ผ่านจากขั้นก่อนหน้า {percentage(stage.conversionFromPrevious)} · ออกจากขั้นตอน {percentage(stage.dropOffFromPrevious)}</p> : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {stages.length > 0 ? (
        <details className="mt-5 border-t border-slate-100 pt-3">
          <summary className="cursor-pointer text-xs font-semibold text-[#B94727]">ดูตารางรายละเอียดทุกขั้น</summary>
          <div className="mt-2 overflow-x-auto"><table className="w-full min-w-[640px] text-sm"><thead><tr className="border-b border-slate-200 text-left text-xs text-slate-500"><th className="py-2 pr-4">ขั้นตอน</th><th className="py-2 pr-4 text-right">เหตุการณ์</th><th className="py-2 pr-4 text-right">อัตราผ่าน</th><th className="py-2 text-right">อัตราออก</th></tr></thead><tbody>{stages.map((stage) => <tr key={`table-${stage.key}`} className="border-b border-slate-100"><td className="py-2 pr-4">{STAGE_LABELS[stage.key] ?? stage.label}</td><td className="py-2 pr-4 text-right tabular-nums">{stage.count.toLocaleString("th-TH")}</td><td className="py-2 pr-4 text-right">{percentage(stage.conversionFromPrevious)}</td><td className="py-2 text-right">{percentage(stage.dropOffFromPrevious)}</td></tr>)}</tbody></table></div>
        </details>
      ) : null}
    </section>
  );
}
