import {
  ArrowSquareOut,
  CheckCircle,
  ClipboardText,
  Clock,
  Flask,
  LockKey,
  Prohibit,
  UsersThree,
  Warning,
} from "@phosphor-icons/react/dist/ssr";

import type { ResearchAnalyticsViewModel } from "@/lib/services/admin-research.service";

const INSTRUMENT_STATUS = {
  aligned: { label: "รุ่นเครื่องมือตรงกับ Freeze", tone: "border-emerald-300 bg-emerald-50 text-emerald-950", icon: CheckCircle },
  mixed: { label: "เครื่องมือปะปนหลายรุ่น", tone: "border-rose-300 bg-rose-50 text-rose-950", icon: Warning },
  mismatch: { label: "รุ่นที่ใช้ไม่ตรงกับ Freeze", tone: "border-rose-300 bg-rose-50 text-rose-950", icon: Warning },
  not_frozen: { label: "ยังไม่มี Version Freeze", tone: "border-amber-300 bg-amber-50 text-amber-950", icon: LockKey },
  no_responses: { label: "ยังไม่มี Response สำหรับตรวจรุ่น", tone: "border-slate-300 bg-slate-50 text-slate-800", icon: ClipboardText },
} as const;

const GATE_LABELS = {
  pass: "ผ่าน",
  fail: "ไม่ผ่าน",
  insufficient_sample: "ตัวอย่างยังน้อย",
  no_data: "ยังไม่มีข้อมูล",
} as const;

const MODE_LABELS: Record<string, string> = {
  field_observation: "ภาคสนามจริง",
  simulated_usability: "สถานการณ์จำลอง",
  pilot_internal: "ทดสอบภายใน",
};

const PARTICIPANT_LABELS: Record<string, string> = {
  tourist: "นักท่องเที่ยว",
  operator: "ผู้ประกอบการ",
  attraction_manager: "ผู้ดูแลสถานที่",
};

function durationLabel(seconds: number | null) {
  if (seconds === null) return "ยังไม่มีข้อมูล";
  if (seconds < 60) return `${Math.round(seconds)} วินาที`;
  return `${(seconds / 60).toLocaleString("th-TH", { maximumFractionDigits: 1 })} นาที`;
}

function gateTone(status: keyof typeof GATE_LABELS) {
  if (status === "pass") return "border-emerald-300 bg-emerald-50 text-emerald-950";
  if (status === "fail") return "border-rose-300 bg-rose-50 text-rose-950";
  return "border-amber-300 bg-amber-50 text-amber-950";
}

