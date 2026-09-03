import Link from "next/link";
import { ArrowRight, CalendarCheck, ChartLine, CheckCircle, Warning } from "@phosphor-icons/react/dist/ssr";

import {
  closeAttractionFeedbackIssueAction,
  createAttractionImprovementAction,
  reviewAttractionFeedbackAction,
  transitionAttractionImprovementAction,
} from "@/app/actions/admin-attraction-feedback-actions";
import type { ImprovementHistory, ImprovementOwner } from "@/lib/repositories/attraction-feedback.repository";
import type {
  ActionStatus,
  AttractionFeedbackIssue,
  FeedbackDimension,
  ImprovementAction,
  IssueStatus,
  getAttractionImprovementWorkspace,
} from "@/lib/services/attraction-feedback.service";
import type { AttractionIssueDraft } from "@/lib/dashboard/attraction-improvement-draft";
import { redactFeedbackOperationalText } from "@/lib/validation/attraction-feedback";

type Workspace = Awaited<ReturnType<typeof getAttractionImprovementWorkspace>>;

const DIMENSION_LABELS: Record<FeedbackDimension, string> = {
  overall: "ภาพรวม",
  facility: "สิ่งอำนวยความสะดวก",
  cleanliness: "ความสะอาด",
  safety: "ความปลอดภัย",
  accessibility: "การเข้าถึง",
  information: "ข้อมูลและป้ายบอกทาง",
  value: "ความคุ้มค่า",
};

const CATEGORY_LABELS = {
  facilities: "สิ่งอำนวยความสะดวก",
  cleanliness: "ความสะอาด",
  safety: "ความปลอดภัย",
  accessibility: "การเข้าถึง",
  information_signage: "ข้อมูลและป้ายบอกทาง",
  value: "ความคุ้มค่า",
  service: "การบริการ",
  maintenance: "การบำรุงรักษา",
  other: "อื่น ๆ",
} as const;

const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  open: "กำลังดำเนินการ",
  dismissed: "ไม่รับเป็นประเด็น",
  closed: "ปิดประเด็นแล้ว",
};

const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  planned: "วางแผนแล้ว",
  in_progress: "กำลังดำเนินการ",
  completed: "รอตรวจผล",
  verified: "ตรวจผลแล้ว",
  cancelled: "ยกเลิก",
};

const FOLLOW_UP_METRIC_LABELS: Record<ImprovementAction["followUpMetric"], string> = {
  overall_score: "คะแนนภาพรวม",
  facility_score: "สิ่งอำนวยความสะดวก",
  cleanliness_score: "ความสะอาด",
  safety_score: "ความปลอดภัย",
  accessibility_score: "การเข้าถึง",
  information_score: "ข้อมูลและป้าย",
  value_score: "ความคุ้มค่า",
  response_coverage: "อัตราการตอบ",
  structured_recurrence_count: "จำนวนคะแนนต่ำซ้ำ",
};

const HISTORY_STATUS_LABELS: Record<string, string> = {
  ...ISSUE_STATUS_LABELS,
  ...ACTION_STATUS_LABELS,
};

const RESULT_MESSAGES: Record<string, { tone: "success" | "error"; text: string }> = {
  issue_saved: { tone: "success", text: "บันทึกผลการพิจารณาประเด็นแล้ว" },
  action_created: { tone: "success", text: "สร้างแผนปรับปรุงแล้ว" },
  action_updated: { tone: "success", text: "อัปเดตสถานะแผนปรับปรุงแล้ว" },
  issue_closed: { tone: "success", text: "ปิดประเด็นหลังตรวจผลแล้ว" },
  issue_failed: { tone: "error", text: "ยังบันทึกประเด็นไม่ได้ ตรวจสอบข้อมูลและสิทธิ์แล้วลองใหม่" },
  action_failed: { tone: "error", text: "ยังสร้างแผนไม่ได้ ตรวจสอบผู้รับผิดชอบและช่วงวันที่" },
  action_transition_failed: { tone: "error", text: "ยังเปลี่ยนสถานะไม่ได้ ตรวจสอบลำดับงานและหลักฐาน" },
  issue_close_failed: { tone: "error", text: "ปิดประเด็นไม่ได้ ต้องมีแผนที่ตรวจผลแล้วและระบุเหตุผล" },
};

