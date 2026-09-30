import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, LockKey, Trophy } from "@phosphor-icons/react/dist/ssr";
import "./leaderboard.css";

export function LeaderboardPageShell({ children }: { children: ReactNode }) {
  return <main className="leaderboard-page"><div className="leaderboard-container">
    <nav className="leaderboard-breadcrumb" aria-label="เส้นทางหน้าเว็บ"><Link href="/"><ArrowLeft size={16} aria-hidden="true" />หน้าหลัก</Link><span aria-hidden="true">/</span><span>กระดานอันดับ</span></nav>
    <header className="leaderboard-header">
      <div><p className="leaderboard-kicker">DIGITAL PASSPORT · YALA</p><h1>กระดานอันดับนักเดินทาง</h1><p className="leaderboard-intro">พบกับนักเดินทางที่ร่วมสำรวจยะลา และสะสมคะแนน XP จากกิจกรรมที่บันทึกสำเร็จในระบบ</p><Link href="/passport" className="leaderboard-passport">เปิดพาสปอร์ตของฉัน <ArrowRight size={18} aria-hidden="true" /></Link></div>
      <aside className="leaderboard-note"><Trophy size={30} weight="light" aria-hidden="true" /><div><h2>ทุกการเข้าร่วมเป็นทางเลือกของคุณ</h2><p>ดูอันดับได้โดยไม่ต้องเข้าร่วม เลือกใช้นามแฝงหรือถอนการแสดงผลได้จากโปรไฟล์</p></div></aside>
    </header>
    <div className="leaderboard-privacy"><LockKey size={19} aria-hidden="true" /><p>รายชื่อนี้แสดงเฉพาะผู้ที่เลือกเข้าร่วมแบบสาธารณะ คะแนนไม่มีผลต่อสิทธิ์การใช้งานระบบ</p><Link href="/profile#leaderboard-privacy">ตั้งค่าความเป็นส่วนตัว <ArrowRight size={15} aria-hidden="true" /></Link></div>
    <div className="leaderboard-board">{children}</div>
  </div></main>;
}

export function LeaderboardLoading() {
  return <div className="leaderboard-loading" role="status" aria-label="กำลังโหลดกระดานอันดับ"><div className="leaderboard-skeleton-tabs" aria-hidden="true" />{Array.from({ length: 5 }, (_, index) => <div className="leaderboard-skeleton-row" key={index} aria-hidden="true"><span /><span /><span /></div>)}<span className="sr-only">กำลังโหลดคะแนนและอันดับนักเดินทาง</span></div>;
}
