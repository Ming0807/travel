export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  QrCode,
  Image as ImageIcon,
  ClipboardText,
  ChartLineUp,
  ChatCircleText,
  ForkKnife,
  Article,
  Path,
  Medal,
  Certificate,
  UserCircle,
  Shield,
  Scroll,
  EnvelopeSimple,
  Gear,
} from "@phosphor-icons/react/dist/ssr";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = {
  title: "Admin Overview | Southern Border Tourism",
};

const moduleGroups = [
  {
    title: "Overview & CRM",
    items: [
      {
        href: "/admin/dashboard",
        label: "Analytics Dashboard",
        description: "ภาพรวมข้อมูลนักท่องเที่ยว เชิงวิเคราะห์",
        icon: ChartLineUp,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        href: "/admin/tourists",
        label: "Tourists (นักท่องเที่ยว)",
        description: "ข้อมูลและโปรไฟล์นักท่องเที่ยว",
        icon: UserCircle,
        tone: "bg-emerald-50 text-emerald-700",
      },
      {
        href: "/admin/visits",
        label: "Visit Records",
        description: "ดูบันทึกการเข้าชม การออกใบประกาศ",
        icon: ClipboardText,
        tone: "bg-rose-50 text-rose-700",
      },
      {
        href: "/admin/surveys",
        label: "Survey Responses",
        description: "ดูข้อมูลแบบสอบถามความพึงพอใจ",
        icon: ChatCircleText,
        tone: "bg-teal-50 text-teal-700",
      },
    ]
  },
  {
    title: "Content Management",
    items: [
      {
        href: "/admin/content-health",
        label: "Content Health",
        description: "ตรวจสอบ draft/published, ภาษา, รูปภาพของเนื้อหาทั้งหมด",
        icon: ChartLineUp,
        tone: "bg-teal-50 text-teal-700",
      },
      {
        href: "/admin/attractions",
        label: "แหล่งท่องเที่ยว",
        description: "จัดการข้อมูลสถานที่ท่องเที่ยว 3 จังหวัด",
        icon: MapPin,
        tone: "bg-blue-50 text-blue-700",
      },
      {
        href: "/admin/routes",
        label: "Travel Routes",
        description: "จัดการเส้นทางท่องเที่ยวแนะนำ",
        icon: Path,
        tone: "bg-cyan-50 text-cyan-700",
      },
      {
        href: "/admin/stories",
        label: "Stories & Articles",
        description: "จัดการบทความและเรื่องเล่า",
        icon: Article,
        tone: "bg-fuchsia-50 text-fuchsia-700",
      },
      {
        href: "/admin/restaurants",
        label: "Restaurants",
        description: "จัดการร้านอาหารและของฝาก",
        icon: ForkKnife,
        tone: "bg-orange-50 text-orange-700",
      },
      {
        href: "/admin/media",
        label: "Media Library",
        description: "จัดการรูปภาพ วิดีโอ รวมทั้งระบบ",
        icon: ImageIcon,
        tone: "bg-indigo-50 text-indigo-700",
      },
      {
        href: "/admin/photo-spots",
        label: "จุดถ่ายภาพ",
        description: "จัดการจุดถ่ายภาพในแต่ละสถานที่",
        icon: ImageIcon,
        tone: "bg-amber-50 text-amber-700",
      },
    ]
  },
  {
    title: "Operations & Incentives",
    items: [
      {
        href: "/admin/certificate-templates",
        label: "Certificate Templates",
        description: "จัดการเทมเพลตใบประกาศนียบัตร",
        icon: Certificate,
        tone: "bg-indigo-50 text-indigo-700",
      },
      {
        href: "/admin/checkin-codes",
        label: "QR Check-in Codes",
        description: "สร้างและจัดการ QR Code",
        icon: QrCode,
        tone: "bg-violet-50 text-violet-700",
      },
      {
        href: "/admin/badges",
        label: "Digital Badges",
        description: "จัดการเหรียญรางวัลและเงื่อนไข",
        icon: Medal,
        tone: "bg-yellow-50 text-yellow-700",
      },
    ]
  },
  {
    title: "System Administration",
    items: [
      {
        href: "/admin/users",
        label: "Admin Users",
        description: "จัดการบัญชีผู้ดูแลระบบ",
        icon: UserCircle,
        tone: "bg-slate-100 text-slate-700",
      },
      {
        href: "/admin/roles",
        label: "Roles & Permissions",
        description: "จัดการสิทธิ์การเข้าถึงเมนูต่างๆ",
        icon: Shield,
        tone: "bg-slate-100 text-slate-700",
      },
      {
        href: "/admin/audit",
        label: "Audit Logs",
        description: "ดูประวัติการดำเนินการในระบบ",
        icon: Scroll,
        tone: "bg-slate-100 text-slate-700",
      },
      {
        href: "/admin/messages",
        label: "Contact Messages",
        description: "กล่องข้อความติดต่อจากผู้ใช้",
        icon: EnvelopeSimple,
        tone: "bg-slate-100 text-slate-700",
      },
      {
        href: "/admin/settings",
        label: "Site Settings",
        description: "ตั้งค่าเว็บไซต์ ฟีเจอร์ และ SEO",
        icon: Gear,
        tone: "bg-slate-100 text-slate-700",
      },
    ]
  }
];

export default async function AdminPage() {
  const guard = await requireAdmin();
  const admin = { displayName: guard.displayName, email: guard.email };

  return (
    <AdminShell admin={admin}>
      <div className="space-y-8">
        {/* Header */}
        <header className="border-b border-slate-200 pb-6">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#D6A13D]">
            Admin Backoffice
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#073F37]">
            ภาพรวมระบบ
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Southern Border Tourism Data & Intelligence Platform — ระบบจัดการข้อมูลและวิเคราะห์การท่องเที่ยว ยะลา ปัตตานี นราธิวาส
          </p>
        </header>

        {/* Module Grid */}
        <div className="space-y-12 mt-8">
          {moduleGroups.map((group) => (
            <section key={group.title}>
              <h2 className="text-lg font-bold text-slate-800 mb-4">{group.title}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <Link
                      key={mod.href}
                      href={mod.href}
                      className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#0A6B62]/30 hover:shadow-md"
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${mod.tone}`}>
                        <Icon size={22} weight="fill" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-black text-[#073F37] group-hover:text-[#0A6B62]">
                          {mod.label}
                        </h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {mod.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
