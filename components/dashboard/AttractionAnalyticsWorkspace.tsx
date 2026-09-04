import Link from "next/link";
import {
  ArrowRight,
  Certificate,
  ChartBar,
  CheckCircle,
  ClipboardText,
  PersonSimpleWalk,
  Repeat,
  SealCheck,
  UsersThree,
  Warning,
} from "@phosphor-icons/react/dist/ssr";

import { AttractionDistributionChart } from "@/components/dashboard/AttractionDistributionChart";
import { AttractionFunnelChart } from "@/components/dashboard/AttractionFunnelChart";
import { AttractionPeerComparison } from "@/components/dashboard/AttractionPeerComparison";
import { AttractionScoreChart } from "@/components/dashboard/AttractionScoreChart";
import { ResponsiveAnalyticsGroup } from "@/components/dashboard/ResponsiveAnalyticsGroup";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { ExportButton } from "@/components/admin/ExportButton";
import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";

const SCOPE_LABELS = {
  field_claim: "หลักฐานภาคสนาม (ค่าเริ่มต้น)",
  all_records: "ทุกระเบียนเพื่อ QA",
  pilot_only: "Pilot เท่านั้น",
  simulated_only: "สถานการณ์จำลองเท่านั้น",
} as const;

const INSIGHT_TONE_LABELS = {
  data_quality: "คุณภาพข้อมูล",
  improvement: "ประเด็นปรับปรุง",
  monitor: "ติดตามแนวโน้ม",
  funnel: "ประสิทธิภาพ Flow",
} as const;

function value(value: number | null, suffix = "") {
  return value === null ? "ยังไม่มีข้อมูล" : `${value.toLocaleString("th-TH")}${suffix}`;
}