function formatDate(value: string | null | undefined) {
  if (!value) return "ไม่ระบุ";
  return new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(`${value.slice(0, 10)}T00:00:00`));
}

function formatScore(value: number | null) {
  return value === null ? "ไม่มีข้อมูล" : value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function candidateStatusClass(qualifies: boolean) {
  if (qualifies) return "border-rose-300 bg-rose-50 text-rose-800";
  return "border-slate-300 bg-slate-50 text-slate-700";
}

function ImprovementTimeline({ issue, actions, history, owners }: { issue: AttractionFeedbackIssue; actions: ImprovementAction[]; history: ImprovementHistory[]; owners: ImprovementOwner[] }) {
  const ownerNames = new Map(owners.map((owner) => [owner.adminId, owner.displayName]));
  const today = new Date().toISOString().slice(0, 10);
  return (
    <section className="mt-5 border-t border-slate-200 pt-5" role="region" aria-label={`ไทม์ไลน์การปรับปรุง ${DIMENSION_LABELS[issue.issueDimension]}`}>
      <h4 className="font-black text-slate-950">ไทม์ไลน์การปรับปรุง</h4>
      <p className="mt-1 text-sm text-slate-600">เรียงหลักฐานตั้งแต่ Baseline ไปจนถึงผลติดตาม เพื่อให้ตรวจสอบย้อนหลังได้ในบริบทเดียว</p>
      <ol className="relative mt-4 space-y-5 border-l border-slate-300 pl-6">
        <li className="relative text-sm">
          <span className="absolute -left-[1.72rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-[#B94727] ring-1 ring-[#B94727]" aria-hidden="true" />
          <p className="font-black text-slate-950">Baseline</p>
          <p className="mt-1 leading-6 text-slate-600">{formatDate(issue.baselineStart)} ถึง {formatDate(issue.baselineEnd)} · คะแนน {formatScore(issue.currentScore)} · n={issue.responseCount.toLocaleString("th-TH")} จาก {issue.visitCount.toLocaleString("th-TH")} Visits</p>
        </li>
        <li className="relative text-sm">
          <span className="absolute -left-[1.72rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-amber-600 ring-1 ring-amber-600" aria-hidden="true" />
          <p className="font-black text-slate-950">พิจารณาประเด็น</p>
          <p className="mt-1 leading-6 text-slate-600">{formatDate(issue.reviewedAt)} · {ISSUE_STATUS_LABELS[issue.status]}{issue.reviewNote ? ` · ${issue.reviewNote}` : ""}</p>
        </li>
        {actions.map((action) => {
          const actionHistory = history.filter((entry) => entry.improvementActionId === action.improvementActionId).sort((left, right) => left.createdAt.localeCompare(right.createdAt));
          const verifiedEntry = [...actionHistory].reverse().find((entry) => entry.toStatus === "verified");
          const overdue = !["completed", "verified", "cancelled"].includes(action.status) && action.dueDate < today;
          return (
            <li key={action.improvementActionId} className="relative text-sm">
              <span className={`absolute -left-[1.72rem] top-1.5 h-3 w-3 rounded-full border-2 border-white ring-1 ${action.status === "verified" ? "bg-emerald-700 ring-emerald-700" : overdue ? "bg-rose-700 ring-rose-700" : "bg-slate-700 ring-slate-700"}`} aria-hidden="true" />
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black text-slate-950">{action.title}</p>
                <span className="border border-slate-300 bg-white px-2 py-0.5 text-xs font-bold">{ACTION_STATUS_LABELS[action.status]}</span>
                {overdue ? <span className="bg-rose-700 px-2 py-0.5 text-xs font-bold text-white">เลยกำหนด</span> : null}
              </div>
              <p className="mt-1 leading-6 text-slate-600">ผู้รับผิดชอบ {ownerNames.get(action.ownerAdminId) ?? "ไม่พบผู้ดูแล"} · กำหนดเสร็จ {formatDate(action.dueDate)}</p>
              <p className="leading-6 text-slate-600">ช่วงติดตามผล {formatDate(action.followUpStart)} ถึง {formatDate(action.followUpEnd)} · ตัวชี้วัด {FOLLOW_UP_METRIC_LABELS[action.followUpMetric]}</p>
              {action.completionEvidenceNote ? <p className="mt-2 bg-emerald-50 px-3 py-2 leading-6 text-emerald-950">หลักฐานการดำเนินงาน: {redactFeedbackOperationalText(action.completionEvidenceNote)}</p> : null}
              {verifiedEntry ? <p className="mt-2 bg-slate-100 px-3 py-2 leading-6 text-slate-800">ผลลัพธ์ที่ตรวจแล้ว: {verifiedEntry.note ? redactFeedbackOperationalText(verifiedEntry.note) : "ยืนยันการติดตามแล้ว แต่ยังไม่มีบันทึกสรุปผล"}</p> : null}
              {actionHistory.length > 0 ? <div className="mt-2 space-y-1 text-xs text-slate-500">{actionHistory.map((entry) => <p key={entry.historyId}><time>{new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.createdAt))}</time> · {entry.fromStatus ? `${HISTORY_STATUS_LABELS[entry.fromStatus] ?? entry.fromStatus} → ` : ""}{HISTORY_STATUS_LABELS[entry.toStatus] ?? entry.toStatus} · {ownerNames.get(entry.changedBy) ?? "ผู้ดูแลระบบ"}</p>)}</div> : null}
            </li>
          );
        })}
        {actions.length === 0 ? <li className="relative text-sm text-slate-600"><span className="absolute -left-[1.72rem] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-slate-300 ring-1 ring-slate-300" aria-hidden="true" />ยังไม่มีแผนงานที่ได้รับมอบหมาย</li> : null}
      </ol>
    </section>
  );
}

