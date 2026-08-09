import { assessResearchOperatorAttemptAction } from "@/app/actions/admin-research-actions";
import type { AdminResearchOperatorAssessment } from "@/lib/repositories/admin-research.repository";

const OUTCOME_LABELS: Record<string, string> = {
  not_assessed: "รอตรวจ",
  passed: "ผ่าน",
  partial: "ผ่านบางส่วน",
  failed: "ไม่ผ่าน",
};

function shortCode(value: string) {
  return value.slice(0, 8).toUpperCase();
}

export function ResearchOperatorAssessmentQueue({
  studyId,
  assessments,
}: {
  studyId: string;
  assessments: AdminResearchOperatorAssessment[];
}) {
  const pending = assessments.filter((entry) => entry.outcome === "not_assessed");
  return (
    <section className="border border-[var(--admin-border)] bg-white" aria-labelledby="operator-assessment-heading">
      <div className="flex flex-col gap-2 border-b border-[var(--admin-border)] p-5 sm:flex-row sm:items-end sm:justify-between">
        <div><h2 id="operator-assessment-heading" className="text-lg font-black">คิวตรวจโจทย์ตัดสินใจ</h2><p className="mt-1 text-sm text-slate-600">ตรวจเหตุผลตามเกณฑ์ที่ล็อกรุ่นไว้ การตรวจผลไม่เปลี่ยนคำตอบต้นฉบับของผู้เข้าร่วม</p></div>
        <p className="text-sm font-black text-[#B94727]">รอตรวจ {pending.length.toLocaleString("th-TH")} / ทั้งหมด {assessments.length.toLocaleString("th-TH")}</p>
      </div>
      {assessments.length === 0 ? <p className="p-8 text-center text-sm text-slate-600">ยังไม่มีงานที่ส่งสมบูรณ์</p> : (
        <div className="divide-y divide-slate-200">
          {assessments.map((entry) => (
            <article key={entry.attemptId} className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs"><span className="bg-slate-100 px-2 py-1 font-mono font-bold">Participant {shortCode(entry.participantCode)}</span><span className="border border-slate-300 px-2 py-1 font-bold">{entry.participantType === "operator" ? "ผู้ประกอบการ" : "ผู้ดูแลสถานที่"}</span><span className={`border px-2 py-1 font-black ${entry.outcome === "not_assessed" ? "border-amber-300 bg-amber-50 text-amber-900" : "border-emerald-300 bg-emerald-50 text-emerald-800"}`}>{OUTCOME_LABELS[entry.outcome ?? "not_assessed"] ?? entry.outcome}</span></div>
                <h3 className="mt-3 font-black">{entry.taskTitleTh}</h3><p className="mt-1 font-mono text-xs text-slate-500">{entry.taskCode}</p>
                <div className="mt-4 border-l-2 border-slate-300 bg-slate-50 p-4"><p className="text-xs font-black text-slate-500">เหตุผลที่ผู้เข้าร่วมบันทึก</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{entry.rationale || "ไม่ได้ระบุ"}</p></div>
                <p className="mt-3 text-xs text-slate-500">ความมั่นใจ {entry.confidence ?? "ไม่ระบุ"}/5 · ส่งเมื่อ {entry.completedAt ? new Intl.DateTimeFormat("th-TH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(entry.completedAt)) : "ไม่ระบุ"}</p>
              </div>
              <form action={assessResearchOperatorAttemptAction} className="border border-slate-300 bg-slate-50 p-4">
                <input type="hidden" name="studyId" value={studyId} /><input type="hidden" name="attemptId" value={entry.attemptId} />
                <label className="block text-sm font-black">ผลตามเกณฑ์<select name="outcome" defaultValue={entry.outcome === "not_assessed" ? "" : entry.outcome ?? ""} required className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">เลือกผล</option><option value="passed">ผ่าน</option><option value="partial">ผ่านบางส่วน</option><option value="failed">ไม่ผ่าน</option></select></label>
                <label className="mt-4 block text-sm font-black">คุณภาพหลักฐาน 1–5<select name="evidenceQuality" defaultValue={entry.evidenceQuality ?? ""} required className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="">เลือกคะแนน</option>{[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>{score}</option>)}</select></label>
                <label className="mt-4 block text-sm font-black">บันทึกผู้ตรวจ (ไม่บังคับ)<textarea name="reviewNote" rows={3} maxLength={2000} defaultValue={entry.reviewNote ?? ""} placeholder="บันทึกเกณฑ์หรือข้อสังเกต โดยไม่ใส่ข้อมูลส่วนบุคคล" className="mt-2 w-full resize-y border border-slate-300 bg-white px-3 py-2 font-normal" /></label>
                <button type="submit" className="mt-4 min-h-11 w-full bg-[#202020] px-4 font-black text-white hover:bg-[#B94727]">บันทึกผลตรวจ</button>
              </form>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
