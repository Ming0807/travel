import Link from "next/link";
import {
  ArrowRight,
  Certificate,
  ChartBar,
  CheckCircle,
  ClipboardText,
  MapPin,
  PersonSimpleWalk,
  Repeat,
  SealCheck,
  TrendDown,
  UsersThree,
  Warning,
} from "@phosphor-icons/react/dist/ssr";

import { TrendChart } from "@/components/dashboard/TrendChart";
import { ExportButton } from "@/components/admin/ExportButton";
import type { AttractionAnalyticsViewModel } from "@/lib/services/attraction-analytics.service";

type Distribution = AttractionAnalyticsViewModel["audience"]["ageGroups"];

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
    <div className="bg-white p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3"><p className="text-xs font-bold text-slate-500">{label}</p><span className="text-[#B94727]">{icon}</span></div>
      <p className="mt-3 text-3xl font-black tabular-nums text-slate-950">{valueText}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  );
}

function DistributionPanel({ title, description, rows }: { title: string; description: string; rows: Distribution }) {
  const max = Math.max(...rows.map((row) => row.count ?? 0), 1);
  const denominator = rows[0]?.denominator ?? 0;
  return (
    <section className="border border-slate-200 bg-white p-4 sm:p-5">
      <h3 className="font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      {rows.length === 0 ? <p className="mt-5 border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีคำตอบในมิตินี้</p> : (
        <><p className="mt-3 text-xs font-bold text-slate-600">ฐานคำตอบ n={denominator.toLocaleString("th-TH")}</p><ol className="mt-4 space-y-4">
          {rows.map((row) => (
            <li key={row.label}>
              <div className="flex items-end justify-between gap-3 text-sm"><span className="font-bold text-slate-800">{row.label}</span><span className="shrink-0 font-black tabular-nums">{row.suppressed ? "ปกปิด" : `${row.count?.toLocaleString("th-TH")} (${row.percent}%)`}</span></div>
              <div className="mt-2 h-2 bg-slate-100" aria-hidden="true"><div className={`h-full ${row.suppressed ? "bg-slate-300" : "bg-[#B94727]"}`} style={{ width: row.suppressed ? "20%" : `${((row.count ?? 0) / max) * 100}%` }} /></div>
            </li>
          ))}
        </ol></>
      )}
    </section>
  );
}

