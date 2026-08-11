"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKey, TrendUp } from "@phosphor-icons/react";
import { LeaderboardTable } from "./LeaderboardTable";
import type { LeaderboardEntry } from "@/types/tourism";

type LeaderboardPeriod = "all_time" | "monthly" | "weekly";
type LeaderboardVisibility = "private" | "alias" | "display_name";

type LeaderboardContentProps = {
  allTime: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  currentVisibility?: LeaderboardVisibility;
};

export function LeaderboardContent({ allTime, monthly, weekly, currentVisibility }: LeaderboardContentProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all_time");
  const entries = period === "all_time" ? allTime : period === "monthly" ? monthly : weekly;
  const currentEntry = entries.find((entry) => entry.isCurrentTourist);

  return (
    <div>
      <LeaderboardTable entries={entries} period={period} onPeriodChange={setPeriod} />

      {currentVisibility && (
        <section className="mt-5 rounded-lg border border-ink/10 bg-white p-5" aria-labelledby="my-leaderboard-status">
          <div className="flex items-start gap-4">
            <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-md ${currentVisibility === "private" ? "bg-ink/[0.06] text-ink/55" : "bg-coral/10 text-coral"}`}>
              {currentVisibility === "private" ? <LockKey size={22} weight="fill" aria-hidden="true" /> : <TrendUp size={22} weight="bold" aria-hidden="true" />}
            </span>
            <div className="min-w-0 flex-1">
              <p id="my-leaderboard-status" className="text-xs font-bold text-muted">สถานะอันดับของฉัน</p>
              {currentVisibility === "private" ? (
                <>
                  <p className="mt-1 text-lg font-black text-ink">คุณยังไม่ได้เข้าร่วมอันดับสาธารณะ</p>
                  <p className="mt-1 text-sm leading-6 text-muted">คะแนนยังถูกเก็บในโปรไฟล์ตามปกติ และจะไม่แสดงชื่อหรือนามแฝงต่อผู้อื่น</p>
                  <Link href="/profile#leaderboard-privacy" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/15 px-4 py-2 text-sm font-bold text-ink hover:border-coral hover:text-coral">
                    ตั้งค่าการแสดงผล <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </>
              ) : (
                <>
                  <p className="mt-1 text-2xl font-black text-ink">{currentEntry ? `อันดับ ${currentEntry.rank}` : "ยังไม่ติด Top 100"}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">ทำกิจกรรมท่องเที่ยวที่ร่วมรายการเพื่อสะสม XP และขยับอันดับของคุณ</p>
                </>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
