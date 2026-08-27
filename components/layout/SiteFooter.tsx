import Link from "next/link";
import { Compass, EnvelopeSimple, FacebookLogo, InstagramLogo, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { PublicCheckinEntryLink } from "@/components/checkin/PublicCheckinEntryLink";
import { SettingsService } from "@/lib/services/settings.service";

export async function SiteFooter() {
  const settingsService = new SettingsService();
  const [footerInfo, socialMedia, contact] = await Promise.all([
    settingsService.getSetting("footer_info", {
      copyright: "© 2026 ท่องเที่ยวยะลา Digital Passport. All rights reserved.",
      description: "ร่วมเป็นส่วนหนึ่งในการอนุรักษ์และส่งเสริมการท่องเที่ยวเชิงวัฒนธรรมยะลาอย่างยั่งยืน",
    }),
    settingsService.getSetting("social_media", { facebook: "", instagram: "", line: "" }),
    settingsService.getSetting("general_info", { phone: "", email: "", address: "" }),
  ]);

  return (
    <footer className="border-t border-ink/10 bg-[#FAF7F2] px-4 pb-20 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-8 lg:pb-12 lg:pt-14">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr] lg:gap-10">
          {/* Brand & Social Column */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-coral text-white shadow-xs">
                <Compass aria-hidden="true" weight="fill" size={24} />
              </span>
              <div>
                <p className="text-base font-black tracking-tight text-ink">ท่องเที่ยวยะลา</p>
                <p className="text-[10px] font-semibold tracking-wider text-muted">สแกน · เช็กอิน · รับใบประกาศ</p>
              </div>
            </div>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted sm:text-sm">{footerInfo.description}</p>
            {socialMedia.facebook || socialMedia.instagram || socialMedia.line ? (
              <div className="mt-5 flex items-center gap-2">
              {socialMedia.facebook ? <a
                href={socialMedia.facebook}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xs transition-transform hover:scale-110"
              >
                <FacebookLogo aria-hidden="true" size={16} weight="fill" />
              </a> : null}
              {socialMedia.instagram ? <a
                href={socialMedia.instagram}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xs transition-transform hover:scale-110"
              >
                <InstagramLogo aria-hidden="true" size={16} weight="fill" />
              </a> : null}
              {socialMedia.line ? <a
                href={socialMedia.line}
                aria-label="LINE"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 min-w-8 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 px-2 text-[10px] font-black text-white shadow-2xs transition-transform hover:scale-110"
              >
                LINE
              </a> : null}
              </div>
            ) : null}
          </div>

          {/* Menu Column */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-ink">เมนู</h2>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold text-muted sm:text-sm">
              <li><Link href="/" className="transition-colors hover:text-coral">หน้าหลัก</Link></li>
              <li><Link href="/attractions" className="transition-colors hover:text-coral">สถานที่ท่องเที่ยว</Link></li>
              <li><Link href="/#how-it-works" className="transition-colors hover:text-coral">วิธีการใช้งาน</Link></li>
              <li><Link href="/routes" className="transition-colors hover:text-coral">เส้นทางแนะนำ</Link></li>
              <li><Link href="/stories" className="transition-colors hover:text-coral">เรื่องราวและวิถีชีวิต</Link></li>
            </ul>
          </div>

          {/* Help & Terms Column */}
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-ink">ช่วยเหลือ</h2>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold text-muted sm:text-sm">
              <li><PublicCheckinEntryLink className="transition-colors hover:text-coral">สแกน QR เช็กอิน</PublicCheckinEntryLink></li>
              <li><Link href="/passport" className="transition-colors hover:text-coral">Digital Passport</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-coral">เกี่ยวกับโครงการ</Link></li>
              <li><Link href="/privacy" className="transition-colors hover:text-coral">นโยบายความเป็นส่วนตัว</Link></li>
              <li><Link href="/terms" className="transition-colors hover:text-coral">ข้อกำหนดการใช้งาน</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="col-span-2 border-t border-ink/10 pt-6 lg:col-span-1 lg:border-t-0 lg:pt-0">
            <h2 className="text-sm font-black uppercase tracking-wider text-ink">ติดต่อเรา</h2>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold text-muted sm:text-sm">
              {contact.phone ? <li className="flex items-center gap-2">
                <Phone size={16} weight="bold" className="shrink-0 text-coral" />
                <span>{contact.phone}</span>
              </li> : null}
              {contact.email ? <li className="flex items-center gap-2">
                <EnvelopeSimple size={16} weight="bold" className="shrink-0 text-coral" />
                <span className="truncate">{contact.email}</span>
              </li> : null}
              {contact.address ? <li className="flex items-start gap-2">
                <MapPin size={16} weight="fill" className="shrink-0 text-coral mt-0.5" />
                <span>{contact.address}</span>
              </li> : null}
              {!contact.phone && !contact.email && !contact.address ? (
                <li><Link href="/contact" className="font-bold text-coral hover:text-ink">ดูช่องทางติดต่อ</Link></li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 border-t border-ink/10 pt-4 text-center text-[11px] font-medium text-muted sm:mt-10 sm:flex-row sm:justify-between sm:pt-5 sm:text-left lg:mt-12 lg:pt-6">
          {footerInfo.copyright ? <p className="max-w-2xl leading-5">{footerInfo.copyright}</p> : null}
          <p className="inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap leading-4">
            <span className="h-1.5 w-1.5 rounded-full bg-coral" aria-hidden="true" />
            <span>ขอบเขตนำร่อง:</span>
            <span className="font-black text-ink">จังหวัดยะลา</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
