import { funnelStageLabel } from "@/components/dashboard/FunnelChart";
import type { FunnelStage } from "@/types/dashboard";

function validRate(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
}

function formatPercent(value: number | null): string {
  const safeValue = validRate(value);
  return safeValue === null ? "ยังคำนวณไม่ได้" : `${(safeValue * 100).toFixed(1)}%`;
}

export function FunnelDetailTable({ stages, selectedStageKey, onSelectStage }: { stages: FunnelStage[]; selectedStageKey?: string | null; onSelectStage?: (key: string | null) => void }) {
  const peakCount = Math.max(...stages.map((stage) => stage.count), 0);
  const visibleStages = selectedStageKey ? stages.filter((stage) => stage.key === selectedStageKey) : stages;
  const selectedStage = stages.find((stage) => stage.key === selectedStageKey);

  return (
    <section aria-labelledby="funnel-detail-heading" className="space-y-3">
      <div>
        <h3 className="text-base font-bold text-slate-900" id="funnel-detail-heading">ตารางตรวจสอบเส้นทางการใช้งาน</h3>
        <p className="mt-1 text-sm text-slate-600">ใช้ตรวจจำนวนเหตุการณ์ นิยาม และอัตราระหว่างขั้น โดยไม่อนุมานว่าเป็นจำนวนผู้ใช้ไม่ซ้ำ</p>
      </div>
      <div className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
        {selectedStage ? <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-200 bg-orange-50 px-4 py-2 text-xs text-orange-950"><strong>กำลังดูเฉพาะ {funnelStageLabel(selectedStage)}</strong><button className="min-h-8 px-2 font-bold underline underline-offset-2" onClick={() => onSelectStage?.(null)} type="button">แสดงทั้งหมด</button></div> : null}
        <div className="overflow-x-auto">
          <table aria-label="รายละเอียดเหตุการณ์แต่ละขั้น" className="w-full min-w-[760px] text-sm">
            <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600"><th className="px-4 py-3">ขั้นตอน</th><th className="px-4 py-3 text-right">เหตุการณ์</th><th className="px-4 py-3 text-right">เทียบขั้นสูงสุด</th><th className="px-4 py-3 text-right">อัตราผ่าน</th><th className="px-4 py-3 text-right">อัตราออก</th><th className="px-4 py-3">นิยาม</th></tr></thead>
            <tbody>
              {stages.length === 0 ? (
                <tr><td className="px-4 py-8 text-center text-slate-600" colSpan={6}>ยังไม่มีเหตุการณ์สำหรับตัวกรองที่เลือก</td></tr>
              ) : visibleStages.map((stage) => {
                const index = stages.findIndex((item) => item.key === stage.key);
                const shareOfPeak = peakCount > 0 ? stage.count / peakCount : null;
                return (
                  <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50" key={stage.key}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#FFF0EA] text-xs font-bold text-[#B94727]">{index + 1}</span><span className="font-semibold text-slate-800">{funnelStageLabel(stage)}</span></div></td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-900">{stage.count.toLocaleString("th-TH")}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatPercent(shareOfPeak)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-emerald-700">{index === 0 ? "ยังคำนวณไม่ได้" : formatPercent(stage.conversionFromPrevious)}</td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums text-rose-700">{index === 0 ? "ยังคำนวณไม่ได้" : formatPercent(stage.dropOffFromPrevious)}</td>
                    <td className="max-w-xs px-4 py-3 text-xs leading-5 text-slate-600">{stage.definition}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
