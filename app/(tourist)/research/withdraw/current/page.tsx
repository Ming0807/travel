import Link from "next/link";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { withdrawResearchSessionAction } from "@/app/actions/research-actions";
import { hasCurrentResearchParticipation } from "@/lib/services/research.service";

export default async function ResearchWithdrawalPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = await searchParams;
  const success = (Array.isArray(query.success) ? query.success[0] : query.success) === "1";
  const failed = (Array.isArray(query.error) ? query.error[0] : query.error) === "withdrawal_failed";
  const active = success ? false : await hasCurrentResearchParticipation();

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-ink">
      <div className="mx-auto max-w-xl border border-slate-200 bg-white p-6 sm:p-8">
        <ShieldCheck aria-hidden="true" className="text-teal" size={42} weight="fill" />
        <h1 className="mt-4 text-2xl font-black">ถอนตัวจากการวิจัย</h1>
        {success ? (
          <>
            <p className="mt-4 text-sm leading-7 text-slate-700">ระบบบันทึกการถอนตัวแล้ว คำตอบของคุณจะไม่ถูกรวมในการวิเคราะห์งานวิจัย</p>
            <Link href="/" className="mt-6 flex min-h-12 items-center justify-center bg-teal px-5 font-black text-white">กลับหน้าหลัก</Link>
          </>
        ) : active ? (
          <>
            <div className="mt-5 border-y border-slate-200 py-5 text-sm leading-7 text-slate-700">
              <p>คุณถอนตัวได้ทุกเมื่อโดยไม่เสียสิทธิใบประกาศ ตราประทับ พาสปอร์ต หรือบริการท่องเที่ยว</p>
              <p className="mt-3">ข้อมูลการเข้าชมและใบประกาศที่เกิดจากการให้บริการจะยังคงอยู่ตามวัตถุประสงค์บริการ แต่จะถูกแยกออกจากชุดวิเคราะห์งานวิจัย</p>
            </div>
            {failed ? <p role="alert" className="mt-4 border border-rose-300 bg-rose-50 p-3 text-sm font-semibold text-rose-800">ยังถอนตัวไม่ได้ กรุณาลองใหม่</p> : null}
            <form action={withdrawResearchSessionAction} className="mt-5 space-y-4">
              <label className="block text-sm font-bold">
                เหตุผล (ไม่บังคับ)
                <textarea name="reason" maxLength={500} rows={4} className="mt-2 w-full border border-slate-300 px-4 py-3 font-normal outline-none focus:border-teal" />
              </label>
              <button type="submit" className="min-h-12 w-full bg-rose-700 px-5 font-black text-white hover:bg-rose-800">ยืนยันถอนตัวจากการวิจัย</button>
              <Link href="/" className="flex min-h-12 items-center justify-center border border-slate-300 font-bold text-slate-700">ยังไม่ถอนตัว</Link>
            </form>
          </>
        ) : (
          <>
            <p className="mt-4 text-sm leading-7 text-slate-700">ไม่พบการเข้าร่วมวิจัยที่ยังใช้งานอยู่ในอุปกรณ์นี้</p>
            <Link href="/" className="mt-6 flex min-h-12 items-center justify-center bg-teal px-5 font-black text-white">กลับหน้าหลัก</Link>
          </>
        )}
      </div>
    </main>
  );
}
