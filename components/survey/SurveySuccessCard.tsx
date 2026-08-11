import Link from "next/link";
import { CheckCircle, ClipboardText, Compass, Stamp } from "@phosphor-icons/react/dist/ssr";

export function SurveySuccessCard({
  visitId,
  skipped,
  researchEvaluationAvailable = false,
}: {
  visitId: string;
  skipped: boolean;
  researchEvaluationAvailable?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="border border-slate-200 bg-white p-6 text-center shadow-[0_10px_30px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-teal text-white">
          <CheckCircle size={36} weight="fill" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-coral">
          {skipped ? "ข้ามแบบสอบถามแล้ว" : "บันทึกคำตอบแล้ว"}
        </p>
        <h1 className="mt-2 text-2xl font-black text-ink">
          {skipped ? "ข้ามแบบสอบถามเรียบร้อย" : "ขอบคุณสำหรับความคิดเห็น"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {skipped
            ? "คุณยังสามารถกลับมาดูใบประกาศและพาสปอร์ตได้ตามปกติ"
            : "ข้อมูลของคุณช่วยพัฒนาการท่องเที่ยวชายแดนใต้ในภาพรวมอย่างปลอดภัย"}
        </p>

        <div className="mt-6 grid gap-3">
          {researchEvaluationAvailable ? (
            <div className="border border-coral/25 bg-[#FFF7F3] p-4 text-left">
              <p className="text-xs font-black uppercase text-coral">สำหรับผู้เข้าร่วมวิจัยเท่านั้น</p>
              <p className="mt-1 text-sm leading-6 text-slate-700">
                แบบประเมินนี้แยกจากข้อมูลท่องเที่ยว และแสดงเพราะคุณยินยอมเข้าร่วมงานวิจัยแล้ว
              </p>
              <Link
                href={`/visit/${visitId}/evaluation`}
                className="mt-3 flex min-h-12 items-center justify-center gap-2 bg-coral px-5 py-3 font-black text-white"
              >
                <ClipboardText aria-hidden="true" weight="fill" /> ตอบแบบประเมินการวิจัย
              </Link>
            </div>
          ) : null}
          <Link
            href="/passport"
            className="flex min-h-12 items-center justify-center gap-2 bg-teal px-5 py-3 font-black text-white"
          >
            <Stamp weight="fill" /> ดูพาสปอร์ตของฉัน
          </Link>
          <Link
            href={`/visit/${visitId}/certificate/success`}
            className="flex min-h-12 items-center justify-center gap-2 border border-teal/20 bg-white px-5 py-3 font-bold text-teal"
          >
            <Compass weight="fill" /> กลับไปหน้าใบประกาศ
          </Link>
        </div>
      </div>
    </div>
  );
}
