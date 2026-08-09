import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartBar, CheckCircle } from "@phosphor-icons/react/dist/ssr";

import { ResearchOperatorTaskWorkspace } from "@/components/research/ResearchOperatorTaskWorkspace";
import { getCurrentResearchOperatorWorkspace } from "@/lib/services/research.service";

export default async function ResearchOperatorTasksPage() {
  let workspace;
  try {
    workspace = await getCurrentResearchOperatorWorkspace();
  } catch {
    notFound();
  }
  if (!workspace || workspace.tasks.length === 0) notFound();
  const label = workspace.participantType === "operator" ? "ผู้ประกอบการ" : "ผู้ดูแลสถานที่";

  if (workspace.status === "completed") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-ink"><div className="mx-auto max-w-lg border border-slate-300 bg-white p-7 text-center"><CheckCircle aria-hidden="true" className="mx-auto text-emerald-700" size={52} weight="fill" /><h1 className="mt-4 text-2xl font-black">ดำเนินการครบแล้ว</h1><p className="mt-3 text-sm leading-7 text-slate-700">ขอบคุณที่ช่วยประเมินว่าข้อมูลใน Dashboard สนับสนุนการตัดสินใจได้เพียงใด</p><Link href="/" className="mt-6 flex min-h-12 items-center justify-center bg-teal px-5 font-black text-white">กลับหน้าแรก</Link></div></main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-24 pt-8 text-ink sm:pt-12">
      <div className="mx-auto max-w-3xl">
        <header className="border-b border-slate-300 pb-6"><span className="flex size-11 items-center justify-center bg-coral text-white"><ChartBar aria-hidden="true" size={24} weight="fill" /></span><p className="mt-4 text-sm font-black text-teal">งานประเมินสำหรับ{label}</p><h1 className="mt-1 text-2xl font-black sm:text-3xl">ใช้ข้อมูล Dashboard เพื่อตัดสินใจ</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">เปิด Dashboard ในอีกแท็บ อ่านข้อมูลตามโจทย์ แล้วบันทึกเหตุผลที่ใช้ตัดสินใจ ระบบวัดความสำเร็จจากคำตอบจริง ไม่เก็บชื่อร้านหรือข้อมูลส่วนบุคคลในหน้าตอบนี้</p><Link href="/admin/dashboard" target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-12 items-center bg-ink px-5 font-black text-white hover:bg-coral">เปิด Dashboard ในแท็บใหม่</Link></header>
        <div className="mt-6"><ResearchOperatorTaskWorkspace tasks={workspace.tasks} completedTasks={workspace.completedTasks} /></div>
        <Link href="/research/withdraw/current" className="mt-6 inline-flex min-h-11 items-center text-sm font-bold text-slate-600 underline underline-offset-4">ถอนตัวจากการวิจัย</Link>
      </div>
    </main>
  );
}
