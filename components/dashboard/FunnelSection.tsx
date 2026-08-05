import { ArrowDown, Certificate, CheckCircle, QrCode, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { AnalyticsMetricGrid } from "@/components/dashboard/AnalyticsMetricGrid";
import { AnalyticsSectionHeader } from "@/components/dashboard/AnalyticsSectionHeader";
import { FunnelChart, funnelStageLabel } from "@/components/dashboard/FunnelChart";
import { FunnelDetailTable } from "@/components/dashboard/FunnelDetailTable";
import type { DashboardViewModel, FunnelStage } from "@/types/dashboard";

function stageByKey(stages: FunnelStage[], key: string): FunnelStage | undefined {
  return stages.find((stage) => stage.key === key);
}

function validRate(value: number | null): number | null {
  return value !== null && Number.isFinite(value) && value >= 0 && value <= 1 ? value : null;
}

function stageAction(key: string): string {
  const actions: Record<string, string> = {
    landing_viewed: "ตรวจความชัดเจนของ QR ความเร็วหน้าเช็กอิน และข้อความก่อนเริ่มใช้งาน",
    certificate_started: "ตรวจว่าประโยชน์ของใบประกาศและปุ่มเริ่มใช้งานมองเห็นชัดบนมือถือ",
    minimal_form_completed: "ทบทวนจำนวนช่อง ความเข้าใจง่ายของคำถาม และการนำข้อมูลเดิมกลับมาใช้",
    photo_uploaded: "ตรวจสิทธิกล้อง การเลือกรูป การบีบอัด และข้อความเมื่ออัปโหลดไม่สำเร็จ",
    certificate_generated: "ตรวจประสิทธิภาพการสร้างใบประกาศและการกู้คืนเมื่อบริการภายนอกล้มเหลว",
    survey_started: "ทบทวนจังหวะเชิญตอบแบบสำรวจหลังผู้ใช้ได้รับใบประกาศแล้ว",
    survey_completed: "ลดคำถามที่ไม่จำเป็นและทำให้สถานะคำถามที่เลือกตอบชัดเจน",
    passport_saved: "อธิบายประโยชน์ของพาสปอร์ตและทางเลือกการบันทึกบัญชีให้ชัดเจน",
  };
  return actions[key] ?? "ตรวจขั้นตอนจริงบนมือถือและเปรียบเทียบกับขั้นก่อนหน้า";
}

export function FunnelSection({ data }: { data: DashboardViewModel }) {
  const qrStage = stageByKey(data.funnel.stages, "qr_scanned");
  const certificateStage = stageByKey(data.funnel.stages, "certificate_generated");
  const surveyStage = stageByKey(data.funnel.stages, "survey_completed");
  const visitKpi = data.kpis.find((metric) => metric.key === "total_visits");
  const largest = data.funnel.largestDropOffStage;
  const largestIndex = largest ? data.funnel.stages.findIndex((stage) => stage.key === largest.key) : -1;
  const previousStage = largestIndex > 0 ? data.funnel.stages[largestIndex - 1] : null;
  const largestRate = largest && previousStage && previousStage.count > 0 && largest.count <= previousStage.count
    ? validRate(largest.dropOffFromPrevious)
    : null;
  const lostEvents = largestRate !== null && previousStage && largest ? previousStage.count - largest.count : null;
  const kpis = [
    { label: "สแกน QR", value: qrStage?.count === undefined ? "ยังไม่มีข้อมูล" : qrStage.count.toLocaleString("th-TH"), icon: <QrCode aria-hidden="true" size={20} weight="bold" /> },
    { label: "รายการเข้าชมที่บันทึก", value: visitKpi?.rawValue === null || visitKpi?.rawValue === undefined ? "ยังไม่มีข้อมูล" : visitKpi.rawValue.toLocaleString("th-TH"), icon: <CheckCircle aria-hidden="true" size={20} weight="fill" /> },
    { label: "สร้างใบประกาศ", value: certificateStage?.count === undefined ? "ยังไม่มีข้อมูล" : certificateStage.count.toLocaleString("th-TH"), icon: <Certificate aria-hidden="true" size={20} weight="fill" /> },
    { label: "ส่งแบบสำรวจ", value: surveyStage?.count === undefined ? "ยังไม่มีข้อมูล" : surveyStage.count.toLocaleString("th-TH"), icon: <CheckCircle aria-hidden="true" size={20} weight="fill" /> },
  ];

  return (
    <section aria-labelledby="funnel-heading" className="space-y-5">
      <AnalyticsSectionHeader
        description="ค้นหาขั้นตอนที่มีเหตุการณ์ออกจากกระบวนการ ตั้งแต่สแกน QR ถึงรับใบประกาศและตอบแบบสำรวจ"
        headingId="funnel-heading"
        title="เส้นทางการใช้งาน"
      />

      <AnalyticsMetricGrid items={kpis} label="ตัวชี้วัดเส้นทางการใช้งาน" />

      <div className="grid min-w-0 gap-4 xl:grid-cols-12">
        <div aria-label="หลักฐานเส้นทางการใช้งาน" className="min-w-0 xl:col-span-8" role="region"><FunnelChart stages={data.funnel.stages} /></div>
        <aside aria-label="การตีความเส้นทางการใช้งาน" className="min-w-0 rounded-md border border-slate-200 bg-white p-4 xl:col-span-4" role="region">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-700"><ArrowDown aria-hidden="true" size={20} weight="bold" /></span>
            <div><h3 className="font-bold text-slate-900">จุดที่ออกมากที่สุด</h3><p className="mt-1 text-sm leading-6 text-slate-600">เปรียบเทียบเฉพาะขั้นที่มีฐานคำนวณถูกต้อง</p></div>
          </div>

          {largest && largestRate !== null && previousStage ? (
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-700">{funnelStageLabel(previousStage)} → {funnelStageLabel(largest)}</p>
              <p className="mt-2 text-3xl font-bold tabular-nums text-rose-700">{Math.round(largestRate * 100)}%</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">ลดลง {lostEvents?.toLocaleString("th-TH")} เหตุการณ์ จากฐาน {previousStage.count.toLocaleString("th-TH")} เหตุการณ์</p>
              <div className="mt-4 border-t border-slate-100 pt-4"><p className="text-xs font-semibold text-slate-600">แนวทางตรวจสอบ</p><p className="mt-1 text-sm leading-6 text-slate-700">{stageAction(largest.key)}</p></div>
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-2 rounded-md bg-slate-50 p-3 text-sm leading-6 text-slate-600"><WarningCircle aria-hidden="true" className="mt-0.5 shrink-0 text-amber-700" size={18} weight="fill" /><p>ยังคำนวณไม่ได้ เพราะไม่มีฐานก่อนหน้าหรือข้อมูลระหว่างขั้นไม่สอดคล้องกัน</p></div>
          )}
        </aside>
      </div>

      <FunnelDetailTable stages={data.funnel.stages} />

      <p className="rounded-md bg-slate-100 px-4 py-3 text-xs leading-5 text-slate-700">ข้อจำกัด: เหตุการณ์ของบุคคลเดียวอาจเกิดซ้ำได้ ตัวเลขหน้านี้จึงไม่ใช่จำนวนบุคคลไม่ซ้ำ และการสแกน QR ไม่ใช่รายการเข้าชม</p>
    </section>
  );
}
