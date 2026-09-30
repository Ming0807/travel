"use client";

import Link from "next/link";
import { Medal, SealCheck, Star, Trophy } from "@phosphor-icons/react";
import type { LeaderboardEntry } from "@/types/tourism";
import { getDisplayInitials } from "@/lib/account/presentation";
import "./leaderboard.css";

type LeaderboardPeriod = "all_time" | "monthly" | "weekly";
const PERIODS: { value: LeaderboardPeriod; label: string }[] = [
  { value: "all_time", label: "ทั้งหมด" }, { value: "monthly", label: "30 วันล่าสุด" }, { value: "weekly", label: "7 วันล่าสุด" },
];

export function LeaderboardTable({ entries, period, onPeriodChange }: {
  entries: LeaderboardEntry[]; period: LeaderboardPeriod; onPeriodChange: (period: LeaderboardPeriod) => void;
}) {
  const periodLabel = PERIODS.find((item) => item.value === period)?.label ?? "ทั้งหมด";
  return <div className="leaderboard-results">
    <div className="leaderboard-toolbar"><div className="leaderboard-periods" role="group" aria-label="เลือกช่วงเวลาของอันดับ">{PERIODS.map((item) => <button key={item.value} type="button" aria-pressed={period === item.value} onClick={() => onPeriodChange(item.value)}>{item.label}</button>)}</div><span className="leaderboard-count" role="status">{periodLabel} · {entries.length} รายชื่อ</span></div>
    <section className="leaderboard-ranking" aria-label="รายชื่อนักเดินทางบนกระดานผู้นำ">
      <div className="leaderboard-columns" aria-hidden="true"><span>อันดับ</span><span>นักเดินทาง</span><span>เลเวล</span><span>คะแนน XP</span><span>ตรา</span><span>เหรียญ</span></div>
      {entries.length === 0 ? <div className="leaderboard-empty"><Trophy size={32} weight="light" aria-hidden="true" /><h2>ยังไม่มีอันดับในช่วงเวลานี้</h2><p>อันดับจะแสดงเฉพาะนักเดินทางที่เลือกเข้าร่วมแบบสาธารณะ<br />ลองดูช่วงเวลาอื่น หรือเริ่มต้นการเดินทางของคุณ</p><Link href="/attractions" className="leaderboard-action">ค้นหาสถานที่เพื่อเริ่มสะสมคะแนน</Link></div> : <ol className="leaderboard-entries" aria-label="อันดับนักเดินทาง">{entries.map((entry) => <li key={`${entry.rank}-${entry.publicName}`} className="leaderboard-row" data-rank={entry.rank <= 3 ? entry.rank : undefined} aria-current={entry.isCurrentTourist ? "true" : undefined}>
        <span className="leaderboard-rank"><span aria-hidden="true">{entry.rank === 1 ? <Trophy size={16} weight="fill" /> : entry.rank <= 3 ? <Medal size={16} weight="fill" /> : null}</span><span className="sr-only">อันดับ </span>{entry.rank}</span>
        <div className="leaderboard-person"><span className="leaderboard-avatar" aria-hidden="true">{getDisplayInitials(entry.publicName)}</span><div><div className="leaderboard-name"><span>{entry.publicName}</span>{entry.isCurrentTourist ? <small>คุณ</small> : null}</div><div className="leaderboard-mobile-details"><span>เลเวล {entry.level}</span><span><SealCheck size={13} aria-hidden="true" />{entry.stampCount} ตรา</span><span><Star size={13} aria-hidden="true" />{entry.badgeCount} เหรียญ</span></div></div></div>
        <span className="leaderboard-level"><span className="sr-only">เลเวล </span>{entry.level}</span><span className="leaderboard-xp">{entry.totalXp.toLocaleString("th-TH")}<small> XP</small></span><span className="leaderboard-stamps">{entry.stampCount}<span className="sr-only"> ตรา</span></span><span className="leaderboard-badges">{entry.badgeCount}<span className="sr-only"> เหรียญ</span></span>
      </li>)}</ol>}
    </section><p className="leaderboard-footnote">แสดงสูงสุด 100 อันดับ โดยใช้คะแนนจากกิจกรรมที่บันทึกในระบบ</p>
  </div>;
}
