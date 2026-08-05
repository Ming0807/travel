import type { RankedAttraction } from "@/types/dashboard";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";

function formatNumber(value: number): string {
  return value.toLocaleString("th-TH");
}

function formatRating(value: number | null): string {
  return value === null ? "ยังไม่มีข้อมูล" : `${value.toFixed(1)} / 5`;
}

function ratingState(value: number | null, responses: number | null): { label: string; className: string } {
  if (value === null) return { label: "ไม่มีข้อมูล", className: "bg-slate-100 text-slate-700" };
  if (responses !== null && responses < DASHBOARD_MIN_SAMPLE_SIZE) return { label: "ข้อมูลยังไม่พอ", className: "bg-slate-100 text-slate-700" };
  if (value >= 4) return { label: "อยู่ในระดับดี", className: "bg-emerald-50 text-emerald-800" };
  if (value >= 3) return { label: "ควรติดตาม", className: "bg-amber-50 text-amber-800" };
  return { label: "ควรตรวจสอบ", className: "bg-rose-50 text-rose-800" };
}

type DimensionScores = {
  safetyAverage: number | null;
  cleanlinessAverage: number | null;
  accessibilityAverage: number | null;
  informationAverage: number | null;
  valueAverage: number | null;
  facilityAverage: number | null;
};

type DimensionResponseCounts = {
  safety: number;
  cleanliness: number;
  accessibility: number;
  information: number;
  value: number;
  facility: number;
};

type SatisfactionDetailTableProps = {
  byAttraction: RankedAttraction[];
  overallAverage: number | null;
  overallResponseCount: number;
  dimensionScores: DimensionScores;
  dimensionResponseCounts?: DimensionResponseCounts;
};

export function SatisfactionDetailTable({
  byAttraction,
  overallAverage,
  overallResponseCount,
  dimensionScores,
  dimensionResponseCounts,
}: SatisfactionDetailTableProps) {
  const dimensions = [
    { key: "overall", label: "คะแนนโดยรวม", value: overallAverage, responses: overallResponseCount },
    { key: "safety", label: "ความปลอดภัย", value: dimensionScores.safetyAverage, responses: dimensionResponseCounts?.safety ?? null },
    { key: "cleanliness", label: "ความสะอาด", value: dimensionScores.cleanlinessAverage, responses: dimensionResponseCounts?.cleanliness ?? null },
    { key: "accessibility", label: "การเข้าถึง", value: dimensionScores.accessibilityAverage, responses: dimensionResponseCounts?.accessibility ?? null },
    { key: "information", label: "ข้อมูลและป้ายแนะนำ", value: dimensionScores.informationAverage, responses: dimensionResponseCounts?.information ?? null },
    { key: "value", label: "ความคุ้มค่า", value: dimensionScores.valueAverage, responses: dimensionResponseCounts?.value ?? null },
    ...(dimensionScores.facilityAverage !== null || (dimensionResponseCounts?.facility ?? 0) > 0
      ? [{ key: "facility", label: "สิ่งอำนวยความสะดวก (ข้อมูลเดิม)", value: dimensionScores.facilityAverage, responses: dimensionResponseCounts?.facility ?? null }]
      : []),
  ];

  return (
    <section aria-labelledby="satisfaction-detail-heading" className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-slate-900" id="satisfaction-detail-heading">ตารางตรวจสอบคะแนนความพึงพอใจ</h3>
        <p className="mt-1 text-sm text-slate-600">ค่าเฉลี่ยคำนวณเฉพาะคำตอบที่มีข้อมูล ช่องที่เว้นว่างไม่ถูกแทนด้วยศูนย์</p>
      </div>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-2">
        <div className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table aria-label="คะแนนประสบการณ์รายมิติ" className="w-full min-w-[520px] text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600"><th className="px-4 py-3">มิติประสบการณ์</th><th className="px-4 py-3 text-right">คะแนนเฉลี่ย</th><th className="px-4 py-3 text-right">จำนวนคำตอบ</th><th className="px-4 py-3">สถานะ</th></tr></thead>
              <tbody>
                {dimensions.map((dimension) => {
                  const state = ratingState(dimension.value, dimension.responses);
                  return (
                    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50" key={dimension.key}>
                      <td className="px-4 py-3 font-semibold text-slate-800">{dimension.label}</td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-900">{formatRating(dimension.value)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">{dimension.responses === null ? "ไม่ระบุ" : formatNumber(dimension.responses)}</td>
                      <td className="px-4 py-3"><span className={`inline-flex rounded-sm px-2 py-1 text-xs font-semibold ${state.className}`}>{state.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table aria-label="ความพึงพอใจแยกตามสถานที่" className="w-full min-w-[620px] text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold text-slate-600"><th className="px-4 py-3">อันดับ</th><th className="px-4 py-3">สถานที่</th><th className="px-4 py-3">จังหวัด</th><th className="px-4 py-3 text-right">คะแนนเฉลี่ย</th><th className="px-4 py-3 text-right">คำตอบ</th><th className="px-4 py-3 text-right">การเข้าชม</th></tr></thead>
              <tbody>
                {byAttraction.length === 0 ? (
                  <tr><td className="px-4 py-8 text-center text-slate-600" colSpan={6}>ยังไม่มีคำตอบความพึงพอใจที่เชื่อมกับสถานที่</td></tr>
                ) : byAttraction.map((attraction) => (
                  <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50" key={`${attraction.rank}-${attraction.attractionName}`}>
                    <td className="px-4 py-3 font-bold tabular-nums text-[#B94727]">{formatNumber(attraction.rank)}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{attraction.attractionName}</td>
                    <td className="px-4 py-3 text-slate-600">{attraction.provinceName}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-slate-900">{formatRating(attraction.averageSatisfaction)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatNumber(attraction.surveyResponseCount)}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-600">{formatNumber(attraction.visitCount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
