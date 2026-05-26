import Link from "next/link";
import { Compass, FacebookLogo, TwitterLogo, InstagramLogo, YoutubeLogo } from "@phosphor-icons/react/dist/ssr";
import { SettingsService } from "@/lib/services/settings.service";

export async function SiteFooter() {
  const settingsService = new SettingsService();
  const [footerInfo, socialMedia] = await Promise.all([
    settingsService.getSetting("footer_info", { copyright: "Copyright © 2026 Southern Border Tourism Platform. สงวนลิขสิทธิ์", description: "แพลตฟอร์มท่องเที่ยวชายแดนใต้ ส่งเสริมการท่องเที่ยวและเศรษฐกิจชุมชนในพื้นที่ยะลา ปัตตานี และนราธิวาส" }),
    settingsService.getSetting("social_media", { facebook: "https://facebook.com", instagram: "https://instagram.com", line: "https://line.me" })
  ]);
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-28 pt-16 sm:px-6 lg:px-8 lg:pb-12 border-t border-ink/10 mt-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_2fr]">
        {/* Left: Brand */}
        <div>
          <div className="flex items-center gap-3">
            <Compass weight="fill" size={32} className="text-coral" />
            <h3 className="text-xl font-bold tracking-tight text-ink uppercase">ท่องเที่ยวชายแดนใต้</h3>
          </div>
          <p className="mt-6 text-sm text-muted max-w-sm">
            {footerInfo.description}
          </p>
          <div className="mt-6 flex gap-4 text-ink">
            {socialMedia.facebook && (
              <a href={socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors bg-white p-2 rounded-full shadow-sm border border-ink/5">
                <FacebookLogo size={20} weight="fill" />
              </a>
            )}
            {socialMedia.instagram && (
              <a href={socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors bg-white p-2 rounded-full shadow-sm border border-ink/5">
                <InstagramLogo size={20} weight="fill" />
              </a>
            )}
            {socialMedia.line && (
              <a href={socialMedia.line} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors bg-white p-2 rounded-full shadow-sm border border-ink/5 font-bold text-xs flex items-center justify-center w-[38px] h-[38px]">
                LINE
              </a>
            )}
          </div>
        </div>

        {/* Right: Links */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-sm text-ink font-medium">
          <div>
            <h4 className="font-bold mb-4">เกี่ยวกับเรา</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-coral">พันธกิจของเรา</Link></li>
              <li><Link href="#" className="hover:text-coral">ติดต่อเรา</Link></li>
              <li><Link href="#" className="hover:text-coral">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link href="#" className="hover:text-coral">ข้อตกลงการใช้งาน</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">ความสนใจ</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-coral">ธรรมชาติ</Link></li>
              <li><Link href="#" className="hover:text-coral">วัฒนธรรม</Link></li>
              <li><Link href="#" className="hover:text-coral">อาหารการกิน</Link></li>
              <li><Link href="#" className="hover:text-coral">จุดถ่ายภาพ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">จุดหมายปลายทาง</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-coral">ยะลา</Link></li>
              <li><Link href="#" className="hover:text-coral">ปัตตานี</Link></li>
              <li><Link href="#" className="hover:text-coral">นราธิวาส</Link></li>
              <li><Link href="#" className="hover:text-coral">เบตง</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">แพลตฟอร์ม</h4>
            <ul className="space-y-3">
              <li><Link href="/checkin/demo-code" className="hover:text-coral">ใบประกาศดิจิทัล</Link></li>
              <li><Link href="/admin" className="hover:text-coral">แดชบอร์ด</Link></li>
              <li><Link href="/admin/login" className="hover:text-coral">เข้าสู่ระบบแอดมิน</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-16 pt-8 border-t border-ink/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted">
        <p>{footerInfo.copyright}</p>
        <div className="flex gap-4">
          <Link href="#" className="hover:text-ink">ข้อกำหนด</Link>
          <Link href="#" className="hover:text-ink">ความเป็นส่วนตัว</Link>
          <Link href="#" className="hover:text-ink">คุกกี้</Link>
        </div>
      </div>
    </footer>
  );
}