function ComparisonTable({
  title,
  groups,
  labels,
}: {
  title: string;
  groups: ResearchAnalyticsViewModel["comparisons"]["collectionModes"];
  labels: Record<string, string>;
}) {
  return (
    <div className="min-w-0">
      <h3 className="text-sm font-black text-slate-900">{title}</h3>
      {groups.length === 0 ? <p className="mt-3 border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">ยังไม่มีกลุ่มในขอบเขตนี้</p> : (
        <div className="mt-3 overflow-x-auto border border-slate-200">
          <table className="w-full min-w-[31rem] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-600">
              <tr><th className="px-3 py-3 font-bold">กลุ่ม</th><th className="px-3 py-3 font-bold">ฐาน</th><th className="px-3 py-3 font-bold">ส่งสำเร็จ</th><th className="px-3 py-3 font-bold">เวลามัธยฐาน</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {groups.map((group) => (
                <tr key={group.key}>
                  <th scope="row" className="px-3 py-3 font-bold text-slate-900">{labels[group.key] ?? group.key}</th>
                  {group.suppressed ? <td colSpan={3} className="px-3 py-3 font-bold text-slate-500"><span className="inline-flex items-center gap-1.5"><Prohibit aria-hidden="true" /> ปกปิด n&lt;10</span></td> : (
                    <><td className="px-3 py-3">n={group.sampleSize}</td><td className="px-3 py-3 font-bold">{group.completionRate === null ? "ไม่มีข้อมูล" : `${group.completionRate}%`}</td><td className="px-3 py-3">{durationLabel(group.medianSeconds)}</td></>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function ResearchPilotMonitoring({ analytics }: { analytics: ResearchAnalyticsViewModel }) {
  const instrument = INSTRUMENT_STATUS[analytics.instrumentControl.status];
  const InstrumentIcon = instrument.icon;
  const readinessReady = analytics.pilotReadiness.decision === "ready_for_review";
  const sequence = [
    { key: "recruitment", label: "รับเชิญ", value: analytics.researchSequence.recruitment.available ? analytics.researchSequence.recruitment.count?.toLocaleString("th-TH") : "ยังวัดไม่ได้", note: "ก่อน consent" },
    { key: "consented", label: "ยินยอม", value: analytics.researchSequence.consented.toLocaleString("th-TH"), note: "sessions ที่สร้างแล้ว" },
    { key: "eligible", label: "เข้าเกณฑ์", value: analytics.researchSequence.eligible.toLocaleString("th-TH"), note: "ไม่ถอน/ไม่คัดออก" },
    { key: "started", label: "เริ่มประเมิน", value: analytics.researchSequence.evaluationStarted.toLocaleString("th-TH"), note: "มี response" },
    { key: "submitted", label: "ส่งสำเร็จ", value: analytics.researchSequence.evaluationSubmitted.toLocaleString("th-TH"), note: "แบบประเมินระบบ" },
    { key: "operator", label: "ทำโจทย์ตัดสินใจ", value: analytics.researchSequence.operatorAttemptsCompleted.toLocaleString("th-TH"), note: "attempts ที่เสร็จ" },
  ];

  return (
    <section className="space-y-6" aria-label="การติดตาม Pilot">
      <div id="research-instrument-control" className={`scroll-mt-24 border p-4 ${instrument.tone}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center border border-current/20 bg-white/70"><InstrumentIcon aria-hidden="true" size={21} weight="fill" /></span>
            <div className="min-w-0"><p className="text-xs font-black uppercase">Instrument control</p><h2 className="mt-1 text-lg font-black">{instrument.label}</h2><p className="mt-1 text-sm leading-6">{analytics.instrumentControl.freezeStatus === "frozen" ? `Freeze snapshot: ${analytics.instrumentControl.freezeSnapshotId}` : "ต้องล็อก study และ instrument manifest ก่อนใช้ผล Pilot ตัดสินใจ"}</p></div>
          </div>
          <div className="grid gap-1 text-xs lg:max-w-xl lg:text-right">
            <p><strong>รุ่นที่คาดหวัง:</strong> {analytics.instrumentControl.expectedVersions.join(", ") || "ยังไม่มีรุ่นที่ Freeze"}</p>
            <p><strong>รุ่นที่พบ:</strong> {analytics.instrumentControl.observedVersions.join(", ") || "ยังไม่มี response"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
        <div id="research-participant-sequence" className="scroll-mt-24 border border-[var(--admin-border)] bg-white" aria-labelledby="participant-sequence-heading">
          <div className="border-b border-[var(--admin-border)] p-5"><p className="text-xs font-black uppercase text-[#B94727]">Research sequence</p><h2 id="participant-sequence-heading" className="mt-1 text-lg font-black">เส้นทางจากการรับเชิญถึงผลการตัดสินใจ</h2><p className="mt-1 text-sm text-slate-600">แต่ละตัวเลขใช้หน่วยของตัวเองชัดเจน ไม่รวม invitation เป็น consent และไม่รวม attempt เป็นจำนวนคน</p></div>
          <ol className="grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
            {sequence.map((item, index) => (
              <li key={item.key} className="relative bg-white p-4">
                <span className="text-xs font-black text-[#B94727]">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-3 text-xs font-bold text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-black text-slate-950">{item.value}</p>
                <p className="mt-1 text-xs text-slate-500">{item.note}</p>
              </li>
            ))}
          </ol>
          {!analytics.researchSequence.recruitment.available ? <p className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-xs leading-5 text-amber-950"><strong>ข้อจำกัด recruitment:</strong> {analytics.researchSequence.recruitment.limitation}</p> : null}
        </div>

        <aside className="border border-[var(--admin-border)] bg-white" aria-labelledby="pilot-readiness-heading">
          <div className={`border-b p-5 ${readinessReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
            <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-black uppercase">Go / no-go evidence</p><h2 id="pilot-readiness-heading" className="mt-1 text-lg font-black">{readinessReady ? "พร้อมให้ทีมทบทวน" : "ยังไม่พร้อมตัดสิน Field collection"}</h2></div><Flask aria-hidden="true" size={26} weight="fill" /></div>
            <p className="mt-3 text-3xl font-black">{analytics.pilotReadiness.readyCount}<span className="text-base text-slate-500">/{analytics.pilotReadiness.totalCount} ผ่าน</span></p>
          </div>
          <details>
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-5 text-sm font-black">เปิดรายการหลักฐาน <span aria-hidden="true">+</span></summary>
            <ul className="divide-y divide-slate-200 border-t border-slate-200">
              {analytics.pilotReadiness.items.map((item) => (
                <li key={item.key} className="p-4">
                  <div className="flex items-start gap-2">{item.ready ? <CheckCircle className="mt-0.5 shrink-0 text-emerald-700" aria-hidden="true" weight="fill" /> : <Warning className="mt-0.5 shrink-0 text-amber-700" aria-hidden="true" weight="fill" />}<div><p className="text-sm font-bold">{item.label}</p><p className="mt-1 text-xs leading-5 text-slate-600">{item.evidenceLabel}</p><a href={item.evidenceHref} className="mt-2 inline-flex min-h-8 items-center gap-1 text-xs font-black text-[#A63D20] underline underline-offset-4">ตรวจหลักฐาน <ArrowSquareOut aria-hidden="true" /></a></div></div>
                </li>
              ))}
            </ul>
          </details>
        </aside>
      </div>

      <section id="research-evaluation-flow" className="scroll-mt-24 border border-[var(--admin-border)] bg-white" aria-labelledby="evaluation-flow-heading">
        <div className="grid gap-4 border-b border-[var(--admin-border)] p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div><p className="text-xs font-black uppercase text-[#B94727]">Participant burden</p><h2 id="evaluation-flow-heading" className="mt-1 text-lg font-black">การหลุดออกในแต่ละส่วนของแบบประเมิน</h2><p className="mt-1 text-sm text-slate-600">อนุมานจาก response และคำตอบที่บันทึกจริง; ผู้ที่ตอบถึงส่วนถัดไปถือว่าผ่านส่วนก่อนหน้าแล้ว</p></div>
          <p className="inline-flex items-center gap-2 text-sm font-bold text-slate-700"><Clock aria-hidden="true" /> เป้าหมายที่อนุมัติ ≤ 4 นาที</p>
        </div>
        <div className="grid gap-6 p-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(18rem,.7fr)]">
          <div>
            {!analytics.evaluationFlow.stageAnalysisAvailable ? <p className="mb-3 border border-amber-300 bg-amber-50 p-3 text-xs font-bold leading-5 text-amber-950">{analytics.evaluationFlow.stageAnalysisLimitation}</p> : null}
            <ol className="divide-y divide-slate-200 border-y border-slate-200">
              {analytics.evaluationFlow.stages.map((stage, index) => (
                <li key={stage.key} className="py-3">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 text-sm"><span className="font-bold">{index + 1}. {stage.label}</span><span className="font-black">{stage.count.toLocaleString("th-TH")}</span><span className={`min-w-16 text-right text-xs font-bold ${stage.dropoffFromPrevious && stage.dropoffFromPrevious > 0 ? "text-rose-700" : "text-slate-500"}`}>{stage.suppressed ? "ปกปิด" : stage.dropoffFromPrevious === null ? "ฐานเริ่ม" : `${stage.dropoffFromPrevious}%`}</span></div>
                  <div className="mt-2 h-2 overflow-hidden bg-slate-100" aria-hidden="true"><div className="h-full bg-[#C84B2A]" style={{ width: `${Math.max(0, Math.min(100, stage.rateFromStarted ?? 0))}%` }} /></div>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid content-start gap-3">
            {([
              ["ส่งสำเร็จ", analytics.evaluationFlow.gates.completion, analytics.evaluationFlow.completionRate === null ? "ไม่มีตัวหาร" : `${analytics.evaluationFlow.completionRate}% · เป้าหมาย ≥80%`],
              ["เวลามัธยฐาน", analytics.evaluationFlow.gates.duration, `${durationLabel(analytics.evaluationFlow.medianSeconds)} · n=${analytics.evaluationFlow.durationSampleSize}`],
              ["ข้อบังคับที่ขาดมากสุด", analytics.evaluationFlow.gates.requiredItemMissingness, analytics.evaluationFlow.worstRequiredItemMissingness === null ? "ยังไม่มีข้อมูล" : `${analytics.evaluationFlow.worstRequiredItemCode} · ${analytics.evaluationFlow.worstRequiredItemMissingness}% · เป้าหมาย ≤5%`],
            ] as const).map(([label, gate, value]) => <div key={label} className={`border p-4 ${gateTone(gate)}`}><p className="text-xs font-bold">{label}</p><p className="mt-1 text-lg font-black">{GATE_LABELS[gate]}</p><p className="mt-1 text-xs leading-5">{value}</p></div>)}
          </div>
        </div>
      </section>

      <section className="border border-[var(--admin-border)] bg-white p-5" aria-labelledby="descriptive-comparison-heading">
        <div className="flex items-start gap-3"><UsersThree aria-hidden="true" size={22} className="mt-0.5 shrink-0 text-[#B94727]" /><div><h2 id="descriptive-comparison-heading" className="text-lg font-black">เปรียบเทียบกลุ่มแบบไม่สรุปเหตุและผล</h2><p className="mt-1 text-sm leading-6 text-slate-600">{analytics.comparisons.interpretation}</p></div></div>
        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          <ComparisonTable title="ตาม Collection mode" groups={analytics.comparisons.collectionModes} labels={MODE_LABELS} />
          <ComparisonTable title="ตามประเภทผู้เข้าร่วม" groups={analytics.comparisons.participantTypes} labels={PARTICIPANT_LABELS} />
        </div>
      </section>
    </section>
  );
}
