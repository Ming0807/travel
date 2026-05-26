import { notFound } from "next/navigation";
import { SurveySuccessCard } from "@/components/survey/SurveySuccessCard";
import { uuidSchema } from "@/lib/validation/common";

export default async function SurveySuccessPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ skipped?: string }>;
}) {
  const { id: rawVisitId } = await props.params;
  const { skipped } = await props.searchParams;

  const visitIdResult = uuidSchema.safeParse(rawVisitId);
  if (!visitIdResult.success) {
    notFound();
  }
  const visitId = visitIdResult.data;

  return (
    <main className="min-h-screen bg-cream">
      <SurveySuccessCard visitId={visitId} skipped={skipped === "1"} />
    </main>
  );
}
