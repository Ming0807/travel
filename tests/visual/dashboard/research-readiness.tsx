import { createRoot } from "react-dom/client";
import { ResearchReadinessSummary } from "@/components/admin/research/ResearchReadinessSummary";
import "@/app/globals.css";

const items = [
  { key: "advisor", label: "หลักฐานอนุมัติจากอาจารย์ที่ปรึกษา", ready: false, blockingReason: "ต้องบันทึกวันที่ หลักฐาน ชื่อ ขอบเขต วัตถุประสงค์ คำถามวิจัย และระดับถ้อยคำที่อนุมัติ" },
  { key: "ethics", label: "ข้อกำหนดด้านจริยธรรมการวิจัย", ready: false, blockingReason: "ต้องระบุผลการพิจารณาจริยธรรมจากหลักฐานจริง" },
  { key: "notice", label: "ประกาศความเป็นส่วนตัวและการถอนตัว", ready: true, blockingReason: "" },
  { key: "retention", label: "วันสิ้นสุดการเก็บรักษาข้อมูล", ready: true, blockingReason: "" },
];
const readonly = new URLSearchParams(location.search).has("readonly");
createRoot(document.getElementById("root")!).render(<main className="min-h-screen bg-slate-50 p-4 sm:p-8">
  <div className="mx-auto max-w-5xl space-y-6">
    <header><p className="text-sm text-slate-600">ข้อมูลจำลองสำหรับตรวจหน้าจอ ไม่มีการบันทึกจริง</p><h1 className="mt-2 text-2xl font-bold">โครงการวิจัยท่องเที่ยวยะลา</h1></header>
    <ResearchReadinessSummary items={items} status="draft" canManage={!readonly} canActivate={false} sourcePilotStudyId={null} />
    <section id="research-approval" className="scroll-mt-24 border-t border-slate-200 bg-white p-5"><h2 className="font-bold">บันทึกขอบเขตที่ได้รับอนุมัติ</h2></section>
  </div>
</main>);
