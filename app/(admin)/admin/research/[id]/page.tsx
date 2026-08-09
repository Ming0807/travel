import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, CheckCircle, LockKey, Pause, Play, Warning, X } from "@phosphor-icons/react/dist/ssr";

import {
  activateResearchStudyAction,
  createResearchInstrumentAction,
  createResearchItemAction,
  createResearchOperatorTaskAction,
  publishResearchInstrumentAction,
  publishResearchOperatorTaskAction,
  recordResearchApprovalAction,
  saveResearchDeploymentAction,
  transitionResearchStudyAction,
} from "@/app/actions/admin-research-actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminShell } from "@/components/admin/AdminShell";
import { ExportButton } from "@/components/admin/ExportButton";
import { ResearchAnalyticsWorkspace } from "@/components/admin/research/ResearchAnalyticsWorkspace";
import { ResearchOperatorAssessmentQueue } from "@/components/admin/research/ResearchOperatorAssessmentQueue";
import { requirePermission } from "@/lib/auth/guards";
import { getAdminResearchStudyWorkspace } from "@/lib/services/admin-research.service";
import { adminResearchAnalyticsFiltersSchema } from "@/lib/validation/admin-research";

export const metadata: Metadata = { title: "Research Workspace | ผู้ดูแลระบบ" };
export const dynamic = "force-dynamic";

const STATUS_LABELS = { draft: "ฉบับร่าง", active: "กำลังเก็บข้อมูล", paused: "พักการเก็บข้อมูล", closed: "ปิดการเก็บข้อมูล", archived: "เก็บถาวร" } as const;
const AUDIENCE_LABELS = { tourist: "นักท่องเที่ยว", operator: "ผู้ประกอบการ", attraction_manager: "ผู้ดูแลสถานที่" } as const;
const MODE_LABELS = { field_observation: "ใช้งานจริง ณ สถานที่", simulated_usability: "สถานการณ์จำลอง", pilot_internal: "ทดสอบภายใน" } as const;
const ANSWER_LABELS = { agreement_5: "เห็นด้วย 5 ระดับ", rating_5: "คะแนน 1–5", boolean: "ใช่/ไม่ใช่", integer: "จำนวนเต็ม", single_choice: "เลือกหนึ่งคำตอบ", short_text: "ข้อความสั้น", long_text: "ข้อความยาว" } as const;
const RESULT_MESSAGES: Record<string, { tone: "success" | "error"; text: string }> = {
  study_created: { tone: "success", text: "สร้างโครงการฉบับร่างแล้ว" },
  approval_recorded: { tone: "success", text: "บันทึกหลักฐานอนุมัติแล้ว" },
  instrument_created: { tone: "success", text: "สร้างแบบประเมินฉบับร่างแล้ว" },
  item_created: { tone: "success", text: "เพิ่มข้อคำถามแล้ว" },
  instrument_published: { tone: "success", text: "เผยแพร่และล็อกรุ่นแบบประเมินแล้ว" },
  operator_task_created: { tone: "success", text: "สร้างงานประเมินการตัดสินใจฉบับร่างแล้ว" },
  operator_task_published: { tone: "success", text: "เผยแพร่และล็อกรุ่นงานประเมินแล้ว" },
  operator_assessment_saved: { tone: "success", text: "บันทึกผลตรวจโจทย์ตัดสินใจแล้ว" },
  deployment_saved: { tone: "success", text: "บันทึกจุดเก็บข้อมูลแล้ว" },
  study_activated: { tone: "success", text: "เปิดเก็บข้อมูลแล้ว ระบบล็อก protocol รุ่นนี้เรียบร้อย" },
  study_status_updated: { tone: "success", text: "อัปเดตสถานะโครงการแล้ว" },
  approval_failed: { tone: "error", text: "ยังบันทึกหลักฐานอนุมัติไม่ได้ ตรวจวันที่ เลขอ้างอิง และการยืนยัน" },
  instrument_failed: { tone: "error", text: "ยังสร้างแบบประเมินไม่ได้ รหัสหรือหมายเลขรุ่นอาจซ้ำ" },
  item_failed: { tone: "error", text: "ยังเพิ่มข้อคำถามไม่ได้ ตรวจรหัส ลำดับ ชนิดคำตอบ และตัวเลือก" },
  instrument_publish_failed: { tone: "error", text: "ยังเผยแพร่ไม่ได้ ต้องมีข้อคำถาม ยืนยันการล็อกรุ่น และไม่มีรุ่นเผยแพร่ซ้ำ" },
  operator_task_failed: { tone: "error", text: "ยังสร้างงานประเมินไม่ได้ ตรวจรหัส รุ่น ลำดับ และเกณฑ์หลักฐาน" },
  operator_task_publish_failed: { tone: "error", text: "ยังเผยแพร่งานไม่ได้ ตรวจสถานะและยืนยันการล็อกรุ่น" },
  operator_assessment_failed: { tone: "error", text: "ยังบันทึกผลตรวจไม่ได้ ตรวจผลและคะแนนคุณภาพหลักฐาน" },
  deployment_failed: { tone: "error", text: "ยังผูกจุด QR ไม่ได้ จุดนี้อาจถูกใช้โดยโครงการ active อื่น" },
  activation_failed: { tone: "error", text: "ยังเปิดเก็บข้อมูลไม่ได้ กรุณาปิดรายการความพร้อมทุกข้อก่อน" },
  study_status_failed: { tone: "error", text: "ยังเปลี่ยนสถานะไม่ได้ ลำดับสถานะไม่ถูกต้องหรือโครงการยังไม่พร้อม" },
};

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function defaultScope() {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 89);
  return { dateFrom: isoDate(start), dateTo: isoDate(end) };
}

