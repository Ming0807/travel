import Link from "next/link";
import { FileText } from "@phosphor-icons/react/dist/ssr";
import { PublicPageFrame } from "@/components/public/PublicPageFrame";

export default function StoryNotFound() {
  return (
    <PublicPageFrame variant="detail" className="pb-24 pt-14">
      <section className="mx-auto max-w-2xl border-y border-black/10 py-16 text-center">
        <FileText size={42} weight="light" className="mx-auto text-black/35" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-black">ไม่พบเรื่องราวนี้</h1>
        <p className="mt-3 text-sm leading-6 text-black/60">เรื่องอาจยังไม่เผยแพร่ ถูกเก็บเข้าคลัง หรือใช้ลิงก์ที่ไม่ถูกต้อง</p>
        <Link href="/stories" className="mt-7 inline-flex min-h-11 items-center rounded-[var(--public-radius-control)] bg-[var(--public-ink)] px-5 text-sm font-black text-white">ดูเรื่องราวที่เผยแพร่แล้ว</Link>
      </section>
    </PublicPageFrame>
  );
}