function Kpi({ icon, label, valueText, note }: { icon: React.ReactNode; label: string; valueText: string; note: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-bold leading-5 text-slate-600">{label}</p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-orange-50 text-[#B94727]">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-black tabular-nums text-slate-950">{valueText}</p>
      <p className="mt-1 min-h-10 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

function CompactMetric({ icon, label, valueText, note }: { icon: React.ReactNode; label: string; valueText: string; note: string }) {
  return (
    <div className="min-w-0">
      <dt className="flex items-start gap-2 text-xs font-bold leading-5 text-slate-600">
        <span className="mt-0.5 shrink-0 text-[#0A6B62]">{icon}</span>
        <span>{label}</span>
      </dt>
      <dd className="mt-1 text-lg font-black tabular-nums text-slate-950">{valueText}</dd>
      <dd className="mt-0.5 text-xs leading-5 text-slate-500">{note}</dd>
    </div>
  );
}

export function AttractionAnalyticsWorkspace({ data }: { data: AttractionAnalyticsViewModel }) {
  const improvementContext = {
    attractionId: data.attraction.attractionId,
    dateStart: data.filters.dateFrom,
    dateEnd: data.filters.dateTo,
  };

  return (
    <div className="space-y-6">
      <section className="border border-slate-200 bg-white" aria-labelledby="attraction-intelligence-heading">
        <div className="grid gap-5 bg-[#202020] p-5 text-white lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <h2 id="attraction-intelligence-heading" className="text-2xl font-black">{data.attraction.nameTh}</h2>
            <p className="mt-2 text-sm text-slate-300">{data.attraction.districtNameTh ?? "จังหวัดยะลา"} · {SCOPE_LABELS[data.filters.evidenceScope]} · {new Date(data.generatedAt).toLocaleString("th-TH")}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {data.viewer.permissions.includes("export.summary") && !data.quality.truncated ? <ExportButton endpoint="/api/admin/dashboard/attractions/export" label="ส่งออกสรุป" params={{ ...data.filters }} /> : null}
            <Link href={`/admin/attractions/${data.attraction.attractionId}/improvements?dateStart=${data.filters.dateFrom}&dateEnd=${data.filters.dateTo}`} className="inline-flex min-h-11 items-center justify-center gap-2 border border-white/30 bg-white px-4 text-sm font-black text-[#202020] hover:bg-orange-50">เปิดแผนปรับปรุง <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
        <div className={`flex items-start gap-3 border-t p-4 text-sm ${data.quality.truncated ? "border-amber-300 bg-amber-50 text-amber-950" : "border-emerald-200 bg-emerald-50 text-emerald-950"}`}>
          {data.quality.truncated ? <Warning className="mt-0.5 shrink-0" aria-hidden="true" weight="fill" /> : <CheckCircle className="mt-0.5 shrink-0" aria-hidden="true" weight="fill" />}
          <div><p className="font-black">{data.quality.truncated ? "ชุดข้อมูลเกินขีดจำกัดการอ่านสด" : "ขอบเขตข้อมูลผ่านการแยก Pilot/Simulation"}</p><p className="mt-1 leading-6">{data.quality.scopeNote}</p></div>
        </div>
      </section>

      <section aria-labelledby="attraction-summary-heading">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="attraction-summary-heading" className="mt-1 text-xl font-black text-slate-950">สรุปผลสถานที่</h2>
          </div>
          <p className="text-xs font-semibold text-slate-500">ตัวชี้วัดหลักในช่วงวันที่เลือก</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div data-kpi-level="headline"><Kpi icon={<UsersThree size={22} weight="fill" />} label="โปรไฟล์นักท่องเที่ยวไม่ซ้ำ" valueText={value(data.kpis.uniqueTourists)} note="โปรไฟล์ในระบบ ไม่ใช่การยืนยันบุคคลจริง" /></div>
          <div data-kpi-level="headline"><Kpi icon={<PersonSimpleWalk size={22} weight="fill" />} label="รายการเข้าชม" valueText={value(data.kpis.visits)} note={`ซ้ำ ${data.kpis.repeatVisits.toLocaleString("th-TH")} รายการในช่วงที่เลือก`} /></div>
          <div data-kpi-level="headline"><Kpi icon={<Certificate size={22} weight="fill" />} label="Visit ที่สร้างใบประกาศ" valueText={value(data.kpis.certificateVisits)} note="นับ Visit ไม่ซ้ำ ไม่ใช่จำนวนดาวน์โหลด" /></div>
          <div data-kpi-level="headline"><Kpi icon={<SealCheck size={22} weight="fill" />} label="Visit ที่ได้รับตราประทับ" valueText={value(data.kpis.stampVisits)} note="ตราประทับถูกควบคุมไม่ให้ซ้ำต่อสถานที่" /></div>
        </div>
      </section>

      <div data-workspace-section="primary-trend">
        <TrendChart points={data.trend} improvementContext={improvementContext} />
      </div>

      <section aria-labelledby="evidence-heading">
        <div className="mb-4">
          <h2 id="evidence-heading" className="mt-1 text-xl font-black text-slate-950">หลักฐานและบริบทการตัดสินใจ</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">ดูสถานที่นี้เทียบกับกลุ่มที่เข้าเกณฑ์ ความครอบคลุมของหลักฐาน และสัญญาณรองก่อนเลือกประเด็นดำเนินการ</p>
        </div>
        <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
          <AttractionPeerComparison
            comparison={data.peerComparison}
            attractionTypeName={data.attraction.attractionTypeNameTh}
          />
          <div className="grid gap-4">
            <section className="rounded-md border border-slate-200 bg-white p-5" aria-labelledby="quality-heading">
              <h3 id="quality-heading" className="text-lg font-black">คุณภาพและ Coverage</h3>
              <p className="mt-1 text-sm text-slate-600">บอกว่าฐานข้อมูลตอบคำถามได้ครอบคลุมเพียงใด ไม่ใช้แทนคะแนนผลงานสถานที่</p>
              <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200 text-sm">
                <div className="flex justify-between gap-3 py-3"><dt>โปรไฟล์พื้นฐาน</dt><dd className="font-black">{value(data.quality.profileCoverage, "%")}</dd></div>
                <div className="flex justify-between gap-3 py-3"><dt>แบบสำรวจ</dt><dd className="font-black">{value(data.quality.surveyCoverage, "%")}</dd></div>
                <div className="flex justify-between gap-3 py-3"><dt>ค่าใช้จ่ายที่รายงานเอง</dt><dd className="font-black">{value(data.quality.expenseCoverage, "%")}</dd></div>
                <div className="flex justify-between gap-3 py-3"><dt>เกณฑ์ปกปิดกลุ่มเล็ก</dt><dd className="font-black">n &lt; {data.quality.smallCellThreshold}</dd></div>
              </dl>
              <p className="mt-4 text-xs leading-5 text-slate-500">ข้อมูลไม่ครบจะถูกตัดออกจากตัวหารของมิตินั้น ไม่แทนช่องว่างด้วยศูนย์</p>
            </section>
            <dl aria-label="ตัวชี้วัดเสริมสถานที่" className="grid gap-x-5 gap-y-4 border-y border-slate-200 bg-white px-4 py-4 sm:grid-cols-3 xl:grid-cols-1">
              <CompactMetric icon={<ClipboardText size={18} weight="fill" />} label="แบบสำรวจท่องเที่ยว" valueText={value(data.kpis.surveyResponses)} note={`Coverage ${value(data.kpis.surveyRate, "%")}`} />
              <CompactMetric icon={<ChartBar size={18} weight="fill" />} label="แบบประเมินงานวิจัย" valueText={value(data.kpis.researchEvaluations)} note="นับเฉพาะ response ที่ส่งสมบูรณ์" />
              <CompactMetric icon={<Repeat size={18} weight="fill" />} label="การเข้าชมซ้ำ" valueText={value(data.kpis.repeatVisits)} note="Visit ส่วนเกินจากโปรไฟล์ไม่ซ้ำในช่วงนี้" />
            </dl>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="ข้อค้นพบเพื่อการตัดสินใจ">
        {data.insights.map((insight) => <article key={insight.title} className="border border-slate-200 border-t-2 border-t-[#B94727] bg-white p-5"><p className="text-xs font-bold text-[#9A3412]">{INSIGHT_TONE_LABELS[insight.tone]}</p><h3 className="mt-2 text-lg font-black">{insight.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600"><strong className="text-slate-900">หลักฐาน:</strong> {insight.evidence}</p><p className="mt-1 text-sm leading-6 text-slate-600"><strong className="text-slate-900">ขั้นถัดไป:</strong> {insight.action}</p></article>)}
      </section>

      <section className="border border-slate-200 bg-white" aria-labelledby="decision-heading">
        <div className="grid gap-4 border-b border-slate-200 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div><h2 id="decision-heading" className="text-lg font-black">จากหลักฐานไปสู่การปรับปรุง</h2><p className="mt-1 text-sm text-slate-600">ใช้ประเด็นและแผนงาน production เดิม เพื่อให้ผู้รับผิดชอบ กำหนดส่ง Baseline และ Follow-up ตรวจย้อนหลังได้</p></div><Link href={`/admin/attractions/${data.attraction.attractionId}/improvements?dateStart=${data.filters.dateFrom}&dateEnd=${data.filters.dateTo}`} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#202020] px-4 text-sm font-black text-white hover:bg-[#B94727]">จัดการประเด็นและแผนงาน <ArrowRight aria-hidden="true" /></Link></div>
        <dl className="grid gap-x-6 gap-y-4 bg-slate-50 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <CompactMetric icon={<Warning size={20} weight="fill" />} label="ประเด็นทั้งหมด" valueText={String(data.improvements.issueCount)} note="ผ่านการทบทวนตามกฎ" />
          <CompactMetric icon={<Warning size={20} />} label="ประเด็นที่ยังเปิด" valueText={String(data.improvements.openIssueCount)} note="ยังไม่ปิดหรือปฏิเสธ" />
          <CompactMetric icon={<ClipboardText size={20} />} label="แผนปรับปรุง" valueText={String(data.improvements.actionCount)} note="เชื่อมกับประเด็นที่ตรวจแล้ว" />
          <CompactMetric icon={<Warning size={20} weight="fill" />} label="เลยกำหนด" valueText={String(data.improvements.overdueActionCount)} note="ยังไม่เสร็จ/ยืนยันผล" />
        </dl>
      </section>

      <AttractionFunnelChart stages={data.funnel} improvementContext={improvementContext} />

      <ResponsiveAnalyticsGroup group="audience" label="ใครมา และเดินทางอย่างไร">
        <section aria-labelledby="audience-heading">
          <div className="mb-4"><h2 id="audience-heading" className="text-xl font-black">ใครมา และเดินทางอย่างไร</h2><p className="mt-1 text-sm text-slate-600">มิติประชากรนับโปรไฟล์ไม่ซ้ำ ส่วนพฤติกรรมเดินทางนับ Visit ที่ตอบมิตินั้น</p></div>
          <div className="grid items-start gap-4 xl:grid-cols-2">
            <AttractionDistributionChart title="จังหวัดต้นทาง" description="ฐาน: โปรไฟล์ไม่ซ้ำที่ระบุจังหวัด" rows={data.audience.originProvinces} />
            <AttractionDistributionChart title="ช่วงอายุ" description="ฐาน: โปรไฟล์ไม่ซ้ำที่ระบุช่วงอายุ" rows={data.audience.ageGroups} />
            <AttractionDistributionChart title="ภาษา" description="ฐาน: โปรไฟล์ไม่ซ้ำที่มี preferred language" rows={data.audience.languages} />
            <AttractionDistributionChart title="ผู้ร่วมเดินทาง" description="ฐาน: Visit ที่ตอบคำถามนี้" rows={data.audience.companions} />
            <AttractionDistributionChart title="การเดินทาง" description="ฐาน: Visit ที่ตอบรูปแบบการเดินทาง" rows={data.audience.transports} />
            <AttractionDistributionChart title="การค้างคืน" description="ฐาน: Visit ที่ตอบสถานะค้างคืน" rows={data.audience.overnight} />
            <AttractionDistributionChart title="วัตถุประสงค์" description="ฐาน: Visit ที่ตอบวัตถุประสงค์" rows={data.audience.purposes} />
            <AttractionDistributionChart title="ประเทศต้นทาง" description="ฐาน: โปรไฟล์ไม่ซ้ำที่ระบุประเทศ" rows={data.audience.originCountries} />
          </div>
        </section>
      </ResponsiveAnalyticsGroup>

      <ResponsiveAnalyticsGroup group="experience" label="คุณภาพประสบการณ์และความตั้งใจ">
        <section className="grid items-start gap-4 xl:grid-cols-2" aria-label="คุณภาพประสบการณ์และความตั้งใจ">
          <AttractionScoreChart metrics={data.satisfaction} improvementContext={improvementContext} />
          <div className="grid gap-4 sm:grid-cols-2">
            <AttractionDistributionChart title="ตั้งใจกลับมา" description="ฐาน: คำตอบ revisit intention" rows={data.intentions.revisit} />
            <AttractionDistributionChart title="ตั้งใจแนะนำ" description="ฐาน: คำตอบ recommendation intention" rows={data.intentions.recommend} />
            <div className="rounded-md border border-slate-200 bg-white p-5 sm:col-span-2"><p className="text-xs font-bold text-slate-500">ความคิดเห็นปลายเปิด</p><p className="mt-2 text-3xl font-black">{data.intentions.commentCount.toLocaleString("th-TH")}</p><p className="mt-1 text-sm text-slate-600">แสดงเฉพาะจำนวนในหน้านี้ เนื้อหารายข้อความอยู่ภายใต้สิทธิและกระบวนการทบทวน Feedback</p></div>
          </div>
        </section>
      </ResponsiveAnalyticsGroup>

      <ResponsiveAnalyticsGroup group="expenses" label="ช่วงค่าใช้จ่ายและหมวดค่าใช้จ่าย">
        <section className="grid items-start gap-4 xl:grid-cols-2">
          <AttractionDistributionChart title="ช่วงค่าใช้จ่ายที่รายงานเอง" description={data.expenses.note} rows={data.expenses.ranges} />
          <AttractionDistributionChart title="หมวดค่าใช้จ่ายหลัก" description={`ฐาน ${data.expenses.responseCount.toLocaleString("th-TH")} ระเบียนค่าใช้จ่าย · ไม่ใช่รายได้ธุรกิจ`} rows={data.expenses.categories} />
        </section>
      </ResponsiveAnalyticsGroup>

      <details className="border border-slate-200 bg-white">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-5 font-black"><ChartBar aria-hidden="true" /> นิยามตัวชี้วัดและข้อจำกัด</summary>
        <div className="overflow-x-auto border-t border-slate-200"><table className="w-full min-w-[960px] text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><th className="px-4 py-3">ตัวชี้วัด</th><th className="px-4 py-3">หน่วย/ตัวหาร</th><th className="px-4 py-3">แหล่งข้อมูล</th><th className="px-4 py-3">Missing rule</th><th className="px-4 py-3">ใช้ตัดสินใจ</th></tr></thead><tbody className="divide-y divide-slate-100">{data.metricContract.map((metric) => <tr key={metric.key}><td className="px-4 py-3 font-bold">{metric.label}</td><td className="px-4 py-3">{metric.unit}<br /><span className="text-xs text-slate-500">{metric.denominator}</span></td><td className="px-4 py-3 font-mono text-xs">{metric.source}<br />{metric.dateField}</td><td className="px-4 py-3">{metric.missingRule}</td><td className="px-4 py-3">{metric.decisionUse}</td></tr>)}</tbody></table></div>
      </details>

      <p className="border-l-2 border-slate-400 pl-3 text-xs leading-6 text-slate-600">{data.interpretation}</p>
    </div>
  );
}
