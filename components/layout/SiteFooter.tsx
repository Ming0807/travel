import Link from "next/link";
import { Compass, FacebookLogo, InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";
import { SettingsService } from "@/lib/services/settings.service";

export async function SiteFooter() {
  const settingsService = new SettingsService();
  const [footerInfo, socialMedia] = await Promise.all([
    settingsService.getSetting("footer_info", {
      copyright: "Copyright © 2026 Southern Border Tourism Platform. สงวนลิขสิทธิ์",
      description: "แพลตฟอร์มข้อมูลและประสบการณ์ท่องเที่ยวยะลา เชื่อมการเดินทางเข้ากับข้อมูลเพื่อช่วยพัฒนาพื้นที่อย่างรับผิดชอบ",
    }),
    settingsService.getSetting("social_media", { facebook: "", instagram: "", line: "" }),
  ]);

  return (
    <footer className="border-t border-ink/10 bg-white px-4 pb-28 pt-12 sm:px-6 lg:px-8 lg:pb-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[minmax(260px,1fr)_minmax(0,1.7fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[6px] bg-ink text-white"><Compass aria-hidden="true" weight="fill" size={20} /></span>
              <div>
                <p className="text-base font-black text-ink">ท่องเที่ยวยะลา</p>
                <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">Digital Passport</p>
              </div>
            </div>
            <p className="mt-5 max-w-md text-sm leading-6 text-muted">{footerInfo.description}</p>
            <div className="mt-5 flex gap-2">
              {socialMedia.facebook ? <a href={socialMedia.facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-[6px] border border-ink/10 text-ink hover:text-coral"><FacebookLogo aria-hidden="true" size={20} weight="fill" /></a> : null}
              {socialMedia.instagram ? <a href={socialMedia.instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-[6px] border border-ink/10 text-ink hover:text-coral"><InstagramLogo aria-hidden="true" size={20} weight="fill" /></a> : null}
              {socialMedia.line ? <a href={socialMedia.line} aria-label="LINE" target="_blank" rel="noopener noreferrer" className="grid h-11 min-w-11 place-items-center rounded-[6px] border border-ink/10 px-2 text-xs font-black text-ink hover:text-coral">LINE</a> : null}
            </div>
          </div>

          <nav aria-label="ลิงก์ท้ายเว็บไซต์" className="grid grid-cols-2 gap-x-6 gap-y-8 text-sm sm:grid-cols-3">
            <div>
              <h2 className="font-black text-ink">ออกเดินทาง</h2>
              <ul className="mt-4 space-y-3 text-muted">
                <li><Link href="/attractions" className="hover:text-coral">สถานที่ท่องเที่ยว</Link></li>
                <li><Link href="/routes" className="hover:text-coral">เส้นทางแนะนำ</Link></li>
                <li><Link href="/restaurants" className="hover:text-coral">ร้านอาหาร</Link></li>
                <li><Link href="/accommodations" className="hover:text-coral">ที่พัก</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="font-black text-ink">ประสบการณ์</h2>
              <ul className="mt-4 space-y-3 text-muted">
                <li><PublicCheckinEntryLink className="hover:text-coral">เช็กอินรับใบประกาศ</PublicCheckinEntryLink></li>
                <li><Link href="/passport" className="hover:text-coral">Digital Passport</Link></li>
                <li><Link href="/leaderboard" className="hover:text-coral">กระดานผู้นำ</Link></li>
                <li><Link href="/stories" className="hover:text-coral">เรื่องราว</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="font-black text-ink">ข้อมูลสำคัญ</h2>
              <ul className="mt-4 space-y-3 text-muted">
                <li><Link href="/about" className="hover:text-coral">เกี่ยวกับโครงการ</Link></li>
                <li><Link href="/contact" className="hover:text-coral">ติดต่อเรา</Link></li>
                <li><Link href="/privacy" className="hover:text-coral">ความเป็นส่วนตัว</Link></li>
                <li><Link href="/terms" className="hover:text-coral">ข้อกำหนดการใช้งาน</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-ink/10 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{footerInfo.copyright}</p>
          <p>ขอบเขตนำร่อง: จังหวัดยะลา</p>
        </div>
      </div>
    </footer>
  );
}
