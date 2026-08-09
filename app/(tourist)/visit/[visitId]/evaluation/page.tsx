import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, ClipboardText } from "@phosphor-icons/react/dist/ssr";

import { ResearchEvaluationForm } from "@/components/research/ResearchEvaluationForm";
import { getCurrentResearchEvaluation } from "@/lib/services/research.service";

export default async function ResearchEvaluationPage({
  params,
}: {
  params: Promise<{ visitId: string }>;
}) {
  const { visitId } = await params;
  let evaluation;
  try {
    evaluation = await getCurrentResearchEvaluation();
  } catch {
    notFound();
  }
  if (!evaluation || evaluation.visitId !== visitId) notFound();

  if (evaluation.status === "submitted") {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-ink">
        <div className="mx-auto max-w-lg border border-slate-200 bg-white p-7 text-center">
          <CheckCircle aria-hidden="true" className="mx-auto text-emerald-700" size={52} weight="fill" />
          <h1 className="mt-4 text-2xl font-black">ส่งแบบประเมินเรียบร้อยแล้ว</h1>
          <p className="mt-3 text-sm leading-7 text-slate-700">ขอบคุณที่ช่วยให้เราประเมินและพัฒนาระบบจากการใช้งานจริง</p>
          <Link href="/passport" className="mt-6 flex min-h-12 items-center justify-center bg-teal px-5 font-black text-white">ดูพาสปอร์ตของฉัน</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-32 pt-8 text-ink sm:pt-12">
      <div className="mx-auto max-w-2xl">
        <header className="border-b border-slate-300 pb-6">
          <span className="flex size-11 items-center justify-center bg-coral text-white">
            <ClipboardText aria-hidden="true" size={24} weight="fill" />
          </span>
          <h1 className="mt-4 text-2xl font-black sm:text-3xl">{evaluation.titleTh}</h1>
          {evaluation.descriptionTh ? <p className="mt-3 max-w-prose text-sm leading-7 text-slate-700">{evaluation.descriptionTh}</p> : null}
          <p className="mt-3 text-sm font-semibold text-teal">ใช้เวลาประมาณ {evaluation.estimatedMinutes ?? 4} นาที และพักไว้กลับมาตอบต่อได้</p>
        </header>

        <section className="mt-6 bg-white p-5 sm:p-7">
          <ResearchEvaluationForm
            instrumentKey={evaluation.instrumentKey}
            items={evaluation.items}
            savedAnswers={evaluation.savedAnswers}
            completionHref={`/visit/${visitId}/evaluation?completed=1`}
            pauseHref={`/visit/${visitId}/certificate/success`}
          />
        </section>
      </div>
    </main>
  );
}
