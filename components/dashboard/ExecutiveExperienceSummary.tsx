import { ArrowClockwise, ChatCircleText, Star } from "@phosphor-icons/react/dist/ssr";
import { SmallSampleWarning } from "@/components/dashboard/SmallSampleWarning";
import { DASHBOARD_MIN_SAMPLE_SIZE } from "@/constants/dashboard-metrics";
import type { DashboardViewModel } from "@/types/dashboard";

const SCORE_COLORS: Record<number, string> = {
  1: "#BE123C",
  2: "#B94727",
  3: "#D6A13D",
  4: "#3E7A4F",
  5: "#0A6B62",
};

function rateLabel(value: number | null): string {
  return value === null ? "ยังไม่มีข้อมูล" : `${Math.round(value * 100)}%`;
}

function scoreFromLabel(label: string): number {
  const score = Number.parseInt(label, 10);
  return score >= 1 && score <= 5 ? score : 3;
}

export function ExecutiveExperienceSummary({ satisfaction }: { satisfaction: DashboardViewModel["satisfaction"] }) {
  const distribution = satisfaction.distribution.filter((item) => item.value > 0);
  const total = distribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <section aria-labelledby="executive-experience-heading" className="h-full rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="executive-experience-heading" className="text-base font-bold text-slate-900">คุณภาพประสบการณ์</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">คะแนนจากแบบสำรวจที่สมัครใจ</p>
        </div>
        <Star aria-hidden="true" className="text-[#D6A13D]" size={20} weight="fill" />
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500">คะแนนเฉลี่ย</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-slate-950">{satisfaction.averageOverall === null ? "ยังไม่มีข้อมูล" : `${satisfaction.averageOverall.toFixed(1)} / 5`}</p>
        </div>
        <p className="shrink-0 text-xs font-semibold tabular-nums text-slate-500">{satisfaction.responseCount.toLocaleString("th-TH")} คำตอบ</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-200 border-b border-slate-200 py-3">
        <div className="pr-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-500"><ArrowClockwise aria-hidden="true" size={14} />กลับมาเที่ยวซ้ำ</p>
          <strong className="mt-1 block text-lg tabular-nums text-slate-900">{rateLabel(satisfaction.revisitIntentionRate)}</strong>
        </div>
        <div className="pl-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-500"><ChatCircleText aria-hidden="true" size={14} />แนะนำต่อ</p>
          <strong className="mt-1 block text-lg tabular-nums text-slate-900">{rateLabel(satisfaction.recommendIntentionRate)}</strong>
        </div>
      </div>

      {total > 0 ? (
        <div className="mt-4">
          <div className="flex h-3 overflow-hidden rounded-sm bg-slate-100" role="img" aria-label="การกระจายคะแนนความพึงพอใจ">
            {distribution.map((item) => (
              <span key={item.label} style={{ width: `${(item.value / total) * 100}%`, backgroundColor: SCORE_COLORS[scoreFromLabel(item.label)] }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
            {distribution.map((item) => <span key={`legend-${item.label}`}><strong className="text-slate-700">{item.label}</strong> {Math.round((item.value / total) * 100)}%</span>)}
          </div>
        </div>
      ) : <p className="mt-4 text-sm text-slate-500">ยังไม่มีข้อมูล</p>}

      {satisfaction.responseCount > 0 && satisfaction.responseCount < DASHBOARD_MIN_SAMPLE_SIZE ? (
        <div className="mt-3"><SmallSampleWarning count={satisfaction.responseCount} label="คำตอบความพึงพอใจ" /></div>
      ) : null}

      <table aria-label="การกระจายคะแนนความพึงพอใจ" className="sr-only">
        <thead><tr><th>คะแนน</th><th>จำนวนคำตอบ</th></tr></thead>
        <tbody>{distribution.map((item) => <tr key={`score-${item.label}`}><td>{item.label}</td><td>{item.value}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
