"use client";

import { Medal, SealCheck, Star, Trophy } from "@phosphor-icons/react";
import type { LeaderboardEntry } from "@/types/tourism";

type LeaderboardPeriod = "all_time" | "monthly" | "weekly";

type LeaderboardTableProps = {
  entries: LeaderboardEntry[];
  period: LeaderboardPeriod;
  onPeriodChange: (period: LeaderboardPeriod) => void;
};

const PERIODS: Array<{ value: LeaderboardPeriod; label: string }> = [
  { value: "all_time", label: "ทั้งหมด" },
  { value: "monthly", label: "30 วันล่าสุด" },
  { value: "weekly", label: "7 วันล่าสุด" },
];

function RankMark({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy size={22} weight="fill" className="text-gold" aria-label="อันดับ 1" />;
  if (rank === 2) return <Medal size={22} weight="fill" className="text-slate-500" aria-label="อันดับ 2" />;
  if (rank === 3) return <Medal size={22} weight="fill" className="text-amber-700" aria-label="อันดับ 3" />;
  return <span className="tabular-nums text-sm font-black text-ink/65">{rank}</span>;
}

export function LeaderboardTable({ entries, period, onPeriodChange }: LeaderboardTableProps) {
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-ink/10 bg-white p-1" role="group" aria-label="เลือกช่วงเวลาของอันดับ">
        {PERIODS.map((item) => (
          <button
            key={item.value}
            type="button"
            aria-pressed={period === item.value}
            onClick={() => onPeriodChange(item.value)}
            className={`min-h-11 shrink-0 rounded-md px-4 py-2 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral ${
              period === item.value ? "bg-ink text-white" : "text-ink/65 hover:bg-background hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-lg border border-ink/10 bg-white" aria-label="รายชื่อนักเดินทางบนกระดานผู้นำ">
        <div className="hidden grid-cols-12 gap-3 border-b border-ink/10 bg-background px-5 py-3 text-xs font-bold text-muted sm:grid">
          <span className="col-span-1 text-center">อันดับ</span>
          <span className="col-span-5">นักเดินทาง</span>
          <span className="col-span-1 text-right">เลเวล</span>
          <span className="col-span-2 text-right">คะแนน XP</span>
          <span className="col-span-1 text-center" title="ตราประทับ">ตรา</span>
          <span className="col-span-2 text-center" title="เหรียญความสำเร็จ">เหรียญ</span>
        </div>

        {entries.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <Trophy size={28} className="mx-auto text-ink/25" aria-hidden="true" />
            <p className="mt-3 text-sm font-bold text-ink">ยังไม่มีอันดับในช่วงเวลานี้</p>
            <p className="mt-1 text-xs leading-5 text-muted">อันดับจะแสดงเฉพาะนักเดินทางที่เลือกเข้าร่วมแบบสาธารณะ</p>
          </div>
        ) : (
          <ol className="divide-y divide-ink/10">
            {entries.map((entry) => (
              <li
                key={`${entry.rank}-${entry.publicName}`}
                aria-current={entry.isCurrentTourist ? "true" : undefined}
                className={`grid grid-cols-12 items-center gap-3 px-4 py-4 sm:px-5 ${
                  entry.isCurrentTourist ? "bg-coral/[0.07]" : "bg-white"
                }`}
              >
                <span className="col-span-1 flex justify-center"><RankMark rank={entry.rank} /></span>
                <div className="col-span-7 min-w-0 sm:col-span-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate font-black text-ink">{entry.publicName}</span>
                    {entry.isCurrentTourist && <span className="rounded-md bg-coral px-2 py-1 text-xs font-bold text-white">คุณ</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted sm:hidden">
                    <span>เลเวล {entry.level}</span>
                    <span className="inline-flex items-center gap-1"><SealCheck size={13} aria-hidden="true" /> {entry.stampCount} ตรา</span>
                    <span className="inline-flex items-center gap-1"><Star size={13} aria-hidden="true" /> {entry.badgeCount} เหรียญ</span>
                  </div>
                </div>
                <span className="col-span-1 hidden text-right text-sm font-bold tabular-nums text-ink sm:block">{entry.level}</span>
                <span className="col-span-4 text-right text-base font-black tabular-nums text-coral sm:col-span-2">
                  {entry.totalXp.toLocaleString("th-TH")}<span className="ml-1 text-xs text-muted sm:hidden">XP</span>
                </span>
                <span className="col-span-1 hidden text-center text-sm font-bold tabular-nums text-ink/65 sm:block">{entry.stampCount}</span>
                <span className="col-span-2 hidden text-center text-sm font-bold tabular-nums text-ink/65 sm:block">{entry.badgeCount}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="mt-3 text-xs leading-5 text-muted">แสดงสูงสุด 100 อันดับ โดยใช้คะแนนจากกิจกรรมที่บันทึกในระบบ</p>
    </div>
  );
}
