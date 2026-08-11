import type { Metadata } from "next";

import { TouristAuthGate } from "@/components/auth/TouristAuthGate";
import { resolveSafeAuthDestination } from "@/lib/auth/oauth";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ | ท่องเที่ยวยะลา",
  description: "เข้าสู่ระบบเพื่อค้นคืนพาสปอร์ตท่องเที่ยวและจัดการเรื่องราวของคุณ",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = resolveSafeAuthDestination(params.next);
  const initialError = params.error === "oauth_callback_failed"
    ? "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่ หรือใช้งานต่อโดยไม่เข้าสู่ระบบ"
    : null;

  return (
    <main className="flex min-h-screen items-center bg-[var(--public-canvas)] px-4 py-10 sm:px-6">
      <TouristAuthGate
        title="เข้าสู่ระบบบัญชีนักเดินทาง"
        description="ค้นคืนพาสปอร์ต ตราประทับ และจัดการเรื่องราวจากอุปกรณ์อื่นได้"
        nextPath={nextPath}
        initialError={initialError}
        headingLevel={1}
      />
    </main>
  );
}
