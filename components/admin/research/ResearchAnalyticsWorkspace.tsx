import { Certificate, FunnelSimple, IdentificationCard, Warning } from "@phosphor-icons/react/dist/ssr";

import type { ResearchAnalyticsViewModel } from "@/lib/services/admin-research.service";
import { disclosableResearchCount, researchCountLabel, researchRateLabel } from "@/lib/research/disclosure";
import { ResearchConstructScoreChart, ResearchFunnelGraphic, type ResearchConstructDatum, type ResearchFunnelDatum } from "@/components/admin/research/ResearchAnalyticsCharts";
import { ResearchPilotMonitoring } from "@/components/admin/research/ResearchPilotMonitoring";

const CONSTRUCT_LABELS: Record<string, string> = {
  system_quality: "คุณภาพระบบ",
  information_quality: "คุณภาพข้อมูล",
  perceived_ease_of_use: "ความง่ายในการใช้งาน",
  perceived_usefulness: "ประโยชน์ที่รับรู้",
  privacy_trust: "ความเป็นส่วนตัวและความเชื่อมั่น",
  user_satisfaction: "ความพึงพอใจต่อระบบ",
  behavioral_intention: "ความตั้งใจใช้งานต่อ",
  incentive_engagement: "แรงจูงใจจากรางวัล",
};

const COLLECTION_MODE_LABELS: Record<string, string> = {
  field_observation: "เก็บข้อมูลภาคสนามจริง",
  simulated_usability: "ทดสอบสถานการณ์จำลอง",
  pilot_internal: "ทดสอบนำร่องภายใน",
};

const PARTICIPANT_TYPE_LABELS: Record<string, string> = {
  all: "ผู้เข้าร่วมทุกกลุ่ม",
  tourist: "นักท่องเที่ยว",
  operator: "ผู้ประกอบการ",
  attraction_manager: "ผู้ดูแลสถานที่",
};

const RESEARCH_COLORS = ["#D94717", "#E05B2B", "#D6A13D", "#3E7A4F", "#0A6B62", "#247C74", "#64748B", "#E78A6D"];

function durationLabel(seconds: number | null) {
  if (seconds === null) return "ยังไม่มีข้อมูล";
  if (seconds < 60) return `${Math.round(seconds)} วินาที`;
  return `${(seconds / 60).toLocaleString("th-TH", { maximumFractionDigits: 1 })} นาที`;
}