function ActionTransitionForms({
  attractionId,
  action,
  canManage,
  canVerify,
}: {
  attractionId: number;
  action: ImprovementAction;
  canManage: boolean;
  canVerify: boolean;
}) {
  const options: Array<{ status: ActionStatus; label: string; evidence?: boolean; destructive?: boolean; outcome?: boolean }> = [];
  if (action.status === "planned" && canManage) options.push({ status: "in_progress", label: "เริ่มดำเนินการ" }, { status: "cancelled", label: "ยกเลิกแผน", destructive: true });
  if (action.status === "in_progress" && canManage) options.push({ status: "completed", label: "บันทึกว่าดำเนินการเสร็จ", evidence: true }, { status: "cancelled", label: "ยกเลิกแผน", destructive: true });
  if (action.status === "completed" && canVerify) options.push({ status: "verified", label: "ยืนยันผลติดตาม", outcome: true });
  if (options.length === 0) return null;

  return (
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      {options.map((option) => (
        <form key={option.status} action={transitionAttractionImprovementAction} className="border border-slate-200 bg-slate-50 p-3">
          <input type="hidden" name="attractionId" value={attractionId} />
          <input type="hidden" name="actionId" value={action.improvementActionId} />
          <input type="hidden" name="toStatus" value={option.status} />
          <label className="block text-xs font-bold text-slate-700">
            {option.evidence ? "หลักฐานการดำเนินงาน" : option.destructive ? "เหตุผลที่ยกเลิก" : option.outcome ? "ผลการติดตามและข้อจำกัด" : "บันทึกเพิ่มเติม (ไม่บังคับ)"}
            <textarea
              name={option.evidence ? "completionEvidenceNote" : "note"}
              required={option.evidence || option.destructive || option.outcome}
              maxLength={option.evidence ? 4000 : 2000}
              rows={3}
              className="mt-2 w-full border border-slate-300 bg-white px-3 py-2 font-normal outline-none focus:border-[var(--admin-accent)]"
            />
          </label>
          <button type="submit" className={`mt-3 min-h-11 w-full px-3 text-sm font-bold text-white ${option.destructive ? "bg-rose-700 hover:bg-rose-800" : "bg-[#202020] hover:bg-[#B94727]"}`}>
            {option.label}
          </button>
        </form>
      ))}
    </div>
  );
}

