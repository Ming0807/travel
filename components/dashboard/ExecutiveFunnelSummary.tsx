import { ArrowRight, CheckCircle, QrCode, Scroll } from "@phosphor-icons/react/dist/ssr";
import type { FunnelStage } from "@/types/dashboard";

function countFor(stages: FunnelStage[], key: string): number {
  return stages.find((stage) => stage.key === key)?.count ?? 0;
}

function rate(numerator: number, denominator: number): number | null {
  if (denominator <= 0 || numerator < 0 || numerator > denominator) return null;
  return numerator / denominator;
}

function percentLabel(value: number | null): string {
  return value === null ? "ยังคำนวณไม่ได้" : `${Math.round(value * 100)}%`;
}

export function ExecutiveFunnelSummary({ stages }: { stages: FunnelStage[] }) {
  const qrScans = countFor(stages, "qr_scanned");
  const certificates = countFor(stages, "certificate_generated");
  const surveys = countFor(stages, "survey_completed");
  const certificateRate = rate(certificates, qrScans);
  const surveyRate = rate(surveys, certificates);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dash = certificateRate === null ? 0 : certificateRate * circumference;

  return (
    <section aria-labelledby="executive-funnel-heading" className="h-full rounded-md border border-slate-200 bg-white p-4 shadow-[0_4px_8px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 id="executive-funnel-heading" className="text-base font-bold text-slate-900">ประสิทธิภาพเส้นทางข้อมูล</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">เหตุการณ์ตั้งแต่สแกน QR จนถึงส่งแบบสำรวจ</p>
        </div>
        <ArrowRight aria-hidden="true" className="mt-0.5 text-[#B94727]" size={18} weight="bold" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
        <div className="relative h-36 w-36 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 128 128" role="img" aria-label={`อัตราสร้างใบประกาศจากการสแกน QR ${percentLabel(certificateRate)}`}>
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="10" />
            <circle cx="64" cy="64" r={radius} fill="none" stroke="#B94727" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash} ${circumference - dash}`} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <strong className="text-2xl font-black tabular-nums text-slate-950">{certificateRate === null ? "—" : percentLabel(certificateRate)}</strong>
            <span className="mt-0.5 text-xs font-semibold text-slate-500">QR → ใบประกาศ</span>
          </div>
        </div>

        <div className="w-full min-w-0 space-y-2">
          {[
            { label: "สแกน QR", value: qrScans, icon: QrCode },
            { label: "สร้างใบประกาศ", value: certificates, icon: Scroll },
            { label: "ส่งแบบสำรวจ", value: surveys, icon: CheckCircle },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-2 border-b border-slate-100 pb-2 text-sm last:border-0 last:pb-0">
                <Icon aria-hidden="true" className="shrink-0 text-slate-500" size={16} />
                <span className="min-w-0 flex-1 text-slate-600">{item.label}</span>
                <strong className="tabular-nums text-slate-900">{item.value.toLocaleString("th-TH")}</strong>
              </div>
            );
          })}
          <div className="rounded-md bg-[#FFF7F3] px-3 py-2 text-sm text-[#8F351F]">
            <span className="text-xs font-semibold">ใบประกาศ → แบบสำรวจ</span>
            <strong className="mt-0.5 block text-lg tabular-nums">{percentLabel(surveyRate)}</strong>
          </div>
        </div>
      </div>

      {certificateRate === null ? <p className="mt-3 text-center text-xs text-slate-500">ยังคำนวณไม่ได้</p> : null}
      <table aria-label="ข้อมูลประสิทธิภาพเส้นทางผู้ใช้" className="sr-only">
        <thead><tr><th>ขั้นตอน</th><th>จำนวนเหตุการณ์</th></tr></thead>
        <tbody><tr><td>สแกน QR</td><td>{qrScans}</td></tr><tr><td>สร้างใบประกาศ</td><td>{certificates}</td></tr><tr><td>ส่งแบบสำรวจ</td><td>{surveys}</td></tr></tbody>
      </table>
    </section>
  );
}
