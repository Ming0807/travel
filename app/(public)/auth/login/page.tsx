import { TouristAuthGate } from "@/components/auth/TouristAuthGate";
import { SiteFooter } from "@/components/layout/SiteFooter";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | ท่องเที่ยวชายแดนใต้",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-ink selection:bg-ink selection:text-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <TouristAuthGate
          title="ยินดีต้อนรับกลับมา"
          description="เข้าสู่ระบบเพื่อจัดการพาสปอร์ตดิจิทัล และแบ่งปันเรื่องราวของคุณ"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
