import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, ClipboardText } from "@phosphor-icons/react/dist/ssr";

import { ResearchEvaluationForm } from "@/components/research/ResearchEvaluationForm";
import { getCurrentResearchEvaluation, getCurrentResearchOperatorWorkspace } from "@/lib/services/research.service";

export default async function ResearchOperatorEvaluationPage() {
  let evaluation;
  let workspace;
  try {
    [evaluation, workspace] = await Promise.all([
      getCurrentResearchEvaluation(),
      getCurrentResearchOperatorWorkspace(),
    ]);
  } catch {
    notFound();
  }
  if (!evaluation || !workspace || evaluation.participantType === "tourist") notFound();
  if (workspace.completedTasks !== workspace.tasks.length) notFound();

  if (evaluation.status === "submitted" || workspace.status === "completed") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-ink"><div className="mx-auto max-w-lg border border-slate-300 bg-white p-7 text-center"><CheckCircle aria-hidden="true" className="mx-auto text-emerald-700" size={52} weight="fill" /><h1 className="mt-4 text-2xl font-black">ส่งแบบประเมินเรียบร้อยแล้ว</h1><p className="mt-3 text-sm leading-7 text-slate-700">ข้อมูลจะใช้วิเคราะห์ภาพรวมแบบไม่ระบุตัวตนและปกปิดผลกลุ่มตัวอย่างขนาดเล็ก</p><Link href="/" className="mt-6 flex min-h-12 items-center justify-center bg-teal px-5 font-black text-white">เสร็จสิ้น</Link></div></main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-32 pt-8 text-ink sm:pt-12">
      <div className="mx-auto max-w-2xl">
        <header className="border-b border-slate-300 pb-6"><span className="flex size-11 items-center justify-center bg-coral text-white"><ClipboardText aria-hidden="true" size={24} weight="fill" /></span><h1 className="mt-4 text-2xl font-black sm:text-3xl">{evaluation.titleTh}</h1>{evaluation.descriptionTh ? <p className="mt-3 text-sm leading-7 text-slate-700">{evaluation.descriptionTh}</p> : null}<p className="mt-3 text-sm font-semibold text-teal">ประมาณ {evaluation.estimatedMinutes ?? 4} นาที · พักไว้กลับมาตอบต่อได้</p></header>
        <section className="mt-6 bg-white p-5 sm:p-7"><ResearchEvaluationForm instrumentKey={evaluation.instrumentKey} items={evaluation.items} savedAnswers={evaluation.savedAnswers} completionHref="/research/operator/evaluation?completed=1" pauseHref="/research/operator/tasks" /></section>
      </div>
    </main>
  );
}
