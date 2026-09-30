import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, BookBookmark, MapTrifold, Trophy } from "@phosphor-icons/react/dist/ssr";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";
import "./passport.css";

export function PassportPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="passport-page">
      <PublicPageFrame variant="detail">
        <header className="passport-header">
          <div>
            <p className="passport-eyebrow"><BookBookmark size={18} aria-hidden="true" /> Digital Passport</p>
            <h1>พาสปอร์ตการเดินทางของฉัน</h1>
            <p className="passport-intro">เก็บความทรงจำผ่านตราประทับ แล้วออกไปพบจุดหมายถัดไปในยะลา</p>
          </div>
          <nav className="passport-nav" aria-label="เดินทางต่อจากพาสปอร์ต">
            <Link href="/routes"><MapTrifold size={18} aria-hidden="true" /> วางแผนเที่ยว <ArrowUpRight size={16} aria-hidden="true" /></Link>
            <Link href="/leaderboard"><Trophy size={18} aria-hidden="true" /> กระดานอันดับ <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </nav>
        </header>
        {children}
      </PublicPageFrame>
    </main>
  );
}

export function PassportLoading() {
  return (
    <div className="passport-loading" role="status" aria-label="กำลังโหลดพาสปอร์ต">
      <span className="sr-only">กำลังโหลดตราประทับและการเดินทางของคุณ</span>
      <div aria-hidden="true">
        <div className="passport-loading-cover"><span /><span /><span /></div>
        <div className="passport-loading-grid">{Array.from({ length: 4 }, (_, index) => <div key={index}><span /><span /></div>)}</div>
      </div>
    </div>
  );
}
