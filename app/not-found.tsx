import Link from "next/link";
import { ArrowLeft, Compass } from "@phosphor-icons/react/dist/ssr";
import { PublicButton } from "@/components/public/PublicButton";
import { PublicEdgePage } from "@/components/public/PublicEdgePage";

export default function NotFound() {
  return (
    <PublicEdgePage
      code="404"
      title="ไม่พบหน้าที่คุณกำลังมองหา"
      description="ลิงก์นี้อาจถูกย้าย เปลี่ยนชื่อ หรือไม่มีอยู่แล้ว คุณยังสามารถกลับไปค้นหาสถานที่และวางแผนการเดินทางต่อได้"
      icon={<Compass size={24} weight="fill" aria-hidden="true" />}
      actions={
        <>
          <PublicButton href="/attractions">ดูสถานที่ท่องเที่ยว</PublicButton>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--public-radius-control)] px-4 py-2 text-sm font-semibold text-[var(--public-ink)] hover:bg-black/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--public-teal)]"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            กลับหน้าแรก
          </Link>
        </>
      }
    />
  );
}
