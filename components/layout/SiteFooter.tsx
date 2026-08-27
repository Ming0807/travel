import Link from "next/link";
import { Compass, EnvelopeSimple, FacebookLogo, InstagramLogo, MapPin, Phone, YoutubeLogo } from "@phosphor-icons/react/dist/ssr";
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
    settingsService.getSetting("contact_info", { phone: "073-222-111", email: "contact@yala-tourism.go.th", address: "จังหวัดยะลา 95000" }),
  ]);

  return (
    <footer className="border-t border-ink/10 bg-[#FAF7F2] px-4 pb-28 pt-14 sm:px-6 lg:px-8 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          {/* Brand & Social Column */}
          <div>
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
            <div className="mt-5 flex items-center gap-2">
              <a
                href={socialMedia.facebook || "https://facebook.com"}
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xs transition-transform hover:scale-110"
              >
                <FacebookLogo aria-hidden="true" size={16} weight="fill" />
              </a>
              <a
                href={socialMedia.instagram || "https://instagram.com"}
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xs transition-transform hover:scale-110"
              >
                <InstagramLogo aria-hidden="true" size={16} weight="fill" />
              </a>
              <a
                href="https://youtube.com"
                aria-label="YouTube"
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-2xs transition-transform hover:scale-110"
              >
                <YoutubeLogo aria-hidden="true" size={16} weight="fill" />
              </a>
            </div>
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
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-ink">ติดต่อเรา</h2>
            <ul className="mt-4 space-y-2.5 text-xs font-semibold text-muted sm:text-sm">
              <li className="flex items-center gap-2">
                <Phone size={16} weight="bold" className="shrink-0 text-coral" />
                <span>{contact.phone || "073-222-111"}</span>
              </li>
              <li className="flex items-center gap-2">
                <EnvelopeSimple size={16} weight="bold" className="shrink-0 text-coral" />
                <span className="truncate">{contact.email || "contact@yala-tourism.go.th"}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin size={16} weight="fill" className="shrink-0 text-coral mt-0.5" />
                <span>{contact.address || "อำเภอเมืองยะลา จังหวัดยะลา 95000"}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-ink/10 pt-6 text-center text-xs font-medium text-muted">
          <p>{footerInfo.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
