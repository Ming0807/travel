import { Compass, DeviceMobile, ShieldCheck, Warning } from "@phosphor-icons/react/dist/ssr";

import { PublicButton } from "@/components/public/PublicButton";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";

export function ProfileAccessState({ kind }: { kind: "no_identity" | "error" }) {
  if (kind === "error") {
    return (
      <main className="min-h-[70vh] bg-[var(--public-canvas)] py-10 sm:py-14">
        <PublicPageFrame variant="detail">
          <section role="alert" className="border border-rose-200 bg-white p-6 sm:p-8">
            <Warning aria-hidden="true" className="text-[var(--public-coral)]" size={36} weight="fill" />
            <h1 className="mt-4 text-2xl font-black text-[var(--public-ink)]">โหลดโปรไฟล์ไม่สำเร็จ</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-black/65">
              ข้อมูลของคุณไม่ได้ถูกลบหรือเปลี่ยนแปลง ขณะนี้ระบบเพียงยังเชื่อมต่อข้อมูลโปรไฟล์ไม่ได้
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PublicButton href="/profile">ลองโหลดอีกครั้ง</PublicButton>
              <PublicButton href="/contact" variant="secondary">ติดต่อทีมงาน</PublicButton>
            </div>
          </section>
        </PublicPageFrame>
      </main>
    );
  }

  return (
    <main className="min-h-[70vh] bg-[var(--public-canvas)] py-10 sm:py-14">
      <PublicPageFrame variant="detail">
        <section className="grid overflow-hidden border border-black/10 bg-white md:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="p-6 sm:p-8">
            <Compass aria-hidden="true" className="text-[var(--public-teal)]" size={38} weight="fill" />
            <h1 className="mt-4 text-2xl font-black text-[var(--public-ink)] sm:text-3xl">ยังไม่พบพาสปอร์ตบนเบราว์เซอร์นี้</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-black/65">
              พาสปอร์ตแบบผู้เยี่ยมชมผูกกับเบราว์เซอร์ที่ใช้เช็กอิน จึงอาจไม่พบข้อมูลเมื่อเปลี่ยนจาก LINE, Chrome, Safari ไปอีกแอปหนึ่ง เปลี่ยนเครื่อง หรือใช้โหมดไม่ระบุตัวตน
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <PublicButton href="/auth/login?next=%2Fprofile">เข้าสู่ระบบเพื่อค้นหาโปรไฟล์ที่เชื่อมไว้</PublicButton>
              <PublicButton href="/attractions" variant="secondary">เริ่มเช็กอินสถานที่</PublicButton>
            </div>
          </div>

          <aside className="border-t border-black/10 bg-[#f3f6f5] p-6 md:border-l md:border-t-0">
            <DeviceMobile aria-hidden="true" size={28} className="text-[var(--public-coral)]" weight="fill" />
            <h2 className="mt-4 text-base font-black text-[var(--public-ink)]">ป้องกันข้อมูลหายเมื่อเปลี่ยนอุปกรณ์</h2>
            <p className="mt-2 text-sm leading-6 text-black/65">หลังพบโปรไฟล์แล้ว เชื่อม Google หรือ LINE เพื่อเปิดพาสปอร์ตเดิมบนอุปกรณ์อื่นได้ง่ายขึ้น</p>
            <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-black/60">
              <ShieldCheck aria-hidden="true" size={17} weight="fill" className="mt-0.5 shrink-0 text-[var(--public-teal)]" />
              ระบบจะไม่สร้างโปรไฟล์ใหม่เพียงเพราะคุณเปิดหน้านี้
            </p>
          </aside>
        </section>
      </PublicPageFrame>
    </main>
  );
}
