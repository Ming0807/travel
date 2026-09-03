import type { ReactNode } from "react";
import { CheckCircle, QrCode, TrendDown } from "@phosphor-icons/react/dist/ssr";
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

const EXECUTIVE_STAGE_KEYS = [
  "qr_scanned",
  "landing_viewed",
  "minimal_form_completed",
  "photo_uploaded",
  "certificate_generated",
  "survey_completed",
];

const FUNNEL_TONES = ["#D94717", "#E76A3B", "#D69E2E", "#4B8A5F", "#0A6B62", "#07534D"];

function countFor(stages: FunnelStage[], key: string): number {
  return stages.find((stage) => stage.key === key)?.count ?? 0;
}

function safeRate(numerator: number, denominator: number): number | null {
  if (denominator <= 0 || numerator < 0 || numerator > denominator) return null;
  return numerator / denominator;
}

function percentLabel(value: number | null): string {
  return value === null ? "ยังคำนวณไม่ได้" : `${Math.round(value * 100)}%`;
}

function stageLabel(stage: FunnelStage): string {
  return STAGE_LABELS[stage.key] ?? stage.label;
}

export function ExecutiveFunnelSummary({ stages }: { stages: FunnelStage[] }) {
  const qrScans = countFor(stages, "qr_scanned");
  const certificates = countFor(stages, "certificate_generated");
  const surveys = countFor(stages, "survey_completed");
  const certificateRate = safeRate(certificates, qrScans);
  const surveyRate = safeRate(surveys, certificates);
  const keyStages = EXECUTIVE_STAGE_KEYS.map((key) => stages.find((stage) => stage.key === key)).filter((stage): stage is FunnelStage => Boolean(stage));
  const displayStages = keyStages.length >= 3 ? keyStages : stages.slice(0, 6);
  return (
    <section
      aria-labelledby="executive-funnel-heading"
      className="h-full min-w-0 overflow-hidden rounded-md border border-slate-200 bg-white"
    >
      <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FFF0EA] text-[#B94727]"><TrendDown aria-hidden="true" size={18} weight="bold" /></span>
            <h2 id="executive-funnel-heading" className="text-lg font-black text-slate-950">เส้นทางการมีส่วนร่วม</h2>
          </div>
          <p className="mt-1.5 text-xs leading-5 text-slate-600">แต่ละขั้นคือจำนวนเหตุการณ์ใน Funnel ไม่ใช่จำนวนบุคคลหรือรายการเยี่ยมชม</p>
        </div>
        <div role="group" aria-label="อัตราสรุปเส้นทาง" className="grid shrink-0 grid-cols-2 divide-x divide-slate-200 rounded-md border border-slate-200 bg-slate-50">
          <ConversionSummary
            icon={<QrCode aria-hidden="true" size={16} weight="bold" />}
            label="QR ถึงใบประกาศ"
            value={certificateRate}
          />
          <ConversionSummary
            icon={<CheckCircle aria-hidden="true" size={16} weight="bold" />}
            label="ใบประกาศถึงแบบสำรวจ"
            value={surveyRate}
          />
        </div>
      </div>

      <div className="px-4 py-4 sm:px-5">
        {displayStages.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-slate-600">
            ยังไม่มีเหตุการณ์เพียงพอสำหรับแสดงเส้นทาง
          </p>
        ) : (
          <ol className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6 xl:gap-0" aria-label="ลำดับขั้นของเส้นทางผู้ใช้">
            {displayStages.map((stage, index) => {
              const previous = displayStages[index - 1];
              const conversion = previous ? safeRate(stage.count, previous.count) : null;
              return (
                <li
                  key={stage.key}
                  className="relative min-w-0 overflow-hidden px-3 py-3 xl:-ml-px xl:px-4"
                  style={{
                    background: `color-mix(in srgb, ${FUNNEL_TONES[index] ?? FUNNEL_TONES[FUNNEL_TONES.length - 1]} 10%, white)`,
                    clipPath: "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%, 10px 50%)",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black tabular-nums text-slate-700">{index + 1}</span>
                    <strong className="text-lg font-black tabular-nums text-slate-950">{stage.count.toLocaleString("th-TH")}</strong>
                  </div>
                  <span className="mt-2 block break-words text-[11px] font-bold leading-4 text-slate-800">{stageLabel(stage)}</span>
                  <span className="mt-0.5 block text-[10px] font-semibold tabular-nums text-slate-500">{index === 0 ? "จุดเริ่มต้น" : `${percentLabel(conversion)} จากขั้นก่อน`}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <p className="border-t border-slate-100 bg-slate-50 px-4 py-2.5 text-xs leading-5 text-slate-600 sm:px-5">เปอร์เซ็นต์ของแต่ละขั้นคำนวณเทียบกับขั้นก่อนหน้า</p>

      <div className="sr-only">
        <table aria-label="ข้อมูลประสิทธิภาพเส้นทางผู้ใช้">
          <thead>
            <tr><th>ขั้นตอน</th><th>จำนวนเหตุการณ์</th><th>อัตราจากขั้นก่อนหน้า</th></tr>
          </thead>
          <tbody>
            {stages.map((stage, index) => (
              <tr key={`funnel-table-${stage.key}`}>
                <td>{stageLabel(stage)}</td>
                <td>{stage.count}</td>
                <td>{index === 0 ? "จุดเริ่มต้น" : percentLabel(safeRate(stage.count, stages[index - 1].count))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ConversionSummary({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number | null;
}) {
  return (
    <div className="min-w-0 px-3 py-2.5 sm:px-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold leading-4 text-slate-600">
        {icon}
        <span>{label}</span>
      </p>
      <strong className={`mt-1 block tabular-nums ${value === null ? "text-xs text-slate-600" : "text-lg text-slate-950"}`}>
        {percentLabel(value)}
      </strong>
    </div>
  );
}
