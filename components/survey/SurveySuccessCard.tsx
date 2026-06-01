import Link from "next/link";
import { CheckCircle, Compass, Stamp } from "@phosphor-icons/react/dist/ssr";

export function SurveySuccessCard({ visitId, skipped }: { visitId: string; skipped: boolean }) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-8">
      <div className="rounded-2xl bg-white p-6 text-center shadow-card">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal text-white shadow-lg shadow-teal/20">
          <CheckCircle size={36} weight="fill" />
        </div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-coral">
          {skipped ? "Survey skipped" : "Survey completed"}
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
          <Link
            href="/passport"
            className="flex items-center justify-center gap-2 rounded-full bg-teal px-5 py-4 font-black text-white"
          >
            <Stamp weight="fill" /> ดูพาสปอร์ตของฉัน
          </Link>
          <Link
            href={`/visit/${visitId}/certificate/success`}
            className="flex items-center justify-center gap-2 rounded-full bg-tealSoft px-5 py-4 font-bold text-teal"
          >
            <Compass weight="fill" /> กลับไปหน้าใบประกาศ
          </Link>
        </div>
      </div>
    </div>
  );
}
