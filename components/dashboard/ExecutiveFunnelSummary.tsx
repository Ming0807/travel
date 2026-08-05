import type { ReactNode } from "react";
import { CheckCircle, QrCode } from "@phosphor-icons/react/dist/ssr";
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

const FUNNEL_TONES = ["#B94727", "#C85D3F", "#D77859", "#E49780", "#EFB7A6", "#F4D0C4"];

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
  const maxCount = Math.max(...displayStages.map((stage) => stage.count), 0);

  return (
    <section
      aria-labelledby="executive-funnel-heading"
      className="h-full min-w-0 rounded-md border border-slate-300 bg-white shadow-[0_4px_8px_rgba(15,23,42,0.05)]"
    >
      <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
        <h2 id="executive-funnel-heading" className="text-lg font-black text-slate-950">
          เส้นทางการมีส่วนร่วม
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          จำนวนเหตุการณ์ในแต่ละขั้น ไม่ใช่จำนวนบุคคลหรือรายการเข้าชม
        </p>
      </div>

      <div role="group" aria-label="อัตราสรุปเส้นทาง" className="grid grid-cols-2 divide-x divide-[#EDC7BA] border-b border-[#EDC7BA] bg-[#FFF9F6]">
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

      <div className="px-4 py-4 sm:px-5">
        {displayStages.length === 0 ? (
          <p className="py-8 text-center text-sm font-semibold text-slate-600">
            ยังไม่มีเหตุการณ์เพียงพอสำหรับแสดงเส้นทาง
          </p>
        ) : (
          <ol className="space-y-2.5" aria-label="ลำดับขั้นของเส้นทางผู้ใช้">
            {displayStages.map((stage, index) => {
              const previous = displayStages[index - 1];
              const conversion = previous ? safeRate(stage.count, previous.count) : null;
              const width = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;

              return (
                <li key={stage.key} className="grid grid-cols-[minmax(7rem,0.9fr)_minmax(6rem,1.15fr)_4rem] items-center gap-2">
                  <div className="min-w-0">
                    <span className="block break-words text-xs font-bold leading-4 text-slate-700">{stageLabel(stage)}</span>
                    <span className="mt-0.5 block text-xs font-semibold tabular-nums text-slate-500">
                      {index === 0 ? "จุดเริ่มต้น" : percentLabel(conversion)}
                    </span>
                  </div>
                  <div className="flex h-8 items-center justify-center" aria-hidden="true">
                    <span
                      className="block h-full"
                      style={{
                        backgroundColor: FUNNEL_TONES[index] ?? FUNNEL_TONES[FUNNEL_TONES.length - 1],
                        clipPath: "polygon(5% 0, 95% 0, 88% 100%, 12% 100%)",
                        width: stage.count > 0 ? `max(${width}%, 0.5rem)` : "0",
                      }}
                    />
                  </div>
                  <strong className="text-right text-sm font-black tabular-nums text-slate-950">
                    {stage.count.toLocaleString("th-TH")}
                  </strong>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <p className="border-t border-slate-200 px-4 py-3 text-xs leading-5 text-slate-600 sm:px-5">
        ความกว้างของแต่ละขั้นแสดงสัดส่วนเหตุการณ์เทียบกับขั้นที่มีจำนวนสูงสุด
      </p>

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
    <div className="min-w-0 px-3 py-3 sm:px-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold leading-4 text-[#8F351F]">
        {icon}
        <span>{label}</span>
      </p>
      <strong className={`mt-1 block tabular-nums ${value === null ? "text-sm text-slate-600" : "text-xl text-slate-950"}`}>
        {percentLabel(value)}
      </strong>
    </div>
  );
}
