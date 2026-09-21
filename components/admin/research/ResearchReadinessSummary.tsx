import { ArrowRight, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import type { ResearchReadinessItem } from "@/lib/services/admin-research.service";
import type { ResearchStudyStatus } from "@/lib/repositories/admin-research.repository";

const TARGETS: Record<string, { href: string; label: string }> = {
  advisor: { href: "#research-approval", label: "ตรวจหลักฐานอนุมัติ" },
  ethics: { href: "#research-approval", label: "ตรวจข้อกำหนดจริยธรรม" },
  notice: { href: "#protocol-heading", label: "ทบทวนประกาศสำหรับผู้เข้าร่วม" },
  retention: { href: "#protocol-heading", label: "ทบทวนระยะเวลาเก็บรักษา" },
  instrument: { href: "#instrument-heading", label: "ตรวจแบบประเมิน" },
  deployment: { href: "#research-deployment", label: "ตรวจจุดเก็บข้อมูล" },
  stakeholder: { href: "#operator-task-heading", label: "ตรวจโจทย์ผู้มีส่วนได้ส่วนเสีย" },
  drafts: { href: "#instrument-heading", label: "ตรวจฉบับร่างที่ค้างอยู่" },
  expert_review: { href: "#research-activation-control", label: "ตรวจหลักฐานผู้เชี่ยวชาญ" },
  cognitive_pretest: { href: "#research-activation-control", label: "ตรวจหลักฐาน Pretest" },
  mobile_qa: { href: "#research-activation-control", label: "ตรวจหลักฐานทดสอบมือถือ" },
  freeze_snapshot: { href: "#research-activation-control", label: "ทบทวนก่อนล็อกรุ่น" },
};

const STATUS_GUIDANCE: Record<ResearchStudyStatus, string> = {
  draft: "การเปิดเก็บข้อมูลยังต้องยืนยันหลักฐานและการล็อกรุ่นที่ส่วนควบคุมสถานะโครงการ",
  active: "กำลังเปิดเก็บข้อมูล ติดตามความครบถ้วนและการตอบแบบประเมินจากผลวิเคราะห์ด้านล่าง",
  paused: "พักการเก็บข้อมูลอยู่ ทบทวนผลและหลักฐานก่อนดำเนินการต่อที่ส่วนควบคุมสถานะโครงการ",
  closed: "ปิดการเก็บข้อมูลแล้ว ใช้ผลวิเคราะห์และหลักฐานประกอบการทบทวนผลโครงการ",
  archived: "จัดเก็บโครงการแล้ว ข้อมูลหน้านี้ใช้สำหรับตรวจสอบย้อนหลัง",
};

export function ResearchReadinessSummary({ items, status, canManage, canActivate, sourcePilotStudyId }: {
  items: ResearchReadinessItem[];
  status: ResearchStudyStatus;
  canManage: boolean;
  canActivate: boolean;
  sourcePilotStudyId: string | null;
}) {
  const pending = items.filter((item) => !item.ready);
  const next = pending[0];
  const canNavigate = canManage && status === "draft" && items.length > 0;
  const target = next?.key === "pilot_decision"
    ? { href: sourcePilotStudyId ? `/admin/research/${encodeURIComponent(sourcePilotStudyId)}#research-activation-control` : "/admin/research", label: "ตรวจผล Pilot ต้นทาง" }
    : next ? TARGETS[next.key] : canActivate ? { href: "#research-study-controls", label: "ทบทวนก่อนเปิดเก็บข้อมูล" } : undefined;

  return (
    <section aria-labelledby="readiness-heading" className="min-w-0 border-y border-[var(--admin-border)] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <h2 id="readiness-heading" className="text-lg font-black">ความพร้อมก่อนเก็บข้อมูล</h2>
        <span className="text-sm font-bold text-slate-700">พร้อม {items.length - pending.length}/{items.length} รายการ</span>
      </div>
      <div className="grid min-w-0 gap-4 border-l-4 border-[#B94727] bg-orange-50/60 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
        <div className="min-w-0 break-words">
          <p className="text-xs font-bold text-[#9A3412]">{status === "draft" ? "รายการที่ต้องทบทวน" : "สถานะรายการตรวจ"}</p>
          <p className="mt-1 font-bold text-slate-900">{items.length === 0 ? "ยังไม่มีรายการตรวจความพร้อม" : next?.label ?? "ผ่านรายการตรวจครบแล้ว"}</p>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-700">{next?.blockingReason || STATUS_GUIDANCE[status]}</p>
          {!canManage && next ? <p className="mt-2 text-sm text-slate-700">ติดต่อผู้ดูแลโครงการเพื่อจัดการรายการที่ยังไม่พร้อม</p> : null}
        </div>
        {canNavigate && target ? <a href={target.href} className="inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-lg bg-[#202020] px-4 py-2 text-center text-sm font-bold text-white hover:bg-[#B94727] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-700">{target.label}<ArrowRight className="shrink-0" aria-hidden="true" /></a> : null}
      </div>
      <details className="group">
        <summary className="min-h-12 cursor-pointer px-5 py-4 text-sm font-bold text-slate-800 focus-visible:outline-2 focus-visible:outline-orange-700">ดูรายการตรวจทั้งหมด ({items.length})</summary>
        <ul className="grid border-t border-slate-200 lg:grid-cols-2">
          {items.map((item) => <li key={item.key} className="flex min-w-0 items-start gap-3 border-b border-slate-100 px-5 py-4">
            {item.ready ? <CheckCircle className="mt-0.5 shrink-0 text-emerald-700" size={20} aria-hidden="true" /> : <WarningCircle className="mt-0.5 shrink-0 text-amber-700" size={20} aria-hidden="true" />}
            <div className="min-w-0 break-words"><p className="text-sm font-bold text-slate-900">{item.label}<span className="sr-only">{item.ready ? " พร้อม" : " ยังไม่พร้อม"}</span></p>{!item.ready ? <p className="mt-1 text-xs leading-5 text-slate-600">{item.blockingReason}</p> : null}</div>
          </li>)}
        </ul>
      </details>
    </section>
  );
}
