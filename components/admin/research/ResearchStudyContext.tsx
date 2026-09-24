import type { AdminResearchStudy } from "@/lib/repositories/admin-research.repository";

type ContextStudy = Pick<AdminResearchStudy,
  "approvedTitleTh" | "approvedGeographicBoundary" | "approvalReference" |
  "studyCode" | "scopeCode" | "studyKind" | "protocolVersion" |
  "consentVersion" | "noticeVersion"
>;

export function ResearchStudyContext({ study, approvalReady }: { study: ContextStudy; approvalReady: boolean }) {
  return (
    <section aria-labelledby="research-context-heading" className="border-y border-slate-200 bg-white py-4">
      <div className="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
        <div className="min-w-0">
          <h2 id="research-context-heading" className="text-xs font-black text-[#B94727]">ขอบเขตงานวิจัย</h2>
          <p className="mt-1 text-xs font-bold text-slate-600">{approvalReady ? "หลักฐานอนุมัติครบตามรายการตรวจ" : "ยังไม่ผ่านรายการตรวจหลักฐานอนุมัติ"}</p>
          <p className="mt-1 text-sm font-bold leading-6 text-slate-900">
            {study.approvedTitleTh ?? "ยังไม่ได้บันทึกขอบเขตที่อนุมัติ"}
          </p>
          <p className="mt-1 whitespace-pre-line break-words text-sm leading-6 text-slate-600">
            {study.approvedGeographicBoundary ?? "ต้องบันทึกชื่อ พื้นที่ และหลักฐานตามเอกสารที่อาจารย์อนุมัติก่อนเปิดเก็บข้อมูล"}
          </p>
        </div>
        <p className="text-xs font-bold text-slate-600 md:text-right">
          {study.studyKind === "pilot" ? "Pilot ควบคุม" : "เก็บข้อมูลภาคสนาม"}
          <span className="mt-1 block font-normal">Protocol v{study.protocolVersion} · Consent v{study.consentVersion} · Notice v{study.noticeVersion}</span>
        </p>
      </div>
      <details className="mt-2 text-xs text-slate-500">
        <summary className="w-fit cursor-pointer py-1 font-bold focus-visible:outline-2 focus-visible:outline-orange-700">รหัสและหลักฐานอ้างอิง</summary>
        <p className="mt-1 break-all">Study: {study.studyCode} · Scope: {study.scopeCode} · หลักฐาน: {study.approvalReference ?? "ยังไม่บันทึก"}</p>
      </details>
    </section>
  );
}
