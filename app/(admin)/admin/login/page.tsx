import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ChartLineUp, Database, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบหลังบ้าน | ท่องเที่ยวยะลา",
  description: "เข้าสู่ระบบหลังบ้านเพื่อจัดการเนื้อหาและข้อมูลการท่องเที่ยวอย่างปลอดภัย",
};

type AdminLoginPageProps = {
  searchParams?: Promise<{ redirect?: string }>;
};

function resolveAdminDestination(value?: string) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) return "/admin";

  try {
    const destination = new URL(value, "https://admin.local");
    if (destination.origin !== "https://admin.local" || !destination.pathname.startsWith("/admin")) return "/admin";
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return "/admin";
  }
}

export default async function AdminLoginPage({ searchParams = Promise.resolve({}) }: AdminLoginPageProps) {
  const { redirect } = await searchParams;
  const redirectTo = resolveAdminDestination(redirect);

  return (
    <main className="min-h-screen bg-white text-[var(--public-ink)] lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(480px,1.1fr)]">
      <section className="hidden min-h-screen bg-[var(--public-ink)] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/80 hover:text-white">
          <ArrowLeft size={18} aria-hidden="true" />
          กลับไปหน้าเว็บไซต์
        </Link>

        <div className="max-w-xl py-16">
          <p className="text-sm font-semibold text-[var(--public-coral)]">TOURISM INTELLIGENCE</p>
          <p className="mt-4 text-balance text-4xl font-semibold leading-tight xl:text-5xl">
            หลังบ้านสำหรับจัดการเนื้อหา ข้อมูล และหลักฐานการท่องเที่ยว
          </p>
          <p className="mt-5 max-w-[58ch] text-base leading-8 text-white/70">
            พื้นที่ทำงานสำหรับผู้ดูแลที่ได้รับสิทธิ์ เพื่อดูแลข้อมูลสาธารณะและสนับสนุนการวางแผนการท่องเที่ยวยะลา
          </p>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            <div className="border border-white/15 p-4">
              <Database size={22} className="text-[var(--public-coral)]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">ข้อมูลมีโครงสร้าง</p>
              <p className="mt-1 text-sm leading-6 text-white/60">จัดการเนื้อหาและข้อมูลการเดินทางจากแหล่งเดียว</p>
            </div>
            <div className="border border-white/15 p-4">
              <ChartLineUp size={22} className="text-[var(--public-coral)]" aria-hidden="true" />
              <p className="mt-3 text-sm font-semibold">วิเคราะห์อย่างรับผิดชอบ</p>
              <p className="mt-1 text-sm leading-6 text-white/60">ใช้ข้อมูลสรุปเพื่อการตัดสินใจโดยคำนึงถึงความเป็นส่วนตัว</p>
            </div>
          </div>
        </div>

        <p className="text-xs leading-6 text-white/50">ระบบบันทึกกิจกรรมสำคัญเพื่อความปลอดภัยและการตรวจสอบย้อนหลัง</p>
      </section>

      <section className="flex min-h-screen items-center px-4 py-10 sm:px-8 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-10 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[var(--public-ink)] lg:hidden">
            <ArrowLeft size={18} aria-hidden="true" />
            กลับไปหน้าเว็บไซต์
          </Link>

          <div className="flex h-12 w-12 items-center justify-center rounded-[var(--public-radius-control)] bg-[var(--public-coral)] text-[var(--public-ink)]">
            <ShieldCheck aria-hidden="true" size={25} weight="fill" />
          </div>
          <h1 className="mt-7 text-3xl font-semibold tracking-tight text-[var(--public-ink)]">เข้าสู่ระบบหลังบ้าน</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            ใช้บัญชีผู้ดูแลที่ได้รับสิทธิ์เพื่อเข้าสู่พื้นที่จัดการระบบ
          </p>

          <div className="mt-8 border-t border-slate-200 pt-8">
            <LoginForm redirectTo={redirectTo} />
          </div>

          <p className="mt-7 border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            การเข้าถึงถูกควบคุมตามบทบาท หากไม่สามารถเข้าสู่ระบบได้ กรุณาติดต่อผู้ดูแลหลักของโครงการ
          </p>
        </div>
      </section>
    </main>
  );
}
