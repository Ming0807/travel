import { notFound } from "next/navigation";
import { MapPin, ClipboardText } from "@phosphor-icons/react/dist/ssr";
import { MicroSurveyForm } from "@/components/survey/MicroSurveyForm";
import { SurveySkipCard } from "@/components/survey/SurveySkipCard";
import { getPostCertificateSurveyPageData, SurveyFlowError } from "@/lib/services/survey.service";
import { uuidSchema } from "@/lib/validation/common";
import Link from "next/link";

type SurveyPageData =
  | { kind: "ready"; visit: Record<string, unknown>; options: Awaited<ReturnType<typeof getPostCertificateSurveyPageData>>["options"] }
  | { kind: "certificate_required"; message: string; visitId: string }
  | { kind: "access_denied"; message: string };

async function loadSurveyData(visitId: string): Promise<SurveyPageData> {
  try {
    const { visit, options } = await getPostCertificateSurveyPageData(visitId);
    return { kind: "ready", visit: visit as Record<string, unknown>, options };
  } catch (error) {
    if (error instanceof SurveyFlowError) {
      if (error.code === "CERTIFICATE_REQUIRED") {
        return { kind: "certificate_required", message: error.message, visitId };
      }
      return { kind: "access_denied", message: error.message };
    }
    throw error;
  }
}

export default async function SurveyPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id: rawVisitId } = await props.params;
  const { error: errorParam } = await props.searchParams;

  const visitIdResult = uuidSchema.safeParse(rawVisitId);
  if (!visitIdResult.success) {
    notFound();
  }
  const visitId = visitIdResult.data;

  const data = await loadSurveyData(visitId);

  if (data.kind === "certificate_required") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-card">
          <h1 className="text-xl font-black text-ink">กรุณาสร้างใบประกาศก่อน</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{data.message}</p>
          <Link
            href={`/visit/${visitId}/certificate/preview`}
            className="mt-5 inline-flex rounded-full bg-teal px-5 py-3 font-bold text-white"
          >
            ไปสร้างใบประกาศ
          </Link>
        </div>
      </main>
    );
  }

  if (data.kind === "access_denied") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-4">
        <div className="max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-card">
          <h1 className="text-xl font-black text-ink">ไม่สามารถเข้าถึงแบบสอบถามได้</h1>
          <p className="mt-3 text-sm leading-6 text-muted">{data.message}</p>
          <Link
            href="/"
            className="mt-5 inline-flex rounded-full bg-teal px-5 py-3 font-bold text-white"
          >
            กลับหน้าหลัก
          </Link>
        </div>
      </main>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const attraction = (data.visit as any).attractions;

  return (
    <main className="min-h-screen bg-cream px-4 py-8">
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-coral/15 text-coral">
            <ClipboardText size={28} weight="fill" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-coral">
            Optional Survey
          </p>
          <h1 className="mt-2 text-2xl font-black text-ink">
            แบบสอบถามสั้น ๆ
          </h1>
          {attraction && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-muted">
              <MapPin weight="fill" className="text-coral" />
              {attraction.name_th || attraction.name_en || "สถานที่ท่องเที่ยว"}
            </p>
          )}
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted">
            ข้อมูลทุกข้อเป็นตัวเลือก ตอบเท่าที่สะดวก ใบประกาศและตราประทับของคุณจะไม่ถูกยกเลิก
          </p>
        </div>

        {/* Survey Form */}
        <MicroSurveyForm
          visitId={visitId}
          options={data.options}
          error={errorParam === "invalid" ? "invalid" : undefined}
        />

        {/* Skip Card */}
        <div className="mt-5">
          <SurveySkipCard visitId={visitId} />
        </div>
      </div>
    </main>
  );
}
