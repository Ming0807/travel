import type { Metadata } from "next";
import { SurveySuccessCard } from "@/components/survey/SurveySuccessCard";
import { getCurrentResearchEvaluation } from "@/lib/services/research.service";

export const metadata: Metadata = {
  title: "ขอบคุณสำหรับคำตอบ | Southern Border Tourism",
};

export default async function SurveySuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ visitId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { visitId } = await params;
  const resolvedSearchParams = await searchParams;
  const skipped = Array.isArray(resolvedSearchParams?.skipped)
    ? resolvedSearchParams?.skipped[0] === "1"
    : resolvedSearchParams?.skipped === "1";

  let researchEvaluationAvailable = false;
  try {
    const evaluation = await getCurrentResearchEvaluation(visitId);
    researchEvaluationAvailable = evaluation.visitId === visitId && evaluation.status !== "submitted";
  } catch {
    // Most tourists are not enrolled in research. The normal success flow stays unchanged.
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen items-center">
        <SurveySuccessCard
          visitId={visitId}
          skipped={skipped}
          researchEvaluationAvailable={researchEvaluationAvailable}
        />
      </div>
    </main>
  );
}
