import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardText, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { MicroSurveyForm } from "@/components/survey/MicroSurveyForm";
import { SurveySkipCard } from "@/components/survey/SurveySkipCard";
import { SURVEY_PRIVACY_NOTICE } from "@/lib/content/survey-copy";
import { getPostCertificateSurveyPageData } from "@/lib/services/survey.service";

export const metadata: Metadata = {
  title: "แบบสอบถาม | Southern Border Tourism",
};

const surveyErrorMessages: Record<string, string> = {
  survey_validation_failed: "คะแนนแบบสอบถามไม่ถูกต้อง กรุณาตรวจสอบแล้วลองใหม่",
  invalid: "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง หรือเลือกข้ามแบบสอบถาม",
  survey_reference_invalid: "ตัวเลือกบางรายการไม่พร้อมใช้งานแล้ว กรุณาเลือกคำตอบใหม่อีกครั้ง",
  certificate_required: "กรุณาสร้างใบประกาศก่อนตอบแบบสอบถาม",
  survey_save_failed: "ยังบันทึกคำตอบไม่ได้ กรุณาลองใหม่อีกครั้ง",
  save_failed: "ยังบันทึกคำตอบไม่ได้ กรุณาลองใหม่อีกครั้ง",
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
    ? resolvedSearchParams.error[0]
    : resolvedSearchParams?.error;
  const formError = rawError
    ? surveyErrorMessages[rawError] ?? surveyErrorMessages.save_failed
    : undefined;

  let pageData;
  try {
    pageData = await getPostCertificateSurveyPageData(visitId);
  } catch {
    notFound();
  }

  const { options, existingSurvey } = pageData;
  const hasExistingSurvey = Boolean(existingSurvey);

  return (
    <main className="min-h-screen bg-slate-50 pb-32 text-ink">
      <div className="mx-auto max-w-xl px-4 pt-7 sm:pt-10">
        <Link
          href={`/visit/${visitId}/certificate/success`}
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-slate-600 transition-colors hover:text-coral"
        >
          <ArrowLeft aria-hidden="true" size={17} weight="bold" />
          กลับไปหน้าใบประกาศ
        </Link>

        <header className="border-b border-slate-300 pb-6">
          <span className="flex size-11 items-center justify-center bg-coral text-white">
            <ClipboardText aria-hidden="true" size={24} weight="fill" />
          </span>
          <p className="mt-4 text-xs font-black uppercase text-teal">ข้อมูลการท่องเที่ยว · ไม่บังคับ</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">
            {hasExistingSurvey ? "แบบสอบถามของคุณ" : "เล่าประสบการณ์ทริปนี้"}
          </h1>
          <p className="mt-3 max-w-prose text-sm font-medium leading-7 text-slate-700">
            {hasExistingSurvey
              ? "คุณตอบแบบสอบถามนี้แล้ว ขอบคุณสำหรับข้อมูล"
              : "เลือกตอบเฉพาะส่วนที่สะดวก ใช้เวลาประมาณ 2–3 นาที และข้ามได้ทุกเมื่อ"}
          </p>
        </header>

        <div className="my-5 flex gap-3 border border-teal/20 bg-[#F2FAF8] p-4 text-xs leading-6 text-slate-700">
          <ShieldCheck aria-hidden="true" className="mt-0.5 shrink-0 text-teal" size={20} weight="fill" />
          <p><strong className="text-ink">ใช้ข้อมูลอย่างรับผิดชอบ:</strong> {SURVEY_PRIVACY_NOTICE}</p>
        </div>

        {hasExistingSurvey ? (
          <div className="border border-slate-200 bg-white p-7 text-center shadow-[0_8px_24px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium text-muted">คุณได้ตอบแบบสอบถามสำหรับการเยี่ยมชมนี้แล้ว</p>
            <Link
              href={`/visit/${visitId}/certificate/success`}
              className="mt-6 inline-flex min-h-12 items-center bg-teal px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-ink"
            >
              กลับไปหน้าใบประกาศ
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <SurveySkipCard visitId={visitId} />
            </div>
            <section
              aria-label="แบบสอบถามการท่องเที่ยว"
              className="border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-6"
            >
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
            </section>
          </>
        )}
      </div>
    </main>
  );
}
