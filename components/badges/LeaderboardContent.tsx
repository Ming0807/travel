"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, LockKey, TrendUp, WarningCircle } from "@phosphor-icons/react";
import { LeaderboardTable } from "./LeaderboardTable";
import type { LeaderboardEntry } from "@/types/tourism";

type LeaderboardPeriod = "all_time" | "monthly" | "weekly";
type LeaderboardVisibility = "private" | "alias" | "display_name";

type LeaderboardContentProps = {
  allTime: LeaderboardEntry[];
  monthly: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  currentVisibility?: LeaderboardVisibility;
  availability?: "ready" | "privacy_migration" | "service";
};

export function LeaderboardContent({ allTime, monthly, weekly, currentVisibility, availability = "ready" }: LeaderboardContentProps) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("all_time");
  const entries = period === "all_time" ? allTime : period === "monthly" ? monthly : weekly;
  const currentEntry = entries.find((entry) => entry.isCurrentTourist);

  if (availability !== "ready") {
    return (
      <section role="alert" className="border border-amber-300 bg-amber-50 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <WarningCircle aria-hidden="true" size={24} weight="fill" className="mt-0.5 shrink-0 text-amber-700" />
          <div>
            <h2 className="text-lg font-black text-ink">ระบบอันดับสาธารณะยังไม่พร้อม</h2>
            <p className="mt-2 text-sm leading-6 text-amber-950/80">
              {availability === "privacy_migration"
                ? "ระบบกำลังรอการตั้งค่าความเป็นส่วนตัวของฐานข้อมูล จึงปิดการแสดงรายชื่อไว้ก่อนเพื่อป้องกันข้อมูลส่วนบุคคล"
                : "ยังเชื่อมต่อข้อมูลคะแนนไม่ได้ในขณะนี้ คะแนนและความคืบหน้าของคุณไม่ได้สูญหาย"}
            </p>
            <Link href="/leaderboard" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md border border-amber-700 px-4 py-2 text-sm font-bold text-amber-950 hover:bg-amber-100">
              ลองโหลดอีกครั้ง <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>
      </section>
    );
  }

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