export function AttractionAnalyticsWorkspace({ data }: { data: AttractionAnalyticsViewModel }) {
  const satisfactionReady = data.satisfaction.some((metric) => metric.value !== null);
  return (
    <div className="space-y-6">
      <section className="border border-slate-200 bg-white" aria-labelledby="attraction-intelligence-heading">
        <div className="grid gap-5 bg-[#202020] p-5 text-white lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase text-orange-300">Attraction intelligence</p>
            <h2 id="attraction-intelligence-heading" className="mt-1 text-2xl font-black">{data.attraction.nameTh}</h2>
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

      <section className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4" aria-label="ตัวชี้วัดสถานที่">
        <Kpi icon={<UsersThree size={22} weight="fill" />} label="โปรไฟล์นักท่องเที่ยวไม่ซ้ำ" valueText={value(data.kpis.uniqueTourists)} note="โปรไฟล์ในระบบ ไม่ใช่การยืนยันบุคคลจริง" />
        <Kpi icon={<PersonSimpleWalk size={22} weight="fill" />} label="รายการเข้าชม" valueText={value(data.kpis.visits)} note={`ซ้ำ ${data.kpis.repeatVisits.toLocaleString("th-TH")} รายการในช่วงที่เลือก`} />
        <Kpi icon={<Certificate size={22} weight="fill" />} label="Visit ที่สร้างใบประกาศ" valueText={value(data.kpis.certificateVisits)} note="นับ Visit ไม่ซ้ำ ไม่ใช่จำนวนดาวน์โหลด" />
        <Kpi icon={<SealCheck size={22} weight="fill" />} label="Visit ที่ได้รับตราประทับ" valueText={value(data.kpis.stampVisits)} note="ตราประทับถูกควบคุมไม่ให้ซ้ำต่อสถานที่" />
        <Kpi icon={<ClipboardText size={22} weight="fill" />} label="แบบสำรวจท่องเที่ยว" valueText={value(data.kpis.surveyResponses)} note={`Coverage ${value(data.kpis.surveyRate, "%")}`} />
        <Kpi icon={<ChartBar size={22} weight="fill" />} label="แบบประเมินงานวิจัย" valueText={value(data.kpis.researchEvaluations)} note="นับเฉพาะ response ที่ส่งสมบูรณ์" />
        <Kpi icon={<Repeat size={22} weight="fill" />} label="การเข้าชมซ้ำ" valueText={value(data.kpis.repeatVisits)} note="Visit ส่วนเกินจากโปรไฟล์ไม่ซ้ำในช่วงนี้" />
        <Kpi icon={<MapPin size={22} weight="fill" />} label="อันดับเทียบสถานที่ที่มีข้อมูล" valueText={data.benchmark.comparable && data.benchmark.rank ? `#${data.benchmark.rank}` : "ยังเทียบไม่ได้"} note={data.benchmark.comparable ? `มัธยฐานเพื่อนเทียบ ${data.benchmark.peerMedian} Visits` : "ตัวกรองหรือฐานเพื่อนเทียบยังไม่เหมาะสม"} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <TrendChart points={data.trend} />
        <div className="border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-black">คุณภาพและ Coverage</h2>
          <p className="mt-1 text-sm text-slate-600">บอกว่าฐานข้อมูลตอบคำถามได้ครอบคลุมเพียงใด ไม่ใช้แทนคะแนนผลงานสถานที่</p>
          <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200 text-sm">
            <div className="flex justify-between gap-3 py-3"><dt>โปรไฟล์พื้นฐาน</dt><dd className="font-black">{value(data.quality.profileCoverage, "%")}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt>แบบสำรวจ</dt><dd className="font-black">{value(data.quality.surveyCoverage, "%")}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt>ค่าใช้จ่ายที่รายงานเอง</dt><dd className="font-black">{value(data.quality.expenseCoverage, "%")}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt>เกณฑ์ปกปิดกลุ่มเล็ก</dt><dd className="font-black">n &lt; {data.quality.smallCellThreshold}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-500">ข้อมูลไม่ครบจะถูกตัดออกจากตัวหารของมิตินั้น ไม่แทนช่องว่างด้วยศูนย์</p>
        </div>
      </section>

      <section className="border border-slate-200 bg-white" aria-labelledby="funnel-heading">
        <div className="border-b border-slate-200 p-5"><h2 id="funnel-heading" className="text-lg font-black">เส้นทางจากจุดเข้าไปถึงเสียงตอบรับ</h2><p className="mt-1 text-sm text-slate-600">ทุกขั้นนับ Visit หรือ entry session ไม่ซ้ำ และระบุเมื่อ entry ก่อนสร้าง Visit เชื่อมกลับไม่ได้</p></div>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2 xl:grid-cols-7">
          {data.funnel.map((stage, index) => (
            <div key={stage.key} className="relative bg-white p-4">
              <span className="text-xs font-black text-[#B94727]">{String(index + 1).padStart(2, "0")}</span>
              <p className="mt-2 min-h-10 text-sm font-bold leading-5">{stage.label}</p>
              <p className="mt-3 text-2xl font-black tabular-nums">{stage.available ? stage.count.toLocaleString("th-TH") : "N/A"}</p>
              <p className="mt-1 text-xs text-slate-500">{stage.conversionFromPrevious === null ? stage.note ?? "จุดเริ่มต้น" : `${stage.conversionFromPrevious}% จากขั้นก่อน`}</p>
              {stage.dropOffFromPrevious !== null && stage.dropOffFromPrevious > 0 ? <p className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-rose-700"><TrendDown aria-hidden="true" /> หลุด {stage.dropOffFromPrevious}%</p> : null}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="audience-heading">
        <div className="mb-4"><h2 id="audience-heading" className="text-xl font-black">ใครมา และเดินทางอย่างไร</h2><p className="mt-1 text-sm text-slate-600">มิติประชากรนับโปรไฟล์ไม่ซ้ำ ส่วนพฤติกรรมเดินทางนับ Visit ที่ตอบมิตินั้น</p></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DistributionPanel title="จังหวัดต้นทาง" description="ฐาน: โปรไฟล์ไม่ซ้ำที่ระบุจังหวัด" rows={data.audience.originProvinces} />
          <DistributionPanel title="ช่วงอายุ" description="ฐาน: โปรไฟล์ไม่ซ้ำที่ระบุช่วงอายุ" rows={data.audience.ageGroups} />
          <DistributionPanel title="ภาษา" description="ฐาน: โปรไฟล์ไม่ซ้ำที่มี preferred language" rows={data.audience.languages} />
          <DistributionPanel title="ผู้ร่วมเดินทาง" description="ฐาน: Visit ที่ตอบคำถามนี้" rows={data.audience.companions} />
          <DistributionPanel title="การเดินทาง" description="ฐาน: Visit ที่ตอบรูปแบบการเดินทาง" rows={data.audience.transports} />
          <DistributionPanel title="การค้างคืน" description="ฐาน: Visit ที่ตอบสถานะค้างคืน" rows={data.audience.overnight} />
          <DistributionPanel title="วัตถุประสงค์" description="ฐาน: Visit ที่ตอบวัตถุประสงค์" rows={data.audience.purposes} />
          <DistributionPanel title="ประเทศต้นทาง" description="ฐาน: โปรไฟล์ไม่ซ้ำที่ระบุประเทศ" rows={data.audience.originCountries} />
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2" aria-labelledby="experience-heading">
        <div className="border border-slate-200 bg-white p-5">
          <h2 id="experience-heading" className="text-lg font-black">คุณภาพประสบการณ์</h2>
          <p className="mt-1 text-sm text-slate-600">แต่ละมิติใช้ตัวหารของตัวเอง และปกปิดค่าเฉลี่ยเมื่อ n ต่ำกว่าเกณฑ์</p>
          {!satisfactionReady ? <p className="mt-5 border border-dashed border-slate-300 bg-slate-50 p-4 text-sm">ยังไม่มีมิติที่มีฐานเพียงพอสำหรับแสดงค่าเฉลี่ย</p> : null}
          <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
            {data.satisfaction.map((metric) => (
              <div key={metric.key} className="grid grid-cols-[minmax(0,1fr)_5rem_6rem] items-center gap-3 py-3 text-sm"><p className="font-bold">{metric.label}</p><p className="text-right text-slate-500">n={metric.sampleSize}</p><p className="text-right font-black">{metric.suppressed ? "ปกปิด" : metric.value === null ? "N/A" : `${metric.value.toFixed(2)} / 5`}</p></div>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DistributionPanel title="ตั้งใจกลับมา" description="ฐาน: คำตอบ revisit intention" rows={data.intentions.revisit} />
          <DistributionPanel title="ตั้งใจแนะนำ" description="ฐาน: คำตอบ recommendation intention" rows={data.intentions.recommend} />
          <div className="border border-slate-200 bg-white p-5 sm:col-span-2"><p className="text-xs font-bold text-slate-500">ความคิดเห็นปลายเปิด</p><p className="mt-2 text-3xl font-black">{data.intentions.commentCount.toLocaleString("th-TH")}</p><p className="mt-1 text-sm text-slate-600">แสดงเฉพาะจำนวนในหน้านี้ เนื้อหารายข้อความอยู่ภายใต้สิทธิและกระบวนการทบทวน Feedback</p></div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <DistributionPanel title="ช่วงค่าใช้จ่ายที่รายงานเอง" description={data.expenses.note} rows={data.expenses.ranges} />
        <DistributionPanel title="หมวดค่าใช้จ่ายหลัก" description={`ฐาน ${data.expenses.responseCount.toLocaleString("th-TH")} ระเบียนค่าใช้จ่าย · ไม่ใช่รายได้ธุรกิจ`} rows={data.expenses.categories} />
      </section>

      <section className="border border-slate-200 bg-white" aria-labelledby="decision-heading">
        <div className="grid gap-4 border-b border-slate-200 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div><h2 id="decision-heading" className="text-lg font-black">จากหลักฐานไปสู่การปรับปรุง</h2><p className="mt-1 text-sm text-slate-600">ใช้ประเด็นและแผนงาน production เดิม เพื่อให้ผู้รับผิดชอบ กำหนดส่ง Baseline และ Follow-up ตรวจย้อนหลังได้</p></div><Link href={`/admin/attractions/${data.attraction.attractionId}/improvements?dateStart=${data.filters.dateFrom}&dateEnd=${data.filters.dateTo}`} className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#202020] px-4 text-sm font-black text-white hover:bg-[#B94727]">จัดการประเด็นและแผนงาน <ArrowRight aria-hidden="true" /></Link></div>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-4"><Kpi icon={<Warning size={20} weight="fill" />} label="ประเด็นทั้งหมด" valueText={String(data.improvements.issueCount)} note="ผ่านการทบทวนตามกฎ" /><Kpi icon={<Warning size={20} />} label="ประเด็นที่ยังเปิด" valueText={String(data.improvements.openIssueCount)} note="ยังไม่ปิดหรือปฏิเสธ" /><Kpi icon={<ClipboardText size={20} />} label="แผนปรับปรุง" valueText={String(data.improvements.actionCount)} note="เชื่อมกับประเด็นที่ตรวจแล้ว" /><Kpi icon={<Warning size={20} weight="fill" />} label="เลยกำหนด" valueText={String(data.improvements.overdueActionCount)} note="ยังไม่เสร็จ/ยืนยันผล" /></div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2" aria-label="ข้อค้นพบเพื่อการตัดสินใจ">
        {data.insights.map((insight) => <article key={insight.title} className="border border-slate-200 border-t-2 border-t-[#B94727] bg-white p-5"><p className="text-xs font-bold text-[#9A3412]">{INSIGHT_TONE_LABELS[insight.tone]}</p><h3 className="mt-2 text-lg font-black">{insight.title}</h3><p className="mt-2 text-sm leading-6 text-slate-600"><strong className="text-slate-900">หลักฐาน:</strong> {insight.evidence}</p><p className="mt-1 text-sm leading-6 text-slate-600"><strong className="text-slate-900">ขั้นถัดไป:</strong> {insight.action}</p></article>)}
      </section>

      <details className="border border-slate-200 bg-white">
        <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-5 font-black"><ChartBar aria-hidden="true" /> นิยามตัวชี้วัดและข้อจำกัด</summary>
        <div className="overflow-x-auto border-t border-slate-200"><table className="w-full min-w-[960px] text-sm"><thead className="bg-slate-50 text-left text-xs text-slate-600"><tr><th className="px-4 py-3">ตัวชี้วัด</th><th className="px-4 py-3">หน่วย/ตัวหาร</th><th className="px-4 py-3">แหล่งข้อมูล</th><th className="px-4 py-3">Missing rule</th><th className="px-4 py-3">ใช้ตัดสินใจ</th></tr></thead><tbody className="divide-y divide-slate-100">{data.metricContract.map((metric) => <tr key={metric.key}><td className="px-4 py-3 font-bold">{metric.label}</td><td className="px-4 py-3">{metric.unit}<br /><span className="text-xs text-slate-500">{metric.denominator}</span></td><td className="px-4 py-3 font-mono text-xs">{metric.source}<br />{metric.dateField}</td><td className="px-4 py-3">{metric.missingRule}</td><td className="px-4 py-3">{metric.decisionUse}</td></tr>)}</tbody></table></div>
      </details>

      <p className="border-l-2 border-slate-400 pl-3 text-xs leading-6 text-slate-600">{data.interpretation}</p>
    </div>
  );
}
