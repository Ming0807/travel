"use client";

import { useActionState, useState } from "react";
import { CheckCircle, LockKey, Spinner, UsersThree, WarningCircle } from "@phosphor-icons/react";
import {
  initialLeaderboardPreferenceActionState,
  updateLeaderboardPreferenceAction,
} from "@/app/actions/leaderboard-preference-actions";
import type { LeaderboardVisibility } from "@/lib/validation/leaderboard";

type LeaderboardPrivacyFormProps = {
  initialVisibility: LeaderboardVisibility;
  initialAlias: string | null;
  displayName: string;
};

const OPTIONS: Array<{ value: LeaderboardVisibility; title: string; description: string }> = [
  { value: "private", title: "ไม่แสดงบนกระดานผู้นำ", description: "คะแนนยังคงอยู่ในโปรไฟล์และไม่มีข้อมูลของคุณในอันดับสาธารณะ" },
  { value: "alias", title: "แสดงด้วยนามแฝง", description: "แสดงนามแฝง คะแนน เลเวล จำนวนตรา และเหรียญ โดยไม่แสดงชื่อบนใบประกาศ" },
  { value: "display_name", title: "แสดงชื่อในพาสปอร์ต", description: "แสดงชื่อที่ใช้บนใบประกาศ พร้อมคะแนน เลเวล จำนวนตรา และเหรียญ" },
];

export function LeaderboardPrivacyForm({ initialVisibility, initialAlias, displayName }: LeaderboardPrivacyFormProps) {
  const [visibility, setVisibility] = useState<LeaderboardVisibility>(initialVisibility);
  const [state, formAction, isPending] = useActionState(
    updateLeaderboardPreferenceAction,
    initialLeaderboardPreferenceActionState,
  );

  return (
    <section id="leaderboard-privacy" className="scroll-mt-24 rounded-lg border border-ink/10 bg-white p-5 sm:p-6" aria-labelledby="leaderboard-privacy-title">
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-coral/10 text-coral">
          <UsersThree size={22} weight="fill" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold text-coral">ความเป็นส่วนตัว</p>
          <h2 id="leaderboard-privacy-title" className="mt-1 text-xl font-black text-ink">การแสดงผลบนกระดานผู้นำ</h2>
          <p className="mt-2 text-sm leading-6 text-muted">ค่าเริ่มต้นเป็นส่วนตัว คุณเปลี่ยนใจหรือถอนการแสดงผลได้ทุกเมื่อ</p>
        </div>
      </div>

      <form action={formAction} className="mt-6 space-y-5">
        <fieldset className="space-y-3">
          <legend className="sr-only">เลือกรูปแบบการแสดงผล</legend>
          {OPTIONS.map((option) => (
            <label key={option.value} className={`flex cursor-pointer gap-3 rounded-md border p-4 ${visibility === option.value ? "border-coral bg-coral/[0.05]" : "border-ink/10"}`}>
              <input
                type="radio"
                name="visibility"
                value={option.value}
                checked={visibility === option.value}
                onChange={() => setVisibility(option.value)}
                className="mt-1 h-5 w-5 shrink-0 accent-coral"
              />
              <span>
                <span className="block text-sm font-black text-ink">{option.title}</span>
                <span className="mt-1 block text-xs leading-5 text-muted">{option.description}</span>
              </span>
            </label>
          ))}
        </fieldset>

        {visibility === "alias" && (
          <label className="block text-sm font-bold text-ink">
            นามแฝงสาธารณะ
            <input
              name="alias"
              defaultValue={initialAlias ?? ""}
              maxLength={40}
              placeholder="เช่น สายหมอกยะลา"
              className="mt-2 min-h-12 w-full rounded-md border border-ink/15 bg-white px-4 text-base font-normal outline-none focus:border-coral focus:ring-2 focus:ring-coral/20"
            />
            <span className="mt-2 block text-xs font-normal text-muted">เว้นว่างได้ ระบบจะสร้างนามแฝงที่ไม่เปิดเผยชื่อจริงให้โดยอัตโนมัติ</span>
          </label>
        )}

        {visibility === "display_name" && (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            ชื่อที่จะเผยแพร่: <strong>{displayName}</strong>
          </div>
        )}

        {visibility !== "private" && (
          <label className="flex cursor-pointer gap-3 rounded-md border border-ink/10 bg-background p-4 text-sm leading-6 text-ink">
            <input name="confirmedPublic" type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-coral" />
            <span>ฉันเข้าใจว่าข้อมูลตามตัวเลือกข้างต้นจะปรากฏต่อสาธารณะบนกระดานผู้นำ</span>
          </label>
        )}

        {state.status !== "idle" && (
          <div className={`flex gap-2 rounded-md p-4 text-sm font-semibold ${state.status === "success" ? "bg-teal/10 text-teal" : "bg-red-50 text-red-600"}`} role="status">
            {state.status === "success" ? <CheckCircle size={19} weight="fill" aria-hidden="true" /> : <WarningCircle size={19} weight="fill" aria-hidden="true" />}
            <span>{state.message}</span>
          </div>
        )}

        <button type="submit" disabled={isPending} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-black text-white hover:bg-ink/90 disabled:cursor-wait disabled:bg-ink/40">
          {isPending ? <Spinner size={19} className="animate-spin" aria-hidden="true" /> : <LockKey size={19} weight="fill" aria-hidden="true" />}
          บันทึกการแสดงผล
        </button>
      </form>
    </section>
  );
}
