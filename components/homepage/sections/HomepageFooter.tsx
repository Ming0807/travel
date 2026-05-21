import Link from "next/link";
import { Compass } from "@phosphor-icons/react/dist/ssr";

export function HomepageFooter() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-28 pt-8 sm:px-6 lg:px-6 lg:pb-10">
      <div className="overflow-hidden rounded-[2.4rem] bg-ink text-white shadow-soft">
        <div className="grid gap-8 p-7 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr] lg:p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10">
                <Compass weight="fill" size={24} className="text-gold" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#FFD7B5]">
                  Southern Border
                </p>
                <h3 className="text-xl font-extrabold">Explorer</h3>
              </div>
            </div>
            <p className="body-text mt-5 max-w-md text-sm leading-7 text-white/70">
              แพลตฟอร์มข้อมูลนักท่องเที่ยวชายแดนใต้สำหรับการเก็บข้อมูลแบบ reward-first
              และการวิเคราะห์เพื่อพัฒนาการท่องเที่ยวอย่างยั่งยืน
            </p>
          </div>

          <div>
            <h4 className="font-extrabold">Explore</h4>
            <ul className="body-text mt-4 space-y-3 text-sm text-white/70">
              <li>
                <Link className="hover:text-white" href="#attractions">
                  สถานที่ท่องเที่ยว
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="#how-it-works">
                  วิธีใช้งาน
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="#stories">
                  เรื่องเล่า
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold">Platform</h4>
            <ul className="body-text mt-4 space-y-3 text-sm text-white/70">
              <li>
                <Link className="hover:text-white" href="#passport">
                  Digital Passport
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="#dashboard">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link className="hover:text-white" href="#privacy">
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold">Contact</h4>
            <ul className="body-text mt-4 space-y-3 text-sm text-white/70">
              <li>contact@southernborder.tourism</li>
              <li>Yala · Pattani · Narathiwat</li>
              <li>
                <Link className="hover:text-white" href="/admin">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 px-7 py-5 lg:px-10">
          <div className="flex flex-col justify-between gap-3 text-xs text-white/55 sm:flex-row">
            <p>© 2026 Southern Border Tourism Data & Intelligence Platform.</p>
            <p>Privacy-first · QR Check-in · Digital Passport</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
