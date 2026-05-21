import { skipPostCertificateSurveyAction } from "@/app/actions/survey-actions";

export function SurveySkipCard({ visitId }: { visitId: string }) {
  return (
    <form action={skipPostCertificateSurveyAction} className="rounded-[1.75rem] border border-white bg-white p-5 shadow-card">
      <input type="hidden" name="visitId" value={visitId} />
      <h2 className="text-lg font-black text-ink">ยังไม่สะดวกตอบตอนนี้?</h2>
      <p className="mt-2 text-sm leading-6 text-muted">
        คุณสามารถข้ามแบบสอบถามได้ ใบประกาศและตราประทับของคุณจะไม่ถูกยกเลิก
      </p>
      <button type="submit" className="mt-4 w-full rounded-full border border-teal/20 bg-tealSoft px-5 py-3 font-bold text-teal">
        ข้ามแบบสอบถาม
      </button>
    </form>
  );
}
