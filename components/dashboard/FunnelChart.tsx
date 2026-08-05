import { MetricTooltip } from "@/components/dashboard/MetricTooltip";
import { NoDataState } from "@/components/dashboard/NoDataState";
import type { FunnelStage } from "@/types/dashboard";

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

export function funnelStageLabel(stage: FunnelStage): string {
  return STAGE_LABELS[stage.key] ?? stage.label;
}

function validRate(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
}

function formatRate(value: number | null): string {
  const safeValue = validRate(value);
  return safeValue === null ? "ยังคำนวณไม่ได้" : `${Math.round(safeValue * 100)}%`;
}

export function FunnelChart({ stages }: { stages: FunnelStage[] }) {
  const peakCount = Math.max(...stages.map((stage) => stage.count), 0);

  return (
    <section aria-labelledby="funnel-chart-heading" className="min-w-0 rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900" id="funnel-chart-heading">เหตุการณ์ตามลำดับการใช้งาน</h3>
          <p className="mt-1 text-sm leading-6 text-slate-600">แต่ละแถวเป็นจำนวนเหตุการณ์ ไม่ใช่จำนวนบุคคลหรือรายการเข้าชม</p>
        </div>
        <MetricTooltip definition="อัตราผ่านและอัตราออกคำนวณเทียบกับขั้นก่อนหน้า เมื่อฐานเป็นศูนย์หรือข้อมูลผิดลำดับจะแสดงว่ายังคำนวณไม่ได้" />
      </div>

      {stages.length === 0 || peakCount === 0 ? (
        <div className="mt-4"><NoDataState description="ยังไม่มีเหตุการณ์เพียงพอสำหรับแสดงเส้นทางการใช้งาน" /></div>
      ) : (
        <ol className="mt-5 space-y-4">
          {stages.map((stage, index) => {
            const width = peakCount > 0 ? Math.max((stage.count / peakCount) * 100, stage.count > 0 ? 2 : 0) : 0;
            const conversion = index === 0 ? null : validRate(stage.conversionFromPrevious);
            const dropOff = index === 0 ? null : validRate(stage.dropOffFromPrevious);

            return (
              <li className="grid gap-2 sm:grid-cols-[minmax(170px,220px)_minmax(0,1fr)] sm:items-center" key={stage.key}>
                <div className="flex items-start gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#FFF0EA] text-xs font-bold text-[#B94727]">{index + 1}</span>
                  <div className="min-w-0"><p className="break-words text-sm font-semibold text-slate-800">{funnelStageLabel(stage)}</p><p className="text-xs text-slate-600">{stage.count.toLocaleString("th-TH")} เหตุการณ์</p></div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div aria-label={`${funnelStageLabel(stage)} ${stage.count.toLocaleString("th-TH")} เหตุการณ์`} className="h-3 min-w-0 flex-1 overflow-hidden rounded-sm bg-slate-100" role="img"><div className="h-full rounded-sm bg-[#B94727]" style={{ width: `${width}%` }} /></div>
                    <span className="w-12 shrink-0 text-right text-xs font-bold tabular-nums text-slate-700">{Math.round(width)}%</span>
                  </div>
                  {index > 0 ? <p className="mt-1.5 text-xs leading-5 text-slate-600">ผ่านจากขั้นก่อนหน้า {formatRate(conversion)} · ออกจากขั้นตอน {formatRate(dropOff)}</p> : <p className="mt-1.5 text-xs text-slate-500">ขั้นเริ่มต้นของชุดข้อมูลที่เลือก</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