export function ResearchAnalyticsWorkspace({ analytics }: { analytics: ResearchAnalyticsViewModel }) {
  const threshold = analytics.scope.smallCellThreshold;
  const eligible = analytics.kpis.eligible;
  const certificateBase = analytics.incentives.certificateRecipients;
  const eligibleVisible = disclosableResearchCount(eligible, analytics.kpis.consented, threshold) !== null;
  const completedVisible = eligibleVisible && disclosableResearchCount(analytics.kpis.completed, eligible, threshold) !== null;
  const certificateVisible = eligibleVisible && disclosableResearchCount(certificateBase, eligible, threshold) !== null;
  const operatorAttemptsVisible = eligibleVisible && disclosableResearchCount(analytics.operator.completedAttempts, analytics.operator.completedAttempts, threshold) !== null;
  const funnelCounts = analytics.funnel.map((step) => eligibleVisible ? disclosableResearchCount(step.count, eligible, threshold) : null);
  const funnelChart: ResearchFunnelDatum[] = funnelCounts.every((count) => count !== null)
    ? analytics.funnel.map((step, index) => ({ key: step.key, name: step.label, count: step.count, fill: RESEARCH_COLORS[index % RESEARCH_COLORS.length] }))
    : [];
  const constructChart: ResearchConstructDatum[] = analytics.constructs.flatMap((construct, index) => {
    if (!eligibleVisible || construct.mean === null || disclosableResearchCount(construct.sampleSize, eligible, threshold) === null) return [];
    return [{
      constructKey: construct.constructKey,
      label: CONSTRUCT_LABELS[construct.constructKey] ?? construct.constructKey,
      score: construct.mean,
      scoreLabel: `${construct.mean.toLocaleString("th-TH", { minimumFractionDigits: 2 })} / 5`,
      fill: RESEARCH_COLORS[index % RESEARCH_COLORS.length],
    }];
  });
  return (
    <div className="space-y-6">
      <div id="research-scope" className="scroll-mt-24 flex flex-col gap-3 border-l-2 border-[#B94727] bg-[#FFF7F3] px-4 py-3 text-sm text-slate-700 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p><strong>ขอบเขต:</strong> {analytics.scope.dateFrom} ถึง {analytics.scope.dateTo} · หน่วยวิเคราะห์ Research session · เกณฑ์ปกปิด n &lt; {analytics.scope.smallCellThreshold}</p>
          <p className="mt-1 text-xs text-slate-600"><strong>รุ่นแบบประเมินในผลลัพธ์:</strong> {analytics.scope.instrumentVersions.length > 0 ? analytics.scope.instrumentVersions.join(", ") : "ยังไม่มี response ที่ส่งสำเร็จ"}</p>
        </div>
        <p className="font-bold text-[#8E351D]">{analytics.scope.collectionModes.map((mode) => COLLECTION_MODE_LABELS[mode] ?? mode).join(" · ")}</p>
      </div>

      {analytics.truncated ? <p role="alert" className="flex items-center gap-2 border border-amber-300 bg-amber-50 p-4 text-sm font-bold text-amber-900"><Warning aria-hidden="true" /> ผลลัพธ์เกินขีดจำกัด 5,000 sessions กรุณาลดช่วงวันที่ก่อนตีความหรือส่งออก</p> : null}

      {analytics.scope.studyKind === "pilot" ? <ResearchPilotMonitoring analytics={analytics} /> : (
        <section className="grid gap-px border border-[var(--admin-border)] bg-[var(--admin-border)] sm:grid-cols-2 xl:grid-cols-4" aria-label="ตัวชี้วัดงานวิจัย">
          <div className="bg-white p-5"><p className="text-xs font-bold text-slate-500">ยินยอม / เข้าเกณฑ์</p><p className="mt-2 text-2xl font-black">{researchCountLabel(analytics.kpis.consented, analytics.kpis.consented, threshold)} / {researchCountLabel(eligible, analytics.kpis.consented, threshold)}</p></div>
          <div className="bg-white p-5"><p className="text-xs font-bold text-slate-500">ส่งแบบประเมินสำเร็จ</p><p className="mt-2 text-2xl font-black">{eligibleVisible ? researchRateLabel(analytics.kpis.completed, eligible, threshold) : "ปกปิด"}</p><p className="mt-1 text-xs text-slate-500">{eligibleVisible ? researchCountLabel(analytics.kpis.completed, eligible, threshold) : "ปกปิด"} จาก {eligibleVisible ? researchCountLabel(eligible, eligible, threshold) : "ปกปิด"} sessions ที่เข้าเกณฑ์</p></div>
          <div className="bg-white p-5"><p className="text-xs font-bold text-slate-500">เวลามัธยฐานแบบประเมิน</p><p className="mt-2 text-2xl font-black">{!completedVisible || disclosableResearchCount(analytics.kpis.evaluationDurationCount, analytics.kpis.completed, threshold) === null ? "ปกปิด" : durationLabel(analytics.kpis.medianEvaluationSeconds)}</p><p className="mt-1 text-xs text-slate-500">จาก {completedVisible ? researchCountLabel(analytics.kpis.evaluationDurationCount, analytics.kpis.completed, threshold) : "ปกปิด"} responses ที่มีเวลา</p></div>
          <div className="bg-white p-5"><p className="text-xs font-bold text-slate-500">ความครบถ้วนข้อบังคับ</p><p className="mt-2 text-2xl font-black">{!completedVisible || disclosableResearchCount(analytics.kpis.requiredResponseCount, analytics.kpis.completed, threshold) === null ? "ปกปิด" : researchRateLabel(analytics.kpis.requiredAnswersPresent, analytics.kpis.requiredAnswersExpected, threshold)}</p><p className="mt-1 text-xs text-slate-500">จาก {completedVisible ? researchCountLabel(analytics.kpis.requiredResponseCount, analytics.kpis.completed, threshold) : "ปกปิด"} responses ที่ส่งแล้ว</p></div>
        </section>
      )}

      <section className="border border-[var(--admin-border)] bg-white p-5" aria-labelledby="incentive-heading">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center bg-[#FFF0E9] text-[#B94727]"><Certificate aria-hidden="true" size={22} weight="fill" /></span>
          <div><h2 id="incentive-heading" className="text-lg font-black">การตอบข้อมูลเพิ่มเติมหลังได้รับคุณค่า</h2><p className="mt-1 text-sm text-slate-600">วัดการทำขั้นต่อไปหลังสร้างใบประกาศสำเร็จ เป็นความสัมพันธ์เชิงพรรณนา ไม่ใช่หลักฐานว่ารางวัลเป็นสาเหตุ</p></div>
        </div>
        <div className="mt-5 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-4">
          <div className="bg-slate-50 p-4"><p className="text-xs text-slate-500">ตัวหาร: สร้างใบประกาศ</p><p className="mt-1 text-xl font-black">{eligibleVisible ? researchCountLabel(certificateBase, eligible, threshold) : "ปกปิด"} sessions</p></div>
          <div className="bg-slate-50 p-4"><p className="text-xs text-slate-500">ตอบแบบสำรวจท่องเที่ยว</p><p className="mt-1 text-xl font-black">{certificateVisible ? researchRateLabel(analytics.incentives.tourismSurveyCompleters, certificateBase, threshold) : "ปกปิด"}</p><p className="mt-1 text-xs text-slate-500">{certificateVisible ? researchCountLabel(analytics.incentives.tourismSurveyCompleters, certificateBase, threshold) : "ปกปิด"} sessions</p></div>
          <div className="bg-slate-50 p-4"><p className="text-xs text-slate-500">ส่งแบบประเมินระบบ</p><p className="mt-1 text-xl font-black">{certificateVisible ? researchRateLabel(analytics.incentives.evaluationCompleters, certificateBase, threshold) : "ปกปิด"}</p><p className="mt-1 text-xs text-slate-500">{certificateVisible ? researchCountLabel(analytics.incentives.evaluationCompleters, certificateBase, threshold) : "ปกปิด"} sessions</p></div>
          <div className="bg-slate-50 p-4"><p className="inline-flex items-center gap-1 text-xs text-slate-500"><IdentificationCard aria-hidden="true" /> บันทึก Passport</p><p className="mt-1 text-xl font-black">{certificateVisible ? researchRateLabel(analytics.incentives.passportSavers, certificateBase, threshold) : "ปกปิด"}</p><p className="mt-1 text-xs text-slate-500">{certificateVisible ? researchCountLabel(analytics.incentives.passportSavers, certificateBase, threshold) : "ปกปิด"} sessions</p></div>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">ความคิดเห็นต่อ Certificate, Stamp และ Leaderboard แสดงในองค์ประกอบ “แรงจูงใจจากรางวัล” เมื่อแบบประเมินรุ่นที่อาจารย์อนุมัติมีข้อคำถามดังกล่าว</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <div className="border border-[var(--admin-border)] bg-white p-5">
          <div className="flex items-center gap-2"><FunnelSimple aria-hidden="true" size={22} className="text-[#B94727]" /><h2 className="text-lg font-black">เส้นทางผู้เข้าร่วมหลังให้ consent</h2></div>
          <p className="mt-1 text-sm text-slate-600">นับผู้เข้าร่วมไม่ซ้ำในแต่ละขั้น ไม่ใช้จำนวน event เป็นจำนวนคน</p>
          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(220px,0.8fr)_minmax(0,1.2fr)]">
            {funnelChart.length > 0 ? <ResearchFunnelGraphic steps={funnelChart} /> : <p className="hidden self-center text-sm text-slate-600 lg:block">กราฟนี้ถูกปกปิดเมื่อมีขั้นตอนที่มีกลุ่มตัวอย่างเล็ก</p>}
            <ol className="divide-y divide-slate-100 border-y border-slate-100">
              {analytics.funnel.map((step, index) => (
                <li key={step.key} className="py-3">
                  <div className="flex items-end justify-between gap-3 text-sm"><span className="flex min-w-0 items-center gap-2 font-bold"><span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: RESEARCH_COLORS[index % RESEARCH_COLORS.length] }} />{step.label}</span><span className="shrink-0 font-black">{eligibleVisible ? researchCountLabel(step.count, eligible, threshold) : "ปกปิด"} <span className="font-normal text-slate-500">({eligibleVisible ? researchRateLabel(step.count, eligible, threshold) : "ปกปิด"})</span></span></div>
                  {funnelCounts[index] !== null ? <div className="mt-2 h-2 overflow-hidden rounded-sm bg-slate-100" aria-hidden="true"><div className="h-full rounded-sm" style={{ width: `${Math.max(0, Math.min(100, step.rate))}%`, backgroundColor: RESEARCH_COLORS[index % RESEARCH_COLORS.length] }} /></div> : null}
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="border border-[var(--admin-border)] bg-white p-5">
          <h2 className="text-lg font-black">คุณภาพชุดข้อมูล</h2>
          <dl className="mt-5 divide-y divide-slate-200 border-y border-slate-200 text-sm">
            <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">ถอนตัว</dt><dd className="font-black">{researchCountLabel(analytics.kpis.withdrawn, analytics.kpis.consented, threshold)}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">คัดออก (ไม่รวมถอนตัว)</dt><dd className="font-black">{researchCountLabel(analytics.kpis.excluded, analytics.kpis.consented, threshold)}</dd></div>
            <div className="flex justify-between gap-3 py-3"><dt className="text-slate-600">กลุ่มผู้เข้าร่วม</dt><dd className="font-black">{PARTICIPANT_TYPE_LABELS[analytics.scope.participantType] ?? analytics.scope.participantType}</dd></div>
          </dl>
          <p className="mt-4 text-xs leading-5 text-slate-500">ค่าที่มีขนาดกลุ่มต่ำกว่าเกณฑ์จะแสดงว่า “ปกปิด” และไม่คำนวณค่าเฉลี่ย เพื่อไม่ให้กลุ่มเล็กถูกระบุตัวได้</p>
        </div>
      </section>

      <section className="border border-[var(--admin-border)] bg-white" aria-labelledby="construct-heading">
        <div className="border-b border-[var(--admin-border)] p-5"><h2 id="construct-heading" className="text-lg font-black">คะแนนรายองค์ประกอบ</h2><p className="mt-1 text-sm text-slate-600">คำนวณจากข้อ 5 ระดับใน response ที่ส่งสมบูรณ์; reverse-score ถูกกลับค่าก่อนรวม</p></div>
        {analytics.constructs.length === 0 ? <p className="p-8 text-center text-sm text-slate-600">ยังไม่มี response ที่พร้อมคำนวณ</p> : (
          <>
            <ResearchConstructScoreChart constructs={constructChart} />
            <div className="divide-y divide-slate-200">
              {analytics.constructs.map((construct) => (
                <div key={construct.constructKey} className="grid gap-3 px-5 py-4 sm:grid-cols-[minmax(0,1fr)_8rem_8rem] sm:items-center">
                  <div><p className="font-bold">{CONSTRUCT_LABELS[construct.constructKey] ?? construct.constructKey}</p><p className="mt-0.5 font-mono text-xs text-slate-500">{construct.constructKey}</p></div>
                  <p className="text-sm text-slate-600">n = {eligibleVisible ? researchCountLabel(construct.sampleSize, eligible, threshold) : "ปกปิด"}</p>
                  <p className="text-right text-lg font-black">{!eligibleVisible || construct.mean === null || disclosableResearchCount(construct.sampleSize, eligible, threshold) === null ? "ปกปิด" : `${construct.mean.toLocaleString("th-TH", { minimumFractionDigits: 2 })} / 5`}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section id="research-operator-outcomes" className="scroll-mt-24 border border-[var(--admin-border)] bg-white p-5">
        <h2 className="text-lg font-black">การประเมินงานตัดสินใจของผู้ประกอบการ/ผู้ดูแลสถานที่</h2>
        <div className="mt-4 grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 xl:grid-cols-5">
          <div className="bg-slate-50 p-4"><p className="text-xs text-slate-500">งานที่ทำเสร็จ</p><p className="mt-1 text-xl font-black">{operatorAttemptsVisible ? researchCountLabel(analytics.operator.completedAttempts, analytics.operator.completedAttempts, threshold) : "ปกปิด"}</p></div>
          <div className="bg-slate-50 p-4"><p className="text-xs text-slate-500">ตรวจผลแล้ว</p><p className="mt-1 text-xl font-black">{operatorAttemptsVisible ? researchCountLabel(analytics.operator.assessedAttempts, analytics.operator.completedAttempts, threshold) : "ปกปิด"}</p></div>
          <div className="bg-slate-50 p-4"><p className="text-xs text-slate-500">ผ่านเกณฑ์</p><p className="mt-1 text-xl font-black">{operatorAttemptsVisible ? researchRateLabel(analytics.operator.passedAttempts, analytics.operator.assessedAttempts, threshold) : "ปกปิด"}</p></div>
          <div className="bg-slate-50 p-4"><p className="text-xs text-slate-500">เวลามัธยฐาน</p><p className="mt-1 text-xl font-black">{operatorAttemptsVisible ? durationLabel(analytics.operator.medianSeconds) : "ปกปิด"}</p></div>
          <div className="bg-slate-50 p-4"><p className="text-xs text-slate-500">ความมั่นใจเฉลี่ย</p><p className="mt-1 text-xl font-black">{operatorAttemptsVisible && !analytics.operator.confidenceSuppressed ? `${analytics.operator.meanConfidence?.toLocaleString("th-TH")} / 5` : "ปกปิด"}</p></div>
        </div>
      </section>

      <p className="text-xs leading-5 text-slate-500">{analytics.interpretation}</p>
    </div>
  );
}
