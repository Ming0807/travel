import Link from "next/link";
import { Flask, ShieldCheck } from "@phosphor-icons/react/dist/ssr";

type Invitation = {
  studyCode: string;
  titleTh: string;
  purposeTh: string;
  instrument: { estimatedMinutes: number | null };
};

export function ResearchInvitePrompt({
  invitation,
  checkinCode,
}: {
  invitation: Invitation;
  checkinCode: string;
}) {
  const returnTo = `/checkin/${checkinCode}/start`;
  const href = `/research/${invitation.studyCode}/invite?checkinCode=${encodeURIComponent(checkinCode)}&returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <aside className="mb-5 border border-teal/20 bg-tealSoft/60 p-4" aria-labelledby="research-invite-heading">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center bg-white text-teal">
          <Flask aria-hidden="true" size={21} weight="fill" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="research-invite-heading" className="text-base font-black text-ink">
            ร่วมประเมินระบบโดยสมัครใจ
          </h2>
          <p className="mt-1 text-sm leading-6 text-slate-700">{invitation.purposeTh}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-slate-600">
            <span>ประมาณ {invitation.instrument.estimatedMinutes ?? 4} นาที</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-700">
              <ShieldCheck aria-hidden="true" size={16} weight="fill" />
              ไม่กระทบสิทธิใบประกาศ
            </span>
          </div>
          <Link
            href={href}
            className="mt-4 inline-flex min-h-11 items-center justify-center bg-teal px-4 py-2 text-sm font-bold text-white hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
          >
            อ่านรายละเอียดก่อนตัดสินใจ
          </Link>
        </div>
      </div>
    </aside>
  );
}
