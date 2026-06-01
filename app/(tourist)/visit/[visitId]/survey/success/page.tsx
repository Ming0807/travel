import type { Metadata } from "next";
import { SurveySuccessCard } from "@/components/survey/SurveySuccessCard";

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

  return (
    <main className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 flex min-h-screen items-center">
        <SurveySuccessCard visitId={visitId} skipped={skipped} />
      </div>
    </main>
  );
}
