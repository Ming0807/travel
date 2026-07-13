import type { Metadata } from "next";
import { getPostCertificateSurveyPageData } from "@/lib/services/survey.service";
import { MicroSurveyForm } from "@/components/survey/MicroSurveyForm";
import { SurveySkipCard } from "@/components/survey/SurveySkipCard";
import { notFound } from "next/navigation";
import { ClipboardText, ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { SURVEY_PRIVACY_NOTICE } from "@/lib/content/survey-copy";

export const metadata: Metadata = {
  title: "แบบสอบถาม | Southern Border Tourism",
};

const surveyErrorMessages: Record<string, string> = {
  invalid: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง หรือเลือกข้ามแบบสอบถาม",
  survey_reference_invalid: "ตัวเลือกบางรายการไม่พร้อมใช้งานแล้ว กรุณาเลือกคำตอบใหม่อีกครั้ง",
  certificate_required: "กรุณาสร้างใบประกาศก่อนตอบแบบสอบถาม",
  survey_save_failed: "ยังบันทึกคำตอบไม่ได้ กรุณาลองใหม่อีกครั้ง",
  save_failed: "ยังบันทึกคำตอบไม่ได้ กรุณาลองใหม่อีกครั้ง"
};

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ visitId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { visitId } = await params;
  const resolvedSearchParams = await searchParams;
  const rawError = Array.isArray(resolvedSearchParams?.error)
    ? resolvedSearchParams?.error[0]
    : resolvedSearchParams?.error;
  const formError = rawError ? surveyErrorMessages[rawError] ?? surveyErrorMessages.save_failed : undefined;

  let pageData;
  try {
    pageData = await getPostCertificateSurveyPageData(visitId);
  } catch {
    notFound();
  }

  const { options, existingSurvey } = pageData;
  const hasExistingSurvey = !!existingSurvey;

  return (
    <main className="min-h-screen bg-slate-50 relative pb-32 overflow-hidden">
      {/* Premium Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-coral/5 rounded-full blur-[120px] -z-10 translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-teal/5 rounded-full blur-[150px] -z-10 -translate-x-1/3 translate-y-1/3 pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-8 md:pt-12">
        {/* Back Link */}
        <a
          href={`/visit/${visitId}/certificate/success`}
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-coral transition-colors mb-6"
        >
          <ArrowLeft size={16} weight="bold" />
          กลับไปหน้าใบประกาศ
        </a>

        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal to-emerald text-white shadow-md shadow-teal/20 rotate-3">
            <ClipboardText size={28} weight="fill" />
          </div>
          <h1 className="text-3xl font-black text-ink tracking-tight">
            {hasExistingSurvey ? "แบบสอบถามของคุณ" : "แบบสอบถามสั้น ๆ"}
          </h1>
          <p className="text-muted text-sm font-medium mt-3 max-w-sm mx-auto">
            {hasExistingSurvey
              ? "คุณตอบแบบสอบถามนี้แล้ว ขอบคุณสำหรับข้อมูล!"
              : "ช่วยพัฒนาการท่องเที่ยว ใช้เวลาเพียง 1 นาที"}
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="mb-6 rounded-xl bg-white/80 backdrop-blur border border-ink/5 p-4 text-xs leading-5 text-muted shadow-sm animate-fade-in-up delay-100">
          <p className="font-medium">
            <strong className="text-ink">เราใช้ข้อมูลอย่างรับผิดชอบ:</strong> {SURVEY_PRIVACY_NOTICE}
          </p>
        </div>

        {hasExistingSurvey ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-card animate-fade-in-up delay-200">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal/10 text-teal">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted">
              คุณได้ตอบแบบสอบถามสำหรับการเยี่ยมชมนี้แล้ว
            </p>
            <a
              href={`/visit/${visitId}/certificate/success`}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-teal px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-teal/90"
            >
              กลับไปหน้าใบประกาศ
            </a>
          </div>
        ) : (
          <>
            <MicroSurveyForm
              visitId={visitId}
              options={{
                travelCompanions: options.travelCompanions,
                transportModes: options.transportModes,
                travelPurposes: options.travelPurposes,
                expenseCategories: options.expenseCategories,
                spendingRanges: options.spendingRanges,
              }}
              error={formError}
            />

            <div className="mt-4">
              <SurveySkipCard visitId={visitId} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
