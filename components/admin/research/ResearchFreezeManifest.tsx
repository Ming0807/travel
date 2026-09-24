import type { AdminResearchStudyDetail } from "@/lib/repositories/admin-research.repository";

const AUDIENCE_LABELS = {
  tourist: "นักท่องเที่ยว",
  operator: "ผู้ประกอบการ",
  attraction_manager: "ผู้ดูแลสถานที่",
} as const;

export function ResearchFreezeManifest({ detail }: { detail: AdminResearchStudyDetail }) {
  const snapshot = detail.freezeSnapshot;
  const instruments = snapshot?.instrumentManifest ?? detail.instruments
    .filter((instrument) => instrument.status === "published")
    .map((instrument) => ({
      instrumentKey: instrument.instrumentKey,
      versionNumber: instrument.versionNumber,
      audience: instrument.audience,
      itemCodes: detail.items.filter((item) => item.instrumentId === instrument.researchInstrumentId).map((item) => item.itemCode),
    }));
  const tasks = snapshot?.taskManifest ?? detail.operatorTasks
    .filter((task) => task.status === "published")
    .map((task) => ({ taskCode: task.taskCode, versionNumber: task.versionNumber, audience: task.audience }));

  return (
    <div className="mt-4 border-t border-slate-200 pt-4 text-sm">
      <p className="font-black">{snapshot ? "Manifest ที่บันทึกใน Freeze" : "Manifest ที่ระบบจะบันทึก"}</p>
      <p className="mt-1 text-xs leading-5 text-slate-600">{snapshot ? "ค่าด้านล่างอ่านจาก snapshot ที่ล็อกแล้ว" : "ตรวจรุ่นและรายการเครื่องมือก่อนยืนยัน ระบบดึงค่ากลุ่มนี้จากโครงการโดยไม่ต้องกรอกซ้ำ"}</p>
      <dl className="mt-3 grid gap-x-4 gap-y-2 border-y border-slate-200 py-2 sm:grid-cols-3">
        {([
          ["Protocol", snapshot?.protocolVersion ?? detail.study.protocolVersion],
          ["Consent", snapshot?.consentVersion ?? detail.study.consentVersion],
          ["Privacy notice", snapshot?.noticeVersion ?? detail.study.noticeVersion],
        ] as const).map(([label, version]) => <div key={label} className="min-w-0 py-1"><dt className="text-xs text-slate-500">{label}</dt><dd className="mt-1 break-all font-mono font-bold">v{version}</dd></div>)}
      </dl>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <h4 className="font-bold">แบบประเมิน ({instruments.length})</h4>
          {instruments.length === 0 ? <p className="mt-2 text-xs text-amber-800">ยังไม่มีรุ่นเผยแพร่</p> : <ul className="mt-2 space-y-2 text-xs text-slate-700">{instruments.map((instrument) => <li key={`${instrument.instrumentKey}:${instrument.audience}:${instrument.versionNumber}`} className="min-w-0"><span className="break-all">{instrument.instrumentKey} · {AUDIENCE_LABELS[instrument.audience]}</span><span className="ml-2 whitespace-nowrap font-bold">v{instrument.versionNumber} · {instrument.itemCodes.length} ข้อ</span></li>)}</ul>}
        </div>
        <div className="min-w-0">
          <h4 className="font-bold">โจทย์ตัดสินใจ ({tasks.length})</h4>
          {tasks.length === 0 ? <p className="mt-2 text-xs text-slate-500">ไม่มีโจทย์ในโครงการนี้</p> : <ul className="mt-2 space-y-2 text-xs text-slate-700">{tasks.map((task) => <li key={`${task.taskCode}:${task.audience}:${task.versionNumber}`} className="min-w-0"><span className="break-all">{task.taskCode} · {AUDIENCE_LABELS[task.audience]}</span><span className="ml-2 whitespace-nowrap font-bold">v{task.versionNumber}</span></li>)}</ul>}
        </div>
      </div>
    </div>
  );
}
