import { Scales, WarningCircle } from "@phosphor-icons/react/dist/ssr";

import type { DashboardViewModel } from "@/types/dashboard";

type Comparison = NonNullable<DashboardViewModel["satisfaction"]["ageGroupComparison"]>;

export function SatisfactionSegmentComparison({ comparison }: { comparison: Comparison }) {
  const ready = comparison.status === "ready" && comparison.groups.length === 2;

  return (
    <section className="border border-slate-200 bg-white p-4 sm:p-5" aria-labelledby="age-segment-comparison-heading">
      <div className="flex items-start gap-3 border-b border-slate-100 pb-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-sky-50 text-sky-800"><Scales aria-hidden="true" size={20} weight="bold" /></span>
        <div>
          <h2 className="font-black text-slate-950" id="age-segment-comparison-heading">เปรียบเทียบประสบการณ์ตามช่วงอายุ</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600">เปรียบเทียบสองช่วงอายุที่มีคำตอบคะแนนภาพรวมมากที่สุดในตัวกรองเดียวกัน</p>
        </div>
      </div>

      {ready ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {comparison.groups.map((group) => (
            <div className="border-l-4 border-[#0A6B62] bg-slate-50 px-4 py-3" key={group.label}>
              <div className="flex items-end justify-between gap-3"><strong className="text-slate-900">อายุ {group.label}</strong><span className="text-xl font-black tabular-nums text-slate-950">{group.mean?.toFixed(2)} / 5</span></div>
              <div className="mt-2 h-2 overflow-hidden bg-slate-200" role="img" aria-label={`ช่วงอายุ ${group.label} คะแนนเฉลี่ย ${group.mean?.toFixed(2)} จาก 5`}><div className="h-full bg-[#0A6B62]" style={{ width: `${((group.mean ?? 0) / 5) * 100}%` }} /></div>
              <p className="mt-2 text-xs text-slate-600">ฐาน {group.sampleSize.toLocaleString("th-TH")} คำตอบ</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 flex items-start gap-2 bg-amber-50 px-3 py-3 text-sm leading-6 text-amber-950">
          <WarningCircle aria-hidden="true" className="mt-0.5 shrink-0" size={18} weight="fill" />
          <p>ยังไม่แสดงผลเปรียบเทียบ เพราะต้องมีอย่างน้อยสองช่วงอายุและแต่ละกลุ่มต้องมีคำตอบอย่างน้อย 30 รายการ</p>
        </div>
      )}

      <p className="mt-3 text-xs leading-5 text-slate-500">เป็นความสัมพันธ์เชิงพรรณนาในกลุ่มผู้ตอบ ไม่ได้แปลว่าช่วงอายุเป็นสาเหตุของคะแนนที่แตกต่าง</p>
    </section>
  );
}
