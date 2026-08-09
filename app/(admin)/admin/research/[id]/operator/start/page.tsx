import { randomUUID } from "node:crypto";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarBlank, Clock, Envelope, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { acceptResearchOperatorInvitationAction } from "@/app/actions/research-actions";
import { getAdminResearchOperatorStart } from "@/lib/services/admin-research.service";

const ERROR_MESSAGES: Record<string, string> = {
  consent_required: "กรุณาอ่านรายละเอียดและยืนยันความยินยอมก่อนเริ่ม",
  unavailable: "ยังสร้างเซสชันไม่ได้ ตรวจว่าโครงการยังเปิดอยู่และแบบประเมินถูกเผยแพร่แล้ว",
};

export default async function ResearchOperatorStartPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const rawType = Array.isArray(query.participantType) ? query.participantType[0] : query.participantType;
  const participantType = rawType === "attraction_manager" ? "attraction_manager" as const : "operator" as const;
  const setup = await getAdminResearchOperatorStart(id, participantType);
  if (!setup) notFound();
  const errorCode = Array.isArray(query.error) ? query.error[0] : query.error;
  const participantLabel = participantType === "operator" ? "ผู้ประกอบการ" : "ผู้ดูแลสถานที่";
  const retentionLabel = setup.retentionUntil
    ? new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(new Date(setup.retentionUntil))
    : "ตามระยะเวลาที่ระบุในโครงการ";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-ink sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href={`/admin/research/${id}`} className="inline-flex min-h-11 items-center text-sm font-bold text-teal underline underline-offset-4">กลับศูนย์งานวิจัย</Link>
        <header className="mt-4 border-b border-slate-300 pb-6">
          <p className="text-sm font-black text-coral">คำชี้แจงสำหรับ{participantLabel}</p>
          <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{setup.titleTh}</h1>
          <p className="mt-3 text-sm leading-7 text-slate-700">{setup.purposeTh}</p>
        </header>

        <div className="divide-y divide-slate-200 border-b border-slate-300 bg-white px-5 sm:px-7">
          <section className="py-5"><h2 className="font-black">สิ่งที่คุณจะทำ</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{setup.participationTh}</p><p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal"><Clock aria-hidden="true" /> {setup.taskCount} โจทย์ · ประมาณ {setup.estimatedMinutes} นาที</p></section>
          <section className="py-5"><h2 className="font-black">การใช้และดูแลข้อมูล</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{setup.privacyTh}</p><p className="mt-3 inline-flex items-start gap-2 text-sm text-slate-700"><CalendarBlank aria-hidden="true" className="mt-0.5 shrink-0 text-teal" /> เก็บข้อมูลถึง {retentionLabel}</p></section>
          <section className="py-5"><h2 className="font-black">สิทธิของคุณ</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-700">{setup.withdrawalTh}</p><p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700"><ShieldCheck aria-hidden="true" weight="fill" /> ถอนตัวได้โดยไม่มีผลต่อสิทธิหรือความสัมพันธ์กับโครงการ</p></section>
          <section className="py-5"><h2 className="font-black">ติดต่อผู้วิจัย</h2><a href={`mailto:${setup.contactEmail}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal underline underline-offset-4"><Envelope aria-hidden="true" /> {setup.contactEmail}</a></section>
        </div>

        {errorCode && ERROR_MESSAGES[errorCode] ? <p role="alert" className="mt-5 border border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-800">{ERROR_MESSAGES[errorCode]}</p> : null}

        <form action={acceptResearchOperatorInvitationAction} className="mt-6 space-y-4">
          <input type="hidden" name="studyId" value={setup.studyId} />
          <input type="hidden" name="studyCode" value={setup.studyCode} />
          <input type="hidden" name="idempotencyKey" value={randomUUID()} />
          <input type="hidden" name="participantType" value={participantType} />
          <label className="block border border-slate-300 bg-white p-4 text-sm font-bold">สำหรับผู้ดำเนินการ: รูปแบบการเก็บข้อมูล<select name="collectionMode" defaultValue="field_observation" className="mt-2 min-h-11 w-full border border-slate-300 bg-white px-3 font-normal"><option value="field_observation">ใช้งานจริง ณ สถานที่</option><option value="simulated_usability">สถานการณ์จำลอง</option><option value="pilot_internal">ทดสอบภายใน</option></select></label>
          <label className="flex cursor-pointer items-start gap-3 border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-800"><input type="checkbox" name="hasConsented" value="true" required className="mt-1 size-5 shrink-0 accent-teal" /><span>ฉันอ่านและเข้าใจข้อมูลข้างต้น และยินยอมเข้าร่วมการวิจัยโดยสมัครใจ</span></label>
          <button type="submit" className="min-h-14 w-full bg-teal px-5 font-black text-white hover:bg-ink">ยืนยันและเริ่มทำโจทย์</button>
          <Link href={`/admin/research/${id}`} className="flex min-h-12 items-center justify-center border border-slate-300 bg-white px-5 font-bold text-slate-700">ไม่เข้าร่วม</Link>
        </form>
      </div>
    </main>
  );
}