function ImprovementIssue({
  attractionId,
  issue,
  actions,
  history,
  owners,
  canManage,
  canVerify,
  canReview,
}: {
  attractionId: number;
  issue: AttractionFeedbackIssue;
  actions: ImprovementAction[];
  history: ImprovementHistory[];
  owners: ImprovementOwner[];
  canManage: boolean;
  canVerify: boolean;
  canReview: boolean;
}) {
  const activeAction = actions.find((action) => ["planned", "in_progress", "completed"].includes(action.status));
  const hasVerified = actions.some((action) => action.status === "verified");
  return (
    <article className="border-t border-slate-300 py-6 first:border-t-0 first:pt-0">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-black text-ink">{DIMENSION_LABELS[issue.issueDimension]}</h3>
            <span className="border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-700">{ISSUE_STATUS_LABELS[issue.status]}</span>
            <span className="text-xs font-semibold text-slate-500">กฎ {issue.ruleVersion}</span>
          </div>
          <p className="mt-2 text-sm text-slate-700">หมวด {CATEGORY_LABELS[issue.issueCategory]} ช่วง {formatDate(issue.baselineStart)} ถึง {formatDate(issue.baselineEnd)}</p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-right text-sm">
          <div><p className="text-xs text-slate-500">คะแนน</p><p className="font-black">{formatScore(issue.currentScore)}</p></div>
          <div><p className="text-xs text-slate-500">คำตอบ</p><p className="font-black">{issue.responseCount.toLocaleString("th-TH")}</p></div>
          <div><p className="text-xs text-slate-500">ครอบคลุม</p><p className="font-black">{issue.responseCoverage === null ? "ไม่มีข้อมูล" : `${Math.round(issue.responseCoverage * 100)}%`}</p></div>
        </div>
      </div>

      {issue.reviewNote ? <p className="mt-4 border-l border-slate-300 pl-4 text-sm leading-6 text-slate-700">เหตุผลการพิจารณา: {issue.reviewNote}</p> : null}

      <div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">
        {actions.length === 0 ? <p className="py-4 text-sm text-slate-600">ยังไม่มีแผนปรับปรุงสำหรับประเด็นนี้</p> : actions.map((action) => (
          <section key={action.improvementActionId} className="py-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <div>
                <h4 className="font-black text-ink">{action.title}</h4>
                <p className="mt-1 text-sm leading-6 text-slate-700">{action.proposedAction}</p>
              </div>
              <span className="h-fit border border-slate-300 px-2 py-1 text-xs font-bold">{ACTION_STATUS_LABELS[action.status]}</span>
            </div>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
              <div><dt className="text-xs text-slate-500">ผู้รับผิดชอบ</dt><dd className="font-bold">{owners.find((owner) => owner.adminId === action.ownerAdminId)?.displayName ?? "ไม่พบผู้ดูแล"}</dd></div>
              <div><dt className="text-xs text-slate-500">กำหนดเสร็จ</dt><dd className="font-bold">{formatDate(action.dueDate)}</dd></div>
              <div><dt className="text-xs text-slate-500">ติดตามผล</dt><dd className="font-bold">{formatDate(action.followUpStart)} ถึง {formatDate(action.followUpEnd)}</dd></div>
            </dl>
            {action.completionEvidenceNote ? <p className="mt-3 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900">หลักฐาน: {redactFeedbackOperationalText(action.completionEvidenceNote)}</p> : null}
            <ActionTransitionForms attractionId={attractionId} action={action} canManage={canManage} canVerify={canVerify} />
          </section>
        ))}
      </div>

      {issue.status === "open" && canManage && !activeAction ? (
        <details className="mt-5 border border-slate-300 bg-white p-4">
          <summary className="cursor-pointer font-black text-[#B94727]">สร้างแผนปรับปรุง</summary>
          <form action={createAttractionImprovementAction} className="mt-5 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="attractionId" value={attractionId} />
            <input type="hidden" name="issueId" value={issue.feedbackIssueId} />
            <label className="block text-sm font-bold sm:col-span-2">ชื่อแผน<input name="title" required maxLength={160} className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="block text-sm font-bold sm:col-span-2">สิ่งที่จะดำเนินการ<textarea name="proposedAction" required maxLength={4000} rows={4} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" /></label>
            <label className="block text-sm font-bold">ผู้รับผิดชอบ<select name="ownerAdminId" required className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">เลือกผู้รับผิดชอบ</option>{owners.map((owner) => <option key={owner.adminId} value={owner.adminId}>{owner.displayName}</option>)}</select></label>
            <label className="block text-sm font-bold">ความสำคัญ<select name="priority" defaultValue="medium" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="low">ต่ำ</option><option value="medium">กลาง</option><option value="high">สูง</option></select></label>
            <label className="block text-sm font-bold">กำหนดเสร็จ<input type="date" name="dueDate" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="block text-sm font-bold">ตัวชี้วัดติดตาม<select name="followUpMetric" defaultValue={`${issue.issueDimension}_score`} className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="overall_score">คะแนนภาพรวม</option><option value="facility_score">สิ่งอำนวยความสะดวก</option><option value="cleanliness_score">ความสะอาด</option><option value="safety_score">ความปลอดภัย</option><option value="accessibility_score">การเข้าถึง</option><option value="information_score">ข้อมูลและป้าย</option><option value="value_score">ความคุ้มค่า</option><option value="response_coverage">อัตราการตอบ</option><option value="structured_recurrence_count">จำนวนคะแนนต่ำซ้ำ</option></select></label>
            <label className="block text-sm font-bold">เริ่มติดตามผล<input type="date" name="followUpStart" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <label className="block text-sm font-bold">สิ้นสุดติดตามผล<input type="date" name="followUpEnd" required className="mt-2 min-h-11 w-full border border-slate-300 px-3 font-normal" /></label>
            <button type="submit" className="min-h-11 bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2">บันทึกแผนปรับปรุง</button>
          </form>
        </details>
      ) : null}

      {issue.status === "open" && canReview && hasVerified ? (
        <form action={closeAttractionFeedbackIssueAction} className="mt-5 flex flex-col gap-3 border border-emerald-300 bg-emerald-50 p-4 sm:flex-row sm:items-end">
          <input type="hidden" name="attractionId" value={attractionId} />
          <input type="hidden" name="issueId" value={issue.feedbackIssueId} />
          <label className="flex-1 text-sm font-bold text-emerald-900">เหตุผลสรุปเพื่อปิดประเด็น<input name="note" required maxLength={2000} className="mt-2 min-h-11 w-full border border-emerald-300 bg-white px-3 font-normal text-ink" /></label>
          <button type="submit" className="min-h-11 bg-emerald-800 px-4 font-black text-white">ปิดประเด็น</button>
        </form>
      ) : null}

      <ImprovementTimeline issue={issue} actions={actions} history={history} owners={owners} />
    </article>
  );
}

