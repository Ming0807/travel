import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarBlank, Clock, Envelope, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

import { acceptResearchInvitationAction } from "@/app/actions/research-actions";
import { getOptionalResearchInvitation } from "@/lib/services/research.service";

const errors: Record<string, string> = {
  consent_required: "กรุณาทำเครื่องหมายยืนยันหลังจากอ่านรายละเอียดแล้ว",
  unavailable: "ยังบันทึกการเข้าร่วมไม่ได้ กรุณาลองใหม่ หรือเลือกไม่เข้าร่วมเพื่อดำเนินการต่อ",
};

function safeReturnPath(value: string | string[] | undefined, fallback: string) {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate?.startsWith("/") && !candidate.startsWith("//") && !candidate.includes("\\")
    ? candidate
    : fallback;
}

export default async function ResearchInvitationPage({
  params,
  searchParams,
}: {
  params: Promise<{ studyCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ studyCode }, query] = await Promise.all([params, searchParams]);
  const checkinCode = Array.isArray(query.checkinCode) ? query.checkinCode[0] : query.checkinCode;
  if (!checkinCode) notFound();

  let invitation;
  try {
    invitation = await getOptionalResearchInvitation({ studyCode, checkinCode });
  } catch {
    invitation = null;
  }
  if (!invitation) notFound();

  const returnTo = safeReturnPath(query.returnTo, `/checkin/${checkinCode}/start`);
  const errorCode = Array.isArray(query.error) ? query.error[0] : query.error;
  const retentionLabel = invitation.retentionUntil
    ? new Intl.DateTimeFormat("th-TH", { dateStyle: "long" }).format(new Date(invitation.retentionUntil))
    : "ตามระยะเวลาที่ระบุในโครงการวิจัย";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-ink sm:py-12">
      <div className="mx-auto max-w-2xl">
        <Link href={returnTo} className="inline-flex min-h-11 items-center text-sm font-bold text-teal hover:text-ink">
          กลับไปสร้างใบประกาศ
        </Link>

        <header className="mt-4 border-b border-slate-300 pb-6">
          <p className="text-sm font-bold text-coral">คำชี้แจงและความยินยอมการวิจัย</p>
          <h1 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">{invitation.titleTh}</h1>
          <p className="mt-3 max-w-prose text-sm leading-7 text-slate-700">{invitation.purposeTh}</p>
        </header>

        <div className="divide-y divide-slate-200 border-b border-slate-300 bg-white px-5 sm:px-7">
          <section className="py-5">
            <h2 className="font-black">สิ่งที่คุณจะทำ</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">{invitation.participationTh}</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal">
              <Clock aria-hidden="true" size={18} /> ใช้เวลาประมาณ {invitation.instrument.estimatedMinutes ?? 4} นาที
            </p>
          </section>
          <section className="py-5">
            <h2 className="font-black">การใช้และดูแลข้อมูล</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">{invitation.privacyTh}</p>
            <p className="mt-3 inline-flex items-start gap-2 text-sm text-slate-700">
              <CalendarBlank aria-hidden="true" className="mt-0.5 shrink-0 text-teal" size={18} />
              เก็บข้อมูลถึง {retentionLabel}
            </p>
          </section>
          <section className="py-5">
            <h2 className="font-black">สิทธิของคุณ</h2>
            <p className="mt-2 text-sm leading-7 text-slate-700">{invitation.withdrawalTh}</p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <ShieldCheck aria-hidden="true" size={18} weight="fill" />
              ไม่เข้าร่วมหรือถอนตัวได้ โดยไม่เสียสิทธิใบประกาศ ตราประทับ หรือบริการท่องเที่ยว
            </p>
          </section>
          <section className="py-5">
            <h2 className="font-black">ติดต่อผู้วิจัย</h2>
            <a href={`mailto:${invitation.contactEmail}`} className="mt-2 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-teal underline underline-offset-4">
              <Envelope aria-hidden="true" size={18} /> {invitation.contactEmail}
            </a>
          </section>
        </div>

        {errorCode && errors[errorCode] ? (
          <p role="alert" className="mt-5 border border-rose-300 bg-rose-50 p-4 text-sm font-semibold text-rose-800">
            {errors[errorCode]}
          </p>
        ) : null}

        <form action={acceptResearchInvitationAction} className="mt-6 space-y-4">
          <input type="hidden" name="studyCode" value={studyCode} />
          <input type="hidden" name="checkinCode" value={checkinCode} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <input type="hidden" name="language" value="th" />
          <label className="flex cursor-pointer items-start gap-3 border border-slate-300 bg-white p-4 text-sm leading-6 text-slate-800">
            <input
              type="checkbox"
              name="hasConsented"
              value="true"
              required
              className="mt-1 size-5 shrink-0 accent-teal"
            />
            <span>ฉันอ่านและเข้าใจข้อมูลข้างต้น และยินยอมเข้าร่วมการวิจัยโดยสมัครใจ</span>
          </label>
          <button type="submit" className="min-h-14 w-full bg-teal px-5 py-3 font-black text-white hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2">
            ยืนยันเข้าร่วมการวิจัย
          </button>
          <Link href={returnTo} className="flex min-h-12 w-full items-center justify-center border border-slate-300 bg-white px-5 py-3 text-center font-bold text-slate-700 hover:bg-slate-100">
            ไม่เข้าร่วม และสร้างใบประกาศต่อ
          </Link>
        </form>
      </div>
    </main>
  );
}
