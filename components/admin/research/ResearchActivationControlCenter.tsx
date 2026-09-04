import { CheckCircle, ClipboardText, Flask, LockKey, Warning } from "@phosphor-icons/react/dist/ssr";

import {
  freezeResearchStudyAction,
  recordResearchActivationEvidenceAction,
  recordResearchPilotReviewAction,
} from "@/app/actions/admin-research-actions";
import type { AdminResearchStudyDetail } from "@/lib/repositories/admin-research.repository";

const EVIDENCE_LABELS = {
  expert_review: "ผู้เชี่ยวชาญตรวจเครื่องมือ",
  cognitive_pretest: "Cognitive pretest และภาระผู้เข้าร่วม",
  mobile_flow_qa: "Mobile E2E และการถอนตัว",
} as const;

const DECISION_LABELS = {
  revise: "แก้เครื่องมือก่อน",
  repeat_pilot: "ทำ Pilot ซ้ำ",
  ready_for_field: "พร้อมเก็บข้อมูลภาคสนาม",
} as const;

function metric(value: number | null, suffix = "") {
  return value === null ? "ไม่ระบุ" : `${value.toLocaleString("th-TH")}${suffix}`;
}

export function ResearchActivationControlCenter({ detail, canManage, canFreeze }: { detail: AdminResearchStudyDetail; canManage: boolean; canFreeze: boolean }) {
  const latestByType = new Map<string, typeof detail.activationEvidence[number]>();
  detail.activationEvidence.forEach((item) => {
    const current = latestByType.get(item.evidenceType);
    if (!current || item.versionNumber > current.versionNumber || (item.versionNumber === current.versionNumber && item.recordedAt > current.recordedAt)) {
      latestByType.set(item.evidenceType, item);
    }
  });
  const canReviewPilot = detail.study.studyKind === "pilot" && ["paused", "closed"].includes(detail.study.status);

  return (
    <section id="research-activation-control" className="scroll-mt-24 border border-[var(--admin-border)] bg-white" aria-labelledby="activation-control-heading">
      <div className="grid gap-4 border-b border-[var(--admin-border)] bg-[#202020] p-5 text-white lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div>
          <p className="text-xs font-bold uppercase text-orange-300">Research governance</p>
          <h2 id="activation-control-heading" className="mt-1 text-xl font-black">ศูนย์ควบคุม Pilot และ Version Freeze</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">หลักฐานส่วนนี้ใช้ควบคุมการเปิดเก็บข้อมูล ไม่เก็บชื่อผู้ทดสอบหรือคำตอบรายบุคคล และแก้ไขย้อนหลังไม่ได้หลัง Freeze</p>
        </div>
        <span className="inline-flex min-h-10 w-fit items-center gap-2 border border-white/20 bg-white/10 px-3 text-sm font-black">
          {detail.study.studyKind === "pilot" ? <Flask aria-hidden="true" /> : <ClipboardText aria-hidden="true" />}
          {detail.study.studyKind === "pilot" ? "Pilot ควบคุม" : "Final collection"}
        </span>
      </div>

      {detail.study.studyKind === "pilot" ? <div className="grid gap-px bg-[var(--admin-border)] xl:grid-cols-3">
        {(Object.keys(EVIDENCE_LABELS) as Array<keyof typeof EVIDENCE_LABELS>).map((key) => {
          const evidence = latestByType.get(key);
          const passed = evidence?.status === "passed" || evidence?.status === "not_required";
          return (
            <article id={`research-evidence-${key}`} key={key} className="scroll-mt-24 bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-bold text-slate-500">หลักฐานล่าสุด</p><h3 className="mt-1 font-black">{EVIDENCE_LABELS[key]}</h3></div>
                <span className={`flex size-9 shrink-0 items-center justify-center ${passed ? "bg-emerald-700 text-white" : "bg-amber-50 text-amber-700"}`}>{passed ? <CheckCircle aria-hidden="true" weight="fill" /> : <Warning aria-hidden="true" weight="fill" />}</span>
              </div>
              {evidence ? (
                <dl className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between gap-3"><dt>สถานะ</dt><dd className="font-bold text-slate-900">{evidence.status}</dd></div>
                  <div className="flex justify-between gap-3"><dt>รุ่น</dt><dd className="font-bold text-slate-900">v{evidence.versionNumber}</dd></div>
                  <div className="flex justify-between gap-3"><dt>วันที่</dt><dd className="font-bold text-slate-900">{new Date(evidence.evidenceDate).toLocaleDateString("th-TH")}</dd></div>
                  <div className="flex justify-between gap-3"><dt>ผู้ทดสอบ</dt><dd className="font-bold text-slate-900">{metric(evidence.participantCount, " คน")}</dd></div>
                </dl>
              ) : <p className="mt-4 text-sm text-amber-800">ยังไม่มีหลักฐานรุ่นที่ผ่านเกณฑ์</p>}
            </article>
          );
        })}
      </div> : <div className="flex items-start gap-3 bg-orange-50 p-5 text-sm text-orange-950"><ClipboardText className="mt-0.5 shrink-0" aria-hidden="true" /><div><p className="font-black">Final collection ใช้หลักฐานจาก Pilot ต้นทาง</p><p className="mt-1 leading-6">Expert review, cognitive pretest และ mobile QA ต้องอยู่ใน Pilot ที่เชื่อมไว้ ส่วนหน้านี้แสดงผลตัดสินล่าสุดและ Freeze ของ final protocol โดยไม่คัดลอกหลักฐานซ้ำ</p></div></div>}

      {canManage && detail.study.studyKind === "pilot" && detail.study.status === "draft" ? (
        <details className="border-t border-[var(--admin-border)]">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-5 font-black"><ClipboardText aria-hidden="true" /> บันทึกหลักฐาน Expert review / Pretest / Mobile QA</summary>
          <form action={recordResearchActivationEvidenceAction} className="grid gap-4 border-t border-[var(--admin-border)] bg-slate-50 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <input type="hidden" name="studyId" value={detail.study.researchStudyId} />
            <label className="text-sm font-bold">ประเภทหลักฐาน<select name="evidenceType" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal">{Object.entries(EVIDENCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-sm font-bold">สถานะ<select name="status" defaultValue="passed" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="passed">ผ่าน</option><option value="failed">ไม่ผ่าน</option><option value="not_required">ไม่จำเป็น (มีเหตุผลรองรับ)</option></select></label>
            <label className="text-sm font-bold">รุ่นหลักฐาน<input type="number" name="versionNumber" min="1" defaultValue="1" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">วันที่หลักฐาน<input type="date" name="evidenceDate" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold xl:col-span-2">เลขอ้างอิง/ตำแหน่งไฟล์<input name="reference" required maxLength={500} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">จำนวนผู้ทดสอบ<input type="number" name="participantCount" min="0" max="10000" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">เวลามัธยฐาน (วินาที)<input type="number" name="medianCompletionSeconds" min="0" max="86400" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">Abandonment (%)<input type="number" name="abandonmentRate" min="0" max="100" step="0.01" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">Missingness (%)<input type="number" name="missingnessRate" min="0" max="100" step="0.01" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold sm:col-span-2">สรุปสิ่งที่ตรวจและผลที่พบ<textarea name="summary" required rows={3} maxLength={4000} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label>
            <button type="submit" className="min-h-11 self-end bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2">บันทึกหลักฐานแบบมี Audit trail</button>
          </form>
        </details>
      ) : null}

      <div className="grid gap-px border-t border-[var(--admin-border)] bg-[var(--admin-border)] lg:grid-cols-2">
        <div className="bg-white p-5">
          <div className="flex items-start gap-3">
            <span className={`flex size-10 shrink-0 items-center justify-center ${detail.freezeSnapshot ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-600"}`}><LockKey aria-hidden="true" /></span>
            <div><h3 className="font-black">Version freeze snapshot</h3><p className="mt-1 text-sm text-slate-600">ล็อก manifest เครื่องมือและเวอร์ชันระบบที่ใช้จริง</p></div>
          </div>
          {detail.freezeSnapshot ? <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2"><div><dt className="text-slate-500">Application</dt><dd className="font-mono font-bold">{detail.freezeSnapshot.applicationRevision}</dd></div><div><dt className="text-slate-500">Database</dt><dd className="font-mono font-bold">{detail.freezeSnapshot.databaseRevision}</dd></div><div><dt className="text-slate-500">Scoring</dt><dd className="font-bold">{detail.freezeSnapshot.scoringVersion}</dd></div><div><dt className="text-slate-500">Frozen</dt><dd className="font-bold">{new Date(detail.freezeSnapshot.frozenAt).toLocaleString("th-TH")}</dd></div></dl> : null}
        </div>
        <div className="bg-white p-5">
          <h3 className="font-black">ผลตัดสินจาก Pilot</h3>
          {detail.study.studyKind === "final_collection" ? (
            <p className={`mt-3 border p-3 text-sm font-bold ${detail.sourcePilotReadyForField ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-amber-300 bg-amber-50 text-amber-900"}`}>{detail.sourcePilotReadyForField ? "Pilot ต้นทางอนุมัติ ready_for_field แล้ว" : "ยังไม่มีผล ready_for_field จาก Pilot ต้นทาง"}</p>
          ) : detail.pilotReviews.length > 0 ? (
            <div className="mt-3"><p className="text-xl font-black text-[#B94727]">{DECISION_LABELS[detail.pilotReviews[0].decision]}</p><p className="mt-1 text-sm text-slate-600">ฐาน {detail.pilotReviews[0].reviewedSessionCount.toLocaleString("th-TH")} sessions · abandonment {metric(detail.pilotReviews[0].abandonmentRate, "%")}</p></div>
          ) : <p className="mt-3 text-sm text-slate-600">สรุปผลได้หลังพักหรือปิด Pilot</p>}
        </div>
      </div>

      {canManage && detail.study.status === "draft" && !detail.freezeSnapshot && canFreeze ? (
        <details className="border-t border-[var(--admin-border)]">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-5 font-black"><LockKey aria-hidden="true" /> สร้าง Version freeze snapshot</summary>
          <form action={freezeResearchStudyAction} className="grid gap-4 border-t border-[var(--admin-border)] bg-slate-50 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <input type="hidden" name="studyId" value={detail.study.researchStudyId} />
            {[["scoringVersion", "Scoring version"], ["retentionVersion", "Retention version"], ["withdrawalVersion", "Withdrawal version"], ["languageVersion", "Language version"], ["inclusionVersion", "Inclusion version"], ["applicationRevision", "Application revision/commit"], ["databaseRevision", "Database migration revision"]].map(([name, label]) => <label key={name} className="text-sm font-bold">{label}<input name={name} required maxLength={100} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>)}
            <label className="flex min-h-11 items-center gap-2 border border-amber-300 bg-amber-50 px-3 text-sm font-bold xl:col-span-4"><input type="checkbox" name="confirmImmutable" value="true" required /> ยืนยันว่า manifest นี้ตรวจแล้วและแก้ไขย้อนหลังไม่ได้</label>
            <button type="submit" className="min-h-11 bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] xl:col-span-4">บันทึก Freeze snapshot</button>
          </form>
        </details>
      ) : canManage && detail.study.status === "draft" && !detail.freezeSnapshot ? (
        <div className="flex items-start gap-3 border-t border-amber-300 bg-amber-50 p-5 text-sm text-amber-950">
          <Warning className="mt-0.5 shrink-0" aria-hidden="true" weight="fill" />
          <div><p className="font-black">ยังไม่เปิดให้ Freeze</p><p className="mt-1 leading-6">ปิดรายการความพร้อมที่แก้ไขได้ทั้งหมดก่อน เพื่อไม่ให้ approval, เครื่องมือ หรือจุดเก็บข้อมูลถูกล็อกกลางทาง</p></div>
        </div>
      ) : null}

      {canManage && canReviewPilot ? (
        <details className="border-t border-[var(--admin-border)]">
          <summary className="flex min-h-14 cursor-pointer list-none items-center gap-2 px-5 font-black"><Flask aria-hidden="true" /> สรุปผล Pilot และตัดสินใจก่อน Field collection</summary>
          <form action={recordResearchPilotReviewAction} className="grid gap-4 border-t border-[var(--admin-border)] bg-slate-50 p-5 sm:grid-cols-2 xl:grid-cols-4">
            <input type="hidden" name="studyId" value={detail.study.researchStudyId} />
            <label className="text-sm font-bold">ผลตัดสิน<select name="decision" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal">{Object.entries(DECISION_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="text-sm font-bold">Sessions ที่ทบทวน<input type="number" name="reviewedSessionCount" min="0" max="10000" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">เวลามัธยฐาน (วินาที)<input type="number" name="medianCompletionSeconds" min="0" max="86400" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">จำเป็นเมื่อเลือกพร้อมเก็บภาคสนาม</span></label>
            <label className="text-sm font-bold">Abandonment (%)<input type="number" name="abandonmentRate" min="0" max="100" step="0.01" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">จำเป็นเมื่อเลือกพร้อมเก็บภาคสนาม</span></label>
            <label className="text-sm font-bold">Missingness (%)<input type="number" name="missingnessRate" min="0" max="100" step="0.01" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /><span className="mt-1 block text-xs font-normal text-slate-500">จำเป็นเมื่อเลือกพร้อมเก็บภาคสนาม</span></label>
            <label className="text-sm font-bold sm:col-span-2 xl:col-span-3">Reliability readiness<textarea name="reliabilityNote" required rows={3} maxLength={4000} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label>
            <label className="text-sm font-bold sm:col-span-2">เหตุผลการตัดสินใจ<textarea name="decisionRationale" required rows={3} maxLength={4000} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label>
            <button type="submit" className="min-h-11 self-end bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2">บันทึกผล Pilot</button>
          </form>
        </details>
      ) : null}
    </section>
  );
}