export function AttractionImprovementWorkspace({
  attractionId,
  workspace,
  scope,
  dimension,
  result,
  canReview,
  canManage,
  canVerify,
  draft,
}: {
  attractionId: number;
  workspace: Workspace;
  scope: { dateStart: string; dateEnd: string; comparisonStart?: string; comparisonEnd?: string };
  dimension: FeedbackDimension;
  result?: string;
  canReview: boolean;
  canManage: boolean;
  canVerify: boolean;
  draft?: AttractionIssueDraft;
}) {
  const message = result ? RESULT_MESSAGES[result] : null;
  const candidate = workspace.candidate;
  return (
    <div className="space-y-6">
      {message ? <p role="status" className={`border p-4 text-sm font-bold ${message.tone === "success" ? "border-emerald-300 bg-emerald-50 text-emerald-900" : "border-rose-300 bg-rose-50 text-rose-900"}`}>{message.text}</p> : null}

      <section className="border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5" aria-labelledby="candidate-heading">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold text-[var(--admin-accent-strong)]">หลักฐานช่วงเวลาที่เลือก</p>
            <h2 id="candidate-heading" className="mt-1 text-xl font-black text-[var(--admin-ink)]">{DIMENSION_LABELS[dimension]}</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">ระบบเสนอประเด็นตามกฎ {workspace.rules.ruleVersion} ผู้ดูแลต้องตรวจและให้เหตุผลก่อนสร้างงานจริง</p>
          </div>
          <span className={`inline-flex w-fit items-center gap-2 border px-3 py-2 text-sm font-black ${candidateStatusClass(candidate.qualifies)}`}>
            {candidate.qualifies ? <Warning aria-hidden="true" weight="fill" /> : <CheckCircle aria-hidden="true" weight="fill" />}
            {candidate.qualifies ? "ควรพิจารณา" : "ยังไม่ผ่านเกณฑ์"}
          </span>
        </div>
        <dl className="mt-5 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-2 lg:grid-cols-4">
          <div><dt className="text-xs font-semibold text-slate-500">คะแนนปัจจุบัน</dt><dd className="mt-1 text-2xl font-black">{formatScore(candidate.metrics.currentScore)}</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">คำตอบที่ใช้ได้</dt><dd className="mt-1 text-2xl font-black">{candidate.metrics.validResponseCount.toLocaleString("th-TH")}</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">การเข้าชม</dt><dd className="mt-1 text-2xl font-black">{candidate.metrics.visitCount.toLocaleString("th-TH")}</dd></div>
          <div><dt className="text-xs font-semibold text-slate-500">คะแนนต่ำซ้ำ</dt><dd className="mt-1 text-2xl font-black">{candidate.metrics.structuredLowScoreRecurrence.toLocaleString("th-TH")}</dd></div>
        </dl>

        {candidate.qualifies && canReview ? (
          <form action={reviewAttractionFeedbackAction} className="mt-5 grid gap-4 sm:grid-cols-2">
            {draft ? <div className="border border-orange-200 bg-orange-50 p-3 text-sm leading-6 text-orange-950 sm:col-span-2"><strong>ร่างจากข้อมูลวิเคราะห์รวม:</strong> ระบบกรอกบริบทเบื้องต้นให้แล้ว ผู้มีสิทธิ์ยังต้องตรวจเกณฑ์ เลือกหมวด และยืนยันก่อนสร้างประเด็นจริง</div> : null}
            <input type="hidden" name="attractionId" value={attractionId} />
            <input type="hidden" name="dateStart" value={scope.dateStart} />
            <input type="hidden" name="dateEnd" value={scope.dateEnd} />
            <input type="hidden" name="comparisonStart" value={scope.comparisonStart ?? ""} />
            <input type="hidden" name="comparisonEnd" value={scope.comparisonEnd ?? ""} />
            <input type="hidden" name="issueDimension" value={dimension} />
            <label className="block text-sm font-bold">จัดหมวดประเด็น<select name="issueCategory" required defaultValue={draft?.category ?? (dimension === "overall" ? "service" : dimension === "information" ? "information_signage" : dimension)} className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal">{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="block text-sm font-bold">ผลการพิจารณา<select name="decision" required defaultValue="accept" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="accept">รับเป็นประเด็นปรับปรุง</option><option value="dismiss">ไม่รับเป็นประเด็น</option></select></label>
            <label className="block text-sm font-bold sm:col-span-2">เหตุผลการพิจารณา<textarea name="reviewNote" defaultValue={draft?.note} maxLength={2000} rows={3} className="mt-2 w-full border border-slate-300 px-3 py-2 font-normal" placeholder="ระบุบริบทหรือข้อจำกัดของข้อมูล โดยไม่คัดลอกข้อมูลส่วนบุคคล" /></label>
            <button type="submit" className="min-h-11 bg-[#202020] px-4 font-black text-white hover:bg-[#B94727] sm:col-span-2">บันทึกผลการพิจารณา</button>
          </form>
        ) : null}
      </section>

      <section className="border border-[var(--admin-border)] bg-[var(--admin-surface)] p-5" aria-labelledby="issues-heading">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h2 id="issues-heading" className="text-xl font-black">ประเด็นและแผนปรับปรุง</h2><p className="mt-1 text-sm text-slate-600">แสดงเจ้าของงาน กำหนดเสร็จ หลักฐาน และช่วงติดตามผลครบในที่เดียว</p></div>
          <Link href={`/admin/dashboard/satisfaction?attractionId=${attractionId}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#B94727] underline underline-offset-4"><ChartLine aria-hidden="true" /> ดูข้อมูลความพึงพอใจ <ArrowRight aria-hidden="true" /></Link>
        </div>
        <div className="mt-6">
          {workspace.issues.length === 0 ? (
            <div className="border-y border-slate-200 py-10 text-center"><CalendarCheck aria-hidden="true" className="mx-auto text-slate-400" size={36} /><p className="mt-3 font-bold">ยังไม่มีประเด็นที่บันทึก</p><p className="mt-1 text-sm text-slate-600">เลือกช่วงเวลาที่มีข้อมูลเพียงพอ แล้วให้ผู้มีสิทธิ์พิจารณาหลักฐานด้านบน</p></div>
          ) : workspace.issues.map((issue) => (
            <ImprovementIssue
              key={issue.feedbackIssueId}
              attractionId={attractionId}
              issue={issue}
              actions={workspace.actions.filter((action) => action.feedbackIssueId === issue.feedbackIssueId)}
              history={workspace.history.filter((entry) => entry.feedbackIssueId === issue.feedbackIssueId || workspace.actions.some((action) => action.feedbackIssueId === issue.feedbackIssueId && action.improvementActionId === entry.improvementActionId))}
              owners={workspace.owners}
              canManage={canManage}
              canVerify={canVerify}
              canReview={canReview}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