function formatDate(value: string | null) {
  if (!value) return "ไม่ระบุ";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(value));
}

export default async function AdminResearchStudyPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const guard = await requirePermission("research.read");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const defaults = defaultScope();
  const rawModes = query.mode ? (Array.isArray(query.mode) ? query.mode : [query.mode]) : ["field_observation"];
  const parsedFilters = adminResearchAnalyticsFiltersSchema.safeParse({
    studyId: id,
    dateFrom: one(query.dateFrom) ?? defaults.dateFrom,
    dateTo: one(query.dateTo) ?? defaults.dateTo,
    participantType: one(query.participantType) || undefined,
    collectionModes: rawModes,
    minCellThreshold: 10,
  });
  const filters = parsedFilters.success ? parsedFilters.data : { studyId: id, ...defaults, collectionModes: ["field_observation" as const], minCellThreshold: 10 as const };
  const workspace = await getAdminResearchStudyWorkspace(id, filters);
  if (!workspace) notFound();
  const { detail, readiness, canActivate, canManage, checkinCodes, operatorAssessments, analytics } = workspace;
  const result = one(query.result);
  const message = result ? RESULT_MESSAGES[result] : null;
  const isDraft = detail.study.status === "draft";

  return (
    <AdminShell admin={guard.actor}>
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow={`Protocol ${detail.study.protocolVersion}`}
          title={detail.study.titleTh}
          description={`รหัส ${detail.study.studyCode} · ${STATUS_LABELS[detail.study.status]} · ขอบเขต ${detail.study.scopeCode}`}
          actions={<Link href="/admin/research" className="inline-flex min-h-11 items-center gap-2 border border-slate-300 bg-white px-4 text-sm font-bold hover:bg-slate-50"><ArrowLeft aria-hidden="true" /> กลับศูนย์งานวิจัย</Link>}
        />

        {message ? <p role={message.tone === "error" ? "alert" : "status"} className={`border p-4 text-sm font-bold ${message.tone === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900"}`}>{message.text}</p> : null}

        <section className="border border-[var(--admin-border)] bg-white" aria-labelledby="readiness-heading">
          <div className="flex flex-col gap-3 border-b border-[var(--admin-border)] p-5 lg:flex-row lg:items-start lg:justify-between"><div><h2 id="readiness-heading" className="text-lg font-black">ความพร้อมก่อนเก็บข้อมูล</h2><p className="mt-1 text-sm text-slate-600">Activation จะล็อก protocol, notice, consent, instrument และ deployment รุ่นนี้ถาวร</p></div><span className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-sm font-black ${canActivate ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-amber-300 bg-amber-50 text-amber-900"}`}>{canActivate ? <CheckCircle aria-hidden="true" weight="fill" /> : <Warning aria-hidden="true" weight="fill" />}{readiness.filter((item) => item.ready).length}/{readiness.length} พร้อม</span></div>
          <div className="divide-y divide-slate-200">
            {readiness.map((item) => <div key={item.key} className="flex items-start gap-3 px-5 py-3"><span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center ${item.ready ? "bg-emerald-700 text-white" : "bg-slate-100 text-slate-500"}`}>{item.ready ? <Check aria-hidden="true" weight="bold" /> : <X aria-hidden="true" weight="bold" />}</span><div><p className="text-sm font-bold">{item.label}</p>{!item.ready ? <p className="mt-0.5 text-xs text-slate-500">{item.blockingReason}</p> : null}</div></div>)}
          </div>
        </section>

        <section className="border border-[var(--admin-border)] bg-white p-5" aria-labelledby="analytics-filter-heading">
          <h2 id="analytics-filter-heading" className="text-lg font-black">ขอบเขตการวิเคราะห์</h2>
          <form method="get" className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <label className="text-sm font-bold">เริ่มวันที่<input type="date" name="dateFrom" defaultValue={filters.dateFrom} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">สิ้นสุดวันที่<input type="date" name="dateTo" defaultValue={filters.dateTo} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="text-sm font-bold">กลุ่มผู้เข้าร่วม<select name="participantType" defaultValue={filters.participantType ?? ""} className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">ทุกกลุ่ม</option><option value="tourist">นักท่องเที่ยว</option><option value="operator">ผู้ประกอบการ</option><option value="attraction_manager">ผู้ดูแลสถานที่</option></select></label>
            <fieldset className="border border-slate-300 px-3 py-2 sm:col-span-2 xl:col-span-1"><legend className="px-1 text-sm font-bold">Collection mode</legend>{Object.entries(MODE_LABELS).map(([value, label]) => <label key={value} className="flex min-h-9 items-center gap-2 text-xs"><input type="checkbox" name="mode" value={value} defaultChecked={filters.collectionModes.includes(value as typeof filters.collectionModes[number])} /> {label}</label>)}</fieldset>
            <button type="submit" className="min-h-11 self-end bg-[#202020] px-4 font-black text-white hover:bg-[#B94727]">วิเคราะห์ขอบเขตนี้</button>
          </form>
          {guard.actor.permissions.includes("research.export") ? (
            <details className="mt-4 border-t border-slate-200 pt-4">
              <summary className="cursor-pointer text-sm font-black text-[#B94727]">ส่งออกชุดข้อมูลแบบไม่ระบุตัวตน</summary>
              <div className="mt-3 flex flex-wrap gap-2">
                {([
                  ["participants", "ผู้เข้าร่วม"], ["responses", "Responses"], ["answers", "Answers"],
                  ["funnel", "Funnel"], ["tourism", "Tourism"], ["operator_tasks", "Operator tasks"], ["codebook", "Codebook"],
                ] as const).map(([dataset, label]) => <ExportButton key={dataset} endpoint="/api/admin/export/research" label={label} params={{ studyId: id, dataset, dateFrom: filters.dateFrom, dateTo: filters.dateTo, participantType: filters.participantType, collectionModes: filters.collectionModes.join(",") }} />)}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-500">ระบบปฏิเสธ microdata เมื่อมีผู้เข้าเกณฑ์ต่ำกว่า 10, ใช้ participant code แทนรหัสระบบจริง และบันทึก audit ทุกครั้ง</p>
            </details>
          ) : null}
        </section>

        {analytics ? <ResearchAnalyticsWorkspace analytics={analytics} /> : null}

        {canManage ? <ResearchOperatorAssessmentQueue studyId={id} assessments={operatorAssessments} /> : null}

        {canManage && detail.study.status === "active" ? (
          <section className="border border-[var(--admin-border)] bg-white p-5" aria-labelledby="facilitated-session-heading">
            <h2 id="facilitated-session-heading" className="text-lg font-black">เริ่มรอบประเมินแบบมีผู้ดำเนินการ</h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">เปิดหน้าคำชี้แจงให้ผู้เข้าร่วมอ่านและกดยินยอมด้วยตนเอง จากนั้นส่งอุปกรณ์ให้ทำโจทย์ ห้ามผู้ดำเนินการกดยินยอมแทน</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href={`/admin/research/${id}/operator/start?participantType=operator`} className="inline-flex min-h-11 items-center bg-[#202020] px-4 font-black text-white hover:bg-[#B94727]">เริ่มสำหรับผู้ประกอบการ</Link>
              <Link href={`/admin/research/${id}/operator/start?participantType=attraction_manager`} className="inline-flex min-h-11 items-center border border-slate-300 bg-white px-4 font-black hover:bg-slate-50">เริ่มสำหรับผู้ดูแลสถานที่</Link>
            </div>
          </section>
        ) : null}

        <section className="border border-[var(--admin-border)] bg-white" aria-labelledby="protocol-heading">
          <div className="border-b border-[var(--admin-border)] p-5"><h2 id="protocol-heading" className="text-lg font-black">Protocol และประกาศสำหรับผู้เข้าร่วม</h2><p className="mt-1 text-sm text-slate-600">ข้อความชุดนี้แสดงก่อน consent และแก้ไม่ได้หลัง activation</p></div>
          <dl className="grid gap-px bg-[var(--admin-border)] lg:grid-cols-2">
            {[{ label: "วัตถุประสงค์", value: detail.study.purposeTh }, { label: "สิ่งที่ต้องทำ", value: detail.study.participationTh }, { label: "การใช้ข้อมูล", value: detail.study.privacyTh }, { label: "การถอนตัว", value: detail.study.withdrawalTh }].map((item) => <div key={item.label} className="bg-white p-5"><dt className="text-xs font-black text-[#B94727]">{item.label}</dt><dd className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">{item.value}</dd></div>)}
          </dl>
          <div className="grid gap-4 border-t border-slate-200 p-5 text-sm sm:grid-cols-3"><p><span className="text-slate-500">ติดต่อ</span><br /><strong>{detail.study.contactEmail}</strong></p><p><span className="text-slate-500">ช่วงเก็บข้อมูล</span><br /><strong>{formatDate(detail.study.startsAt)} – {formatDate(detail.study.endsAt)}</strong></p><p><span className="text-slate-500">เก็บรักษาถึง</span><br /><strong>{formatDate(detail.study.retentionUntil)}</strong></p></div>
        </section>

        {canManage && isDraft ? (
          <section className="grid gap-6 xl:grid-cols-2">
            <form action={recordResearchApprovalAction} className="border border-[var(--admin-border)] bg-white p-5">
              <input type="hidden" name="studyId" value={id} />
              <h2 className="text-lg font-black">บันทึก approval gate</h2><p className="mt-1 text-sm leading-6 text-slate-600">บันทึกจากหลักฐานจริงเท่านั้น การติ๊กยืนยันไม่ใช่การขออนุมัติแทนอาจารย์หรือคณะกรรมการ</p>
              <label className="mt-4 block text-sm font-bold">วันที่อาจารย์ที่ปรึกษาอนุมัติ<input type="date" name="advisorApprovedAt" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="mt-4 block text-sm font-bold">สถานะจริยธรรม<select name="ethicsReviewStatus" required className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="not_required">ตรวจแล้ว ไม่เข้าข่ายต้องขอ</option><option value="approved">ได้รับอนุมัติแล้ว</option></select></label>
              <label className="mt-4 block text-sm font-bold">วันที่อนุมัติจริยธรรม (เมื่อเลือกได้รับอนุมัติ)<input type="date" name="ethicsApprovedAt" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="mt-4 block text-sm font-bold">เลขอ้างอิง/ตำแหน่งไฟล์หลักฐาน<input name="approvalReference" required maxLength={500} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
              <label className="mt-4 flex min-h-11 items-start gap-3 text-sm font-bold"><input type="checkbox" name="confirmRecordedEvidence" value="true" required className="mt-1" /> ฉันตรวจหลักฐานต้นฉบับและบันทึกข้อมูลตรงตามเอกสาร</label>
              <button type="submit" className="mt-4 min-h-11 w-full bg-[#202020] px-4 font-black text-white hover:bg-[#B94727]">บันทึกหลักฐานอนุมัติ</button>
            </form>

            <form action={saveResearchDeploymentAction} className="border border-[var(--admin-border)] bg-white p-5">
              <input type="hidden" name="studyId" value={id} />
              <h2 className="text-lg font-black">ผูกจุด QR สำหรับเก็บข้อมูล</h2><p className="mt-1 text-sm leading-6 text-slate-600">จุด QR หนึ่งจุดเปิดใช้งานได้กับ study เดียว ป้องกันการปน collection mode</p>
              <label className="mt-4 block text-sm font-bold">จุด QR<select name="checkinCodeId" required className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">เลือกจุด QR</option>{checkinCodes.map((code) => <option key={code.checkinCodeId} value={code.checkinCodeId}>{code.code} · {code.attractionNameTh ?? code.label ?? "ไม่ระบุสถานที่"}</option>)}</select></label>
              <label className="mt-4 block text-sm font-bold">Collection mode<select name="collectionMode" defaultValue="field_observation" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal">{Object.entries(MODE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">เริ่มใช้ (ไม่บังคับ)<input type="date" name="startsAt" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold">สิ้นสุด (ไม่บังคับ)<input type="date" name="endsAt" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label></div>
              <label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-bold"><input type="checkbox" name="isActive" value="true" defaultChecked /> เปิดรับ consent ที่จุดนี้เมื่อ study active</label>
              <button type="submit" className="mt-4 min-h-11 w-full bg-[#202020] px-4 font-black text-white hover:bg-[#B94727]">บันทึกจุดเก็บข้อมูล</button>
            </form>
          </section>
        ) : null}

        <section className="border border-[var(--admin-border)] bg-white" aria-labelledby="instrument-heading">
          <div className="border-b border-[var(--admin-border)] p-5"><h2 id="instrument-heading" className="text-lg font-black">แบบประเมินแบบมีรุ่น</h2><p className="mt-1 text-sm text-slate-600">ข้อความใน blueprint เป็นฉบับร่าง ต้องผ่าน expert review และ pilot ก่อนกดเผยแพร่</p></div>
          {detail.instruments.length === 0 ? <p className="p-8 text-center text-sm text-slate-600">ยังไม่มีแบบประเมิน</p> : detail.instruments.map((instrument) => {
            const items = detail.items.filter((item) => item.instrumentId === instrument.researchInstrumentId);
            return (
              <article key={instrument.researchInstrumentId} className="border-b border-slate-200 p-5 last:border-b-0">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{instrument.titleTh}</h3><span className="border border-slate-300 px-2 py-1 text-xs font-bold">{instrument.status === "published" ? "เผยแพร่/ล็อกรุ่น" : "ฉบับร่าง"}</span></div><p className="mt-1 font-mono text-xs text-slate-500">{instrument.instrumentKey} v{instrument.versionNumber} · {AUDIENCE_LABELS[instrument.audience]} · {instrument.estimatedMinutes ?? "?"} นาที</p></div><p className="text-sm font-bold">{items.length.toLocaleString("th-TH")} ข้อ</p></div>
                <ol className="mt-4 divide-y divide-slate-200 border-y border-slate-200">{items.map((item) => <li key={item.researchItemId} className="grid gap-2 py-3 text-sm sm:grid-cols-[5rem_9rem_minmax(0,1fr)_8rem]"><span className="font-mono font-bold text-[#B94727]">{item.itemCode}</span><span className="font-mono text-xs text-slate-500">{item.constructKey}</span><span>{item.promptTh}</span><span className="text-xs text-slate-500">{ANSWER_LABELS[item.answerType]}</span></li>)}</ol>
                {canManage && isDraft && instrument.status === "draft" ? (
                  <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                    <details className="border border-slate-300 p-4"><summary className="cursor-pointer font-black text-[#B94727]">เพิ่มข้อคำถาม</summary><form action={createResearchItemAction} className="mt-4 grid gap-3 sm:grid-cols-2"><input type="hidden" name="studyId" value={id} /><input type="hidden" name="instrumentId" value={instrument.researchInstrumentId} /><label className="text-sm font-bold">รหัสข้อ<input name="itemCode" required placeholder="SQ1" className="mt-1 min-h-11 w-full border border-slate-300 px-3 font-mono font-normal" /></label><label className="text-sm font-bold">ลำดับ<input type="number" min={1} name="displayOrder" required defaultValue={items.length + 1} className="mt-1 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold">Construct key<input name="constructKey" required placeholder="system_quality" className="mt-1 min-h-11 w-full border border-slate-300 px-3 font-mono font-normal" /></label><label className="text-sm font-bold">ชนิดคำตอบ<select name="answerType" defaultValue="agreement_5" className="mt-1 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal">{Object.entries(ANSWER_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-bold sm:col-span-2">คำถามภาษาไทย<textarea name="promptTh" required rows={2} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">ตัวเลือกสำหรับชนิดเลือกหนึ่งคำตอบ (บรรทัดละตัวเลือก)<textarea name="options" rows={3} className="mt-1 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" name="isRequired" value="true" defaultChecked /> ต้องตอบ</label><label className="flex min-h-11 items-center gap-2 text-sm font-bold"><input type="checkbox" name="reverseScore" value="true" /> Reverse score</label><button type="submit" className="min-h-11 bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2">เพิ่มข้อคำถาม</button></form></details>
                    <form action={publishResearchInstrumentAction} className="border border-amber-300 bg-amber-50 p-4"><input type="hidden" name="studyId" value={id} /><input type="hidden" name="instrumentId" value={instrument.researchInstrumentId} /><p className="font-black text-amber-950"><LockKey aria-hidden="true" className="mr-2 inline" />เผยแพร่และล็อกรุ่น</p><p className="mt-2 text-xs leading-5 text-amber-900">หลังเผยแพร่ห้ามแก้ข้อความ ตัวเลือก ลำดับ หรือความหมายของข้อคำถาม ให้สร้าง version ใหม่เมื่อต้องปรับ</p><label className="mt-3 flex min-h-11 items-start gap-2 text-xs font-bold text-amber-950"><input type="checkbox" name="confirmFreeze" value="true" required className="mt-1" /> ผ่าน expert review และพร้อมล็อกรุ่นนี้</label><button type="submit" className="mt-3 min-h-11 w-full bg-amber-900 px-3 text-sm font-black text-white">เผยแพร่รุ่นนี้</button></form>
                  </div>
                ) : null}
              </article>
            );
          })}
          {canManage && isDraft ? <details className="border-t border-slate-200"><summary className="flex min-h-14 cursor-pointer list-none items-center px-5 font-black text-[#B94727]">สร้างแบบประเมินฉบับร่างใหม่</summary><form action={createResearchInstrumentAction} className="grid gap-4 border-t border-slate-200 p-5 sm:grid-cols-2"><input type="hidden" name="studyId" value={id} /><label className="text-sm font-bold">ชื่อภาษาไทย<input name="titleTh" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold">Instrument key<input name="instrumentKey" required placeholder="tourist_evaluation" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-mono font-normal" /></label><label className="text-sm font-bold">รุ่น<input type="number" min={1} name="versionNumber" required defaultValue={1} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold">กลุ่มผู้ตอบ<select name="audience" defaultValue="tourist" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal">{Object.entries(AUDIENCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-bold">เวลาประมาณ (นาที)<input type="number" min={1} max={60} name="estimatedMinutes" defaultValue={4} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">คำอธิบาย<textarea name="descriptionTh" rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label><button type="submit" className="min-h-11 bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2">สร้างแบบประเมินฉบับร่าง</button></form></details> : null}
        </section>

        <section className="border border-[var(--admin-border)] bg-white" aria-labelledby="operator-task-heading">
          <div className="border-b border-[var(--admin-border)] p-5"><h2 id="operator-task-heading" className="text-lg font-black">งานประเมินการใช้ข้อมูลตัดสินใจ</h2><p className="mt-1 text-sm text-slate-600">ใช้โจทย์ตามบทบาท วัดผลลัพธ์ เวลา ความมั่นใจ และคุณภาพหลักฐาน โดยไม่เปิด expected answer ให้ผู้เข้าร่วมเห็นก่อนทำ</p></div>
          {detail.operatorTasks.length === 0 ? <p className="p-8 text-center text-sm text-slate-600">ยังไม่มี task bank</p> : <div className="divide-y divide-slate-200">{detail.operatorTasks.map((task) => <article key={task.researchOperatorTaskId} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_16rem]"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{task.titleTh}</h3><span className="border border-slate-300 px-2 py-1 text-xs font-bold">{task.status === "published" ? "เผยแพร่/ล็อกรุ่น" : "ฉบับร่าง"}</span></div><p className="mt-1 font-mono text-xs text-slate-500">{task.taskCode} v{task.versionNumber} · {AUDIENCE_LABELS[task.audience]} · ลำดับ {task.displayOrder}</p><p className="mt-3 text-sm leading-6 text-slate-700">{task.instructionTh}</p><p className="mt-2 text-xs text-slate-500">Expected evidence: {task.expectedEvidence}</p></div>{canManage && isDraft && task.status === "draft" ? <form action={publishResearchOperatorTaskAction} className="border border-amber-300 bg-amber-50 p-4"><input type="hidden" name="studyId" value={id} /><input type="hidden" name="taskId" value={task.researchOperatorTaskId} /><label className="flex items-start gap-2 text-xs font-bold"><input type="checkbox" name="confirmFreeze" value="true" required className="mt-1" /> ตรวจโจทย์และ scoring rule แล้ว</label><button type="submit" className="mt-3 min-h-11 w-full bg-amber-900 px-3 text-sm font-black text-white">เผยแพร่ task</button></form> : null}</article>)}</div>}
          {canManage && isDraft ? <details className="border-t border-slate-200"><summary className="flex min-h-14 cursor-pointer list-none items-center px-5 font-black text-[#B94727]">เพิ่มงานประเมินฉบับร่าง</summary><form action={createResearchOperatorTaskAction} className="grid gap-4 border-t border-slate-200 p-5 sm:grid-cols-2"><input type="hidden" name="studyId" value={id} /><label className="text-sm font-bold">ชื่อโจทย์ภาษาไทย<input name="titleTh" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold">Task code<input name="taskCode" required placeholder="identify_primary_segment" className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-mono font-normal" /></label><label className="text-sm font-bold">รุ่น<input type="number" min={1} name="versionNumber" defaultValue={1} required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold">ลำดับ<input type="number" min={1} name="displayOrder" defaultValue={detail.operatorTasks.length + 1} required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold">บทบาท<select name="audience" defaultValue="operator" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="operator">ผู้ประกอบการ</option><option value="attraction_manager">ผู้ดูแลสถานที่</option></select></label><label className="text-sm font-bold">เวลาสูงสุด (นาที)<input type="number" min={1} max={120} name="maximumMinutes" defaultValue={10} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">คำสั่งที่ผู้เข้าร่วมเห็น<textarea name="instructionTh" required rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-bold sm:col-span-2">หลักฐานที่ผู้ประเมินคาดหวัง<textarea name="expectedEvidence" required rows={2} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-bold">องค์ประกอบหลักฐาน (คั่นด้วย comma/ขึ้นบรรทัดใหม่)<textarea name="requiredEvidence" required rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label><label className="text-sm font-bold">เกณฑ์ผ่าน<textarea name="passRule" required rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label><button type="submit" className="min-h-11 bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2">สร้าง task ฉบับร่าง</button></form></details> : null}
        </section>

        <section className="border border-[var(--admin-border)] bg-white p-5"><h2 className="text-lg font-black">จุดเก็บข้อมูลที่ผูกไว้</h2>{detail.deployments.length === 0 ? <p className="mt-3 text-sm text-slate-600">ยังไม่ได้ผูกจุด QR</p> : <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">{detail.deployments.map((deployment) => <div key={deployment.checkinCodeId} className="grid gap-2 py-3 text-sm sm:grid-cols-[10rem_minmax(0,1fr)_14rem_6rem]"><span className="font-mono font-bold">{deployment.code}</span><span>{deployment.attractionNameTh ?? deployment.label ?? "ไม่ระบุสถานที่"}</span><span>{MODE_LABELS[deployment.collectionMode]}</span><span className="font-bold">{deployment.isActive ? "เปิด" : "ปิด"}</span></div>)}</div>}</section>

        {canManage ? (
          <section className={`border p-5 ${isDraft ? "border-amber-300 bg-amber-50" : "border-slate-300 bg-white"}`}>
            <h2 className="text-lg font-black">ควบคุมสถานะโครงการ</h2>
            {isDraft ? <form action={activateResearchStudyAction} className="mt-4"><input type="hidden" name="studyId" value={id} /><label className="flex min-h-11 items-start gap-3 text-sm font-bold"><input type="checkbox" name="confirmFreeze" value="true" required className="mt-1" disabled={!canActivate} /> ฉันยืนยันว่า approval และ configuration ทั้งหมดผ่านการตรวจแล้ว และเข้าใจว่า activation จะล็อกรุ่น</label><button type="submit" disabled={!canActivate} className="mt-4 inline-flex min-h-11 items-center gap-2 bg-[#202020] px-5 font-black text-white enabled:hover:bg-[#B94727] disabled:cursor-not-allowed disabled:bg-slate-300"><Play aria-hidden="true" /> เปิดเก็บข้อมูล</button></form> : null}
            {detail.study.status === "active" ? <div className="mt-4 flex flex-wrap gap-3"><form action={transitionResearchStudyAction}><input type="hidden" name="studyId" value={id} /><input type="hidden" name="fromStatus" value="active" /><input type="hidden" name="toStatus" value="paused" /><button className="inline-flex min-h-11 items-center gap-2 border border-slate-300 bg-white px-4 font-bold"><Pause aria-hidden="true" /> พักการเก็บข้อมูล</button></form><form action={transitionResearchStudyAction}><input type="hidden" name="studyId" value={id} /><input type="hidden" name="fromStatus" value="active" /><input type="hidden" name="toStatus" value="closed" /><button className="min-h-11 bg-rose-800 px-4 font-bold text-white">ปิดการเก็บข้อมูล</button></form></div> : null}
            {detail.study.status === "paused" ? <div className="mt-4 flex flex-wrap gap-3"><form action={transitionResearchStudyAction}><input type="hidden" name="studyId" value={id} /><input type="hidden" name="fromStatus" value="paused" /><input type="hidden" name="toStatus" value="active" /><button className="inline-flex min-h-11 items-center gap-2 bg-[#202020] px-4 font-bold text-white"><Play aria-hidden="true" /> เก็บข้อมูลต่อ</button></form><form action={transitionResearchStudyAction}><input type="hidden" name="studyId" value={id} /><input type="hidden" name="fromStatus" value="paused" /><input type="hidden" name="toStatus" value="closed" /><button className="min-h-11 bg-rose-800 px-4 font-bold text-white">ปิดโครงการ</button></form></div> : null}
          </section>
        ) : null}
      </div>
    </AdminShell>
  );
}
