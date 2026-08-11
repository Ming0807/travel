import { skipPostCertificateSurveyAction } from "@/app/actions/survey-actions";

export function SurveySkipCard({ visitId }: { visitId: string }) {
  return (
    <form action={skipPostCertificateSurveyAction} className="flex flex-col gap-4 border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <input type="hidden" name="visitId" value={visitId} />
      <div>
        <h2 className="text-base font-black text-ink">ยังไม่สะดวกตอบตอนนี้?</h2>
        <p className="mt-1 text-sm leading-6 text-muted">ข้ามได้ทันที ใบประกาศและตราประทับของคุณจะไม่ถูกยกเลิก</p>
      </div>
      <button type="submit" className="min-h-11 shrink-0 border border-teal/30 bg-white px-5 font-bold text-teal transition-colors hover:bg-teal hover:text-white">
        ข้ามแบบสอบถาม
      </button>
    </form>
  );
}
