import { BookBookmark, Compass, DeviceMobile, LinkSimple } from "@phosphor-icons/react/dist/ssr";
import type { PassportViewModel } from "@/lib/services/passport.service";

function completionPercent(earned: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((earned / total) * 100)));
}

export function PassportSummary({ passport }: { passport: PassportViewModel }) {
  const activeEarned = passport.provinceProgress.reduce((total, province) => total + province.earnedCount, 0);
  const percent = completionPercent(activeEarned, passport.totalStampTargets);
  return (
    <section className="passport-cover" aria-label="ข้อมูลเจ้าของพาสปอร์ต">
      <div className="passport-cover-title">
        <p><Compass size={22} weight="fill" aria-hidden="true" /> พาสปอร์ตท่องเที่ยวดิจิทัล <span>ชายแดนใต้</span></p>
        <span className="passport-identity">{passport.isGuest ? <DeviceMobile size={16} aria-hidden="true" /> : <LinkSimple size={16} aria-hidden="true" />}{passport.isGuest ? "บันทึกบนอุปกรณ์นี้" : "เชื่อมบัญชีแล้ว"}</span>
      </div>
      <div className="passport-cover-body">
        <div className="passport-owner">
          <p>เจ้าของพาสปอร์ต</p>
          <h2>{passport.displayName || "นักเดินทาง"}</h2>
          <p>{passport.isGuest ? "ตราประทับจดจำบนเบราว์เซอร์นี้ คุณเลือกเชื่อมบัญชีภายหลังเพื่อใช้งานข้ามอุปกรณ์ได้" : "เรียกคืนตราประทับและการเดินทางได้เมื่อเข้าสู่ระบบด้วยบัญชีที่เชื่อมไว้"}</p>
        </div>
        <div className="passport-progress">
          <p><BookBookmark size={18} aria-hidden="true" /> ตราที่สะสมแล้ว</p>
          <p className="passport-total">{passport.totalStampsEarned.toLocaleString("th-TH")}<span> ตรา</span></p>
          {passport.totalStampTargets > 0 ? <>
            <p className="passport-progress-caption">เป้าหมายที่เปิดใช้งาน {activeEarned.toLocaleString("th-TH")} / {passport.totalStampTargets.toLocaleString("th-TH")} ตรา</p>
            <div className="passport-progress-track" role="progressbar" aria-label="ความคืบหน้าการสะสมตราที่เปิดใช้งาน" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div style={{ width: `${percent}%` }} /></div>
            <p className="passport-progress-caption">{percent}% ของเป้าหมาย</p>
          </> : <p className="passport-progress-caption">ยังไม่มีเป้าหมายการสะสมที่เปิดใช้งาน</p>}
        </div>
      </div>
    </section>
  );
}
