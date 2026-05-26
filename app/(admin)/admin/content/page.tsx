import Link from "next/link";
import {
  Article,
  ArrowRight,
  CheckCircle,
  Gear,
  ImageIcon,
  List,
  MapPin,
  MapPinLine,
  QrCode,
  Star,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Content Hub | Admin",
};

const workflowCards = [
  {
    title: "เปลี่ยนสถานที่ยอดนิยมหน้าแรก",
    description: "เลือกสถานที่จาก records จริง จัดลำดับ และตรวจ cover image ก่อนแสดงบน homepage",
    source: "Homepage section -> Attraction record -> Cover media",
    href: "/admin/settings?tab=homepage",
    action: "จัดการ Homepage",
    icon: Star,
    tone: "teal",
  },
  {
    title: "แก้หน้าแสดงรายละเอียดสถานที่",
    description: "เริ่มจาก attraction record แล้วจัดการข้อความ รูปภาพ จุดถ่ายภาพ และ QR ที่เกี่ยวข้อง",
    source: "Attraction -> Media -> Photo spots -> Check-in codes",
    href: "/admin/attractions",
    action: "เปิด Attractions",
    icon: MapPin,
    tone: "emerald",
  },
  {
    title: "เขียนเรื่องราว / บทความ",
    description: "เนื้อหา story แยกจาก attraction แต่เชื่อมด้วยจังหวัด หมวดหมู่ และ public preview",
    source: "Travel story -> Province -> Story image",
    href: "/admin/stories",
    action: "เปิด Stories",
    icon: Article,
    tone: "orange",
  },
  {
    title: "สร้างเส้นทางท่องเที่ยว",
    description: "เลือก route stops จากสถานที่ที่มีอยู่ ไม่สร้างข้อมูลสถานที่ซ้ำใน route",
    source: "Suggested route -> Ordered attraction stops",
    href: "/admin/routes",
    action: "เปิด Routes",
    icon: MapPinLine,
    tone: "blue",
  },
  {
    title: "จัดการภาพและไฟล์สื่อ",
    description: "Media Library เป็นคลัง asset และตัวเลือกภาพ ส่วนการเปลี่ยนภาพควรเริ่มจาก content ที่แก้",
    source: "Media assets -> Linked public surfaces",
    href: "/admin/media",
    action: "เปิด Media",
    icon: ImageIcon,
    tone: "purple",
  },
  {
    title: "สร้าง QR / จุดถ่ายภาพ",
    description: "เชื่อม attraction, photo spot และ check-in code เพื่อให้ QR เปิดหน้า /c/[code] ถูกจุด",
    source: "Photo spot -> Check-in code -> QR landing",
    href: "/admin/checkin-codes",
    action: "เปิด QR",
    icon: QrCode,
    tone: "rose",
  },
];

const sourceMap = [
  "Homepage card ใช้ชื่อ/จังหวัด/ภาพ cover จาก attraction record",
  "Story page ใช้ title, excerpt, content และ image จาก travel_stories",
  "Route stop ใช้ attraction record ที่ถูกเลือก ไม่คัดลอกชื่อสถานที่ใหม่",
  "Settings ใช้สำหรับ hero/copy/SEO/global images ไม่ใช้แทน CMS ของสถานที่",
  "Media Library เป็น asset manager และ picker ไม่ใช่จุดเดียวที่ต้องเข้าไปเปลี่ยนภาพ",
];

const toneClasses: Record<string, string> = {
  teal: "bg-teal-50 text-teal-700 border-teal-100",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-100",
  orange: "bg-orange-50 text-orange-700 border-orange-100",
  blue: "bg-blue-50 text-blue-700 border-blue-100",
  purple: "bg-purple-50 text-purple-700 border-purple-100",
  rose: "bg-rose-50 text-rose-700 border-rose-100",
};

export default async function ContentHubPage() {
  const guard = await requireAdmin();
  const admin = { displayName: guard.displayName, email: guard.email };

  return (
    <AdminShell admin={admin}>
      <div className="space-y-8">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#F3704C]">CMS Command Center</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">ศูนย์จัดการเนื้อหาสาธารณะ</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              เริ่มจากหน้าที่ต้องการแก้ แล้วระบบจะพาไปยัง source of truth ที่ถูกต้อง แอดมินไม่ควรต้องเดาว่าภาพหรือข้อความอยู่ในตารางไหน
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-white"
          >
            Preview public site <ArrowRight size={16} weight="bold" />
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start gap-3">
            <CheckCircle size={22} weight="fill" className="mt-0.5 text-emerald-700" />
            <div>
              <h2 className="text-sm font-black text-emerald-950">Use inserted data</h2>
              <p className="mt-1 text-sm leading-6 text-emerald-800">Public pages ต้องใช้ข้อมูลที่บันทึกจริงหรือแสดง empty state เท่านั้น</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <WarningCircle size={22} weight="fill" className="mt-0.5 text-amber-700" />
            <div>
              <h2 className="text-sm font-black text-amber-950">Check image readiness</h2>
              <p className="mt-1 text-sm leading-6 text-amber-800">ก่อน publish ตรวจ cover/hero image, alt text, status และ public preview</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start gap-3">
            <Gear size={22} weight="fill" className="mt-0.5 text-slate-700" />
            <div>
              <h2 className="text-sm font-black text-slate-950">Settings are global</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Settings แก้ข้อความ global/hero/SEO ไม่ควรเก็บเนื้อหาสถานที่ละเอียด</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-slate-900">งานที่แอดมินทำบ่อย</h2>
            <p className="mt-1 text-sm text-slate-500">เลือกงานจาก public surface ที่ต้องการแก้</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workflowCards.map((card) => {
            const Icon = card.icon;
            return (
              <section key={card.title} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${toneClasses[card.tone]}`}>
                    <Icon size={22} weight="duotone" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{card.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{card.description}</p>
                  </div>
                </div>
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold leading-5 text-slate-600">
                  {card.source}
                </div>
                <Link
                  href={card.href}
                  className="mt-5 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-black text-white transition hover:bg-slate-700"
                >
                  {card.action} <ArrowRight size={14} weight="bold" />
                </Link>
              </section>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Source of truth map</h2>
          <div className="mt-5 grid gap-3">
            {sourceMap.map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-700">
                <CheckCircle size={18} weight="fill" className="mt-1 shrink-0 text-[#0A6B62]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-900">Quick create</h2>
          <div className="mt-5 grid gap-3">
            <Link href="/admin/attractions/new" className="inline-flex min-h-11 items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50">
              New attraction <MapPin size={18} />
            </Link>
            <Link href="/admin/stories/new" className="inline-flex min-h-11 items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50">
              New story <Article size={18} />
            </Link>
            <Link href="/admin/routes/new" className="inline-flex min-h-11 items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50">
              New route <MapPinLine size={18} />
            </Link>
            <Link href="/admin/photo-spots/new" className="inline-flex min-h-11 items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-slate-700 transition hover:bg-slate-50">
              New photo spot <List size={18} />
            </Link>
          </div>
        </div>
      </section>
      </div>
    </AdminShell>
  );
}
